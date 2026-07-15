import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  School,
  ClipboardList,
  Award, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentSidebar = ({ isOpen, onClose }: StudentSidebarProps) => {
  const location = useLocation();
  const { user, logout, getUserDisplayName } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-[#F7F7F7] flex flex-col fixed left-0 top-0 h-screen z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 relative flex items-center justify-center">
              <div className="w-14 h-14 absolute bg-brand-orange rounded-full"></div>
              <Building2 className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-brand-dark text-lg font-bold">Bismillahlulus</h1>
              <p className="text-brand-dark text-xs font-normal">Student Dashboard</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-6 py-4 space-y-6 flex-1 overflow-y-auto">
          {/* ACADEMICS Section */}
          <div>
            <h3 className="section-title">ACADEMICS</h3>
            <div className="space-y-3">
              {/* <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClose(); }}
                className={`nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 ${
                  isActive('/dashboard/overview') ? 'nav-link-active' : ''
                }`}
              >
                <Home className={`w-5 h-5 transition-colors duration-300 ${
                  isActive('/dashboard/overview') ? 'text-white' : 'text-gray-600 group-hover:!text-[#EF3F09]'
                }`} />
                <span className={`text-base font-medium transition-colors duration-300 ${
                  isActive('/dashboard/overview') ? 'text-brand-white font-semibold' : 'text-brand-dark group-hover:!text-[#EF3F09]'
                }`}>Dashboard</span>
              </a> */}

              <Link
                to="/dashboard/classrooms"
                onClick={() => onClose()}
                className={`nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 ${
                  location.pathname.startsWith('/dashboard/classrooms') ? 'nav-link-active' : ''
                }`}
              >
                <School className={`w-5 h-5 transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard/classrooms') ? 'text-white' : 'text-gray-600 group-hover:!text-[#EF3F09]'
                }`} />
                <span className={`text-base font-medium transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard/classrooms') ? 'text-brand-white font-semibold' : 'text-brand-dark group-hover:!text-[#EF3F09]'
                }`}>My Classrooms</span>
              </Link>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClose(); }}
                className={`nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 ${
                  location.pathname.startsWith('/dashboard/exams') ? 'nav-link-active' : ''
                }`}
              >
                <ClipboardList className={`w-5 h-5 transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard/exams') ? 'text-white' : 'text-gray-600 group-hover:!text-[#EF3F09]'
                }`} />
                <span className={`text-base font-medium transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard/exams') ? 'text-brand-white font-semibold' : 'text-brand-dark group-hover:!text-[#EF3F09]'
                }`}>My Exams</span>
              </a>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClose(); }}
                className={`nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 ${
                  location.pathname.startsWith('/dashboard/results') ? 'nav-link-active' : ''
                }`}
              >
                <Award className={`w-5 h-5 transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard/results') ? 'text-white' : 'text-gray-600 group-hover:!text-[#EF3F09]'
                }`} />
                <span className={`text-base font-medium transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard/results') ? 'text-brand-white font-semibold' : 'text-brand-dark group-hover:!text-[#EF3F09]'
                }`}>My Results</span>
              </a>
            </div>
          </div>

          {/* PERSONAL Section */}
          <div>
            {/* <h3 className="section-title">PERSONAL</h3>
            <div className="space-y-3">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClose(); }}
                className={`nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 ${
                  location.pathname.startsWith('/dashboard/profile') ? 'nav-link-active' : ''
                }`}
              >
                <User className={`w-5 h-5 transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard/profile') ? 'text-white' : 'text-gray-600 group-hover:!text-[#EF3F09]'
                }`} />
                <span className={`text-base font-medium transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard/profile') ? 'text-brand-white font-semibold' : 'text-brand-dark group-hover:!text-[#EF3F09]'
                }`}>My Profile</span>
              </a>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClose(); }}
                className={`nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 ${
                  isActive('/dashboard/settings') ? 'nav-link-active' : ''
                }`}
              >
                <Settings className={`w-5 h-5 transition-colors duration-300 ${
                  isActive('/dashboard/settings') ? 'text-white' : 'text-gray-600 group-hover:!text-[#EF3F09]'
                }`} />
                <span className={`text-base font-medium transition-colors duration-300 ${
                  isActive('/dashboard/settings') ? 'text-brand-white font-semibold' : 'text-brand-dark group-hover:!text-[#EF3F09]'
                }`}>Settings</span>
              </a> */}

              <button
                onClick={handleLogout}
                className="nav-link rounded-[20px] transition-all duration-300 group hover:bg-gray-50 w-full"
              >
                <LogOut className="w-5 h-5 text-gray-600 group-hover:!text-[#EF3F09] transition-colors duration-300" />
                <span className="text-brand-dark text-base font-medium group-hover:!text-[#EF3F09] transition-colors duration-300">Logout</span>
              </button>
            {/* </div> */}
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
              <p className="text-brand-dark text-base font-semibold">
                {getUserDisplayName()}
              </p>
              <p className="text-brand-dark text-base font-normal leading-7">
                Student
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;