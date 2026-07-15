import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { UserCheck, Sparkles, User, X, Image } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchTeacher, useUpdateTeacher } from '../../../hooks/useTeachers';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { updateTeacherSchema, type UpdateTeacherFormData } from '../../../schemas/userSchemas';
import type { ApiError, UpdateTeacherRequest } from '../../../types';
import { toast } from 'sonner';

const EditTeacher = () => {
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
  const teacherId = id ? parseInt(id, 10) : 0;
  const { data: teacher, isLoading: teacherLoading } = useFetchTeacher(teacherId);
  const { mutate: updateTeacher, isPending } = useUpdateTeacher();

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateTeacherFormData>({
    resolver: zodResolver(updateTeacherSchema),
  });

  // Watch gender for UI updates
  const selectedGender = watch('gender');

  // Set form defaults when teacher data loads
  useEffect(() => {
    if (teacher) {
      reset({
        name: teacher.name || '',
        email: teacher.email || '',
        gender: (teacher.gender === "male" || teacher.gender === "female") ? teacher.gender : undefined,
        password: '', // Always start empty for updates
        password_confirmation: '',
      });
      setShowOriginalPhoto(true);
      setImagePreview(null); // Start with no new image
    }
  }, [teacher, reset]);

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

  const onSubmit = (data: UpdateTeacherFormData) => {
    clearErrors('root');

    // Filter out empty optional fields
    const updateData: UpdateTeacherRequest = {};
    
    if (data.name && data.name.trim()) updateData.name = data.name.trim();
    if (data.email && data.email.trim()) updateData.email = data.email.trim();
    if (data.gender) updateData.gender = data.gender;
    if (data.photo) updateData.photo = data.photo;
    
    // Only include password if provided
    if (data.password && data.password.trim()) {
      updateData.password = data.password;
      updateData.password_confirmation = data.password_confirmation;
    }

    updateTeacher({ id: teacherId, ...updateData }, {
      onSuccess: () => {
        toast.success('Teacher updated successfully!');
        navigate(`/dashboard/teachers/${teacherId}`);
      },
      onError: (error: AxiosError<ApiError>) => {
        const errorMessage = error.response?.data?.message || 'Failed to update teacher';
        toast.error(errorMessage);
        setError('root', { type: 'server', message: errorMessage });
        
        // Handle field-specific errors if they exist
        const fieldErrors = error.response?.data?.errors;
        if (fieldErrors) {
          Object.entries(fieldErrors).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              setError(key as keyof UpdateTeacherFormData, {
                type: 'server',
                message: value[0],
              });
            }
          });
        }
      },
    });
  };

  if (teacherLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EF3F09]"></div>
          <p className="mt-4 text-gray-600">Loading teacher data...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Not Found</h2>
          <p className="text-gray-600 mb-4">The teacher you're looking for doesn't exist.</p>
          <Link 
            to="/dashboard/teachers" 
            className="text-[#EF3F09] hover:underline"
          >
            Return to Teachers List
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
        {/* Breadcrumb */}
        <div className="mt-[50px] mb-4 ml-[50px]">
          <nav className="flex items-center gap-2 text-sm">
            <Link 
              to="/dashboard/overview" 
              className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
            >
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link 
              to="/dashboard/teachers" 
              className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
            >
              Users
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link 
              to="/dashboard/teachers" 
              className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300"
            >
              Teachers
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-brand-dark font-medium">Edit Teacher</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
          <div className="flex items-center justify-between pl-2 pr-2">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[26px]"></div>
                <UserCheck className="w-10 h-10 text-[#530000] relative z-10" />
              </div>
              <div>
                <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Edit Teacher</h1>
                <p className="text-brand-dark text-base font-normal">Update teacher information and modify account details</p>
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
            <h3 className="text-brand-dark text-lg font-bold ml-5">Teacher Details</h3>
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

                {/* Teacher Name */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Teacher Name <span className="text-[#EF3F09]">*</span>
                  </label>
                  <input 
                    type="text" 
                    {...register('name')}
                    className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter teacher's full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Email Address <span className="text-[#EF3F09]">*</span>
                  </label>
                  <input 
                    type="email" 
                    {...register('email')}
                    className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                      errors.email ? 'border-red-300' : ''
                    }`}
                    placeholder="teacher@school.edu"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    New Password <span className="text-gray-500 font-normal">(leave blank to keep current)</span>
                  </label>
                  <input 
                    type="password" 
                    {...register('password')}
                    className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                      errors.password ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter new password (min 8 characters)"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Confirm New Password
                  </label>
                  <input 
                    type="password" 
                    {...register('password_confirmation')}
                    className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold ${
                      errors.password_confirmation ? 'border-red-300' : ''
                    }`}
                    placeholder="Confirm new password"
                  />
                  {errors.password_confirmation && (
                    <p className="mt-2 text-sm text-red-600">{errors.password_confirmation.message}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Gender <span className="text-[#EF3F09]">*</span>
                  </label>
                  <div className="flex gap-4">
                    {/* Male Option */}
                    <label className={`group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 transition-all duration-300 cursor-pointer ${
                      selectedGender === 'male' ? 'ring-2 ring-[#EF3F09] ring-offset-2' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                          <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                          <User className="w-6 h-6 text-[#033C4B] relative z-10" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-brand-dark text-base font-semibold">Male</p>
                        </div>
                      </div>
                      <div className="relative flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 gap-2">
                        <input 
                          type="radio" 
                          {...register('gender')}
                          value="male" 
                          className="hidden"
                        />
                        <div className={`flex size-[18px] rounded-full shadow-sm border border-[#DCDEDD] transition-all duration-300 ${
                          selectedGender === 'male' ? 'border-[5px] border-[#EF3F09]' : ''
                        }`}></div>
                        <p className="text-xs font-semibold">
                          {selectedGender === 'male' ? 'Selected' : 'Select'}
                        </p>
                      </div>
                    </label>

                    {/* Female Option */}
                    <label className={`group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 transition-all duration-300 cursor-pointer ${
                      selectedGender === 'female' ? 'ring-2 ring-[#EF3F09] ring-offset-2' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                          <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                          <User className="w-6 h-6 text-[#530000] relative z-10" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-brand-dark text-base font-semibold">Female</p>
                        </div>
                      </div>
                      <div className="relative flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 gap-2">
                        <input 
                          type="radio" 
                          {...register('gender')}
                          value="female" 
                          className="hidden"
                        />
                        <div className={`flex size-[18px] rounded-full shadow-sm border border-[#DCDEDD] transition-all duration-300 ${
                          selectedGender === 'female' ? 'border-[5px] border-[#EF3F09]' : ''
                        }`}></div>
                        <p className="text-xs font-semibold">
                          {selectedGender === 'female' ? 'Selected' : 'Select'}
                        </p>
                      </div>
                    </label>
                  </div>
                  {errors.gender && (
                    <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end items-center gap-4 pt-3">
                  <Link
                    to={`/dashboard/teachers/${teacherId}`}
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
                      {isPending ? 'Updating...' : 'Update Teacher'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side - Photo Upload */}
            <div className="w-[350px] bg-white rounded-[20px] px-6 py-6 h-fit">
              <div>
                <label className="block text-brand-dark text-sm font-semibold mb-2">
                  Teacher Photo
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
                        src={imagePreview || teacher?.photo || ''} 
                        alt="Teacher Photo" 
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
      </div>
    </div>
  );
};

export default EditTeacher;