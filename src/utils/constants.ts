import type { ChartConfig } from '../types/chart';
import type { NumericEarthquakeField } from '../types/earthquake';

export const USGS_CONFIG = {
    CSV_URL: '/all_month.csv',
    BACKUP_CSV_URL: '/all_month.csv',
    TIMEOUT: 10000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
} as const;

export const APP_CONFIG = {
    TITLE: 'Geographic Data Visualization',
    VERSION: '1.0.0',
    REFRESH_INTERVAL: 5 * 60 * 1000,
    MAX_EARTHQUAKES: 10000,
    MIN_MAGNITUDE: 0,
    DATA_MAX_AGE: 15 * 60 * 1000,
} as const;

/**
 * Chart configuration defaults
 */
export const CHART_DEFAULTS: ChartConfig = {
    xAxis: 'longitude',
    yAxis: 'latitude',
    showTooltip: true,
    showLegend: true,
    width: 0, // Responsive width
    height: 400,
} as const;

/**
 * Chart styling constants
 */
export const CHART_STYLES = {
    /** Default point size */
    POINT_SIZE: 6,
    /** Selected point size */
    SELECTED_POINT_SIZE: 10,
    /** Hovered point size */
    HOVERED_POINT_SIZE: 8,
    /** Animation duration in milliseconds */
    ANIMATION_DURATION: 300,
    /** Chart margins */
    MARGINS: {
        top: 20,
        right: 30,
        bottom: 60,
        left: 60,
    },
} as const;

/**
 * Table configuration constants
 */
export const TABLE_CONFIG = {
    /** Default number of visible rows */
    DEFAULT_PAGE_SIZE: 50,
    /** Maximum rows to render at once (for virtual scrolling) */
    VIRTUAL_BUFFER_SIZE: 100,
    /** Row height in pixels */
    ROW_HEIGHT: 48,
    /** Header height in pixels */
    HEADER_HEIGHT: 56,
    /** Maximum table height in pixels */
    MAX_HEIGHT: 600,
} as const;

/**
 * Color palette for data visualization
 */
export const COLORS = {
    /** Primary brand color */
    PRIMARY: '#3B82F6',
    /** Secondary brand color */
    SECONDARY: '#8B5CF6',
    /** Success color */
    SUCCESS: '#10B981',
    /** Warning color */
    WARNING: '#F59E0B',
    /** Error color */
    ERROR: '#EF4444',
    /** Text colors */
    TEXT: {
        primary: '#1F2937',
        secondary: '#6B7280',
        muted: '#9CA3AF',
    },
    /** Background colors */
    BACKGROUND: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F3F4F6',
    },
    /** Chart colors */
    CHART: {
        point: '#3B82F6',
        selected: '#EF4444',
        hovered: '#8B5CF6',
        grid: '#E5E7EB',
    },
} as const;

/**
 * Available numeric fields for chart axes
 */
export const NUMERIC_FIELDS: NumericEarthquakeField[] = [
    'magnitude',
    'depth',
    'latitude',
    'longitude',
] as const;

/**
 * Field formatting configurations
 */
export const FIELD_FORMATS = {
    magnitude: {
        decimals: 1,
        suffix: '',
        prefix: '',
    },
    depth: {
        decimals: 1,
        suffix: ' km',
        prefix: '',
    },
    latitude: {
        decimals: 3,
        suffix: '°',
        prefix: '',
    },
    longitude: {
        decimals: 3,
        suffix: '°',
        prefix: '',
    },
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    /** Chart configuration */
    CHART_CONFIG: 'geo-viz-chart-config',
    /** UI preferences */
    UI_PREFERENCES: 'geo-viz-ui-preferences',
    /** Last data fetch timestamp */
    LAST_FETCH: 'geo-viz-last-fetch',
    /** Theme preference */
    THEME: 'geo-viz-theme',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    /** Network error */
    NETWORK_ERROR: 'Failed to fetch earthquake data. Please check your internet connection.',
    /** Data parsing error */
    PARSING_ERROR: 'Failed to parse earthquake data. The data format may be invalid.',
    /** No data error */
    NO_DATA: 'No earthquake data available.',
    /** Timeout error */
    TIMEOUT: 'Request timed out. Please try again.',
    /** Generic error */
    GENERIC: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Animation and timing constants
 */
export const TIMING = {
    /** Debounce delay for search/filter inputs */
    DEBOUNCE_DELAY: 300,
    /** Tooltip show delay */
    TOOLTIP_DELAY: 500,
    /** Loading indicator minimum show time */
    MIN_LOADING_TIME: 500,
    /** Auto-refresh interval */
    AUTO_REFRESH: 5 * 60 * 1000, // 5 minutes
} as const;