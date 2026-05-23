import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, Check, AlertCircle } from 'lucide-react';
import { Property, Projection } from '../types';
import { propertiesAPI, projectionsAPI } from '../api/client';

export default function PropertyDetailPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  // Auto-save property changes
  useEffect(() => {
    if (!unsavedChanges || !property || !propertyId) return;

    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        await propertiesAPI.update(parseInt(propertyId), property);
        setUnsavedChanges(false);
        setSaveStatus('saved');

        setTimeout(() => setSaveStatus('saved'), 2000);
      } catch (error) {
        console.error('Failed to save property:', error);
        setSaveStatus('unsaved');
      }
    }, 1000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [unsavedChanges, property, propertyId]);

  const handlePropertyChange = (field: keyof Property, value: any) => {
    if (!property) return;
    const updated = { ...property, [field]: value };
    setProperty(updated);
    setUnsavedChanges(true);
  };

  const loadProperty = async () => {
    try {
      if (!propertyId) return;
      const propResponse = await propertiesAPI.get(parseInt(propertyId));
      setProperty(propResponse.data);

      const projResponse = await projectionsAPI.list(parseInt(propertyId));
      const projData = Array.isArray(projResponse.data) ? projResponse.data : projResponse.data.results || [];
      setProjections(projData);
    } catch (error) {
      console.error('Failed to load property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProjection = async (id: number) => {
    if (!window.confirm('Delete this projection?')) return;
    try {
      await projectionsAPI.delete(id);
      loadProperty();
    } catch (error) {
      console.error('Failed to delete projection:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  if (!property) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Property not found</div>;
  }

  return (
    <div>
      <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 hover:underline mb-6 flex items-center gap-1">
        ← Back to Properties
      </button>

      <div className="card mb-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={property.name || ''}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
              className="text-4xl font-bold bg-transparent border-b-2 border-transparent hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 focus:outline-none px-2 py-1 w-full text-gray-900 dark:text-white"
            />
          </div>
          <div className={`text-sm font-medium ml-4 whitespace-nowrap flex items-center gap-2 px-3 py-1 rounded-full ${
            saveStatus === 'saved' ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200' :
            saveStatus === 'saving' ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200' :
            'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200'
          }`}>
            {saveStatus === 'saved' && <><Check size={16} /> Saved</>}
            {saveStatus === 'saving' && <>⟳ Saving...</>}
            {saveStatus === 'unsaved' && <><AlertCircle size={16} /> Error</>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-2">Address</label>
            <input
              type="text"
              value={property.address || ''}
              onChange={(e) => handlePropertyChange('address', e.target.value)}
              className="form-input"
              placeholder="Property address"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-2">Type</label>
            <select
              value={property.property_type || 'sfh'}
              onChange={(e) => handlePropertyChange('property_type', e.target.value)}
              className="form-input"
            >
              <option value="sfh">Single Family Home</option>
              <option value="duplex">Duplex</option>
              <option value="triplex">Triplex</option>
              <option value="quad">Quadplex</option>
              <option value="multiunit">Multi-Unit</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-2">Notes</label>
          <textarea
            value={property.notes || ''}
            onChange={(e) => handlePropertyChange('notes', e.target.value)}
            className="form-input h-24 resize-none"
            placeholder="Additional notes or details"
          />
        </div>
      </div>

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
                    handleDeleteProjection(projection.id!);
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
    </div>
  );
}
