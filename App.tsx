import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import { StoreProvider } from './components/StoreContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { SidebarProvider, useSidebarContext } from './components/SidebarContext';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react"

// Lazy load pages for better performance (code splitting)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Highlights = lazy(() => import('./pages/Highlights'));
const Study = lazy(() => import('./pages/Study'));
const Settings = lazy(() => import('./pages/Settings'));
const StudySession = lazy(() => import('./pages/StudySession'));

// Loading fallback component for lazy-loaded routes
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
      <p className="text-xs text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const AppLayout = ({ children }: React.PropsWithChildren) => {
  const location = useLocation();
  const isStudySession = location.pathname === '/study/session';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground font-sans antialiased">
      {!isStudySession && <Sidebar />}
      <main
        className={`flex-1 ${!isStudySession ? 'p-4 md:p-8 pb-20 md:pb-8 md:ml-14' : ''} overflow-y-auto h-screen transition-all duration-300 ease-in-out`}
      >
        {!isStudySession ? (
          <div className="w-full mx-auto">
            <Suspense fallback={<PageLoadingFallback />}>
              {children}
            </Suspense>
          </div>
        ) : (
          <Suspense fallback={<PageLoadingFallback />}>
            {children}
          </Suspense>
        )}
      </main>
      {!isStudySession && <BottomNav />}
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
};

const ProtectedApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <HashRouter>
      <SidebarProvider>
        <StoreProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/highlights" element={<Highlights />} />
              <Route path="/study" element={<Study />} />
              <Route path="/study/session" element={<StudySession />} />
              <Route path="/settings" element={<Settings />} />
              {/* Redirects for old routes */}
              <Route path="/import" element={<Navigate to="/settings" replace />} />
              <Route path="/library" element={<Navigate to="/settings" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </StoreProvider>
      </SidebarProvider>
    </HashRouter>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="evoque-theme">
        <AuthProvider>
          <ProtectedApp />
          <SpeedInsights />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
