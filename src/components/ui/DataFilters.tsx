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
    <div className={`bg-white/95 backdrop-blur-sm border-0 rounded-2xl p-6 shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Smart Filters</h3>
            <p className="text-sm text-gray-600">Refine your earthquake data analysis</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2 transition-all duration-200"
        >
          <span className="font-medium text-gray-700">{isExpanded ? 'Collapse' : 'Expand Filters'}</span>
          <svg 
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Always show enhanced quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-700">Earthquakes Shown</div>
              <div className="text-2xl font-bold text-blue-900">{filteredCount.toLocaleString()}</div>
              <div className="text-xs text-blue-600">of {dataStats.totalCount.toLocaleString()} total</div>
            </div>
            <div className="bg-blue-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-700">Magnitude Range</div>
              <div className="text-xl font-bold text-green-900">{filters.minMagnitude} - {filters.maxMagnitude}</div>
              <div className="text-xs text-green-600">Data range: {dataStats.minMagnitude.toFixed(1)} - {dataStats.maxMagnitude.toFixed(1)}</div>
            </div>
            <div className="bg-green-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-purple-700">Filter Efficiency</div>
              <div className="text-xl font-bold text-purple-900">{Math.round((filteredCount / dataStats.totalCount) * 100)}%</div>
              <div className="text-xs text-purple-600">
                {filteredCount === dataStats.totalCount ? 'All data visible' : `${dataStats.totalCount - filteredCount} filtered out`}
              </div>
            </div>
            <div className="bg-purple-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible filter controls */}
      {isExpanded && (
        <div className="space-y-6 border-t border-gray-200/50 pt-6 animate-in slide-in-from-top-2 duration-300">
          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-1 rounded-lg">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <label className="text-sm font-bold text-gray-800">Magnitude Category</label>
              </div>
              <Select
                value={filters.magnitudeRange}
                onChange={(value) => handleFilterChange({ magnitudeRange: value as FilterState['magnitudeRange'] })}
                options={[
                  { value: 'all', label: '🌍 All Magnitudes' },
                  { value: 'minor', label: '🟢 Minor (< 4.0)' },
                  { value: 'moderate', label: '🟡 Moderate (4.0-4.9)' },
                  { value: 'strong', label: '🟠 Strong (5.0-5.9)' },
                  { value: 'major', label: '🔴 Major (6.0+)' }
                ]}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-1 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <label className="text-sm font-bold text-gray-800">Time Period</label>
              </div>
              <Select
                value={filters.dateRange}
                onChange={(value) => handleFilterChange({ dateRange: value as FilterState['dateRange'] })}
                options={[
                  { value: 'all', label: '📅 All Time' },
                  { value: '1day', label: '⏰ Last 24 Hours' },
                  { value: '7days', label: '📊 Last 7 Days' },
                  { value: '30days', label: '📈 Last 30 Days' }
                ]}
              />
            </div>
          </div>

        {/* Enhanced Actions Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Dataset Information</div>
                <div className="text-xs text-gray-600">
                  Data spans from {dataStats.minDate.toLocaleDateString()} to {dataStats.maxDate.toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">Quick Reset</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 transition-all duration-200"
                >
                  🔄 Reset All Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}