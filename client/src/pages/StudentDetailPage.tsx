import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  User,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getStudentById, deleteStudent } from '../api/students';
import type { Student } from '../types/student';
import { Avatar } from '../components/Avatar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getStudentById(id)
      .then((res) => {
        if (isMounted) {
          setStudent(res.data);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Student record not found';
          setError(msg);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id || !student) return;
    setIsDeleting(true);

    try {
      await deleteStudent(id);
      toast.success(`Student ${student.name} deleted successfully`);
      setShowDeleteDialog(false);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete student record';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="clay-card p-12 text-center max-w-xl mx-auto my-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--clay-primary)] mb-4" />
        <p className="text-sm font-bold text-[var(--clay-text)]">
          Loading student profile...
        </p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="clay-card p-10 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--clay-danger)] text-white flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[var(--clay-text)]">
          Student not found
        </h3>
        <p className="text-sm text-[var(--clay-text-secondary)]">
          {error || 'The requested student record does not exist or has been removed.'}
        </p>
        <Link to="/" className="clay-btn-primary px-6 py-2.5 text-sm font-semibold inline-flex gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to directory</span>
        </Link>
      </div>
    );
  }

  // Format Dates
  const formattedDob = student.date_of_birth
    ? new Date(student.date_of_birth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : 'N/A';

  const formattedCreated = student.created_at
    ? new Date(student.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          className="clay-btn px-4 py-2 text-sm font-semibold gap-2 text-[var(--clay-text)] self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to student directory</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/students/${student.id}/edit`}
            className="clay-btn px-4 py-2 text-sm font-semibold gap-2 text-[var(--clay-text)] hover:text-[var(--clay-primary)]"
            id="detail-edit-student-btn"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit student</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="clay-btn-danger px-4 py-2 text-sm font-semibold gap-2"
            id="detail-delete-student-btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete student</span>
          </button>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <div className="clay-card p-6 md:p-10 space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-[var(--clay-border)]/60">
          <Avatar
            photoUrl={student.photo_url}
            name={student.name}
            size="xl"
            className="w-28 h-28 md:w-32 md:h-32 text-4xl"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="clay-badge-inset px-3.5 py-1 text-xs font-bold text-[var(--clay-text)] tracking-wider"
                title="Admission Number"
              >
                {student.admission_number}
              </span>
              <span className="clay-badge px-3 py-0.5 text-xs font-semibold text-[var(--clay-text-secondary)]">
                Year {student.year}
              </span>
              <span className="clay-badge px-3 py-0.5 text-xs font-semibold text-[var(--clay-text-secondary)]">
                {student.gender}
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-[var(--clay-text)] tracking-tight m-0">
              {student.name}
            </h2>

            <div className="flex items-center gap-2 text-base text-[var(--clay-primary)] font-semibold">
              <GraduationCap className="w-5 h-5" />
              <span>{student.course}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Information */}
          <div className="clay-card-subtle p-6 space-y-4">
            <h4 className="text-sm font-bold text-[var(--clay-text)] uppercase tracking-wider flex items-center gap-2 m-0">
              <BookOpen className="w-4 h-4 text-[var(--clay-primary)]" />
              <span>Academic record</span>
            </h4>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[var(--clay-border)]/40">
                <span className="text-[var(--clay-text-secondary)] font-medium">Admission ID:</span>
                <span className="font-bold text-[var(--clay-text)]">{student.admission_number}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--clay-border)]/40">
                <span className="text-[var(--clay-text-secondary)] font-medium">Course:</span>
                <span className="font-bold text-[var(--clay-text)]">{student.course}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--clay-border)]/40">
                <span className="text-[var(--clay-text-secondary)] font-medium">Current year:</span>
                <span className="font-bold text-[var(--clay-text)]">Year {student.year}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[var(--clay-text-secondary)] font-medium">Enrolled on:</span>
                <span className="font-bold text-[var(--clay-text)]">{formattedCreated}</span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="clay-card-subtle p-6 space-y-4">
            <h4 className="text-sm font-bold text-[var(--clay-text)] uppercase tracking-wider flex items-center gap-2 m-0">
              <User className="w-4 h-4 text-[var(--clay-primary)]" />
              <span>Personal details</span>
            </h4>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-[var(--clay-border)]/40">
                <span className="text-[var(--clay-text-secondary)] font-medium">Full name:</span>
                <span className="font-bold text-[var(--clay-text)]">{student.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--clay-border)]/40">
                <span className="text-[var(--clay-text-secondary)] font-medium">Date of birth:</span>
                <span className="font-bold text-[var(--clay-text)]">{formattedDob}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--clay-border)]/40">
                <span className="text-[var(--clay-text-secondary)] font-medium">Gender:</span>
                <span className="font-bold text-[var(--clay-text)]">{student.gender}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[var(--clay-text-secondary)] font-medium">Record ID:</span>
                <span className="font-mono text-xs text-[var(--clay-text-secondary)] truncate max-w-[150px]">
                  {student.id}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="clay-card-subtle p-6 space-y-4 md:col-span-2">
            <h4 className="text-sm font-bold text-[var(--clay-text)] uppercase tracking-wider flex items-center gap-2 m-0">
              <Mail className="w-4 h-4 text-[var(--clay-primary)]" />
              <span>Contact & address</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-sm">
              <div className="clay-badge-inset p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--clay-surface)] flex items-center justify-center text-[var(--clay-primary)] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-[var(--clay-text-secondary)] font-semibold">Email address</div>
                  <a
                    href={`mailto:${student.email}`}
                    className="font-bold text-[var(--clay-text)] hover:underline truncate block"
                  >
                    {student.email}
                  </a>
                </div>
              </div>

              <div className="clay-badge-inset p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--clay-surface)] flex items-center justify-center text-[var(--clay-primary)] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--clay-text-secondary)] font-semibold">Mobile number</div>
                  <a
                    href={`tel:${student.mobile_number}`}
                    className="font-bold text-[var(--clay-text)] hover:underline block"
                  >
                    {student.mobile_number}
                  </a>
                </div>
              </div>

              <div className="clay-badge-inset p-4 rounded-2xl md:col-span-2 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--clay-surface)] flex items-center justify-center text-[var(--clay-primary)] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--clay-text-secondary)] font-semibold">Residential address</div>
                  <p className="font-semibold text-[var(--clay-text)] m-0 leading-relaxed">
                    {student.address || 'No residential address recorded.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps footer */}
        <div className="pt-4 border-t border-[var(--clay-border)]/40 flex flex-wrap items-center justify-between text-xs text-[var(--clay-text-secondary)] font-medium gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Created {formattedCreated}</span>
          </div>
          {student.updated_at && (
            <span>
              Last updated {new Date(student.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete student record"
        message={`Are you sure you want to permanently delete ${student.name} (${student.admission_number})? This cannot be undone.`}
        confirmLabel="Delete student"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default StudentDetailPage;
