import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../schemas/authSchemas';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Building2, Check } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const primaryRole = user.roles?.[0];
      switch (primaryRole) {
        case 'manager':
          navigate('/dashboard/overview', { replace: true });
          break;
        case 'teacher':
          navigate('/dashboard/subjects', { replace: true });
          break;
        case 'student':
          navigate('/dashboard/classrooms', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      loginSchema.parse(formData);
      
      // Attempt login
      await login(formData.email, formData.password);
      
      showSuccessToast('Login successful!', {
        description: 'Welcome back to Jawara CBT System'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const formErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formErrors);
      } else {
        // Handle login errors
        const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
        showErrorToast('Login Failed', {
          description: errorMessage
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="flex min-h-screen">
        {/* Left Column - Banner Image */}
        <div className="hidden md:block md:w-[calc(50%-80px)]">
          <div className="w-full h-full bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]"></div>
        </div>

        {/* Right Column - Login Form */}
        <div className="flex-1 flex flex-col justify-center px-12">
          {/* Login Form Section */}
          <div className="w-full max-w-md mx-auto bg-[#F7F7F7] rounded-[20px] pt-6 px-4 pb-4">
            {/* Header Section (Gray Background) */}
            <div className="mb-[50px]">
              <div className="flex items-center justify-center gap-4 ml-6">
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <div className="w-16 h-16 absolute bg-brand-orange rounded-full"></div>
                  <Building2 className="w-8 h-8 text-white relative z-10" />
                </div>
                <h1 className="text-brand-dark text-2xl font-extrabold">Bismillahlulus</h1>
              </div>
            </div>

            {/* Inner White Card */}
            <div className="bg-white rounded-[20px] px-8 pt-8 pb-8">
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-brand-dark text-3xl font-extrabold mb-2">Welcome Back</h2>
                <p className="text-brand-dark text-base font-normal">Please enter credentials to access account.</p>
              </div>

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Input */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Email Address <span className="text-brand-orange">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange focus:outline-none transition-all duration-300 font-medium ${
                        errors.email ? 'border-red-500' : ''
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-2">
                      <p className="text-red-600 text-sm">{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-brand-dark text-sm font-semibold mb-2">
                    Password <span className="text-brand-orange">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full pl-12 pr-12 py-3 border border-[#DCDEDD] rounded-[16px] focus:bg-white hover:border-brand-orange focus:border-brand-orange focus:outline-none transition-all duration-300 font-medium ${
                        errors.password ? 'border-red-500' : ''
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-brand-orange transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-brand-orange transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-2">
                      <p className="text-red-600 text-sm">{errors.password}</p>
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleInputChange}
                      className="hidden"
                      id="rememberCheckbox"
                    />
                    <div className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 border-2 border-[#DCDEDD] rounded-md flex items-center justify-center group-hover:border-brand-orange transition-colors duration-300 ${
                        formData.remember ? 'bg-brand-orange border-brand-orange' : ''
                      }`}>
                        <Check className={`w-3 h-3 text-white ${formData.remember ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      <span className="text-brand-dark text-sm font-medium select-none">Remember me</span>
                    </div>
                  </label>
                  <a href="#" className="text-brand-orange text-sm font-medium hover:underline transition-all duration-300">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full btn-secondary rounded-[16px] hover:rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-brand-white text-base font-semibold">
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </span>
                </button>

                {/* Divider */}
                {/* <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#DCDEDD]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div> */}

                {/* Social Login Buttons */}
                {/* <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-brand-orange focus:border-brand-orange focus:outline-none transition-all duration-300 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-brand-dark text-sm font-medium">Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-brand-orange focus:border-brand-orange focus:outline-none transition-all duration-300 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-brand-dark text-sm font-medium">Continue with Facebook</span>
                  </button>
                </div> */}
              </form>

              {/* Sign Up Link */}
              {/* <div className="text-center mt-8">
                <p className="text-brand-dark text-sm">
                  Don't have an account? 
                  <a href="#" className="text-brand-orange font-semibold hover:underline transition-all duration-300"> Sign up here</a>
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;