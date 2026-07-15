import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { 
  useFetchStudentExam, 
  useSubmitAnswer, 
  useCompleteExam,
  useFetchExamProgress
} from "../../hooks/useExams";
import { ExamHeader, QuestionCard, ExamFooter } from "../../components/exam";
import type { ExamAttempt } from "../../types";

interface ExamState {
  isStarted: boolean;
  currentQuestionIndex: number;
  answers: Record<number, string | number>;
  answeredQuestions: Set<number>;
  timeRemainingMinutes: number;
  attempt: ExamAttempt | null;
  showCompletion: boolean;
  isRestored: boolean;
  shouldRedirectToResults: boolean;
}

const TakeExam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const examId = id ? parseInt(id, 10) : 0;
  
  // State management
  const [examState, setExamState] = useState<ExamState>({
    isStarted: false,
    currentQuestionIndex: 0,
    answers: {},
    answeredQuestions: new Set<number>(),
    timeRemainingMinutes: 0,
    attempt: null,
    showCompletion: false,
    isRestored: false,
    shouldRedirectToResults: false
  });
  
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  
  // API hooks
  const { data: exam, isLoading: examLoading } = useFetchStudentExam(examId);
  const { data: progressData, refetch: refetchProgress } = useFetchExamProgress(examId);
  const submitAnswerMutation = useSubmitAnswer();
  const completeExamMutation = useCompleteExam();
  
  // Restore exam state from progress and existing answers
  useEffect(() => {
    if (!exam?.exam_questions?.length || !progressData || examState.isRestored) return;
    
    console.log('Progress data received:', progressData);
    console.log('Exam questions:', exam.exam_questions);
    
    // Check if exam is already completed and set redirect flag
    if (progressData.attempt?.is_completed) {
      setExamState(prev => ({
        ...prev,
        shouldRedirectToResults: true,
        isRestored: true
      }));
      return;
    }
    
    // Restore existing answers from progress data
    const restoredAnswers: Record<number, string | number> = {};
    const answeredQuestionIds = new Set<number>();
    
    console.log('Progress answers:', progressData.answers);
    
    if (progressData.answers?.length) {
      progressData.answers.forEach(answer => {
        console.log('Processing answer:', answer);
        if (answer.exam_question_id) {
          // Mark all questions with records as answered (including null/skipped answers)
          answeredQuestionIds.add(answer.exam_question_id);
          // Use answer_text for essays or selected_option_id for multiple choice
          // For null answers (skipped questions), store empty string
          restoredAnswers[answer.exam_question_id] = answer.answer_text || answer.selected_option_id || '';
        }
      });
    }
    
    console.log('Answered question IDs:', Array.from(answeredQuestionIds));
    console.log('Restored answers:', restoredAnswers);
    
    // Start from first question and let user navigate naturally
    const currentQuestionIndex = 0;
    const currentQuestion = exam.exam_questions[currentQuestionIndex];
    const currentQuestionTimerMinutes = currentQuestion ? Math.floor(currentQuestion.timer / 60) : 0;
    
    setExamState(prev => ({
      ...prev,
      isStarted: true,
      currentQuestionIndex,
      answers: restoredAnswers,
      answeredQuestions: answeredQuestionIds,
      timeRemainingMinutes: currentQuestionTimerMinutes,
      isRestored: true
    }));
    
    // Show progress restoration message
    if (answeredQuestionIds.size > 0) {
      toast.success(`Exam progress restored. ${answeredQuestionIds.size} questions already answered.`);
    }
  }, [exam, progressData, examState.isRestored]);
  
  // Handle redirect to results when exam is completed
  useEffect(() => {
    if (examState.shouldRedirectToResults) {
      toast.info("This exam has already been completed.");
      navigate(`/dashboard/exams/${examId}/results`);
    }
  }, [examState.shouldRedirectToResults, examId, navigate]);
  
  // Show warning modal for tab switching (for awareness)
  useEffect(() => {
    if (!examState.isStarted) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden && examState.isStarted) {
        setShowReloadWarning(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examState.isStarted]);
  
  // Handle exam completion
  const handleCompleteExam = useCallback(async () => {
    try {
      await completeExamMutation.mutateAsync(examId);
      
      // Clean up localStorage timer data
      if (exam?.exam_questions) {
        exam.exam_questions.forEach(question => {
          const timerKey = `exam_${examId}_question_${question.id}_remaining`;
          localStorage.removeItem(timerKey);
        });
      }
      
      toast.success("Exam completed successfully!");
      navigate(`/dashboard/exams/${examId}/completion`);
    } catch (error: unknown) {
      const errorMessage = (error as {response?: {data?: {message?: string}}})?.response?.data?.message || "Failed to complete exam";
      toast.error(errorMessage);
    }
  }, [completeExamMutation, examId, exam?.exam_questions, navigate]);
  
  // Handle moving to next question
  const moveToNextQuestion = useCallback(async () => {
    if (!exam?.exam_questions) return;
    
    // Check if current question needs to be skipped (not answered yet)
    const currentQuestion = exam.exam_questions[examState.currentQuestionIndex];
    if (currentQuestion && !examState.answeredQuestions.has(currentQuestion.id) && !examState.answers[currentQuestion.id]) {
      try {
        // Submit null answer for skipped question
        const answerPayload = {
          answer_text: null
        };
        
        await submitAnswerMutation.mutateAsync({
          examId: examId,
          questionId: currentQuestion.id,
          answer: answerPayload
        });
        
        // Mark question as answered (skipped)
        setExamState(prev => ({
          ...prev,
          answeredQuestions: new Set([...prev.answeredQuestions, currentQuestion.id])
        }));
        
        refetchProgress();
        toast.info("Question skipped");
      } catch (error) {
        console.error("Failed to submit skipped answer:", error);
      }
    }
    
    if (examState.currentQuestionIndex < exam.exam_questions.length - 1) {
      const nextQuestionIndex = examState.currentQuestionIndex + 1;
      const nextQuestion = exam.exam_questions[nextQuestionIndex];
      const nextQuestionTimerMinutes = nextQuestion ? Math.floor(nextQuestion.timer / 60) : 0;
      
      setExamState(prev => ({
        ...prev,
        currentQuestionIndex: nextQuestionIndex,
        timeRemainingMinutes: nextQuestionTimerMinutes
      }));
    } else {
      // Reached last question - automatically complete the exam
      // Students can submit partially completed exams
      await handleCompleteExam();
    }
  }, [exam, examState, examId, setExamState, refetchProgress, submitAnswerMutation, handleCompleteExam]);
  
  // Handle timer expiration with answer submission logic
  const handleTimerExpired = useCallback(async () => {
    if (!exam?.exam_questions) return;
    
    const currentQuestion = exam.exam_questions[examState.currentQuestionIndex];
    const answer = examState.answers[currentQuestion.id];
    
    // Check if question is already answered
    if (examState.answeredQuestions.has(currentQuestion.id)) {
      toast.info("Question already answered. Moving to next question.");
      await moveToNextQuestion();
      return;
    }
    
    // If student has provided an answer, submit it; otherwise skip
    if (answer) {
      try {
        const answerPayload = {
          answer_text: String(answer)
        };
        
        await submitAnswerMutation.mutateAsync({
          examId: examId,
          questionId: currentQuestion.id,
          answer: answerPayload
        });
        
        // Mark question as answered
        setExamState(prev => ({
          ...prev,
          answeredQuestions: new Set([...prev.answeredQuestions, currentQuestion.id])
        }));
        
        refetchProgress();
        toast.info("Time's up! Answer submitted automatically.");
      } catch {
        toast.warning("Time's up! Moving to next question.");
      }
    } else {
      // Submit null answer for skipped question
      try {
        const answerPayload = {
          answer_text: null
        };
        
        await submitAnswerMutation.mutateAsync({
          examId: examId,
          questionId: currentQuestion.id,
          answer: answerPayload
        });
        
        // Mark question as answered (skipped)
        setExamState(prev => ({
          ...prev,
          answeredQuestions: new Set([...prev.answeredQuestions, currentQuestion.id])
        }));
        
        refetchProgress();
        toast.warning("Time's up! Question skipped automatically.");
      } catch {
        toast.warning("Time's up! Moving to next question.");
      }
    }
    
    await moveToNextQuestion();
  }, [exam, examState, examId, submitAnswerMutation, setExamState, refetchProgress, moveToNextQuestion]);
  
  // Update timer when question changes - simplified localStorage approach
  useEffect(() => {
    if (exam?.exam_questions?.length && examState.isRestored) {
      const currentQuestion = exam.exam_questions[examState.currentQuestionIndex];
      const questionTimerSeconds = currentQuestion?.timer || 0;
      
      // Check if we have stored remaining time for this question
      const timerKey = `exam_${examId}_question_${currentQuestion?.id}_remaining`;
      const storedRemainingTime = localStorage.getItem(timerKey);
      
      let remainingTimeMinutes;
      
      if (storedRemainingTime) {
        // Use stored remaining time
        const remainingSeconds = parseInt(storedRemainingTime);
        remainingTimeMinutes = Math.floor(remainingSeconds / 60);
        
        // If time expired, auto-advance to next question
        if (remainingSeconds <= 0) {
          handleTimerExpired();
          return;
        }
      } else {
        // First time on this question - store initial time in seconds
        localStorage.setItem(timerKey, questionTimerSeconds.toString());
        remainingTimeMinutes = Math.floor(questionTimerSeconds / 60);
      }
      
      setExamState(prev => ({
        ...prev,
        timeRemainingMinutes: remainingTimeMinutes
      }));
    }
  }, [exam, examState.currentQuestionIndex, examState.isRestored, examId]);
  
  // Debug logging - moved before conditional returns
  useEffect(() => {
    const currentQuestion = exam?.exam_questions?.[examState.currentQuestionIndex];
    if (currentQuestion) {
      console.log(`Current question ${currentQuestion.id} (index ${examState.currentQuestionIndex}):`);
      console.log('- Is answered:', examState.answeredQuestions.has(currentQuestion.id));
      console.log('- All answered questions:', Array.from(examState.answeredQuestions));
      console.log('- Current answer in state:', examState.answers[currentQuestion.id]);
    }
  }, [exam, examState.currentQuestionIndex, examState.answeredQuestions, examState.answers]);
  
  // Computed values
  const currentQuestion = exam?.exam_questions?.[examState.currentQuestionIndex];
  const isLastQuestion = examState.currentQuestionIndex === (exam?.exam_questions?.length || 0) - 1;
  const isCurrentQuestionAnswered = currentQuestion ? examState.answeredQuestions.has(currentQuestion.id) : false;
  
  



  // Handle answer submission
  const handleAnswerSubmit = async () => {
    if (!exam?.exam_questions) return;
    
    const currentQuestion = exam.exam_questions[examState.currentQuestionIndex];
    const answer = examState.answers[currentQuestion.id];
    
    // Check if question is already answered - just move to next question
    if (examState.answeredQuestions.has(currentQuestion.id)) {
      toast.info("Moving to next question...");
      await moveToNextQuestion();
      return;
    }
    
    if (!answer) {
      toast.error("Please provide an answer before proceeding.");
      return;
    }
    
    // Add specific validation based on question type
    if (currentQuestion.type === 'essay') {
      const answerText = String(answer).trim();
      if (answerText.length < 10) {
        toast.error("Essay answer must be at least 10 characters long.");
        return;
      }
      if (answerText.length > 2000) {
        toast.error("Essay answer cannot exceed 2000 characters.");
        return;
      }
    } else if (currentQuestion.type === 'multiple_choice') {
      const answerText = String(answer).trim();
      if (!answerText) {
        toast.error("Please select an option before proceeding.");
        return;
      }
    }
    
    try {
      // Prepare answer payload - backend always expects answer_text
      const answerPayload = {
        answer_text: String(answer) // Convert to string to match backend validation
      };
      
      await submitAnswerMutation.mutateAsync({
        examId: examId,
        questionId: currentQuestion.id,
        answer: answerPayload
      });
      
      // Mark question as answered
      setExamState(prev => ({
        ...prev,
        answeredQuestions: new Set([...prev.answeredQuestions, currentQuestion.id])
      }));
      
      // Refetch progress to stay in sync with backend
      refetchProgress();
      
      toast.success("Answer submitted successfully!");
      await moveToNextQuestion();
      
    } catch (error: unknown) {
      const errorMessage = (error as {response?: {data?: {message?: string}}})?.response?.data?.message || "Failed to submit answer";
      toast.error(errorMessage);
    }
  };

  // Handle quit exam
  const handleQuitExam = () => {
    navigate(`/dashboard/exams/${examId}`);
  };
  
  // Handle answer change
  const handleAnswerChange = (questionId: number, answer: string | number) => {
    setExamState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };
  
  // Handle moving to previous question
  const moveToPreviousQuestion = () => {
    if (examState.currentQuestionIndex > 0) {
      const prevQuestionIndex = examState.currentQuestionIndex - 1;
      const prevQuestion = exam?.exam_questions?.[prevQuestionIndex];
      const prevQuestionTimerMinutes = prevQuestion ? Math.floor(prevQuestion.timer / 60) : 0;
      
      setExamState(prev => ({
        ...prev,
        currentQuestionIndex: prevQuestionIndex,
        timeRemainingMinutes: prevQuestionTimerMinutes
      }));
    }
  };
  
  // Loading state
  if (examLoading || !examState.isRestored) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#EF3F09] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {examLoading ? "Loading exam..." : "Restoring progress..."}
          </p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch exam details</p>
        </div>
      </div>
    );
  }
  
  // Exam not found
  if (!exam) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark mb-4">Exam Not Found</h1>
          <p className="text-gray-600 mb-6">The exam you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // If exam exists but questions are not available, show loading or redirect to guidelines
  if (exam && (!exam.exam_questions || exam.exam_questions.length === 0)) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#EF3F09] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam questions...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your exam</p>
        </div>
      </div>
    );
  }
  
  
  // Active exam screen
  if (!exam.exam_questions || exam.exam_questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark mb-4">No Questions Available</h1>
          <p className="text-gray-600 mb-6">This exam doesn't have any questions yet.</p>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      {/* Exam Header */}
      {user && currentQuestion && (
        <ExamHeader
          key={`question-${examState.currentQuestionIndex}`}
          onQuit={() => setShowQuitConfirmation(true)}
          timeRemainingMinutes={examState.timeRemainingMinutes}
          isActive={examState.isStarted}
          onTimerExpired={handleTimerExpired}
          isQuestionAnswered={isCurrentQuestionAnswered}
          examId={examId}
          questionId={currentQuestion.id}
          totalQuestionTimeSeconds={currentQuestion.timer}
        />
      )}
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">

        {currentQuestion && (
          <div className="border border-gray-200 rounded-[20px] mt-[50px] bg-white p-8">
            <QuestionCard
              question={currentQuestion}
              currentQuestion={examState.currentQuestionIndex + 1}
              totalQuestions={exam.exam_questions.length}
              selectedAnswer={examState.answers[currentQuestion.id]}
              onAnswerChange={(answer: string | number) => handleAnswerChange(currentQuestion.id, answer)}
              onSubmit={handleAnswerSubmit}
              isLastQuestion={isLastQuestion}
              isAlreadyAnswered={isCurrentQuestionAnswered}
              onPrevious={moveToPreviousQuestion}
              isFirstQuestion={examState.currentQuestionIndex === 0}
            />
          </div>
        )}
      </main>
      
      {/* Exam Footer */}
      {user && (
        <ExamFooter
          exam={exam}
          user={user}
        />
      )}
      
      {/* Reload Warning Modal */}
      {showReloadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Exam Security Warning</h2>
            <p className="text-gray-600 mb-6">
              You cannot close, reload, or switch tabs during the exam. This action is monitored for exam security purposes.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowReloadWarning(false)}
                className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300"
              >
                Continue Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Quit Exam?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to quit? Your progress will be saved, but you won't be able to continue this exam attempt.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowQuitConfirmation(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-[12px] font-medium hover:border-gray-400 transition-all duration-300"
              >
                Continue Exam
              </button>
              <button
                onClick={handleQuitExam}
                className="flex-1 px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300"
              >
                Quit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;