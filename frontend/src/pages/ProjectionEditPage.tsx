import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Projection, RentalUnit } from '../types';
import { projectionsAPI, unitsAPI } from '../api/client';

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
      let projData = response.data;

      // Convert percentage decimals to percentages for display if needed
      const percentageFields = [
        'down_payment_pct', 'annual_appreciation_pct', 'interest_rate', 'pmi_rate',
        'annual_rent_growth_pct', 'vacancy_rate_pct', 'property_mgmt_pct', 'property_tax_pct',
        'maintenance_pct', 'expense_inflation_pct', 'selling_costs_pct', 'transfer_tax_pct',
        'scenario_appreciation_delta', 'scenario_rent_growth_delta', 'scenario_vacancy_delta',
        'scenario_expense_inflation_delta'
      ];

      percentageFields.forEach(field => {
        const value = (projData as any)[field];
        // If value is between 0 and 1 (proper decimal format), multiply by 100 for display
        if (value != null && value > 0 && value < 1) {
          (projData as any)[field] = value * 100;
        }
      });

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
      // Convert percentage fields from user input (0-100) to decimal format (0-1)
      // Users always enter percentages, so always divide by 100
      const percentageFields = [
        'down_payment_pct', 'annual_appreciation_pct', 'interest_rate', 'pmi_rate',
        'annual_rent_growth_pct', 'vacancy_rate_pct', 'property_mgmt_pct', 'property_tax_pct',
        'maintenance_pct', 'expense_inflation_pct', 'selling_costs_pct', 'transfer_tax_pct',
        'scenario_appreciation_delta', 'scenario_rent_growth_delta', 'scenario_vacancy_delta',
        'scenario_expense_inflation_delta'
      ];

      const dataToSubmit = { ...formData };
      percentageFields.forEach(field => {
        const value = (dataToSubmit as any)[field];
        if (field in dataToSubmit && value != null && value !== 0) {
          (dataToSubmit as any)[field] = value / 100;
        }
      });

      await projectionsAPI.update(parseInt(projectionId), dataToSubmit);

      // Update units
      for (const unit of units) {
        if (unit.id) {
          await unitsAPI.update(unit.id, unit);
        }
      }

      navigate(-1);
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
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-8">Edit Projection</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="card">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Projection Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Year</label>
              <input
                type="number"
                value={formData.purchase_year || 0}
                onChange={(e) => handleInputChange('purchase_year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Analysis Horizon (years)</label>
              <input
                type="number"
                value={formData.analysis_horizon_years || 0}
                onChange={(e) => handleInputChange('analysis_horizon_years', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Property */}
        <section className="card">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Property</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Price</label>
              <input
                type="number"
                value={formData.purchase_price || 0}
                onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Down Payment %</label>
              <input
                type="number"
                step="0.01"
                value={formData.down_payment_pct || 0}
                onChange={(e) => handleInputChange('down_payment_pct', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Annual Appreciation %</label>
              <input
                type="number"
                step="0.001"
                value={formData.annual_appreciation_pct || 0}
                onChange={(e) => handleInputChange('annual_appreciation_pct', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Mortgage */}
        <section className="card">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Mortgage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Interest Rate %</label>
              <input
                type="number"
                step="0.001"
                value={formData.interest_rate || 0}
                onChange={(e) => handleInputChange('interest_rate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Term (years)</label>
              <input
                type="number"
                value={formData.term_years || 0}
                onChange={(e) => handleInputChange('term_years', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PMI Rate %</label>
              <input
                type="number"
                step="0.0001"
                value={formData.pmi_rate || 0}
                onChange={(e) => handleInputChange('pmi_rate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Expenses */}
        <section className="card">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Operating Expenses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Property Tax %</label>
              <input
                type="number"
                step="0.001"
                value={formData.property_tax_pct || 0}
                onChange={(e) => handleInputChange('property_tax_pct', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Insurance Annual $</label>
              <input
                type="number"
                value={formData.insurance_annual || 0}
                onChange={(e) => handleInputChange('insurance_annual', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maintenance %</label>
              <input
                type="number"
                step="0.001"
                value={formData.maintenance_pct || 0}
                onChange={(e) => handleInputChange('maintenance_pct', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Utilities Annual $</label>
              <input
                type="number"
                value={formData.utilities_annual || 0}
                onChange={(e) => handleInputChange('utilities_annual', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expense Inflation %</label>
              <input
                type="number"
                step="0.001"
                value={formData.expense_inflation_pct || 0}
                onChange={(e) => handleInputChange('expense_inflation_pct', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Rental Income */}
        <section className="card">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Rental Income</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Annual Rent Growth %</label>
              <input
                type="number"
                step="0.001"
                value={formData.annual_rent_growth_pct || 0}
                onChange={(e) => handleInputChange('annual_rent_growth_pct', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vacancy Rate %</label>
              <input
                type="number"
                step="0.001"
                value={formData.vacancy_rate_pct || 0}
                onChange={(e) => handleInputChange('vacancy_rate_pct', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Property Mgmt %</label>
              <input
                type="number"
                step="0.001"
                value={formData.property_mgmt_pct || 0}
                onChange={(e) => handleInputChange('property_mgmt_pct', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Rental Units */}
        <section className="card">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Rental Units</h2>
          <div className="space-y-4">
            {units.map((unit, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <input
                    type="text"
                    value={unit.label || ''}
                    onChange={(e) => handleUnitChange(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Monthly Rent</label>
                  <input
                    type="number"
                    value={unit.monthly_rent || 0}
                    onChange={(e) => handleUnitChange(index, 'monthly_rent', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Owner-Occupied Years</label>
                  <input
                    type="number"
                    value={unit.owner_occupied_years || 0}
                    onChange={(e) => handleUnitChange(index, 'owner_occupied_years', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

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
