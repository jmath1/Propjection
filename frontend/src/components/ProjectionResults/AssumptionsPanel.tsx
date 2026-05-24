import { Projection, RentalUnit } from '../../types';
import BasicInfoSection from '../ProjectionAssumptions/BasicInfoSection';
import PropertyAcquisitionSection from '../ProjectionAssumptions/PropertyAcquisitionSection';
import MortgageAssumptionsSection from '../ProjectionAssumptions/MortgageAssumptionsSection';
import RentalIncomeAssumptionsSection from '../ProjectionAssumptions/RentalIncomeAssumptionsSection';
import OperatingExpensesAssumptionsSection from '../ProjectionAssumptions/OperatingExpensesAssumptionsSection';
import TaxAssumptionsSection from '../ProjectionAssumptions/TaxAssumptionsSection';
import ScenarioMarginsSection from '../ProjectionAssumptions/ScenarioMarginsSection';
import RentalUnitsAssumptionsSection from '../ProjectionAssumptions/RentalUnitsAssumptionsSection';

interface Section {
  id: string;
  label: string;
  expanded: boolean;
}

interface Props {
  projection: Projection;
  units: RentalUnit[];
  sections: Section[];
  onToggle: (id: string) => void;
  onProjectionChange: (field: keyof Projection, value: any) => void;
  onUnitChange: (index: number, field: keyof RentalUnit, value: any) => void;
  onUnitBlur: () => void;
}

export default function AssumptionsPanel({
  projection,
  units,
  sections,
  onToggle,
  onProjectionChange,
  onUnitChange,
  onUnitBlur,
}: Props) {
  const getSection = (id: string) => sections.find((s) => s.id === id);

  return (
    <div className="overflow-y-auto pb-4 border-r border-gray-200 dark:border-slate-700">
      <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assumptions</h2>
      </div>

      <div className="pr-4">
        <BasicInfoSection
          projection={projection}
          expanded={getSection('basic')?.expanded ?? false}
          onToggle={onToggle}
          onInputChange={onProjectionChange}
        />

        <PropertyAcquisitionSection
          projection={projection}
          expanded={getSection('property')?.expanded ?? false}
          onToggle={onToggle}
          onInputChange={onProjectionChange}
        />

        <MortgageAssumptionsSection
          projection={projection}
          expanded={getSection('mortgage')?.expanded ?? false}
          onToggle={onToggle}
          onInputChange={onProjectionChange}
        />

        <RentalIncomeAssumptionsSection
          projection={projection}
          expanded={getSection('income')?.expanded ?? false}
          onToggle={onToggle}
          onInputChange={onProjectionChange}
        />

        <OperatingExpensesAssumptionsSection
          projection={projection}
          expanded={getSection('expenses')?.expanded ?? false}
          onToggle={onToggle}
          onInputChange={onProjectionChange}
        />

        <TaxAssumptionsSection
          projection={projection}
          expanded={getSection('tax')?.expanded ?? false}
          onToggle={onToggle}
          onInputChange={onProjectionChange}
        />

        <ScenarioMarginsSection
          projection={projection}
          expanded={getSection('scenarios')?.expanded ?? false}
          onToggle={onToggle}
          onInputChange={onProjectionChange}
        />

        <RentalUnitsAssumptionsSection
          projection={projection}
          units={units}
          expanded={getSection('units')?.expanded ?? false}
          onToggle={onToggle}
          onUnitChange={onUnitChange}
          onUnitBlur={onUnitBlur}
        />
      </div>
    </div>
  );
}
