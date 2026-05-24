import { Projection } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import FormField from '../FormField';

interface Props {
  projection: Projection;
  expanded: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function MortgageAssumptionsSection({ projection, expanded, onToggle, onInputChange }: Props) {
  return (
    <div className="border-b border-gray-200 dark:border-slate-700 py-3">
      <CollapsibleSection id="mortgage" label="Mortgage" expanded={expanded} onToggle={onToggle}>
        <div className="space-y-3">
          <FormField label="Interest Rate %" compact>
            <input
              type="number"
              step="0.001"
              value={projection.interest_rate || 0}
              onChange={(e) => onInputChange('interest_rate', parseFloat(e.target.value))}
              className="form-input text-sm"
            />
          </FormField>
          <FormField label="Term (years)" compact>
            <input
              type="number"
              value={projection.term_years || 30}
              onChange={(e) => onInputChange('term_years', parseInt(e.target.value))}
              className="form-input text-sm"
            />
          </FormField>
          <FormField label="PMI Rate %" compact>
            <input
              type="number"
              step="0.0001"
              value={projection.pmi_rate || 0}
              onChange={(e) => onInputChange('pmi_rate', parseFloat(e.target.value))}
              className="form-input text-sm"
            />
          </FormField>
          <FormField label="Refinance Year" compact hint="0 = none">
            <input
              type="number"
              value={projection.refinance_year || 0}
              onChange={(e) => onInputChange('refinance_year', parseInt(e.target.value))}
              className="form-input text-sm"
            />
          </FormField>
          <FormField label="Refinance Rate %" compact>
            <input
              type="number"
              step="0.001"
              value={projection.refinance_rate || 0}
              onChange={(e) => onInputChange('refinance_rate', parseFloat(e.target.value))}
              className="form-input text-sm"
            />
          </FormField>
          <FormField label="Monthly Prepayment $" compact hint="Extra monthly principal payment">
            <input
              type="number"
              value={projection.monthly_prepayment || 0}
              onChange={(e) => onInputChange('monthly_prepayment', parseFloat(e.target.value))}
              className="form-input text-sm"
            />
          </FormField>
        </div>
      </CollapsibleSection>
    </div>
  );
}
