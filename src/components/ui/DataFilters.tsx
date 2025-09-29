import { useState, useCallback, useMemo } from 'react';
import type { EarthquakeData } from '../../types';
import { Button, Select } from '../ui';

interface DataFiltersProps {
  data: EarthquakeData[];
  onFilterChange: (filteredData: EarthquakeData[]) => void;
  className?: string;
}

interface FilterState {
  minMagnitude: number;
  maxMagnitude: number;
  dateRange: 'all' | '1day' | '7days' | '30days';
  magnitudeRange: 'all' | 'minor' | 'moderate' | 'strong' | 'major';
}

const MAGNITUDE_RANGES = {
  all: [0, 10],
  minor: [0, 3.9],
  moderate: [4, 4.9],
  strong: [5, 5.9],
  major: [6, 10]
} as const;

export function DataFilters({ data, onFilterChange, className = '' }: DataFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    minMagnitude: 0,
    maxMagnitude: 10,
    dateRange: 'all',
    magnitudeRange: 'all'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate data statistics for smart defaults
  const dataStats = useMemo(() => {
    if (data.length === 0) return null;
    
    const magnitudes = data.map(eq => eq.magnitude);
    const dates = data.map(eq => new Date(eq.time));
    
    return {
      minMagnitude: Math.min(...magnitudes),
      maxMagnitude: Math.max(...magnitudes),
      minDate: new Date(Math.min(...dates.map(d => d.getTime()))),
      maxDate: new Date(Math.max(...dates.map(d => d.getTime()))),
      totalCount: data.length
    };
  }, [data]);

  const applyFilters = useCallback((newFilters: FilterState) => {
    const filtered = data.filter(earthquake => {
      // Magnitude filter
      if (earthquake.magnitude < newFilters.minMagnitude || 
          earthquake.magnitude > newFilters.maxMagnitude) {
        return false;
      }

      // Date range filter
      if (newFilters.dateRange !== 'all') {
        const now = new Date();
        const earthquakeDate = new Date(earthquake.time);
        const daysDiff = (now.getTime() - earthquakeDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (newFilters.dateRange) {
          case '1day':
            if (daysDiff > 1) return false;
            break;
          case '7days':
            if (daysDiff > 7) return false;
            break;
          case '30days':
            if (daysDiff > 30) return false;
            break;
        }
      }

      return true;
    });

    onFilterChange(filtered);
  }, [data, onFilterChange]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Auto-update magnitude range based on predefined ranges
    if (newFilters.magnitudeRange && newFilters.magnitudeRange !== 'all') {
      const [min, max] = MAGNITUDE_RANGES[newFilters.magnitudeRange];
      updatedFilters.minMagnitude = min;
      updatedFilters.maxMagnitude = max;
    }
    
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  }, [filters, applyFilters]);

  const resetFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      minMagnitude: 0,
      maxMagnitude: 10,
      dateRange: 'all',
      magnitudeRange: 'all'
    };
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  }, [applyFilters]);

  const filteredCount = useMemo(() => {
    return data.filter(earthquake => {
      return earthquake.magnitude >= filters.minMagnitude && 
             earthquake.magnitude <= filters.maxMagnitude;
    }).length;
  }, [data, filters.minMagnitude, filters.maxMagnitude]);

  if (!dataStats) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Data Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      <div className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-gray-600">Showing</div>
            <div className="text-2xl font-bold text-blue-600">{filteredCount}</div>
            <div className="text-gray-500">of {dataStats.totalCount} earthquakes</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-gray-600">Magnitude Range</div>
            <div className="text-lg font-semibold">{filters.minMagnitude} - {filters.maxMagnitude}</div>
            <div className="text-gray-500">Data: {dataStats.minMagnitude.toFixed(1)} - {dataStats.maxMagnitude.toFixed(1)}</div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Magnitude Category
            </label>
            <Select
              value={filters.magnitudeRange}
              onChange={(value) => handleFilterChange({ magnitudeRange: value as FilterState['magnitudeRange'] })}
              options={[
                { value: 'all', label: 'All Magnitudes' },
                { value: 'minor', label: 'Minor (< 4.0)' },
                { value: 'moderate', label: 'Moderate (4.0-4.9)' },
                { value: 'strong', label: 'Strong (5.0-5.9)' },
                { value: 'major', label: 'Major (6.0+)' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <Select
              value={filters.dateRange}
              onChange={(value) => handleFilterChange({ dateRange: value as FilterState['dateRange'] })}
              options={[
                { value: 'all', label: 'All Time' },
                { value: '1day', label: 'Last 24 Hours' },
                { value: '7days', label: 'Last 7 Days' },
                { value: '30days', label: 'Last 30 Days' }
              ]}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Data from {dataStats.minDate.toLocaleDateString()} to {dataStats.maxDate.toLocaleDateString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}