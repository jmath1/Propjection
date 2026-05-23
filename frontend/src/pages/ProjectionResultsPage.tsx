import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectionResults, Projection, RentalUnit } from '../types';
import { projectionsAPI, unitsAPI } from '../api/client';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import CollapsibleSection from '../components/CollapsibleSection';
import FormField from '../components/FormField';
import RentalUnitsEditor from '../components/RentalUnitsEditor';
import { toDisplayPct, toDecimalPct } from '../utils/percentageFields';

interface Section {
  id: string;
  label: string;
  expanded: boolean;
}

export default function ProjectionResultsPage() {
  const { projectionId, propertyId } = useParams<{ projectionId: string; propertyId: string }>();
  const navigate = useNavigate();

  const [projection, setProjection] = useState<Projection | null>(null);
  const [units, setUnits] = useState<RentalUnit[]>([]);
  const [results, setResults] = useState<ProjectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'income' | 'expenses' | 'mortgage' | 'cashflow' | 'equity' | 'scenarios' | 'verdict'>('summary');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sections, setSections] = useState<Section[]>([
    { id: 'basic', label: 'Basic Info', expanded: true },
    { id: 'property', label: 'Property & Acquisition', expanded: true },
    { id: 'mortgage', label: 'Mortgage', expanded: true },
    { id: 'income', label: 'Rental Income', expanded: false },
    { id: 'expenses', label: 'Operating Expenses', expanded: false },
    { id: 'scenarios', label: 'Scenario Margins', expanded: false },
    { id: 'units', label: 'Rental Units', expanded: true },
  ]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadProjection();
  }, [projectionId]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const loadProjection = async () => {
    try {
      if (!projectionId) return;
      const response = await projectionsAPI.get(parseInt(projectionId));
      const projData = toDisplayPct(response.data);
      setProjection(projData);
      setUnits(projData.units || []);
      recalculate(response.data);
    } catch (error) {
      console.error('Failed to load projection:', error);
    } finally {
      setLoading(false);
    }
  };

  const recalculate = async (proj: Projection) => {
    try {
      const resultsResponse = await projectionsAPI.getResults(proj.id!);
      setResults(resultsResponse.data);
    } catch (error) {
      console.error('Failed to calculate results:', error);
    }
  };

  const handleProjectionChange = useCallback((field: keyof Projection, value: any) => {
    if (!projection) return;
    const updated = { ...projection, [field]: value };
    setProjection(updated);
    setUnsavedChanges(true);
  }, [projection]);

  const handleUnitChange = useCallback((index: number, field: keyof RentalUnit, value: any) => {
    const updated = [...units];
    updated[index] = { ...updated[index], [field]: value };
    setUnits(updated);
    setUnsavedChanges(true);
  }, [units]);

  const handleUnitBlur = useCallback(() => {
    // Recalculate when user leaves the field
    if (projection) {
      recalculate(projection);
    }
  }, [projection]);

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  if (loading || !projection || !results) {
    return <div className="text-center py-12">Loading projection...</div>;
  }

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'summary', label: 'Summary' },
    { id: 'income', label: 'Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'cashflow', label: 'Cash Flow' },
    { id: 'equity', label: 'Equity' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'verdict', label: 'Verdict' },
  ];

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
          ← Back
        </button>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="text"
              value={projection.name || ''}
              onChange={(e) => handleProjectionChange('name', e.target.value)}
              className="text-3xl font-bold border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none px-2 py-1"
            />
            <span className={`text-sm font-medium whitespace-nowrap ${
              unsavedChanges ? 'text-orange-600' : 'text-green-600'
            }`}>
              {unsavedChanges ? '● Unsaved changes' : '✓ Saved'}
            </span>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={async () => {
                if (!projection || !projectionId) return;
                try {
                  setSaveStatus('saving');
                  const projectionToSave = toDecimalPct(projection);
                  await projectionsAPI.update(parseInt(projectionId), projectionToSave);

                  for (const unit of units) {
                    if (unit.id) {
                      await unitsAPI.update(unit.id, unit);
                    }
                  }

                  setUnsavedChanges(false);
                  setSaveStatus('saved');
                  setTimeout(() => setSaveStatus('saved'), 2000);
                } catch (error) {
                  console.error('Failed to save:', error);
                  setSaveStatus('unsaved');
                }
              }}
              disabled={!unsavedChanges}
              className={`px-4 py-2 rounded font-medium ${
                unsavedChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save
            </button>
            <button
              onClick={async () => {
                if (!projection || !propertyId || !projectionId) return;
                const name = prompt('New projection name:', `${projection.name} (Copy)`);
                if (!name) return;

                try {
                  setSaveStatus('saving');
                  const response = await projectionsAPI.duplicate(parseInt(projectionId), name);
                  setSaveStatus('saved');
                  setTimeout(() => setSaveStatus('saved'), 2000);
                  navigate(`/properties/${propertyId}/projections/${response.data.id}`);
                } catch (error) {
                  console.error('Failed to save as:', error);
                  setSaveStatus('unsaved');
                }
              }}
              className="px-4 py-2 rounded font-medium bg-green-600 text-white hover:bg-green-700"
            >
              Save As
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
        {/* Left: Edit Form */}
        <div className="lg:col-span-1 overflow-y-auto pb-4 border-r">
          <div className="sticky top-0 bg-white z-10 pb-4 border-b">
            <h2 className="text-xl font-bold">Assumptions</h2>
          </div>

          <div className="pr-4">
            {/* Basic Info */}
            <CollapsibleSection
              id="basic"
              label="Basic Info"
              expanded={sections.find((s: Section) => s.id === 'basic')?.expanded ?? false}
              onToggle={toggleSection}
            >
              <FormField label="Name" compact>
                <input
                  type="text"
                  value={projection.name || ''}
                  onChange={(e) => handleProjectionChange('name', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Purchase Year" compact>
                <input
                  type="number"
                  value={projection.purchase_year || 2026}
                  onChange={(e) => handleProjectionChange('purchase_year', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Analysis Horizon (years)" compact>
                <input
                  type="number"
                  value={projection.analysis_horizon_years || 30}
                  onChange={(e) => handleProjectionChange('analysis_horizon_years', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Sale Year (0 = hold)" compact>
                <input
                  type="number"
                  value={projection.sale_year || 0}
                  onChange={(e) => handleProjectionChange('sale_year', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
            </CollapsibleSection>

            {/* Property & Acquisition */}
            <CollapsibleSection
              id="property"
              label="Property & Acquisition"
              expanded={sections.find((s: Section) => s.id === 'property')?.expanded ?? false}
              onToggle={toggleSection}
            >
              <FormField label="Purchase Price" compact>
                <input
                  type="number"
                  value={projection.purchase_price || 0}
                  onChange={(e) => handleProjectionChange('purchase_price', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Down Payment %" compact>
                <input
                  type="number"
                  step="0.01"
                  value={projection.down_payment_pct || 0}
                  onChange={(e) => handleProjectionChange('down_payment_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Annual Appreciation %" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.annual_appreciation_pct || 0}
                  onChange={(e) => handleProjectionChange('annual_appreciation_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>

              <div className="border-t pt-2 mt-2">
                <div className="text-xs font-bold text-gray-600 mb-2">Acquisition Costs</div>
                <FormField label="Transfer/Sales Tax %" compact>
                  <input
                    type="number"
                    step="0.001"
                    value={projection.transfer_tax_pct || 0}
                    onChange={(e) => handleProjectionChange('transfer_tax_pct', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </FormField>
                <FormField label="Lender Fees $" compact>
                  <input
                    type="number"
                    value={projection.lender_fees || 0}
                    onChange={(e) => handleProjectionChange('lender_fees', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </FormField>
                <FormField label="Title Insurance $" compact>
                  <input
                    type="number"
                    value={projection.title_insurance || 0}
                    onChange={(e) => handleProjectionChange('title_insurance', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </FormField>
                <FormField label="Inspection/Appraisal $" compact>
                  <input
                    type="number"
                    value={projection.inspection_appraisal || 0}
                    onChange={(e) => handleProjectionChange('inspection_appraisal', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </FormField>
                <FormField label="Attorney/Recording Fees $" compact>
                  <input
                    type="number"
                    value={projection.attorney_fees || 0}
                    onChange={(e) => handleProjectionChange('attorney_fees', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </FormField>
                <FormField label="Other Closing Costs $" compact>
                  <input
                    type="number"
                    value={projection.other_closing_costs || 0}
                    onChange={(e) => handleProjectionChange('other_closing_costs', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </FormField>
              </div>
            </CollapsibleSection>

            {/* Mortgage */}
            <CollapsibleSection
              id="mortgage"
              label="Mortgage"
              expanded={sections.find((s: Section) => s.id === 'mortgage')?.expanded ?? false}
              onToggle={toggleSection}
            >
              <FormField label="Interest Rate %" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.interest_rate || 0}
                  onChange={(e) => handleProjectionChange('interest_rate', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Term (years)" compact>
                <input
                  type="number"
                  value={projection.term_years || 30}
                  onChange={(e) => handleProjectionChange('term_years', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="PMI Rate %" compact>
                <input
                  type="number"
                  step="0.0001"
                  value={projection.pmi_rate || 0}
                  onChange={(e) => handleProjectionChange('pmi_rate', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
            </CollapsibleSection>

            {/* Rental Income */}
            <CollapsibleSection
              id="income"
              label="Rental Income"
              expanded={sections.find((s: Section) => s.id === 'income')?.expanded ?? false}
              onToggle={toggleSection}
            >
              <FormField label="Annual Rent Growth %" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.annual_rent_growth_pct || 0}
                  onChange={(e) => handleProjectionChange('annual_rent_growth_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Vacancy Rate %" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.vacancy_rate_pct || 0}
                  onChange={(e) => handleProjectionChange('vacancy_rate_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Property Mgmt % of Rent" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.property_mgmt_pct || 0}
                  onChange={(e) => handleProjectionChange('property_mgmt_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
            </CollapsibleSection>

            {/* Operating Expenses */}
            <CollapsibleSection
              id="expenses"
              label="Operating Expenses"
              expanded={sections.find((s: Section) => s.id === 'expenses')?.expanded ?? false}
              onToggle={toggleSection}
            >
              <FormField label="Property Tax %" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.property_tax_pct || 0}
                  onChange={(e) => handleProjectionChange('property_tax_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Insurance Annual $" compact>
                <input
                  type="number"
                  value={projection.insurance_annual || 0}
                  onChange={(e) => handleProjectionChange('insurance_annual', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="HOA/Condo Fees Annual $" compact>
                <input
                  type="number"
                  value={projection.hoa_annual || 0}
                  onChange={(e) => handleProjectionChange('hoa_annual', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Maintenance %" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.maintenance_pct || 0}
                  onChange={(e) => handleProjectionChange('maintenance_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Utilities Annual $" compact>
                <input
                  type="number"
                  value={projection.utilities_annual || 0}
                  onChange={(e) => handleProjectionChange('utilities_annual', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Expense Inflation %" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.expense_inflation_pct || 0}
                  onChange={(e) => handleProjectionChange('expense_inflation_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Selling Costs %" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.selling_costs_pct || 0}
                  onChange={(e) => handleProjectionChange('selling_costs_pct', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
            </CollapsibleSection>

            {/* Scenario Margins */}
            <CollapsibleSection
              id="scenarios"
              label="Scenario Margins (Bull/Bear)"
              expanded={sections.find((s: Section) => s.id === 'scenarios')?.expanded ?? false}
              onToggle={toggleSection}
            >
              <div className="text-xs text-gray-600 mb-2">Adjust assumptions for Bull/Bear scenarios:</div>
              <FormField label="Appreciation ±%" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.scenario_appreciation_delta || 0}
                  onChange={(e) => handleProjectionChange('scenario_appreciation_delta', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Rent Growth ±%" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.scenario_rent_growth_delta || 0}
                  onChange={(e) => handleProjectionChange('scenario_rent_growth_delta', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Vacancy ±%" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.scenario_vacancy_delta || 0}
                  onChange={(e) => handleProjectionChange('scenario_vacancy_delta', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
              <FormField label="Expense Inflation ±%" compact>
                <input
                  type="number"
                  step="0.001"
                  value={projection.scenario_expense_inflation_delta || 0}
                  onChange={(e) => handleProjectionChange('scenario_expense_inflation_delta', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </FormField>
            </CollapsibleSection>

            {/* Units */}
            <CollapsibleSection
              id="units"
              label="Rental Units"
              expanded={sections.find((s: Section) => s.id === 'units')?.expanded ?? false}
              onToggle={toggleSection}
            >
              <RentalUnitsEditor
                units={units}
                onChange={handleUnitChange}
                onBlur={handleUnitBlur}
                compact
              />
            </CollapsibleSection>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 overflow-y-auto">
          <div className="mb-6">
            <div className="flex gap-2 border-b overflow-x-auto sticky top-0 bg-white z-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm text-gray-600">Purchase Price</div>
                <div className="text-2xl font-bold">
                  ${results.derived.purchase_price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-sm text-gray-600">Year 1 Gross Rent</div>
                <div className="text-2xl font-bold">
                  ${results.income_schedule[0].gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-sm text-gray-600">Year 1 NOI</div>
                <div className="text-2xl font-bold">
                  ${results.cashflow_schedule[0].noi.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <div className="text-sm text-gray-600">Year 1 Cash Flow</div>
                <div className="text-2xl font-bold">
                  ${results.cashflow_schedule[0].annual_cash_flow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded col-span-2">
                <div className="text-sm text-gray-600">Total Cash to Close</div>
                <div className="text-2xl font-bold">
                  ${results.derived.total_cash_to_close.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          )}

          {/* Cash Flow Chart + Table */}
          {activeTab === 'cashflow' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded border">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.cashflow_schedule.map((row: any) => ({
                    ...row,
                    cumulative_cash_flow: Number(row.cumulative_cash_flow),
                  }))} onMouseMove={(state: any) => {
                    if (state && state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                      setHoveredYear(results.cashflow_schedule[state.activeTooltipIndex]?.year_num ?? null);
                    }
                  }} onMouseLeave={() => setHoveredYear(null)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="calendar_year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    <Legend />
                    <Line type="monotone" dataKey="cumulative_cash_flow" stroke="#2563eb" name="Cumulative CF" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Year</th>
                      <th className="px-4 py-2 text-right">NOI</th>
                      <th className="px-4 py-2 text-right">Debt Service</th>
                      <th className="px-4 py-2 text-right">Annual CF</th>
                      <th className="px-4 py-2 text-right">DSCR</th>
                      <th className="px-4 py-2 text-right">Cumulative CF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.cashflow_schedule.map((row) => (
                      <tr
                        key={row.year_num}
                        onMouseEnter={() => setHoveredYear(row.year_num)}
                        onMouseLeave={() => setHoveredYear(null)}
                        className={`border-t transition-all ${
                          hoveredYear === row.year_num
                            ? 'bg-blue-100 shadow-md'
                            : hoveredYear !== null
                            ? 'bg-gray-50 opacity-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-2 font-medium">{row.calendar_year}</td>
                        <td className="px-4 py-2 text-right">${row.noi.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right">${row.debt_service.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right font-medium">${row.annual_cash_flow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right">{row.dscr.toFixed(2)}x</td>
                        <td className="px-4 py-2 text-right font-bold text-blue-600">${row.cumulative_cash_flow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Equity Chart + Table */}
          {activeTab === 'equity' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded border">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.equity_schedule.map((row: any) => ({
                    ...row,
                    home_value: Number(row.home_value),
                    loan_balance: Number(row.loan_balance),
                  }))} onMouseMove={(state) => {
                    if (state && state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                      setHoveredYear(results.equity_schedule[state.activeTooltipIndex]?.year_num ?? null);
                    }
                  }} onMouseLeave={() => setHoveredYear(null)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="calendar_year" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    <Legend />
                    <Line type="monotone" dataKey="home_value" stroke="#10b981" name="Home Value" strokeWidth={2} />
                    <Line type="monotone" dataKey="loan_balance" stroke="#ef4444" name="Loan Balance" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Year</th>
                      <th className="px-4 py-2 text-right">Home Value</th>
                      <th className="px-4 py-2 text-right">Loan Balance</th>
                      <th className="px-4 py-2 text-right">Equity</th>
                      <th className="px-4 py-2 text-right">NOI</th>
                      <th className="px-4 py-2 text-right">Cap Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.equity_schedule.map((row) => (
                      <tr
                        key={row.year_num}
                        onMouseEnter={() => setHoveredYear(row.year_num)}
                        onMouseLeave={() => setHoveredYear(null)}
                        className={`border-t transition-all ${
                          hoveredYear === row.year_num
                            ? 'bg-green-100 shadow-md'
                            : hoveredYear !== null
                            ? 'bg-gray-50 opacity-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-2 font-medium">{row.calendar_year}</td>
                        <td className="px-4 py-2 text-right text-green-600 font-medium">${row.home_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right text-red-600 font-medium">${row.loan_balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right font-bold">${row.gross_equity.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right">${row.noi.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right">{(row.cap_rate * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Income Table */}
          {activeTab === 'income' && (
            <div className="bg-white rounded border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-right">Gross Rent</th>
                    <th className="px-4 py-2 text-right">Effective</th>
                  </tr>
                </thead>
                <tbody>
                  {results.income_schedule.slice(0, 10).map((row) => (
                    <tr key={row.year_num} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{row.calendar_year}</td>
                      <td className="px-4 py-2 text-right">${row.gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right font-medium">${row.effective_rental_income.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Expenses Table */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="bg-white rounded border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Year</th>
                      <th className="px-4 py-2 text-right">Property Tax</th>
                      <th className="px-4 py-2 text-right">Insurance</th>
                      <th className="px-4 py-2 text-right">HOA</th>
                      <th className="px-4 py-2 text-right">Maintenance</th>
                      <th className="px-4 py-2 text-right">Utilities</th>
                      <th className="px-4 py-2 text-right font-bold">Total Operating</th>
                      <th className="px-4 py-2 text-right font-bold">Debt Service</th>
                      <th className="px-4 py-2 text-right font-bold bg-red-100">All-in Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.expense_schedule.slice(0, 10).map((row) => (
                      <tr key={row.year_num} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{row.calendar_year}</td>
                        <td className="px-4 py-2 text-right">${row.property_tax.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right">${row.insurance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right">${row.hoa.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right">${row.maintenance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right">${row.utilities.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right font-medium">${row.total_operating.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right font-medium">${row.debt_service.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-2 text-right font-bold bg-red-50">${row.all_in_cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 p-4 rounded border text-sm space-y-2">
                <h3 className="font-bold mb-3">Expense Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700"><span className="font-medium">Property Tax:</span> Home value × {(projection.property_tax_pct * 100).toFixed(2)}%</p>
                    <p className="text-gray-700"><span className="font-medium">Maintenance:</span> Home value × {(projection.maintenance_pct * 100).toFixed(2)}%</p>
                    <p className="text-gray-700"><span className="font-medium">Insurance:</span> ${projection.insurance_annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year + inflation</p>
                  </div>
                  <div>
                    <p className="text-gray-700"><span className="font-medium">HOA:</span> ${projection.hoa_annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year + inflation</p>
                    <p className="text-gray-700"><span className="font-medium">Utilities:</span> ${projection.utilities_annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year + inflation</p>
                    <p className="text-gray-700"><span className="font-medium">Inflation Rate:</span> {(projection.expense_inflation_pct * 100).toFixed(2)}%/year</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-gray-700"><span className="font-medium">Debt Service:</span> Annual mortgage payment + PMI</p>
                  <p className="text-gray-700"><span className="font-medium">All-in Cost:</span> Total Operating Expenses + Debt Service</p>
                </div>
              </div>
            </div>
          )}

          {/* Scenarios */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              {/* Scenario Assumptions Grid */}
              <div className="grid grid-cols-3 gap-4">
                {(['bull', 'base', 'bear'] as const).map((scenario) => {
                  const scenarioData = results.scenarios[scenario];
                  const scenarioLabel = scenario === 'bull' ? '🚀 Bull Case' : scenario === 'base' ? '📊 Base Case' : '📉 Bear Case';
                  return (
                    <div key={scenario} className={`p-4 rounded border-2 ${
                      scenario === 'bull' ? 'border-green-300 bg-green-50' :
                      scenario === 'base' ? 'border-blue-300 bg-blue-50' :
                      'border-red-300 bg-red-50'
                    }`}>
                      <h3 className="font-bold mb-3 text-center text-lg">{scenarioLabel}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Appreciation:</span>
                          <span className="font-medium">{(scenarioData.appreciation * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rent Growth:</span>
                          <span className="font-medium">{(scenarioData.rent_growth * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vacancy:</span>
                          <span className="font-medium">{(scenarioData.vacancy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expense Inflation:</span>
                          <span className="font-medium">{(scenarioData.expense_inflation * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scenario Comparison - Year 1 Metrics */}
              <div className="bg-white p-4 rounded border">
                <h3 className="font-bold mb-4">Year 1 Comparison</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 p-4 rounded">
                    <div className="text-xs text-gray-600 mb-2">Bull Case</div>
                    <div className="text-2xl font-bold text-green-700">${(results.income_schedule[0].gross_annual_rent * 1.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-gray-600 mt-1">Projected Gross Rent</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-xs text-gray-600 mb-2">Base Case</div>
                    <div className="text-2xl font-bold text-blue-700">${results.income_schedule[0].gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-gray-600 mt-1">Projected Gross Rent</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <div className="text-xs text-gray-600 mb-2">Bear Case</div>
                    <div className="text-2xl font-bold text-red-700">${(results.income_schedule[0].gross_annual_rent * 0.85).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-gray-600 mt-1">Projected Gross Rent</div>
                  </div>
                </div>
              </div>

              {/* Cumulative Cash Flow Projection */}
              <div className="bg-white p-4 rounded border">
                <h3 className="font-bold mb-4">30-Year Cumulative Cash Flow Projection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.cashflow_schedule}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="calendar_year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cumulative_cash_flow"
                      stroke="#3b82f6"
                      name="Base Case CF"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey={(data: any) => data.cumulative_cash_flow * 1.15}
                      stroke="#10b981"
                      name="Bull Case CF (+15%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey={(data: any) => data.cumulative_cash_flow * 0.85}
                      stroke="#ef4444"
                      name="Bear Case CF (-15%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Scenario Outcomes */}
              <div className="bg-white p-4 rounded border">
                <h3 className="font-bold mb-4">30-Year Outcome Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Bull Case',
                        'Total Cash Flow': results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 1.15,
                        'Home Appreciation': (results.equity_schedule[results.equity_schedule.length - 1].home_value * 1.10) - results.derived.purchase_price,
                        fill: '#10b981',
                      },
                      {
                        name: 'Base Case',
                        'Total Cash Flow': results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow,
                        'Home Appreciation': results.equity_schedule[results.equity_schedule.length - 1].home_value - results.derived.purchase_price,
                        fill: '#3b82f6',
                      },
                      {
                        name: 'Bear Case',
                        'Total Cash Flow': results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 0.85,
                        'Home Appreciation': (results.equity_schedule[results.equity_schedule.length - 1].home_value * 0.90) - results.derived.purchase_price,
                        fill: '#ef4444',
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
                    <Legend />
                    <Bar dataKey="Total Cash Flow" stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="Home Appreciation" stackId="a" fill="#fbbf24" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Scenario Table */}
              <div className="bg-white rounded border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Metric</th>
                      <th className="px-4 py-2 text-right bg-green-50">Bull Case</th>
                      <th className="px-4 py-2 text-right bg-blue-50">Base Case</th>
                      <th className="px-4 py-2 text-right bg-red-50">Bear Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-2 font-medium">Year 1 Gross Rent</td>
                      <td className="px-4 py-2 text-right bg-green-50">${(results.income_schedule[0].gross_annual_rent * 1.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right bg-blue-50">${results.income_schedule[0].gross_annual_rent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right bg-red-50">${(results.income_schedule[0].gross_annual_rent * 0.85).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-2 font-medium">Year 30 Home Value</td>
                      <td className="px-4 py-2 text-right bg-green-50">${(results.equity_schedule[results.equity_schedule.length - 1].home_value * 1.10).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right bg-blue-50">${results.equity_schedule[results.equity_schedule.length - 1].home_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right bg-red-50">${(results.equity_schedule[results.equity_schedule.length - 1].home_value * 0.90).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-2 font-medium">30-Year Cumulative CF</td>
                      <td className="px-4 py-2 text-right bg-green-50">${(results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 1.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right bg-blue-50">${results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right bg-red-50">${(results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 0.85).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-2 font-medium">Total Wealth Created</td>
                      <td className="px-4 py-2 text-right bg-green-50 font-bold">${(((results.equity_schedule[results.equity_schedule.length - 1].home_value * 1.10) - results.derived.purchase_price) + (results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 1.15)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right bg-blue-50 font-bold">${((results.equity_schedule[results.equity_schedule.length - 1].home_value - results.derived.purchase_price) + results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right bg-red-50 font-bold">${(((results.equity_schedule[results.equity_schedule.length - 1].home_value * 0.90) - results.derived.purchase_price) + (results.cashflow_schedule[results.cashflow_schedule.length - 1].cumulative_cash_flow * 0.85)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Verdict */}
          {activeTab === 'verdict' && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(results.verdict).map(([key, metric]) => (
                <div
                  key={key}
                  className={`p-3 rounded border-l-4 ${
                    metric.pass ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="text-xs text-gray-600">{metric.description}</div>
                  <div className="text-lg font-bold my-1">
                    {typeof metric.value === 'number' ? (
                      metric.value > 0 && metric.value < 1
                        ? `${(metric.value * 100).toFixed(1)}%`
                        : metric.value.toLocaleString('en-US', { maximumFractionDigits: 2 })
                    ) : metric.value}
                  </div>
                  <div className={`text-xs ${metric.pass ? 'text-green-700' : 'text-red-700'}`}>
                    {metric.pass ? '✓ PASS' : '✗ FAIL'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
