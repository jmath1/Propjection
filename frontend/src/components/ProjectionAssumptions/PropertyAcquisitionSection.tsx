import { Projection } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import FormField from '../FormField';

interface Props {
  projection: Projection;
  expanded: boolean;
  onToggle: (id: string) => void;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function PropertyAcquisitionSection({ projection, expanded, onToggle, onInputChange }: Props) {
  return (
    <CollapsibleSection id="property" label="Property & Acquisition" expanded={expanded} onToggle={onToggle}>
      <FormField label="Purchase Price" compact>
        <input
          type="number"
          value={projection.purchase_price || 0}
          onChange={(e) => onInputChange('purchase_price', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Down Payment %" compact>
        <input
          type="number"
          step="0.01"
          value={projection.down_payment_pct || 0}
          onChange={(e) => onInputChange('down_payment_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>
      <FormField label="Annual Appreciation %" compact>
        <input
          type="number"
          step="0.001"
          value={projection.annual_appreciation_pct || 0}
          onChange={(e) => onInputChange('annual_appreciation_pct', parseFloat(e.target.value))}
          className="form-input text-sm"
        />
      </FormField>

      <div className="border-t pt-2 mt-2">
        <div className="text-xs font-bold text-gray-600 mb-2">Acquisition Costs</div>
        <FormField label="Transfer/Sales Tax %" compact>
          <input
            type="number"
            step="0.001"
            value={projection.transfer_tax_pct || 0}
            onChange={(e) => onInputChange('transfer_tax_pct', parseFloat(e.target.value))}
            className="form-input text-sm"
          />
        </FormField>
        <FormField label="Lender Fees $" compact>
          <input
            type="number"
            value={projection.lender_fees || 0}
            onChange={(e) => onInputChange('lender_fees', parseFloat(e.target.value))}
            className="form-input text-sm"
          />
        </FormField>
        <FormField label="Title Insurance $" compact>
          <input
            type="number"
            value={projection.title_insurance || 0}
            onChange={(e) => onInputChange('title_insurance', parseFloat(e.target.value))}
            className="form-input text-sm"
          />
        </FormField>
        <FormField label="Inspection/Appraisal $" compact>
          <input
            type="number"
            value={projection.inspection_appraisal || 0}
            onChange={(e) => onInputChange('inspection_appraisal', parseFloat(e.target.value))}
            className="form-input text-sm"
          />
        </FormField>
        <FormField label="Attorney/Recording Fees $" compact>
          <input
            type="number"
            value={projection.attorney_fees || 0}
            onChange={(e) => onInputChange('attorney_fees', parseFloat(e.target.value))}
            className="form-input text-sm"
          />
        </FormField>
        <FormField label="Other Closing Costs $" compact>
          <input
            type="number"
            value={projection.other_closing_costs || 0}
            onChange={(e) => onInputChange('other_closing_costs', parseFloat(e.target.value))}
            className="form-input text-sm"
          />
        </FormField>
      </div>
    </CollapsibleSection>
  );
}
