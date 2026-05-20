import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
    <div className="animate-pulse text-teal-500 text-2xl font-bold">جاري التحميل...</div>
  </div>;
  
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
            <div className="animate-pulse text-teal-500 text-2xl font-bold">N.R EXAM</div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/exam/:categoryId/:levelId" element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            } />
            
            <Route path="/results/:attemptId" element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/progress" element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            } />
            
            <Route path="/achievements" element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
