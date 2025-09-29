import { useState } from 'react';
import type { NumericEarthquakeField } from '../../types';
import { EarthquakeScatterPlot } from './EarthquakeScatterPlot';
import { AxisSelector } from './AxisSelector';
import { useEarthquakeStore } from '../../store';

interface ChartPanelProps {
  height?: number;
  className?: string;
}

export function ChartPanel({ height = 400, className = '' }: ChartPanelProps) {
  const { data, loading, error } = useEarthquakeStore();
  const [xAxis, setXAxis] = useState<NumericEarthquakeField>('longitude');
  const [yAxis, setYAxis] = useState<NumericEarthquakeField>('latitude');

  if (loading && data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-red-600">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium">Chart Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Enhanced Axis Controls */}
        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-200/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-1 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-800">Chart Configuration</span>
            </div>
            <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
              {data.length.toLocaleString()} points
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AxisSelector
              label="📊 X-Axis"
              value={xAxis}
              onChange={setXAxis}
              className="flex-1"
            />
            <AxisSelector
              label="📈 Y-Axis" 
              value={yAxis}
              onChange={setYAxis}
              className="flex-1"
            />
          </div>
        </div>

        {/* Enhanced Chart Container */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200/50 rounded-2xl p-2 shadow-lg">
          <EarthquakeScatterPlot
            data={data}
            xAxis={xAxis}
            yAxis={yAxis}
            height={height}
          />
        </div>

        {/* Enhanced Chart Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200/50">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {data.length.toLocaleString()} earthquake{data.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-gray-400">•</div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">X:</span> {xAxis.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </div>
            <div className="text-gray-400">•</div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Y:</span> {yAxis.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}