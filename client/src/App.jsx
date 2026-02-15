import { useState, lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoadmapProvider } from './context/RoadmapContext';
import { StatsProvider } from './context/StatsContext';

// Eagerly loaded components (needed immediately)
import Sidebar from './components/layout/Sidebar';
import Background from './components/layout/Background';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import PageLoader from './components/layout/PageLoader';

// Lazy loaded screens (code splitting for better initial load)
const Dashboard = lazy(() => import('./screens/Dashboard'));
const Analytics = lazy(() => import('./screens/Analytics'));
const Roadmap = lazy(() => import('./screens/Roadmap'));
const AIMentor = lazy(() => import('./screens/AIMentor'));
const Summarizer = lazy(() => import('./screens/Summarizer'));
const Quiz = lazy(() => import('./screens/Quiz'));
const Quizzes = lazy(() => import('./screens/Quizzes'));
const QuizReview = lazy(() => import('./screens/QuizReview'));
const Profile = lazy(() => import('./screens/Profile'));
const Login = lazy(() => import('./screens/Login'));
const SignUp = lazy(() => import('./screens/SignUp'));

import { AnimatePresence, motion } from 'framer-motion';

// Layout for authenticated pages (with sidebar)
function AuthenticatedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen relative">
      <Background />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen overflow-x-hidden relative z-10 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-28' : 'lg:ml-72'
          }`}
      >

        {/* Top Glass Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <div className="pt-6 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}

// Main content with routes
function AppContent() {
  const location = useLocation();
  const { loading } = useAuth();

  // Hide splash screen after initial render
  useEffect(() => {
    if (!loading && window.hideSplashScreen) {
      window.hideSplashScreen();
    }
  }, [loading]);

  const pageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  // Keep the static splash screen visible while auth initializes.
  // Rendering another loader here causes a duplicate stacked loading UI.
  if (loading) {
    return null;
  }

  // Check if current route is auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Auth pages don't need the sidebar layout
  if (isAuthPage) {
    return (
      <Suspense fallback={<PageLoader message="Loading page..." />}>
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Suspense>
    );
  }

  // Protected pages with sidebar layout
  return (
    <AuthenticatedLayout>
      <Suspense fallback={<PageLoader message="Loading page..." />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
              <Route path="/roadmap/:id" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
              <Route path="/mentor" element={<ProtectedRoute><AIMentor /></ProtectedRoute>} />
              <Route path="/summarizer" element={<ProtectedRoute><Summarizer /></ProtectedRoute>} />
              <Route path="/quiz/:roadmapId/:topicId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
              <Route path="/quiz-review/:attemptId" element={<ProtectedRoute><QuizReview /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoadmapProvider>
          <StatsProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </StatsProvider>
        </RoadmapProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
