import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: Option[];
  rows?: number;
  min?: number | string;
  max?: number | string;
  readOnly?: boolean;
  helperText?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options = [],
  rows = 3,
  min,
  max,
  readOnly = false,
  helperText,
  className = '',
}) => {
  const baseInputClass = `clay-input w-full px-4 py-3 text-sm text-[var(--clay-text)] font-medium transition-all ${
    error ? 'clay-input-error' : ''
  } ${readOnly ? 'opacity-80 cursor-not-allowed' : ''} ${className}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-bold text-[var(--clay-text)]">
          {label}
          {required && <span className="text-[var(--clay-danger)] ml-1">*</span>}
        </label>
        {helperText && !error && (
          <span className="text-xs text-[var(--clay-text-secondary)]">{helperText}</span>
        )}
      </div>

      {type === 'select' ? (
        <div className="relative">
          <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            disabled={readOnly}
            required={required}
            className={`${baseInputClass} appearance-none pr-10 cursor-pointer`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--clay-text-secondary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          readOnly={readOnly}
          className={`${baseInputClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          readOnly={readOnly}
          className={baseInputClass}
        />
      )}

      {error && (
        <p className="text-xs font-semibold text-[var(--clay-danger)] mt-1 flex items-center gap-1" role="alert">
          <span>⚠️ {error}</span>
        </p>
      )}
    </div>
  );
};

export default FormField;
