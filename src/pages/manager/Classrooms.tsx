import  { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, UserCheck, Clock, Search, Filter, Plus, Settings, Trash2, X, BookOpen, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearchClassroomsWithPagination, useDeleteClassroom, useRoleBasedClassrooms } from '../../hooks/useClassrooms';
import { useStatistics } from '../../hooks/useStatistics';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../components/sidebars';
import type { ClassRoom, PaginatedResponse } from '../../types';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';

const Classrooms = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; classroom: ClassRoom | null }>({
    isOpen: false,
    classroom: null,
  });

  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  // Fetch classrooms data based on user role
  const { data: classroomData, isLoading } = useRoleBasedClassrooms(currentPage);
  
  // Fetch statistics data efficiently (managers only)
  const { data: statisticsData } = useStatistics(['class_rooms', 'classroom_students'], isManager);
  
  // Fetch search results with pagination (only when there's a search query)
  const { data: searchData, isLoading: isSearchLoading } = useSearchClassroomsWithPagination(searchQuery, currentPage);
  
  const { mutate: deleteClassroom, isPending: isDeletingClassroom } = useDeleteClassroom();

  // Use search data if there's a search query, otherwise use regular data
  const currentData = searchQuery ? searchData : classroomData;
  const currentLoading = searchQuery ? isSearchLoading : isLoading;
  
  // Type guard to check if data is PaginatedResponse
  const isPaginatedResponse = (data: unknown): data is PaginatedResponse<ClassRoom> => {
    return !!(data && typeof data === 'object' && 'data' in data && Array.isArray((data as PaginatedResponse<ClassRoom>).data));
  };

  // Extract classrooms from current data - handle different return types
  const classrooms = useMemo(() => {
    if (!currentData) return [];
    
    // For managers: classroomData is PaginatedResponse<ClassRoom> with .data property
    if (isManager && searchQuery) {
      return isPaginatedResponse(currentData) ? currentData.data : [];
    } else if (isManager && !searchQuery) {
      return isPaginatedResponse(classroomData) ? classroomData.data : [];
    }
    
    // For teachers/students: classroomData is ClassRoom[] directly
    if ((isTeacher || isStudent) && !searchQuery) {
      return Array.isArray(classroomData) ? classroomData : [];
    }
    
    // For search results
    if (searchQuery) {
      return isPaginatedResponse(currentData) ? currentData.data : [];
    }
    
    return [];
  }, [currentData, classroomData, isManager, isTeacher, isStudent, searchQuery]);

  // Extract meta for pagination (only available for managers)
  const meta = isManager ? 
    (isPaginatedResponse(currentData) ? currentData.meta : null) || 
    (isPaginatedResponse(classroomData) ? classroomData.meta : null) : 
    null;

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate statistics using API data
  const statistics = useMemo(() => {
    return {
      total: statisticsData?.class_rooms_total || 0,
      active: statisticsData?.class_rooms_total || 0, // All classrooms are considered active
      totalStudents: statisticsData?.classroom_students_total || 0,
      recent: statisticsData?.class_rooms_total || 0, // For now, all are considered recent
    };
  }, [statisticsData]);

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

  const handleDeleteClassroom = (classroom: ClassRoom) => {
    setDeleteModal({ isOpen: true, classroom });
  };

  const confirmDelete = () => {
    if (!deleteModal.classroom) return;

    deleteClassroom(deleteModal.classroom.id, {
      onSuccess: () => {
        toast.success('Classroom deleted successfully!');
        setDeleteModal({ isOpen: false, classroom: null });
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError;
        const errorMessage = (axiosError.response?.data as { error?: string; message?: string })?.error || 
                            (axiosError.response?.data as { error?: string; message?: string })?.message || 
                            'Unable to delete this classroom. It may contain enrolled students or assigned subjects.';
        toast.error(errorMessage);
      },
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, classroom: null });
  };


  return (
    <div className="min-h-screen bg-white flex">
      {/* Conditional Sidebar Rendering */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Banner Header */}
        <div className="w-full h-[180px] bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]"></div>

        {/* Dashboard Content */}
        <main className="main-content flex-1 p-5">
          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6">
            <div className="pl-2 pr-2">
              <div>
                <h1 className="text-brand-dark text-3xl font-extrabold mb-2">
                  {isManager ? 'Classroom Management' : 'My Classrooms'}
                </h1>
                <p className="text-brand-dark text-base font-normal">
                  {isManager 
                    ? 'Manage classrooms, student enrollment, and academic organization across your institution'
                    : isTeacher 
                      ? 'View and manage the classrooms where you teach your assigned subjects'
                      : 'View the classrooms you are enrolled in and track your academic progress'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Stats Layout - Only for Managers */}
          {isManager && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Classrooms */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Classrooms</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {statistics.total}
                    </p>
                    <p className="text-success text-sm font-medium">
                      +4 this semester
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <Building className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Classrooms */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Active Classrooms</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {statistics.active}
                    </p>
                    <p className="text-success text-sm font-medium">Currently in use</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
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
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {statistics.totalStudents}
                    </p>
                    <p className="text-success text-sm font-medium">Across all classrooms</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <UserCheck className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Classrooms */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Recent Classrooms</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {statistics.recent}
                    </p>
                    <p className="text-success text-sm font-medium">Available for access</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <Clock className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Search Section - Only for Managers */}
          {isManager && (
            <div className="bg-white rounded-[20px] mb-6">
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300"
                    placeholder="Search classrooms by name or grade..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Classrooms List Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">
                {isManager ? 'All Classrooms' : 'My Classrooms'}
              </h3>
              <div className="flex items-center gap-3 mr-2">
                <button className="btn-secondary text-sm px-4 py-2 rounded-lg border border-[#DCDEDD] hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-brand-dark text-sm font-medium">Filter</span>
                </button>
                {isManager && (
                  <Link
                    to="/dashboard/classrooms/add"
                    className="btn-secondary text-sm px-4 py-2 rounded-lg hover:brightness-110 transition-all duration-300 blue-gradient blue-btn-shadow flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span className="text-brand-white text-sm font-semibold">Add New</span>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-[20px] px-4 pt-6 pb-4">
              {currentLoading ? (
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-[16px]"></div>
                    </div>
                  ))}
                </div>
              ) : classrooms.length > 0 ? (
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {classrooms.map((classroom) => (
                    <div
                      key={classroom.id}
                      className="classroom-card bg-white border border-gray-200 rounded-[16px] p-4 hover:shadow-lg transition-all duration-300 hover:border-[#EF3F09] hover:-translate-y-0.5"
                    >
                      <div className="mb-4 relative">
                        <img
                          src={classroom.photo || 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=200&fit=crop&auto=format'}
                          alt={classroom.name}
                          className="w-full h-32 object-cover rounded-[12px] mb-3"
                        />
                        <span className="absolute bottom-2 right-2 text-[#0C1C3C] text-xs font-semibold bg-[#C5E151] px-2 py-1 rounded-lg shadow-lg">
                          Grade {classroom.grade}
                        </span>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-brand-dark text-lg font-bold mb-1">{classroom.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{classroom.class_subjects_count || 0} Subjects</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{classroom.class_students_count || 0} Students</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/classrooms/${classroom.id}`}
                          className="btn-details border border-[#DCDEDD] rounded-xl hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 flex-1"
                        >
                          {isManager ? (
                            <>
                              <Settings className="w-4 h-4 text-brand-dark" />
                              <span className="text-brand-dark text-sm font-medium">Manage</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 text-brand-dark" />
                              <span className="text-brand-dark text-sm font-medium">View Classroom</span>
                            </>
                          )}
                        </Link>
                        
                        {isManager && (
                          <button
                            onClick={() => handleDeleteClassroom(classroom)}
                            className="btn-details border border-[#DCDEDD] rounded-xl hover:border-red-300 focus:border-red-300 transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 hover:bg-red-50 flex-1"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 text-sm font-medium">Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No classrooms found' : 'No classrooms available'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first classroom.'}
                  </p>
                  {isManager && !searchQuery && (
                    <Link
                      to="/dashboard/classrooms/add"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Classroom
                    </Link>
                  )}
                </div>
              )}

              
              {/* Pagination Controls - Only for Managers */}
              {isManager && classrooms && classrooms.length > 0 && meta?.links && (
                <nav id="Pagination" className="mt-6">
                  <ul className="flex items-center justify-center gap-3">
                    {meta.links
                      ?.filter((link: { label: string; url: string | null }) => link.label !== "..." && link.url !== null)
                      .map((link: { label: string; url: string | null; active: boolean }, idx: number) => {
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
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#DCDEDD]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-[12px] flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-brand-dark text-xl font-bold">Delete Classroom</h3>
                    <p className="text-brand-dark text-sm font-normal">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#EF3F09] transition-all duration-200"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <p className="text-gray-600 text-base mb-6 text-center">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-brand-dark">"{deleteModal.classroom?.name}"</span>?
              </p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={closeDeleteModal}
                  className="btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] transition-all duration-300 px-6 py-3"
                >
                  <span className="text-brand-dark text-base font-medium">Cancel</span>
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeletingClassroom}
                  className={`btn-secondary bg-red-600 hover:bg-red-700 rounded-[12px] transition-all duration-300 px-6 py-3 flex items-center gap-2 ${
                    isDeletingClassroom ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeletingClassroom && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span className="text-white text-base font-semibold">
                    {isDeletingClassroom ? 'Deleting...' : 'Delete'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classrooms;