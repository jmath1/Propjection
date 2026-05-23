import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types';
import { propertiesAPI } from '../api/client';

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', property_type: 'sfh', address: '', notes: '' });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.list();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setProperties(data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await propertiesAPI.create(formData);
      setFormData({ name: '', property_type: 'sfh', address: '', notes: '' });
      setShowForm(false);
      loadProperties();
    } catch (error) {
      console.error('Failed to create property:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await propertiesAPI.delete(id);
      loadProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading properties...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Properties</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Property'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">New Property</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="sfh">Single Family Home</option>
                <option value="duplex">Duplex</option>
                <option value="triplex">Triplex</option>
                <option value="quad">Quadplex</option>
                <option value="multiunit">Multi-Unit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn btn-primary">
                Create Property
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/properties/${property.id}`)}>
            <h3 className="text-xl font-bold mb-2">{property.name}</h3>
            {property.address && <p className="text-gray-600 text-sm mb-2">{property.address}</p>}
            <p className="text-gray-500 text-sm mb-4">
              Type: <span className="font-medium">{property.property_type}</span>
            </p>
            {property.notes && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.notes}</p>}
            <p className="text-sm text-gray-500 mb-4">
              {property.projections?.length || 0} projections
            </p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/properties/${property.id}`);
                }}
                className="btn btn-secondary flex-1 text-sm"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(property.id!);
                }}
                className="btn btn-danger text-sm px-3"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No properties yet. Create one to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Create First Property
          </button>
        </div>
      )}
    </div>
  );
}
