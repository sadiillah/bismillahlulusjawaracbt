import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Edit,
  ChevronRight,
  ClipboardCheck,
  Star,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  Plus,
  FileText,
  Trash2,
  X,
  Eye,
  Play,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from "../../../components/sidebars";
import { DeleteConfirmationModal } from "../../../components/modals";
import { useFetchExam, useFetchStudentExam, useFetchExamResults, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from "../../../hooks/useExams";
import type { ExamQuestion, QuestionOption, CreateQuestionRequest, UpdateQuestionRequest } from "../../../types/exams";
import type { AxiosError } from "axios";
import { format } from "date-fns"; 

const ExamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("questions");
  const [questionModal, setQuestionModal] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [questionType, setQuestionType] = useState<string>("multiple_choice");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    questionId: number | null;
    questionName: string;
  }>({
    isOpen: false,
    questionId: null,
    questionName: "",
  });
  const [questionFormData, setQuestionFormData] = useState({
    name: "",
    points: 5,
    timer: 3,
    options: [
      { name: "", is_correct: true },
      { name: "", is_correct: false },
      { name: "", is_correct: false },
      { name: "", is_correct: false },
    ]
  });

  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === "manager";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  // Render appropriate sidebar based on role
  const renderSidebar = () => {
    if (isManager) {
      return <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    } else if (isTeacher) {
      return <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    } else if (isStudent) {
      return <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    }
    return null;
  };

  // Parse exam ID
  const examId = id ? parseInt(id, 10) : 0;

  // Always call hooks - they have internal enabled logic
  const { data: examForStudent, isLoading: studentExamLoading, error: studentExamError } = useFetchStudentExam(isStudent ? examId : 0);
  const { data: examForManager, isLoading: managerExamLoading, error: managerExamError } = useFetchExam(!isStudent ? examId : 0);

  // Fetch student's exam results if user is a student (to check completion)
  const { data: examResults, isLoading: resultsLoading } = useFetchExamResults(isStudent ? examId : 0);

  // Derive the actual exam data and loading/error states
  const exam = isStudent ? examForStudent : examForManager;
  const examLoading = isStudent ? studentExamLoading : managerExamLoading;
  const examError = isStudent ? studentExamError : managerExamError;

  // Question management mutations
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  // Get exam status - matches SubjectExams.tsx exactly
  const getExamStatus = () => {
    if (!exam) return { status: "Unknown", color: "gray" };

    const today = new Date();
    const startDate = new Date(exam.started_at);
    const endDate = new Date(exam.ended_at);
    
    // Set times to 00:00:00 for date-only comparison
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Check if exam is past due date (Closed)
    if (today.getTime() > endDate.getTime()) {
      return { status: "Closed", color: "red" };
    }
    
    // Check if current user has completed this exam (Completed)
    // Note: This would require user completion data from the API
    // For now, we'll use examResults to check completion status
    if (isStudent && hasStudentCompletedExam()) {
      return { status: "Completed", color: "blue" };
    }
    
    // Default to Active for available exams
    return { status: "Active", color: "green" };
  };

  // Calculate exam duration based on sum of all question timers
  const getExamDuration = () => {
    if (!exam) return "0 min";
    
    // Calculate total duration from question timers (stored in seconds)
    const totalSeconds = exam.exam_questions?.reduce((sum, question) => {
      return sum + (question.timer || 0);
    }, 0) || 0;
    
    // Convert to minutes
    const totalMinutes = Math.floor(totalSeconds / 60);
    
    if (totalMinutes === 0) {
      return "0 min";
    } else if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  // Format due date
  const getDueDate = () => {
    if (!exam) return "-";
    return format(new Date(exam.ended_at), "MMM dd");
  };

  // Check if exam has reached maximum points limit
  const isExamAtMaxPoints = () => {
    if (!exam) return false;
    return (exam.total_points || 0) >= 100;
  };

  // Handle tab switching
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle navigation back to subject exams
  const handleBack = () => {
    if (exam?.subject_id) {
      navigate(`/dashboard/subjects/${exam.subject_id}/exams`);
    } else {
      navigate(-1);
    }
  };

  // Handle edit exam
  const handleEditExam = () => {
    navigate(`/dashboard/exams/${examId}/edit`);
  };

  // Handle start exam (for students)
  const handleStartExam = () => {
    navigate(`/dashboard/exams/${examId}/guidelines`);
  };

  // Handle view results (for students)
  const handleViewResults = () => {
    navigate(`/dashboard/exams/${examId}/results`);
  };

  // Check if student has completed the exam
  const hasStudentCompletedExam = () => {
    if (!isStudent) return false;
    
    // If exam results exist and have attempt data, it means the exam is completed
    return !!examResults && !!examResults.attempt;
  };

  // Handle question type change
  const handleQuestionTypeChange = (type: string) => {
    setQuestionType(type);
  };

  // Handle question modal open (reset form state)
  const handleOpenQuestionModal = () => {
    setQuestionType("multiple_choice");
    setQuestionFormData({
      name: "",
      points: 5,
      timer: 3,
      options: [
        { name: "", is_correct: true },
        { name: "", is_correct: false },
        { name: "", is_correct: false },
        { name: "", is_correct: false },
      ]
    });
    setIsViewMode(false);
    setIsEditMode(false);
    setEditingQuestion(null);
    setQuestionModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Handle question modal close
  const handleCloseQuestionModal = () => {
    setQuestionModal(false);
    setIsViewMode(false);
    setIsEditMode(false);
    setEditingQuestion(null);
    document.body.style.overflow = 'auto';
  };

  // Handle view question
  const handleViewQuestion = (question: ExamQuestion) => {
    // Convert question_options to options format for the form
    const formattedOptions = question.question_options && question.question_options.length > 0 
      ? question.question_options.map((opt: QuestionOption) => ({
          name: opt.name,
          is_correct: opt.is_correct
        }))
      : [
          { name: "", is_correct: true },
          { name: "", is_correct: false },
          { name: "", is_correct: false },
          { name: "", is_correct: false },
        ];

    // Set the form data with the question details
    setQuestionFormData({
      name: question.name,
      points: question.points,
      timer: Math.floor(question.timer / 60), // Convert seconds to minutes
      options: formattedOptions
    });

    // Set the question type and modal state
    setQuestionType(question.type);
    setIsViewMode(true);
    setIsEditMode(false);
    setEditingQuestion(null);
    setQuestionModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Handle edit question
  const handleEditQuestion = (question: ExamQuestion) => {
    // Convert question_options to options format for the form
    const formattedOptions = question.question_options && question.question_options.length > 0 
      ? question.question_options.map((opt: QuestionOption) => ({
          name: opt.name,
          is_correct: opt.is_correct
        }))
      : [
          { name: "", is_correct: true },
          { name: "", is_correct: false },
          { name: "", is_correct: false },
          { name: "", is_correct: false },
        ];

    // Set the form data with the question details
    setQuestionFormData({
      name: question.name,
      points: question.points,
      timer: Math.floor(question.timer / 60), // Convert seconds to minutes
      options: formattedOptions
    });

    // Set the question type and modal state for editing
    setQuestionType(question.type);
    setEditingQuestion(question);
    setIsEditMode(true);
    setIsViewMode(false);
    setQuestionModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Handle form input changes
  const handleFormInputChange = (field: string, value: string | number) => {
    setQuestionFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle option changes
  const handleOptionChange = (index: number, field: string, value: string | boolean) => {
    setQuestionFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  // Handle correct answer selection (only one correct for multiple choice)
  const handleCorrectAnswerChange = (selectedIndex: number) => {
    setQuestionFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => ({
        ...option,
        is_correct: i === selectedIndex
      }))
    }));
  };

  // Handle question creation and updating
  const handleSubmitQuestion = async (e?: React.FormEvent | React.MouseEvent) => {
    console.log("=== handleSubmitQuestion called ===");
    console.log("Is edit mode:", isEditMode);
    console.log("Question type:", questionType);
    console.log("Form data:", questionFormData);
    console.log("Editing question:", editingQuestion);
    
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    
    if (!exam?.id) {
      console.error("Exam not found - exam:", exam);
      toast.error("Exam not found");
      return;
    }

    // Basic validation
    if (!questionFormData.name.trim()) {
      console.error("Question name is empty");
      toast.error("Please enter a question text");
      return;
    }

    try {
      console.log(isEditMode ? "Updating question data..." : "Creating question data...");
      console.log("Exam ID:", exam.id);
      console.log("Current user role:", role);
      
      // Prepare base question data
      const baseQuestionData = {
        name: questionFormData.name.trim(),
        timer: questionFormData.timer * 60, // Convert minutes to seconds
        type: questionType as 'multiple_choice' | 'essay',
        points: questionFormData.points,
      };

      // Prepare options for multiple choice questions only
      let validOptions;
      if (questionType === 'multiple_choice') {
        console.log("Processing multiple choice options...");
        validOptions = questionFormData.options.filter(opt => opt.name.trim() !== '');
        console.log("Valid options:", validOptions);
        
        if (validOptions.length < 2) {
          toast.error("Please provide at least 2 options for multiple choice questions");
          return;
        }
        if (!validOptions.some(opt => opt.is_correct)) {
          toast.error("Please select a correct answer");
          return;
        }
      } else {
        console.log("Essay question - skipping options validation");
      }
      
      if (isEditMode && editingQuestion) {
        console.log("Calling updateQuestion.mutateAsync...");
        const updateData: UpdateQuestionRequest = {
          ...baseQuestionData,
          ...(validOptions && { options: validOptions })
        };
        console.log("Update question data:", updateData);
        const result = await updateQuestion.mutateAsync({ id: editingQuestion.id, ...updateData });
        console.log("Question updated successfully:", result);
        toast.success("Question updated successfully!");
      } else {
        console.log("Calling createQuestion.mutateAsync...");
        const createData: CreateQuestionRequest = {
          subject_exam_id: exam.id,
          ...baseQuestionData,
          ...(validOptions && { options: validOptions })
        };
        console.log("Create question data:", createData);
        const result = await createQuestion.mutateAsync(createData);
        console.log("Question created successfully:", result);
        toast.success("Question created successfully!");
      }
      
      handleCloseQuestionModal();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} question:`, error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: (error as AxiosError)?.response?.data || 'No response data'
      });
      
      // Extract specific error message from backend
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} question. Please try again.`;
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if ((error as AxiosError)?.response?.data && typeof (error as AxiosError).response?.data === 'object' && (error as AxiosError).response?.data !== null && Object.prototype.hasOwnProperty.call((error as AxiosError).response!.data, 'message')) {
        errorMessage = ((error as AxiosError).response!.data as { message: string }).message;
      } else if ((error as Error)?.message) {
        errorMessage = (error as Error).message;
      }
      
      toast.error(errorMessage);
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async () => {
    if (!exam?.id || !deleteModal.questionId) return;
    
    try {
      await deleteQuestion.mutateAsync({ id: deleteModal.questionId, examId: exam.id });
      toast.success("Question deleted successfully!");
      setDeleteModal({ isOpen: false, questionId: null, questionName: "" });
    } catch (error) {
      console.error("Error deleting question:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: (error as AxiosError)?.response?.data || 'No response data',
        fullError: error
      });
      
      // Extract specific error message from backend
      let errorMessage = "Failed to delete question. Please try again.";
      
      // Try different possible error message locations
      const axiosError = error as AxiosError;
      if (axiosError?.response?.data && typeof axiosError.response.data === 'object' && axiosError.response.data !== null && Object.prototype.hasOwnProperty.call(axiosError.response.data, 'message')) {
        errorMessage = (axiosError.response.data as { message: string }).message;
      } else if (axiosError?.response?.data && typeof axiosError.response.data === 'object' && axiosError.response.data !== null && Object.prototype.hasOwnProperty.call(axiosError.response.data, 'error')) {
        errorMessage = (axiosError.response.data as { error: string }).error;
      } else if (axiosError?.response?.data && typeof axiosError.response.data === 'string') {
        errorMessage = axiosError.response.data;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if ((error as Error)?.message) {
        errorMessage = (error as Error).message;
      }
      
      toast.error(errorMessage);
    }
  };

  // Handle escape key and cleanup
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && questionModal) {
        handleCloseQuestionModal();
      }
    };

    if (questionModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Cleanup body overflow on unmount
      document.body.style.overflow = 'auto';
    };
  }, [questionModal]);

  // Loading state
  if (examLoading || (isStudent && resultsLoading)) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          {renderSidebar()}
          <div className="flex-1 ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF3F09] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading exam details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (examError || !exam) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          {renderSidebar()}
          <div className="flex-1 ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Found</h2>
                <p className="text-gray-600 mb-4">The exam you're looking for could not be found.</p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:bg-[#d63507] transition-colors duration-300"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { status, color } = getExamStatus();

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Conditional Sidebar Rendering */}
        {renderSidebar()}

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Content */}
          <main className="main-content flex-1 p-5">
            {/* Breadcrumb */}
            <div className="mt-[50px] mb-4 ml-[50px]">
              <nav className="flex items-center gap-2 text-sm">
                {isStudent ? (
                  <>
                    <Link
                      to="/dashboard/student-classrooms"
                      className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
                    >
                      Dashboard
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link
                      to="/dashboard/classrooms"
                      className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
                    >
                      My Classrooms
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link
                      to={`/dashboard/subjects/${exam.subject_id}/exams`}
                      className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
                    >
                      Subject Exams
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-brand-dark font-medium">Exam Details</span>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard/overview"
                      className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
                    >
                      Dashboard
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link
                      to="/dashboard/overview"
                      className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
                    >
                      Schools
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link
                      to="/dashboard/subjects"
                      className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
                    >
                      Subjects
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link
                      to={`/dashboard/subjects/${exam.subject_id}/exams`}
                      className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
                    >
                      Subject Exams
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-brand-dark font-medium">Exam Details</span>
                  </>
                )}
              </nav>
            </div>

            {/* Page Header */}
            <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              <div className="flex items-center justify-between pl-2 pr-2">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[26px]"></div>
                    <ClipboardList className="w-10 h-10 text-[#0C1C3C] relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-brand-dark text-3xl font-extrabold mb-2">{exam.name}</h1>
                    <p className="text-brand-dark text-base font-normal">
                      {isStudent ? "View exam details, questions, and results" : "Manage exam questions, students, and certificates"}
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
                  
                  {/* Student-specific buttons */}
                  {isStudent && (
                    <>
                      {hasStudentCompletedExam() ? (
                        <button
                          type="button"
                          onClick={handleViewResults}
                          className="px-4 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>View Results</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartExam}
                          className="px-4 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Exam</span>
                        </button>
                      )}
                    </>
                  )}
                  
                  {/* Manager/Teacher buttons */}
                  {(isManager || isTeacher) && (
                    <button
                      type="button"
                      onClick={handleEditExam}
                      className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-[#0C1C3C]">Edit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Exam Information Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              {/* Exam Status */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Exam Status
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="my-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          color === "green" ? "bg-green-100 text-green-800" :
                          color === "blue" ? "bg-blue-100 text-blue-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            color === "green" ? "bg-green-500" :
                            color === "blue" ? "bg-blue-500" :
                            "bg-red-500"
                          }`}></div>
                          {status}
                        </span>
                      </div>
                      <p className="text-success text-sm font-medium">
                        {status === "Active" ? "Currently active" : 
                         status === "Completed" ? "Completed by user" : 
                         "Exam ended"}
                      </p>
                    </div>
                    <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                      <div className={`w-full h-full absolute rounded-[22px] ${
                        color === "green" ? "bg-[#C5E151]" :
                        color === "blue" ? "bg-[#82D9D7]" :
                        "bg-[#FAAC7B]"
                      }`}></div>
                      <ClipboardCheck className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Points */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Total Points
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                        {exam.exam_questions?.reduce((sum, q) => sum + (q.points || 0), 0) || exam.total_points || 100}
                      </p>
                      <p className="text-success text-sm font-medium">
                        Maximum points
                      </p>
                    </div>
                    <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                      <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                      <Star className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Duration
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                        {getExamDuration()}
                      </p>
                      <p className="text-success text-sm font-medium">
                        Exam duration
                      </p>
                    </div>
                    <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                      <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                      <Clock className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Due Date
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                        {getDueDate()}
                      </p>
                      <p className="text-success text-sm font-medium">
                        Deadline
                      </p>
                    </div>
                    <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                      <div className="w-full h-full absolute bg-[#D8B0FF] rounded-[22px]"></div>
                      <Calendar className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Information and Teacher Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              {/* Subject Information Card */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Subject Information
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-6 py-6">
                  {exam.subject && (
                    <>
                      <div className="mb-4">
                        <div className="relative">
                          <img 
                            src={exam.subject.photo || "https://via.placeholder.com/300x128"} 
                            alt={exam.subject.name} 
                            className="w-full h-32 object-cover rounded-[12px]" 
                          />
                          <span className="absolute bottom-2 left-2 text-[#0C1C3C] text-xs font-semibold bg-[#C5E151] px-2 py-1 rounded shadow-lg">
                            {exam.subject.topic?.name || "Subject"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-brand-dark text-lg font-bold mb-3">{exam.subject.name}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">{exam.attempts_count || 0} Students Enrolled</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">{exam.exam_questions_count || 0} Questions</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Subject Teacher Card */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">
                    Subject Teacher
                  </h3>
                </div>
                <div className="bg-white rounded-[20px] px-6 py-6">
                  {exam.subject?.teacher ? (
                    <>
                      <div className="text-center">
                        <img 
                          src={exam.subject.teacher.photo || "https://via.placeholder.com/64"} 
                          alt={exam.subject.teacher.name} 
                          className="w-16 h-16 rounded-full object-cover mx-auto mb-3" 
                        />
                        <h5 className="text-brand-dark text-base font-bold mb-1">{exam.subject.teacher.name}</h5>
                        <p className="text-gray-500 text-sm mb-4">{exam.subject.teacher.email}</p>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-300 mb-4"></div>
                      
                      {/* Teacher Achievements */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-brand-dark text-xs font-semibold">10+ years of teaching experience</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-brand-dark text-xs font-semibold">Expert in subject matter</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-brand-dark text-xs font-semibold">Excellence in education</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>No teacher assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content with Tabs */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  {isStudent ? "Exam Information" : "Exam Management"}
                </h3>
              </div>
              <div className="flex gap-4">
                {/* Tabbed Content */}
                <div className="bg-white rounded-[20px] px-6 py-6 w-full">
                  
                  {/* Tab Navigation */}
                  <div className="mb-6">
                    <nav className="flex space-x-2">
                      <button 
                        onClick={() => handleTabChange('questions')}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                          activeTab === 'questions' 
                            ? 'bg-[#EF3F09] text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-[#0C1C3C] hover:text-white'
                        }`}
                      >
                        Questions
                      </button>
                      {(isManager || isTeacher) && (
                        <button 
                          onClick={() => handleTabChange('students')}
                          className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                            activeTab === 'students' 
                              ? 'bg-[#EF3F09] text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-[#0C1C3C] hover:text-white'
                          }`}
                        >
                          Students
                        </button>
                      )}
                      <button 
                        onClick={() => handleTabChange('rewards')}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                          activeTab === 'rewards' 
                            ? 'bg-[#EF3F09] text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-[#0C1C3C] hover:text-white'
                        }`}
                      >
                        Rewards
                      </button>
                      <button 
                        onClick={() => handleTabChange('certificate')}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                          activeTab === 'certificate' 
                            ? 'bg-[#EF3F09] text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-[#0C1C3C] hover:text-white'
                        }`}
                      >
                        Certificate
                      </button>
                    </nav>
                  </div>

                  {/* Questions Tab Content */}
                  {activeTab === 'questions' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-brand-dark text-lg font-bold">
                          Exam Questions ({exam.exam_questions?.length || 0})
                        </h4>
                        {(isManager || isTeacher) && (
                          <button 
                            onClick={handleOpenQuestionModal}
                            disabled={isExamAtMaxPoints()}
                            className={`px-4 py-3 rounded-[12px] font-medium transition-all duration-300 flex items-center gap-2 ${
                              isExamAtMaxPoints()
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                                : 'bg-[#EF3F09] text-white hover:bg-[#d63507]'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            {isExamAtMaxPoints() ? 'Maximum Points Reached (100)' : 'Add New Question'}
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {(createQuestion.isPending || updateQuestion.isPending) && (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EF3F09]"></div>
                            <span className="ml-2 text-gray-600">{updateQuestion.isPending ? "Updating question..." : "Creating question..."}</span>
                          </div>
                        )}
                        
                        {deleteQuestion.isPending && (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                            <span className="ml-2 text-gray-600">Deleting question...</span>
                          </div>
                        )}

                        {(createQuestion.isError || updateQuestion.isError) && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 text-sm">
                              Failed to {updateQuestion.isError ? 'update' : 'create'} question. Please check your input and try again.
                            </p>
                          </div>
                        )}

                        {deleteQuestion.isError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 text-sm">
                              Failed to delete question. Please try again.
                            </p>
                          </div>
                        )}
                        
                        {exam.exam_questions && exam.exam_questions.length > 0 ? (
                          exam.exam_questions.map((question, index) => (
                            <div key={question.id} className="p-3 border border-[#DCDEDD] rounded-[12px] hover:shadow-lg transition-all duration-300 hover:border-[#EF3F09]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                                    <span className="text-gray-600 text-xs font-bold">{index + 1}</span>
                                  </div>
                                  <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${
                                    question.type === 'multiple_choice' ? 'bg-blue-100' : 'bg-purple-100'
                                  }`}>
                                    {question.type === 'multiple_choice' ? (
                                      <CheckCircle className="w-5 h-5 text-blue-600" />
                                    ) : (
                                      <FileText className="w-5 h-5 text-purple-600" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                                      question.type === 'multiple_choice' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-purple-100 text-purple-800'
                                    }`}>
                                      {question.type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'}
                                    </span>
                                    <h5 className="text-brand-dark text-base font-semibold mb-1">{question.name}</h5>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-semibold">
                                    {question.points} pts
                                  </span>
                                  {(isManager || isTeacher) && (
                                    <button 
                                      onClick={() => handleViewQuestion(question)}
                                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors border border-gray-300 hover:border-blue-500 rounded-full"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  )}
                                  {(isManager || isTeacher) && (
                                    <button 
                                      onClick={() => handleEditQuestion(question)}
                                      className="p-2 text-gray-400 hover:text-[#EF3F09] transition-colors border border-gray-300 hover:border-[#EF3F09] rounded-full"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                  {(isManager || isTeacher) && (
                                    <button 
                                      onClick={() =>
                                        setDeleteModal({
                                          isOpen: true,
                                          questionId: question.id,
                                          questionName: question.name,
                                        })
                                      }
                                      disabled={deleteQuestion.isPending}
                                      className="p-2 text-gray-400 hover:text-red-600 transition-colors border border-gray-300 hover:border-red-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No questions added yet.</p>
                            {isExamAtMaxPoints() && (
                              <p className="text-orange-600 text-sm mt-2 mb-2">
                                Cannot add questions - exam has reached the 100-point limit.
                              </p>
                            )}
                            {(isManager || isTeacher) && (
                              <button 
                                onClick={handleOpenQuestionModal}
                                disabled={isExamAtMaxPoints()}
                                className={`mt-4 px-4 py-2 rounded-[8px] font-medium transition-all duration-300 inline-flex items-center gap-2 ${
                                  isExamAtMaxPoints()
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                                    : 'bg-[#EF3F09] text-white hover:bg-[#d63507]'
                                }`}
                              >
                                <Plus className="w-4 h-4" />
                                {isExamAtMaxPoints() ? 'Maximum Points Reached (100)' : 'Add First Question'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Students Tab Content */}
                  {activeTab === 'students' && (isManager || isTeacher) && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-brand-dark text-lg font-bold">
                          Students ({exam.attempts_count || 0})
                        </h4>
                        {(isManager || isTeacher) && (
                          <button 
                            onClick={() => toast.info("Export functionality coming soon")}
                            className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-[#0C1C3C]" />
                            Export Results
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {exam.attempts && exam.attempts.length > 0 ? (
                          exam.attempts.map((attempt, index) => (
                            <div key={attempt.id || index} className="p-3 border border-[#DCDEDD] rounded-[12px] hover:shadow-lg transition-all duration-300 hover:border-[#EF3F09]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-[60px]">
                                  <div className="flex items-center gap-4">
                                    <img 
                                      src={attempt.student?.photo || "https://via.placeholder.com/48"} 
                                      alt={attempt.student?.name || "Student"} 
                                      className="w-12 h-12 rounded-full object-cover" 
                                    />
                                    <div>
                                      <h5 className="text-brand-dark text-base font-semibold">
                                        {attempt.student?.name || "Student Name"}
                                      </h5>
                                      <p className="text-gray-500 text-sm">
                                        {attempt.student?.email || "student@example.com"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-gray-500 text-xs">Status</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                      attempt.is_completed 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {attempt.is_completed ? 'Completed' : 'In Progress'}
                                    </span>
                                  </div>
                                  <div className="text-center ml-[60px]">
                                    <p className="text-gray-500 text-xs">
                                      {attempt.is_completed ? 'Result' : 'Progress'}
                                    </p>
                                    {attempt.is_completed ? (
                                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                        attempt.has_passed 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {attempt.has_passed ? 'Passed' : 'Not Passed'}
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                        -
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-center">
                                    <p className="text-gray-500 text-xs">Score</p>
                                    <p className="text-brand-dark text-lg font-bold">
                                      {attempt.points_earned}/{attempt.total_points}
                                    </p>
                                  </div>
                                  {(isManager || isTeacher) && (
                                    <button 
                                      onClick={() => navigate(`/dashboard/exams/${exam.id}/students/${attempt.student_id}/answers`)}
                                      className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 text-[#0C1C3C]"
                                    >
                                      View Answers
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No exam attempts yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Student attempts will appear here when they start taking the exam.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rewards Tab Content - Placeholder */}
                  {activeTab === 'rewards' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-brand-dark text-lg font-bold">Reward System</h4>
                      </div>
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-8 h-8 text-gray-400" />
                        </div>
                        <h5 className="text-gray-500 text-lg font-medium mb-2">Coming Soon</h5>
                        <p className="text-gray-400 text-sm">Reward management system will be available soon.</p>
                      </div>
                    </div>
                  )}

                  {/* Certificate Tab Content - Placeholder */}
                  {activeTab === 'certificate' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-brand-dark text-lg font-bold">Certificates</h4>
                      </div>
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h5 className="text-gray-500 text-lg font-medium mb-2">Coming Soon</h5>
                        <p className="text-gray-400 text-sm">Certificate management system will be available soon.</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Question Creation Modal */}
      {questionModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseQuestionModal();
            }
          }}
        >
          <div className="bg-white border border-[#DCDEDD] rounded-[20px] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-brand-dark text-xl font-bold">
                  {isViewMode ? "View Question Details" : isEditMode ? "Edit Question" : "Create New Question"}
                </h2>
                <button
                  onClick={handleCloseQuestionModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmitQuestion}
                className="space-y-6"
              >
                {/* Question Text */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Question Text <span className="text-[#EF3F09]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={questionFormData.name}
                    onChange={(e) => !isViewMode && handleFormInputChange("name", e.target.value)}
                    readOnly={isViewMode}
                    className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] transition-all duration-300 font-semibold resize-vertical ${
                      isViewMode 
                        ? "bg-gray-50 cursor-default" 
                        : "focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09]"
                    }`}
                    placeholder={isViewMode ? "" : "Enter your question text here..."}
                  />
                </div>

                {/* Question Type Selection */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Question Type <span className="text-[#EF3F09]">*</span>
                  </label>
                  <div className="flex gap-4">
                    {/* Multiple Choice Option */}
                    <label className={`group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 transition-all duration-300 ${
                      isViewMode ? 'cursor-default bg-gray-50' : 'cursor-pointer hover:border-[#EF3F09]'
                    } ${questionType === "multiple_choice" ? 'ring-2 ring-[#EF3F09] ring-offset-2' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                          <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                          <CheckCircle className="w-6 h-6 text-[#033C4B] relative z-10" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-brand-dark text-base font-semibold">Multiple Choice</p>
                          <p className="text-gray-500 text-sm">Options A, B, C, D</p>
                        </div>
                      </div>
                      <div className="relative flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 gap-2">
                        <input 
                          type="radio" 
                          name="questionType" 
                          value="multiple_choice" 
                          checked={questionType === "multiple_choice"}
                          onChange={(e) => !isViewMode && handleQuestionTypeChange(e.target.value)}
                          disabled={isViewMode}
                          className="hidden" 
                        />
                        <div className={`flex size-[18px] rounded-full shadow-sm border transition-all duration-300 ${
                          questionType === "multiple_choice" ? 'border-[5px] border-[#EF3F09]' : 'border-[#DCDEDD]'
                        }`}></div>
                        <p className="text-xs font-semibold">
                          {questionType === "multiple_choice" ? 'Selected' : 'Select'}
                        </p>
                      </div>
                    </label>

                    {/* Essay Option */}
                    <label className={`group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 transition-all duration-300 ${
                      isViewMode ? 'cursor-default bg-gray-50' : 'cursor-pointer hover:border-[#EF3F09]'
                    } ${questionType === "essay" ? 'ring-2 ring-[#EF3F09] ring-offset-2' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                          <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                          <FileText className="w-6 h-6 text-[#530000] relative z-10" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-brand-dark text-base font-semibold">Essay</p>
                          <p className="text-gray-500 text-sm">Open-ended text answer</p>
                        </div>
                      </div>
                      <div className="relative flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 gap-2">
                        <input 
                          type="radio" 
                          name="questionType" 
                          value="essay" 
                          checked={questionType === "essay"}
                          onChange={(e) => !isViewMode && handleQuestionTypeChange(e.target.value)}
                          disabled={isViewMode}
                          className="hidden" 
                        />
                        <div className={`flex size-[18px] rounded-full shadow-sm border transition-all duration-300 ${
                          questionType === "essay" ? 'border-[5px] border-[#EF3F09]' : 'border-[#DCDEDD]'
                        }`}></div>
                        <p className="text-xs font-semibold">
                          {questionType === "essay" ? 'Selected' : 'Select'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Points and Timer Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Points */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Points <span className="text-[#EF3F09]">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="points" 
                      value={questionFormData.points} 
                      onChange={(e) => !isViewMode && handleFormInputChange("points", parseInt(e.target.value))}
                      readOnly={isViewMode}
                      min="1" 
                      max="100"
                      className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] transition-all duration-300 font-semibold ${
                        isViewMode 
                          ? "bg-gray-50 cursor-default" 
                          : "focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09]"
                      }`} 
                    />
                  </div>
                  
                  {/* Timer */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Timer (minutes) <span className="text-[#EF3F09]">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="timer" 
                      value={questionFormData.timer} 
                      onChange={(e) => !isViewMode && handleFormInputChange("timer", parseInt(e.target.value))}
                      readOnly={isViewMode}
                      min="1" 
                      max="120"
                      className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] transition-all duration-300 font-semibold ${
                        isViewMode 
                          ? "bg-gray-50 cursor-default" 
                          : "focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09]"
                      }`} 
                    />
                  </div>
                </div>


                {/* Multiple Choice Options */}
                {questionType === "multiple_choice" && (
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((option, index) => (
                        <div key={option} className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-700 w-4">{option}.</span>
                          <input 
                            type="text" 
                            name={`option${option}`} 
                            value={questionFormData.options[index]?.name || ""}
                            onChange={(e) => !isViewMode && handleOptionChange(index, "name", e.target.value)}
                            readOnly={isViewMode}
                            placeholder={isViewMode ? "" : `Enter option ${option}...`}
                            className={`flex-1 px-3 py-2 border border-[#DCDEDD] rounded-[12px] transition-all duration-300 ${
                              isViewMode 
                                ? "bg-gray-50 cursor-default" 
                                : "focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09]"
                            }`} 
                          />
                          <label className={`group flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 transition-all duration-300 ${
                            isViewMode ? 'cursor-default' : 'cursor-pointer hover:border-green-500'
                          } ${questionFormData.options[index]?.is_correct ? 'border-green-500 bg-green-50' : ''}`}>
                            <input 
                              type="radio" 
                              name="correctAnswer" 
                              value={option} 
                              checked={questionFormData.options[index]?.is_correct || false}
                              onChange={() => !isViewMode && handleCorrectAnswerChange(index)}
                              disabled={isViewMode}
                              className="hidden" 
                            />
                            <p className={`text-xs font-semibold ${questionFormData.options[index]?.is_correct ? 'text-green-700' : 'text-gray-600'}`}>
                              Mark as Correct
                            </p>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </form>

              {/* Modal Footer */}
              <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={handleCloseQuestionModal} 
                  className="px-6 py-3 border border-[#DCDEDD] rounded-[16px] font-medium hover:border-[#EF3F09] transition-all duration-300 text-[#0C1C3C]"
                >
                  {isViewMode ? "Close" : "Cancel"}
                </button>
                
                {!isViewMode && (
                  <button 
                    type="button"
                    onClick={async (e) => {
                      console.log("Submit button clicked!");
                      // Call the handler directly instead of using form submission
                      await handleSubmitQuestion(e);
                    }}
                    disabled={isEditMode ? updateQuestion.isPending : createQuestion.isPending}
                    className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditMode ? (updateQuestion.isPending ? "Updating..." : "Update Question") : (createQuestion.isPending ? "Creating..." : "Create Question")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, questionId: null, questionName: "" })
        }
        onConfirm={handleDeleteQuestion}
        itemName={deleteModal.questionName}
        isLoading={deleteQuestion.isPending}
      />
    </div>
  );
};

export default ExamDetails;