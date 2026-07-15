
import { useNavigate } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const getRedirectPath = () => {
    const role = user?.roles?.[0];
    
    switch (role) {
      case 'manager':
        return '/dashboard/overview';
      case 'teacher':
        return '/dashboard/subjects';
      case 'student':
        return '/dashboard/classrooms';
      default:
        return '/login'; // Fallback for users without roles or unauthenticated users
    }
  };

  const handleReturnToDashboard = () => {
    const redirectPath = getRedirectPath();
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-5">
      <div className="max-w-md w-full">
        <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
          <div className="bg-white rounded-[20px] px-6 pt-8 pb-8 text-center">
            <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-6">
              <div className="w-full h-full absolute icon-bg-orange rounded-[22px]"></div>
              <Shield className="w-6 h-6 text-brand-dark relative z-10" />
            </div>
            
            <h1 className="text-brand-dark text-4xl font-extrabold leading-none mb-4">
              Access Denied
            </h1>
            
            <p className="text-brand-dark text-lg font-medium mb-8">
              You don't have permission to access this page.
            </p>
            
            <button
              onClick={handleReturnToDashboard}
              className="btn-secondary w-full border border-[#DCDEDD] rounded-[16px] hover:rounded-[12px] focus:rounded-[12px] focus:bg-white hover:border-brand-orange focus:border-brand-orange transition-all duration-300 px-4 py-3"
            >
              <Home className="w-4 h-4 text-gray-600" />
              <span className="text-brand-dark text-sm font-medium">
                {user?.roles?.[0] ? 'Return to Dashboard' : 'Return to Login'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;