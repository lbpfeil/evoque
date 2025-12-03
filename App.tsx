import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import BookDetails from './pages/BookDetails';
import Highlights from './pages/Highlights';
import Import from './pages/Import';
import Study from './pages/Study';
import { StoreProvider } from './components/StoreContext';

const AppLayout = ({ children }: React.PropsWithChildren) => (
  <div className="min-h-screen bg-zinc-50 flex text-zinc-900 font-sans antialiased">
    <Sidebar />
    <main className="flex-1 md:ml-64 p-6 md:p-12 overflow-y-auto h-screen">
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

const App = () => {
  return (
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;