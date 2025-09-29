import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { EarthquakeData } from '../../types';
import { useSelection } from '../../hooks';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { LoadingSpinner, ErrorMessage } from '../ui';

interface VirtualizedTableV2Props {
  data: EarthquakeData[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  itemHeight?: number;
  visibleItems?: number;
  sortField: keyof EarthquakeData;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof EarthquakeData) => void;
}

const OVERSCAN = 5; // Render extra items for smooth scrolling

export function VirtualizedTableV2({
  data,
  loading = false,
  error = null,
  className = '',
  itemHeight = 60,
  visibleItems = 10,
  sortField,
  sortDirection,
  onSort
}: VirtualizedTableV2Props) {
  const { selectedEarthquake, setSelectedEarthquake } = useSelection();
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate virtual window
  const containerHeight = visibleItems * itemHeight;
  const totalHeight = data.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN);
  const endIndex = Math.min(
    data.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + OVERSCAN
  );

  const visibleData = useMemo(() => 
    data.slice(startIndex, endIndex + 1),
    [data, startIndex, endIndex]
  );

  const offsetY = startIndex * itemHeight;

  // Memoized handlers
  const handleSort = useCallback((field: keyof EarthquakeData) => {
    onSort(field);
    setScrollTop(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [onSort]);

  const handleRowClick = useCallback((earthquake: EarthquakeData) => {
    setSelectedEarthquake(earthquake);
  }, [setSelectedEarthquake]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Auto-scroll to selected item
  useEffect(() => {
    if (selectedEarthquake && containerRef.current) {
      const selectedIndex = data.findIndex(eq => eq.id === selectedEarthquake.id);
      if (selectedIndex >= 0) {
        const targetScrollTop = selectedIndex * itemHeight;
        const currentScrollTop = containerRef.current.scrollTop;
        const containerHeight = containerRef.current.clientHeight;

        // Only scroll if item is not visible
        if (targetScrollTop < currentScrollTop || 
            targetScrollTop > currentScrollTop + containerHeight - itemHeight) {
          containerRef.current.scrollTo({
            top: Math.max(0, targetScrollTop - containerHeight / 2),
            behavior: 'smooth'
          });
        }
      }
    }
  }, [selectedEarthquake, data, itemHeight]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load earthquake data"
        message={error}
        className="m-4"
      />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6m-10 0H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No earthquake data</h3>
          <p className="mt-1 text-sm text-gray-500">No earthquake records found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Fixed Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <table className="min-w-full">
          <TableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </table>
      </div>

      {/* Virtualized Content */}
      <div
        ref={containerRef}
        className="relative overflow-auto bg-white"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
        role="region"
        aria-label="Earthquake data table"
      >
        <div style={{ height: totalHeight }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'relative'
            }}
          >
            <table className="min-w-full">
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleData.map((earthquake) => {
                  const isSelected = selectedEarthquake?.id === earthquake.id;
                  return (
                    <TableRow
                      key={earthquake.id}
                      earthquake={earthquake}
                      isSelected={isSelected}
                      onClick={handleRowClick}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scroll indicator */}
        {data.length > visibleItems && (
          <div className="absolute right-2 top-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 shadow">
            {Math.floor(scrollTop / itemHeight) + 1} - {Math.min(Math.ceil((scrollTop + containerHeight) / itemHeight), data.length)} of {data.length}
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualizedTableV2;