import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!property) {
    return <div className="text-center py-12">Property not found</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline mb-4">
          ← Back to Properties
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={property.name || ''}
                onChange={(e) => handlePropertyChange('name', e.target.value)}
                className="text-3xl font-bold border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none px-2 py-1 w-full"
              />
            </div>
            <span className={`text-sm font-medium ml-4 whitespace-nowrap ${
              saveStatus === 'saved' ? 'text-green-600' :
              saveStatus === 'saving' ? 'text-blue-600' :
              'text-orange-600'
            }`}>
              {saveStatus === 'saved' && '✓ Saved'}
              {saveStatus === 'saving' && '⟳ Saving...'}
              {saveStatus === 'unsaved' && '⚠ Error'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Address</label>
              <input
                type="text"
                value={property.address || ''}
                onChange={(e) => handlePropertyChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Type</label>
              <select
                value={property.property_type || 'sfh'}
                onChange={(e) => handlePropertyChange('property_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-600 block mb-1">Notes</label>
            <textarea
              value={property.notes || ''}
              onChange={(e) => handlePropertyChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Projections</h2>
        <button
          onClick={() => navigate(`/properties/${propertyId}/projections/new`)}
          className="btn btn-primary"
        >
          + New Projection
        </button>
      </div>

      {projections.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No projections yet for this property.</p>
          <button
            onClick={() => navigate(`/properties/${propertyId}/projections/new`)}
            className="btn btn-primary"
          >
            Create First Projection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projections.map((projection) => (
            <div
              key={projection.id}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/properties/${propertyId}/projections/${projection.id}`)}
            >
              <h3 className="text-xl font-bold mb-2">{projection.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>Price: ${Number(projection.purchase_price).toLocaleString()}</p>
                <p>Units: {projection.units?.length || 0}</p>
                <p>Horizon: {projection.analysis_horizon_years} years</p>
              </div>
              <p className="text-xs text-gray-500 mb-4">
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
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProjection(projection.id!);
                  }}
                  className="btn btn-danger text-sm px-3"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
