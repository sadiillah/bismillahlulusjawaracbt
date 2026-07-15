import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Context Providers
import { AuthProvider } from './providers/AuthProvider';

// Route Protection
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Dashboard Pages (to be created)
import ManagerDashboard from './pages/manager/Dashboard';
import SubjectsList from './pages/manager/subjects/SubjectsList';
import SubjectDetails from './pages/manager/subjects/SubjectDetails';
import Topics from './pages/manager/topics/Topics';
import AddTopic from './pages/manager/topics/AddTopic';
import EditTopic from './pages/manager/topics/EditTopic';
import TopicDetails from './pages/manager/topics/TopicDetails';
import AddSubject from './pages/manager/subjects/AddSubject';
import EditSubject from './pages/manager/subjects/EditSubject';
import { SubjectExams } from './pages/manager/subjects/Exams';
import Teachers from './pages/manager/teachers/Teachers';
import AddTeacher from './pages/manager/teachers/AddTeacher';
import TeacherDetails from './pages/manager/teachers/TeacherDetails';
import EditTeacher from './pages/manager/teachers/EditTeacher';
import Students from './pages/manager/students/Students';
import AddStudent from './pages/manager/students/AddStudent';
import StudentDetails from './pages/manager/students/StudentDetails';
import EditStudent from './pages/manager/students/EditStudent';
import Classrooms from './pages/manager/Classrooms';
import AddClassroom from './pages/manager/classrooms/AddClassroom';
import EditClassroom from './pages/manager/classrooms/EditClassroom';
import ClassroomDetails from './pages/manager/classrooms/ClassroomDetails';
import AssignSubjects from './pages/manager/classrooms/AssignSubjects';
import AssignStudents from './pages/manager/classrooms/AssignStudents';
import CreateExam from './pages/manager/subjects/CreateExam';
import EditExam from './pages/manager/subjects/EditExam';
import ExamDetails from './pages/manager/subjects/ExamDetails';
import StudentExamAnswers from './pages/manager/subjects/StudentExamAnswers';
import TakeExam from './pages/student/TakeExam';
import ExamGuidelines from './pages/student/ExamGuidelines';
import ExamCompletion from './pages/student/ExamCompletion';
import ExamResults from './pages/student/ExamResults';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408 (timeout)
        if (error && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500 && status !== 408) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {/* Sonner Toast positioned at top-right */}
          <Toaster
            position="top-right"
            expand={true}
            richColors={true}
            closeButton={true}
            duration={5000}
            toastOptions={{
              style: {
                padding: '16px',
                fontSize: '14px',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
              className: 'sonner-toast',
            }}
          />
          
          {/* Main App Routes */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
            
            {/* Manager Dashboard - Only accessible by managers */}
            <Route 
              path="/dashboard/overview" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Subjects Page - Accessible by teachers and managers */}
            <Route 
              path="/dashboard/subjects" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'manager']}>
                  <SubjectsList />
                </ProtectedRoute>
              } 
            />

            {/* Edit Topic Page - Only accessible by managers (Most specific route first) */}
            <Route 
              path="/dashboard/topics/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <EditTopic />
                </ProtectedRoute>
              } 
            />

            {/* Add Topic Page - Only accessible by managers */}
            <Route 
              path="/dashboard/topics/add" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AddTopic />
                </ProtectedRoute>
              } 
            />

            {/* Topic Details Page - Only accessible by managers */}
            <Route 
              path="/dashboard/topics/:id" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <TopicDetails />
                </ProtectedRoute>
              } 
            />

            {/* Topics Page - Only accessible by managers (Least specific route last) */}
            <Route 
              path="/dashboard/topics" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Topics />
                </ProtectedRoute>
              } 
            />

            {/* Teachers Page - Only accessible by managers */}
            <Route 
              path="/dashboard/teachers" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Teachers />
                </ProtectedRoute>
              } 
            />

            {/* Add Teacher Page - Only accessible by managers */}
            <Route 
              path="/dashboard/add-teacher" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AddTeacher />
                </ProtectedRoute>
              } 
            />

            {/* Teacher Details Page - Only accessible by managers */}
            <Route 
              path="/dashboard/teachers/:id" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <TeacherDetails />
                </ProtectedRoute>
              } 
            />

            {/* Edit Teacher Page - Only accessible by managers */}
            <Route 
              path="/dashboard/teachers/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <EditTeacher />
                </ProtectedRoute>
              } 
            />

            {/* Students Page - Only accessible by managers */}
            <Route 
              path="/dashboard/students" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <Students />
                </ProtectedRoute>
              } 
            />

            {/* Add Student Page - Only accessible by managers */}
            <Route 
              path="/dashboard/add-student" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AddStudent />
                </ProtectedRoute>
              } 
            />

            {/* Student Details Page - Only accessible by managers */}
            <Route 
              path="/dashboard/students/:id" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <StudentDetails />
                </ProtectedRoute>
              } 
            />

            {/* Edit Student Page - Only accessible by managers */}
            <Route 
              path="/dashboard/students/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <EditStudent />
                </ProtectedRoute>
              } 
            />

            {/* Add Subject Page - Only accessible by managers */}
            <Route 
              path="/dashboard/add-subject" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AddSubject />
                </ProtectedRoute>
              } 
            />

            {/* Edit Subject Page - Accessible by managers and teachers */}
            <Route 
              path="/dashboard/subjects/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher']}>
                  <EditSubject />
                </ProtectedRoute>
              } 
            />

            {/* Subject Details Page - Accessible by managers and teachers */}
            <Route 
              path="/dashboard/subjects/:id" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher']}>
                  <SubjectDetails />
                </ProtectedRoute>
              } 
            />

            {/* Subject Exams Page - Accessible by managers, teachers, and students */}
            <Route 
              path="/dashboard/subjects/:id/exams" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher', 'student']}>
                  <SubjectExams />
                </ProtectedRoute>
              } 
            />

            {/* Create Exam Page - Accessible by managers and teachers */}
            <Route 
              path="/dashboard/subjects/:id/exams/add" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher']}>
                  <CreateExam />
                </ProtectedRoute>
              } 
            />

            {/* Exam Details Page - Accessible by managers, teachers, and students */}
            <Route 
              path="/dashboard/exams/:id" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher', 'student']}>
                  <ExamDetails />
                </ProtectedRoute>
              } 
            />

            {/* Exam Guidelines Page - Only accessible by students */}
            <Route 
              path="/dashboard/exams/:id/guidelines" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExamGuidelines />
                </ProtectedRoute>
              } 
            />

            {/* Take Exam Page - Only accessible by students */}
            <Route 
              path="/dashboard/exams/:id/take" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <TakeExam />
                </ProtectedRoute>
              } 
            />

            {/* Exam Completion Page - Only accessible by students */}
            <Route 
              path="/dashboard/exams/:id/completion" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExamCompletion />
                </ProtectedRoute>
              } 
            />

            {/* Student Exam Answers Page - Accessible by managers, teachers, and students */}
            <Route 
              path="/dashboard/exams/:examId/students/:studentId/answers" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher', 'student']}>
                  <StudentExamAnswers />
                </ProtectedRoute>
              } 
            />

            {/* Edit Exam Page - Accessible by managers and teachers */}
            <Route 
              path="/dashboard/exams/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher']}>
                  <EditExam />
                </ProtectedRoute>
              } 
            />

            {/* Classrooms Page - Accessible by managers, teachers, and students */}
            <Route 
              path="/dashboard/classrooms" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher', 'student']}>
                  <Classrooms />
                </ProtectedRoute>
              } 
            />

            {/* Add Classroom Page - Only accessible by managers */}
            <Route 
              path="/dashboard/classrooms/add" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AddClassroom />
                </ProtectedRoute>
              } 
            />

            {/* Classroom Details Page - Accessible by managers, teachers, and students */}
            <Route 
              path="/dashboard/classrooms/:id" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'teacher', 'student']}>
                  <ClassroomDetails />
                </ProtectedRoute>
              } 
            />

            {/* Edit Classroom Page - Only accessible by managers */}
            <Route 
              path="/dashboard/classrooms/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <EditClassroom />
                </ProtectedRoute>
              } 
            />

            {/* Assign Subjects to Classroom Page - Only accessible by managers */}
            <Route 
              path="/dashboard/classrooms/:id/assign-subjects" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AssignSubjects />
                </ProtectedRoute>
              } 
            />

            {/* Assign Students to Classroom Page - Only accessible by managers */}
            <Route 
              path="/dashboard/classrooms/:id/assign-students" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AssignStudents />
                </ProtectedRoute>
              } 
            />
            

            {/* Student Routes - Only accessible by students */}
            <Route 
              path="/dashboard/exams" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <div>My Exams - Coming Soon</div>
                </ProtectedRoute>
              } 
            />

            {/* Student Exam Results Page - Only accessible by students */}
            <Route 
              path="/dashboard/student/exams/:id/results" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExamResults />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard/results" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <div>My Results - Coming Soon</div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard/profile" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <div>My Profile - Coming Soon</div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard/settings" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'manager']}>
                  <div>Settings - Coming Soon</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route - redirect to homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;