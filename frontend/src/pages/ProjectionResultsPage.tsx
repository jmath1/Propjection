import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectionResults, Projection, RentalUnit } from '../types';
import { projectionsAPI, unitsAPI } from '../api/client';
import { Check } from 'lucide-react';
import AssumptionsPanel from '../components/ProjectionResults/AssumptionsPanel';
import SummarySection from '../components/ProjectionResults/SummarySection';
import CashflowSection from '../components/ProjectionResults/CashflowSection';
import EquitySection from '../components/ProjectionResults/EquitySection';
import IncomeScheduleSection from '../components/ProjectionResults/IncomeScheduleSection';
import ExpenseScheduleSection from '../components/ProjectionResults/ExpenseScheduleSection';
import ScenariosSection from '../components/ProjectionResults/ScenariosSection';
import VerdictSection from '../components/ProjectionResults/VerdictSection';
import TaxForecastSection from '../components/ProjectionResults/TaxForecastSection';
import AIChatPanel from '../components/ProjectionResults/AIChatPanel';
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
  const [activeTab, setActiveTab] = useState<'summary' | 'income' | 'expenses' | 'cashflow' | 'equity' | 'scenarios' | 'verdict' | 'tax_forecast'>('summary');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [calcStatus, setCalcStatus] = useState<'idle' | 'calculating'>('idle');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [assumptionsPanelVisible, setAssumptionsPanelVisible] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    { id: 'basic', label: 'Basic Info', expanded: true },
    { id: 'property', label: 'Property & Acquisition', expanded: true },
    { id: 'mortgage', label: 'Mortgage', expanded: true },
    { id: 'income', label: 'Rental Income', expanded: false },
    { id: 'expenses', label: 'Operating Expenses', expanded: false },
    { id: 'tax', label: 'Tax Assumptions', expanded: false },
    { id: 'scenarios', label: 'Scenario Margins', expanded: false },
    { id: 'units', label: 'Rental Units', expanded: true },
  ]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recalcTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadProjection();
  }, [projectionId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (recalcTimerRef.current) clearTimeout(recalcTimerRef.current);
    };
  }, []);

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

  const recalculateWithProjection = async (proj: Projection) => {
    if (!proj.id) return;
    try {
      console.log('recalculateWithProjection called with units:', units);
      setCalcStatus('calculating');
      const projectionToSend = toDecimalPct(proj);
      const resultsResponse = await projectionsAPI.calculate(proj.id, projectionToSend, units);
      console.log('recalculateWithProjection got response, setting results');
      setResults(resultsResponse.data);
      setCalcStatus('idle');
    } catch (error) {
      console.error('Failed to recalculate with new assumptions:', error);
      setCalcStatus('idle');
    }
  };

  const recalculateWithUnits = async (proj: Projection, updatedUnits: RentalUnit[]) => {
    if (!proj.id) return;
    try {
      console.log('recalculateWithUnits called with units:', updatedUnits);
      setCalcStatus('calculating');
      const projectionToSend = toDecimalPct(proj);
      const resultsResponse = await projectionsAPI.calculate(proj.id, projectionToSend, updatedUnits);
      console.log('recalculateWithUnits got response, setting results');
      setResults(resultsResponse.data);
      setCalcStatus('idle');
    } catch (error) {
      console.error('Failed to recalculate with new units:', error);
      setCalcStatus('idle');
    }
  };

  const handleProjectionChange = useCallback((field: keyof Projection, value: any) => {
    if (!projection) return;
    const updated = { ...projection, [field]: value };
    setProjection(updated);
    setUnsavedChanges(true);

    // Debounced recalculation for real-time updates
    if (recalcTimerRef.current) {
      clearTimeout(recalcTimerRef.current);
    }
    recalcTimerRef.current = setTimeout(() => {
      recalculateWithProjection(updated);
    }, 500);
  }, [projection]);

  const handleUnitChange = useCallback((index: number, field: keyof RentalUnit, value: any) => {
    const updated = [...units];
    updated[index] = { ...updated[index], [field]: value };
    console.log(`Unit ${index} ${String(field)} changed to`, value, 'updated units:', updated);
    setUnits(updated);
    setUnsavedChanges(true);

    // Debounced recalculation for real-time updates
    if (recalcTimerRef.current) {
      clearTimeout(recalcTimerRef.current);
    }
    recalcTimerRef.current = setTimeout(() => {
      if (projection) {
        console.log('Triggering recalculateWithUnits with units:', updated);
        recalculateWithUnits(projection, updated);
      }
    }, 500);
  }, [units, projection]);

  const handleUnitBlur = useCallback(() => {
    if (projection) {
      recalculate(projection);
    }
  }, [projection]);

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  if (loading || !projection || !results) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading projection...</div>;
  }

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'summary', label: 'Summary' },
    { id: 'income', label: 'Income' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'cashflow', label: 'Cash Flow' },
    { id: 'equity', label: 'Mortgage & Equity' },
    { id: 'tax_forecast', label: 'Tax Forecast' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'verdict', label: 'Verdict' },
  ];

  return (
    <div>
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="text-primary-600 dark:text-primary-400 hover:underline mb-6 flex items-center gap-1">
          ← Back
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="text"
              value={projection.name || ''}
              onChange={(e) => handleProjectionChange('name', e.target.value)}
              className="text-4xl font-bold bg-transparent border-b-2 border-transparent hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 focus:outline-none px-2 py-1 text-gray-900 dark:text-white"
            />
            <span className={`text-sm font-medium whitespace-nowrap flex items-center gap-2 px-3 py-1 rounded-full ${
              unsavedChanges ? 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200' : 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200'
            }`}>
              {unsavedChanges ? <>● Unsaved</> : <><Check size={16} /> Saved</>}
            </span>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setAssumptionsPanelVisible(!assumptionsPanelVisible)}
              className="btn btn-secondary"
              title={assumptionsPanelVisible ? "Hide assumptions" : "Show assumptions"}
            >
              {assumptionsPanelVisible ? 'Hide' : 'Show'} Assumptions
            </button>
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
              className="btn btn-primary"
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
              className="btn btn-secondary"
            >
              Save As
            </button>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-6 lg:h-screen ${assumptionsPanelVisible ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Left: Assumptions */}
        {assumptionsPanelVisible && (
          <div className="lg:col-span-1">
            <AssumptionsPanel
              projection={projection}
              units={units}
              sections={sections}
              onToggle={toggleSection}
              onProjectionChange={handleProjectionChange}
              onUnitChange={handleUnitChange}
              onUnitBlur={handleUnitBlur}
            />
          </div>
        )}

        {/* Right: Results */}
        <div className={`${assumptionsPanelVisible ? 'lg:col-span-2' : 'lg:col-span-1'} overflow-y-auto`}>
          <div className="sticky top-0 bg-white dark:bg-slate-900 z-20 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-2 overflow-x-auto flex-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setChatOpen(true)}
                className="ml-auto px-4 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
              >
                ✨ Ask AI
              </button>
            </div>
          </div>

          <div className="px-4 pt-8">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <SummarySection results={results} projectionId={parseInt(projectionId!)} />
            )}

            {/* Income Tab */}
            {activeTab === 'income' && (
              <IncomeScheduleSection
                results={results}
                hoveredYear={hoveredYear}
                onHoveredYearChange={setHoveredYear}
              />
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <ExpenseScheduleSection
                results={results}
                projection={projection}
                hoveredYear={hoveredYear}
                onHoveredYearChange={setHoveredYear}
              />
            )}

            {/* Cash Flow Tab */}
            {activeTab === 'cashflow' && (
              <CashflowSection
                results={results}
                hoveredYear={hoveredYear}
                onHoveredYearChange={setHoveredYear}
              />
            )}

            {/* Equity Tab */}
            {activeTab === 'equity' && (
              <EquitySection
                results={results}
                hoveredYear={hoveredYear}
                onHoveredYearChange={setHoveredYear}
              />
            )}

            {/* Scenarios Tab */}
            {activeTab === 'scenarios' && (
              <ScenariosSection results={results} />
            )}

            {/* Verdict Tab */}
            {activeTab === 'verdict' && (
              <VerdictSection results={results} />
            )}

            {/* Tax Forecast Tab */}
            {activeTab === 'tax_forecast' && (
              <TaxForecastSection
                results={results}
                hoveredYear={hoveredYear}
                onHoveredYearChange={setHoveredYear}
              />
            )}
          </div>
        </div>
      </div>

      <AIChatPanel
        projectionId={parseInt(projectionId!)}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
