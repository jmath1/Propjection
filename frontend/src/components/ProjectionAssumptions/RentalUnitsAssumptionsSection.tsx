import { Projection, RentalUnit } from '../../types';
import CollapsibleSection from '../CollapsibleSection';
import RentalUnitsEditor from '../RentalUnitsEditor';

interface Props {
  projection: Projection;
  units: RentalUnit[];
  expanded: boolean;
  onToggle: (id: string) => void;
  onUnitChange: (index: number, field: keyof RentalUnit, value: any) => void;
  onUnitBlur: () => void;
}

export default function RentalUnitsAssumptionsSection({
  projection,
  units,
  expanded,
  onToggle,
  onUnitChange,
  onUnitBlur,
}: Props) {
  return (
    <CollapsibleSection id="units" label="Rental Units" expanded={expanded} onToggle={onToggle}>
      <RentalUnitsEditor units={units} onChange={onUnitChange} onBlur={onUnitBlur} compact />
    </CollapsibleSection>
  );
}
