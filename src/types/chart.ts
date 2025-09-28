/**
 * Chart configuration interfaces for data visualization components
 */

import type { NumericEarthquakeField } from './earthquake';

/**
 * Configuration for chart axis selection
 */
export interface ChartAxisConfig {
    /** Field to display on X-axis */
    xAxis: NumericEarthquakeField;
    /** Field to display on Y-axis */
    yAxis: NumericEarthquakeField;
}

/**
 * Complete chart configuration state
 */
export interface ChartConfig extends ChartAxisConfig {
    /** Whether to show chart tooltips */
    showTooltip: boolean;
    /** Whether to show chart legend */
    showLegend: boolean;
    /** Chart width in pixels (0 for responsive) */
    width: number;
    /** Chart height in pixels */
    height: number;
}

/**
 * Chart theme configuration
 */
export interface ChartTheme {
    /** Primary color for data points */
    primaryColor: string;
    /** Secondary color for selected points */
    selectedColor: string;
    /** Grid line color */
    gridColor: string;
    /** Text color for labels */
    textColor: string;
    /** Background color */
    backgroundColor: string;
}

/**
 * Chart interaction state
 */
export interface ChartInteraction {
    /** Currently hovered earthquake ID */
    hoveredId: string | null;
    /** Currently selected earthquake ID */
    selectedId: string | null;
    /** Whether chart is in loading state */
    isLoading: boolean;
}

/**
 * Props for chart control components
 */
export interface ChartControlsProps {
    /** Current axis configuration */
    config: ChartAxisConfig;
    /** Callback when axis configuration changes */
    onConfigChange: (config: ChartAxisConfig) => void;
    /** Whether controls are disabled */
    disabled?: boolean;
}

/**
 * Props for main chart component
 */
export interface EarthquakeChartProps {
    /** Earthquake data to visualize */
    data: import('./earthquake').EarthquakeData[];
    /** Chart configuration */
    config: ChartConfig;
    /** Current selection state */
    selectedId: string | null;
    /** Callback when a point is selected */
    onPointSelect: (id: string | null) => void;
    /** Callback when a point is hovered */
    onPointHover: (id: string | null) => void;
    /** Whether chart is in loading state */
    loading?: boolean;
    /** Custom CSS class name */
    className?: string;
}

/**
 * Chart tooltip data structure
 */
export interface ChartTooltipData {
    /** Earthquake data for the tooltip */
    earthquake: import('./earthquake').EarthquakeData;
    /** X-axis value */
    xValue: number;
    /** Y-axis value */
    yValue: number;
    /** X-axis field name */
    xField: NumericEarthquakeField;
    /** Y-axis field name */
    yField: NumericEarthquakeField;
}