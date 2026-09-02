import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) => {
  if (total === 0 || totalPages <= 1) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="clay-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 min-w-0 max-w-full">
      {/* Records count info */}
      <p className="text-xs sm:text-sm font-semibold text-[var(--clay-text-secondary)] m-0 min-w-0 text-center sm:text-left">
        Showing <span className="text-[var(--clay-text)] font-bold">{startRecord}</span> to{' '}
        <span className="text-[var(--clay-text)] font-bold">{endRecord}</span> of{' '}
        <span className="text-[var(--clay-text)] font-bold">{total}</span> students
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full flex-nowrap min-w-0 py-1 px-0.5">
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="clay-btn p-2 text-xs font-semibold text-[var(--clay-text)] shrink-0"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((p, index) => {
          if (typeof p === 'string') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1.5 sm:px-2 text-xs sm:text-sm font-bold text-[var(--clay-text-secondary)] select-none shrink-0"
              >
                ...
              </span>
            );
          }

          const isActive = p === page;
          const isAlwaysVisible = p === 1 || p === totalPages || isActive;

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 ${
                isAlwaysVisible
                  ? 'inline-flex items-center justify-center'
                  : 'hidden sm:inline-flex items-center justify-center'
              } ${isActive ? 'clay-btn-primary' : 'clay-btn'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="clay-btn p-2 text-xs font-semibold text-[var(--clay-text)] shrink-0"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
