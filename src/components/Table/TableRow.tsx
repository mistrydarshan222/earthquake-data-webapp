import React, { forwardRef } from 'react';
import type { EarthquakeData } from '../../types';
import { formatMagnitude, formatDepth, formatCoordinate, formatDate } from '../../utils/formatters';

interface TableRowProps {
  earthquake: EarthquakeData;
  isSelected: boolean;
  onClick: (earthquake: EarthquakeData) => void;
}

export const TableRow = React.memo(forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ earthquake, isSelected, onClick }, ref) => {
    const handleClick = () => {
      onClick(earthquake);
    };

    const baseClasses = 'cursor-pointer transition-colors duration-150 hover:bg-gray-50';
    const selectedClasses = isSelected 
      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500'
      : '';

    return (
      <tr
        ref={ref}
        className={`${baseClasses} ${selectedClasses}`}
        onClick={handleClick}
        role="row"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
          {formatDate(earthquake.time)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          <div className="max-w-xs truncate" title={earthquake.place}>
            {earthquake.place}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            earthquake.magnitude >= 5 
              ? 'bg-red-100 text-red-800'
              : earthquake.magnitude >= 4
              ? 'bg-orange-100 text-orange-800'
              : earthquake.magnitude >= 3
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
{formatMagnitude(earthquake.magnitude).formatted}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-right">
          {formatDepth(earthquake.depth)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-right">
          {formatCoordinate(earthquake.latitude)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-right">
          {formatCoordinate(earthquake.longitude)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-center">
          {earthquake.magType}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            earthquake.status === 'automatic' 
              ? 'bg-gray-100 text-gray-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {earthquake.status}
          </span>
        </td>
      </tr>
    );
  }
));

TableRow.displayName = 'TableRow';