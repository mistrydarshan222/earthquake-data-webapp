/**
 * Type definitions index - re-exports all type interfaces
 * This provides a central import location for all application types
 */

// Earthquake data types
export type {
    RawEarthquakeData,
    EarthquakeData,
    NumericEarthquakeField,
    EarthquakeField,
} from './earthquake';

export { EARTHQUAKE_FIELD_LABELS } from './earthquake';

// Chart configuration types
export type {
    ChartAxisConfig,
    ChartConfig,
    ChartTheme,
    ChartInteraction,
    ChartControlsProps,
    EarthquakeChartProps,
    ChartTooltipData,
} from './chart';

// UI and component types
export type {
    LoadingState,
    AppError,
    AppState,
    UIState,
    SelectionState,
    LayoutProps,
    PanelProps,
    ErrorBoundaryProps,
    ErrorFallbackProps,
    LoadingSpinnerProps,
    ButtonProps,
    SelectProps,
    SelectOption,
    TableProps,
} from './ui';