import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, BookOpen, Calendar, Edit3, Trash2, ArrowRight, Check } from 'lucide-react';
import type { Student } from '../types/student';
import { Avatar } from './Avatar';

interface StudentCardProps {
  student: Student;
  isSelected?: boolean;
  onToggleSelect?: (studentId: string) => void;
  onDeleteRequest: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  isSelected = false,
  onToggleSelect,
  onDeleteRequest,
}) => {
  return (
    <article
      id={`student-card-${student.id}`}
      className={`clay-card p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group relative ${
        isSelected
          ? 'ring-3 ring-[var(--clay-primary)] shadow-lg'
          : ''
      }`}
    >
      <div>
        {/* Top Header: Checkbox + Avatar + Admission Number badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {onToggleSelect && (
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(student.id);
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[var(--clay-primary)] text-white shadow-inner'
                    : 'clay-input hover:scale-105'
                }`}
                title={isSelected ? 'Deselect student' : 'Select student for bulk action'}
                aria-label={`Select ${student.name}`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            )}

            <Avatar
              photoUrl={student.photo_url}
              name={student.name}
              size="md"
            />
          </div>

          <span
            className="clay-badge-inset px-3 py-1 text-xs font-bold text-[var(--clay-text)] tracking-wide"
            title="Admission Number"
          >
            {student.admission_number}
          </span>
        </div>

        {/* Student Name */}
        <h3 className="text-xl font-bold text-[var(--clay-text)] mb-2 group-hover:text-[var(--clay-primary)] transition-colors line-clamp-1">
          <Link
            to={`/students/${student.id}`}
            className="hover:underline focus:outline-none"
          >
            {student.name}
          </Link>
        </h3>

        {/* Academic Details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-[var(--clay-text)] font-medium">
            <BookOpen className="w-4 h-4 text-[var(--clay-primary)] shrink-0" />
            <span className="truncate">{student.course}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--clay-text-secondary)] font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--clay-accent)] shrink-0" />
              <span>Year {student.year}</span>
            </div>
            <span className="clay-badge-inset px-2.5 py-0.5 text-[11px] font-medium text-[var(--clay-text-secondary)]">
              {student.gender}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--clay-text-secondary)] pt-1">
            <Mail className="w-3.5 h-3.5 text-[var(--clay-text-secondary)] shrink-0" />
            <span className="truncate">{student.email}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-[var(--clay-border)]/50 flex items-center justify-between gap-2">
        <Link
          to={`/students/${student.id}`}
          className="clay-btn px-3.5 py-2 text-xs font-semibold gap-1.5 text-[var(--clay-text)]"
          aria-label={`View profile for ${student.name}`}
        >
          <span>View profile</span>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--clay-primary)]" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/students/${student.id}/edit`}
            className="clay-btn p-2 text-[var(--clay-text)] hover:text-[var(--clay-primary)]"
            title="Edit student"
            aria-label={`Edit ${student.name}`}
          >
            <Edit3 className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => onDeleteRequest(student)}
            className="clay-btn p-2 text-[var(--clay-danger)] hover:bg-[var(--clay-danger)] hover:text-white"
            title="Delete student"
            aria-label={`Delete ${student.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default StudentCard;
