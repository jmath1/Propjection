import { RentalUnit } from '../../types';
import FormSection from '../FormSection';
import RentalUnitsEditor from '../RentalUnitsEditor';

interface Props {
  units: Partial<RentalUnit>[];
  onUnitChange: (index: number, field: keyof RentalUnit, value: any) => void;
}

export default function RentalUnitsSection({ units, onUnitChange }: Props) {
  return (
    <FormSection title="Rental Units">
      <div className="col-span-full">
        <RentalUnitsEditor
          units={units}
          onChange={onUnitChange}
        />
      </div>
    </FormSection>
  );
}
