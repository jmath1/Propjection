import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Property } from '../types';
import { propertiesAPI } from '../api/client';
import PropertyFormSection from '../components/Properties/PropertyFormSection';
import PropertyListSection from '../components/Properties/PropertyListSection';
import PropertyEmptyState from '../components/Properties/PropertyEmptyState';

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
        <PropertyFormSection
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
        />
      )}

      {properties.length > 0 ? (
        <PropertyListSection properties={properties} onDelete={handleDelete} />
      ) : (
        <PropertyEmptyState onCreateClick={() => setShowForm(true)} />
      )}
    </div>
  );
}
