import type { ChangeEvent } from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'number';
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  min?: number;
  max?: number;
  helpText?: string;
}

export function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  min,
  max,
  helpText,
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;
  const ariaDescribedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className={error ? 'error' : ''}
        min={min}
        max={max}
        aria-required="true"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={ariaDescribedBy}
      />
      {error && (
        <span id={errorId} className="error-text" role="alert">
          {error}
        </span>
      )}
      {helpText && (
        <p id={helpId} className="help-text">
          {helpText}
        </p>
      )}
    </div>
  );
}
