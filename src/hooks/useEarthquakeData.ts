import { useEarthquakeStore } from '../store';
import { useCallback } from 'react';

export function useEarthquakeData() {
    const {
        data,
        loading,
        error,
        lastFetched,
        totalRecords,
        validRecords,
        fetchData,
        refreshData,
        clearError,
    } = useEarthquakeStore();

    const refetch = useCallback(async () => {
        await refreshData();
    }, [refreshData]);

    const fetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        lastFetched,
        totalRecords,
        validRecords,
        fetch,
        refetch,
        clearError,
        isEmpty: data.length === 0,
        hasError: !!error,
    };
}