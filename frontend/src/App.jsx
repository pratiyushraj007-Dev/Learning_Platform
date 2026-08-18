import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import Lesson from './pages/student/Lesson';
import Quiz from './pages/student/Quiz';
import Progress from './pages/student/Progress';
import AIAssistant from './pages/student/AIAssistant';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherQuizzes from './pages/teacher/TeacherQuizzes';
import TeacherAIContent from './pages/teacher/TeacherAIContent';
import TeacherPerformance from './pages/teacher/TeacherPerformance';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

// Smart redirect based on role
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Home redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Student routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/courses" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Courses />
            </ProtectedRoute>
          } />
          <Route path="/student/courses/:courseId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <CourseDetail />
            </ProtectedRoute>
          } />
          <Route path="/student/lessons/:lessonId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Lesson />
            </ProtectedRoute>
          } />
          <Route path="/student/quizzes/:quizId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Quiz />
            </ProtectedRoute>
          } />
          <Route path="/student/progress" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Progress />
            </ProtectedRoute>
          } />
          <Route path="/student/ai-assistant" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AIAssistant />
            </ProtectedRoute>
          } />

          {/* Teacher routes */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/courses" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherCourses />
            </ProtectedRoute>
          } />
          <Route path="/teacher/quizzes" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherQuizzes />
            </ProtectedRoute>
          } />
          <Route path="/teacher/ai-content" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherAIContent />
            </ProtectedRoute>
          } />
          <Route path="/teacher/performance" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherPerformance />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
