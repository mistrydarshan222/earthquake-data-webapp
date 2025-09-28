import React, { useMemo, useCallback } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { EarthquakeData, NumericEarthquakeField } from '../../types';
import { EARTHQUAKE_FIELD_LABELS } from '../../types';
import { useSelection } from '../../hooks';

interface EarthquakeScatterPlotProps {
  data: EarthquakeData[];
  xAxis: NumericEarthquakeField;
  yAxis: NumericEarthquakeField;
  height?: number;
}

export const EarthquakeScatterPlot = React.memo(({
  data,
  xAxis,
  yAxis,
  height = 400
}: EarthquakeScatterPlotProps) => {
  const { selectedEarthquake, setSelectedEarthquake } = useSelection();

  const chartData = useMemo(() => {
    return data.map(earthquake => ({
      ...earthquake,
      x: earthquake[xAxis],
      y: earthquake[yAxis],
    }));
  }, [data, xAxis, yAxis]);

  const xAxisLabel = useMemo(() => EARTHQUAKE_FIELD_LABELS[xAxis], [xAxis]);
  const yAxisLabel = useMemo(() => EARTHQUAKE_FIELD_LABELS[yAxis], [yAxis]);

  // Stable handler
  const handleDataPointClick = useCallback((data: { payload?: EarthquakeData }) => {
    if (data && data.payload) {
      setSelectedEarthquake(data.payload);
    }
  }, [setSelectedEarthquake]);

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 7) return '#dc2626'; // red-600
    if (magnitude >= 6) return '#ea580c'; // orange-600
    if (magnitude >= 5) return '#d97706'; // amber-600
    if (magnitude >= 4) return '#ca8a04'; // yellow-600
    if (magnitude >= 3) return '#65a30d'; // lime-600
    if (magnitude >= 2) return '#16a34a'; // green-600
    return '#0891b2'; // cyan-600
  };

  const getMagnitudeSize = (magnitude: number) => {
    // Smaller dots for better performance: min 2, max 6
    return Math.max(2, Math.min(6, magnitude * 1.2));
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: EarthquakeData & { x: number; y: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.place}</p>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Magnitude:</span> {data.magnitude}</p>
            <p><span className="text-gray-600">{xAxisLabel}:</span> {Number(data.x).toFixed(3)}</p>
            <p><span className="text-gray-600">{yAxisLabel}:</span> {Number(data.y).toFixed(3)}</p>
            <p><span className="text-gray-600">Depth:</span> {data.depth.toFixed(1)} km</p>
            <p className="text-xs text-gray-500">
              {new Date(data.time).toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data to display</h3>
          <p className="mt-1 text-sm text-gray-500">No earthquake data available for charting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
          isAnimationActive={false}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisLabel}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#9ca3af' }}
            tickLine={{ stroke: '#9ca3af' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisLabel}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#9ca3af' }}
            tickLine={{ stroke: '#9ca3af' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            dataKey="magnitude"
            onClick={handleDataPointClick}
            cursor="pointer"
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => {
              const isSelected = selectedEarthquake?.id === entry.id;
              const baseColor = getMagnitudeColor(entry.magnitude);
              const size = getMagnitudeSize(entry.magnitude);
              
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isSelected ? '#3b82f6' : baseColor}
                  stroke={isSelected ? '#1d4ed8' : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                  r={isSelected ? size + 2 : size}
                  fillOpacity={isSelected ? 1 : 0.7}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-cyan-600"></div>
            <span>&lt;2.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>2.0-3.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-lime-600"></div>
            <span>3.0-4.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span>4.0-5.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
            <span>5.0-6.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>6.0-7.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>7.0+</span>
          </div>
        </div>
      </div>
    </div>
  );
});