import { Projection } from '../../types';
import FormSection from '../FormSection';
import FormField from '../FormField';

interface Props {
  formData: Partial<Projection>;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function BasicInformationSection({ formData, onInputChange }: Props) {
  return (
    <FormSection title="Basic Information">
      <FormField label="Projection Name">
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          className="form-input"
        />
      </FormField>
      <FormField label="Purchase Year">
        <input
          type="number"
          value={formData.purchase_year || 0}
          onChange={(e) => onInputChange('purchase_year', parseInt(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Analysis Horizon (years)">
        <input
          type="number"
          value={formData.analysis_horizon_years || 0}
          onChange={(e) => onInputChange('analysis_horizon_years', parseInt(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Sale Year (0 = hold)">
        <input
          type="number"
          value={formData.sale_year || 0}
          onChange={(e) => onInputChange('sale_year', parseInt(e.target.value))}
          className="form-input"
        />
      </FormField>
    </FormSection>
  );
}
