import type { EarthquakeData, RawEarthquakeData } from '../types';
import { parseCsvData, CsvParsingError } from './csvParser';
import { USGS_CONFIG } from '../utils/constants';

export interface FetchEarthquakeResult {
    data: EarthquakeData[];
    success: boolean;
    error?: string;
    lastFetched: Date;
    totalRecords: number;
    validRecords: number;
}

export class NetworkError extends Error {
    public status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'NetworkError';
        this.status = status;
    }
}


function transformEarthquakeData(raw: RawEarthquakeData): EarthquakeData | null {
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

        const parseOptionalFloat = (value: string): number | undefined => {
            if (!value || value.trim() === '') return undefined;
            const parsed = parseFloat(value);
            return isNaN(parsed) ? undefined : parsed;
        };

        const parseOptionalInt = (value: string): number | undefined => {
            if (!value || value.trim() === '') return undefined;
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? undefined : parsed;
        };

        return {
            id: raw.id,
            time: raw.time,
            latitude,
            longitude,
            depth: isNaN(depth) ? 0 : depth,
            magnitude,
            magType: raw.magType || 'unknown',
            place: raw.place || 'Unknown location',
            type: raw.type || 'earthquake',
            net: raw.net || 'unknown',
            status: raw.status || 'unknown',
            updated: raw.updated || raw.time,

            // Optional numeric fields
            nst: parseOptionalInt(raw.nst),
            gap: parseOptionalFloat(raw.gap),
            dmin: parseOptionalFloat(raw.dmin),
            rms: parseOptionalFloat(raw.rms),
            horizontalError: parseOptionalFloat(raw.horizontalError),
            depthError: parseOptionalFloat(raw.depthError),
            magError: parseOptionalFloat(raw.magError),
            magNst: parseOptionalInt(raw.magNst),
        };
    } catch (error) {
        console.warn('Error transforming earthquake data:', error, raw);
        return null;
    }
}

function validateEarthquakeData(data: EarthquakeData[]): {
    isValid: boolean;
    issues: string[];
    stats: {
        total: number;
        valid: number;
        recentCount: number;
        significantCount: number;
    };
} {
    const issues: string[] = [];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let recentCount = 0;
    let significantCount = 0;

    const validData = data.filter(item => {
        const isValid = (
            item.magnitude >= 0 &&
            Math.abs(item.latitude) <= 90 &&
            Math.abs(item.longitude) <= 180 &&
            item.id &&
            item.time
        );

        if (isValid) {
            const eventTime = new Date(item.time);
            if (eventTime >= weekAgo) recentCount++;
            if (item.magnitude >= 4.0) significantCount++;
        }

        return isValid;
    });

    if (data.length === 0) {
        issues.push('No earthquake data received');
    }

    if (validData.length < data.length * 0.9) {
        issues.push(`${data.length - validData.length} invalid records found`);
    }

    if (validData.length < 10) {
        issues.push('Very few valid earthquake records found');
    }

    return {
        isValid: issues.length === 0,
        issues,
        stats: {
            total: data.length,
            valid: validData.length,
            recentCount,
            significantCount
        }
    };
}

export async function fetchEarthquakeData(retries: number = 3): Promise<FetchEarthquakeResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {

            const response = await fetch(USGS_CONFIG.CSV_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'text/csv',
                    'User-Agent': 'Geo-Data-Viz/1.0'
                },
                // 30 second timeout
                signal: AbortSignal.timeout(30000)
            });

            if (!response.ok) {
                throw new NetworkError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status
                );
            }

            const csvText = await response.text();

            if (!csvText || csvText.trim().length === 0) {
                throw new Error('Received empty response from USGS API');
            }

            // Parse CSV data
            const rawData = parseCsvData(csvText);
            console.log(`Parsed ${rawData.length} raw earthquake records`);

            // Transform to processed data
            const processedData: EarthquakeData[] = [];
            let transformErrors = 0;

            for (const raw of rawData) {
                const transformed = transformEarthquakeData(raw);
                if (transformed) {
                    processedData.push(transformed);
                } else {
                    transformErrors++;
                }
            }

            console.log(`Transformed ${processedData.length} valid records (${transformErrors} errors)`);

            // Validate data quality
            const validation = validateEarthquakeData(processedData);

            if (validation.issues.length > 0) {
                console.warn('Data quality issues:', validation.issues);
            }

            // Sort by time (most recent first)
            processedData.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

            return {
                data: processedData,
                success: true,
                lastFetched: new Date(),
                totalRecords: rawData.length,
                validRecords: processedData.length
            };

        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${attempt} failed:`, error);

            // Don't retry on certain types of errors
            if (error instanceof CsvParsingError ||
                (error instanceof NetworkError && error.status === 404)) {
                break;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < retries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All attempts failed
    const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error occurred';

    return {
        data: [],
        success: false,
        error: `Failed to fetch earthquake data after ${retries} attempts: ${errorMessage}`,
        lastFetched: new Date(),
        totalRecords: 0,
        validRecords: 0
    };
}

export function getSampleEarthquakeData(count: number = 10): EarthquakeData[] {
    const now = new Date();
    const sampleData: EarthquakeData[] = [];

    for (let i = 0; i < count; i++) {
        const time = new Date(now.getTime() - i * 3600000);
        sampleData.push({
            id: `sample_${i}`,
            time: time.toISOString(),
            latitude: 34 + (Math.random() - 0.5) * 10,
            longitude: -118 + (Math.random() - 0.5) * 10,
            depth: Math.random() * 50,
            magnitude: 1 + Math.random() * 4,
            magType: 'ml',
            place: `Sample Location ${i}`,
            type: 'earthquake',
            net: 'sample',
            status: 'automatic',
            updated: time.toISOString(),
        });
    }

    return sampleData;
}

let cachedData: {
    data: EarthquakeData[];
    timestamp: Date;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000;

export async function getCachedEarthquakeData(): Promise<FetchEarthquakeResult> {
    const now = new Date();

    if (cachedData && (now.getTime() - cachedData.timestamp.getTime()) < CACHE_DURATION) {
        return {
            data: cachedData.data,
            success: true,
            lastFetched: cachedData.timestamp,
            totalRecords: cachedData.data.length,
            validRecords: cachedData.data.length
        };
    }

    // Fetch fresh data
    const result = await fetchEarthquakeData();

    // Cache successful results
    if (result.success && result.data.length > 0) {
        cachedData = {
            data: result.data,
            timestamp: result.lastFetched
        };
        console.log(`Cached ${result.data.length} earthquake records`);
    }

    return result;
}