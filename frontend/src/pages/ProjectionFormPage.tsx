import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Projection, RentalUnit } from '../types';
import { projectionsAPI, unitsAPI } from '../api/client';

export default function ProjectionFormPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Projection>>({
    property: propertyId ? parseInt(propertyId) : undefined,
    name: 'Base Case',
    purchase_year: 2026,
    analysis_horizon_years: 30,
    sale_year: 0,
    purchase_price: 500000,
    down_payment_pct: 0.1,
    annual_appreciation_pct: 0.03,
    transfer_tax_pct: 0.01,
    lender_fees: 4000,
    title_insurance: 3500,
    inspection_appraisal: 1500,
    attorney_fees: 2000,
    other_closing_costs: 1000,
    interest_rate: 0.065,
    term_years: 30,
    pmi_rate: 0.005,
    annual_rent_growth_pct: 0.03,
    vacancy_rate_pct: 0,
    property_mgmt_pct: 0.08,
    property_tax_pct: 0.012,
    insurance_annual: 2400,
    hoa_annual: 0,
    maintenance_pct: 0.01,
    utilities_annual: 2400,
    expense_inflation_pct: 0.025,
    selling_costs_pct: 0.06,
    scenario_appreciation_delta: 0.02,
    scenario_rent_growth_delta: 0.03,
    scenario_vacancy_delta: 0.05,
    scenario_expense_inflation_delta: 0.015,
  });

  const [units, setUnits] = useState<Partial<RentalUnit>[]>([
    { label: 'Unit 1', monthly_rent: 1400, owner_occupied_years: 2, order: 0 },
    { label: 'Unit 2', monthly_rent: 1750, owner_occupied_years: 0, order: 1 },
    { label: 'Unit 3', monthly_rent: 1550, owner_occupied_years: 0, order: 2 },
  ]);

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof Projection, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleUnitChange = (index: number, field: keyof RentalUnit, value: any) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const addUnit = () => {
    const newOrder = Math.max(...units.map(u => u.order || 0), 0) + 1;
    setUnits([...units, { label: `Unit ${newOrder + 1}`, monthly_rent: 1500, owner_occupied_years: 0, order: newOrder }]);
  };

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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

      const projection = await projectionsAPI.create(dataToSubmit);

      // Create units
      for (const unit of units) {
        await unitsAPI.create({
          ...unit,
          projection: projection.data.id,
        });
      }

      navigate(`/properties/${propertyId}/projections/${projection.data.id}`);
    } catch (error) {
      console.error('Failed to create projection:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-8">New Projection</h1>

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
            <div>
              <label className="block text-sm font-medium mb-1">Sale Year (0 = hold)</label>
              <input
                type="number"
                value={formData.sale_year || 0}
                onChange={(e) => handleInputChange('sale_year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Property Assumptions */}
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

        {/* Operating Expenses */}
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

        {/* Rental Units */}
        <section className="card">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-xl font-bold">Rental Units</h2>
            <button
              type="button"
              onClick={addUnit}
              className="btn btn-secondary text-sm"
            >
              + Add Unit
            </button>
          </div>
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
                {units.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUnit(index)}
                    className="btn btn-danger px-3"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Projection'}
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
