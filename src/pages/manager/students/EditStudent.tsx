import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { UserPen, Sparkles, User, X, Image, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchStudent, useUpdateStudent } from '../../../hooks/useStudents';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { updateStudentSchema, type UpdateStudentFormData } from '../../../schemas/userSchemas';
import type { ApiError } from '../../../types';
import { toast } from 'sonner';

const EditStudent = () => {
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
  const studentId = id ? parseInt(id, 10) : 0;
  const { data: student, isLoading: studentLoading } = useFetchStudent(studentId);
  const { mutate: updateStudent, isPending } = useUpdateStudent();

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
  } = useForm<UpdateStudentFormData>({
    resolver: zodResolver(updateStudentSchema),
  });

  // Watch gender for UI updates
  const selectedGender = watch('gender');

  // Set form defaults when student data loads
  useEffect(() => {
    if (student) {
      reset({
        name: student.name || '',
        email: student.email || '',
        gender: (student.gender === "male" || student.gender === "female") ? student.gender : undefined,
        password: '',
        password_confirmation: '',
      });
    }
  }, [student, reset]);

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
        setShowOriginalPhoto(false);
      };
      reader.readAsDataURL(file);
      
      // Set form value
      setValue('photo', file);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    setImagePreview(null);
    setValue('photo', undefined);
    setShowOriginalPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const onSubmit = (data: UpdateStudentFormData) => {
    // Remove empty password fields
    const cleanedData = { ...data };
    if (!cleanedData.password || cleanedData.password.trim() === '') {
      delete cleanedData.password;
      delete cleanedData.password_confirmation;
    }

    updateStudent(
      { id: studentId, ...cleanedData },
      {
        onSuccess: () => {
          toast.success('Student updated successfully!');
          navigate(`/dashboard/students/${studentId}`);
        },
        onError: (error: AxiosError<ApiError>) => {
          if (error.response?.data?.errors) {
            const apiErrors = error.response.data.errors;
            Object.entries(apiErrors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                setError(field as keyof UpdateStudentFormData, {
                  type: 'server',
                  message: messages[0]
                });
              }
            });
          } else {
            toast.error(error.response?.data?.message || 'Failed to update student');
          }
        }
      }
    );
  };

  if (studentLoading) {
    return (
      <div className="min-h-screen bg-white flex">
        {renderSidebar()}
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-brand-dark">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-white flex">
        {renderSidebar()}
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
            <p className="text-gray-600 mb-6">The student you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/dashboard/students"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Students
            </Link>
          </div>
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
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-orange"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Content */}
        <main className="flex-1 p-5">
          {/* Breadcrumb */}
          <div className="mt-[50px] mb-4 ml-[50px]">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/dashboard" className="text-gray-500 hover:text-brand-orange transition-colors duration-300">Dashboard</Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link to="/dashboard/students" className="text-gray-500 hover:text-brand-orange transition-colors duration-300">Students</Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-brand-dark font-medium">Edit Student</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[26px]"></div>
                  <UserPen className="w-10 h-10 text-[#1F2937] relative z-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Edit Student</h1>
                  <p className="text-brand-dark text-base font-normal">Update student account information and settings</p>
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
              <h3 className="text-brand-dark text-lg font-bold ml-5">Student Details</h3>
            </div>
            <div className="flex gap-4">
              {/* Left Side - Form Fields */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-370px)]">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Student Name */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Student Name <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                      type="text" 
                      {...register('name')}
                      className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 font-semibold ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter student name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Email Address <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                      type="email" 
                      {...register('email')}
                      className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 font-semibold ${
                        errors.email ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Password <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                      type="password" 
                      {...register('password')}
                      className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 font-semibold ${
                        errors.password ? 'border-red-300' : ''
                      }`}
                      placeholder="Enter new password (leave blank to keep current)"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Confirm Password <span className="text-brand-orange">*</span>
                    </label>
                    <input 
                      type="password" 
                      {...register('password_confirmation')}
                      className={`w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 font-semibold ${
                        errors.password_confirmation ? 'border-red-300' : ''
                      }`}
                      placeholder="Confirm new password"
                    />
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Gender <span className="text-brand-orange">*</span>
                    </label>
                    <div className="flex gap-4">
                      {/* Male Option */}
                      <label className={`group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 transition-all duration-300 cursor-pointer ${
                        selectedGender === 'male' ? 'ring-2 ring-brand-orange ring-offset-2' : ''
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
                            value="male" 
                            {...register('gender')}
                            className="hidden"
                          />
                          <div className={`flex size-[18px] rounded-full shadow-sm border transition-all duration-300 ${
                            selectedGender === 'male' ? 'border-[5px] border-brand-orange' : 'border-[#DCDEDD]'
                          }`}></div>
                          <p className="text-xs font-semibold">
                            {selectedGender === 'male' ? 'Selected' : 'Select'}
                          </p>
                        </div>
                      </label>

                      {/* Female Option */}
                      <label className={`group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 transition-all duration-300 cursor-pointer ${
                        selectedGender === 'female' ? 'ring-2 ring-brand-orange ring-offset-2' : ''
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
                            value="female" 
                            {...register('gender')}
                            className="hidden"
                          />
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
                      className={`btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-brand-orange transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 ${
                        isPending ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="text-brand-white text-base font-semibold">
                        {isPending ? 'Updating...' : 'Update Student Account'}
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
                    {/* Photo Preview (visible with existing photo or new upload) */}
                    {(imagePreview || (showOriginalPhoto && student.photo)) ? (
                      <div className="relative">
                        <img 
                          src={imagePreview || student.photo || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=350&h=200&fit=crop&crop=face"} 
                          alt={student.name}
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
                    ) : (
                      /* Photo Placeholder */
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
                    )}
                    
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    
                    {errors.photo && (
                      <p className="mt-2 text-sm text-red-600">{errors.photo.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditStudent;