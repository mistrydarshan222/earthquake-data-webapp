import type { EarthquakeData } from '../types';

interface WorkerResponse {
  type: string;
  data?: EarthquakeData[];
  error?: string;
  progress?: number;
  totalRecords?: number;
}

class DataWorkerManager {
  private worker: Worker | null = null;
  private dataCache = new Map<string, EarthquakeData[]>();
  private callbacks = new Map<string, (response: WorkerResponse) => void>();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker(new URL('../workers/dataWorker.ts', import.meta.url), {
        type: 'module'
      });
      
      this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const { type } = e.data;
        const callback = this.callbacks.get(type);
        if (callback) {
          callback(e.data);
        }
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.worker = null;
    }
  }

  async parseCSV(csvContent: string, onProgress?: (data: EarthquakeData[], progress: number) => void): Promise<EarthquakeData[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      let allData: EarthquakeData[] = [];

      const cleanup = () => {
        this.callbacks.delete('CHUNK_PROCESSED');
        this.callbacks.delete('PARSE_COMPLETE');
        this.callbacks.delete('ERROR');
      };

      this.callbacks.set('CHUNK_PROCESSED', (response) => {
        if (response.data) {
          allData = [...allData, ...response.data];
          onProgress?.(allData, response.progress || 0);
        }
      });

      this.callbacks.set('PARSE_COMPLETE', () => {
        cleanup();
        resolve(allData);
      });

      this.callbacks.set('ERROR', (response) => {
        cleanup();
        reject(new Error(response.error || 'Parse failed'));
      });

      this.worker.postMessage({
        type: 'PARSE_CSV',
        payload: { csvContent }
      });
    });
  }

  async filterData(data: EarthquakeData[], filters: any): Promise<EarthquakeData[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to synchronous filtering
        const filtered = data.filter((earthquake) => {
          if (filters.minMagnitude !== undefined && earthquake.magnitude < filters.minMagnitude) {
            return false;
          }
          if (filters.maxMagnitude !== undefined && earthquake.magnitude > filters.maxMagnitude) {
            return false;
          }
          return true;
        });
        resolve(filtered);
        return;
      }

      const cleanup = () => {
        this.callbacks.delete('FILTER_COMPLETE');
        this.callbacks.delete('ERROR');
      };

      this.callbacks.set('FILTER_COMPLETE', (response) => {
        cleanup();
        resolve(response.data || []);
      });

      this.callbacks.set('ERROR', (response) => {
        cleanup();
        reject(new Error(response.error || 'Filter failed'));
      });

      this.worker.postMessage({
        type: 'FILTER_DATA',
        payload: { data, filters }
      });
    });
  }

  async sortData(data: EarthquakeData[], field: keyof EarthquakeData, direction: 'asc' | 'desc'): Promise<EarthquakeData[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to synchronous sorting
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
        resolve(sorted);
        return;
      }

      const cleanup = () => {
        this.callbacks.delete('SORT_COMPLETE');
        this.callbacks.delete('ERROR');
      };

      this.callbacks.set('SORT_COMPLETE', (response) => {
        cleanup();
        resolve(response.data || []);
      });

      this.callbacks.set('ERROR', (response) => {
        cleanup();
        reject(new Error(response.error || 'Sort failed'));
      });

      this.worker.postMessage({
        type: 'SORT_DATA',
        payload: { data, field, direction }
      });
    });
  }

  getCachedData(key: string): EarthquakeData[] | null {
    return this.dataCache.get(key) || null;
  }

  setCachedData(key: string, data: EarthquakeData[]): void {
    this.dataCache.set(key, data);
  }

  clearCache(): void {
    this.dataCache.clear();
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.callbacks.clear();
    this.clearCache();
  }
}

export const dataWorkerManager = new DataWorkerManager();