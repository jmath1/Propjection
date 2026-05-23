import { Projection } from '../../types';
import FormSection from '../FormSection';
import FormField from '../FormField';

interface Props {
  formData: Partial<Projection>;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function RentalIncomeSection({ formData, onInputChange }: Props) {
  return (
    <FormSection title="Rental Income">
      <FormField label="Annual Rent Growth %">
        <input
          type="number"
          step="0.001"
          value={formData.annual_rent_growth_pct || 0}
          onChange={(e) => onInputChange('annual_rent_growth_pct', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Vacancy Rate %">
        <input
          type="number"
          step="0.001"
          value={formData.vacancy_rate_pct || 0}
          onChange={(e) => onInputChange('vacancy_rate_pct', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Property Mgmt %">
        <input
          type="number"
          step="0.001"
          value={formData.property_mgmt_pct || 0}
          onChange={(e) => onInputChange('property_mgmt_pct', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
    </FormSection>
  );
}
