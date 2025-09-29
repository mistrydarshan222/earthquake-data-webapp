import { useEffect, useState, useMemo } from 'react';
import './App.css';
import { ErrorBoundary } from './components/ui';
import { SelectionProvider, ThemeProvider } from './contexts';
import { useEarthquakeStore } from './store';
import { useEarthquakeData, useProgressiveLoading, usePerformanceMonitor } from './hooks';
import { ChartPanel } from './components/Chart';
// import { EarthquakeTableContainer } from './components/Table';
import { LoadingSpinner, ErrorMessage } from './components/ui';
import { DataFilters } from './components/ui/DataFilters';
import VirtualizedTableV2 from './components/Table/VirtualizedTableV2';

function AppContent() {
  const {
    data: rawData,
    loading,
    error,
    fetchData
  } = useEarthquakeStore();

  const { loadingState, loadDataProgressively } = useProgressiveLoading();
  const [filteredData, setFilteredData] = useState(rawData);
  const [sortField, setSortField] = useState<keyof import('./types').EarthquakeData>('magnitude');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEarthquakeData();

  // Memoized sorted data
  const data = useMemo(() => {
    const dataToSort = filteredData.length > 0 ? filteredData : rawData;
    return [...dataToSort].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, rawData, sortField, sortDirection]);

  // Update filtered data when raw data changes
  useEffect(() => {
    setFilteredData(rawData);
  }, [rawData]);

  // Performance monitor (after data is computed)
  const { PerformanceDisplay } = usePerformanceMonitor(data ? data.length : 0);

  useEffect(() => {
    if (rawData.length === 0 && !loading && !error) {
      fetchData();
    }
  }, [rawData.length, loading, error, fetchData]);

  if (loading && rawData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-gray-600">{loadingState.message}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${loadingState.progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">{loadingState.progress.toFixed(0)}% complete</p>
        </div>
      </div>
    );
  }

  if (error && rawData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md">
          <ErrorMessage
            title="Failed to load earthquake data"
            message={error}
            className="mb-4"
          />
          <button
            onClick={loadDataProgressively}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Earthquake Data Visualization
              </h1>
              <p className="text-sm text-gray-600">
                Interactive visualization of USGS earthquake data
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {loading && (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-gray-600">{loadingState.message}</span>
                </div>
              )}
              
              <div className="text-sm text-gray-500 grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">{data.length.toLocaleString()}</span>
                  <span className="text-gray-400 ml-1">displayed</span>
                </div>
                <div>
                  <span className="font-medium">{rawData.length.toLocaleString()}</span>
                  <span className="text-gray-400 ml-1">total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filters */}
        {rawData.length > 0 && (
          <DataFilters 
            data={rawData} 
            onFilterChange={setFilteredData}
            className="mb-6"
          />
        )}
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-0">
          {/* Chart Panel */}
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Interactive Chart
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {data.length > 2000 ? 'Sampled' : 'Live'}
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select axis variables • Click points to highlight in table
                {data.length > 2000 && (
                  <span className="text-orange-600 ml-2">• Showing sample of {Math.min(2000, data.length)} points for performance</span>
                )}
              </p>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <ChartPanel height={window.innerWidth < 1280 ? 450 : 550} />
            </div>
          </div>

          {/* Table Panel */}
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Data Table
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Virtual Scrolling
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Virtualized for performance • Click rows to highlight in chart • Sort by clicking headers
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <VirtualizedTableV2
                data={data}
                loading={loading}
                error={error}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={(field) => {
                  if (field === sortField) {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField(field);
                    setSortDirection('desc');
                  }
                }}
                className="h-full"
                visibleItems={12}
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-center text-sm text-gray-500 space-y-3">
            <p>
              Data provided by the{' '}
              <a
                href="https://earthquake.usgs.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                USGS Earthquake Hazards Program
              </a>
            </p>
            <div className="flex justify-center space-x-8 text-xs">
              <div><span className="font-medium">Performance:</span> Web Workers + Virtual Scrolling</div>
              <div><span className="font-medium">Chart:</span> Optimized Rendering</div>
              <div><span className="font-medium">Data:</span> Smart Filtering & Caching</div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Created by{' '}
                <a
                  href="https://darshanmistry.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline font-medium"
                >
                  Darshan Mistry
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Performance Monitor */}
      <PerformanceDisplay />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SelectionProvider>
          <AppContent />
        </SelectionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;