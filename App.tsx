import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import BookDetails from './pages/BookDetails';
import Highlights from './pages/Highlights';
import Import from './pages/Import';
import Study from './pages/Study';
import StudySession from './pages/StudySession';
import { StoreProvider } from './components/StoreContext';
import ErrorBoundary from './components/ErrorBoundary';

const AppLayout = ({ children }: React.PropsWithChildren) => {
  const location = useLocation();
  const isStudySession = location.pathname === '/study/session';

  return (
    <div className="min-h-screen bg-zinc-50 flex text-zinc-900 font-sans antialiased">
      {!isStudySession && <Sidebar />}
      <main className={`flex-1 ${!isStudySession ? 'md:ml-56 p-4 md:p-8' : ''} overflow-y-auto h-screen`}>
        {!isStudySession ? (
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <HashRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/:bookId" element={<BookDetails />} />
              <Route path="/highlights" element={<Highlights />} />
              <Route path="/import" element={<Import />} />
              <Route path="/study" element={<Study />} />
              <Route path="/study/session" element={<StudySession />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </HashRouter>
      </StoreProvider>
    </ErrorBoundary>
  );
};

export default App;
