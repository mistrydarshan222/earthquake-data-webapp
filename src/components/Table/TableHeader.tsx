import type { EarthquakeData } from '../../types';

type SortField = keyof EarthquakeData;
type SortDirection = 'asc' | 'desc';

interface TableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

interface HeaderColumn {
  key: SortField;
  label: string;
  className?: string;
  sortable?: boolean;
}

const COLUMNS: HeaderColumn[] = [
  { key: 'time', label: 'Date', sortable: true },
  { key: 'place', label: 'Location', sortable: true },
  { key: 'magnitude', label: 'Magnitude', className: 'text-center', sortable: true },
  { key: 'depth', label: 'Depth', className: 'text-right', sortable: true },
  { key: 'latitude', label: 'Latitude', className: 'text-right', sortable: true },
  { key: 'longitude', label: 'Longitude', className: 'text-right', sortable: true },
  { key: 'magType', label: 'Mag Type', className: 'text-center', sortable: true },
  { key: 'status', label: 'Status', className: 'text-center', sortable: true },
];

export function TableHeader({ sortField, sortDirection, onSort }: TableHeaderProps) {
  const handleSort = (field: SortField) => {
    onSort(field);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        {COLUMNS.map((column) => (
          <th
            key={column.key}
            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.className || ''
            } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
            onClick={column.sortable ? () => handleSort(column.key) : undefined}
            role={column.sortable ? 'button' : undefined}
            tabIndex={column.sortable ? 0 : undefined}
            onKeyDown={column.sortable ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSort(column.key);
              }
            } : undefined}
          >
            <div className="flex items-center space-x-1">
              <span>{column.label}</span>
              {column.sortable && <SortIcon field={column.key} />}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}