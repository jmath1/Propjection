import { Trash2 } from 'lucide-react';
import { RentalUnit } from '../types';
import FormField from './FormField';

interface RentalUnitsEditorProps {
  units: Partial<RentalUnit>[];
  onChange: (index: number, field: keyof RentalUnit, value: any) => void;
  onBlur?: () => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  compact?: boolean;
}

export default function RentalUnitsEditor({
  units,
  onChange,
  onBlur,
  onAdd,
  onRemove,
  compact = false,
}: RentalUnitsEditorProps) {
  const inputClass = 'form-input';

  if (compact) {
    return (
      <div className="space-y-3">
        {units.map((unit, i) => (
          <div key={i} className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-700/40">
            <input
              type="text"
              value={unit.label || ''}
              onChange={(e) => onChange(i, 'label', e.target.value)}
              onBlur={onBlur}
              className={`${inputClass} text-sm mb-3 font-medium`}
              placeholder="Unit label"
            />
            <FormField label="Monthly Rent" compact>
              <input
                type="number"
                value={unit.monthly_rent || 0}
                onChange={(e) => onChange(i, 'monthly_rent', parseFloat(e.target.value))}
                onBlur={onBlur}
                className={`${inputClass} text-sm`}
              />
            </FormField>
            <FormField label="Owner-Occupied Years" compact>
              <input
                type="number"
                value={unit.owner_occupied_years || 0}
                onChange={(e) => onChange(i, 'owner_occupied_years', parseInt(e.target.value))}
                onBlur={onBlur}
                className={`${inputClass} text-sm`}
              />
            </FormField>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {units.map((unit, index) => (
        <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <FormField label="Label">
                <input
                  type="text"
                  value={unit.label || ''}
                  onChange={(e) => onChange(index, 'label', e.target.value)}
                  className={inputClass}
                />
              </FormField>
            </div>
            <div>
              <FormField label="Monthly Rent">
                <input
                  type="number"
                  value={unit.monthly_rent || 0}
                  onChange={(e) => onChange(index, 'monthly_rent', parseFloat(e.target.value))}
                  className={inputClass}
                />
              </FormField>
            </div>
            <div>
              <FormField label="Owner-Occupied Years">
                <input
                  type="number"
                  value={unit.owner_occupied_years || 0}
                  onChange={(e) => onChange(index, 'owner_occupied_years', parseInt(e.target.value))}
                  className={inputClass}
                />
              </FormField>
            </div>
          </div>
          {units.length > 1 && onRemove && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="btn btn-danger px-3 py-2"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
