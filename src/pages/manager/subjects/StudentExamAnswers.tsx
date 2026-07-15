import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  UserCheck,
  Star,
  ClipboardCheck,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from "../../../components/sidebars";
import { useGradeAnswer } from "../../../hooks/useQuestionAnswers";
import { useFetchStudentExamDetails, useFetchExamResults, useFetchStudentExam } from "../../../hooks/useExams";
import { format } from "date-fns";
import type { QuestionAnswer, ExamQuestion, QuestionOption, StudentExamDetails } from "../../../types";

const StudentExamAnswers = () => {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === "manager";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  // Parse IDs
  const examIdNum = examId ? parseInt(examId, 10) : 0;
  const studentIdNum = studentId ? parseInt(studentId, 10) : 0;

  // For students, ensure they can only view their own answers
  useEffect(() => {
    if (isStudent && user?.id && user.id !== studentIdNum) {
      console.log('Authorization check failed:', { userId: user.id, studentIdNum, userIdType: typeof user.id, studentIdType: typeof studentIdNum });
      navigate('/dashboard/subjects');
    }
  }, [isStudent, user?.id, studentIdNum, navigate]);

  // Always call hooks - use conditional parameters to control when they run
  const { data: studentResultsData, isLoading: resultsLoading, error: resultsError } = useFetchExamResults(isStudent ? examIdNum : 0);
  const { data: teacherExamDetails, isLoading: teacherLoading, error: teacherError } = useFetchStudentExamDetails(
    !isStudent ? examIdNum : 0, 
    !isStudent ? studentIdNum : 0, 
    !isStudent ? role : undefined
  );
  const { data: fullExamData } = useFetchStudentExam(isStudent ? examIdNum : 0);

  // Derive the actual data and loading/error states based on role
  const studentExamDetails = isStudent ? studentResultsData : teacherExamDetails;
  const dataLoading = isStudent ? resultsLoading : teacherLoading;
  const error = isStudent ? resultsError : teacherError;

  // Mutations
  const gradeAnswer = useGradeAnswer();

  // Type guard
  const isStudentExamDetails = (data: unknown): data is StudentExamDetails => {
    const details = data as StudentExamDetails;
    return details && typeof details.exam?.subject_id === 'number';
  };

  // Extract data from the response - different structure for students vs teachers/managers
  const exam = studentExamDetails?.exam;
  const studentData = (studentExamDetails && 'student' in studentExamDetails) ? studentExamDetails.student : 
    (isStudentExamDetails(studentExamDetails) ? studentExamDetails.student : undefined) ||
    (isStudent ? user : undefined);
  const examAttempt = studentExamDetails?.attempt;
  const summary = isStudentExamDetails(studentExamDetails) ? studentExamDetails.summary : undefined;
  
  // Get subject ID from the appropriate source
  const subjectId = 'subject_id' in (exam || {}) 
    ? (exam as { subject_id: number }).subject_id 
    : fullExamData?.subject_id;
  
  // Handle different answer structures for students vs teachers/managers
  const studentAnswers = isStudent 
    ? studentExamDetails?.answers?.map((answer: QuestionAnswer) => {
        const questionOptions = answer.question?.question_options || [];
        
        // For multiple choice, find the selected option ID from answer_text
        let selectedOptionId = answer.selected_option_id;
        if (answer.question?.type === 'multiple_choice' && !selectedOptionId && answer.answer_text) {
          const selectedOption = questionOptions.find((opt: QuestionOption) => opt.name === answer.answer_text);
          selectedOptionId = selectedOption?.id;
        }
        
        return {
          ...answer,
          selected_option_id: selectedOptionId,
          question: answer.question ? {
            ...answer.question,
            question_options: questionOptions
          } : undefined
        };
      })
    : studentExamDetails?.answers;

  // Debug: Log the API response structure for troubleshooting
  useEffect(() => {
    console.log('StudentExamAnswers Role Debug:', {
      userRole: role,
      isManager: isManager,
      isTeacher: isTeacher,
      user: user,
      examId: examIdNum,
      studentId: studentIdNum
    });
    
    if (studentExamDetails) {
      console.log('StudentExamAnswers Data Debug:', {
        fullResponse: studentExamDetails,
        exam: exam,
        examSubjectId: subjectId,
        examSubject: exam?.subject,
        rawAnswers: studentExamDetails?.answers,
        studentAnswers: studentAnswers,
        answersLength: studentAnswers?.length,
        userRole: role,
        isStudent: isStudent,
        isTeacher: isTeacher,
        isManager: isManager,
        // Debug badge data
        examAttempt: examAttempt,
        examAttemptHasPassed: examAttempt?.has_passed,
        summary: summary
      });
      
      // Additional student-specific debugging
      if (isStudent) {
        console.log('Student API Response Structure:', {
          hasAnswers: !!studentExamDetails?.answers,
          answersCount: studentExamDetails?.answers?.length,
          firstAnswer: studentExamDetails?.answers?.[0],
          firstAnswerQuestion: studentExamDetails?.answers?.[0]?.question
        });
      }
    }
  }, [studentExamDetails, exam, role, isTeacher, isManager, isStudent, user, examIdNum, studentIdNum, studentAnswers, examAttempt, summary, subjectId]);

  // Handle grading
  const handleGradeAnswer = async (answerId: number, points: number, feedback?: string) => {
    try {
      await gradeAnswer.mutateAsync({
        id: answerId,
        data: {
          points_earned: points,
          feedback: feedback || "",
        },
        examId: examIdNum,
        studentId: studentIdNum,
        userRole: role,
      });
      toast.success("Answer graded successfully!");
    } catch (error) {
      console.error("Error grading answer:", error);
      toast.error("Failed to grade answer. Please try again.");
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle back navigation
  const handleBack = () => {
    if (isStudent) {
      // Try to get subject ID from the full exam data
      const subjectId = fullExamData?.subject_id;
      
      if (subjectId) {
        navigate(`/dashboard/subjects/${subjectId}/exams`);
      } else {
        // Fallback to completion page
        navigate(`/dashboard/exams/${examId}/completion`);
      }
    } else {
      navigate(`/dashboard/exams/${examId}`);
    }
  };

  // Loading state
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          {isManager && <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          {isTeacher && <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          <div className="flex-1 ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF3F09] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading student exam details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('StudentExamAnswers error:', error);
    const axiosError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
    const errorMessage = axiosError?.response?.data?.message || 
                        axiosError?.message || 
                        'Unknown error occurred';
    const errorStatus = axiosError?.response?.status;
    
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          {isManager && <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          {isTeacher && <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          <div className="flex-1 ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center max-w-md">
                <p className="text-red-600 text-lg mb-2">Error loading student exam details</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                  <p className="text-red-800 font-semibold mb-2">Error Details:</p>
                  <p className="text-red-700 text-sm mb-2">Status: {errorStatus || 'Unknown'}</p>
                  <p className="text-red-700 text-sm">Message: {errorMessage}</p>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  API Endpoint: /teacher/exams/{examId}/students/{studentId}<br/>
                  ExamID: {examId}, StudentID: {studentId}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:bg-[#d63507] transition-colors"
                  >
                    Refresh Page
                  </button>
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Sidebar - role-based */}
        {isManager && <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        {isTeacher && <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        {isStudent && <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Content */}
          <main className="main-content flex-1 p-5">
            {/* Breadcrumb - only for teachers and managers */}
            {(isManager || isTeacher) && (
              <div className="mt-[50px] mb-4 ml-[50px]">
                <nav className="flex items-center gap-2 text-sm">
                  <Link to="/dashboard/overview" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Dashboard</Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link to="/dashboard/subjects" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Subjects</Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link to={`/dashboard/subjects/${subjectId}/exams`} className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Subject Exams</Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link to={`/dashboard/exams/${examId}`} className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Exam Details</Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-brand-dark font-medium">Student Answers</span>
                </nav>
              </div>
            )}

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
                      {isStudent ? 'My Exam Results' : `${studentData?.name || 'Student'} - Exam Answers`}
                    </h1>
                    <p className="text-brand-dark text-base font-normal">
                      {isStudent 
                        ? `Review your answers for ${exam?.name || 'exam'}`
                        : `Review and grade student responses for ${exam?.name || 'exam'}`
                      }
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
                      src={studentData?.photo || "https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?w=400"} 
                      alt={studentData?.name || "Student"} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-brand-dark text-lg font-bold mb-1">
                        {studentData?.name || "Student Name"}
                      </h4>
                      <p className="text-gray-500 text-sm mb-2">
                        {studentData?.email || "student@example.com"}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          examAttempt?.is_completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {examAttempt?.is_completed ? 'Completed' : 'In Progress'}
                        </span>
                        {examAttempt?.is_completed && (
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            examAttempt?.has_passed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {examAttempt?.has_passed ? 'Passed' : 'Not Passed'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Submission Time</p>
                        <p className="text-brand-dark font-semibold">
                          {studentAnswers?.[0]?.created_at ? format(new Date(studentAnswers[0].created_at), "MMM dd, yyyy HH:mm") : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Time Taken</p>
                        <p className="text-brand-dark font-semibold">
                          {examAttempt?.completed_at && examAttempt?.created_at
                            ? (() => {
                                const start = new Date(examAttempt.created_at);
                                const end = new Date(examAttempt.completed_at);
                                const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
                                return diffMinutes < 1 
                                  ? `${Math.floor((end.getTime() - start.getTime()) / 1000)} seconds`
                                  : `${diffMinutes} minutes`;
                              })()
                            : 'N/A'
                          }
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
                        {studentAnswers?.reduce((sum, answer) => sum + (answer.points_earned || 0), 0) || 0}
                      </p>
                      <p className="text-gray-500 text-sm">Total Score</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-3">
                        <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                        <ClipboardCheck className="w-8 h-8 text-[#0C1C3C] relative z-10" />
                      </div>
                      <p className="text-brand-dark text-2xl font-extrabold">
                        {studentAnswers?.length || 0}/{summary?.total_questions || examAttempt?.total_questions || (isStudentExamDetails(studentExamDetails) ? studentExamDetails.exam?.exam_questions?.length : 0) || 0}
                      </p>
                      <p className="text-gray-500 text-sm">Questions</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-3">
                        <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                        <CheckCircle className="w-8 h-8 text-[#0C1C3C] relative z-10" />
                      </div>
                      <p className="text-brand-dark text-2xl font-extrabold">
                        {studentAnswers?.filter(answer => answer.has_passed).length || 0}
                      </p>
                      <p className="text-gray-500 text-sm">Correct</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-3">
                        <div className="w-full h-full absolute bg-[#D8B0FF] rounded-[22px]"></div>
                        <Clock className="w-8 h-8 text-[#0C1C3C] relative z-10" />
                      </div>
                      <p className="text-brand-dark text-2xl font-extrabold">
                        {examAttempt?.completed_at && examAttempt?.created_at
                          ? (() => {
                              const start = new Date(examAttempt.created_at);
                              const end = new Date(examAttempt.completed_at);
                              const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
                              return diffMinutes < 1 ? `${Math.floor((end.getTime() - start.getTime()) / 1000)}s` : `${diffMinutes}m`;
                            })()
                          : 'N/A'
                        }
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
                  {studentAnswers?.map((answer, index) => {
                    const question = answer.question;
                    if (!question) return null;

                    return (
                      <QuestionReviewCard 
                        key={answer.id}
                        answer={answer}
                        question={question}
                        questionNumber={index + 1}
                        onGrade={(points: number, feedback?: string) => handleGradeAnswer(answer.id, points, feedback)}
                        isGrading={gradeAnswer.isPending}
                        isStudent={isStudent}
                      />
                    );
                  })}

                  {(!studentAnswers || studentAnswers.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No answers found for this student.</p>
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

// Question Review Card Component
interface QuestionReviewCardProps {
  answer: QuestionAnswer;
  question: ExamQuestion;
  questionNumber: number;
  onGrade: (points: number, feedback?: string) => void;
  isGrading: boolean;
  isStudent?: boolean;
}

const QuestionReviewCard = ({
  answer,
  question,
  questionNumber,
  onGrade,
  isGrading,
  isStudent = false,
}: QuestionReviewCardProps) => {
  const [gradingPoints, setGradingPoints] = useState(answer.points_earned || 0);
  const [feedback] = useState(answer.feedback || "");

  const handleSaveGrading = () => {
    onGrade(gradingPoints, feedback);
  };

  const isMultipleChoice = question.type === 'multiple_choice';
  const isEssay = question.type === 'essay';

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
              {question.points} points
            </span>
            {!answer.has_passed && isEssay && (
              <span className="inline-block px-2 py-1 bg-[#FAAC7B]/20 text-[#0C1C3C] text-xs font-semibold rounded-full">
                Pending Grading
              </span>
            )}
          </div>
          <h4 className="text-brand-dark text-base font-semibold mb-4">{question.name}</h4>
          
          {/* Multiple Choice Options */}
          {isMultipleChoice && question.question_options && (
            <div className="grid grid-cols-1 gap-3 mb-4">
              {question.question_options.map((option: QuestionOption, idx: number) => {
                const isSelected = answer.selected_option_id === option.id;
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
                        {isSelected && !isCorrect && ' (Student Selected)'}
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
              <p className="text-gray-700 text-sm font-semibold mb-2">Student's Answer:</p>
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

          {/* Student Answer Result */}
          <div className={`border rounded-[12px] px-4 py-3 ${
            answer.answer_text === null
              ? 'bg-gray-100 border-gray-300'
              : answer.has_passed 
              ? 'bg-[#276874]/10 border-[#276874]/30'
              : isEssay && answer.points_earned === 0
              ? 'bg-[#FAAC7B]/10 border-[#FAAC7B]/30'
              : 'bg-[#EF3F09]/10 border-[#EF3F09]/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                {isMultipleChoice ? (
                  <>
                    <p className="text-[#0C1C3C] text-sm font-semibold mb-1">
                      Student Selected: {
                        answer.answer_text === null 
                          ? 'No answer provided'
                          : question.question_options?.find((opt: QuestionOption) => opt.id === answer.selected_option_id)?.name || 'No selection'
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
                    {answer.answer_text === null ? 'Not Answered' : 'Teacher Grading'}
                  </h5>
                )}
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                answer.has_passed 
                  ? 'bg-[#276874]/20 text-[#0C1C3C]'
                  : 'bg-[#EF3F09]/20 text-[#0C1C3C]'
              }`}>
                {answer.points_earned || 0}/{question.points} pts
              </span>
            </div>

            {/* Grading Interface for Essays - Teachers/Managers only */}
            {isEssay && !isStudent && answer.has_passed !== false && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[#0C1C3C] text-sm font-semibold mb-2">Points Earned</label>
                    <input 
                      type="number" 
                      value={gradingPoints}
                      onChange={(e) => setGradingPoints(Number(e.target.value))}
                      min="0" 
                      max={question.points}
                      className="w-full px-3 py-2 border border-[#276874]/50 rounded-[8px] focus:border-[#276874] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0C1C3C] text-sm font-semibold mb-2">Max Points</label>
                    <input 
                      type="text" 
                      value={question.points} 
                      disabled 
                      className="w-full px-3 py-2 border border-gray-300 rounded-[8px] bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSaveGrading}
                    disabled={isGrading}
                    className="px-4 py-2 bg-[#276874] text-white rounded-[8px] font-medium hover:bg-[#276874]/80 transition-all duration-300 disabled:opacity-50"
                  >
                    {isGrading ? 'Saving...' : 'Save Grading'}
                  </button>
                </div>
              </>
            )}

            {/* Read-only view for students */}
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

export default StudentExamAnswers;