import { Projection } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import FormField from '../FormField';

interface Props {
  projection: Projection;
  expanded: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function RentalIncomeAssumptionsSection({ projection, expanded, onToggle, onInputChange }: Props) {
  return (
    <CollapsibleSection id="income" label="Rental Income" expanded={expanded} onToggle={onToggle}>
      <FormField label="Annual Rent Growth %" compact>
        <input
          type="number"
          step="0.001"
          value={projection.annual_rent_growth_pct || 0}
          onChange={(e) => onInputChange('annual_rent_growth_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Vacancy Rate %" compact>
        <input
          type="number"
          step="0.001"
          value={projection.vacancy_rate_pct || 0}
          onChange={(e) => onInputChange('vacancy_rate_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Property Mgmt % of Rent" compact>
        <input
          type="number"
          step="0.001"
          value={projection.property_mgmt_pct || 0}
          onChange={(e) => onInputChange('property_mgmt_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
    </CollapsibleSection>
  );
}
