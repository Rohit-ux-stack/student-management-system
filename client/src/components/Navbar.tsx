import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isNewStudentPage = location.pathname === '/students/new';

  return (
    <header className="sticky top-0 z-30 px-3 py-3 sm:px-4 sm:py-4 md:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <nav
          className="clay-card px-3.5 py-2.5 sm:px-5 sm:py-3 md:px-8 md:py-4 flex items-center justify-between gap-2 sm:gap-4 min-w-0"
          aria-label="Main Navigation"
        >
          {/* Logo & App Title */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 group text-decoration-none min-w-0 shrink"
            aria-label="Go to Student Directory home"
          >
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{
                backgroundColor: 'var(--clay-primary)',
                color: '#FFFFFF',
                boxShadow: '4px 4px 8px var(--clay-shadow-dark), -4px -4px 8px var(--clay-shadow-light)',
              }}
            >
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-[var(--clay-text)] m-0 leading-tight truncate">
                Student Directory
              </h1>
              <p className="text-xs text-[var(--clay-text-secondary)] m-0 font-medium hidden sm:block truncate">
                Academic records & management
              </p>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <Link
              to="/"
              className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all shrink-0 ${
                location.pathname === '/'
                  ? 'clay-btn-primary'
                  : 'clay-btn text-[var(--clay-text)]'
              }`}
            >
              Students
            </Link>

            <Link
              to="/analytics"
              className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all shrink-0 ${
                location.pathname === '/analytics'
                  ? 'clay-btn-primary'
                  : 'clay-btn text-[var(--clay-text)]'
              }`}
            >
              Analytics
            </Link>

            {!isNewStudentPage && (
              <Link
                to="/students/new"
                className="clay-btn-primary px-2.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl shrink-0"
                id="nav-add-student-btn"
                aria-label="Add new student"
                title="Add student"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add student</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
