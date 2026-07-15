import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  GraduationCap, 
  Calculator, 
  ClipboardList, 
  HelpCircle, 
  Users, 
  UserCheck, 
  Trash2 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ManagerSidebar, TeacherSidebar } from '../../../components/sidebars';
import { DeleteConfirmationModal } from '../../../components/modals';
import { useFetchSubject, useDeleteSubject } from '../../../hooks/useSubjects';
import type { ApiError } from '../../../types';

const SubjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  const subjectId = Number(id);
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Hooks
  const { data: subject, isLoading: loading, error } = useFetchSubject(subjectId);
  const { mutate: deleteSubject, isPending: isDeleting } = useDeleteSubject();

  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Mock statistics - you can replace with real API calls
  const statistics = {
    totalExams: 5,
    activeExams: 3,
    totalQuestions: 89,
    enrolledStudents: 124,
    averageScore: 78
  };
  
  
  // Delete handlers
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    if (!subject) return;
    
    deleteSubject(subject.id, {
      onSuccess: () => {
        toast.success('Subject deleted successfully');
        navigate('/dashboard/subjects');
      },
      onError: (error: AxiosError<ApiError>) => {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Unable to delete this subject. It may be assigned to classrooms or contain exams with student submissions.';
        toast.error(errorMessage);
        setIsDeleteModalOpen(false);
      },
    });
  };
  
  // Render appropriate sidebar based on role
  const renderSidebar = () => {
    if (isManager) {
      return <ManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    } else if (isTeacher) {
      return <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
{renderSidebar()}
        <div className="flex-1 flex flex-col ml-64">
          <main className="main-content flex-1 p-5">
            <div className="mt-[50px] mb-4 ml-[50px]">
              <div className="animate-pulse bg-gray-200 h-6 w-96 rounded"></div>
            </div>
            <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              <div className="animate-pulse">
                <div className="flex items-center gap-4 pl-2 pr-2">
                  <div className="w-20 h-18 bg-gray-200 rounded-[26px]"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EF3F09] mx-auto"></div>
          <p className="mt-4 text-brand-dark">Loading subject details...</p>
        </div>
      </div>
    );
  }

  // Handle error or missing subject
  if (error || !subject) {
    return (
      <div className="min-h-screen bg-white flex">
{renderSidebar()}
        <div className="flex-1 flex flex-col ml-64">
          <main className="main-content flex-1 p-5">
            <div className="mt-[50px] mb-4 ml-[50px]">
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/dashboard/overview" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Dashboard</Link>
                <span className="text-gray-400">/</span>
                <Link to="/dashboard/subjects" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Subjects</Link>
                <span className="text-gray-400">/</span>
                <span className="text-brand-dark font-medium">Subject Details</span>
              </nav>
            </div>
            <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-2">Error</div>
                <div className="text-gray-600">
                  {error 
                    ? typeof error === 'string' 
                      ? error 
                      : 'Failed to load subject details'
                    : 'Subject not found'
                  }
                </div>
                <Link 
                  to="/dashboard/subjects"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Subjects
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white flex">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col ml-64">
        <main className="main-content flex-1 p-5">
          {/* Breadcrumb */}
          <div className="mt-[50px] mb-4 ml-[50px]">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/dashboard/overview" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Dashboard</Link>
              <span className="text-gray-400">/</span>
              <Link to="/dashboard/subjects" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Subjects</Link>
              <span className="text-gray-400">/</span>
              <span className="text-brand-dark font-medium">Subject Details</span>
            </nav>
          </div>
          
          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  <div className="w-full h-full absolute bg-[#82D9D7] rounded-[26px]"></div>
                  <GraduationCap className="w-10 h-10 text-[#0C1C3C] relative z-10" />
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">{subject.name}</h1>
                  <p className="text-brand-dark text-base font-normal">View and manage subject information</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard/subjects"
                  className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0C1C3C]" />
                  <span className="text-[#0C1C3C]">Back</span>
                </Link>
{(isManager || isTeacher) && (
                  <Link
                    to={`/dashboard/subjects/${subject.id}/edit`}
                    className="px-4 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Subject
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
            <div className="mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">Subject Information</h3>
            </div>
            <div className="flex gap-4">
              {/* Left Side - Subject Details */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-370px)]">
                {/* Subject Image */}
                <div className="mb-6">
                  <img
                    src={subject.photo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop&auto=format'}
                    alt={subject.name}
                    className="w-full h-48 object-cover rounded-[16px] mb-4"
                  />
                </div>
                
                {/* Subject Name */}
                <div className="mb-6">
                  <label className="block text-brand-dark text-sm font-semibold mb-2">Subject Name</label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-semibold">
                    {subject.name}
                  </div>
                </div>
                
                {/* Tagline */}
                {subject.tagline && (
                  <div className="mb-6">
                    <label className="block text-brand-dark text-sm font-semibold mb-2">Tagline</label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {subject.tagline}
                    </div>
                  </div>
                )}
                
                {/* About Subject */}
                <div className="mb-6">
                  <label className="block text-brand-dark text-sm font-semibold mb-2">About Subject</label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal min-h-[120px]">
                    {subject.about}
                  </div>
                </div>
                
                {/* Topic Assignment */}
                {subject.topic && (
                  <div className="mb-6">
                    <label className="block text-brand-dark text-sm font-semibold mb-2">Assigned Topic</label>
                    <div className="p-4 bg-gray-50 border border-[#DCDEDD] rounded-[16px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative flex items-center justify-center rounded-[12px] overflow-hidden">
                          <div className="w-full h-full absolute bg-[#C5E151] rounded-[12px]"></div>
                          <Calculator className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-brand-dark text-base font-semibold">{subject.topic.name}</h4>
                          <p className="text-gray-600 text-sm">{subject.topic.about || 'No description available'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Assigned Teacher */}
                {subject.teacher && (
                  <div className="mb-6">
                    <label className="block text-brand-dark text-sm font-semibold mb-2">Assigned Teacher</label>
                    <div className="p-4 bg-gray-50 border border-[#DCDEDD] rounded-[16px]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={subject.teacher.photo || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'} 
                          alt="Teacher Avatar"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-brand-dark text-base font-semibold">{subject.teacher.name}</h4>
                          <p className="text-gray-600 text-sm">{subject.teacher.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">Created Date</label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {formatDate(subject.created_at)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">Updated at</label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {formatDate(subject.updated_at)}
                    </div>
                  </div>
                </div>
                
{/* Action Buttons */}
                {(isManager || isTeacher) && (
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                    <Link
                      to={`/dashboard/subjects/${subject.id}/edit`}
                      className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-6 py-3 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-base font-medium">Edit Subject</span>
                    </Link>
                    
                    {isManager && (
                      <button 
                        type="button" 
                        onClick={handleDeleteClick}
                        className="btn-secondary border border-red-300 rounded-[16px] hover:border-red-500 focus:border-red-500 transition-all duration-300 px-6 py-3 flex items-center gap-2 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 text-base font-medium">Delete Subject</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Right Side - Statistics and Quick Actions */}
              <div className="w-[350px] space-y-4">
                {/* Statistics */}
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <h4 className="text-brand-dark text-sm font-semibold mb-4">Statistics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Total Exams</span>
                      <span className="text-brand-dark text-sm font-semibold">{statistics.totalExams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Active Exams</span>
                      <span className="text-brand-dark text-sm font-semibold">{statistics.activeExams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Total Questions</span>
                      <span className="text-brand-dark text-sm font-semibold">{statistics.totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Enrolled Students</span>
                      <span className="text-brand-dark text-sm font-semibold">{statistics.enrolledStudents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Average Score</span>
                      <span className="text-brand-dark text-sm font-semibold">{statistics.averageScore}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <h4 className="text-brand-dark text-sm font-semibold mb-4">Status</h4>
                  <div className="group card flex items-center justify-between w-full min-h-[60px] rounded-[16px] border border-[#DCDEDD] p-4 ring-2 ring-[#EF3F09] ring-offset-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <p className="text-brand-dark text-base font-semibold">Active</p>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 gap-2">
                      <div className="flex size-[18px] rounded-full shadow-sm border-[5px] border-[#EF3F09] transition-all duration-300"></div>
                      <p className="text-xs font-semibold">Selected</p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <h4 className="text-brand-dark text-sm font-semibold mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">View Exams</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">View Questions</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">View Students</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">View Teacher Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This action cannot be undone and will remove all associated data including exams, questions, and student submissions."
        isLoading={isDeleting}
        itemName={subject?.name || ''}
      />
    </div>
  );
};

export default SubjectDetails;