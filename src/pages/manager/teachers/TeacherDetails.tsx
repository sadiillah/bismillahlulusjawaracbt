import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useFetchTeacher, useDeleteTeacher } from '../../../hooks/useTeachers';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { 
  UserCheck, 
  ArrowLeft, 
  Edit, 
  GraduationCap,
  Users,
  Star,
  BookOpen,
  Calendar,
  BarChart,
  Mail,
  FileText,
  Trash2
} from 'lucide-react'; 
import { toast } from 'sonner';
 

const TeacherDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Hooks
  const teacherId = id ? parseInt(id, 10) : 0;
  const { data: teacher } = useFetchTeacher(teacherId);
  const { mutate: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();

  // Use mock data if no real data or on error
  const displayTeacher = teacher;

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

  const handleDelete = () => {
    if (!teacherId) return;
    
    deleteTeacher(teacherId, {
      onSuccess: () => {
        toast.success('Teacher deleted successfully');
        navigate('/dashboard/teachers');
      },
      onError: () => {
        toast.error('Failed to delete teacher');
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!displayTeacher) {
    return (
      <div className="min-h-screen bg-white flex">
        {renderSidebar()}
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Teacher Not Found</h2>
            <p className="text-gray-600 mb-6">The teacher you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/dashboard/teachers"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EF3F09] hover:brightness-110"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teachers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
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
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link 
                to="#" 
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
              <span className="text-brand-dark font-medium">Teacher Details</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[26px]"></div>
                  <UserCheck className="w-10 h-10 text-[#0C1C3C] relative z-10" />
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">{displayTeacher.name}</h1>
                  <p className="text-brand-dark text-base font-normal">View and manage teacher information</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => navigate('/dashboard/teachers')}
                  className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0C1C3C]" />
                  <span className="text-[#0C1C3C]">Back</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate(`/dashboard/teachers/${teacherId}/edit`)}
                  className="px-4 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Teacher
                </button>
              </div>
            </div>
          </div>

          {/* Stats Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            {/* Total Subjects */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Subjects</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {displayTeacher.subjects_count || displayTeacher.subjects?.length || 0}
                    </p>
                    <p className="text-success text-sm font-medium">Currently teaching</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <GraduationCap className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Classes */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Active Classes</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">5</p>
                    <p className="text-success text-sm font-medium">This semester</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                    <Users className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Students */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Students</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">124</p>
                    <p className="text-success text-sm font-medium">Across all classes</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                    <UserCheck className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Average Rating</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">4.8</p>
                    <p className="text-success text-sm font-medium">Out of 5.0</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <Star className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
            <div className="mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">Teacher Information</h3>
            </div>
            <div className="flex gap-4">
              {/* Left Side - Teacher Details */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-370px)]">
                {/* Profile Photo */}
                <div className="mb-6 flex justify-start">
                  <img 
                    src={displayTeacher.photo} 
                    alt={displayTeacher.name}
                    className="w-[150px] h-[150px] rounded-full object-cover border-2 border-gray-300"
                  />
                </div>

                {/* Full Name */}
                <div className="mb-6">
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Full Name
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-semibold">
                    {displayTeacher.name}
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-6">
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                    {displayTeacher.email}
                  </div>
                </div>

                {/* Experience & Employment */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Gender
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal capitalize">
                      {displayTeacher.gender}
                    </div>
                  </div>
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Employment Status
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      Full-time
                    </div>
                  </div>
                </div>

                {/* Certification */}
                <div className="mb-6">
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Teaching Certification
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                    Licensed Professional Educator - Mathematics (Valid until 2026)
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Hire Date
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {displayTeacher.created_at ? formatDate(displayTeacher.created_at) : 'January 15, 2020'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Updated at
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {displayTeacher.updated_at ? formatDate(displayTeacher.updated_at) : 'December 22, 2024'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => navigate(`/dashboard/teachers/${teacherId}/edit`)}
                    className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-6 py-3 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4 text-[#0C1C3C]" />
                    <span className="text-brand-dark text-base font-medium">Edit Teacher</span>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-secondary border border-red-300 rounded-[16px] hover:border-red-500 focus:border-red-500 transition-all duration-300 px-6 py-3 flex items-center gap-2 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 text-base font-medium">Delete Teacher</span>
                  </button>
                </div>
              </div>

              {/* Right Side - Assigned Subjects and Quick Actions */}
              <div className="w-[350px] space-y-4">
                {/* Assigned Subjects */}
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <h4 className="text-brand-dark text-sm font-semibold mb-4">Assigned Subjects</h4>
                  {displayTeacher.subjects && displayTeacher.subjects.length > 0 ? (
                    <div className="space-y-3">
                      {displayTeacher.subjects.map((subject) => (
                        <div key={subject.id} className="p-3 bg-gray-50 border border-[#DCDEDD] rounded-[12px]">
                          <img 
                            src={subject.photo} 
                            alt={subject.name} 
                            className="w-full h-20 object-cover rounded-[8px] mb-2"
                          />
                          <h5 className="text-brand-dark text-sm font-semibold">{subject.name}</h5>
                          <p className="text-gray-600 text-xs">{subject.tagline}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium mb-1">No subjects assigned</p>
                      <p className="text-gray-400 text-xs">This teacher has not been assigned to any subjects yet.</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <h4 className="text-brand-dark text-sm font-semibold mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button 
                      type="button"
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">View Assigned Subjects</span>
                    </button>
                    
                    <button 
                      type="button"
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">View Class Schedule</span>
                    </button>
                    
                    <button 
                      type="button"
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <BarChart className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">Student Performance</span>
                    </button>
                    
                    <button 
                      type="button"
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">Contact Teacher</span>
                    </button>
                    
                    <button 
                      type="button"
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">Generate Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-6 border-b border-[#DCDEDD]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-[12px] flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-[#0C1C3C]" />
                  </div>
                  <div>
                    <h3 className="text-brand-dark text-xl font-bold">Delete Teacher</h3>
                    <p className="text-brand-dark text-sm font-normal">This action cannot be undone</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-base mb-6">
                Are you sure you want to delete <strong>{displayTeacher.name}</strong>? This will also remove all subject assignments and teaching records.
              </p>
              <div className="flex justify-end items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-[#DCDEDD] rounded-[12px] text-brand-dark font-medium hover:border-[#EF3F09] transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-[12px] font-medium transition-all duration-300 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Teacher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetails;