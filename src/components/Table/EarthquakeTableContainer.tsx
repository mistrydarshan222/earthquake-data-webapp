import { useState, useMemo, useEffect, useCallback } from 'react';
import type { EarthquakeData } from '../../types';
import { VirtualizedTable } from './VirtualizedTable';
import { LoadingSpinner, ErrorMessage } from '../ui';

type SortField = keyof EarthquakeData;
type SortDirection = 'asc' | 'desc';

interface EarthquakeTableContainerProps {
  data: EarthquakeData[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export function EarthquakeTableContainer({
  data,
  loading = false,
  error = null,
  className = ''
}: EarthquakeTableContainerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minMagnitude, setMinMagnitude] = useState<number | null>(null);
  const [tableKey, setTableKey] = useState(0);
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const processedData = useMemo(() => {
    let filtered = data;

    // 1. Filtering first (reduce dataset size)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(earthquake =>
        earthquake.place.toLowerCase().includes(term) ||
        earthquake.id.toLowerCase().includes(term) ||
        earthquake.net.toLowerCase().includes(term)
      );
    }

    if (minMagnitude !== null) {
      filtered = filtered.filter(earthquake => earthquake.magnitude >= minMagnitude);
    }

    // 2. Sorting (on already filtered data)
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, searchTerm, minMagnitude, sortField, sortDirection]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Reset table (including pagination) when filters change
  const resetTable = () => {
    setTableKey(prev => prev + 1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    if (searchTerm || minMagnitude !== null) {
      resetTable();
    }
  }, [searchTerm, minMagnitude]);

  if (loading && data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-sm text-gray-600">Loading earthquake data...</p>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <ErrorMessage
        title="Failed to load earthquake data"
        message={error}
        className={`m-4 ${className}`}
      />
    );
  }

  return (
    <div className={className}>
      {/* Filters */}
      <div className="mb-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search earthquakes
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Search by location, ID, or network..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Magnitude Filter */}
        <div className="sm:w-48">
          <label htmlFor="magnitude-filter" className="sr-only">
            Minimum magnitude
          </label>
          <select
            id="magnitude-filter"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={minMagnitude || ''}
            onChange={(e) => setMinMagnitude(e.target.value ? parseFloat(e.target.value) : null)}
          >
            <option value="">All magnitudes</option>
            <option value="1">≥ 1.0</option>
            <option value="2">≥ 2.0</option>
            <option value="3">≥ 3.0</option>
            <option value="4">≥ 4.0</option>
            <option value="5">≥ 5.0</option>
            <option value="6">≥ 6.0</option>
            <option value="7">≥ 7.0</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      {(searchTerm || minMagnitude !== null) && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {processedData.length} of {data.length} earthquake{data.length !== 1 ? 's' : ''}
          {searchTerm && (
            <span> matching "{searchTerm}"</span>
          )}
          {minMagnitude !== null && (
            <span> with magnitude ≥ {minMagnitude}</span>
          )}
          {(searchTerm || minMagnitude !== null) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setMinMagnitude(null);
                resetTable();
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <VirtualizedTable
        key={tableKey}
        data={processedData}
        loading={loading}
        error={error}
        visibleItems={15}
        itemHeight={55}
        pageSize={50}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  );
}