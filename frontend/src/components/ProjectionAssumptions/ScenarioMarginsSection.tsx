import { Projection } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import FormField from '../FormField';

interface Props {
  projection: Projection;
  expanded: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function ScenarioMarginsSection({ projection, expanded, onToggle, onInputChange }: Props) {
  return (
    <CollapsibleSection id="scenarios" label="Scenario Margins (Bull/Bear)" expanded={expanded} onToggle={onToggle}>
      <div className="text-xs text-gray-600 mb-2">Adjust assumptions for Bull/Bear scenarios:</div>
      <FormField label="Appreciation ±%" compact>
        <input
          type="number"
          step="0.001"
          value={projection.scenario_appreciation_delta || 0}
          onChange={(e) => onInputChange('scenario_appreciation_delta', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Rent Growth ±%" compact>
        <input
          type="number"
          step="0.001"
          value={projection.scenario_rent_growth_delta || 0}
          onChange={(e) => onInputChange('scenario_rent_growth_delta', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Vacancy ±%" compact>
        <input
          type="number"
          step="0.001"
          value={projection.scenario_vacancy_delta || 0}
          onChange={(e) => onInputChange('scenario_vacancy_delta', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Expense Inflation ±%" compact>
        <input
          type="number"
          step="0.001"
          value={projection.scenario_expense_inflation_delta || 0}
          onChange={(e) => onInputChange('scenario_expense_inflation_delta', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
    </CollapsibleSection>
  );
}
