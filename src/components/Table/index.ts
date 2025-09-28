/**
 * Table components for earthquake data display
 *
 * Exports:
 * - EarthquakeTable: Main table component with sorting and selection
 * - EarthquakeTableContainer: Table with filtering, pagination, and search
 * - VirtualizedTable: Performance-optimized table for large datasets
 * - TableHeader: Sortable column headers
 * - TableRow: Individual table rows with formatting and selection
 */

export { EarthquakeTable } from './EarthquakeTable';
export { EarthquakeTableContainer } from './EarthquakeTableContainer';
export { VirtualizedTable } from './VirtualizedTable';
export { TableHeader } from './TableHeader';
export { TableRow } from './TableRow';

// Re-export types for convenience
export type {
  EarthquakeData
} from '../../types/earthquake';