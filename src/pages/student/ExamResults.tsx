import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  UserCheck,
  Star,
  ClipboardCheck,
  CheckCircle,
  Clock, 
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { StudentSidebar } from "../../components/sidebars";
import { useFetchStudentExamResults } from "../../hooks/useExams";
import type { QuestionAnswer, ExamQuestion, QuestionOption } from "../../types/exams";

const ExamResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const examId = id ? parseInt(id, 10) : 0;
  
  // Fetch exam results which includes exam, attempt, results, and answers
  const { data: examData, isLoading: examLoading } = useFetchStudentExamResults(examId);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle back navigation  
  const handleBack = () => {
    // Get the correct subject ID from the exam data
    const subjectId = examData?.exam?.subject.id || examData?.exam?.subject?.id;
    if (subjectId) {
      navigate(`/dashboard/subjects/${subjectId}/exams`);
    } else {
      // Fallback to dashboard if subject ID not available
      navigate('/dashboard');
    }
  };

  // Loading state
  if (examLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF3F09] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading exam results...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have the required data
  if (!examData || !user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-brand-dark mb-4">Exam Results Not Available</h1>
                <p className="text-gray-600 mb-6">Unable to load exam results or you don't have access to this exam.</p>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const attempt = examData?.attempt;
  const exam = examData?.exam;
  const results = examData?.results;
  const answers = examData?.answers || [];

  // Debug logging
  console.log('ExamResults Debug:', {
    examData,
    exam,
    attempt,
    results,
    answers,
    answersLength: answers?.length,
    examSubject: exam?.subject,
    examSubjectId: exam?.subject.id
  });

  // If no attempt data, redirect to completion page
  if (!attempt) {
    navigate(`/dashboard/exams/${examId}/completion`);
    return null;
  }
  
  // Calculate completion time from attempt data with smart formatting
  const calculateCompletionTime = () => {
    if (!attempt?.completed_at || !attempt?.created_at) {
      return null;
    }

    const startDate = new Date(attempt.created_at);
    const endDate = new Date(attempt.completed_at);
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    // Smart formatting: show seconds if under 1 minute, otherwise show minutes
    if (diffMinutes < 1) {
      return `${Math.max(1, diffSeconds)} seconds`; // Show at least 1 second
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const completionTime = calculateCompletionTime();

  // Calculate score percentage from results or attempt data
  const scorePercentage = results?.percentage || 
    (attempt?.total_questions > 0 
      ? Math.round((attempt?.answered_questions / attempt?.total_questions) * 100)
      : 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Content */}
          <main className="main-content flex-1 p-5">
            {/* Page Header */}
            <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              <div className="flex items-center justify-between pl-2 pr-2">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[26px]"></div>
                    <UserCheck className="w-10 h-10 text-[#0C1C3C] relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-brand-dark text-3xl font-extrabold mb-2">
                      My Exam Results
                    </h1>
                    <p className="text-brand-dark text-base font-normal">
                      Review your answers for {exam?.name || 'exam'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#0C1C3C]" />
                    <span className="text-[#0C1C3C]">Back</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={handlePrint}
                    className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-[#0C1C3C]" />
                    <span className="text-[#0C1C3C]">Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Student Information and Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              {/* Student Info Card */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Student Information
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={user?.photo || "https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?w=400"} 
                      alt={user?.name || "Student"} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-brand-dark text-lg font-bold mb-1">
                        {user?.name || "Student Name"}
                      </h4>
                      <p className="text-gray-500 text-sm mb-2">
                        {user?.email || "student@example.com"}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          scorePercentage >= 60 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {scorePercentage >= 60 ? 'Passed' : 'Not Passed'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Submission Time</p>
                        <p className="text-brand-dark font-semibold">
                          {attempt?.completed_at ? format(new Date(attempt.completed_at), "MMM dd, yyyy HH:mm") : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Time Taken</p>
                        <p className="text-brand-dark font-semibold">
                          {completionTime || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Performance Overview
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-3">
                        <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                        <Star className="w-8 h-8 text-[#0C1C3C] relative z-10" />
                      </div>
                      <p className="text-brand-dark text-2xl font-extrabold">
                        {answers?.reduce((sum, answer) => sum + (answer.points_earned || 0), 0) || 0}
                      </p>
                      <p className="text-gray-500 text-sm">Total Score</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-3">
                        <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                        <ClipboardCheck className="w-8 h-8 text-[#0C1C3C] relative z-10" />
                      </div>
                      <p className="text-brand-dark text-2xl font-extrabold">
                        {answers?.length || 0}/{attempt?.total_questions || 0}
                      </p>
                      <p className="text-gray-500 text-sm">Questions</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-3">
                        <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                        <CheckCircle className="w-8 h-8 text-[#0C1C3C] relative z-10" />
                      </div>
                      <p className="text-brand-dark text-2xl font-extrabold">
                        {answers?.filter(answer => answer.has_passed).length || 0}
                      </p>
                      <p className="text-gray-500 text-sm">Correct</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-3">
                        <div className="w-full h-full absolute bg-[#D8B0FF] rounded-[22px]"></div>
                        <Clock className="w-8 h-8 text-[#0C1C3C] relative z-10" />
                      </div>
                      <p className="text-brand-dark text-2xl font-extrabold">
                        {completionTime?.split(' ')[0] || 'N/A'}
                      </p>
                      <p className="text-gray-500 text-sm">Duration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions and Answers Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Questions & Answers Review
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-6 py-6">
                <div className="space-y-6">
                  {answers?.map((answer: QuestionAnswer, index: number) => (
                    <QuestionReviewCard 
                      key={answer.id}
                      answer={answer}
                      question={answer.exam_question}
                      questionNumber={index + 1}
                      isStudent={true}
                    />
                  ))}

                  {(!answers || answers.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No answers found for this exam.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
 

interface QuestionReviewCardProps {
  answer: QuestionAnswer;
  question: ExamQuestion | undefined;
  questionNumber: number;
  isStudent?: boolean;
}

const QuestionReviewCard = ({
  answer,
  question,
  questionNumber,
  isStudent = true,
}: QuestionReviewCardProps) => {
  const isMultipleChoice = question?.type === 'multiple_choice';
  const isEssay = question?.type === 'essay';

  return (
    <div className="border border-[#DCDEDD] rounded-[16px] p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#EF3F09] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{questionNumber}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
              isMultipleChoice 
                ? 'bg-[#82D9D7]/20 text-[#0C1C3C]' 
                : 'bg-[#D8B0FF]/20 text-[#0C1C3C]'
            }`}>
              {isMultipleChoice ? 'Multiple Choice' : 'Essay'}
            </span>
            <span className="inline-block px-2 py-1 bg-[#276874]/20 text-[#0C1C3C] text-xs font-semibold rounded-full">
              {question?.points || 0} points
            </span>
          </div>
          <h4 className="text-brand-dark text-base font-semibold mb-4">{question?.name || 'Question not available'}</h4>
          
          {/* Multiple Choice Options */}
          {isMultipleChoice && question?.question_options && (
            <div className="grid grid-cols-1 gap-3 mb-4">
              {question.question_options.map((option: QuestionOption, idx: number) => {
                // For multiple choice, need to check if this option text matches the answer_text
                const isSelected = answer.selected_option_id === option.id || answer.answer_text === option.name;
                const isCorrect = option.is_correct;
                
                let optionClass = "p-3 border border-gray-200 rounded-[12px] bg-gray-50";
                if (isCorrect && !isSelected) {
                  optionClass = "p-3 border-2 border-[#276874] rounded-[12px] bg-[#276874]/10";
                } else if (isSelected && isCorrect) {
                  optionClass = "p-3 border-2 border-[#276874] rounded-[12px] bg-[#276874]/10";
                } else if (isSelected && !isCorrect) {
                  optionClass = "p-3 border-2 border-[#EF3F09] rounded-[12px] bg-[#EF3F09]/10";
                }

                return (
                  <div key={option.id} className={optionClass}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#0C1C3C] w-6">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className={`text-sm ${isSelected || isCorrect ? 'text-[#0C1C3C] font-semibold' : 'text-gray-700'}`}>
                        {option.name}
                        {isCorrect && ' (Correct Answer)'}
                        {isSelected && !isCorrect && ' (Your Selection)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Essay Answer */}
          {isEssay && (
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-semibold mb-2">Your Answer:</p>
              <div className={`border rounded-[12px] p-4 ${
                answer.answer_text 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {answer.answer_text ? (
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {answer.answer_text}
                  </p>
                ) : (
                  <p className="text-red-600 text-sm italic">
                    No answer provided - Question not answered within time limit
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Answer Result */}
          <div className={`border rounded-[12px] px-4 py-3 ${
            answer.answer_text === null
              ? 'bg-gray-100 border-gray-300'
              : answer.has_passed 
              ? 'bg-[#276874]/10 border-[#276874]/30'
              : 'bg-[#EF3F09]/10 border-[#EF3F09]/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                {isMultipleChoice ? (
                  <>
                    <p className="text-[#0C1C3C] text-sm font-semibold mb-1">
                      Your Selection: {
                        answer.answer_text === null 
                          ? 'No answer provided'
                          : answer.answer_text || 'No selection'
                      }
                    </p>
                    <p className="text-[#0C1C3C]/70 text-xs">
                      {answer.answer_text === null 
                        ? '⚠ Question not answered within time limit'
                        : answer.has_passed 
                        ? '✓ Correct - Full points awarded' 
                        : '✗ Incorrect'
                      }
                    </p>
                  </>
                ) : (
                  <h5 className="text-[#0C1C3C] font-semibold">
                    {answer.answer_text === null ? 'Not Answered' : 'Graded by Teacher'}
                  </h5>
                )}
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                answer.has_passed 
                  ? 'bg-[#276874]/20 text-[#0C1C3C]'
                  : 'bg-[#EF3F09]/20 text-[#0C1C3C]'
              }`}>
                {answer.points_earned || 0}/{question?.points || 0} pts
              </span>
            </div>

            {/* Teacher Feedback for students */}
            {isStudent && answer.feedback && answer.answer_text !== null && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-[8px]">
                <p className="text-blue-800 text-sm font-semibold mb-1">Teacher Feedback:</p>
                <p className="text-blue-700 text-sm">{answer.feedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;