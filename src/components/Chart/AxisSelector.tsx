import { Select } from '../ui';
import type { NumericEarthquakeField } from '../../types';
import { EARTHQUAKE_FIELD_LABELS } from '../../types';

interface AxisSelectorProps {
  label: string;
  value: NumericEarthquakeField;
  onChange: (value: NumericEarthquakeField) => void;
  className?: string;
}

const AXIS_OPTIONS: { value: NumericEarthquakeField; label: string }[] = [
  { value: 'magnitude', label: EARTHQUAKE_FIELD_LABELS.magnitude },
  { value: 'depth', label: EARTHQUAKE_FIELD_LABELS.depth },
  { value: 'latitude', label: EARTHQUAKE_FIELD_LABELS.latitude },
  { value: 'longitude', label: EARTHQUAKE_FIELD_LABELS.longitude },
];

export function AxisSelector({ label, value, onChange, className = '' }: AxisSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Select
        value={value}
        onChange={(newValue) => onChange(newValue as NumericEarthquakeField)}
        options={AXIS_OPTIONS}
        className="w-full"
      />
    </div>
  );
}