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
      <div className="space-y-4">
        {/* Axis Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <AxisSelector
            label="X-Axis"
            value={xAxis}
            onChange={setXAxis}
            className="flex-1"
          />
          <AxisSelector
            label="Y-Axis" 
            value={yAxis}
            onChange={setYAxis}
            className="flex-1"
          />
        </div>

        {/* Chart */}
        <div className="border border-gray-200 rounded-lg bg-white">
          <EarthquakeScatterPlot
            data={data}
            xAxis={xAxis}
            yAxis={yAxis}
            height={height}
          />
        </div>

        {/* Chart Info */}
        <div className="text-sm text-gray-500 text-center">
          {data.length > 0 && (
            <p>
              Showing {data.length} earthquake{data.length !== 1 ? 's' : ''} •{' '}
              X: {xAxis} • Y: {yAxis}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}