import { useState, useEffect, useCallback } from 'react';
import { useEarthquakeStore } from '../store';
// import { dataWorkerManager } from '../services/dataWorkerManager';

interface ProgressiveLoadingState {
  progress: number;
  stage: 'idle' | 'loading' | 'parsing' | 'processing' | 'complete' | 'error';
  message: string;
}

export function useProgressiveLoading() {
  const { data, loading, error, fetchData } = useEarthquakeStore();
  const [loadingState, setLoadingState] = useState<ProgressiveLoadingState>({
    progress: 0,
    stage: 'idle',
    message: 'Ready to load data'
  });

  const loadDataProgressively = useCallback(async () => {
    if (loading) return;

    setLoadingState({
      progress: 0,
      stage: 'loading',
      message: 'Fetching earthquake data...'
    });

    try {
      await fetchData();
      
      setLoadingState({
        progress: 100,
        stage: 'complete',
        message: 'Data loaded successfully'
      });
    } catch (err) {
      setLoadingState({
        progress: 0,
        stage: 'error',
        message: err instanceof Error ? err.message : 'Failed to load data'
      });
    }
  }, [fetchData, loading]);

  // Update loading state based on store state
  useEffect(() => {
    if (loading && loadingState.stage === 'idle') {
      setLoadingState({
        progress: 25,
        stage: 'loading',
        message: 'Loading earthquake data...'
      });
    } else if (!loading && !error && data.length > 0) {
      setLoadingState({
        progress: 100,
        stage: 'complete',
        message: `Loaded ${data.length} earthquakes`
      });
    } else if (error) {
      setLoadingState({
        progress: 0,
        stage: 'error',
        message: error
      });
    }
  }, [loading, error, data.length, loadingState.stage]);

  const retryLoad = useCallback(() => {
    setLoadingState({
      progress: 0,
      stage: 'idle',
      message: 'Ready to load data'
    });
    loadDataProgressively();
  }, [loadDataProgressively]);

  return {
    loadingState,
    loadDataProgressively,
    retryLoad,
    isLoading: loading || loadingState.stage === 'loading',
    hasData: data.length > 0,
    hasError: !!error || loadingState.stage === 'error'
  };
}