import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { GraduationCap, Sparkles, User, X, Image, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCreateStudent } from '../../../hooks/useStudents';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { createStudentSchema, type CreateStudentFormData } from '../../../schemas/userSchemas';
import type { ApiError } from '../../../types';
import { toast } from 'sonner';

const AddStudent = () => {
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hooks
  const { mutate: createStudent, isPending } = useCreateStudent();

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      role: 'student'
    }
  });

  // Watch gender for UI updates
  const selectedGender = watch('gender');

  // Handle photo upload
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear any previous photo errors
      clearErrors('photo');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Set form value
      setValue('photo', file);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    setImagePreview(null);
    // Don't set photo to undefined since it's required - just clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const onSubmit = (data: CreateStudentFormData) => {
    createStudent(data, {
      onSuccess: () => {
        toast.success('Student created successfully!');
        navigate('/dashboard/students');
      },
      onError: (error: AxiosError<ApiError>) => {
        if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors;
          Object.entries(apiErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof CreateStudentFormData, {
                type: 'server',
                message: messages[0]
              });
            }
          });
        } else {
          toast.error(error.response?.data?.message || 'Failed to create student');
        }
      }
    });
  };

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

  return (
    <div className="min-h-screen bg-white flex">
      {/* Conditional Sidebar Rendering */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-orange"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Form Content */}
        <main className="flex-1 p-5">
          {/* Breadcrumb */}
          <div className="mt-[50px] mb-4 ml-[50px]">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/dashboard" className="text-gray-500 hover:text-brand-orange transition-colors duration-300">Dashboard</Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link to="/dashboard/students" className="text-gray-500 hover:text-brand-orange transition-colors duration-300">Users</Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-brand-dark font-medium">Add Student</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  <div className="w-full h-full absolute bg-[#82D9D7] rounded-[26px]"></div>
                  <GraduationCap className="w-10 h-10 text-[#1F2937] relative z-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Add New Student</h1>
                  <p className="text-brand-dark text-base font-normal">Create a new student account with classroom assignment</p>
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
              <h3 className="text-brand-dark text-lg font-bold ml-5">Student Details</h3>
            </div>
            <div className="flex gap-4">
              {/* Left Side - Form Fields */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-370px)]">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Student Name */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Student Name <span className="text-[#EF3F09]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`w-full px-4 py-3 border rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 font-semibold ${
                        errors.name ? 'border-red-300' : 'border-[#DCDEDD]'
                      }`}
                      placeholder="Enter student's full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
                      className={`w-full px-4 py-3 border rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 font-semibold ${
                        errors.email ? 'border-red-300' : 'border-[#DCDEDD]'
                      }`}
                      placeholder="student@school.edu"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Password <span className="text-[#EF3F09]">*</span>
                    </label>
                    <input
                      type="password"
                      {...register('password')}
                      className={`w-full px-4 py-3 border rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 font-semibold ${
                        errors.password ? 'border-red-300' : 'border-[#DCDEDD]'
                      }`}
                      placeholder="Create secure password (min 8 characters)"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Confirm Password <span className="text-[#EF3F09]">*</span>
                    </label>
                    <input
                      type="password"
                      {...register('password_confirmation')}
                      className={`w-full px-4 py-3 border rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 font-semibold ${
                        errors.password_confirmation ? 'border-red-300' : 'border-[#DCDEDD]'
                      }`}
                      placeholder="Confirm your password"
                    />
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                    )}
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Gender <span className="text-[#EF3F09]">*</span>
                    </label>
                    <div className="flex gap-4">
                      {/* Male Option */}
                      <label className={`group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border p-4 transition-all duration-300 cursor-pointer ${
                        selectedGender === 'male' 
                          ? 'border-brand-orange ring-2 ring-brand-orange ring-offset-2' 
                          : 'border-[#DCDEDD] hover:border-gray-400'
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
                          <input type="radio" value="male" {...register('gender')} className="hidden" />
                          <div className={`flex size-[18px] rounded-full shadow-sm border transition-all duration-300 ${
                            selectedGender === 'male' ? 'border-[5px] border-brand-orange' : 'border-[#DCDEDD]'
                          }`}></div>
                          <p className="text-xs font-semibold">
                            {selectedGender === 'male' ? 'Selected' : 'Select'}
                          </p>
                        </div>
                      </label>

                      {/* Female Option */}
                      <label className={`group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border p-4 transition-all duration-300 cursor-pointer ${
                        selectedGender === 'female' 
                          ? 'border-brand-orange ring-2 ring-brand-orange ring-offset-2' 
                          : 'border-[#DCDEDD] hover:border-gray-400'
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
                          <input type="radio" value="female" {...register('gender')} className="hidden" />
                          <div className={`flex size-[18px] rounded-full shadow-sm border transition-all duration-300 ${
                            selectedGender === 'female' ? 'border-[5px] border-brand-orange' : 'border-[#DCDEDD]'
                          }`}></div>
                          <p className="text-xs font-semibold">
                            {selectedGender === 'female' ? 'Selected' : 'Select'}
                          </p>
                        </div>
                      </label>
                    </div>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>


                  {/* Form Actions */}
                  <div className="flex justify-end items-center gap-4 pt-3">
                    <Link
                      to="/dashboard/students"
                      className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-6 py-3"
                    >
                      <span className="text-brand-dark text-base font-medium">Cancel</span>
                    </Link>
                    
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-brand-orange transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3"
                    >
                      {isPending && (
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span className="text-brand-white text-base font-semibold">
                        {isPending ? 'Creating...' : 'Create Student Account'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side - Photo Upload */}
              <div className="w-[350px] bg-white rounded-[20px] px-6 py-6 h-fit">
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Student Photo
                  </label>
                  <div className="relative">
                    {!imagePreview ? (
                      <div 
                        className="border-2 border-dashed border-[#DCDEDD] rounded-[16px] p-6 hover:border-brand-orange transition-all duration-300 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                          <button 
                            type="button"
                            className="mt-3 px-4 py-2 border border-[#DCDEDD] rounded-[12px] text-sm font-medium hover:border-brand-orange transition-all duration-300"
                          >
                            Choose File
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Student Photo" 
                          className="w-full h-48 object-cover rounded-[16px] border-2 border-[#DCDEDD]" 
                        />
                        <button 
                          type="button" 
                          onClick={handleRemovePhoto}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange}
                    />
                  </div>
                  {errors.photo && (
                    <p className="mt-1 text-sm text-red-600">{errors.photo.message}</p>
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

export default AddStudent;