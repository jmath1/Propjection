import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Projection, RentalUnit } from '../types';
import { projectionsAPI, unitsAPI } from '../api/client';
import FormSection from '../components/FormSection';
import FormField from '../components/FormField';
import RentalUnitsEditor from '../components/RentalUnitsEditor';
import { PERCENTAGE_FIELDS, toDecimalPct } from '../utils/percentageFields';

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
      const dataToSubmit = toDecimalPct(formData);

      const projection = await projectionsAPI.create(dataToSubmit);

      // Create units
      for (const unit of units) {
        await unitsAPI.create({
          ...unit,
          projection: projection.data.id,
        });
      }

      // Fetch fresh calculations and navigate to results
      await projectionsAPI.getResults(projection.data.id);
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
        <FormSection title="Basic Information">
          <FormField label="Projection Name">
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Purchase Year">
            <input
              type="number"
              value={formData.purchase_year || 0}
              onChange={(e) => handleInputChange('purchase_year', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Analysis Horizon (years)">
            <input
              type="number"
              value={formData.analysis_horizon_years || 0}
              onChange={(e) => handleInputChange('analysis_horizon_years', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Sale Year (0 = hold)">
            <input
              type="number"
              value={formData.sale_year || 0}
              onChange={(e) => handleInputChange('sale_year', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
        </FormSection>

        <FormSection title="Property">
          <FormField label="Purchase Price">
            <input
              type="number"
              value={formData.purchase_price || 0}
              onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Down Payment %">
            <input
              type="number"
              step="0.01"
              value={formData.down_payment_pct || 0}
              onChange={(e) => handleInputChange('down_payment_pct', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Annual Appreciation %">
            <input
              type="number"
              step="0.001"
              value={formData.annual_appreciation_pct || 0}
              onChange={(e) => handleInputChange('annual_appreciation_pct', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Term (years)">
            <input
              type="number"
              value={formData.term_years || 0}
              onChange={(e) => handleInputChange('term_years', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="PMI Rate %">
            <input
              type="number"
              step="0.0001"
              value={formData.pmi_rate || 0}
              onChange={(e) => handleInputChange('pmi_rate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Insurance Annual $">
            <input
              type="number"
              value={formData.insurance_annual || 0}
              onChange={(e) => handleInputChange('insurance_annual', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Maintenance %">
            <input
              type="number"
              step="0.001"
              value={formData.maintenance_pct || 0}
              onChange={(e) => handleInputChange('maintenance_pct', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Utilities Annual $">
            <input
              type="number"
              value={formData.utilities_annual || 0}
              onChange={(e) => handleInputChange('utilities_annual', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
          <FormField label="Expense Inflation %">
            <input
              type="number"
              step="0.001"
              value={formData.expense_inflation_pct || 0}
              onChange={(e) => handleInputChange('expense_inflation_pct', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Rental Units"
          headerExtra={
            <button
              type="button"
              onClick={addUnit}
              className="btn btn-secondary text-sm"
            >
              + Add Unit
            </button>
          }
        >
          <div className="col-span-full">
            <RentalUnitsEditor
              units={units}
              onChange={handleUnitChange}
              onRemove={removeUnit}
            />
          </div>
        </FormSection>

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
