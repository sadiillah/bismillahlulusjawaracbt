import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  BookOpen, 
  GraduationCap,
  Clock,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFetchTopic, useDeleteTopic } from '../../../hooks/useTopics';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../../components/sidebars';
import { toast } from 'sonner';

const TopicDetails = () => {
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
  const topicId = id ? parseInt(id, 10) : 0;
  const { data: topic, isLoading: topicLoading } = useFetchTopic(topicId);
  const { mutate: deleteTopic, isPending: deletePending } = useDeleteTopic();

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

  // Handle delete topic
  const handleDeleteTopic = () => {
    if (!topic) return;
    
    deleteTopic(topic.id, {
      onSuccess: () => {
        toast.success('Topic deleted successfully!');
        navigate('/dashboard/topics');
      },
      onError: () => {
        toast.error('Failed to delete topic');
      }
    });
  };

  if (topicLoading) {
    return (
      <div className="min-h-screen bg-white flex">
        {renderSidebar()}
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF3F09] mx-auto mb-4"></div>
            <p className="text-brand-dark">Loading topic details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-white flex">
        {renderSidebar()}
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Topic Not Found</h2>
            <p className="text-gray-600 mb-6">The topic you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/dashboard/topics"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EF3F09] hover:brightness-110"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
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
        {/* Banner Header */}
        <div className="w-full h-[180px] bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]"></div>

        {/* Dashboard Content */}
        <main className="main-content flex-1 p-5">
          {/* Breadcrumb */}
          <div className="mb-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/dashboard" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link to="/dashboard/topics" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">
                Topics
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-brand-dark font-medium">{topic.name}</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6">
            <div className="flex items-center justify-between pl-2 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-20 h-18 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                  {topic.photo ? (
                    <img
                      src={topic.photo}
                      alt={topic.name}
                      className="w-full h-full object-cover rounded-[26px]"
                    />
                  ) : (
                    <>
                      <div className="w-full h-full absolute bg-[#C5E151] rounded-[26px]"></div>
                      <BookOpen className="w-10 h-10 text-[#324700] relative z-10" />
                    </>
                  )}
                </div>
                <div>
                  <h1 className="text-brand-dark text-3xl font-extrabold mb-2">{topic.name}</h1>
                  <p className="text-brand-dark text-base font-normal">Topic Details and Information</p>
                </div>
              </div>
              {isManager && (
                <div className="flex items-center gap-3">
                  <Link
                    to={`/dashboard/topics/${topic.id}/edit`}
                    className="btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] transition-all duration-300 px-4 py-3 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4 text-brand-dark" />
                    <span className="text-brand-dark text-sm font-medium">Edit Topic</span>
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-secondary border border-red-300 rounded-[12px] hover:bg-red-50 transition-all duration-300 px-4 py-3 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 text-sm font-medium">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Topic Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Details */}
            <div className="lg:col-span-2">
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">Topic Information</h3>
                </div>
                <div className="bg-white rounded-[20px] px-6 py-6">
                  <div className="space-y-6">
                    {/* Topic Name */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">Topic Name</label>
                      <div className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] bg-gray-50">
                        <span className="text-brand-dark font-medium">{topic.name}</span>
                      </div>
                    </div>

                    {/* About */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">About Topic</label>
                      <div className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] bg-gray-50 min-h-[120px]">
                        <p className="text-brand-dark leading-relaxed">
                          {topic.about || 'No description available'}
                        </p>
                      </div>
                    </div>

                    {/* Creation Date */}
                    <div>
                      <label className="block text-brand-dark text-sm font-semibold mb-2">Created Date</label>
                      <div className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] bg-gray-50">
                        <span className="text-brand-dark font-medium">
                          {topic.created_at ? new Date(topic.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* Photo Display */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">Topic Photo</h3>
                </div>
                <div className="bg-white rounded-[20px] px-6 py-6">
                  {topic.photo ? (
                    <img
                      src={topic.photo}
                      alt={topic.name}
                      className="w-full h-48 object-cover rounded-[16px] border border-[#DCDEDD]"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-[16px] flex items-center justify-center border border-[#DCDEDD]">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                        <span className="text-purple-600 font-medium">No Photo</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
                <div className="mb-4">
                  <h3 className="text-brand-dark text-lg font-bold ml-5">Quick Stats</h3>
                </div>
                <div className="bg-white rounded-[20px] px-6 py-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C5E151] rounded-[12px] flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-[#0C1C3C]" />
                      </div>
                      <div>
                        <p className="text-brand-dark text-sm font-medium">Total Subjects</p>
                        <p className="text-[#EF3F09] text-lg font-bold">{topic.subjects_count || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#82D9D7] rounded-[12px] flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#0C1C3C]" />
                      </div>
                      <div>
                        <p className="text-brand-dark text-sm font-medium">Last Updated</p>
                        <p className="text-[#EF3F09] text-sm font-medium">
                          {topic.updated_at ? new Date(topic.updated_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                    <h3 className="text-brand-dark text-xl font-bold">Delete Topic</h3>
                    <p className="text-brand-dark text-sm font-normal">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
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
                <span className="font-semibold text-brand-dark">"{topic.name}"</span>?
              </p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] transition-all duration-300 px-6 py-3"
                >
                  <span className="text-brand-dark text-base font-medium">Cancel</span>
                </button>
                <button
                  onClick={handleDeleteTopic}
                  disabled={deletePending}
                  className={`btn-secondary bg-red-600 hover:bg-red-700 rounded-[12px] transition-all duration-300 px-6 py-3 flex items-center gap-2 ${
                    deletePending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deletePending && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span className="text-white text-base font-semibold">
                    {deletePending ? 'Deleting...' : 'Delete'}
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

export default TopicDetails;