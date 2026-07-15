import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ClipboardList,
  Calendar,
  Users,
  Settings,
  Edit,
  Trash2,
  Eye,
  Share2,
  FileText,
  PlayCircle,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from "../../../components/sidebars";
import { canManageSubjectExams } from "../../../utils/authUtils";
import { DeleteConfirmationModal } from "../../../components/modals";
import { useFetchSubject } from "../../../hooks/useSubjects";
import {
  useFetchExamsBySubject,
  useFetchStudentExamsBySubject,
  useDeleteExam,
} from "../../../hooks/useExams";
import { format } from "date-fns";
import type { SubjectExam } from "../../../types/exams";
import type { AxiosError } from "axios";

const SubjectExams = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    examId: number | null;
    examName: string;
  }>({
    isOpen: false,
    examId: null,
    examName: "",
  });

  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === "manager";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  // Parse subject ID
  const subjectId = id ? parseInt(id, 10) : 0;

  // Fetch data
  const { data: subject, isLoading: subjectLoading } =
    useFetchSubject(subjectId);
  
  // Use different endpoints based on user role
  const studentExamsQuery = useFetchStudentExamsBySubject(isStudent ? subjectId : 0);
  const regularExamsQuery = useFetchExamsBySubject(!isStudent ? subjectId : 0);
  
  const { data: exams, isLoading: examsLoading } = isStudent 
    ? studentExamsQuery
    : regularExamsQuery;

  // Delete exam mutation
  const deleteExamMutation = useDeleteExam();

  // Authorization check for teachers - ensure they can only manage their own subjects
  const canManageThisSubject = canManageSubjectExams(user, subject || null);
  
  // Redirect unauthorized teachers
  useEffect(() => {
    if (subject && isTeacher && !canManageThisSubject) {
      navigate('/unauthorized');
    }
  }, [subject, isTeacher, canManageThisSubject, navigate]);

  // Calculate exam statistics
  const activeExams = (exams && Array.isArray(exams)) ? exams.filter((exam) => {
    const now = new Date();
    const startDate = new Date(exam.started_at);
    const endDate = new Date(exam.ended_at);
    return now >= startDate && now <= endDate;
  }).length : 0;

  // Handle delete exam
  const handleDeleteExam = () => {
    if (deleteModal.examId) {
      deleteExamMutation.mutate(deleteModal.examId, {
        onSuccess: () => {
          toast.success("Exam deleted successfully");
          setDeleteModal({ isOpen: false, examId: null, examName: "" });
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError;
          toast.error(
            (axiosError.response?.data as { message?: string })?.message || "Failed to delete exam"
          );
        },
      });
    }
  };

  // Get exam status using backend student_status field
  const getExamStatus = (exam: SubjectExam) => {
    const today = new Date();
    const endDate = new Date(exam.ended_at);
    
    // Set times to 00:00:00 for date-only comparison
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // For students, use the student_status field from backend
    if (isStudent && exam.student_status) {
      if (exam.student_status === "completed") {
        return { status: "Completed", color: "blue" };
      }
      
      // Check if exam is past due date
      if (today.getTime() > endDate.getTime()) {
        return { status: "Closed", color: "red" };
      }
      
      // Exam is still active
      return { status: "Active", color: "green" };
    }
    
    // Fallback for managers/teachers (keep existing logic)
    if (today.getTime() > endDate.getTime()) {
      return { status: "Closed", color: "red" };
    }
    
    // For managers/teachers, we can't determine completion status from SubjectExam alone
    // This would require additional data or different logic
    
    return { status: "Active", color: "green" };
  };

  // Loading state
  if (subjectLoading || examsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          {isManager && <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          {isTeacher && <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          {isStudent && <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          <div className="flex-1 ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF3F09] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading exam data...</p>
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
        {/* Sidebar */}
        {isManager && <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        {isTeacher && <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        {isStudent && <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Content */}
          <main className="main-content flex-1 p-5">
          {/* Breadcrumb */}
          <div className="mt-[50px] mb-4 ml-[50px]">
            <nav className="flex items-center gap-2 text-sm">
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
              <span className="text-brand-dark font-medium">Subject Exams</span>
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
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">
                    Final Subject Exams
                  </h1>
                  <p className="text-brand-dark text-base font-normal">
                    Manage exams and assessments for this subject
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0C1C3C]" />
                  <span className="text-[#0C1C3C]">Back</span>
                </button>
                {canManageThisSubject && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/dashboard/subjects/${subjectId}/exams/add`)
                    }
                    className="px-4 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Exam
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
            <div className="mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">
                Subject Final Exams
              </h3>
            </div>
            <div className="flex gap-4">
              {/* Left Side - Subject Info & Exams */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-284px)]">
                {/* Subject Basic Info */}
                <div className="mb-6 p-4 bg-gray-50 border border-[#DCDEDD] rounded-[16px]">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={subject?.photo || "https://via.placeholder.com/112x80"}
                        alt={subject?.name}
                        className="w-28 h-20 object-cover rounded-[8px]"
                      />
                      <span className="absolute bottom-1 left-1 text-[#0C1C3C] text-xs font-semibold bg-[#C5E151] px-1 py-0.5 rounded shadow-lg">
                        {subject?.topic?.name || "Topic"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-brand-dark text-lg font-bold mb-1">
                        {subject?.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ClipboardList className="w-4 h-4 text-gray-600" />
                          <span>{exams?.length || 0} Total Exams</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-gray-600" />
                          <span>{activeExams} Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exams List */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-brand-dark text-lg font-bold">
                      Exams ({(exams && Array.isArray(exams)) ? exams.length : 0})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(exams && Array.isArray(exams) && exams.length > 0) ? (
                      exams.map((exam) => {
                        const { status, color } = getExamStatus(exam);
                        const bgColors = {
                          green: "bg-[#C5E151]",
                          blue: "bg-[#82D9D7]",
                          red: "bg-[#FAAC7B]",
                        };
                        const statusColors = {
                          green: "bg-green-100 text-green-800",
                          blue: "bg-blue-100 text-blue-800",
                          red: "bg-red-100 text-red-800",
                        };
                        const dotColors = {
                          green: "bg-green-500",
                          blue: "bg-blue-500",
                          red: "bg-red-500",
                        };

                        return (
                          <div
                            key={exam.id}
                            className="p-4 border border-[#DCDEDD] rounded-[12px] hover:shadow-lg transition-all duration-300 hover:border-[#EF3F09]"
                          >
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden flex-shrink-0">
                                <div
                                  className={`w-full h-full absolute ${
                                    bgColors[color as keyof typeof bgColors]
                                  } rounded-[22px]`}
                                ></div>
                                <ClipboardList className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="text-brand-dark text-base font-semibold">
                                    {exam.name}
                                  </h5>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                      statusColors[
                                        color as keyof typeof statusColors
                                      ]
                                    }`}
                                  >
                                    <div
                                      className={`w-2 h-2 ${
                                        dotColors[
                                          color as keyof typeof dotColors
                                        ]
                                      } rounded-full`}
                                    ></div>
                                    {status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600 text-sm mb-2">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-gray-600" />
                                    <span>
                                      Due: {format(new Date(exam.ended_at), "MMM dd, yyyy")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-gray-600" />
                                    <span>{exam.attempts_count || 0} Total</span>
                                  </div>
                                  {(exam.completed_count || 0) > 0 && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-green-600">{exam.completed_count} Completed</span>
                                    </div>
                                  )}
                                  {(exam.in_progress_count || 0) > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4 text-orange-600" />
                                      <span className="text-orange-600">{exam.in_progress_count} In Progress</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {status === "Active" && (
                                <>
                                  {canManageThisSubject && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigate(
                                            `/dashboard/exams/${exam.id}`
                                          )
                                        }
                                        className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                      >
                                        <Settings className="w-4 h-4 text-[#0C1C3C]" />
                                        <span className="text-[#0C1C3C]">
                                          Manage Exam
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigate(
                                            `/dashboard/exams/${exam.id}/edit`
                                          )
                                        }
                                        className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                      >
                                        <Edit className="w-4 h-4 text-[#0C1C3C]" />
                                        <span className="text-[#0C1C3C]">
                                          Edit
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteModal({
                                            isOpen: true,
                                            examId: exam.id,
                                            examName: exam.name,
                                          })
                                        }
                                        className="px-3 py-2 border border-red-300 rounded-[8px] text-sm font-medium hover:border-red-500 transition-all duration-300 flex items-center justify-center gap-1 hover:bg-red-50 flex-1"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                        <span className="text-red-600">
                                          Delete
                                        </span>
                                      </button>
                                    </>
                                  )}
                                  {isStudent && (
                                    <>
                                      {exam.student_status === "in_progress" ? (
                                        // Student has started but not completed the exam
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              navigate(
                                                `/dashboard/exams/${exam.id}/guidelines`
                                              )
                                            }
                                            className="px-3 py-2 border border-blue-300 rounded-[8px] text-sm font-medium hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-1 hover:bg-blue-50 flex-1"
                                          >
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <span className="text-blue-600">
                                              Exam Guideline
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              navigate(
                                                `/dashboard/exams/${exam.id}/take`
                                              )
                                            }
                                            className="px-3 py-2 border border-[#EF3F09] bg-[#EF3F09] text-white rounded-[8px] text-sm font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                          >
                                            <PlayCircle className="w-4 h-4 text-white" />
                                            <span className="text-white">
                                              Continue Exam
                                            </span>
                                          </button>
                                        </>
                                      ) : (
                                        // Student hasn't started the exam yet
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              navigate(
                                                `/dashboard/exams/${exam.id}/guidelines`
                                              )
                                            }
                                            className="px-3 py-2 border border-blue-300 rounded-[8px] text-sm font-medium hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-1 hover:bg-blue-50 flex-1"
                                          >
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <span className="text-blue-600">
                                              Exam Guideline
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              navigate(
                                                `/dashboard/exams/${exam.id}/guidelines`
                                              )
                                            }
                                            className="px-3 py-2 border border-[#EF3F09] bg-[#EF3F09] text-white rounded-[8px] text-sm font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                          >
                                            <PlayCircle className="w-4 h-4 text-white" />
                                            <span className="text-white">
                                              Start Exam
                                            </span>
                                          </button>
                                        </>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              {status === "Completed" && (
                                <>
                                  {canManageThisSubject && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigate(
                                            `/dashboard/exams/${exam.id}/results`
                                          )
                                        }
                                        className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                      >
                                        <Share2 className="w-4 h-4 text-[#0C1C3C]" />
                                        <span className="text-[#0C1C3C]">
                                          Share Results
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigate(
                                            `/dashboard/exams/${exam.id}/students/${user?.id}/answers`
                                          )
                                        }
                                        className="px-3 py-2 bg-[#EF3F09] text-white rounded-[8px] text-sm font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                      >
                                        <Eye className="w-4 h-4 text-white" />
                                        <span className="text-white">
                                          View My Result
                                        </span>
                                      </button>
                                    </>
                                  )}
                                  {isStudent && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Placeholder for share functionality
                                          console.log('Share My Result clicked');
                                        }}
                                        className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                      >
                                        <Share2 className="w-4 h-4 text-[#0C1C3C]" />
                                        <span className="text-[#0C1C3C]">
                                          Share My Result
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigate(
                                            `/dashboard/student/exams/${exam.id}/results`
                                          )
                                        }
                                        className="px-3 py-2 bg-[#EF3F09] text-white rounded-[8px] text-sm font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                      >
                                        <Eye className="w-4 h-4 text-white" />
                                        <span className="text-white">
                                          View My Result
                                        </span>
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                              {status === "Closed" && (
                                <>
                                  {canManageThisSubject && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigate(
                                            `/dashboard/exams/${exam.id}/results`
                                          )
                                        }
                                        className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                      >
                                        <Share2 className="w-4 h-4 text-[#0C1C3C]" />
                                        <span className="text-[#0C1C3C]">
                                          View Results
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteModal({
                                            isOpen: true,
                                            examId: exam.id,
                                            examName: exam.name,
                                          })
                                        }
                                        className="px-3 py-2 border border-red-300 rounded-[8px] text-sm font-medium hover:border-red-500 transition-all duration-300 flex items-center justify-center gap-1 hover:bg-red-50 flex-1"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                        <span className="text-red-600">
                                          Delete
                                        </span>
                                      </button>
                                    </>
                                  )}
                                  {isStudent && (
                                    <>
                                      {/* Use student_status field for accurate button rendering */}
                                      {exam.student_status === "completed" ? (
                                        // Student completed the exam
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              navigate(
                                                `/dashboard/student/exams/${exam.id}/results`
                                              )
                                            }
                                            className="px-3 py-2 bg-[#EF3F09] text-white rounded-[8px] text-sm font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center justify-center gap-1 flex-1"
                                          >
                                            <Eye className="w-4 h-4 text-white" />
                                            <span className="text-white">
                                              View My Result
                                            </span>
                                          </button>
                                        </>
                                      ) : (
                                        // Student hasn't completed the closed exam
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              navigate(
                                                `/dashboard/exams/${exam.id}/guidelines`
                                              )
                                            }
                                            className="px-3 py-2 border border-blue-300 rounded-[8px] text-sm font-medium hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-1 hover:bg-blue-50 flex-1"
                                          >
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <span className="text-blue-600">
                                              View Guidelines
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            className="px-3 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-[8px] text-sm font-medium cursor-not-allowed flex items-center justify-center gap-1 flex-1"
                                            disabled
                                          >
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-500">
                                              Exam Closed
                                            </span>
                                          </button>
                                        </>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No exams available for this subject yet.
                        </p>
                        {canManageThisSubject && (
                          <button
                            onClick={() =>
                              navigate(`/dashboard/subjects/${subjectId}/exams/add`)
                            }
                            className="mt-4 px-4 py-2 bg-[#EF3F09] text-white rounded-[8px] font-medium hover:bg-[#d63507] transition-all duration-300 inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Create First Exam
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Teacher Info & Quick Actions */}
              <div className="w-[280px] space-y-4">
                {/* Teacher Information */}
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <h4 className="text-brand-dark text-sm font-semibold mb-4">
                    Subject Teacher
                  </h4>
                  {subject?.teacher ? (
                    <>
                      <div className="text-center">
                        <img
                          src={
                            subject.teacher.photo ||
                            "https://via.placeholder.com/64"
                          }
                          alt={subject.teacher.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                        />
                        <h5 className="text-brand-dark text-base font-semibold">
                          {subject.teacher.name}
                        </h5>
                        <p className="text-gray-500 text-sm mb-4">
                          {subject.teacher.email}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 mb-4"></div>

                      {/* Teacher Achievements */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-brand-dark text-xs font-semibold">
                            10+ years of mathematics teaching experience
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-brand-dark text-xs font-semibold">
                            PhD in Applied Mathematics from Stanford University
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-brand-dark text-xs font-semibold">
                            Excellence in Teaching Award recipient 2023
                          </p>
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
          </div>

          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, examId: null, examName: "" })
        }
        onConfirm={handleDeleteExam}
        itemName={deleteModal.examName}
        isLoading={deleteExamMutation.isPending}
      />
    </div>
  );
};

export default SubjectExams;