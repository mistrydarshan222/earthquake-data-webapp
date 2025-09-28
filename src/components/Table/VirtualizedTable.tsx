import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { EarthquakeData } from '../../types';
import { useSelection } from '../../hooks';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { LoadingSpinner, ErrorMessage } from '../ui';

interface VirtualizedTableProps {
  data: EarthquakeData[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  itemHeight?: number;
  visibleItems?: number;
  pageSize?: number;
  sortField: keyof EarthquakeData;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof EarthquakeData) => void;
}

type SortField = keyof EarthquakeData;

function VirtualizedTableComponent({
  data,
  loading = false,
  error = null,
  className = '',
  itemHeight = 60,
  visibleItems = 10,
  pageSize = 20,
  sortField,
  sortDirection,
  onSort
}: VirtualizedTableProps) {
  const { selectedEarthquake, setSelectedEarthquake } = useSelection();
  const [scrollTop, setScrollTop] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  // Data is already sorted from parent component
  const sortedData = data;

  // Pagination logic
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Virtual scrolling within current page
  const containerHeight = Math.min(visibleItems, paginatedData.length) * itemHeight;
  const totalHeight = paginatedData.length * itemHeight;

  const virtualStartIndex = Math.floor(scrollTop / itemHeight);
  const virtualEndIndex = Math.min(virtualStartIndex + visibleItems + 2, paginatedData.length);
  const visibleData = paginatedData.slice(virtualStartIndex, virtualEndIndex);

  const offsetY = virtualStartIndex * itemHeight;

  const handleSort = useCallback((field: SortField) => {
    onSort(field);
    setCurrentPage(1); // Reset to first page when sorting
    setScrollTop(0); // Reset scroll position
  }, [onSort]);

  // Stable row click handler to prevent re-renders
  const handleRowClick = useCallback((earthquake: EarthquakeData) => {
    setSelectedEarthquake(earthquake);
  }, [setSelectedEarthquake]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setScrollTop(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0 });
    }
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, handlePageChange]);

  useEffect(() => {
    if (selectedEarthquake) {
      const selectedIndex = sortedData.findIndex(eq => eq.id === selectedEarthquake.id);
      if (selectedIndex >= 0) {
        // Calculate which page the selected item is on
        const targetPage = Math.floor(selectedIndex / pageSize) + 1;

        if (targetPage !== currentPage) {
          // Navigate to the page containing the selected item
          setCurrentPage(targetPage);
          setScrollTop(0);
          if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0 });
          }
        } else if (containerRef.current) {
          // Item is on current page, scroll to it within the virtual list
          const indexInPage = selectedIndex % pageSize;
          const targetScrollTop = indexInPage * itemHeight;

          // Scroll to center the selected item
          containerRef.current.scrollTo({
            top: Math.max(0, targetScrollTop - (containerHeight / 2) + (itemHeight / 2)),
            behavior: 'smooth'
          });
        }
      }
    }
    // Removed scrollTop from dependency array to prevent expensive re-runs on every scroll
  }, [selectedEarthquake, sortedData, itemHeight, containerHeight, pageSize, currentPage]);

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
          <p className="mt-1 text-sm text-gray-500">No earthquake records found for the selected criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="border-b border-gray-200">
        <table className="min-w-full">
          <TableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </table>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
        role="region"
        aria-label="Virtualized earthquake data table"
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
                      ref={isSelected ? selectedRowRef : undefined}
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
      </div>

      <div className="bg-white px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* Results info */}
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{endIndex}</span> of <span className="font-semibold text-gray-900">{totalItems}</span> earthquake{totalItems !== 1 ? 's' : ''}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center space-x-3">
            {/* First page button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
              title="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Previous page button */}
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Page</span>
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-semibold text-blue-700">{currentPage}</span>
              </div>
              <span className="text-sm text-gray-600">of {totalPages}</span>
            </div>

            {/* Next page button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Last page button */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
              title="Last page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
          <div>
            Sorted by <span className="font-medium">{sortField}</span> ({sortDirection === 'asc' ? 'ascending' : 'descending'})
          </div>
          <div className="mt-1 sm:mt-0">
            {pageSize} items per page
          </div>
        </div>
      </div>
    </div>
  );
}

export const VirtualizedTable = React.memo(VirtualizedTableComponent);