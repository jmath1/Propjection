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
    <div className="border-b">
      <button
        onClick={() => onToggle(id)}
        className="w-full px-0 py-3 font-bold text-sm flex justify-between items-center hover:bg-gray-50"
      >
        <span>{label}</span>
        <span className="text-xs">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && <div className="space-y-2 pb-4 pl-2 pr-2">{children}</div>}
    </div>
  );
}
