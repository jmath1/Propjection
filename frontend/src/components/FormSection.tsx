interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  headerExtra?: React.ReactNode;
}

export default function FormSection({ title, children, cols = 2, headerExtra }: FormSectionProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
  }[cols];

  return (
    <section className="card">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {headerExtra && <div className="flex gap-2">{headerExtra}</div>}
      </div>
      <div className={`grid ${gridClass} gap-6`}>
        {children}
      </div>
    </section>
  );
}
