interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
  hint?: string;
  error?: string;
}

export default function FormField({ label, children, compact = false, hint, error }: FormFieldProps) {
  const labelClass = compact
    ? 'text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300'
    : 'block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200';

  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-danger-600 dark:text-danger-400 mt-1">{error}</p>
      )}
    </div>
  );
}
