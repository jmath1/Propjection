import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  id: string;
  label: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  id,
  label,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-gray-200 dark:border-slate-700">
      <button
        onClick={() => onToggle(id)}
        className="w-full px-4 py-3.5 font-semibold text-sm flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-gray-900 dark:text-gray-100"
      >
        <span>{label}</span>
        <ChevronDown
          size={20}
          className={`transform transition-transform duration-200 text-gray-600 dark:text-gray-400 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="space-y-3 pb-4 px-4 bg-gray-50 dark:bg-slate-700/30">
          {children}
        </div>
      )}
    </div>
  );
}
