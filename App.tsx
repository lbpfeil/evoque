import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Highlights from './pages/Highlights';
import Study from './pages/Study';
import Settings from './pages/Settings';
import StudySession from './pages/StudySession';
import Login from './pages/Login';
import { StoreProvider } from './components/StoreContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const AppLayout = ({ children }: React.PropsWithChildren) => {
  const location = useLocation();
  const isStudySession = location.pathname === '/study/session';

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row text-zinc-900 font-sans antialiased">
      {!isStudySession && <Sidebar />}
      <main className={`flex-1 ${!isStudySession ? 'md:ml-56 p-4 md:p-8 pb-20 md:pb-8' : ''} overflow-y-auto h-screen`}>
        {!isStudySession ? (
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      {!isStudySession && <BottomNav />}
    </div>
  );
};

const ProtectedApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <HashRouter>
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
    </HashRouter>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
