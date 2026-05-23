import { Projection } from '../../types';
import FormSection from '../FormSection';
import FormField from '../FormField';

interface Props {
  formData: Partial<Projection>;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function OperatingExpensesSection({ formData, onInputChange }: Props) {
  return (
    <FormSection title="Operating Expenses">
      <FormField label="Property Tax %">
        <input
          type="number"
          step="0.001"
          value={formData.property_tax_pct || 0}
          onChange={(e) => onInputChange('property_tax_pct', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Insurance Annual $">
        <input
          type="number"
          value={formData.insurance_annual || 0}
          onChange={(e) => onInputChange('insurance_annual', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Maintenance %">
        <input
          type="number"
          step="0.001"
          value={formData.maintenance_pct || 0}
          onChange={(e) => onInputChange('maintenance_pct', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Utilities Annual $">
        <input
          type="number"
          value={formData.utilities_annual || 0}
          onChange={(e) => onInputChange('utilities_annual', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
      <FormField label="Expense Inflation %">
        <input
          type="number"
          step="0.001"
          value={formData.expense_inflation_pct || 0}
          onChange={(e) => onInputChange('expense_inflation_pct', parseFloat(e.target.value))}
          className="form-input"
        />
      </FormField>
    </FormSection>
  );
}
