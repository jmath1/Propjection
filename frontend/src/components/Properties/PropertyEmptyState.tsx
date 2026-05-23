import { Plus } from 'lucide-react';

interface Props {
  onCreateClick: () => void;
}

export default function PropertyEmptyState({ onCreateClick }: Props) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🏠</div>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">No properties yet. Create one to get started.</p>
      <button onClick={onCreateClick} className="btn btn-primary">
        <Plus size={20} />
        Create First Property
      </button>
    </div>
  );
}
