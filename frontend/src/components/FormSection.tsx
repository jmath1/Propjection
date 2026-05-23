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
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="text-xl font-bold">{title}</h2>
        {headerExtra}
      </div>
      <div className={`grid ${gridClass} gap-4`}>
        {children}
      </div>
    </section>
  );
}
