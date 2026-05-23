import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye } from 'lucide-react';
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
    return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading properties...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Properties</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and analyze your real estate investments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Property'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">New Property</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="e.g., Downtown Apartment Complex"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Type *</label>
              <select
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-input"
                placeholder="Street address"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-input h-24 resize-none"
                placeholder="Additional notes or details"
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

      {properties.length > 0 ? (
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
                    handleDelete(property.id!);
                  }}
                  className="btn btn-danger text-sm px-3"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏠</div>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">No properties yet. Create one to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={20} />
            Create First Property
          </button>
        </div>
      )}
    </div>
  );
}
