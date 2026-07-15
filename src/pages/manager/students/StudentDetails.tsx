import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Mail, 
  Calendar, 
  BookOpen, 
  GraduationCap,
  School,
  ClipboardCheck,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchStudentWithStats, useDeleteStudent, useStudentStatistics } from '../../../hooks/useStudents';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { toast } from 'sonner';
import type { ApiError } from '../../../types';
import { AxiosError } from 'axios';

const StudentDetails = () => {
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
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Hooks
  const studentId = id ? parseInt(id, 10) : 0;
  const { data: student, isLoading: studentLoading } = useFetchStudentWithStats(studentId);
  const { data: statistics } = useStudentStatistics(studentId);
  const { mutate: deleteStudent, isPending: deletePending } = useDeleteStudent();

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

  // Handle delete student
  const handleDeleteStudent = () => {
    if (!student) return;
    
    deleteStudent(student.id, {
      onSuccess: () => {
        toast.success('Student deleted successfully!');
        navigate('/dashboard/students');
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to delete student';
        
        if ((error as AxiosError<ApiError>)?.response?.data?.message) {
          errorMessage = (error as AxiosError<ApiError>).response?.data?.message || '';
        } else if ((error as Error)?.message) {
          errorMessage = (error as Error).message;
        }
        
        toast.error(errorMessage);
      }
    });
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
              <ArrowLeft className="w-4 h-4 mr-2" />
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
              <span className="text-gray-500 hover:text-brand-orange transition-colors duration-300">Users</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link to="/dashboard/students" className="text-gray-500 hover:text-brand-orange transition-colors duration-300">Students</Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-brand-dark font-medium">Student Details</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  <div className="w-full h-full absolute bg-[#82D9D7] rounded-[26px]"></div>
                  <GraduationCap className="w-10 h-10 text-[#0C1C3C] relative z-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">{student.name}</h1>
                  <p className="text-brand-dark text-base font-normal">View and manage student information</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard/students"
                  className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-brand-orange transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0C1C3C]" />
                  <span className="text-[#0C1C3C]">Back</span>
                </Link>
                <Link
                  to={`/dashboard/students/${student.id}/edit`}
                  className="px-4 py-3 bg-brand-orange text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Student
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ml-[48px] max-w-[calc(70rem-100px)]">
            {/* Total Classes */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Classes</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {student.classrooms_summary?.length || student.classrooms?.length || 0}
                    </p>
                    <p className="text-success text-sm font-medium">Active enrollment</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <School className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Subjects */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Subjects</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {student.classrooms_summary?.reduce((total, classroom) => total + classroom.total_subjects, 0) || 0}
                    </p>
                    <p className="text-success text-sm font-medium">Across all classes</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                    <BookOpen className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Exams */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Completed Exams</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {student.exam_statistics?.total_exams_completed || statistics?.completed_exams || statistics?.total_exams || 0}
                    </p>
                    <p className="text-success text-sm font-medium">
                      {student.exam_statistics ? 
                        `${student.exam_statistics.total_exams_completed} of ${student.exam_statistics.total_exams_available} exams` :
                        'Total attempts'
                      }
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                    <ClipboardCheck className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Average Grade */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Average Grade</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {statistics?.average_score ? Math.round(statistics.average_score) : 'N/A'}
                    </p>
                    <p className="text-success text-sm font-medium">Out of 100</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <Trophy className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
            <div className="mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">Student Information</h3>
            </div>
            <div className="flex gap-4">
              {/* Left Side - Student Details */}
              <div className="bg-white rounded-[20px] px-6 py-6 w-[calc(100%-370px)]">
                {/* Profile Photo */}
                <div className="mb-6 flex justify-start">
                  <img 
                    src={student.photo || "https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHN0dWRlbnR8ZW58MHx8MHx8fDA%3D"} 
                    alt={student.name}
                    className="w-[150px] h-[150px] rounded-full object-cover border-2 border-gray-300"
                  />
                </div>

                {/* Full Name */}
                <div className="mb-6">
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Full Name
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-semibold">
                    {student.name}
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-6">
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                    {student.email}
                  </div>
                </div>

                {/* User ID and Gender */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      User ID
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      STD-{student.id.toString().padStart(3, '0')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Gender
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {student.gender === 'male' ? 'Male' : 'Female'}
                    </div>
                  </div>
                </div>

                {/* Academic Status and Performance */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Enrollment Status
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      <span className="inline-flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Academic Performance
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {statistics?.average_score ? `GPA ${(statistics.average_score / 25).toFixed(1)} / 4.0` : 'No data available'}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Enrollment Date
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {student.created_at ? new Date(student.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Not available'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-brand-dark text-sm font-semibold mb-2">
                      Updated at
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 border border-[#DCDEDD] rounded-[16px] text-brand-dark font-normal">
                      {student.updated_at ? new Date(student.updated_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Not available'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <Link
                    to={`/dashboard/students/${student.id}/edit`}
                    className="btn-secondary border border-[#DCDEDD] rounded-[16px] hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-6 py-3 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4 text-[#0C1C3C]" />
                    <span className="text-brand-dark text-base font-medium">Edit Student</span>
                  </Link>
                  
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-secondary border border-red-300 rounded-[16px] hover:border-red-500 focus:border-red-500 transition-all duration-300 px-6 py-3 flex items-center gap-2 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 text-base font-medium">Delete Student</span>
                  </button>
                </div>
              </div>

              {/* Right Side - Quick Actions */}
              <div className="w-[350px] space-y-4">
                {/* Quick Actions */}
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <h4 className="text-brand-dark text-sm font-semibold mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">View All Grades</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">Class Schedule</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <ClipboardCheck className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">Exam History</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-[#0C1C3C]" />
                      <span className="text-brand-dark text-sm font-medium">Contact Student</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="w-full btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3 flex items-center gap-2"
                    >
                      <ClipboardCheck className="w-4 h-4 text-[#0C1C3C]" />
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
      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-6 border-b border-[#DCDEDD]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-[12px] flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-[#0C1C3C]" />
                  </div>
                  <div>
                    <h3 className="text-brand-dark text-xl font-bold">Delete Student</h3>
                    <p className="text-brand-dark text-sm font-normal">This action cannot be undone</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-base mb-6">
                Are you sure you want to delete <strong>{student.name}</strong>? This will also remove all enrollment records, exam attempts, and academic history.
              </p>
              <div className="flex justify-end items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-[#DCDEDD] rounded-[12px] text-brand-dark font-medium hover:border-brand-orange transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteStudent}
                  disabled={deletePending}
                  className={`px-4 py-2 rounded-[12px] font-medium transition-all duration-300 ${
                    deletePending 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {deletePending ? 'Deleting...' : 'Delete Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;