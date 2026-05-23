import { Plus } from 'lucide-react';
import { RentalUnit } from '../../types';
import FormSection from '../FormSection';
import RentalUnitsEditor from '../RentalUnitsEditor';

interface Props {
  units: Partial<RentalUnit>[];
  onUnitChange: (index: number, field: keyof RentalUnit, value: any) => void;
  onAddUnit: () => void;
  onRemoveUnit: (index: number) => void;
}

export default function RentalUnitsSection({ units, onUnitChange, onAddUnit, onRemoveUnit }: Props) {
  return (
    <FormSection
      title="Rental Units"
      headerExtra={
        <button
          type="button"
          onClick={onAddUnit}
          className="btn btn-secondary text-sm"
        >
          + Add Unit
        </button>
      }
    >
      <div className="col-span-full">
        <RentalUnitsEditor
          units={units}
          onChange={onUnitChange}
          onRemove={onRemoveUnit}
        />
      </div>
    </FormSection>
  );
}
