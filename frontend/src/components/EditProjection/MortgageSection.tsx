import { Projection } from '../../types';
import FormSection from '../FormSection';
import FormField from '../FormField';

interface Props {
  formData: Partial<Projection>;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function MortgageSection({ formData, onInputChange }: Props) {
  return (
    <FormSection title="Mortgage" cols={3}>
      <FormField label="Interest Rate %">
        <input
          type="number"
          step="0.001"
          value={formData.interest_rate || 0}
          onChange={(e) => onInputChange('interest_rate', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Term (years)">
        <input
          type="number"
          value={formData.term_years || 0}
          onChange={(e) => onInputChange('term_years', parseInt(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="PMI Rate %">
        <input
          type="number"
          step="0.0001"
          value={formData.pmi_rate || 0}
          onChange={(e) => onInputChange('pmi_rate', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
    </FormSection>
  );
}
