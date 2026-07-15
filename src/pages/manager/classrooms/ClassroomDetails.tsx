import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  School,
  ArrowLeft,
  Edit,
  ChevronRight,
  BookOpen,
  Users,
  Trophy,
  Plus,
  UserPlus,
  ClipboardList,
  XCircle,
  UserCog,
  CheckCircle,
  Clock,
  Eye,
  Download,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
  useFetchClassroom, 
  useUnassignSubject,
  useUnenrollStudent,
  useManageStudent,
} from "../../../hooks/useClassrooms";
import {
  ManagerSidebar,
  TeacherSidebar,
  StudentSidebar,
} from "../../../components/sidebars";
import { ManageStudentModal } from "../../../components/modals";
import type { Subject, Student, ManageStudentModalData, ManageStudentRequest, ApiError } from "../../../types";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { canManageSubjectExams } from "../../../utils/authUtils";

type TabType = "subjects" | "students" | "challenges" | "homeworks" | "others";

const ClassroomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>("subjects");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unassignModal, setUnassignModal] = useState<{
    isOpen: boolean;
    type: "subject" | "student";
    item: Subject | Student | null;
  }>({
    isOpen: false,
    type: "subject",
    item: null,
  });
  const [manageStudentModal, setManageStudentModal] = useState<{
    isOpen: boolean;
    data: ManageStudentModalData | null;
  }>({
    isOpen: false,
    data: null,
  });

  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === "manager";
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  // Parse classroom ID
  const classroomId = id ? parseInt(id, 10) : 0;

  // Fetch data
  const { data: classroom, isLoading: classroomLoading } =
    useFetchClassroom(classroomId); 

  // Extract subjects and students from classroom data
  const subjects = classroom?.class_subjects?.map((cs) => cs.subject).filter(Boolean) || [];
  const students = classroom?.class_students?.map((cs) => cs.student).filter(Boolean) || [];
  const subjectsLoading = classroomLoading;
  const studentsLoading = classroomLoading;

  // Mutations
  const { mutate: unassignSubject, isPending: unassigningSubject } =
    useUnassignSubject();
  const { mutate: unenrollStudent, isPending: unenrollingStudent } =
    useUnenrollStudent();
  const { mutate: manageStudent, isPending: managingStudent } =
    useManageStudent();

  // Render appropriate sidebar based on role
  const renderSidebar = () => {
    if (isManager) {
      return (
        <ManagerSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      );
    } else if (isTeacher) {
      return (
        <TeacherSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      );
    } else if (isStudent) {
      return (
        <StudentSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      );
    }
    return null;
  };

  // Tab switching function
  const switchTab = (tabName: TabType) => {
    setActiveTab(tabName);
  };

  // Handle unassign actions
  const handleUnassignSubject = (subject: Subject) => {
    setUnassignModal({
      isOpen: true,
      type: "subject",
      item: subject,
    });
  };

  const handleUnenrollStudent = (student: Student) => {
    setUnassignModal({
      isOpen: true,
      type: "student",
      item: student,
    });
  };

  const confirmUnassign = async () => {
    if (!unassignModal.item) return;

    // Add small delay to ensure modal is fully rendered before processing
    await new Promise(resolve => setTimeout(resolve, 100));

    if (unassignModal.type === "subject") {
      const subject = unassignModal.item as Subject;
      unassignSubject(
        { classroomId, subjectId: subject.id },
        {
          onSuccess: () => {
            toast.success("Subject unassigned successfully!");
            // Add delay before closing modal to ensure success state is processed
            setTimeout(() => {
              setUnassignModal({ isOpen: false, type: "subject", item: null });
            }, 300);
          },
          onError: (error: unknown) => {
            const errorMessage =
              (error as AxiosError<ApiError>).response?.data?.message || "Failed to unassign subject";
            toast.error(errorMessage);
            // Keep modal open on error but reset loading state
            setTimeout(() => {
              // Modal stays open but button becomes clickable again
            }, 500);
          },
        }
      );
    } else {
      const student = unassignModal.item as Student;
      unenrollStudent(
        { classroomId, studentId: student.id },
        {
          onSuccess: () => {
            toast.success("Student unenrolled successfully!");
            // Add delay before closing modal to ensure success state is processed
            setTimeout(() => {
              setUnassignModal({ isOpen: false, type: "student", item: null });
            }, 300);
          },
          onError: (error: unknown) => {
            const errorMessage =
              (error as AxiosError<ApiError>).response?.data?.message || "Failed to unenroll student";
            toast.error(errorMessage);
            // Keep modal open on error but reset loading state
            setTimeout(() => {
              // Modal stays open but button becomes clickable again
            }, 500);
          },
        }
      );
    }
  };

  const closeUnassignModal = () => {
    // Prevent closing modal while processing
    if (unassigningSubject || unenrollingStudent) {
      return;
    }
    setUnassignModal({ isOpen: false, type: "subject", item: null });
  };

  // Handle manage student actions
  const handleManageStudent = (student: Student) => {
    // Find the ClassStudent record for this student in this classroom
    const classStudent = classroom?.class_students?.find(
      (cs) => cs.student?.id === student.id
    );

    if (!classStudent) {
      toast.error("Student enrollment data not found");
      return;
    }

    const modalData: ManageStudentModalData = {
      student,
      classStudent,
    };

    setManageStudentModal({
      isOpen: true,
      data: modalData,
    });
  };

  const closeManageStudentModal = () => {
    // Prevent closing modal while processing
    if (managingStudent) {
      return;
    }
    setManageStudentModal({ isOpen: false, data: null });
  };

  const handleSaveStudentChanges = (request: ManageStudentRequest) => {
    manageStudent(request, {
      onSuccess: () => {
        toast.success("Student status updated successfully!");
        closeManageStudentModal();
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as AxiosError<ApiError>).response?.data?.message || "Failed to update student status";
        toast.error(errorMessage);
      },
    });
  };

  // Handle download lesson for students
  const handleDownloadLesson = (subject: Subject) => {
    console.log('Download lesson for subject:', subject.name);
    console.log('Subject content URL:', subject.content);
    
    if (subject.content) {
      // Create a temporary link element for download
      const link = document.createElement('a');
      link.href = subject.content;
      link.download = `${subject.name}_lesson.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Lesson download started!');
    } else {
      console.warn('No content field found for subject:', subject);
      toast.error('No lesson content available for download');
    }
  };

  // Loading state
  if (classroomLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EF3F09]"></div>
          <p className="mt-4 text-gray-600">Loading classroom details...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!classroom) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Classroom Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The classroom you're looking for doesn't exist.
          </p>
          <Link
            to="/dashboard/classrooms"
            className="text-[#EF3F09] hover:underline"
          >
            Return to Classrooms List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Conditional Sidebar Rendering */}
      {renderSidebar()}

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
                to="/dashboard/classrooms"
                className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
              >
                Classrooms
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-brand-dark font-medium">
                Classroom Details
              </span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[26px]"></div>
                  <School className="w-10 h-10 text-[#0C1C3C] relative z-10" />
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">
                    {classroom.name}
                  </h1>
                  <p className="text-brand-dark text-base font-normal">
                    View and manage classroom information
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/classrooms")}
                  className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0C1C3C]" />
                  <span className="text-[#0C1C3C]">Back</span>
                </button>
                {isManager && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/dashboard/classrooms/${classroomId}/edit`)
                    }
                    className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4 text-[#0C1C3C]" />
                    <span className="text-[#0C1C3C]">Edit Classroom</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            {/* Total Subjects */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Total Subjects
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      { subjects?.length || 0}
                    </p>
                    <p className="text-success text-sm font-medium">
                      Assigned subjects
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <BookOpen className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enrolled Students */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Enrolled Students
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {students?.length || 0}
                    </p>
                    <p className="text-success text-sm font-medium">
                      Active students
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                    <Users className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pass Rate */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Pass Rate
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      85%
                    </p>
                    <p className="text-success text-sm font-medium">
                      Overall success rate
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                    <Trophy className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section with Tabs */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
            <div className="mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">
                Classroom Information
              </h3>
            </div>
            <div className="flex gap-4">
              {/* Tab Content */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-full">
                {/* Tab Navigation */}
                <div className="mb-6">
                  <nav className="flex space-x-2">
                    {[
                      { id: "subjects", label: "Subjects" },
                      { id: "students", label: "Students" },
                      { id: "challenges", label: "Challenges" },
                      { id: "homeworks", label: "Homeworks" },
                      { id: "others", label: "Others" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => switchTab(tab.id as TabType)}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                          activeTab === tab.id
                            ? "bg-[#EF3F09] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-[#0C1C3C] hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content Areas */}
                {/* Subjects Tab Content */}
                {activeTab === "subjects" && (
                  <div className="tab-content">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-brand-dark text-lg font-bold">
                        Subjects
                      </h3>
                      {isManager && (
                        <Link
                          to={`/dashboard/classrooms/${classroomId}/assign-subjects`}
                          className="px-4 py-2 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Assign Subject
                        </Link>
                      )}
                    </div>

                    {subjectsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF3F09] mx-auto"></div>
                        <p className="mt-2 text-gray-600">
                          Loading subjects...
                        </p>
                      </div>
                    ) : subjects && subjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects
                          .filter((subject) => subject != null)
                          .map((subject) => (
                            <div
                              key={subject.id}
                              className="border border-[#DCDEDD] rounded-[12px] flex flex-col"
                            >
                              <div className="p-4 flex gap-4">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={
                                      subject.photo ||
                                      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f"
                                    }
                                    alt={subject.name}
                                    className="w-28 h-20 object-cover rounded-[8px]"
                                  />
                                  <span className="absolute bottom-1 left-1 text-[#0C1C3C] text-xs font-semibold bg-[#C5E151] px-1 py-0.5 rounded shadow-lg">
                                    {subject.topic?.name || "Subject"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-brand-dark text-base font-semibold mb-1">
                                    {subject.name}
                                  </h5>
                                  <div className="flex items-center gap-1 mb-2">
                                    <ClipboardList className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600 text-sm">
                                      {subject.subject_exams_count || 0} Exams
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={
                                        subject.teacher?.photo ||
                                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                                      }
                                      alt={subject.teacher?.name || "Teacher"}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-gray-500 text-xs">
                                      {subject.teacher?.name ||
                                        "No teacher assigned"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="border-t border-gray-200 p-3">
                                <div className="grid grid-cols-2 gap-2">
                                  {isStudent ? (
                                    <>
                                      {/* Student View: View Exams */}
                                      <button
                                        type="button"
                                        onClick={() => navigate(`/dashboard/subjects/${subject.id}/exams`)}
                                        className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1"
                                      >
                                        <Eye className="w-4 h-4 text-[#0C1C3C]" />
                                        <span className="text-[#0C1C3C]">
                                          View Exams
                                        </span>
                                      </button>
                                      {/* Student View: Download Lesson */}
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadLesson(subject)}
                                        className="px-3 py-2 border border-blue-300 rounded-[8px] text-sm font-medium hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-1 hover:bg-blue-50"
                                      >
                                        <Download className="w-4 h-4 text-blue-600" />
                                        <span className="text-blue-600">
                                          Download Lesson
                                        </span>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {/* Manager/Teacher View: Manage Exams */}
                                      {canManageSubjectExams(user, subject) ? (
                                        <button
                                          type="button"
                                          onClick={() => navigate(`/dashboard/subjects/${subject.id}/exams`)}
                                          className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1"
                                        >
                                          <ClipboardList className="w-4 h-4 text-[#0C1C3C]" />
                                          <span className="text-[#0C1C3C]">
                                            Manage Exams
                                          </span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          disabled
                                          className="px-3 py-2 border border-gray-300 bg-gray-100 rounded-[8px] text-sm font-medium cursor-not-allowed flex items-center justify-center gap-1"
                                        >
                                          <ClipboardList className="w-4 h-4 text-gray-400" />
                                          <span className="text-gray-400">
                                            Manage Exams
                                          </span>
                                        </button>
                                      )}
                                      {isManager ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUnassignSubject(subject)
                                          }
                                          className="px-3 py-2 border border-red-300 rounded-[8px] text-sm font-medium hover:border-red-500 transition-all duration-300 flex items-center justify-center gap-1 hover:bg-red-50"
                                        >
                                          <XCircle className="w-4 h-4 text-red-600" />
                                          <span className="text-red-600">
                                            Unassign Subject
                                          </span>
                                        </button>
                                      ) : (
                                        canManageSubjectExams(user, subject) ? (
                                          <button
                                            type="button"
                                            onClick={() => navigate(`/dashboard/subjects/${subject.id}/edit`)}
                                            className="px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1"
                                          >
                                            <Edit className="w-4 h-4 text-[#0C1C3C]" />
                                            <span className="text-[#0C1C3C]">
                                              Edit Subject
                                            </span>
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            disabled
                                            className="px-3 py-2 border border-gray-300 bg-gray-100 rounded-[8px] text-sm font-medium cursor-not-allowed flex items-center justify-center gap-1"
                                          >
                                            <Edit className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-400">
                                              Edit Subject
                                            </span>
                                          </button>
                                        )
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No subjects assigned
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Start by assigning subjects to this classroom.
                        </p>
                        {isManager && (
                          <Link
                            to={`/dashboard/classrooms/${classroomId}/assign-subjects`}
                          >
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300"
                            >
                              <Plus className="w-4 h-4" />
                              Assign Subject
                            </button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Students Tab Content */}
                {activeTab === "students" && (
                  <div className="tab-content">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-brand-dark text-lg font-bold">
                        Students
                      </h3>
                      {isManager && (
                        <Link
                          to={`/dashboard/classrooms/${classroomId}/assign-students`}
                        >
                          <button
                            type="button"
                            className="px-4 py-2 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Assign Student
                          </button>
                        </Link>
                      )}
                    </div>

                    {studentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF3F09] mx-auto"></div>
                        <p className="mt-2 text-gray-600">
                          Loading students...
                        </p>
                      </div>
                    ) : students && students.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {students.map((student) => {
                          // Safety check - student should exist due to filter, but add null check for TypeScript
                          if (!student) return null;
                          
                          // Find the ClassStudent record for this student to get status
                          const classStudent = classroom?.class_students?.find(
                            (cs) => cs.student?.id === student.id
                          );
                          const hasPassed = classStudent?.has_passed;
                          
                          return (
                            <div
                              key={student.id}
                              className="border border-[#DCDEDD] rounded-[12px] flex flex-col"
                            >
                              <div className="p-4">
                                <img
                                  src={
                                    student.photo ||
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                                  }
                                  alt={student.name}
                                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                                />
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-left">
                                    <h5 className="text-brand-dark text-sm font-semibold mb-1">
                                      {student.name}
                                    </h5>
                                    <div className="flex items-center gap-1">
                                      {hasPassed ? (
                                        <>
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          <p className="text-green-600 text-sm font-medium">
                                            Passed
                                          </p>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-4 h-4 text-blue-600" />
                                          <p className="text-blue-600 text-sm font-medium">
                                            In Progress
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Active
                                  </span>
                                </div>
                              </div>
                            {isManager && (
                              <div className="border-t border-gray-200 p-3 space-y-2">
                                <button 
                                  onClick={() => handleManageStudent(student)}
                                  className="w-full px-3 py-2 border border-[#DCDEDD] rounded-[8px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center justify-center gap-1"
                                >
                                  <UserCog className="w-4 h-4 text-[#0C1C3C]" />
                                  <span className="text-[#0C1C3C]">
                                    Manage Student
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleUnenrollStudent(student)
                                  }
                                  className="w-full px-3 py-2 border border-red-300 rounded-[8px] text-sm font-medium hover:border-red-500 transition-all duration-300 flex items-center justify-center gap-1 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-red-600">
                                    Unassign Student
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No students enrolled
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Start by enrolling students to this classroom.
                        </p>
                        {isManager && (
                          <Link
                            to={`/dashboard/classrooms/${classroomId}/assign-students`}
                          >
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300"
                            >
                              <UserPlus className="w-4 h-4" />
                              Assign Student
                            </button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Other Tabs Placeholder Content */}
                {(activeTab === "challenges" ||
                  activeTab === "homeworks" ||
                  activeTab === "others") && (
                  <div className="tab-content">
                    <div className="text-center py-12">
                      <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                        Section
                      </h3>
                      <p className="text-gray-600">
                        This section will be available in future updates.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Unassign Modal */}
      {unassignModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#DCDEDD]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-[12px] flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-brand-dark text-xl font-bold">
                      {unassignModal.type === "subject"
                        ? "Unassign Subject"
                        : "Unenroll Student"}
                    </h3>
                    <p className="text-brand-dark text-sm font-normal">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeUnassignModal}
                  className="w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#EF3F09] transition-all duration-200"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <p className="text-gray-600 text-base mb-6 text-center">
                Are you sure you want to{" "}
                {unassignModal.type === "subject" ? "unassign" : "unenroll"}{" "}
                <span className="font-semibold text-brand-dark">
                  "{unassignModal.item?.name}"
                </span>
                ?
              </p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={closeUnassignModal}
                  className="btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] transition-all duration-300 px-6 py-3"
                >
                  <span className="text-brand-dark text-base font-medium">
                    Cancel
                  </span>
                </button>
                <button
                  onClick={confirmUnassign}
                  disabled={unassigningSubject || unenrollingStudent}
                  className={`btn-secondary bg-red-600 hover:bg-red-700 rounded-[12px] transition-all duration-300 px-6 py-3 flex items-center gap-2 ${
                    unassigningSubject || unenrollingStudent
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg"
                  }`}
                  data-testid="confirm-unassign-button"
                >
                  {(unassigningSubject || unenrollingStudent) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span className="text-white text-base font-semibold">
                    {unassigningSubject || unenrollingStudent
                      ? "Processing..."
                      : "Confirm"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Student Modal */}
      <ManageStudentModal
        isOpen={manageStudentModal.isOpen}
        data={manageStudentModal.data}
        onClose={closeManageStudentModal}
        onSave={handleSaveStudentChanges}
        isLoading={managingStudent}
      />
    </div>
  );
};

export default ClassroomDetails;
