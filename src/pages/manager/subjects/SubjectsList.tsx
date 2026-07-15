import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { GraduationCap, Users, CheckCircle, Clock, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRoleBasedSubjects, useRoleBasedSearchSubjects, useDeleteSubject } from '../../../hooks/useSubjects';
import { useStatistics } from '../../../hooks/useStatistics';
import { ManagerSidebar, TeacherSidebar } from '../../../components/sidebars';
import { DeleteConfirmationModal } from '../../../components/modals';
import type { Subject, PaginatedResponse, ApiError } from '../../../types';

const SubjectsList = () => {
  const { user } = useAuth();
  
  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  
  
  // Hooks
  const { mutate: deleteSubject, isPending: isDeleting } = useDeleteSubject();
  
  // Fetch subjects based on user role and search query
  const { data: subjectData, isLoading } = useRoleBasedSubjects(currentPage);
  const { data: searchData, isLoading: isSearchLoading } = useRoleBasedSearchSubjects(searchQuery, currentPage);
  
  // Fetch statistics data efficiently
  const { data: statisticsData } = useStatistics(['subjects']);
  
  // Use search data if there's a search query, otherwise use regular data
  const currentData = searchQuery ? searchData : subjectData;
  const currentLoading = searchQuery ? isSearchLoading : isLoading;
  
  // Handle paginated response for both manager and teacher  
  const subjects: Subject[] = React.useMemo(() => {
    if (!currentData) return [];
    
    // Both manager and teacher now get paginated response
    if (currentData && 'data' in currentData) {
      return (currentData as PaginatedResponse<Subject>).data;
    }
    
    return [];
  }, [currentData]);

  // Extract meta for cleaner usage
  const meta = currentData?.meta;

  // Reset page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate statistics using API data
  const statistics = useMemo(() => {
    return {
      total: statisticsData?.subjects_total || 0,
      active: statisticsData?.subjects_total || 0, // All subjects are considered active
      assigned: statisticsData?.subjects_total || 0, // TODO: Need assigned_subjects count from API
      recent: statisticsData?.subjects_total || 0, // For now, all are considered recent
    };
  }, [statisticsData]);
 

  // Delete handlers
  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSubjectToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (!subjectToDelete) return;

    deleteSubject(subjectToDelete.id, {
      onSuccess: () => {
        toast.success('Subject deleted successfully');
        setIsDeleteModalOpen(false);
        setSubjectToDelete(null);
      },
      onError: (error: AxiosError<ApiError>) => {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Unable to delete this subject. It may be assigned to classrooms or contain exams with student submissions.';
        toast.error(errorMessage);
        setIsDeleteModalOpen(false);
        setSubjectToDelete(null);
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
                <h1 className="text-brand-dark text-3xl font-extrabold mb-2">{isTeacher ? 'Subjects Assigned to Me' : 'Subject Management'}</h1>
                <p className="text-brand-dark text-base font-normal">{isTeacher ? 'View and manage the subjects assigned to you by the institution' : 'Manage academic subjects, assign teachers, and organize curriculum across your institution'}</p>
              </div>
            </div>
          </div>

          {/* Stats Layout - Only for Managers */}
          {isManager && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Subjects */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Subjects</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">{statistics.total}</p>
                    <p className="text-success text-sm font-medium">+{Math.floor(statistics.total * 0.1)} this month</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <GraduationCap className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Subjects */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Active Subjects</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">{statistics.active}</p>
                    <p className="text-success text-sm font-medium">All subjects active</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <CheckCircle className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Teachers */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Assigned Teachers</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">{statistics.assigned}</p>
                    <p className="text-success text-sm font-medium">Teachers assigned</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <Users className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Recent Activity</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">{statistics.recent}</p>
                    <p className="text-success text-sm font-medium">Added this month</p>
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

          {/* Search Section */}
          <div className="bg-white rounded-[20px] mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300"
                  placeholder="Search subjects by name, teacher, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Subjects List Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">All Subjects</h3>
              <div className="flex items-center gap-3 mr-2">
                <button className="btn-secondary text-sm px-4 py-2 rounded-lg border border-[#DCDEDD] hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-brand-dark text-sm font-medium">Filter</span>
                </button>
                {isManager && (
                  <Link
                    to="/dashboard/add-subject"
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
              ) : subjects.length > 0 ? (
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="subject-card bg-white border border-gray-200 rounded-[16px] p-4 hover:shadow-lg transition-all duration-300 hover:border-[#EF3F09] hover:-translate-y-0.5"
                    >
                      <div className="mb-4 relative">
                        <img
                          src={subject.photo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop&auto=format'}
                          alt={subject.name}
                          className="w-full h-32 object-cover rounded-[12px] mb-3"
                        />
                        <span className="absolute bottom-2 right-2 text-[#0C1C3C] text-xs font-semibold bg-[#C5E151] px-2 py-1 rounded-lg shadow-lg">
                          {subject.topic?.name || 'General'}
                        </span>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-brand-dark text-lg font-bold mb-1">{subject.name}</h3>
                        <p className="text-gray-500 text-sm font-normal mb-2">
                          {subject.tagline || subject.about?.substring(0, 40) + '...' || 'No description available'}
                        </p>
                      </div>
                      
                      {/* Teacher Assignment */}
                      {subject.teacher && (
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={subject.teacher.photo || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'}
                            alt="Teacher"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-brand-dark text-sm font-medium">{subject.teacher.name}</p>
                            <p className="text-gray-500 text-xs">{subject.teacher.email}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/subjects/${subject.id}`}
                          className="btn-details border border-[#DCDEDD] rounded-xl hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 flex-1"
                        >
                          <Eye className="w-4 h-4 text-brand-dark" />
                          <span className="text-brand-dark text-sm font-medium">Details</span>
                        </Link>
                        
                        <Link
                          to={`/dashboard/subjects/${subject.id}/edit`}
                          className="btn-details border border-[#DCDEDD] rounded-xl hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 flex-1"
                        >
                          <Edit className="w-4 h-4 text-brand-dark" />
                          <span className="text-brand-dark text-sm font-medium">Edit</span>
                        </Link>
                        
                        {isManager && (
                          <button
                            onClick={() => handleDeleteClick(subject)}
                            className="btn-details border border-[#DCDEDD] rounded-xl hover:border-red-300 focus:border-red-300 transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 hover:bg-red-50"
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
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No subjects found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first subject.'}
                  </p>
                  {isManager && !searchQuery && (
                    <Link
                      to="/dashboard/add-subject"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Subject
                    </Link>
                  )}
                </div>
              )}

              {/* Pagination Controls - Following topics pattern */}
              {subjects && subjects.length > 0 && meta?.links && (
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
        itemName={subjectToDelete?.name || ''}
      />

    </div>
  );
};

export default SubjectsList;