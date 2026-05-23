import { Projection } from '../../types';
import FormSection from '../FormSection';
import FormField from '../FormField';

interface Props {
  formData: Partial<Projection>;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function PropertySection({ formData, onInputChange }: Props) {
  return (
    <FormSection title="Property">
      <FormField label="Purchase Price">
        <input
          type="number"
          value={formData.purchase_price || 0}
          onChange={(e) => onInputChange('purchase_price', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Down Payment %">
        <input
          type="number"
          step="0.01"
          value={formData.down_payment_pct || 0}
          onChange={(e) => onInputChange('down_payment_pct', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Annual Appreciation %">
        <input
          type="number"
          step="0.001"
          value={formData.annual_appreciation_pct || 0}
          onChange={(e) => onInputChange('annual_appreciation_pct', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
    </FormSection>
  );
}
