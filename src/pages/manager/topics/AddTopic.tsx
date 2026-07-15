import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { BookOpen, Sparkles, Image, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCreateTopic } from '../../../hooks/useTopics';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import type { ApiError, CreateTopicRequest } from '../../../types';
import { toast } from 'sonner';

// Form data for state management (allows optional photo during editing)
interface TopicFormState {
  name: string;
  about: string;
  photo?: File;
}

// CreateTopicFormData is the same as CreateTopicRequest but explicitly defined for clarity
type CreateTopicFormData = CreateTopicRequest;

const AddTopic = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Photo preview state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form setup - using TopicFormState to allow optional photo during editing
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }, 
  } = useForm<TopicFormState>();

  // Hooks
  const { mutate: createTopic, isPending: isCreating } = useCreateTopic();

  // Form submission with validation
  const onSubmit = (data: TopicFormState) => {
    // Validate that photo is provided
    if (!data.photo) {
      toast.error('Photo is required');
      return;
    }

    // Validate photo type and size
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(data.photo.type)) {
      toast.error('Invalid image format. Use PNG, JPEG, JPG or GIF.');
      return;
    }

    if (data.photo.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB.');
      return;
    }

    // Create proper CreateTopicRequest object
    const createRequest: CreateTopicFormData = {
      name: data.name,
      about: data.about,
      photo: data.photo
    };

    createTopic(createRequest, {
      onSuccess: () => {
        toast.success('Topic created successfully!');
        navigate('/dashboard/topics');
      },
      onError: (error: AxiosError<ApiError>) => {
        const errorMessage = 
          error.response?.data?.message || 
          'Failed to create topic. Please try again.';
        toast.error(errorMessage);
      },
    });
  };

  // Photo upload handling
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('photo', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setValue('photo', undefined);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        {/* Form Content */}
        <main className="main-content flex-1 p-5">
          {/* Breadcrumb */}
          <div className="mt-[50px] mb-4 ml-[50px]">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/dashboard" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link to="/dashboard/topics" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">
                Topics
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-brand-dark font-medium">Add Topic</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  {/* Main background */}
                  <div className="w-full h-full absolute bg-[#C5E151] rounded-[26px]"></div>
                  {/* Lucide icon */}
                  <BookOpen className="w-10 h-10 text-[#324700] relative z-10" />
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Add New Topic</h1>
                  <p className="text-brand-dark text-base font-normal">Create a new academic topic category for organizing subjects</p>
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
              <h3 className="text-brand-dark text-lg font-bold ml-5">Topic Details</h3>
            </div>
            <div className="flex gap-4">
              {/* Left Side - Form Fields */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-370px)]">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Topic Name */}
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Topic Name <span className="text-[#EF3F09]">*</span>
                    </label>
                    <input 
                      type="text" 
                      {...register('name')}
                      className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold"
                      placeholder="Enter topic name (e.g., Mathematics, Science, Literature)" 
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* About Section */}
                  <div className="mb-0">
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      About Topic <span className="text-[#EF3F09]">*</span>
                    </label>
                    <textarea 
                      {...register('about')}
                      rows={4} 
                      className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 font-semibold resize-none"
                      placeholder="Describe the topic, its scope, and academic areas it covers..."
                    />
                    {errors.about && (
                      <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end items-center gap-4 pt-3">
                    <Link
                      to="/dashboard/topics"
                      className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-6 py-3"
                    >
                      <span className="text-brand-dark text-base font-medium">Cancel</span>
                    </Link>
                    
                    <button 
                      type="submit" 
                      disabled={isCreating}
                      className={`btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 flex items-center gap-2 ${
                        isCreating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isCreating && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span className="text-brand-white text-base font-semibold">
                        {isCreating ? 'Creating...' : 'Create Topic'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side - Photo Upload */}
              <div className="w-[350px] bg-white rounded-[20px] px-6 py-6 h-fit">
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Topic Photo <span className="text-[#EF3F09]">*</span>
                  </label>
                  <div className="relative">
                    {!photoPreview ? (
                      <div 
                        className="border-2 border-dashed border-[#DCDEDD] rounded-[16px] p-6 hover:border-[#EF3F09] transition-all duration-300 cursor-pointer" 
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
                      /* Image Preview */
                      <div className="relative">
                        <img 
                          src={photoPreview} 
                          alt="Topic Photo" 
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
                      onChange={handlePhotoUpload}
                    />
                  </div>
                  {errors.photo && (
                    <p className="text-red-500 text-sm mt-1">{errors.photo.message}</p>
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

export default AddTopic;