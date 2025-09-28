import { create } from 'zustand';
import type { ChartConfig, NumericEarthquakeField } from '../types';
import { CHART_DEFAULTS } from '../utils/constants';

interface UIState {
    chartConfig: ChartConfig;
    selectedEarthquakeId: string | null;
    isTableVisible: boolean;
    isChartVisible: boolean;
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
}

interface UIActions {
    setChartConfig: (config: Partial<ChartConfig>) => void;
    setXAxis: (axis: NumericEarthquakeField) => void;
    setYAxis: (axis: NumericEarthquakeField) => void;
    setSelectedEarthquake: (id: string | null) => void;
    toggleTable: () => void;
    toggleChart: () => void;
    toggleTheme: () => void;
    toggleSidebar: () => void;
    resetUI: () => void;
}

type UIStoreType = UIState & UIActions;

const initialState: UIState = {
    chartConfig: CHART_DEFAULTS,
    selectedEarthquakeId: null,
    isTableVisible: true,
    isChartVisible: true,
    theme: 'light',
    sidebarOpen: false,
};

export const useUIStore = create<UIStoreType>((set, get) => ({
    ...initialState,

    setChartConfig: (config: Partial<ChartConfig>) => {
        const currentConfig = get().chartConfig;
        set({
            chartConfig: { ...currentConfig, ...config }
        });
    },

    setXAxis: (axis: NumericEarthquakeField) => {
        const currentConfig = get().chartConfig;
        set({
            chartConfig: { ...currentConfig, xAxis: axis }
        });
    },

    setYAxis: (axis: NumericEarthquakeField) => {
        const currentConfig = get().chartConfig;
        set({
            chartConfig: { ...currentConfig, yAxis: axis }
        });
    },

    setSelectedEarthquake: (id: string | null) => {
        set({ selectedEarthquakeId: id });
    },

    toggleTable: () => {
        set(state => ({ isTableVisible: !state.isTableVisible }));
    },

    toggleChart: () => {
        set(state => ({ isChartVisible: !state.isChartVisible }));
    },

    toggleTheme: () => {
        set(state => ({
            theme: state.theme === 'light' ? 'dark' : 'light'
        }));
    },

    toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
    },

    resetUI: () => {
        set(initialState);
    },
}));