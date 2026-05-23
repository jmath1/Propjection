import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property, Projection } from '../types';
import { propertiesAPI, projectionsAPI } from '../api/client';
import PropertyEditSection from '../components/PropertyDetail/PropertyEditSection';
import ProjectionsSection from '../components/PropertyDetail/ProjectionsSection';

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

      <PropertyEditSection
        property={property}
        saveStatus={saveStatus}
        onPropertyChange={handlePropertyChange}
      />

      <ProjectionsSection
        propertyId={propertyId!}
        projections={projections}
        onDeleteProjection={handleDeleteProjection}
      />
    </div>
  );
}
