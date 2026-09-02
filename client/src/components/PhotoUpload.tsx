import React, { useRef, useState } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { Avatar } from './Avatar';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  studentName?: string;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhotoUrl,
  studentName = '',
  onFileSelect,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    setLocalError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Supported formats: JPG, PNG, WEBP');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setLocalError('Photo must be smaller than 5MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  const activePhoto = previewUrl || currentPhotoUrl;
  const displayError = localError || error;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-[var(--clay-text)]">
        Student photo
        <span className="text-xs font-normal text-[var(--clay-text-secondary)] ml-2">
          (Optional, max 5MB — JPG, PNG, WEBP)
        </span>
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`clay-input p-5 cursor-pointer flex flex-col sm:flex-row items-center gap-5 transition-all ${
          isDragging ? 'ring-2 ring-[var(--clay-primary)] scale-[0.99]' : ''
        } ${displayError ? 'clay-input-error' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload student photo"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          id="student-photo-file-input"
        />

        {/* Avatar / Photo Display */}
        <div className="relative shrink-0">
          {activePhoto ? (
            <div className="relative">
              <Avatar photoUrl={activePhoto} name={studentName} size="lg" />
              <button
                type="button"
                onClick={handleClear}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[var(--clay-danger)] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-[var(--clay-text-secondary)]"
              style={{
                backgroundColor: '#EBD8C3',
                boxShadow: 'inset 3px 3px 6px var(--clay-shadow-dark), inset -3px -3px 6px var(--clay-shadow-light)',
              }}
            >
              <Camera className="w-8 h-8 opacity-60 text-[var(--clay-primary)]" />
            </div>
          )}
        </div>

        {/* Text Instructions */}
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-[var(--clay-text)]">
            <Upload className="w-4 h-4 text-[var(--clay-primary)]" />
            <span>{previewUrl ? 'Change selected photo' : currentPhotoUrl ? 'Replace current photo' : 'Click or drag image to upload'}</span>
          </div>
          <p className="text-xs text-[var(--clay-text-secondary)] mt-1 mb-0">
            High quality square portraits are recommended for optimal card rendering.
          </p>
        </div>

        {/* Select button */}
        <div className="shrink-0">
          <span className="clay-btn px-4 py-2 text-xs font-semibold text-[var(--clay-text)] pointer-events-none">
            Browse files
          </span>
        </div>
      </div>

      {displayError && (
        <p className="text-xs font-semibold text-[var(--clay-danger)] mt-1.5 flex items-center gap-1">
          <span>⚠️ {displayError}</span>
        </p>
      )}
    </div>
  );
};

export default PhotoUpload;
