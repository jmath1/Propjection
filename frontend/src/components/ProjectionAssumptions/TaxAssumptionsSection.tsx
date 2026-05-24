import { Projection } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import FormField from '../FormField';

interface Props {
  projection: Projection;
  expanded: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function TaxAssumptionsSection({ projection, expanded, onToggle, onInputChange }: Props) {
  return (
    <CollapsibleSection id="tax" label="Tax Assumptions" expanded={expanded} onToggle={onToggle}>
      <FormField label="Estimated Annual Income 2026 $" compact>
        <input
          type="number"
          value={projection.estimated_annual_income || 0}
          onChange={(e) => onInputChange('estimated_annual_income', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Annual Repairs (Deductible) $" compact>
        <input
          type="number"
          value={projection.repairs_annual || 0}
          onChange={(e) => onInputChange('repairs_annual', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
    </CollapsibleSection>
  );
}
