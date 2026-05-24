import { Projection } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import FormField from '../FormField';

interface Props {
  projection: Projection;
  expanded: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function BasicInfoSection({ projection, expanded, onToggle, onInputChange }: Props) {
  return (
    <CollapsibleSection id="basic" label="Basic Info" expanded={expanded} onToggle={onToggle}>
      <FormField label="Name" compact>
        <input
          type="text"
          value={projection.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Purchase Year" compact>
        <input
          type="number"
          value={projection.purchase_year || 2026}
          onChange={(e) => onInputChange('purchase_year', parseInt(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Analysis Horizon (years)" compact>
        <input
          type="number"
          value={projection.analysis_horizon_years || 30}
          onChange={(e) => onInputChange('analysis_horizon_years', parseInt(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Sale Year (0 = hold)" compact>
        <input
          type="number"
          value={projection.sale_year || 0}
          onChange={(e) => onInputChange('sale_year', parseInt(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
    </CollapsibleSection>
  );
}
