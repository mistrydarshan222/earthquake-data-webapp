import { useEffect } from 'react';
import './App.css';
import { ErrorBoundary } from './components/ui';
import { SelectionProvider, ThemeProvider } from './contexts';
import { useEarthquakeStore } from './store';
import { useEarthquakeData } from './hooks';
import { ChartPanel } from './components/Chart';
import { EarthquakeTableContainer } from './components/Table';
import { LoadingSpinner, ErrorMessage } from './components/ui';

function AppContent() {
  const {
    data,
    loading,
    error,
    fetchData
  } = useEarthquakeStore();

  useEarthquakeData();

  useEffect(() => {
    if (data.length === 0 && !loading && !error) {
      fetchData();
    }
  }, [data.length, loading, error, fetchData]);

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-gray-600">Loading earthquake data...</p>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage
          title="Failed to load earthquake data"
          message={error}
          className="max-w-md"
        />
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
            <div className="flex items-center space-x-4">
              {loading && (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              )}

              <div className="text-sm text-gray-500">
                {data.length} earthquake{data.length !== 1 ? 's' : ''} loaded
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-0 auto-rows-fr">
          {/* Chart Panel */}
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Interactive Chart
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select axis variables • Click points to highlight in table
              </p>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <ChartPanel height={window.innerWidth < 1280 ? 400 : 500} />
            </div>
          </div>

          {/* Table Panel */}
          <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Data Table
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                All earthquake data with filtering, sorting & pagination • Click rows to highlight in chart
              </p>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <EarthquakeTableContainer
                data={data}
                loading={loading}
                error={error}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Data provided by the{' '}
            <a
              href="https://earthquake.usgs.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              USGS Earthquake Hazards Program
            </a>
          </p>
        </div>
      </main>
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