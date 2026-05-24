import { Projection } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import FormField from '../FormField';

interface Props {
  projection: Projection;
  expanded: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function OperatingExpensesAssumptionsSection({ projection, expanded, onToggle, onInputChange }: Props) {
  return (
    <CollapsibleSection id="expenses" label="Operating Expenses" expanded={expanded} onToggle={onToggle}>
      <FormField label="Property Tax %" compact>
        <input
          type="number"
          step="0.001"
          value={projection.property_tax_pct || 0}
          onChange={(e) => onInputChange('property_tax_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Insurance Annual $" compact>
        <input
          type="number"
          value={projection.insurance_annual || 0}
          onChange={(e) => onInputChange('insurance_annual', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="HOA/Condo Fees Annual $" compact>
        <input
          type="number"
          value={projection.hoa_annual || 0}
          onChange={(e) => onInputChange('hoa_annual', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Maintenance %" compact>
        <input
          type="number"
          step="0.001"
          value={projection.maintenance_pct || 0}
          onChange={(e) => onInputChange('maintenance_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Utilities Annual $" compact>
        <input
          type="number"
          value={projection.utilities_annual || 0}
          onChange={(e) => onInputChange('utilities_annual', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Expense Inflation %" compact>
        <input
          type="number"
          step="0.001"
          value={projection.expense_inflation_pct || 0}
          onChange={(e) => onInputChange('expense_inflation_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Selling Costs %" compact>
        <input
          type="number"
          step="0.001"
          value={projection.selling_costs_pct || 0}
          onChange={(e) => onInputChange('selling_costs_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
    </CollapsibleSection>
  );
}
