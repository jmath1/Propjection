import { Projection } from '../../types';
import FormSection from '../FormSection';
import FormField from '../FormField';

interface Props {
  formData: Partial<Projection>;
  onInputChange: (field: keyof Projection, value: any) => void;
}

export default function AcquisitionCostsSection({ formData, onInputChange }: Props) {
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

      <div className="col-span-full border-t pt-6 mt-6">
        <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Acquisition Costs</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Transfer/Sales Tax %">
            <input
              type="number"
              step="0.001"
              value={formData.transfer_tax_pct || 0}
              onChange={(e) => onInputChange('transfer_tax_pct', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Lender Fees $">
            <input
              type="number"
              value={formData.lender_fees || 0}
              onChange={(e) => onInputChange('lender_fees', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Title Insurance $">
            <input
              type="number"
              value={formData.title_insurance || 0}
              onChange={(e) => onInputChange('title_insurance', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Inspection/Appraisal $">
            <input
              type="number"
              value={formData.inspection_appraisal || 0}
              onChange={(e) => onInputChange('inspection_appraisal', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Attorney/Recording Fees $">
            <input
              type="number"
              value={formData.attorney_fees || 0}
              onChange={(e) => onInputChange('attorney_fees', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
          <FormField label="Other Closing Costs $">
            <input
              type="number"
              value={formData.other_closing_costs || 0}
              onChange={(e) => onInputChange('other_closing_costs', parseFloat(e.target.value))}
              className="form-input"
            />
          </FormField>
        </div>
      </div>
    </FormSection>
  );
}
