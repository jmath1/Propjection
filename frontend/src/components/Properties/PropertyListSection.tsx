import { Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../../types';

interface Props {
  properties: Property[];
  onDelete: (id: number) => void;
}

export default function PropertyListSection({ properties, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div
          key={property.id}
          className="card cursor-pointer hover:shadow-xl transition-all hover:scale-105 group"
          onClick={() => navigate(`/properties/${property.id}`)}
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {property.name}
            </h3>
            {property.address && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">📍 {property.address}</p>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              <span className="font-semibold">Type:</span> {property.property_type.toUpperCase()}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              <span className="font-semibold">Projections:</span> {property.projections?.length || 0}
            </p>
          </div>

          {property.notes && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 italic">"{property.notes}"</p>
          )}

          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/properties/${property.id}`);
              }}
              className="btn btn-secondary flex-1 text-sm"
            >
              <Eye size={16} />
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(property.id!);
              }}
              className="btn btn-danger text-sm px-3"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
