import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Projection, RentalUnit } from '../types';
import { projectionsAPI, unitsAPI } from '../api/client';
import BasicInformationSection from '../components/EditProjection/BasicInformationSection';
import PropertySection from '../components/EditProjection/PropertySection';
import MortgageSection from '../components/EditProjection/MortgageSection';
import OperatingExpensesSection from '../components/EditProjection/OperatingExpensesSection';
import RentalIncomeSection from '../components/EditProjection/RentalIncomeSection';
import RentalUnitsSection from '../components/EditProjection/RentalUnitsSection';
import { toDisplayPct, toDecimalPct } from '../utils/percentageFields';

export default function ProjectionEditPage() {
  const { projectionId } = useParams<{ projectionId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Projection> | null>(null);
  const [units, setUnits] = useState<Partial<RentalUnit>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjection();
  }, [projectionId]);

  const loadProjection = async () => {
    try {
      if (!projectionId) return;
      const response = await projectionsAPI.get(parseInt(projectionId));
      const projData = toDisplayPct(response.data);
      setFormData(projData);
      setUnits(projData.units || []);
    } catch (error) {
      console.error('Failed to load projection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Projection, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleUnitChange = (index: number, field: keyof RentalUnit, value: any) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !projectionId) return;

    setSaving(true);
    try {
      const dataToSubmit = toDecimalPct(formData);
      await projectionsAPI.update(parseInt(projectionId), dataToSubmit);

      // Update units
      for (const unit of units) {
        if (unit.id) {
          await unitsAPI.update(unit.id, unit);
        }
      }

      // Fetch fresh calculations and navigate to results
      const projectionData = await projectionsAPI.get(parseInt(projectionId));
      await projectionsAPI.getResults(parseInt(projectionId));
      navigate(`/properties/${projectionData.data.property}/projections/${projectionId}`);
    } catch (error) {
      console.error('Failed to update projection:', error);
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <div className="text-center py-12">Loading projection...</div>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-primary-600 dark:text-primary-400 hover:underline mb-6 flex items-center gap-1">
        ← Back
      </button>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Edit Projection</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Update your assumptions and see how they affect your projections</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <BasicInformationSection formData={formData} onInputChange={handleInputChange} />
        <PropertySection formData={formData} onInputChange={handleInputChange} />
        <MortgageSection formData={formData} onInputChange={handleInputChange} />
        <OperatingExpensesSection formData={formData} onInputChange={handleInputChange} />
        <RentalIncomeSection formData={formData} onInputChange={handleInputChange} />
        <RentalUnitsSection units={units} onUnitChange={handleUnitChange} />

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
