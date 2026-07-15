import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  School,
  CheckCircle,
  Home,
  ChevronRight,
  Building2,
  Users,
  ListChecks,
  ClipboardList,
  Award,
  BarChart3,
  Settings,
  FileText,
  ShieldCheck,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useFetchClassroom, useFetchAvailableSubjectsPaginated, useBulkAssignSubjects, type AvailableSubjectsPaginatedResponse } from '../../../hooks/useClassrooms';
import { toast } from 'sonner';
import type { Subject } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

const AssignSubjects = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const classroomId = parseInt(id || '0');
  const { user, logout } = useAuth();

  // State
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  // API Hooks
  const { 
    data: classroom, 
    isLoading: isLoadingClassroom,
    error: classroomError 
  } = useFetchClassroom(classroomId);
  
  const { 
    data: paginatedResponse, 
    isLoading: isLoadingSubjects,
    error: subjectsError 
  } = useFetchAvailableSubjectsPaginated(classroomId, currentPage, 6, searchQuery);

  const bulkAssignMutation = useBulkAssignSubjects();

  // Form state
  const [formError, setFormError] = useState<string>('');

  // Handle pagination and search
  useEffect(() => {
    if (paginatedResponse?.data) {
      if (currentPage === 1) {
        // First page or search results - replace existing subjects
        setAllSubjects(paginatedResponse.data);
      } else {
        // Additional pages - append to existing subjects
        setAllSubjects(prev => [...prev, ...paginatedResponse.data]);
      }
    }
  }, [paginatedResponse, currentPage]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
    setAllSubjects([]);
  }, [searchQuery]);

  // Filter subjects based on search (prioritize allSubjects, fallback to paginatedResponse.data only for initial load)
  const filteredSubjects = useMemo(() => {
    // Use allSubjects if it has data OR if search is active
    // Only use API fallback for initial load when no search is active
    const response = paginatedResponse as AvailableSubjectsPaginatedResponse | undefined;
    const subjects = (allSubjects.length > 0 || searchQuery) 
      ? allSubjects 
      : (response?.data || []);
    return subjects;
  }, [allSubjects, paginatedResponse, searchQuery]);

  // Handle subject selection
  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Handle load more
  const handleLoadMore = () => {
    const response = paginatedResponse as AvailableSubjectsPaginatedResponse | undefined;
    if (response?.has_more && !isLoadingSubjects) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Handle form submission
  const handleAssignSubjects = () => {
    if (selectedSubjects.length === 0) {
      setFormError('Please select at least one subject to assign');
      return;
    }

    setFormError('');
    
    bulkAssignMutation.mutate(
      { classroomId, subjectIds: selectedSubjects },
      {
        onSuccess: () => {
          toast.success('Subjects assigned successfully!');
          navigate(`/dashboard/classrooms/${classroomId}`);
        },
        onError: (error: unknown) => {
          const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to assign subjects';
          toast.error(message);
          setFormError(message);
        },
      }
    );
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle classroom loading and error states
  if (isLoadingClassroom) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#EF3F09] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading classroom...</p>
          </div>
        </div>
      </div>
    );
  }

  if (classroomError || !classroom) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {classroomError?.message || 'Classroom not found'}
            </p>
            <Link
              to="/dashboard/classrooms"
              className="text-[#EF3F09] hover:underline"
            >
              Back to Classrooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-[#F7F7F7] flex flex-col fixed left-0 top-0 h-screen">
          {/* Logo Section */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 relative flex items-center justify-center">
                <div className="w-14 h-14 absolute bg-[#EF3F09] rounded-full"></div>
                <Building2 className="w-7 h-7 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-brand-dark text-lg font-bold">JawaraCBT</h1>
                <p className="text-brand-dark text-xs font-normal">Manager Sidebar</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="px-6 py-4 space-y-6">
            {/* GENERAL Section */}
            <div>
              <h3 className="section-title">GENERAL</h3>
              <div className="space-y-3">
                <Link to="/dashboard/overview" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <Home className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Overview</span>
                </Link>

                {/* Users/Employees Section */}
                <div>
                  <div className="nav-link rounded-[20px] transition-all duration-300 w-full justify-between group">
                    <div className="flex items-center gap-[10px]">
                      <Users className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                      <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Users</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:!text-[#EF3F09]" />
                  </div>
                  <div className="pl-6 pt-2 space-y-2">
                    <Link to="/dashboard/teachers" className="nav-link rounded-[16px] transition-all duration-300 text-sm hover:bg-gray-50">
                      <span className="text-brand-dark text-sm font-normal hover:!text-[#EF3F09] transition-colors duration-300">Teachers</span>
                    </Link>
                    <Link to="/dashboard/students" className="nav-link rounded-[16px] transition-all duration-300 text-sm hover:bg-gray-50">
                      <span className="text-brand-dark text-sm font-normal hover:!text-[#EF3F09] transition-colors duration-300">Students</span>
                    </Link>
                  </div>
                </div>

                {/* Schools Section */}
                <div>
                  <div className="nav-link rounded-[20px] transition-all duration-300 w-full justify-between group">
                    <div className="flex items-center gap-[10px]">
                      <School className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                      <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Schools</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:!text-[#EF3F09]" />
                  </div>
                  <div className="pl-6 pt-2 space-y-2">
                    <Link to="/dashboard/topics" className="nav-link rounded-[16px] transition-all duration-300 text-sm hover:bg-gray-50">
                      <span className="text-brand-dark text-sm font-normal hover:!text-[#EF3F09] transition-colors duration-300">Topics</span>
                    </Link>
                    <Link to="/dashboard/subjects" className="nav-link rounded-[16px] transition-all duration-300 text-sm hover:bg-gray-50">
                      <span className="text-brand-dark text-sm font-normal hover:!text-[#EF3F09] transition-colors duration-300">Subjects</span>
                    </Link>
                    <Link to="/dashboard/classrooms" className="nav-link-active rounded-[16px] transition-all duration-300 text-sm">
                      <span className="text-brand-white text-sm font-semibold">Classrooms</span>
                    </Link>
                  </div>
                </div>

                <Link to="/dashboard/projects" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <ListChecks className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Projects</span>
                </Link>

                <Link to="/dashboard/exams" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <ClipboardList className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Exams</span>
                </Link>

                <Link to="/dashboard/grades" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <Award className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Grades</span>
                </Link>
              </div>
            </div>

            {/* OTHERS Section */}
            <div>
              <h3 className="section-title">OTHERS</h3>
              <div className="space-y-3">
                <div>
                  <div className="nav-link rounded-[20px] transition-all duration-300 w-full justify-between group">
                    <div className="flex items-center gap-[10px]">
                      <BarChart3 className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                      <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Analytics</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:!text-[#EF3F09]" />
                  </div>
                </div>

                <Link to="/dashboard/settings" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <Settings className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Settings</span>
                </Link>

                <Link to="/dashboard/reports" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <FileText className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Exam Reports</span>
                </Link>

                <Link to="/dashboard/security" className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50">
                  <ShieldCheck className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">System Security</span>
                </Link>

                <button onClick={handleLogout} className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 w-full text-left">
                  <LogOut className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                  <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Logout</span>
                </button>
              </div>
            </div>
          </nav>

          {/* User Profile at Bottom */}
          <div className="px-6 pb-6 mt-auto">
            <div className="flex items-center gap-3">
              <img 
                src={user?.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} 
                alt="User Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="text-left">
                <p className="text-brand-dark text-base font-semibold">{user?.name || 'Manager'}</p>
                <p className="text-brand-dark text-base font-normal leading-7">Manager</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="main-content flex-1 p-5">
            {/* Breadcrumb */}
            <div className="mt-[50px] mb-4 ml-[50px]">
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/dashboard/overview" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Dashboard</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to="/dashboard/overview" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Schools</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to="/dashboard/classrooms" className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Classrooms</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link to={`/dashboard/classrooms`} className="text-gray-500 hover:text-[#EF3F09] transition-colors duration-300">Classroom Details</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-brand-dark font-medium">Assign Subjects</span>
              </nav>
            </div>

            {/* Page Header */}
            <div className="bg-white rounded-[20px] mb-6 pt-6 pb-6 ml-[48px] max-w-[calc(70rem-100px)]">
              <div className="flex items-center justify-between pl-2 pr-2">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative flex items-center justify-center rounded-[26px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[26px]"></div>
                    <School className="w-10 h-10 text-[#0C1C3C] relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-brand-dark text-3xl font-extrabold mb-2">Assign Subjects to Classroom</h1>
                    <p className="text-brand-dark text-base font-normal">Select subjects to assign to this classroom</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => navigate('/dashboard/classrooms')}
                    className="px-4 py-3 border border-[#DCDEDD] rounded-[12px] font-medium hover:border-[#EF3F09] transition-all duration-300 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#0C1C3C]" />
                    <span className="text-[#0C1C3C]">Back</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Subject Assignment Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 pl-2 pr-2 pb-2 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)]">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Subject Assignment</h3>
              </div>
              <div className="flex gap-4">
                {/* Subject Selection Content */}
                <div className="bg-white rounded-[20px] px-6 py-6 w-full">
                  
                  {/* Search Section */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-brand-dark text-lg font-bold">Available Subjects</h3>
                    <div className="flex-1 relative max-w-md ml-4">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[#DCDEDD] rounded-[12px] focus:bg-white hover:border-[#EF3F09] focus:border-[#EF3F09] transition-all duration-300"
                        placeholder="Search subjects..."
                      />
                    </div>
                  </div>
                  
                  {/* Subject Grid */}
                  {(isLoadingSubjects && currentPage === 1) || (!paginatedResponse && isLoadingSubjects) ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-[#EF3F09] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading available subjects...</p>
                    </div>
                  ) : subjectsError ? (
                    <div className="text-center py-12">
                      <School className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <p className="text-red-600 text-lg mb-2">Failed to load subjects</p>
                      <p className="text-gray-500 text-sm">{subjectsError.message}</p>
                    </div>
                  ) : filteredSubjects.length === 0 && (paginatedResponse as AvailableSubjectsPaginatedResponse | undefined) ? (
                    <div className="text-center py-12">
                      <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {searchQuery ? 'No subjects found matching your search' : 'No available subjects to assign'}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-[#EF3F09] hover:underline mt-2"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 pt-4 pl-4 pb-4">
                        {filteredSubjects.map((subject: Subject) => {
                          const isSelected = selectedSubjects.includes(subject.id);
                          return (
                            <label 
                              key={subject.id}
                              className={`group card flex flex-col w-full rounded-[12px] border transition-all duration-300 cursor-pointer ${
                                isSelected 
                                  ? 'border-[#EF3F09] ring-2 ring-[#EF3F09] ring-offset-2' 
                                  : 'border-[#DCDEDD] hover:border-[#EF3F09]'
                              }`}
                            >
                              <div className="p-4 flex gap-4 items-center">
                                <div className="relative flex-shrink-0">
                                  <img 
                                    src={subject.photo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f'} 
                                    alt={subject.name} 
                                    className="w-28 h-20 object-cover rounded-[8px]" 
                                  />
                                  <span className="absolute bottom-2 left-1 text-[#0C1C3C] text-xs font-semibold bg-[#C5E151] px-1 py-0.5 rounded shadow-lg">
                                    {subject.topic?.name || 'General'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-brand-dark text-base font-semibold mb-3">{subject.name}</h5>
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={subject.teacher?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'} 
                                      alt={subject.teacher?.name || 'Teacher'} 
                                      className="w-6 h-6 rounded-full object-cover" 
                                    />
                                    <span className="text-gray-500 text-xs">{subject.teacher?.name || 'No teacher assigned'}</span>
                                  </div>
                                </div>
                                <div className="relative flex items-center justify-center w-fit h-8 shrink-0 rounded-xl border border-[#DCDEDD] py-2 px-3 gap-2">
                                  <input 
                                    type="checkbox" 
                                    name="subject" 
                                    value={subject.id}
                                    checked={isSelected}
                                    onChange={() => handleSubjectToggle(subject.id)}
                                    className="hidden" 
                                  />
                                  <div className={`flex size-[18px] rounded-full shadow-sm border transition-all duration-300 ${
                                    isSelected 
                                      ? 'border-[5px] border-[#EF3F09]' 
                                      : 'border border-[#DCDEDD]'
                                  }`}></div>
                                  <p className="text-xs font-semibold">
                                    {isSelected ? 'Selected' : 'Select'}
                                  </p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      
                      {/* Load More Button */}
                      {(paginatedResponse as AvailableSubjectsPaginatedResponse | undefined)?.has_more && (
                        <div className="flex justify-center pt-4 pb-2">
                          <button
                            onClick={handleLoadMore}
                            disabled={isLoadingSubjects}
                            className="px-6 py-2 border border-[#EF3F09] text-[#EF3F09] rounded-[12px] font-medium hover:bg-[#EF3F09] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isLoadingSubjects ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>Loading...</span>
                              </>
                            ) : (
                              <span>Load More Subjects</span>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Selection Summary & Assignment Section */}
            <div className="bg-white rounded-[20px] pt-4 pb-6 ml-[48px] mb-[50px] max-w-[calc(70rem-100px)] mt-4">
              <div className="flex items-center justify-between px-6">
                <div>
                  <h4 className="text-brand-dark text-lg font-bold mb-1">Assignment Summary</h4>
                  <p className="text-gray-600 text-sm">
                    {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected for assignment to this classroom
                  </p>
                  {formError && (
                    <p className="text-red-600 text-sm mt-2">{formError}</p>
                  )}
                </div>
                <div>
                  <button 
                    type="button"
                    onClick={handleAssignSubjects}
                    disabled={selectedSubjects.length === 0 || bulkAssignMutation.isPending}
                    className="px-6 py-3 bg-[#EF3F09] text-white rounded-[12px] font-medium hover:bg-[#d63507] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {bulkAssignMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Assign Subjects</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AssignSubjects;