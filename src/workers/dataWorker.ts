import Papa from 'papaparse';
import type { EarthquakeData } from '../types';

interface WorkerMessage {
  type: 'PARSE_CSV' | 'FILTER_DATA' | 'SORT_DATA';
  payload: any;
}

interface ParseCSVPayload {
  csvContent: string;
}

interface FilterDataPayload {
  data: EarthquakeData[];
  filters: {
    minMagnitude?: number;
    maxMagnitude?: number;
    startDate?: string;
    endDate?: string;
  };
}

interface SortDataPayload {
  data: EarthquakeData[];
  field: keyof EarthquakeData;
  direction: 'asc' | 'desc';
}

self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'PARSE_CSV':
        handleParseCSV(payload as ParseCSVPayload);
        break;
      case 'FILTER_DATA':
        handleFilterData(payload as FilterDataPayload);
        break;
      case 'SORT_DATA':
        handleSortData(payload as SortDataPayload);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

function handleParseCSV(payload: ParseCSVPayload) {
  const { csvContent } = payload;

  Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transform: (value: string, field: string) => {
      // Optimize parsing by transforming values during parse
      if (['magnitude', 'depth', 'latitude', 'longitude'].includes(field)) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (field === 'time') {
        return value;
      }
      return value;
    },
    chunk: (results: any, parser: any) => {
      // Process data in chunks to prevent UI blocking
      const processedRows = results.data
        .filter((row: any) => row && typeof row === 'object')
        .map((row: any, index: number): EarthquakeData => ({
          id: row.id || `${row.time}_${index}`,
          time: new Date(row.time).toISOString(),
          latitude: parseFloat(row.latitude) || 0,
          longitude: parseFloat(row.longitude) || 0,
          depth: parseFloat(row.depth) || 0,
          magnitude: parseFloat(row.mag) || 0,
          magType: row.magType || 'ml',
          place: row.place || 'Unknown location',
          type: row.type || 'earthquake',
          net: row.net || 'us',
          status: row.status || 'reviewed',
          updated: row.updated || row.time,
        }))
        .filter((earthquake: EarthquakeData) => 
          earthquake.magnitude > 0 && 
          earthquake.latitude !== 0 && 
          earthquake.longitude !== 0
        );

      if (processedRows.length > 0) {
        self.postMessage({
          type: 'CHUNK_PROCESSED',
          data: processedRows,
          progress: parser.streamer._lineCount
        });
      }
    },
    complete: (results) => {
      self.postMessage({
        type: 'PARSE_COMPLETE',
        totalRecords: results.data.length,
        errors: results.errors
      });
    },
    error: (error: any) => {
      self.postMessage({
        type: 'ERROR',
        error: error.message
      });
    }
  });
}

function handleFilterData(payload: FilterDataPayload) {
  const { data, filters } = payload;
  
  const filtered = data.filter((earthquake) => {
    if (filters.minMagnitude !== undefined && earthquake.magnitude < filters.minMagnitude) {
      return false;
    }
    if (filters.maxMagnitude !== undefined && earthquake.magnitude > filters.maxMagnitude) {
      return false;
    }
    if (filters.startDate && new Date(earthquake.time) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(earthquake.time) > new Date(filters.endDate)) {
      return false;
    }
    return true;
  });

  self.postMessage({
    type: 'FILTER_COMPLETE',
    data: filtered
  });
}

function handleSortData(payload: SortDataPayload) {
  const { data, field, direction } = payload;
  
  const sorted = [...data].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  self.postMessage({
    type: 'SORT_COMPLETE',
    data: sorted
  });
}