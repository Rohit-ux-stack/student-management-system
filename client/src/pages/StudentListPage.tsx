import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  UserPlus,
  AlertCircle,
  Download,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { getStudents, deleteStudent, bulkDeleteStudents } from '../api/students';
import type { Student } from '../types/student';
import { StudentCard } from '../components/StudentCard';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

const STANDARD_COURSES = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'Biotechnology',
  'Mathematics & Physics',
];

export const StudentListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();
  const toast = useToast();

  const searchParam = searchParams.get('search') || '';
  const courseParam = searchParams.get('course') || '';
  const yearParam = searchParams.get('year') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(searchParam);
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Single delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync search input if URL searchParam changes externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Debounced search input to URL query params
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchParam) {
        startTransition(() => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (searchInput.trim()) {
              next.set('search', searchInput.trim());
            } else {
              next.delete('search');
            }
            next.set('page', '1');
            return next;
          });
        });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput, searchParam, setSearchParams]);

  // Fetch students from API
  const fetchStudentData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getStudents({
        page: pageParam,
        limit: 9,
        search: searchParam,
        course: courseParam,
        year: yearParam,
      });
      setStudents(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load students';
      setError(errMsg);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageParam, searchParam, courseParam, yearParam]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // Handle filter changes
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('course', val);
      else next.delete('course');
      next.set('page', '1');
      return next;
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('year', val);
      else next.delete('year');
      next.set('page', '1');
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
    setSelectedIds([]);
  };

  // Multi-Select Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllOnPageSelected =
    students.length > 0 &&
    students.every((s) => selectedIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllOnPageSelected) {
      // Deselect all on current page
      const currentIds = new Set(students.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !currentIds.has(id)));
    } else {
      // Select all on current page
      const currentIds = students.map((s) => s.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  // Export current / filtered student directory to CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      let exportData = students;

      // If total matching students exceeds current page, fetch all for full export
      if (total > students.length) {
        toast.info('Fetching all matching student records for export...');
        const res = await getStudents({
          page: 1,
          limit: Math.max(total, 5000),
          search: searchParam,
          course: courseParam,
          year: yearParam,
        });
        exportData = res.data || [];
      }

      if (exportData.length === 0) {
        toast.warning('No student records available to export.');
        return;
      }

      // CSV Column Headers
      const headers = [
        'Admission Number',
        'Full Name',
        'Course',
        'Year',
        'Date of Birth',
        'Email',
        'Mobile Number',
        'Gender',
        'Address',
        'Photo URL',
        'Created At',
      ];

      const escapeCsvCell = (val: unknown): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = exportData.map((s) => [
        escapeCsvCell(s.admission_number),
        escapeCsvCell(s.name),
        escapeCsvCell(s.course),
        escapeCsvCell(s.year),
        escapeCsvCell(s.date_of_birth ? s.date_of_birth.substring(0, 10) : ''),
        escapeCsvCell(s.email),
        escapeCsvCell(s.mobile_number),
        escapeCsvCell(s.gender),
        escapeCsvCell(s.address || ''),
        escapeCsvCell(s.photo_url || ''),
        escapeCsvCell(s.created_at ? new Date(s.created_at).toISOString() : ''),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateTag = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `students_directory_${dateTag}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${exportData.length} student record(s) to CSV.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export CSV';
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Single Delete confirmation
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);

    try {
      await deleteStudent(studentToDelete.id);
      toast.success(`Student ${studentToDelete.name} deleted successfully.`);
      setSelectedIds((prev) => prev.filter((id) => id !== studentToDelete.id));
      setStudentToDelete(null);
      await fetchStudentData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to delete student';
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Bulk Delete confirmation
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);

    try {
      const res = await bulkDeleteStudents(selectedIds);
      toast.success(res.message || `Successfully deleted ${selectedIds.length} students.`);
      setSelectedIds([]);
      setShowBulkDeleteDialog(false);
      await fetchStudentData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to bulk delete students';
      toast.error(errMsg);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const isFiltered = Boolean(searchParam || courseParam || yearParam);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Filter Toolbar */}
      <section className="clay-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--clay-text)] tracking-tight m-0">
              Student Directory
            </h2>
            <p className="text-sm text-[var(--clay-text-secondary)] font-medium mt-1 mb-0">
              Manage enrollments, academic records, and student profiles
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Export to CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting || isLoading || total === 0}
              className="clay-btn px-4 py-3 text-sm font-semibold gap-2 text-[var(--clay-text)] rounded-2xl hover:text-[var(--clay-primary)]"
              id="export-csv-btn"
              title="Export students to CSV file"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>

            <Link
              to="/students/new"
              className="clay-btn-primary px-5 py-3 text-sm font-semibold gap-2 rounded-2xl"
              id="hero-add-student-btn"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add student</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 pt-2">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-[var(--clay-text-secondary)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, admission #..."
              className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium"
              id="student-search-input"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--clay-text-secondary)] hover:text-[var(--clay-text)]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Course Filter Dropdown */}
          <div className="lg:col-span-4 relative">
            <select
              value={courseParam}
              onChange={handleCourseChange}
              className="clay-input w-full px-4 py-3 text-sm font-medium appearance-none cursor-pointer pr-10"
              id="course-filter-select"
            >
              <option value="">All courses</option>
              {STANDARD_COURSES.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-[var(--clay-text-secondary)] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Year Filter Dropdown */}
          <div className="lg:col-span-2 relative">
            <select
              value={yearParam}
              onChange={handleYearChange}
              className="clay-input w-full px-4 py-3 text-sm font-medium appearance-none cursor-pointer pr-10"
              id="year-filter-select"
            >
              <option value="">All years</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--clay-text-secondary)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <div className="lg:col-span-1 flex items-center">
              <button
                type="button"
                onClick={handleResetFilters}
                className="clay-btn w-full p-3 text-xs font-semibold text-[var(--clay-text-secondary)] hover:text-[var(--clay-primary)]"
                title="Reset all filters"
                id="reset-filters-btn"
              >
                <RotateCcw className="w-4 h-4 mx-auto" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Multi-Select & Bulk Actions Bar */}
      {students.length > 0 && (
        <section
          className={`clay-card p-4 flex flex-wrap items-center justify-between gap-4 transition-all duration-300 ${
            selectedIds.length > 0 ? 'bg-[#F9ECE0] ring-2 ring-[var(--clay-primary)]/40' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="clay-btn px-3.5 py-2 text-xs font-semibold gap-2 text-[var(--clay-text)]"
              id="select-all-students-btn"
            >
              {isAllOnPageSelected ? (
                <CheckSquare className="w-4 h-4 text-[var(--clay-primary)]" />
              ) : (
                <Square className="w-4 h-4 text-[var(--clay-text-secondary)]" />
              )}
              <span>
                {isAllOnPageSelected ? 'Deselect all on page' : 'Select all on page'}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <span className="clay-badge-inset px-3 py-1 text-xs font-bold text-[var(--clay-text)]">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs font-bold text-[var(--clay-text-secondary)] hover:text-[var(--clay-text)] px-2 py-1"
              >
                Clear selection
              </button>

              <button
                type="button"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="clay-btn-danger px-4 py-2 text-xs sm:text-sm font-semibold gap-2 rounded-xl"
                id="bulk-delete-btn"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete selected ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={`skeleton-${n}`}
              className="clay-card p-6 h-64 flex flex-col justify-between animate-pulse"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-full bg-[var(--clay-border)]" />
                  <div className="w-24 h-6 rounded-full bg-[var(--clay-border)]" />
                </div>
                <div className="w-3/4 h-5 rounded-lg bg-[var(--clay-border)]" />
                <div className="w-1/2 h-4 rounded-lg bg-[var(--clay-border)]" />
              </div>
              <div className="w-full h-8 rounded-xl bg-[var(--clay-border)]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="clay-card p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--clay-danger)] text-white flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[var(--clay-text)] mb-2">
            Failed to load students
          </h3>
          <p className="text-sm text-[var(--clay-text-secondary)] mb-6 font-medium">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchStudentData}
            className="clay-btn-primary px-6 py-2.5 text-sm font-semibold"
          >
            Retry request
          </button>
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          isFiltered={isFiltered}
          onClearFilters={handleResetFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                isSelected={selectedIds.includes(student.id)}
                onToggleSelect={handleToggleSelect}
                onDeleteRequest={(stu) => setStudentToDelete(stu)}
              />
            ))}
          </div>

          <Pagination
            page={pageParam}
            totalPages={totalPages}
            total={total}
            limit={9}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Confirmation Dialog for Single Deletion */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        title="Delete student record"
        message={
          studentToDelete
            ? `Are you sure you want to permanently delete ${studentToDelete.name} (${studentToDelete.admission_number})? All associated academic data and photos will be removed.`
            : ''
        }
        confirmLabel="Delete student"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setStudentToDelete(null)}
      />

      {/* Confirmation Dialog for Bulk Deletion */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        title="Delete selected students"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected student record(s)? This bulk operation cannot be undone and will remove all associated records and photos.`}
        confirmLabel={`Delete ${selectedIds.length} students`}
        isLoading={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setShowBulkDeleteDialog(false)}
      />
    </div>
  );
};

export default StudentListPage;
