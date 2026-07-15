import { useState, useEffect } from "react";
import type { AuthUser, UserRole } from "../types";
import { authService } from "../api/authService";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();  
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/") {
      setLoading(false);
      return;
    }
    
    const initializeUser = async () => { 
      try {
        const userData = await authService.fetchUser();
        if (userData) { 
          setUser(userData);
        } else {
          setUser(null); 
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);  
      }
      finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [location]);

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null); 
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Helper functions for role checking
  const hasRole = (role: UserRole): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const getUserDisplayName = (): string => {
    if (!user) return 'Guest';
    return user.name || user.email || 'User';
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading: loading,
    hasRole,
    hasAnyRole,
    getUserDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};