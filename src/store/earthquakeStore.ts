import { create } from 'zustand';
import type { EarthquakeData } from '../types';
import { fetchEarthquakeData, getCachedEarthquakeData } from '../services';

interface EarthquakeState {
    data: EarthquakeData[];
    loading: boolean;
    error: string | null;
    lastFetched: Date | null;
    totalRecords: number;
    validRecords: number;
}

interface EarthquakeActions {
    fetchData: () => Promise<void>;
    refreshData: () => Promise<void>;
    clearError: () => void;
    setData: (data: EarthquakeData[]) => void;
}

type EarthquakeStoreType = EarthquakeState & EarthquakeActions;

export const useEarthquakeStore = create<EarthquakeStoreType>((set, get) => ({
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
    totalRecords: 0,
    validRecords: 0,

    fetchData: async () => {
        if (get().loading) return;

        set({ loading: true, error: null });

        try {
            const result = await getCachedEarthquakeData();

            if (result.success) {
                set({
                    data: result.data,
                    loading: false,
                    error: null,
                    lastFetched: result.lastFetched,
                    totalRecords: result.totalRecords,
                    validRecords: result.validRecords,
                });
            } else {
                set({
                    loading: false,
                    error: result.error || 'Failed to fetch earthquake data',
                });
            }
        } catch (error) {
            set({
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    },

    refreshData: async () => {
        set({ loading: true, error: null });

        try {
            const result = await fetchEarthquakeData();

            if (result.success) {
                set({
                    data: result.data,
                    loading: false,
                    error: null,
                    lastFetched: result.lastFetched,
                    totalRecords: result.totalRecords,
                    validRecords: result.validRecords,
                });
            } else {
                set({
                    loading: false,
                    error: result.error || 'Failed to refresh earthquake data',
                });
            }
        } catch (error) {
            set({
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    },

    clearError: () => set({ error: null }),

    setData: (data: EarthquakeData[]) => set({
        data,
        validRecords: data.length,
        totalRecords: data.length
    }),
}));