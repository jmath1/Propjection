import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Projection, RentalUnit } from '../types';
import { projectionsAPI, unitsAPI } from '../api/client';
import FormSection from '../components/FormSection';
import FormField from '../components/FormField';
import RentalUnitsEditor from '../components/RentalUnitsEditor';
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
        <FormSection title="Basic Information">
          <FormField label="Projection Name">
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-input"
            />
          </FormField>
          <FormField label="Purchase Year">
            <input
              type="number"
              value={formData.purchase_year || 0}
              onChange={(e) => handleInputChange('purchase_year', parseInt(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Analysis Horizon (years)">
            <input
              type="number"
              value={formData.analysis_horizon_years || 0}
              onChange={(e) => handleInputChange('analysis_horizon_years', parseInt(e.target.value))}
              className="form-input"
            />
          </FormField>
        </FormSection>

        <FormSection title="Property">
          <FormField label="Purchase Price">
            <input
              type="number"
              value={formData.purchase_price || 0}
              onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Down Payment %">
            <input
              type="number"
              step="0.01"
              value={formData.down_payment_pct || 0}
              onChange={(e) => handleInputChange('down_payment_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Annual Appreciation %">
            <input
              type="number"
              step="0.001"
              value={formData.annual_appreciation_pct || 0}
              onChange={(e) => handleInputChange('annual_appreciation_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
        </FormSection>

        <FormSection title="Mortgage" cols={3}>
          <FormField label="Interest Rate %">
            <input
              type="number"
              step="0.001"
              value={formData.interest_rate || 0}
              onChange={(e) => handleInputChange('interest_rate', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Term (years)">
            <input
              type="number"
              value={formData.term_years || 0}
              onChange={(e) => handleInputChange('term_years', parseInt(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="PMI Rate %">
            <input
              type="number"
              step="0.0001"
              value={formData.pmi_rate || 0}
              onChange={(e) => handleInputChange('pmi_rate', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
        </FormSection>

        <FormSection title="Operating Expenses">
          <FormField label="Property Tax %">
            <input
              type="number"
              step="0.001"
              value={formData.property_tax_pct || 0}
              onChange={(e) => handleInputChange('property_tax_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Insurance Annual $">
            <input
              type="number"
              value={formData.insurance_annual || 0}
              onChange={(e) => handleInputChange('insurance_annual', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Maintenance %">
            <input
              type="number"
              step="0.001"
              value={formData.maintenance_pct || 0}
              onChange={(e) => handleInputChange('maintenance_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Utilities Annual $">
            <input
              type="number"
              value={formData.utilities_annual || 0}
              onChange={(e) => handleInputChange('utilities_annual', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Expense Inflation %">
            <input
              type="number"
              step="0.001"
              value={formData.expense_inflation_pct || 0}
              onChange={(e) => handleInputChange('expense_inflation_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
        </FormSection>

        <FormSection title="Rental Income">
          <FormField label="Annual Rent Growth %">
            <input
              type="number"
              step="0.001"
              value={formData.annual_rent_growth_pct || 0}
              onChange={(e) => handleInputChange('annual_rent_growth_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Vacancy Rate %">
            <input
              type="number"
              step="0.001"
              value={formData.vacancy_rate_pct || 0}
              onChange={(e) => handleInputChange('vacancy_rate_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Property Mgmt %">
            <input
              type="number"
              step="0.001"
              value={formData.property_mgmt_pct || 0}
              onChange={(e) => handleInputChange('property_mgmt_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
        </FormSection>

        <FormSection title="Rental Units">
          <div className="col-span-full">
            <RentalUnitsEditor
              units={units}
              onChange={handleUnitChange}
            />
          </div>
        </FormSection>

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
