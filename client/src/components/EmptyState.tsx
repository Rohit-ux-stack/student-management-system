import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, FilterX } from 'lucide-react';

interface EmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered = false,
  onClearFilters,
}) => {
  return (
    <div className="clay-card p-8 sm:p-12 text-center max-w-xl mx-auto my-8">
      {/* Icon bubble */}
      <div
        className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5"
        style={{
          backgroundColor: '#EBD8C3',
          color: 'var(--clay-primary)',
          boxShadow: 'inset 4px 4px 8px var(--clay-shadow-dark), inset -4px -4px 8px var(--clay-shadow-light)',
        }}
      >
        {isFiltered ? (
          <FilterX className="w-10 h-10 opacity-70 text-[var(--clay-primary)]" />
        ) : (
          <Users className="w-10 h-10 opacity-70 text-[var(--clay-primary)]" />
        )}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-[var(--clay-text)] mb-2">
        {isFiltered ? 'No matching students found' : 'No students enrolled yet'}
      </h3>

      <p className="text-sm text-[var(--clay-text-secondary)] font-medium leading-relaxed max-w-md mx-auto mb-6">
        {isFiltered
          ? 'No student records match your current search criteria or filter selections. Try adjusting or clearing your filters.'
          : 'Your student directory is currently empty. Start building your database by enrolling your first student.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isFiltered && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="clay-btn px-5 py-2.5 text-sm font-semibold text-[var(--clay-text)]"
          >
            Clear filters
          </button>
        )}

        <Link
          to="/students/new"
          className="clay-btn-primary px-6 py-2.5 text-sm font-semibold gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add first student</span>
        </Link>
      </div>
    </div>
  );
};

export default EmptyState;
