import { Plus, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Projection } from '../../types';

interface Props {
  propertyId: string;
  projections: Projection[];
  onDeleteProjection: (id: number) => void;
}

export default function ProjectionsSection({ propertyId, projections, onDeleteProjection }: Props) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Projections</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Analyze different scenarios for this property</p>
        </div>
        <button
          onClick={() => navigate(`/properties/${propertyId}/projections/new`)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          New Projection
        </button>
      </div>

      {projections.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">No projections yet for this property.</p>
          <button
            onClick={() => navigate(`/properties/${propertyId}/projections/new`)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Create First Projection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projections.map((projection) => (
            <div
              key={projection.id}
              className="card cursor-pointer hover:shadow-xl transition-all hover:scale-105 group"
              onClick={() => navigate(`/properties/${propertyId}/projections/${projection.id}`)}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {projection.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <p><span className="font-semibold">Price:</span> ${Number(projection.purchase_price).toLocaleString()}</p>
                <p><span className="font-semibold">Units:</span> {projection.units?.length || 0}</p>
                <p><span className="font-semibold">Horizon:</span> {projection.analysis_horizon_years} years</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                Updated: {new Date(projection.updated_at || '').toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/properties/${propertyId}/projections/${projection.id}`);
                  }}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProjection(projection.id!);
                  }}
                  className="btn btn-danger text-sm px-3"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
