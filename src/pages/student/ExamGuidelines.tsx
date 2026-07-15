import { useParams, useNavigate } from "react-router-dom";
import { ClipboardList, Clock, HelpCircle, Award, AlertTriangle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useFetchStudentExamInfo, useStartExam } from "../../hooks/useExams";

const ExamGuidelines = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();


  // Parse exam ID
  const examId = id ? parseInt(id, 10) : 0;

  // Fetch data
  const { data: examData, isLoading: examLoading } = useFetchStudentExamInfo(examId);
  const startExamMutation = useStartExam();

  // Handle exam start
  const handleStartExam = async () => {
    if (!examId) return;

    try {
      await startExamMutation.mutateAsync(examId);
      toast.success("Exam started successfully!");
      navigate(`/dashboard/exams/${examId}/take`);
    } catch (error: unknown) {
      toast.error((error as {response?: {data?: {message?: string}}})?.response?.data?.message || "Failed to start exam");
    }
  };

  // Loading state
  if (examLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#EF3F09] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam details...</p>
        </div>
      </div>
    );
  }

  // Exam not found
  if (!examData || !examData.exam) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark mb-4">Exam Not Found</h1>
          <p className="text-gray-600 mb-6">The exam you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate("/dashboard/student-classrooms")}
            className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Extract data from the correct properties
  const exam = examData.exam;
  const questions = examData.questions;
  const total_questions = questions.length;
  const total_points = exam.total_points;
  const can_take = examData.can_take || false;
  
  // Check if exam is currently active (between start and end dates)
  const now = new Date();
  const startDate = new Date(exam.started_at);
  const endDate = new Date(exam.ended_at);
  const is_active = now >= startDate && now <= endDate;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="p-6">
        {/* Content Container */}
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <div className="w-16 h-16 absolute bg-[#EF3F09] rounded-full"></div>
                  <Building2 className="w-8 h-8 text-white relative z-10" />
                </div>
                <div>
                  <h1 className="text-brand-dark text-2xl font-extrabold">JawaraCBT</h1>
                  <p className="text-brand-dark text-xs font-normal">Exam Guidelines</p>
                </div>
              </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[20px] p-8 border border-gray-200 mb-6">
              {/* Exam Title */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-brand-dark mb-4">{exam.name}</h2>
                <p className="text-gray-600 text-lg">{exam.about}</p>
              </div>

              {/* Exam Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#F7F7F7] p-6 rounded-[16px] flex items-center gap-4">
                  <Clock className="w-8 h-8 text-[#EF3F09] flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="font-bold text-brand-dark text-lg">
                      {(() => {
                        const totalSeconds = exam.exam_questions?.reduce((sum, question) => sum + (question.timer || 0), 0) || 0;
                        const totalMinutes = Math.floor(totalSeconds / 60);
                        return totalMinutes === 0 ? "0 min" : totalMinutes < 60 ? `${totalMinutes} min` : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
                      })()}
                    </p>
                  </div>
                </div>
                <div className="bg-[#F7F7F7] p-6 rounded-[16px] flex items-center gap-4">
                  <HelpCircle className="w-8 h-8 text-[#EF3F09] flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-1">Questions</p>
                    <p className="font-bold text-brand-dark text-lg">{total_questions || 0}</p>
                  </div>
                </div>
                <div className="bg-[#F7F7F7] p-6 rounded-[16px] flex items-center gap-4">
                  <Award className="w-8 h-8 text-[#EF3F09] flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-1">Total Points</p>
                    <p className="font-bold text-brand-dark text-lg">{total_points || exam.total_points || 0}</p>
                  </div>
                </div>
                <div className="bg-[#F7F7F7] p-6 rounded-[16px] flex items-center gap-4">
                  <ClipboardList className="w-8 h-8 text-[#EF3F09] flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-1">Subject</p>
                    <p className="font-bold text-brand-dark text-lg">{exam.subject?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2 mb-8">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Important Instructions
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-6 pt-6 pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                      <div className="w-full h-full absolute bg-yellow-100 rounded-[22px]"></div>
                      <AlertTriangle className="w-6 h-6 text-yellow-600 relative z-10" />
                    </div>
                    <div>
                      <p className="text-brand-dark text-base font-semibold">Read Carefully</p>
                      <p className="text-gray-500 text-sm">Follow these guidelines during your exam</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-brand-dark">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#EF3F09] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Once you start the exam, the timer will begin counting down automatically</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#EF3F09] rounded-full mt-2 flex-shrink-0"></div>
                      <span>You cannot pause, restart, or go back to previous questions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#EF3F09] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Make sure you have a stable internet connection throughout the exam</span>
                    </li> 
                  </ul>
                </div>
              </div>

              {/* Exam Status */}
              {!is_active && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-[16px] p-6 mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <h3 className="font-bold text-yellow-800">Exam Not Active</h3>
                  </div>
                  <p className="text-yellow-700">This exam is not currently available for taking. Please check the exam schedule.</p>
                </div>
              )}

              {!can_take && is_active && (
                <div className="bg-red-50 border border-red-200 rounded-[16px] p-6 mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h3 className="font-bold text-red-800">Cannot Take Exam</h3>
                  </div>
                  <p className="text-red-700">You may have already completed this exam or it's no longer available.</p>
                </div>
              )}

              {/* Student Info */}
              <div className="bg-[#F7F7F7] rounded-[16px] p-6 mb-8">
                <h3 className="font-bold text-brand-dark mb-4">Student Information</h3>
                <div className="flex items-center gap-4">
                  <img 
                    src={user?.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} 
                    alt="Student Avatar" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-brand-dark">{user?.name}</p>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(exam.subject_id ? `/dashboard/subjects/${exam.subject_id}/exams` : "/dashboard/student-classrooms")}
                  className="flex-1 px-8 py-4 border border-gray-300 text-gray-700 rounded-[12px] font-medium hover:border-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartExam}
                  disabled={!can_take || startExamMutation.isPending}
                  className="flex-1 px-8 py-4 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startExamMutation.isPending ? 'Starting Exam...' : 'Start Exam Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ExamGuidelines;