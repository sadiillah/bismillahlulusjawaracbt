import { useParams, useNavigate } from "react-router-dom";
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
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useFetchExamResults } from "../../hooks/useExams";

const ExamCompletion = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const examId = id ? parseInt(id, 10) : 0;
  
  // Fetch exam results which includes completion data and attempt info
  const { data: examResults, isLoading: examLoading } = useFetchExamResults(examId);
  
  // Handle navigation
  const handleBackToSubjectExams = () => {
    // ExamResult.exam.subject now has an id property
    const subjectId = exam?.subject?.id;
    if (subjectId) {
      navigate(`/dashboard/subjects/${subjectId}/exams`);
    } else {
      navigate("/dashboard/exams");
    }
  };

  const handleViewResults = () => {
    navigate(`/dashboard/student/exams/${examId}/results`);
  };

  // Loading state
  if (examLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#EF3F09] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading completion details...</p>
        </div>
      </div>
    );
  }

  // Check if we have the required data
  if (!examResults || !user) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark mb-4">Exam Not Completed</h1>
          <p className="text-gray-600 mb-6">This exam has not been completed yet or data is not available.</p>
          <button
            onClick={handleBackToSubjectExams}
            className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Debug: Log the actual backend response structure
  console.log("examResults structure:", examResults);
  console.log("attempt data:", examResults?.attempt);
  console.log("attempt created_at:", examResults?.attempt?.created_at);
  console.log("attempt completed_at:", examResults?.attempt?.completed_at);
  
  // Based on the JSON response, examResults contains the full exam data with attempt
  // The structure is: { exam: {...}, attempt: {...}, results: {...}, answers: [...] }
  const attempt = examResults?.attempt;
  const exam = examResults?.exam;
  
  // If examResults is undefined or doesn't have attempt data, 
  // the student likely hasn't completed the exam yet
  if (!attempt) {
    console.log("No attempt data found. examResults:", examResults);
    console.log("Available exam data:", exam);
    
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark mb-4">Exam Not Completed</h1>
          <p className="text-gray-600 mb-6">
            This exam has not been completed yet or results are not available.
            <br />
            <small className="text-gray-400">
              Debug: examResults {examResults ? 'exists' : 'is undefined'}, 
              attempt {attempt ? 'exists' : 'is undefined'}
            </small>
          </p>
          <button
            onClick={handleBackToSubjectExams}
            className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // Calculate completion time from attempt data with smart formatting
  const calculateCompletionTime = () => {
    if (!attempt?.completed_at || !attempt?.created_at) {
      console.log("Missing timestamps - completed_at:", attempt?.completed_at, "created_at:", attempt?.created_at);
      return null;
    }

    const startDate = new Date(attempt.created_at);
    const endDate = new Date(attempt.completed_at);
    
    console.log("Start time:", attempt.created_at, "->", startDate);
    console.log("End time:", attempt.completed_at, "->", endDate);
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    console.log("Time difference (ms):", diffMs);
    console.log("Time difference (seconds):", diffSeconds);
    console.log("Time difference (minutes):", diffMinutes);
    
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

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="flex min-h-screen">
        
        {/* Left Column - Banner Image */}
        <div className="hidden md:block md:w-[calc(35%-60px)]">
          <div className="w-full h-full bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]"></div>
        </div>

        {/* Right Column - Content */}
        <div className="flex-1 flex flex-col justify-center px-12">
          
          {/* Main Content Section */}
          <div className="w-full max-w-2xl mx-auto bg-[#F7F7F7] rounded-[20px] pt-6 px-4 pb-4">
            {/* Header Section */}
            <div className="mb-[50px]">
              <div className="flex items-center justify-center gap-4 ml-6">
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
                    <span className="text-brand-dark text-base font-semibold">{exam?.name || "Unknown Exam"}</span>
                  </div>

                  {/* Subject */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Subject</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">
                      {exam?.subject.name || "Unknown Subject"}
                    </span>
                  </div>

                  {/* Questions Answered */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Questions Answered</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">
                      {attempt?.answered_questions || 0} of {attempt?.total_questions || 0}
                    </span>
                  </div>

                  {/* Completion Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Completion Time</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">
                      {completionTime || 'Time not recorded'}
                    </span>
                  </div>

                  {/* Submitted At */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span className="text-brand-dark text-base font-medium">Submitted At</span>
                    </div>
                    <span className="text-brand-dark text-base font-semibold">
                      {attempt?.completed_at ? format(new Date(attempt.completed_at), "MMM dd, yyyy - h:mm a") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div className="bg-[#F7F7F7] rounded-[16px] p-6 mb-8">
                <div className="flex items-center justify-between">
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} 
                      alt="Student Avatar" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
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
                  onClick={handleBackToSubjectExams}
                  className="flex-1 px-8 py-3 border border-[#DCDEDD] text-brand-dark rounded-[12px] font-medium hover:border-[#EF3F09] hover:text-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Subject Exams</span>
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

export default ExamCompletion;