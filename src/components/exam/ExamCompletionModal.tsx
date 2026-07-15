
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  ClipboardList, 
  BookOpen, 
  HelpCircle, 
  Clock, 
  Calendar,
  Home,
  Eye,
  Building2,
  Award
} from "lucide-react";
import type { SubjectExam, AuthUser, ExamAttempt } from "../../types";
import { format } from "date-fns";

interface ExamCompletionModalProps {
  isOpen: boolean;
  exam: SubjectExam;
  user: AuthUser;
  attempt: ExamAttempt;
  onViewResults?: () => void;
}

export const ExamCompletionModal = ({
  isOpen,
  exam,
  user,
  attempt,
  onViewResults,
}: ExamCompletionModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleBackToDashboard = () => {
    navigate("/student/dashboard");
  };

  const handleViewResults = () => {
    if (onViewResults) {
      onViewResults();
    } else {
      navigate(`/student/exams/${exam.id}/results`);
    }
  };

  // Calculate completion time
  const completionTime = attempt.completed_at 
    ? Math.floor((new Date(attempt.completed_at).getTime() - new Date(attempt.created_at).getTime()) / (1000 * 60))
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="flex min-h-screen w-full max-w-6xl">
        
        {/* Left Column - Banner Image */}
        <div className="hidden md:block w-1/3 bg-cover bg-center bg-no-repeat rounded-l-[20px] bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]" />

        {/* Right Column - Content */}
        <div className="flex-1 flex flex-col justify-center bg-[#F7F7F7] rounded-r-[20px] md:rounded-l-none rounded-l-[20px] p-8">
          
          {/* Main Content Section */}
          <div className="w-full max-w-2xl mx-auto bg-[#F7F7F7] rounded-[20px] pt-6 px-4 pb-4">
            {/* Header Section */}
            <div className="mb-[50px]">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <div className="w-16 h-16 absolute bg-[#EF3F09] rounded-full"></div>
                  <Building2 className="w-8 h-8 text-white relative z-10" />
                </div>
                <div>
                  <h1 className="text-brand-dark text-2xl font-extrabold">JawaraCBT</h1>
                  <p className="text-brand-dark text-xs font-normal">Exam Completed</p>
                </div>
              </div>
            </div>

            {/* Inner White Card */}
            <div className="bg-white rounded-[20px] px-8 pt-8 pb-8 border border-gray-200">
              
              {/* Success Icon & Message */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#C5E151] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#0C1C3C]" />
                  </div>
                </div>
                <h2 className="text-brand-dark text-2xl font-bold mb-2">Congratulations!</h2>
                <p className="text-gray-600 text-base">You have successfully completed your exam.</p>
              </div>

              {/* Exam Summary */}
              <div className="bg-[#F7F7F7] rounded-[16px] p-6 mb-8">
                <h3 className="text-brand-dark text-lg font-bold mb-4">Exam Summary</h3>
                
                <div className="space-y-4">
                  {/* Exam Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Exam Name</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">{exam.name}</span>
                  </div>

                  {/* Subject */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Subject</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">
                      {exam.subject?.name || "Unknown Subject"}
                    </span>
                  </div>

                  {/* Questions Answered */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Questions Answered</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">
                      {attempt.answered_questions || 0} of {attempt.total_questions || 0}
                    </span>
                  </div>

                  {/* Completion Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Completion Time</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">
                      {completionTime} minutes
                    </span>
                  </div>

                  {/* Submitted At */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Submitted At</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">
                      {attempt.completed_at ? format(new Date(attempt.completed_at), "MMM dd, yyyy - h:mm a") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div className="bg-[#F7F7F7] rounded-[16px] p-6 mb-8">
                <div className="flex items-center justify-between">
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#EF3F09] flex items-center justify-center text-white font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-brand-dark text-base font-semibold">{user.name}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  {/* Completion Badge */}
                  <div className="flex items-center gap-2 bg-[#C5E151] px-4 py-2 rounded-[12px]">
                    <Award className="w-4 h-4 text-[#0C1C3C]" />
                    <span className="text-[#0C1C3C] text-sm font-semibold">Exam Completed</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToDashboard}
                  className="flex-1 px-8 py-3 border border-[#DCDEDD] text-brand-dark rounded-[12px] font-medium hover:border-[#EF3F09] hover:text-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={handleViewResults}
                  className="flex-1 px-8 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Results</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};