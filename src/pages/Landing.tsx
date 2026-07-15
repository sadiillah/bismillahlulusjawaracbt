import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ClipboardList, Users, GraduationCap, Shield, Award, TrendingUp, BookOpen, School, ArrowRight, Zap, Database, Mail, Phone, FileText, Menu, X } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <header className="bg-white shadow-lg border-b border-[#DCDEDD] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 relative flex items-center justify-center">
                <div className="w-12 h-12 absolute bg-[#EF3F09] rounded-full"></div>
                <Building2 className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-brand-dark text-xl font-bold">JawaraCBT</h1>
                <p className="text-brand-dark text-xs font-normal">Computer-Based Testing Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('capabilities')}
                className="text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200"
              >
                Capabilities
              </button>
              <button 
                onClick={() => scrollToSection('structure')}
                className="text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200"
              >
                Academic Structure
              </button>
              <button 
                onClick={() => scrollToSection('technology')}
                className="text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200"
              >
                Technology
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200"
              >
                Contact
              </button>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <button className="text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200">
                Request Demo
              </button>
              <button
                onClick={handleLoginClick}
                className="btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-2.5"
              >
                <span className="text-brand-white text-sm font-semibold">Sign In</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-[12px] border border-[#DCDEDD] flex items-center justify-center hover:border-[#EF3F09] transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-brand-dark" />
              ) : (
                <Menu className="w-5 h-5 text-brand-dark" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-[#DCDEDD] py-4">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-left text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200 py-2"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('capabilities')}
                  className="text-left text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200 py-2"
                >
                  Capabilities
                </button>
                <button 
                  onClick={() => scrollToSection('structure')}
                  className="text-left text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200 py-2"
                >
                  Academic Structure
                </button>
                <button 
                  onClick={() => scrollToSection('technology')}
                  className="text-left text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200 py-2"
                >
                  Technology
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-left text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200 py-2"
                >
                  Contact
                </button>
                <div className="flex flex-col gap-3 pt-4 border-t border-[#DCDEDD]">
                  <button className="text-left text-brand-dark text-sm font-medium hover:text-[#EF3F09] transition-colors duration-200">
                    Request Demo
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3"
                  >
                    <span className="text-brand-white text-sm font-semibold">Sign In</span>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Alternative Hero Section */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 bg-[#F7F7F7] text-[#EF3F09] px-4 py-2 rounded-full text-sm font-semibold">
                  <Shield className="w-4 h-4" />
                  Secure Online Examinations
                </span>
              </div>
              
              <h1 className="text-brand-dark text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Modern CBT Platform for 
                <span className="text-[#EF3F09]"> Education</span>
              </h1>
              
              <p className="text-brand-dark text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                Streamline your examination process with comprehensive role-based access, 
                real-time monitoring, and automated grading for educational institutions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleLoginClick}
                  className="btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-8 py-4"
                >
                  <span className="text-brand-white text-lg font-semibold">Access Platform</span>
                </button>
                <button 
                  onClick={() => scrollToSection('capabilities')}
                  className="btn-secondary border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] transition-all duration-300 px-8 py-4"
                >
                  <span className="text-brand-dark text-lg font-medium">Learn More</span>
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-brand-dark text-2xl font-extrabold">8,453</p>
                  <p className="text-brand-dark text-sm font-medium">Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-brand-dark text-2xl font-extrabold">892</p>
                  <p className="text-brand-dark text-sm font-medium">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-brand-dark text-2xl font-extrabold">99.9%</p>
                  <p className="text-brand-dark text-sm font-medium">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              {/* Main Dashboard Preview */}
              <div className="bg-[#F7F7F7] rounded-[20px] p-4 shadow-2xl">
                <div className="bg-white rounded-[16px] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-brand-dark text-lg font-bold">Exam Dashboard</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 text-sm font-medium">Live</span>
                    </div>
                  </div>
                  
                  {/* Mock Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#F7F7F7] rounded-[12px] p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative flex items-center justify-center rounded-[12px] overflow-hidden">
                          <div className="w-full h-full absolute bg-[#C5E151] rounded-[12px]"></div>
                          <ClipboardList className="w-5 h-5 text-[#0C1C3C] relative z-10" />
                        </div>
                        <div>
                          <p className="text-brand-dark text-xl font-bold">15</p>
                          <p className="text-brand-dark text-xs">Active Exams</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#F7F7F7] rounded-[12px] p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative flex items-center justify-center rounded-[12px] overflow-hidden">
                          <div className="w-full h-full absolute bg-[#82D9D7] rounded-[12px]"></div>
                          <Award className="w-5 h-5 text-[#0C1C3C] relative z-10" />
                        </div>
                        <div>
                          <p className="text-brand-dark text-xl font-bold">88.7%</p>
                          <p className="text-brand-dark text-xs">Completion</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock User List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-[#F7F7F7] rounded-[8px]">
                      <div className="w-8 h-8 bg-[#EF3F09] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-brand-dark text-sm font-semibold">Manager Dashboard</p>
                        <p className="text-gray-500 text-xs">System Overview</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#F7F7F7] rounded-[8px]">
                      <div className="w-8 h-8 bg-[#FAAC7B] rounded-full flex items-center justify-center">
                        <span className="text-[#0C1C3C] text-xs font-bold">T</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-brand-dark text-sm font-semibold">Teacher Portal</p>
                        <p className="text-gray-500 text-xs">Exam Creation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#F7F7F7] rounded-[8px]">
                      <div className="w-8 h-8 bg-[#82D9D7] rounded-full flex items-center justify-center">
                        <span className="text-[#0C1C3C] text-xs font-bold">S</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-brand-dark text-sm font-semibold">Student Interface</p>
                        <p className="text-gray-500 text-xs">Exam Taking</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-[12px] shadow-lg p-3 border border-[#DCDEDD]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 text-sm font-semibold">+156 this month</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-[12px] shadow-lg p-3 border border-[#DCDEDD]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#EF3F09]" />
                  <span className="text-[#EF3F09] text-sm font-semibold">99.9% Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Role-Based Features Section */}
        <div id="features" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-brand-dark text-3xl font-extrabold mb-4">Built for Every Role in Education</h2>
            <p className="text-brand-dark text-lg font-normal max-w-2xl mx-auto">
              Comprehensive role-based access control designed for managers, teachers, and students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Manager Card */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">For Managers</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-4">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <Users className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                  <h3 className="text-brand-dark text-xl font-bold mb-2">System Administration</h3>
                  <p className="text-brand-dark text-sm font-normal mb-4">
                    Complete platform oversight, user management, and academic structure setup
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">Manage 892 students & teachers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">32 classrooms organization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">Comprehensive analytics dashboard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Card */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">For Teachers</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-4">
                    <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                    <ClipboardList className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                  <h3 className="text-brand-dark text-xl font-bold mb-2">Exam Management</h3>
                  <p className="text-brand-dark text-sm font-normal mb-4">
                    Create exams, manage questions, and grade student submissions efficiently
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">8,453 questions in database</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">MCQ & essay question types</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">Real-time grading & feedback</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Card */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">For Students</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mx-auto mb-4">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                    <GraduationCap className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                  <h3 className="text-brand-dark text-xl font-bold mb-2">Secure Exam Taking</h3>
                  <p className="text-brand-dark text-sm font-normal mb-4">
                    Take exams in a secure environment with progress tracking and instant results
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">88.7% completion rate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">82.4 average score achievement</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">Resume-friendly exam sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* CBT Capabilities Section - Full Width Gray Background */}
      <section id="capabilities" className="py-16 bg-[#F7F7F7] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-brand-dark text-3xl font-extrabold mb-4">Advanced CBT Capabilities</h2>
            <p className="text-brand-dark text-lg font-normal max-w-2xl mx-auto">
              Comprehensive examination features designed for secure and efficient online testing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Question Types */}
            <div className="bg-white rounded-[20px] p-6">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                <ClipboardList className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <h3 className="text-brand-dark text-lg font-bold mb-2">Multiple Question Types</h3>
              <p className="text-brand-dark text-sm font-normal mb-4">
                Support for multiple choice (A, B, C, D) and essay questions with flexible point allocation
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#EF3F09]" />
                <span className="text-[#EF3F09] text-sm font-semibold">15 active exams</span>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-[20px] p-6">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                <Shield className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <h3 className="text-brand-dark text-lg font-bold mb-2">Advanced Security</h3>
              <p className="text-brand-dark text-sm font-normal mb-4">
                Session management, browser controls, timer enforcement, and automatic session recovery
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#EF3F09]" />
                <span className="text-[#EF3F09] text-sm font-semibold">99.9% uptime</span>
              </div>
            </div>

            {/* Real-time Monitoring */}
            <div className="bg-white rounded-[20px] p-6">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                <TrendingUp className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <h3 className="text-brand-dark text-lg font-bold mb-2">Real-time Monitoring</h3>
              <p className="text-brand-dark text-sm font-normal mb-4">
                Live exam supervision, completion tracking, and performance analytics dashboard
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#EF3F09]" />
                <span className="text-[#EF3F09] text-sm font-semibold">Live tracking</span>
              </div>
            </div>

            {/* Automated Grading */}
            <div className="bg-white rounded-[20px] p-6">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                <Award className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <h3 className="text-brand-dark text-lg font-bold mb-2">Automated Grading</h3>
              <p className="text-brand-dark text-sm font-normal mb-4">
                Instant MCQ scoring with manual essay grading capabilities and detailed feedback system
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#EF3F09]" />
                <span className="text-[#EF3F09] text-sm font-semibold">Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Academic Structure Section */}
        <div id="structure" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-brand-dark text-3xl font-extrabold mb-4">Academic Structure Management</h2>
            <p className="text-brand-dark text-lg font-normal max-w-2xl mx-auto">
              Organized hierarchy from topics to individual questions with comprehensive tracking
            </p>
          </div>

          {/* Hierarchy Flow */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4 bg-white rounded-[20px] px-8 py-6 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-2 mx-auto">
                  <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                  <School className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                </div>
                <p className="text-brand-dark text-sm font-bold">Topics</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#EF3F09]" />
              <div className="text-center">
                <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-2 mx-auto">
                  <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                  <BookOpen className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                </div>
                <p className="text-brand-dark text-sm font-bold">Subjects</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#EF3F09]" />
              <div className="text-center">
                <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-2 mx-auto">
                  <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                  <Users className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                </div>
                <p className="text-brand-dark text-sm font-bold">Classrooms</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#EF3F09]" />
              <div className="text-center">
                <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-2 mx-auto">
                  <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                  <ClipboardList className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                </div>
                <p className="text-brand-dark text-sm font-bold">Exams</p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Questions */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Questions</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">8,453</p>
                    <p className="text-success text-sm font-medium">+156 this month</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <ClipboardList className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Exams */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Active Exams</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">15</p>
                    <p className="text-success text-sm font-medium">+5 this week</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                    <Award className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Classrooms */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Total Classrooms</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">32</p>
                    <p className="text-success text-sm font-medium">+4 this semester</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                    <School className="w-6 h-6 text-[#0C1C3C] relative z-10" />
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
                    <p className="text-brand-dark text-3xl font-extrabold leading-tight my-2">892</p>
                    <p className="text-success text-sm font-medium">+89 new enrollments</p>
                  </div>
                  <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden">
                    <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                    <GraduationCap className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Technology & Performance Section - Full Width Gray Background */}
      <section id="technology" className="py-16 bg-[#F7F7F7] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-brand-dark text-3xl font-extrabold mb-4">Modern Technology Stack</h2>
            <p className="text-brand-dark text-lg font-normal max-w-2xl mx-auto">
              Built with cutting-edge technologies for performance, security, and scalability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Tech Stack */}
            <div className="bg-white rounded-[20px] p-6">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                <Zap className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <h3 className="text-brand-dark text-xl font-bold mb-4">Frontend Technology</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                  <span className="text-brand-dark text-sm font-medium">React 19.1.0 with TypeScript</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                  <span className="text-brand-dark text-sm font-medium">Vite build system for fast development</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                  <span className="text-brand-dark text-sm font-medium">TailwindCSS for consistent styling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                  <span className="text-brand-dark text-sm font-medium">React Query for efficient state management</span>
                </div>
              </div>
            </div>

            {/* Backend & Security */}
            <div className="bg-white rounded-[20px] p-6">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                <Database className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <h3 className="text-brand-dark text-xl font-bold mb-4">Backend & Security</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                  <span className="text-brand-dark text-sm font-medium">Laravel framework with PHP 8+</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                  <span className="text-brand-dark text-sm font-medium">Laravel Sanctum authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                  <span className="text-brand-dark text-sm font-medium">Spatie RBAC permission system</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                  <span className="text-brand-dark text-sm font-medium">MySQL/PostgreSQL optimization</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Response Time */}
            <div className="bg-white rounded-[20px] p-6 text-center">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4 mx-auto">
                <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                <Zap className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <p className="text-brand-dark text-3xl font-extrabold mb-2">&lt;200ms</p>
              <p className="text-brand-dark text-sm font-medium">Response Time</p>
            </div>

            {/* Concurrent Users */}
            <div className="bg-white rounded-[20px] p-6 text-center">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4 mx-auto">
                <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                <Users className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <p className="text-brand-dark text-3xl font-extrabold mb-2">1,000+</p>
              <p className="text-brand-dark text-sm font-medium">Concurrent Users</p>
            </div>

            {/* System Uptime */}
            <div className="bg-white rounded-[20px] p-6 text-center">
              <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4 mx-auto">
                <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                <Shield className="w-6 h-6 text-[#0C1C3C] relative z-10" />
              </div>
              <p className="text-brand-dark text-3xl font-extrabold mb-2">99.9%</p>
              <p className="text-brand-dark text-sm font-medium">System Uptime</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Getting Started & Contact Section */}
        <div id="contact" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-brand-dark text-3xl font-extrabold mb-4">Ready to Get Started?</h2>
            <p className="text-brand-dark text-lg font-normal max-w-2xl mx-auto">
              Join educational institutions worldwide using Jawara CBT for secure online examinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Start */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Quick Start</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-6">
                <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                  <div className="w-full h-full absolute bg-[#C5E151] rounded-[22px]"></div>
                  <Zap className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                </div>
                <h3 className="text-brand-dark text-lg font-bold mb-3">Start Your Journey</h3>
                <p className="text-brand-dark text-sm font-normal mb-6">
                  Access the platform with your institutional credentials or request a demo
                </p>
                <button
                  onClick={handleLoginClick}
                  className="btn-secondary w-full rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-3"
                >
                  <span className="text-brand-white text-sm font-semibold">Access Platform</span>
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Support & Resources</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-6">
                <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                  <div className="w-full h-full absolute bg-[#FAAC7B] rounded-[22px]"></div>
                  <FileText className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                </div>
                <h3 className="text-brand-dark text-lg font-bold mb-3">Help Center</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">Documentation & guides</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">Training materials</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#EF3F09] rounded-full"></div>
                    <span className="text-brand-dark font-medium">Technical support</span>
                  </div>
                </div>
                <button className="btn-secondary w-full border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] transition-all duration-300 px-4 py-3">
                  <span className="text-brand-dark text-sm font-medium">View Documentation</span>
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-2 pb-2">
              <div className="mb-4">
                <h3 className="text-brand-dark text-lg font-bold ml-5">Contact & Demo</h3>
              </div>
              <div className="bg-white rounded-[20px] px-4 pt-6 pb-6">
                <div className="w-16 h-14 relative flex items-center justify-center rounded-[22px] overflow-hidden mb-4">
                  <div className="w-full h-full absolute bg-[#82D9D7] rounded-[22px]"></div>
                  <Mail className="w-6 h-6 text-[#0C1C3C] relative z-10" />
                </div>
                <h3 className="text-brand-dark text-lg font-bold mb-3">Get in Touch</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#EF3F09]" />
                    <span className="text-brand-dark font-medium">sales@jawaracbt.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[#EF3F09]" />
                    <span className="text-brand-dark font-medium">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-[#EF3F09]" />
                    <span className="text-brand-dark font-medium">24/7 technical support</span>
                  </div>
                </div>
                <button className="btn-secondary w-full border border-[#DCDEDD] rounded-[12px] hover:border-[#EF3F09] transition-all duration-300 px-4 py-3">
                  <span className="text-brand-dark text-sm font-medium">Request Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0C1C3C] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand & Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <div className="w-12 h-12 absolute bg-[#EF3F09] rounded-full"></div>
                  <Building2 className="w-6 h-6 text-white relative z-10" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">JawaraCBT</h3>
                  <p className="text-gray-300 text-sm">Computer-Based Testing Platform</p>
                </div>
              </div>
              <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-md">
                Modern online examination platform designed for educational institutions. 
                Secure, scalable, and comprehensive CBT solution with role-based access control.
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-white text-lg font-bold">8,453</p>
                  <p className="text-gray-400 text-xs">Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-bold">892</p>
                  <p className="text-gray-400 text-xs">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-bold">32</p>
                  <p className="text-gray-400 text-xs">Classrooms</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white text-lg font-bold mb-6">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('capabilities')}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Capabilities
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('structure')}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Academic Structure
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('technology')}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Technology
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="text-white text-lg font-bold mb-6">Contact & Support</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#EF3F09]" />
                  <span className="text-gray-300 text-sm">sales@jawaracbt.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#EF3F09]" />
                  <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#EF3F09]" />
                  <span className="text-gray-300 text-sm">Documentation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#EF3F09]" />
                  <span className="text-gray-300 text-sm">24/7 Support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Border */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-300 text-sm mb-2">
                  Built with React, TypeScript, and Laravel
                </p>
                <p className="text-gray-400 text-sm">
                  &copy; 2025 BuildWithAngga. All rights reserved.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLoginClick}
                  className="btn-secondary rounded-[12px] hover:brightness-110 focus:ring-2 focus:ring-[#EF3F09] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-2"
                >
                  <span className="text-brand-white text-sm font-semibold">Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;