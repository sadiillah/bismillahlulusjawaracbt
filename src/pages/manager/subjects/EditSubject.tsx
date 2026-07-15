import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { 
  ChevronRight, 
  ChevronDown,
  GraduationCap,
  Sparkles,
  BookOpen,
  User,
  Image,
  X,
  Search,
  FileText
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchSubject, useUpdateSubject } from '../../../hooks/useSubjects';
import { useFetchTopicsPaginated } from '../../../hooks/useTopics';
import { useFetchTeachersPaginated } from '../../../hooks/useTeachers';
import { ManagerSidebar, TeacherSidebar } from '../../../components/sidebars';
import { z } from 'zod';

// Schema for updating subjects
const updateSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  tagline: z.string().optional(),
  about: z.string().optional(),
  topic_id: z.number().min(1, "Topic is required"),
  teacher_id: z.number().min(1, "Teacher is required"),
  photo: z
    .custom<File>((file) => file instanceof File || file === undefined, "Invalid photo file")
    .optional(),
  content: z
    .custom<File>((file) => file instanceof File || file === undefined, "Invalid content file")
    .optional(),
});

type UpdateSubjectFormData = z.infer<typeof updateSubjectSchema>;
import type { Topic, Teacher, ApiError } from '../../../types';

const EditSubject = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id);
  const { user } = useAuth();
  
  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Form state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [topicSearchQuery, setTopicSearchQuery] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  
  // Pagination states for modals
  const [topicCurrentPage, setTopicCurrentPage] = useState(1);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [teacherCurrentPage, setTeacherCurrentPage] = useState(1);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);

  // Hooks
  const { data: subject, isLoading: isSubjectLoading } = useFetchSubject(subjectId);
  const { mutate: updateSubject, isPending } = useUpdateSubject();
  const { 
    data: topicsPaginatedResponse, 
    isLoading: isLoadingTopics 
  } = useFetchTopicsPaginated(topicCurrentPage, 6, topicSearchQuery);
  const { 
    data: teachersPaginatedResponse, 
    isLoading: isLoadingTeachers 
  } = useFetchTeachersPaginated(teacherCurrentPage, 6, teacherSearchQuery);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<UpdateSubjectFormData>({
    resolver: zodResolver(updateSubjectSchema),
  });

  // Handle pagination and search for topics
  useEffect(() => {
    if (topicsPaginatedResponse?.data) {
      if (topicCurrentPage === 1) {
        // First page - replace existing topics (whether search or initial load)
        setAllTopics(topicsPaginatedResponse.data);
      } else {
        // Additional pages - append to existing topics (works for both search and normal pagination)
        setAllTopics(prev => [...prev, ...topicsPaginatedResponse.data]);
      }
    }
  }, [topicsPaginatedResponse, topicCurrentPage]);

  // Reset pagination when search changes
  useEffect(() => {
    setTopicCurrentPage(1);
    setAllTopics([]);
  }, [topicSearchQuery]);

  // Handle pagination and search for teachers
  useEffect(() => {
    if (teachersPaginatedResponse?.data) {
      if (teacherCurrentPage === 1) {
        // First page - replace existing teachers
        setAllTeachers(teachersPaginatedResponse.data);
      } else {
        // Additional pages - append to existing teachers
        setAllTeachers(prev => [...prev, ...teachersPaginatedResponse.data]);
      }
    }
  }, [teachersPaginatedResponse, teacherCurrentPage]);

  // Reset teacher pagination when search changes
  useEffect(() => {
    setTeacherCurrentPage(1);
    setAllTeachers([]);
  }, [teacherSearchQuery]);

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    // Always use accumulated topics (allTopics) which handles both search pagination and normal pagination
    return allTopics.length > 0 ? allTopics : (topicsPaginatedResponse?.data || []);
  }, [allTopics, topicsPaginatedResponse]);

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    // Always use accumulated teachers (allTeachers) which handles both search pagination and normal pagination
    return allTeachers.length > 0 ? allTeachers : (teachersPaginatedResponse?.data || []);
  }, [allTeachers, teachersPaginatedResponse]);

  // Pre-populate form when subject data is loaded
  useEffect(() => {
    if (subject && !isSubjectLoading) {
      // Authorization check for teachers - ensure they can only edit their own subjects
      if (isTeacher && subject.teacher?.id !== user?.id) {
        navigate('/unauthorized');
        return;
      }
      
      setValue('name', subject.name);
      setValue('tagline', subject.tagline || '');
      setValue('about', subject.about || '');
      setValue('topic_id', subject.topic?.id || 0);
      setValue('teacher_id', subject.teacher?.id || 0);
      
      // Set selected topic and teacher for display
      setSelectedTopic(subject.topic || null);
      setSelectedTeacher(subject.teacher || null);
      
      // Set image preview if exists
      if (subject.photo) {
        setImagePreview(subject.photo);
      }
      
      // Set PDF filename if exists
      if (subject.content && typeof subject.content === 'string') {
        const parts = subject.content.split('/');
        setPdfFileName(parts[parts.length - 1]);
      }
    }
  }, [subject, setValue, isTeacher, user?.id, navigate, isSubjectLoading]);

  // Render appropriate sidebar based on role
  const renderSidebar = () => {
    if (isManager) {
      return <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    } else if (isTeacher) {
      return <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    }
    return null;
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setValue('topic_id', topic.id);
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setValue('teacher_id', teacher.id);
  };

  const clearTopicSelection = () => {
    setSelectedTopic(null);
    setValue('topic_id', 0);
  };

  const clearTeacherSelection = () => {
    setSelectedTeacher(null);
    setValue('teacher_id', 0);
  };

  const removePhoto = () => {
    setImagePreview(null);
    setValue('photo', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePdf = () => {
    setPdfFileName("");
    setValue('content', undefined);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const previewPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setValue('photo', file);
    }
  };

  const previewPdf = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
      setValue('content', file);
    }
  };

  const onSubmit = (data: UpdateSubjectFormData) => {
    clearErrors('root');

    updateSubject({ id: subjectId, ...data }, {
      onSuccess: () => {
        navigate('/dashboard/subjects');
      },
      onError: (error: AxiosError<ApiError>) => {
        const errorMessage = error.response?.data?.message || 'Failed to update subject';
        setError('root', { type: 'server', message: errorMessage });
        
        // Handle field-specific errors if they exist
        const fieldErrors = error.response?.data?.errors;
        if (fieldErrors) {
          Object.entries(fieldErrors).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              setError(key as keyof UpdateSubjectFormData, {
                type: 'server',
                message: value[0],
              });
            }
          });
        }
      },
    });
  };

  // Loading state
  if (isSubjectLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EF3F09] mx-auto"></div>
          <p className="mt-4 text-brand-dark">Loading subject details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!subject) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-dark">Subject not found</p>
          <Link 
            to="/dashboard/subjects" 
            className="mt-4 inline-block text-[#EF3F09] hover:text-[#d63507]"
          >
            Back to Subjects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Conditional Sidebar Rendering */}
        {renderSidebar()}

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="main-content flex-1 p-5">
            {/* Breadcrumb */}
            <div className="mt-[50px] mb-4 ml-[50px]">
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/dashboard/overview" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Dashboard</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to="/dashboard/subjects" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Schools</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-brand-dark font-medium">Edit Subject</span>
              </nav>
            </div>

            {/* Page Header */}
            <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              <div className="flex items-center justify-between pl-2 pr-2">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[26px]"></div>
                    <GraduationCap className="w-10 h-10 text-[#324700] relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Edit Subject</h1>
                    <p className="text-brand-dark text-base font-normal">Update subject information and modify assignments</p>
                  </div>
                </div>
                <div>
                  <button type="button" className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[12px] font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Subject Details</h3>
              </div>
              <div className="flex gap-4">
                {/* Left Side - Form Fields */}
                <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-370px)]">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Root Error */}
                    {errors.root && (
                      <div className="bg-red-50 border border-red-200 rounded-[16px] p-4">
                        <p className="text-red-600 text-sm">{errors.root.message}</p>
                      </div>
                    )}

                    {/* Subject Name */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">
                        Subject Name <span className="text-[#EF3F09]">*</span>
                      </label>
                      <input 
                        type="text" 
                        {...register('name')}
                        className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                          errors.name ? 'border-red-300' : ''
                        }`}
                        placeholder="Enter subject name (e.g., Mathematics 101)"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">
                        Tagline
                      </label>
                      <input 
                        type="text" 
                        {...register('tagline')}
                        className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                          errors.tagline ? 'border-red-300' : ''
                        }`}
                        placeholder="Short description or tagline"
                      />
                      {errors.tagline && (
                        <p className="mt-2 text-sm text-red-600">{errors.tagline.message}</p>
                      )}
                    </div>

                    {/* Topic Selection */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">
                        Topic <span className="text-[#EF3F09]">*</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setIsTopicModalOpen(true)}
                        className={`w-full border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-3 text-left ${
                          errors.topic_id ? 'border-red-300' : ''
                        }`}
                      >
                        <BookOpen className="w-5 h-5 text-gray-400" />
                        <span className={`font-normal flex-1 ${
                          selectedTopic ? 'text-brand-dark' : 'text-gray-500'
                        }`}>
                          {selectedTopic ? selectedTopic.name : 'Select a topic'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      {errors.topic_id && (
                        <p className="mt-2 text-sm text-red-600">{errors.topic_id.message}</p>
                      )}

                      {/* Selected Topic Info Card */}
                      {selectedTopic && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-[12px] border border-[#DCDEDD]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 relative flex items-center justify-center rounded-[12px] overflow-hidden">
                              <div className="w-full h-full absolute bg-[#C5E151] rounded-[12px]"></div>
                              <BookOpen className="w-6 h-6 text-[#324700] relative z-10" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-brand-dark text-base font-semibold">{selectedTopic.name}</h4>
                              <p className="text-brand-dark text-sm">Selected topic</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={clearTopicSelection} 
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Teacher Assignment */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">
                        Assign Teacher <span className="text-[#EF3F09]">*</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => !isTeacher && setIsTeacherModalOpen(true)}
                        disabled={isTeacher}
                        className={`w-full border border-[#DCDEDD] rounded-[16px] transition-all duration-300 px-4 py-3 flex items-center gap-3 text-left ${
                          isTeacher 
                            ? 'cursor-not-allowed opacity-60 bg-gray-50' 
                            : 'hover:border-[#EF3F09] focus:border-[#EF3F09] cursor-pointer'
                        } ${errors.teacher_id ? 'border-red-300' : ''}`}
                      >
                        <User className="w-5 h-5 text-gray-400" />
                        <span className={`font-normal flex-1 ${
                          selectedTeacher ? 'text-brand-dark' : 'text-gray-500'
                        }`}>
                          {selectedTeacher ? selectedTeacher.name : 'Select a teacher'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      {errors.teacher_id && (
                        <p className="mt-2 text-sm text-red-600">{errors.teacher_id.message}</p>
                      )}

                      {/* Teacher Selection Card */}
                      {selectedTeacher && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-[12px] border border-[#DCDEDD]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                              <img 
                                src={selectedTeacher.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"} 
                                alt={selectedTeacher.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-brand-dark text-base font-semibold">{selectedTeacher.name}</h4>
                              <p className="text-brand-dark text-sm">{selectedTeacher.email}</p>
                            </div>
                            {!isTeacher && (
                              <button 
                                type="button" 
                                onClick={clearTeacherSelection} 
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* About Section */}
                    <div className="mb-0">
                      <label className="block text-brand-dark text-sm font-semibold mb-2">
                        About Subject
                      </label>
                      <textarea 
                        {...register('about')}
                        rows={4}
                        className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                          errors.about ? 'border-red-300' : ''
                        }`}
                        placeholder="Describe the subject, learning objectives, and course overview..."
                      />
                      {errors.about && (
                        <p className="mt-2 text-sm text-red-600">{errors.about.message}</p>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end items-center gap-4 pt-3">
                      <button 
                        type="button" 
                        onClick={() => navigate('/dashboard/subjects')}
                        className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-6 py-3"
                      >
                        <span className="text-brand-dark text-base font-medium">Cancel</span>
                      </button>
                      
                      <button 
                        type="submit"
                        disabled={isPending}
                        className="btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3"
                      >
                        <span className="text-brand-white text-base font-semibold">
                          {isPending ? 'Updating...' : 'Save Changes'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Side - Photo Upload */}
                <div className="w-[350px] bg-white rounded-[20px] px-6 py-6 h-fit">
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Subject Photo
                    </label>
                    <div className="relative">
                      <div 
                        className={`border-2 border-dashed border-[#DCDEDD] rounded-[16px] p-6 hover:border-[#EF3F09] transition-all duration-300 cursor-pointer ${
                          imagePreview ? 'hidden' : 'block'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                          <button type="button" className="mt-3 px-4 py-2 border border-[#DCDEDD] rounded-[12px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300">
                            Choose File
                          </button>
                        </div>
                      </div>
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Subject Photo" 
                            className="w-full h-48 object-cover rounded-[16px] border-2 border-[#DCDEDD]"
                          />
                          <button 
                            type="button" 
                            onClick={removePhoto}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={previewPhoto}
                      />
                    </div>
                    {errors.photo && (
                      <p className="mt-2 text-sm text-red-600">{errors.photo.message}</p>
                    )}
                  </div>

                  {/* Content PDF */}
                  <div className="mt-6">
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Course Content (PDF)
                    </label>
                    <div className="relative">
                      <div 
                        className={`border-2 border-dashed border-[#DCDEDD] rounded-[16px] p-6 hover:border-[#EF3F09] transition-all duration-300 cursor-pointer ${
                          pdfFileName ? 'hidden' : 'block'
                        }`}
                        onClick={() => pdfInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">PDF up to 10MB</p>
                          <button type="button" className="mt-3 px-4 py-2 border border-[#DCDEDD] rounded-[12px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300">
                            Choose File
                          </button>
                        </div>
                      </div>
                      
                      {/* PDF Preview */}
                      {pdfFileName && (
                        <div className="relative">
                          <button 
                            type="button" 
                            onClick={removePdf}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="w-full p-4 border-2 border-[#DCDEDD] rounded-[16px] bg-gray-50">
                            <div className="flex flex-col gap-3">
                              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto">
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 text-center">
                                <h4 className="text-brand-dark text-sm font-semibold break-words">{pdfFileName}</h4>
                                <p className="text-gray-500 text-xs">PDF file</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        ref={pdfInputRef}
                        onChange={previewPdf}
                      />
                    </div>
                    {errors.content && (
                      <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Topic Selection Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#DCDEDD]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#C5E151] rounded-[12px] flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#324700]" />
                  </div>
                  <div>
                    <h3 className="text-brand-dark text-xl font-bold">Select Topic</h3>
                    <p className="text-brand-dark text-sm font-normal">Choose a topic for this subject</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsTopicModalOpen(false)}
                  className="w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#EF3F09] transition-all duration-200"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-[#DCDEDD]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={topicSearchQuery}
                  onChange={(e) => setTopicSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300"
                  placeholder="Search topics..."
                />
              </div>
            </div>

            {/* Topics List */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTopics.map((topic) => (
                  <div 
                    key={topic.id}
                    className="topic-card border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] hover:shadow-lg transition-all duration-300 p-4 cursor-pointer"
                    onClick={() => {
                      handleTopicSelect(topic);
                      setIsTopicModalOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 relative flex items-center justify-center rounded-[12px] overflow-hidden">
                        <div className="w-full h-full absolute bg-[#EF3F09] rounded-[12px]"></div>
                        <BookOpen className="w-6 h-6 text-white relative z-10" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-brand-dark text-base font-bold">{topic.name}</h4>
                        <p className="text-brand-dark text-sm font-normal">Available topic</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              {topicsPaginatedResponse?.has_more && (
                <div className="mt-4">
                  <button 
                    type="button" 
                    onClick={() => setTopicCurrentPage(prev => prev + 1)}
                    disabled={isLoadingTopics}
                    className="w-full px-6 py-3 border border-[#DCDEDD] rounded-[12px] text-brand-dark font-medium hover:border-[#EF3F09] hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingTopics ? 'Loading...' : 'Load More Topics'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Selection Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[20px] p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-[#DCDEDD]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brand-dark">Choose Teacher</h3>
              <button 
                type="button" 
                onClick={() => setIsTeacherModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search teachers..." 
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#DCDEDD] rounded-[12px] focus:border-[#EF3F09] transition-all duration-300"
                />
              </div>
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredTeachers.map((teacher) => (
                <div 
                  key={teacher.id}
                  className="teacher-card border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] hover:shadow-lg transition-all duration-300 p-4 cursor-pointer"
                  onClick={() => {
                    handleTeacherSelect(teacher);
                    setIsTeacherModalOpen(false);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={teacher.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"} 
                        alt={teacher.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-brand-dark text-base font-bold">{teacher.name}</h4>
                      <p className="text-brand-dark text-sm font-normal">{teacher.email}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {teachersPaginatedResponse?.has_more && (
                <div className="mt-4">
                  <button 
                    type="button" 
                    onClick={() => setTeacherCurrentPage(prev => prev + 1)}
                    disabled={isLoadingTeachers}
                    className="w-full px-6 py-3 border border-[#DCDEDD] rounded-[12px] text-brand-dark font-medium hover:border-[#EF3F09] hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingTeachers ? 'Loading...' : 'Load More Teachers'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSubject;