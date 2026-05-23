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
  const inputClass = compact
    ? 'w-full px-2 py-1 border rounded text-sm'
    : 'w-full px-3 py-2 border border-gray-300 rounded-lg';

  if (compact) {
    return (
      <div className="space-y-3">
        {units.map((unit, i) => (
          <div key={i} className="border rounded p-2 bg-gray-50">
            <input
              type="text"
              value={unit.label || ''}
              onChange={(e) => onChange(i, 'label', e.target.value)}
              onBlur={onBlur}
              className={`${inputClass} mb-1 font-medium`}
              placeholder="Unit label"
            />
            <FormField label="Monthly Rent" compact>
              <input
                type="number"
                value={unit.monthly_rent || 0}
                onChange={(e) => onChange(i, 'monthly_rent', parseFloat(e.target.value))}
                onBlur={onBlur}
                className={inputClass}
              />
            </FormField>
            <FormField label="Owner-Occupied Years" compact>
              <input
                type="number"
                value={unit.owner_occupied_years || 0}
                onChange={(e) => onChange(i, 'owner_occupied_years', parseInt(e.target.value))}
                onBlur={onBlur}
                className={inputClass}
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
        <div key={index} className="flex gap-4 items-end">
          <div className="flex-1">
            <FormField label="Label">
              <input
                type="text"
                value={unit.label || ''}
                onChange={(e) => onChange(index, 'label', e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="flex-1">
            <FormField label="Monthly Rent">
              <input
                type="number"
                value={unit.monthly_rent || 0}
                onChange={(e) => onChange(index, 'monthly_rent', parseFloat(e.target.value))}
                className={inputClass}
              />
            </FormField>
          </div>
          <div className="flex-1">
            <FormField label="Owner-Occupied Years">
              <input
                type="number"
                value={unit.owner_occupied_years || 0}
                onChange={(e) => onChange(index, 'owner_occupied_years', parseInt(e.target.value))}
                className={inputClass}
              />
            </FormField>
          </div>
          {units.length > 1 && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="btn btn-danger px-3"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
