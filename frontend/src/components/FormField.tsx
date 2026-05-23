interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}

export default function FormField({ label, children, compact = false }: FormFieldProps) {
  const labelClass = compact
    ? 'text-xs font-medium block mb-1'
    : 'block text-sm font-medium mb-1';

  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
