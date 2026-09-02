import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete student',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="clay-card-elevated w-full max-w-md p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--clay-surface)',
        }}
      >
        {/* Header Icon + Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--clay-danger)',
                color: '#FFFFFF',
                boxShadow: '4px 4px 10px rgba(217, 105, 90, 0.4), -4px -4px 10px var(--clay-shadow-light)',
              }}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3
                id="confirm-dialog-title"
                className="text-lg md:text-xl font-bold text-[var(--clay-text)] leading-tight m-0"
              >
                {title}
              </h3>
              <p className="text-xs text-[var(--clay-text-secondary)] font-medium mt-0.5">
                This action cannot be undone
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="clay-btn p-2 text-[var(--clay-text-secondary)] hover:text-[var(--clay-text)]"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body in inset container */}
        <div
          className="clay-badge-inset p-4 rounded-2xl text-sm text-[var(--clay-text)] leading-relaxed"
          style={{ backgroundColor: '#F8ECE0' }}
        >
          {message}
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="clay-btn px-5 py-2.5 text-sm font-semibold text-[var(--clay-text)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="clay-btn-danger px-5 py-2.5 text-sm font-semibold gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
