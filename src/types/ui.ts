/**
 * UI state interfaces and component prop types
 */

import type { EarthquakeData } from './earthquake';

/**
 * Application loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Application error information
 */
export interface AppError {
    /** Error message to display to user */
    message: string;
    /** Detailed error information for debugging */
    details?: string;
    /** Error code or type */
    code?: string;
    /** Timestamp when error occurred */
    timestamp: Date;
}

/**
 * Global application state structure
 */
export interface AppState {
    /** Current loading state */
    loadingState: LoadingState;
    /** Current error, if any */
    error: AppError | null;
    /** Application initialization status */
    isInitialized: boolean;
    /** Last data fetch timestamp */
    lastFetch: Date | null;
}

/**
 * UI preference state
 */
export interface UIState {
    /** Current theme mode */
    theme: 'light' | 'dark' | 'system';
    /** Whether sidebar is collapsed */
    sidebarCollapsed: boolean;
    /** Current view mode */
    viewMode: 'split' | 'chart-only' | 'table-only';
    /** Panel size configuration */
    panelSizes: {
        chart: number;
        table: number;
    };
}

/**
 * Selection state shared between components
 */
export interface SelectionState {
    /** Currently selected earthquake ID */
    selectedId: string | null;
    /** Previously selected earthquake ID */
    previousId: string | null;
    /** Whether selection is from chart or table */
    selectionSource: 'chart' | 'table' | null;
}

/**
 * Props for layout components
 */
export interface LayoutProps {
    /** Child components */
    children: React.ReactNode;
    /** Optional CSS class name */
    className?: string;
}

/**
 * Props for panel components
 */
export interface PanelProps extends LayoutProps {
    /** Panel title */
    title?: string;
    /** Whether panel is loading */
    loading?: boolean;
    /** Panel error state */
    error?: AppError | null;
    /** Whether panel is collapsible */
    collapsible?: boolean;
    /** Whether panel is initially collapsed */
    defaultCollapsed?: boolean;
}

/**
 * Props for error boundary components
 */
export interface ErrorBoundaryProps {
    /** Child components */
    children: React.ReactNode;
    /** Fallback component to render on error */
    fallback?: React.ComponentType<ErrorFallbackProps>;
    /** Callback when error occurs */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Props for error fallback components
 */
export interface ErrorFallbackProps {
    /** The error that occurred */
    error: Error;
    /** Function to reset error boundary */
    resetError: () => void;
    /** Additional error details */
    errorInfo?: React.ErrorInfo;
}

/**
 * Props for loading spinner component
 */
export interface LoadingSpinnerProps {
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg';
    /** Loading message to display */
    message?: string;
    /** Optional CSS class name */
    className?: string;
}

/**
 * Props for button components
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button variant */
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Whether button is loading */
    loading?: boolean;
    /** Icon to display before text */
    icon?: React.ReactNode;
    /** Full width button */
    fullWidth?: boolean;
}

/**
 * Props for select components
 */
export interface SelectProps<T = string> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
    /** Select options */
    options: SelectOption<T>[];
    /** Current selected value */
    value: T;
    /** Callback when value changes */
    onChange: (value: T) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Whether select is loading */
    loading?: boolean;
    /** Error message */
    error?: string;
}

/**
 * Select option data structure
 */
export interface SelectOption<T = string> {
    /** Option value */
    value: T;
    /** Display label */
    label: string;
    /** Whether option is disabled */
    disabled?: boolean;
}

/**
 * Props for table components
 */
export interface TableProps {
    /** Earthquake data to display */
    data: EarthquakeData[];
    /** Currently selected earthquake ID */
    selectedId: string | null;
    /** Callback when row is selected */
    onRowSelect: (id: string | null) => void;
    /** Whether table is loading */
    loading?: boolean;
    /** Maximum height for scrollable area */
    maxHeight?: number;
    /** Optional CSS class name */
    className?: string;
}