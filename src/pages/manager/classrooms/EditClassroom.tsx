import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Users, Sparkles, Image, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchClassroom, useUpdateClassroom } from '../../../hooks/useClassrooms';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { updateClassroomSchema, type UpdateClassroomFormData } from '../../../schemas/classroomSchemas';
import type { ApiError } from '../../../types';
import { toast } from 'sonner';

const EditClassroom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Form state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showOriginalPhoto, setShowOriginalPhoto] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hooks
  const classroomId = id ? parseInt(id, 10) : 0;
  const { data: classroom, isLoading: classroomLoading } = useFetchClassroom(classroomId);
  const { mutate: updateClassroom, isPending } = useUpdateClassroom();

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<UpdateClassroomFormData>({
    resolver: zodResolver(updateClassroomSchema),
  });

  // Set form defaults when classroom data loads
  useEffect(() => {
    if (classroom) {
      reset({
        name: classroom.name || '',
        grade: classroom.grade || undefined,
      });
      setShowOriginalPhoto(true);
      setImagePreview(null); // Start with no new image
    }
  }, [classroom, reset]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('photo', file);
      setImagePreview(URL.createObjectURL(file));
      setShowOriginalPhoto(false); // Hide original photo when new one is selected
      clearErrors('photo');
    }
  };

  const handleDeletePhoto = () => {
    setImagePreview(null); // Remove new image preview
    setShowOriginalPhoto(false); // Hide original photo - show upload placeholder
    setValue('photo', null as unknown as File);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: UpdateClassroomFormData) => {
    clearErrors('root');

    // Filter out empty optional fields
    const updateData: Partial<UpdateClassroomFormData> = {};
    
    if (data.name && data.name.trim()) updateData.name = data.name.trim();
    if (data.grade) updateData.grade = data.grade;
    if (data.photo) updateData.photo = data.photo;

    updateClassroom({ id: classroomId, ...updateData }, {
      onSuccess: () => {
        toast.success('Classroom updated successfully!');
        navigate(`/dashboard/classrooms/${classroomId}`);
      },
      onError: (error: AxiosError<ApiError>) => {
        const errorMessage = error.response?.data?.message || 'Failed to update classroom';
        toast.error(errorMessage);
        setError('root', { type: 'server', message: errorMessage });
        
        // Handle field-specific errors if they exist
        const fieldErrors = error.response?.data?.errors;
        if (fieldErrors) {
          Object.entries(fieldErrors).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              setError(key as keyof UpdateClassroomFormData, {
                type: 'server',
                message: value[0],
              });
            }
          });
        }
      },
    });
  };

  if (classroomLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EF3F09]"></div>
          <p className="mt-4 text-gray-600">Loading classroom data...</p>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Classroom Not Found</h2>
          <p className="text-gray-600 mb-4">The classroom you're looking for doesn't exist.</p>
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
      <div className="flex-1 ml-64">
        {/* Main Content */}
        <main className="flex-1 p-5">
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
                to="#" 
                className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
              >
                Schools
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-brand-dark font-medium">Edit Classroom</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  <div className="w-full h-full absolute bg-[#82D9D7] rounded-[26px]"></div>
                  <Users className="w-10 h-10 text-[#033C4B] relative z-10" />
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Edit Classroom</h1>
                  <p className="text-brand-dark text-base font-normal">Update classroom information and modify settings</p>
                </div>
              </div>
              <div>
                <button 
                  type="button" 
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[12px] font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Generate
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
            <div className="mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">Classroom Details</h3>
            </div>
            <div className="flex gap-4">
              {/* Left Side - Form Fields */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-370px)]">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Root Error */}
                  {errors.root && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-red-600 text-sm">{errors.root.message}</p>
                    </div>
                  )}

                  {/* Classroom Name */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Classroom Name <span className="text-[#EF3F09]">*</span>
                    </label>
                    <input 
                      type="text" 
                      {...register('name')}
                      className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter classroom name (e.g., Class 10A, Grade 7 Science)"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Grade Level */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Grade Level <span className="text-[#EF3F09]">*</span>
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="12"
                      {...register('grade', { valueAsNumber: true })}
                      className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                        errors.grade ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter grade level (1-12)"
                    />
                    {errors.grade && (
                      <p className="mt-2 text-sm text-red-600">{errors.grade.message}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end items-center gap-4 pt-3">
                    <Link
                      to={`/dashboard/classrooms/${classroomId}`}
                      className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-6 py-3"
                    >
                      <span className="text-brand-dark text-base font-medium">Cancel</span>
                    </Link>
                    
                    <button 
                      type="submit" 
                      disabled={isPending}
                      className={`btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 flex items-center space-x-2 ${
                        isPending ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isPending && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span className="text-brand-white text-base font-semibold">
                        {isPending ? 'Updating...' : 'Update Classroom'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side - Photo Upload */}
              <div className="w-[350px] bg-white rounded-[20px] px-6 py-6 h-fit">
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Classroom Photo
                  </label>
                  <div className="relative">
                    {!imagePreview && !showOriginalPhoto ? (
                      <div 
                        className={`border-2 border-dashed border-[#DCDEDD] rounded-[16px] p-6 hover:border-[#EF3F09] transition-all duration-300 cursor-pointer ${
                          errors.photo ? 'border-red-300' : ''
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                          <button 
                            type="button" 
                            className="mt-3 px-4 py-2 border border-[#DCDEDD] rounded-[12px] text-sm font-medium hover:border-[#EF3F09] transition-all duration-300"
                          >
                            Choose File
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img 
                          src={imagePreview || classroom?.photo || ''} 
                          alt="Classroom Photo" 
                          className="w-full h-48 object-cover rounded-[16px] border-2 border-[#DCDEDD]" 
                        />
                        <button 
                          type="button" 
                          onClick={handleDeletePhoto}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </div>
                  {errors.photo && (
                    <p className="mt-2 text-sm text-red-600">{errors.photo.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditClassroom;