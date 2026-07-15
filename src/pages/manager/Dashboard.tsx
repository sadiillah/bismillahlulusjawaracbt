import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ManagerSidebar, TeacherSidebar, StudentSidebar } from '../../components/sidebars';
import { 
  Search, 
  HelpCircle, 
  ClipboardList, 
  CheckCircle, 
  Award, 
  GraduationCap,
  Plus,
  UserPlus,
  Users,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useFetchExams } from '../../hooks/useExams';
import { usePaginatedUsers } from '../../hooks/useUsers';
import { useStatistics } from '../../hooks/useStatistics';

const ManagerDashboard = () => {
  const { user } = useAuth();
  
  // Determine user role
  const role = user?.roles?.[0];
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch statistics data efficiently
  const { data: statistics, isLoading: statisticsLoading } = useStatistics(['class_students', 'teachers', 'class_rooms', 'exam_questions', 'subject_exams']);
  const { data: examsData, isLoading: examsLoading } = useFetchExams(1); // First page only for dashboard
  const { data: usersData } = usePaginatedUsers(1, 5); // Latest 5 users for dashboard
  
  // Extract arrays from paginated responses
  const exams = examsData?.data || [];
  const users = usersData?.data || [];

  // Calculate statistics from real data
  const stats = {
    totalQuestions: statistics?.exam_questions_total || 0,
    activeExams: statistics?.subject_exams_total || 0,
    completionRate: 88.7, // Static - can be calculated from exam attempts
    averageScore: 82.4, // Static - can be calculated from performance metrics
    totalStudents: statistics?.class_students_total || 0,
    totalTeachers: statistics?.teachers_total || 0,
    totalClassrooms: statistics?.class_rooms_total || 0
  };

  // Loading state
  const isLoading = statisticsLoading || examsLoading;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex">
        {renderSidebar()}
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-brand-dark">Loading dashboard...</p>
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
        <div className="w-full h-[250px] bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]"></div>

        {/* Dashboard Content */}
        <main className="flex-1 p-5">
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
                  placeholder="Search employees, tasks, reports, projects..."
                />
              </div>
            </div>
          </div>

          {/* Stats Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Questions Card (spans 2 rows on the left) */}
            <div className="lg:row-span-2 bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2 flex flex-col">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Total Questions
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-8">
                    <div className="w-full h-full absolute icon-bg-green rounded-[22px]"></div>
                    <HelpCircle className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                  <p className="text-brand-dark text-6xl font-extrabold leading-none mb-4">
                    {stats.totalQuestions.toLocaleString()}
                  </p>
                  <p className="text-brand-dark text-lg font-medium">
                    Questions in database
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm font-semibold">+156 this month</span>
                </div>
              </div>
            </div>

            {/* Row 1 Stats Cards */}
            {/* Active Exams */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Active Exams
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.activeExams}
                    </p>
                    <p className="text-success text-sm font-medium">
                      +5 this week
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute icon-bg-green rounded-[22px]"></div>
                    <ClipboardList className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Completion Rate
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.completionRate}%
                    </p>
                    <p className="text-success text-sm font-medium">
                      +3.2% from last month
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute icon-bg-blue rounded-[22px]"></div>
                    <CheckCircle className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card (spans 2 rows on the right) */}
            <div className="lg:row-span-2 bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Quick Actions
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="space-y-3">
                  <Link
                    to="/dashboard/exams"
                    className="btn-secondary w-full text-left rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-brand-orange transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-3"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span className="text-brand-white text-sm font-semibold">Create New Exam</span>
                  </Link>

                  <Link
                    to="/dashboard/students"
                    className="btn-secondary w-full text-left border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3"
                  >
                    <UserPlus className="w-4 h-4 text-gray-600" />
                    <span className="text-brand-dark text-sm font-medium">Add Student</span>
                  </Link>

                  <Link
                    to="/dashboard/subjects"
                    className="btn-secondary w-full text-left border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3"
                  >
                    <GraduationCap className="w-4 h-4 text-gray-600" />
                    <span className="text-brand-dark text-sm font-medium">Manage Subjects</span>
                  </Link>

                  <Link
                    to="/dashboard/classrooms"
                    className="btn-secondary w-full text-left border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3"
                  >
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-brand-dark text-sm font-medium">Create Classroom</span>
                  </Link>

                  {/* <button
                    className="btn-secondary w-full text-left border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3"
                  >
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                    <span className="text-brand-dark text-sm font-medium">View Analytics</span>
                  </button> */}
                </div>
              </div>
            </div>

            {/* Row 2 Stats Cards */}
            {/* Average Score */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Average Score
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.averageScore}
                    </p>
                    <p className="text-success text-sm font-medium">
                      +4.2 points higher
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute icon-bg-orange rounded-[22px]"></div>
                    <Award className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Students */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Total Students
                </h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">
                      {stats.totalStudents.toLocaleString()}
                    </p>
                    <p className="text-success text-sm font-medium">
                      +89 new enrollments
                    </p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute icon-bg-green rounded-[22px]"></div>
                    <GraduationCap className="w-6 h-6 text-brand-dark relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Employee and Team Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Latest Users */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Latest Users
                </h3>
                <Link
                  to="/dashboard/teachers"
                  className="btn-secondary text-sm px-3 py-1 rounded-lg hover:brightness-110 transition-all duration-300 mr-2"
                >
                  <span className="text-brand-orange text-sm font-medium">View All</span>
                </Link>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-4">
                {users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user, index) => (
                      <div key={user.id || index} className="flex items-center gap-3">
                        <img 
                          src={user.photo || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face`}
                          alt={user.name} 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-brand-dark text-lg font-bold">
                              {user.name}
                            </p>
                            <span className="badge-expert px-2 py-1 rounded-md text-xs font-semibold">{user.roles?.[0] || 'User'}</span>
                          </div>
                          <p className="text-brand-dark text-sm font-normal mt-1">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          to={user.roles?.[0] === 'teacher' ? `/dashboard/teachers/${user.id}` : `/dashboard/students/${user.id}`}
                          className="btn-details border border-[#DCDEDD] rounded-xl hover:border-brand-orange focus:border-brand-orange transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4 text-brand-dark" />
                          <span className="text-brand-dark text-sm font-medium">Details</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No users yet</h4>
                    <p className="text-gray-600 mb-4">Start by adding teachers and students to your system.</p>
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to="/dashboard/add-teacher"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300 text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Teacher
                      </Link>
                      <Link
                        to="/dashboard/add-student"
                        className="inline-flex items-center gap-2 px-3 py-2 border border-[#EF3F09] text-[#EF3F09] rounded-lg hover:bg-[#EF3F09] hover:text-white transition-all duration-300 text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Student
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Latest Exams */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">
                  Latest Exams
                </h3>
                <Link
                  to="/dashboard/exams"
                  className="btn-secondary text-sm px-3 py-1 rounded-lg hover:brightness-110 transition-all duration-300 mr-2"
                >
                  <span className="text-brand-orange text-sm font-medium">View All</span>
                </Link>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-4">
                {exams && exams.length > 0 ? (
                  <div className="space-y-6">
                    {exams.slice(0, 5).map((exam, index) => (
                      <div key={exam.id || index} className="flex items-center gap-3">
                        <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                          {exam.subject?.topic?.photo ? (
                            <img 
                              src={exam.subject.topic.photo} 
                              alt={exam.subject.topic.name || exam.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full absolute inset-0 rounded-[22px] flex items-center justify-center ${
                              exam.subject?.topic?.photo ? 'hidden' : 'flex'
                            } ${
                              index % 3 === 0 ? 'icon-bg-green' : 
                              index % 3 === 1 ? 'icon-bg-orange' : 'icon-bg-blue'
                            }`}
                          >
                            <ClipboardList className="w-6 h-6 text-brand-dark" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-brand-dark text-lg font-bold">
                              {exam.name}
                            </p>
                          </div>
                          <p className="text-brand-orange text-sm font-medium">
                            Ended: {new Date(exam.ended_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Link
                          to={`/dashboard/exams/${exam.id}`}
                          className="btn-details border border-[#DCDEDD] rounded-xl hover:border-brand-orange focus:border-brand-orange transition-all duration-300 py-2 px-3 flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4 text-brand-dark" />
                          <span className="text-brand-dark text-sm font-medium">Details</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No exams created yet</h4>
                    <p className="text-gray-600 mb-4">Create your first exam to start assessing students.</p>
                    <Link
                      to="/dashboard/subjects"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF3F09] text-white rounded-lg hover:brightness-110 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Create Exam
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;