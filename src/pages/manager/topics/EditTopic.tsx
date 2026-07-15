import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { BookOpen, Sparkles, Image, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchTopic, useUpdateTopic } from '../../../hooks/useTopics';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { z } from 'zod';
import type { ApiError } from '../../../types';
import { toast } from 'sonner';

// Topic schema for edit (photo is optional)
const updateTopicSchema = z.object({
  name: z.string().min(1, "Topic name is required"),
  about: z.string().min(1, "Topic description is required"),
  photo: z
    .custom<File>((file) => file instanceof File || file === undefined, "Invalid file")
    .refine(
      (file) => !file || ["image/png", "image/jpeg", "image/jpg", "image/gif"].includes(file.type),
      { message: "Invalid image format. Use PNG, JPEG, JPG or GIF." }
    )
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, {
      message: "Image must be less than 2MB.",
    })
    .optional(),
});

type UpdateTopicFormData = z.infer<typeof updateTopicSchema>;

const EditTopic = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }, 
    reset,
  } = useForm<UpdateTopicFormData>({
    resolver: zodResolver(updateTopicSchema),
  });

  // Hooks
  const { data: topic, isLoading: isFetching, error: fetchError } = useFetchTopic(Number(id));
  const { mutate: updateTopic, isPending: isUpdating } = useUpdateTopic();

  // Populate form when topic data is loaded
  useEffect(() => {
    if (topic) {
      reset({
        name: topic.name,
        about: topic.about,
      });
      
      if (topic.photo) {
        setCurrentPhotoUrl(topic.photo);
      }
    }
  }, [topic, reset]);

  // Form submission
  const onSubmit = (data: UpdateTopicFormData) => {
    if (!id) return;

    updateTopic(
      { id: Number(id), ...data },
      {
        onSuccess: () => {
          toast.success('Topic updated successfully!');
          navigate('/dashboard/topics');
        },
        onError: (error: AxiosError<ApiError>) => {
          const errorMessage = 
            error.response?.data?.message || 
            'Failed to update topic. Please try again.';
          toast.error(errorMessage);
        },
      }
    );
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
    setCurrentPhotoUrl(null);
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

  if (isFetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EF3F09]"></div>
          <p className="mt-4 text-gray-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !topic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic Not Found</h2>
          <p className="text-gray-600 mb-4">The topic you're looking for doesn't exist.</p>
          <Link 
            to="/dashboard/topics" 
            className="text-[#EF3F09] hover:underline"
          >
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  const displayPhoto = photoPreview || currentPhotoUrl;

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
              <span className="text-brand-dark font-medium">Edit Topic</span>
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
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Edit Topic</h1>
                  <p className="text-brand-dark text-base font-normal">Update the topic information and settings</p>
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
                      disabled={isUpdating}
                      className={`btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 flex items-center gap-2 ${
                        isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUpdating && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span className="text-brand-white text-base font-semibold">
                        {isUpdating ? 'Updating...' : 'Update Topic'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side - Photo Upload */}
              <div className="w-[350px] bg-white rounded-[20px] px-6 py-6 h-fit">
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Topic Photo
                  </label>
                  <div className="relative">
                    {!displayPhoto ? (
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
                          src={displayPhoto} 
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
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-2 right-2 px-3 py-1 bg-[#EF3F09] text-white text-xs rounded-lg hover:brightness-110 transition-all duration-300"
                        >
                          Change
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

export default EditTopic;