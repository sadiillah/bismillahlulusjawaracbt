import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { 
  Search, 
  GraduationCap, 
  CheckCircle, 
  BookOpen,
  Clock,
  Plus,
  Filter,
  Eye,
  Trash2,
  Users
} from 'lucide-react';
import { useRoleBasedStudents, useRoleBasedSearchStudents, useDeleteStudent } from '../../../hooks/useStudents';
import { useStatistics } from '../../../hooks/useStatistics';
import { DeleteConfirmationModal } from '../../../components/modals';
import type { Student, PaginatedResponse, ApiError } from '../../../types';
import { AxiosError } from 'axios';
import { toast } from 'sonner';


const Students = () => {
  const { user } = useAuth();
  
  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  // Fetch statistics data efficiently
  const { data: statistics, isLoading: statisticsLoading } = useStatistics(['students', 'subjects']);
  
  // Fetch students based on user role and search query (following SubjectsList pattern)
  const { data: studentData, isLoading } = useRoleBasedStudents(currentPage);
  const { data: searchData, isLoading: isSearchLoading } = useRoleBasedSearchStudents(searchQuery, currentPage);
  
  // Use search data if there's a search query, otherwise use regular data
  const currentData = searchQuery ? searchData : studentData;
  const currentLoading = searchQuery ? isSearchLoading : isLoading;
  
  // Delete mutation
  const deleteStudentMutation = useDeleteStudent();

  // Handle paginated response for managers (following SubjectsList pattern)
  const students: Student[] = useMemo(() => {
    if (!currentData) return [];
    
    // Both regular and search now return paginated response
    if (currentData && 'data' in currentData) {
      return (currentData as PaginatedResponse<Student>).data;
    }
    
    return [];
  }, [currentData]);

  // Extract meta for pagination
  const meta = currentData?.meta;

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate statistics from API data
  const stats = useMemo(() => {
    const totalStudents = statistics?.students_total || 0;
    const activeStudents = statistics?.students_total || 0; // All students are considered active
    const subjectsAvailable = statistics?.subjects_total || 0;
    const recentEnrollments = 8; // This would need to be calculated based on created_at dates
    
    return {
      totalStudents,
      activeStudents,
      subjectsAvailable,
      recentEnrollments
    };
  }, [statistics]);


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

  // Handle student deletion
  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      await deleteStudentMutation.mutateAsync(selectedStudent.id);
      toast.success(`Student ${selectedStudent.name} has been deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete student. Please try again.';
      
      if ((error as AxiosError<ApiError>)?.response?.data?.message) {
        errorMessage = (error as AxiosError<ApiError>).response?.data?.message || '';
      } else if ((error as Error)?.message) {
        errorMessage = (error as Error).message;
      }
      
      toast.error(errorMessage);
    }
  };

  // Show loading only for initial stats load
  if (statisticsLoading) {
    return (
      <div className="min-h-screen bg-white flex">
        {renderSidebar()}
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-brand-dark">Loading students...</p>
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

        {/* Banner Header */}
        <div className="w-full h-[180px] bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]"></div>

        {/* Dashboard Content */}
        <main className="flex-1 p-5">
          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6">
            <div className="pl-2 pr-2">
              <div>
                <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Student Management</h1>
                <p className="text-brand-dark text-base font-normal">Manage student enrollment, track academic progress, and oversee classroom assignments</p>
              </div>
            </div>
          </div>

          {/* Stats Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Students */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Students</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.totalStudents}
                    </p>
                    <p className="text-success text-sm font-medium">+8 this month</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                    <GraduationCap className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Students */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Active Students</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.activeStudents}
                    </p>
                    <p className="text-success text-sm font-medium">Currently enrolled</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <CheckCircle className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects Available */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Subjects Available</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.subjectsAvailable}
                    </p>
                    <p className="text-success text-sm font-medium">For enrollment</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                    <BookOpen className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Enrollments */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Recent Enrollments</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.recentEnrollments}
                    </p>
                    <p className="text-success text-sm font-medium">This month</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <Clock className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-[20px] mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300"
                  placeholder="Search students by name, email, or classroom..."
                />
              </div>
            </div>
          </div>

          {/* Students List Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">All Students</h3>
              <div className="flex items-center gap-3 mr-2">
                <button className="btn-secondary text-sm px-4 py-2 rounded-lg border border-[#DCDEDD] hover:border-brand-orange transition-all duration-300 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-brand-dark text-sm font-medium">Filter</span>
                </button>
                <Link
                  to="/dashboard/add-student"
                  className="btn-secondary text-sm px-4 py-2 rounded-lg hover:brightness-110 transition-all duration-300 blue-gradient blue-btn-shadow flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span className="text-brand-white text-sm font-semibold">Add New</span>
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-[20px] px-4 pt-6 pb-4">
              {currentLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-[16px]"></div>
                    </div>
                  ))}
                </div>
              ) : students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                  {students.map((student) => (
                    <div 
                      key={student.id} 
                      className="bg-white border border-gray-200 rounded-[16px] p-4 hover:shadow-lg transition-all duration-300 hover:border-brand-orange"
                    >
                      <div className="mb-4 flex justify-center">
                        <img 
                          src={student.photo || `https://images.unsplash.com/photo-1494790108755-2616b612b401?w=200&h=200&fit=crop&auto=format&q=professional`}
                          alt={student.name} 
                          className="w-[100px] h-[100px] object-cover rounded-full border border-gray-300 p-1.5"
                        />
                      </div>
                      <div className="mb-4">
                        <h3 className="text-brand-dark text-lg font-bold mb-1">{student.name}</h3>
                        <p className="text-gray-500 text-sm font-normal mb-2">{student.email}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{student.class_students_count || 0} Classes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-gray-600" />
                            <span>Active</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/students/${student.id}`}
                          className="btn-details border border-[#DCDEDD] rounded-xl hover:border-brand-orange focus:border-brand-orange transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 flex-1"
                        >
                          <Eye className="w-4 h-4 text-brand-dark" />
                          <span className="text-brand-dark text-sm font-medium">Details</span>
                        </Link>
                        
                        <button 
                          onClick={() => handleDeleteStudent(student)}
                          className="btn-details border border-[#DCDEDD] rounded-xl hover:border-red-300 focus:border-red-300 transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 hover:bg-red-50 flex-1"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 text-sm font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No students found' : 'No students available'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms.' 
                      : 'Get started by adding your first student.'}
                  </p>
                  {!searchQuery && (
                    <Link
                      to="/dashboard/add-student"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Student
                    </Link>
                  )}
                </div>
              )}

              
              {/* Pagination Controls */}
              {students && students.length > 0 && meta?.links && (
                <nav id="Pagination" className="mt-6">
                  <ul className="flex items-center justify-center gap-3">
                    {meta.links
                      ?.filter(link => link.label !== "..." && link.url !== null)
                      .map((link, idx) => {
                        const pageNum = new URL(
                          link.url || ""
                        ).searchParams.get("page");
                        const isActive = link.active;

                        return (
                          <li
                            key={idx}
                            className={`group ${isActive ? "active" : ""}`}
                          >
                            <button
                              className={`flex size-12 shrink-0 rounded-full items-center justify-center border border-black 
                                group-[&.active]:bg-custom-black group-[&.active]:text-white 
                                hover:bg-gray-900 hover:text-white transition-300
                                ${
                                  isActive
                                    ? "bg-gray-900 text-white"
                                    : "bg-white text-black"
                                }`}
                              onClick={() => {
                                if (pageNum) setCurrentPage(Number(pageNum));
                              }}
                              disabled={!link.url}
                              dangerouslySetInnerHTML={{
                                __html: link.label,
                              }}
                            />
                          </li>
                        );
                      })}
                  </ul>
                </nav>
              )}

              {/* Search Results Info */}
              {searchQuery && students.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Found {students.length} students matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={confirmDeleteStudent}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        itemName={selectedStudent?.name}
        isLoading={deleteStudentMutation.isPending}
      />
    </div>
  );
};

export default Students;