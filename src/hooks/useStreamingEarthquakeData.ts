import { useState, useCallback, useRef, useEffect } from 'react';
import type { EarthquakeData, RawEarthquakeData } from '../types';
import { parseCsvStreamingFromUrl, type StreamingParseOptions } from '../services/csvParser';

// Simple transformation function
function transformRawEarthquakeData(raw: RawEarthquakeData): EarthquakeData | null {
  try {
    const latitude = parseFloat(raw.latitude);
    const longitude = parseFloat(raw.longitude);
    const depth = parseFloat(raw.depth);
    const magnitude = parseFloat(raw.mag);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(magnitude)) {
      return null;
    }

    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return null;
    }

    return {
      id: raw.id,
      time: raw.time,
      latitude,
      longitude,
      depth: isNaN(depth) ? 0 : depth,
      magnitude,
      magType: raw.magType || 'unknown',
      place: raw.place || 'Unknown location',
      net: raw.net || 'unknown',
      status: raw.status || 'automatic',
      type: raw.type || 'earthquake',
      updated: raw.updated || raw.time,
      // Optional fields
      gap: raw.gap ? parseFloat(raw.gap) : undefined,
      dmin: raw.dmin ? parseFloat(raw.dmin) : undefined,
      rms: raw.rms ? parseFloat(raw.rms) : undefined,
      horizontalError: raw.horizontalError ? parseFloat(raw.horizontalError) : undefined,
      depthError: raw.depthError ? parseFloat(raw.depthError) : undefined,
      magError: raw.magError ? parseFloat(raw.magError) : undefined,
      magNst: raw.magNst ? parseInt(raw.magNst, 10) : undefined,
      nst: raw.nst ? parseInt(raw.nst, 10) : undefined,
      locationSource: raw.locationSource,
      magSource: raw.magSource,
    };
  } catch {
    return null;
  }
}

interface StreamingDataState {
  data: EarthquakeData[];
  loading: boolean;
  error: string | null;
  totalRows: number;
  currentPage: number;
  hasMore: boolean;
  progress: number;
}

interface UseStreamingEarthquakeDataOptions {
  pageSize?: number;
  autoLoad?: boolean;
  csvUrl?: string;
}

export function useStreamingEarthquakeData(options: UseStreamingEarthquakeDataOptions = {}) {
  const {
    pageSize = 5,
    autoLoad = false,
    csvUrl = '/sample_earthquakes.csv'
  } = options;

  const [state, setState] = useState<StreamingDataState>({
    data: [],
    loading: false,
    error: null,
    totalRows: 0,
    currentPage: 1,
    hasMore: false,
    progress: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadPage = useCallback(async (page: number) => {
    console.log('Loading page:', page, 'with pageSize:', pageSize, 'from URL:', csvUrl);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      currentPage: page
    }));

    try {
      const streamingOptions: StreamingParseOptions = {
        pageSize,
        page,
        onChunk: (data, progress) => {
          setState(prev => ({
            ...prev,
            progress: Math.round((progress / prev.totalRows) * 100)
          }));
        },
        onComplete: (totalRows) => {
          setState(prev => ({
            ...prev,
            totalRows,
            progress: 100
          }));
        },
        onError: (error) => {
          setState(prev => ({
            ...prev,
            error: error.message,
            loading: false
          }));
        }
      };

      const result = await parseCsvStreamingFromUrl(csvUrl, streamingOptions);
      console.log('Streaming result:', result);

      // Transform raw data to processed earthquake data
      const transformedData = result.data
        .map(transformRawEarthquakeData)
        .filter((item): item is EarthquakeData => item !== null);

      console.log('Transformed data:', transformedData);

      setState(prev => ({
        ...prev,
        data: transformedData,
        totalRows: result.totalRows,
        hasMore: result.hasMore,
        loading: false,
        error: null,
        progress: 100
      }));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: 0
      }));
    }
  }, [pageSize, csvUrl]);

  const loadNextPage = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadPage(state.currentPage + 1);
    }
  }, [state.loading, state.hasMore, state.currentPage, loadPage]);

  const loadPreviousPage = useCallback(() => {
    if (!state.loading && state.currentPage > 1) {
      loadPage(state.currentPage - 1);
    }
  }, [state.loading, state.currentPage, loadPage]);

  const loadFirstPage = useCallback(() => {
    if (!state.loading) {
      loadPage(1);
    }
  }, [state.loading, loadPage]);

  const goToPage = useCallback((page: number) => {
    if (!state.loading && page > 0) {
      loadPage(page);
    }
  }, [state.loading, loadPage]);

  const refresh = useCallback(() => {
    loadPage(state.currentPage);
  }, [state.currentPage, loadPage]);

  // Auto-load first page if enabled
  useEffect(() => {
    if (autoLoad) {
      loadFirstPage();
    }
  }, [autoLoad, loadFirstPage]);

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    totalRows: state.totalRows,
    currentPage: state.currentPage,
    hasMore: state.hasMore,
    progress: state.progress,

    // Computed values
    totalPages: Math.ceil(state.totalRows / pageSize),
    startIndex: (state.currentPage - 1) * pageSize + 1,
    endIndex: Math.min(state.currentPage * pageSize, state.totalRows),

    // Actions
    loadPage,
    loadNextPage,
    loadPreviousPage,
    loadFirstPage,
    goToPage,
    refresh
  };
}