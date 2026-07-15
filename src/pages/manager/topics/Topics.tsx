import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { BookOpen, Layers, GraduationCap, Clock, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchTopics, useSearchTopicsWithPagination, useDeleteTopic } from '../../../hooks/useTopics';
import { useStatistics } from '../../../hooks/useStatistics';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { DeleteConfirmationModal } from '../../../components/modals';
import type { Topic, ApiError } from '../../../types';
import { toast } from 'sonner';

const Topics = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  // Fetch paginated topics data for display
  const { data: topicData, isLoading, error } = useFetchTopics(currentPage);
  
  // Fetch statistics data efficiently
  const { data: statistics } = useStatistics(['topics', 'subjects']);
  
  // Fetch search results with pagination (only when there's a search query)
  const { data: searchData, isLoading: isSearchLoading } = useSearchTopicsWithPagination(searchQuery, currentPage);
  
  const { mutate: deleteTopic, isPending: isDeletingTopic } = useDeleteTopic();

  // Use search data if there's a search query, otherwise use regular data
  const currentData = searchQuery ? searchData : topicData;
  const currentLoading = searchQuery ? isSearchLoading : isLoading;
  
  // Extract topics from current data
  const topics = useMemo(() => {
    if (!currentData) return [];
    return currentData.data || [];
  }, [currentData]);

  // Extract meta for pagination
  const meta = currentData?.meta;

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate statistics using API data
  const stats = useMemo(() => {
    return {
      total: statistics?.topics_total || 0,
      active: statistics?.topics_total || 0, // All topics are considered active
      totalSubjects: statistics?.subjects_total || 0,
      recent: statistics?.topics_total || 0, // For now, all are considered recent
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

  const handleDeleteTopic = (topic: Topic) => {
    setTopicToDelete(topic);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTopicToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (!topicToDelete) return;

    deleteTopic(topicToDelete.id, {
      onSuccess: () => {
        toast.success('Topic deleted successfully!');
        setIsDeleteModalOpen(false);
        setTopicToDelete(null);
      },
      onError: (error: AxiosError<ApiError> | Error) => {
        let errorMessage = 'Failed to delete topic';
        
        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.error || error.response?.data?.message || 
            'Unable to delete this topic. It may be assigned to subjects or contain related content.';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        setIsDeleteModalOpen(false);
        setTopicToDelete(null);
      },
    });
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
                <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Topic Management</h1>
                <p className="text-brand-dark text-base font-normal">Manage academic topics and organize subjects across your institution</p>
              </div>
            </div>
          </div>

          {/* Stats Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Topics */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Topics</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.total}
                    </p>
                    <p className="text-success text-sm font-medium">+8 this month</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <BookOpen className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Topics */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Active Topics</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.active}
                    </p>
                    <p className="text-success text-sm font-medium">Currently in use</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                    <Layers className="w-6 h-6 text-[#0C1C3C] relative z-10" />
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
                      {stats.totalSubjects}
                    </p>
                    <p className="text-success text-sm font-medium">Across all topics</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                    <GraduationCap className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Topics */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Recent Topics</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.recent}
                    </p>
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

          {/* Search Section */}
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
                  placeholder="Search topics by name..."
                />
              </div>
            </div>
          </div>

          {/* Topics List Section */}
          <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-brand-dark text-lg font-bold ml-5">All Topics</h3>
              <div className="flex items-center gap-3 mr-2">
                <button className="btn-secondary text-sm px-4 py-2 rounded-lg border border-[#DCDEDD] hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-brand-dark text-sm font-medium">Filter</span>
                </button>
                {isManager && (
                  <Link
                    to="/dashboard/topics/add"
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
                // Loading state with card-like skeletons
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-[16px]"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                // Error state
                <div className="text-center text-red-500 py-8">
                  <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2">Failed to load topics</p>
                  <p className="text-sm text-gray-400">Please try refreshing the page</p>
                </div>
              ) : topics.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No topics found' : 'No topics created yet'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first topic.'}
                  </p>
                  {isManager && !searchQuery && (
                    <Link
                      to="/dashboard/topics/add"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Topic
                    </Link>
                  )}
                </div>
              ) : (
                // Topics grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="topic-card bg-white border border-gray-200 rounded-[16px] hover:shadow-lg transition-all duration-300 hover:border-[#EF3F09] overflow-hidden"
                    >
                      {/* Main clickable area */}
                      <Link to={`/dashboard/topics/${topic.id}`} className="block p-4 pb-2">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                            {topic.photo ? (
                              <img
                                src={topic.photo}
                                alt={topic.name}
                                className="w-full h-full object-cover rounded-[22px]"
                              />
                            ) : (
                              <>
                                <div className="w-full h-full absolute rounded-[22px] bg-[#C5E151]"></div>
                                <BookOpen className="w-6 h-6 relative z-10 text-[#0C1C3C]" />
                              </>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-brand-dark text-lg font-bold mb-1 hover:text-[#EF3F09] transition-colors duration-300">{topic.name}</h3>
                            <p className="text-[#EF3F09] text-sm font-medium">Created: {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {topic.about || 'No description available...'}
                        </p>
                      </Link>
                      
                      {/* Action buttons area - not clickable to details */}
                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/dashboard/topics/${topic.id}`}
                            className="btn-details border border-[#DCDEDD] rounded-xl hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="w-4 h-4 text-brand-dark" />
                            <span className="text-brand-dark text-sm font-medium">Details</span>
                          </Link>
                          
                          {isManager && (
                            <>
                              <Link
                                to={`/dashboard/topics/${topic.id}/edit`}
                                className="btn-details border border-[#DCDEDD] rounded-xl hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Edit className="w-4 h-4 text-brand-dark" />
                                <span className="text-brand-dark text-sm font-medium">Edit</span>
                              </Link>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTopic(topic);
                                }}
                                className="btn-details border border-[#DCDEDD] rounded-xl hover:border-red-300 focus:border-red-300 transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                                <span className="text-red-600 text-sm font-medium">Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            
              
              {/* Pagination Controls - Following subjects pattern */}
              {topics && topics.length > 0 && meta?.links && (
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
        title="Delete Topic"
        message="Are you sure you want to delete this topic? This action cannot be undone."
        isLoading={isDeletingTopic}
        itemName={topicToDelete?.name || ''}
      />
    </div>
  );
};

export default Topics;