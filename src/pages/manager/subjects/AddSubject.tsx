import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { 
  Building2, 
  Home, 
  ChevronRight, 
  Users, 
  School, 
  ListChecks, 
  ClipboardList, 
  Award, 
  BarChart3, 
  Settings, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  ChevronDown,
  GraduationCap,
  Sparkles,
  BookOpen,
  User,
  Image,
  X,
  Search
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCreateSubject } from '../../../hooks/useSubjects';
import { useFetchTopicsPaginated } from '../../../hooks/useTopics';
import { useFetchTeachersPaginated } from '../../../hooks/useTeachers';
import { z } from 'zod';

// Schema following HTML template requirements
const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  about: z.string().min(1, "About is required"),
  topic_id: z.number().min(1, "Topic is required"),
  teacher_id: z.number().min(1, "Teacher is required"),
  photo: z
    .custom<File>((file) => file instanceof File, "Photo is required")
    .refine(
      (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
      { message: "Invalid image format. Use PNG or JPEG." }
    )
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "Image must be less than 2MB.",
    }),
  content: z
    .custom<File>((file) => file instanceof File, "PDF file is required")
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF format is allowed.",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "PDF must be less than 10MB.",
    }),
});

type CreateSubjectFormData = z.infer<typeof createSubjectSchema>;
import type { Topic, Teacher, ApiError } from '../../../types';

const AddSubject = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Form state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [topicSearchQuery, setTopicSearchQuery] = useState("");
  const [topicCurrentPage, setTopicCurrentPage] = useState(1);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [teacherCurrentPage, setTeacherCurrentPage] = useState(1);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [pdfFileName, setPdfFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Hooks
  const { mutate: createSubject, isPending } = useCreateSubject();
  const { 
    data: topicsPaginatedResponse, 
    isLoading: isLoadingTopics 
  } = useFetchTopicsPaginated(topicCurrentPage, 6, topicSearchQuery);
  const { 
    data: teachersPaginatedResponse, 
    isLoading: isLoadingTeachers 
  } = useFetchTeachersPaginated(teacherCurrentPage, 6, teacherSearchQuery);

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

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    // Always use accumulated topics (allTopics) which handles both search pagination and normal pagination
    return allTopics.length > 0 ? allTopics : (topicsPaginatedResponse?.data || []);
  }, [allTopics, topicsPaginatedResponse]);

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

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    // Always use accumulated teachers (allTeachers) which handles both search pagination and normal pagination
    return allTeachers.length > 0 ? allTeachers : (teachersPaginatedResponse?.data || []);
  }, [allTeachers, teachersPaginatedResponse]);

  // Handle load more for topics
  const handleLoadMoreTopics = () => {
    if (topicsPaginatedResponse?.has_more && !isLoadingTopics) {
      setTopicCurrentPage(prev => prev + 1);
    }
  };

  // Handle load more for teachers
  const handleLoadMoreTeachers = () => {
    if (teachersPaginatedResponse?.has_more && !isLoadingTeachers) {
      setTeacherCurrentPage(prev => prev + 1);
    }
  };

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateSubjectFormData>({
    resolver: zodResolver(createSubjectSchema),
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
    setValue('photo', null as unknown as File);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePdf = () => {
    setPdfFileName("");
    setValue('content', null as unknown as File);
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

  const onSubmit = (data: CreateSubjectFormData) => {
    clearErrors('root');

    createSubject(data, {
      onSuccess: () => {
        navigate('/dashboard/subjects');
      },
      onError: (error: AxiosError<ApiError>) => {
        const errorMessage = error.response?.data?.message || 'Failed to create subject';
        setError('root', { type: 'server', message: errorMessage });
        
        // Handle field-specific errors if they exist
        const fieldErrors = error.response?.data?.errors;
        if (fieldErrors) {
          Object.entries(fieldErrors).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              setError(key as keyof CreateSubjectFormData, {
                type: 'server',
                message: value[0],
              });
            }
          });
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-[#F7F7F7] flex flex-col fixed left-0 top-0 h-screen">
          {/* Logo Section */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 relative flex items-center justify-center">
                <div className="w-14 h-14 absolute bg-[#EF3F09] rounded-full"></div>
                <Building2 className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-brand-dark text-lg font-bold">JawaraCBT</h1>
                <p className="text-brand-dark text-xs font-normal">Manager Sidebar</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="px-6 py-4 space-y-6">
            {/* GENERAL Section */}
            <div>
              <h3 className="section-title">GENERAL</h3>
              <div className="space-y-3">
                <Link to="/dashboard/overview" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <Home className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Overview</span>
                </Link>

                {/* Users Accordion */}
                <div className="employees-accordion">
                  <div className="nav-link rounded-[20px] transition-all duration-300 w-full justify-between group">
                    <div className="flex items-center gap-[10px]">
                      <Users className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                      <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Users</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:!text-[#EF3F09]" />
                  </div>
                  <div className="pl-6 pt-2 space-y-2">
                    <Link to="/dashboard/teachers" className="nav-link rounded-[16px] transition-all duration-300 text-sm hover:bg-gray-50">
                      <span className="text-brand-dark text-sm font-normal hover:!text-[#EF3F09] transition-colors duration-300">Teachers</span>
                    </Link>
                    <Link to="/dashboard/students" className="nav-link rounded-[16px] transition-all duration-300 text-sm hover:bg-gray-50">
                      <span className="text-brand-dark text-sm font-normal hover:!text-[#EF3F09] transition-colors duration-300">Students</span>
                    </Link>
                  </div>
                </div>

                {/* Schools Accordion */}
                <div className="schools-accordion">
                  <div className="nav-link rounded-[20px] transition-all duration-300 w-full justify-between group">
                    <div className="flex items-center gap-[10px]">
                      <School className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                      <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Schools</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:!text-[#EF3F09]" />
                  </div>
                  <div className="pl-6 pt-2 space-y-2">
                    <Link to="/dashboard/topics" className="nav-link rounded-[16px] transition-all duration-300 text-sm hover:bg-gray-50">
                      <span className="text-brand-dark text-sm font-normal hover:!text-[#EF3F09] transition-colors duration-300">Topics</span>
                    </Link>
                    <Link to="/dashboard/subjects" className="nav-link-active rounded-[16px] relative overflow-hidden hover:brightness-110 focus:ring-2 focus:ring-[#276874] transition-all duration-300 text-sm">
                      <span className="text-brand-white text-sm font-semibold">Subjects</span>
                    </Link>
                    <Link to="/dashboard/classrooms" className="nav-link rounded-[16px] transition-all duration-300 text-sm hover:bg-gray-50">
                      <span className="text-brand-dark text-sm font-normal hover:!text-[#EF3F09] transition-colors duration-300">Classrooms</span>
                    </Link>
                  </div>
                </div>

                <Link to="/dashboard/projects" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <ListChecks className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Projects</span>
                </Link>

                <Link to="/dashboard/exams" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <ClipboardList className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Exams</span>
                </Link>

                <Link to="/dashboard/grades" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <Award className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Grades</span>
                </Link>
              </div>
            </div>

            {/* OTHERS Section */}
            <div>
              <h3 className="section-title">OTHERS</h3>
              <div className="space-y-3">
                {/* Analytics Accordion */}
                <div className="analytics-accordion">
                  <div className="nav-link rounded-[20px] transition-all duration-300 w-full justify-between group">
                    <div className="flex items-center gap-[10px]">
                      <BarChart3 className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                      <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Analytics</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:!text-[#EF3F09]" />
                  </div>
                </div>

                <Link to="/dashboard/settings" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <Settings className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Settings</span>
                </Link>

                <Link to="/dashboard/reports" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <FileText className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Exam Reports</span>
                </Link>

                <Link to="/dashboard/security" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <ShieldCheck className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">System Security</span>
                </Link>

                <button onClick={handleLogout} className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 w-full text-left">
                  <LogOut className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Logout</span>
                </button>
              </div>
            </div>
          </nav>

          {/* User Profile at Bottom */}
          <div className="px-6 pb-6 mt-auto">
            <div className="flex items-center gap-3">
              <img 
                src={user?.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} 
                alt="User Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="text-left">
                <p className="text-brand-dark text-base font-semibold">{user?.name || 'Masayoshi'}</p>
                <p className="text-brand-dark text-base font-normal leading-7">Manager</p>
              </div>
            </div>
          </div>
        </aside>

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
                <span className="text-brand-dark font-medium">Add Subject</span>
              </nav>
            </div>

            {/* Page Header */}
            <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              <div className="flex items-center justify-between pl-2 pr-2">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-[4.5rem] relative flex items-center justify-center rounded-[26px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[26px]"></div>
                    <GraduationCap className="w-10 h-10 text-[#324700] relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Add New Subject</h1>
                    <p className="text-brand-dark text-base font-normal">Create a new subject and assign it to a teacher and topic</p>
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
                        onClick={() => setIsTeacherModalOpen(true)}
                        className={`w-full border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-3 text-left ${
                          errors.teacher_id ? 'border-red-300' : ''
                        }`}
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
                            <button 
                              type="button" 
                              onClick={clearTeacherSelection} 
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
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
                        <span className="text-brand-white text-base font-semibold">Create Subject</span>
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
                {filteredTopics?.map((topic) => (
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
                    onClick={handleLoadMoreTopics}
                    disabled={isLoadingTopics}
                    className="w-full px-6 py-3 border border-[#DCDEDD] rounded-[12px] text-brand-dark font-medium hover:border-[#EF3F09] hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
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
              {filteredTeachers?.map((teacher) => (
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
                    onClick={handleLoadMoreTeachers}
                    disabled={isLoadingTeachers}
                    className="w-full px-6 py-3 border border-[#DCDEDD] rounded-[12px] text-brand-dark font-medium hover:border-[#EF3F09] hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
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

export default AddSubject;