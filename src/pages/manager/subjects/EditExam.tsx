import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronRight,
  ClipboardList,
  Info,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { ManagerSidebar, TeacherSidebar } from "../../../components/sidebars";
import { canEditSubjectExams } from "../../../utils/authUtils";
import { useFetchExam, useUpdateExam } from "../../../hooks/useExams";
import { updateSubjectExamSchema, type UpdateSubjectExamFormData } from "../../../schemas/examSchemas";
import { differenceInDays } from "date-fns";

const EditExam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === "manager";
  const isTeacher = role === "teacher";

  // Parse exam ID
  const examId = id ? parseInt(id, 10) : 0;

  // Fetch data
  const { data: exam, isLoading: examLoading, error: examError } = useFetchExam(examId);

  // Authorization check for teachers - ensure they can only edit exams for their own subjects
  useEffect(() => {
    if (exam?.subject && isTeacher && !canEditSubjectExams(user, exam.subject)) {
      navigate('/unauthorized');
    }
  }, [exam, isTeacher, user, navigate]);

  // Update exam mutation
  const updateExamMutation = useUpdateExam();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSubjectExamFormData>({
    resolver: zodResolver(updateSubjectExamSchema),
  });

  // Watch form values for duration calculation
  const startDate = watch("started_at");
  const endDate = watch("ended_at");

  // Populate form when exam data loads
  useEffect(() => {
    if (exam) {
      setValue("subject_id", exam.subject_id);
      setValue("name", exam.name);
      setValue("about", exam.about);
      setValue("started_at", exam.started_at.split('T')[0]); // Format for date input
      setValue("ended_at", exam.ended_at.split('T')[0]); // Format for date input
    }
  }, [exam, setValue]);

  // Calculate duration display
  const getDurationText = () => {
    if (!startDate || !endDate) return "-";
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = differenceInDays(end, start);
      
      if (days === 0) {
        return "Same day exam";
      } else if (days === 1) {
        return "1 day";
      } else {
        return `${days} days`;
      }
    } catch {
      return "-";
    }
  };

  // Handle form submission
  const onSubmit = async (data: UpdateSubjectExamFormData) => {
    try {
      await updateExamMutation.mutateAsync({ 
        id: examId, 
        ...data 
      });
      toast.success("Exam updated successfully!");
      
      // Navigate back to subject exams page
      if (exam?.subject_id) {
        navigate(`/dashboard/subjects/${exam.subject_id}/exams`);
      } else {
        navigate(-1); // Fallback to previous page
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && error.response.data &&
        typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : "Failed to update exam";
      toast.error(errorMessage);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (exam?.subject_id) {
      navigate(`/dashboard/subjects/${exam.subject_id}/exams`);
    } else {
      navigate(-1); // Fallback to previous page
    }
  };

  // Loading state
  if (examLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          {isManager && <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          {isTeacher && <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
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

  // Error state
  if (examError || !exam) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-screen">
          {isManager && <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          {isTeacher && <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
          <div className="flex-1 ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Not Found</h2>
                <p className="text-gray-600 mb-4">The exam you're trying to edit could not be found.</p>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {isManager && <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        {isTeacher && <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

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
                <Link
                  to={`/dashboard/subjects/${exam.subject_id}/exams`}
                  className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
                >
                  Subject Exams
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">
                  {exam.name}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-brand-dark font-medium">Edit Exam</span>
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
                    <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Edit Exam Details</h1>
                    <p className="text-brand-dark text-base font-normal">Update exam information and settings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Exam Details</h3>
              </div>
              <div className="flex gap-4">
                {/* Left Side - Form Fields */}
                <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-320px)]">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Hidden subject_id field */}
                    <input type="hidden" {...register("subject_id")} />

                    {/* Exam Name */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">
                        Exam Name <span className="text-[#EF3F09]">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("name")}
                        className={`w-full px-4 py-3 border rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                          errors.name ? "border-red-500" : "border-[#DCDEDD]"
                        }`}
                        placeholder="Enter exam name (e.g., Midterm Algebra Test)"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    {/* About Exam */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">
                        About Exam
                      </label>
                      <textarea
                        {...register("about")}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                          errors.about ? "border-red-500" : "border-[#DCDEDD]"
                        }`}
                        placeholder="Describe the exam purpose, scope, and objectives..."
                      />
                      {errors.about && (
                        <p className="mt-1 text-sm text-red-600">{errors.about.message}</p>
                      )}
                    </div>

                    {/* Total Points */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">
                        Total Points
                      </label>
                      <input
                        type="number"
                        disabled
                        className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] bg-gray-100 text-gray-500 cursor-not-allowed font-semibold"
                        placeholder="Will be calculated automatically"
                        value="100"
                      />
                      
                      {/* Info Callout */}
                      <div className="mt-3 p-3 rounded-[12px] bg-[#D8B0FF] border border-[#B794F6]">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#3A0962]" />
                          <p className="text-sm text-[#3A0962]">
                            <span className="font-semibold">Auto-calculated:</span> Total points will be automatically determined by the sum of all question points when you add questions to this exam.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date and Time Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Start Date */}
                      <div>
                        <label className="block text-brand-dark text-sm font-semibold mb-2">
                          Start Date <span className="text-[#EF3F09]">*</span>
                        </label>
                        <input
                          type="date"
                          {...register("started_at")}
                          className={`w-full px-4 py-3 border rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                            errors.started_at ? "border-red-500" : "border-[#DCDEDD]"
                          }`}
                        />
                        {errors.started_at && (
                          <p className="mt-1 text-sm text-red-600">{errors.started_at.message}</p>
                        )}
                      </div>

                      {/* End Date */}
                      <div>
                        <label className="block text-brand-dark text-sm font-semibold mb-2">
                          End Date <span className="text-[#EF3F09]">*</span>
                        </label>
                        <input
                          type="date"
                          {...register("ended_at")}
                          className={`w-full px-4 py-3 border rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                            errors.ended_at ? "border-red-500" : "border-[#DCDEDD]"
                          }`}
                        />
                        {errors.ended_at && (
                          <p className="mt-1 text-sm text-red-600">{errors.ended_at.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Duration Display */}
                    {startDate && endDate && (
                      <div className="flex items-center gap-2 px-5 py-[14px] bg-[#276874] rounded-[20px]">
                        <Calendar className="w-4 h-4 text-white" />
                        <span className="text-white text-base font-medium">
                          Exam Period: <span>{getDurationText()}</span>
                        </span>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end items-center gap-4 pt-3">
                      <button 
                        type="button" 
                        onClick={handleCancel}
                        className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-6 py-3"
                      >
                        <span className="text-brand-dark text-base font-medium">Cancel</span>
                      </button>
                      
                      <button 
                        type="submit"
                        disabled={isSubmitting || updateExamMutation.isPending}
                        className="btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-brand-white text-base font-semibold">
                          {isSubmitting || updateExamMutation.isPending ? "Updating..." : "Update Exam"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Side - Subject Details */}
                <div className="w-[300px] space-y-4">
                  {/* Subject Details Card */}
                  <div className="bg-white rounded-[20px] px-6 py-6">
                    <h4 className="text-brand-dark text-sm font-semibold mb-4">Subject Information</h4>
                    {exam?.subject && (
                      <>
                        <div className="mb-4">
                          <img 
                            src={exam.subject.photo || "https://via.placeholder.com/300x128"}
                            alt={exam.subject.name}
                            className="w-full h-32 object-cover rounded-[12px] mb-3"
                          />
                          <h5 className="text-brand-dark text-base font-semibold">{exam.subject.name}</h5>
                          <p className="text-gray-500 text-sm mb-2">{exam.subject.topic?.name || "General Topic"}</p>
                        </div>
                        
                        {/* Teacher Info */}
                        {exam.subject.teacher && (
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={exam.subject.teacher.photo || "https://via.placeholder.com/40"}
                                alt={exam.subject.teacher.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <p className="text-brand-dark text-sm font-semibold">{exam.subject.teacher.name}</p>
                                <p className="text-gray-500 text-xs">Subject Teacher</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EditExam;