import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { StudentListPage } from './pages/StudentListPage';
import { StudentFormPage } from './pages/StudentFormPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-[var(--clay-bg)] text-[var(--clay-text)] font-sans antialiased selection:bg-[var(--clay-accent)] selection:text-white">
          {/* Navigation Bar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:px-8">
            <Routes>
              <Route path="/" element={<StudentListPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/students/new" element={<StudentFormPage />} />
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/students/:id/edit" element={<StudentFormPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
