import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Projection, RentalUnit } from '../types';
import { projectionsAPI, unitsAPI } from '../api/client';
import BasicInformationSection from '../components/CreateProjection/BasicInformationSection';
import AcquisitionCostsSection from '../components/CreateProjection/AcquisitionCostsSection';
import PropertySection from '../components/CreateProjection/PropertySection';
import OperatingExpensesSection from '../components/CreateProjection/OperatingExpensesSection';
import RentalIncomeSection from '../components/CreateProjection/RentalIncomeSection';
import RentalUnitsSection from '../components/CreateProjection/RentalUnitsSection';
import { toDecimalPct } from '../utils/percentageFields';

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
    refinance_year: 0,
    refinance_rate: 0,
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
      <button onClick={() => navigate(-1)} className="text-primary-600 dark:text-primary-400 hover:underline mb-6 flex items-center gap-1">
        ← Back
      </button>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">New Projection</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Set your assumptions to generate financial projections</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <BasicInformationSection formData={formData} onInputChange={handleInputChange} />
        <AcquisitionCostsSection formData={formData} onInputChange={handleInputChange} />
        <PropertySection formData={formData} onInputChange={handleInputChange} />
        <OperatingExpensesSection formData={formData} onInputChange={handleInputChange} />
        <RentalIncomeSection formData={formData} onInputChange={handleInputChange} />
        <RentalUnitsSection units={units} onUnitChange={handleUnitChange} onAddUnit={addUnit} onRemoveUnit={removeUnit} />

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
