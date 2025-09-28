import type { EarthquakeData } from '../../types';
import { VirtualizedTable } from './VirtualizedTable';

interface EarthquakeTableProps {
  data: EarthquakeData[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  visibleItems?: number;
  itemHeight?: number;
}

export function EarthquakeTable({
  data,
  loading = false,
  error = null,
  className = '',
  visibleItems = 10,
  itemHeight = 60
}: EarthquakeTableProps) {
  return (
    <VirtualizedTable
      data={data}
      loading={loading}
      error={error}
      className={className}
      visibleItems={visibleItems}
      itemHeight={itemHeight}
    />
  );
}