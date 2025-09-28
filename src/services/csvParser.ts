import Papa from 'papaparse';
import type { RawEarthquakeData } from '../types/earthquake';
import { ERROR_MESSAGES } from '../utils/constants';

export class CsvParsingError extends Error {
    public details?: string;

    constructor(message: string, details?: string) {
        super(message);
        this.name = 'CsvParsingError';
        this.details = details;
    }
}

const CSV_PARSE_CONFIG: Papa.ParseConfig<RawEarthquakeData> = {
    header: true,
    skipEmptyLines: true,
    delimiter: ',',
    dynamicTyping: false,
    transform: (value: string): string => {
        return value?.trim() || '';
    },
    transformHeader: (header: string): string => {
        return header.trim();
    },
};

/**
 * Parse CSV text into raw earthquake data objects
 */
export function parseCsvData(csvText: string): RawEarthquakeData[] {
    if (!csvText || csvText.trim().length === 0) {
        throw new CsvParsingError(ERROR_MESSAGES.NO_DATA, 'CSV text is empty');
    }

    try {
        const parseResult = Papa.parse<RawEarthquakeData>(csvText, CSV_PARSE_CONFIG);

        // Check for parsing errors
        if (parseResult.errors && parseResult.errors.length > 0) {
            const errorMessages = parseResult.errors
                .map(error => `Row ${error.row}: ${error.message}`)
                .join('; ');

            // Only throw if there are critical errors
            const criticalErrors = parseResult.errors.filter(error =>
                error.type === 'FieldMismatch' || error.type === 'Delimiter'
            );

            if (criticalErrors.length > 0) {
                throw new CsvParsingError(
                    ERROR_MESSAGES.PARSING_ERROR,
                    `Critical parsing errors: ${errorMessages}`
                );
            }

            // Log non-critical errors but continue
            console.warn('CSV parsing warnings:', errorMessages);
        }

        // Validate that we have data
        if (!parseResult.data || parseResult.data.length === 0) {
            throw new CsvParsingError(ERROR_MESSAGES.NO_DATA, 'No data rows found in CSV');
        }

        // Filter out incomplete rows
        const validRows = parseResult.data.filter(row =>
            row &&
            row.id &&
            row.time &&
            row.latitude &&
            row.longitude &&
            row.mag
        );

        if (validRows.length === 0) {
            throw new CsvParsingError(
                ERROR_MESSAGES.NO_DATA,
                'No valid earthquake records found in CSV data'
            );
        }

        return validRows;
    } catch (error) {
        if (error instanceof CsvParsingError) {
            throw error;
        }

        throw new CsvParsingError(
            ERROR_MESSAGES.PARSING_ERROR,
            error instanceof Error ? error.message : 'Unknown parsing error'
        );
    }
}

/**
 * Validate raw earthquake data structure
 */
export function validateRawEarthquakeData(data: unknown): data is RawEarthquakeData {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const record = data as Record<string, unknown>;

    // Required fields
    const requiredFields = ['id', 'time', 'latitude', 'longitude', 'mag'];
    for (const field of requiredFields) {
        if (!record[field] || typeof record[field] !== 'string') {
            return false;
        }
    }

    return true;
}

/**
 * Parse CSV from URL response
 */
export async function parseCsvFromResponse(response: Response): Promise<RawEarthquakeData[]> {
    if (!response.ok) {
        throw new CsvParsingError(
            `HTTP ${response.status}: ${response.statusText}`,
            'Failed to fetch CSV data'
        );
    }

    const csvText = await response.text();
    return parseCsvData(csvText);
}

/**
 * Parse CSV from file
 */
export function parseCsvFromFile(file: File): Promise<RawEarthquakeData[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<RawEarthquakeData>(file, {
            ...CSV_PARSE_CONFIG,
            complete: (results) => {
                try {
                    if (results.errors && results.errors.length > 0) {
                        const errorMessages = results.errors
                            .map(error => `Row ${error.row}: ${error.message}`)
                            .join('; ');
                        console.warn('CSV parsing warnings:', errorMessages);
                    }

                    const validRows = results.data.filter(row =>
                        validateRawEarthquakeData(row)
                    );

                    if (validRows.length === 0) {
                        reject(new CsvParsingError(ERROR_MESSAGES.NO_DATA));
                        return;
                    }

                    resolve(validRows);
                } catch (error) {
                    reject(new CsvParsingError(
                        ERROR_MESSAGES.PARSING_ERROR,
                        error instanceof Error ? error.message : 'Unknown error'
                    ));
                }
            },
            error: (error) => {
                reject(new CsvParsingError(ERROR_MESSAGES.PARSING_ERROR, error.message));
            },
        });
    });
}

/**
 * Streaming CSV parser for large datasets with pagination support
 */
export interface StreamingParseOptions {
    pageSize: number;
    page?: number;
    onChunk?: (data: RawEarthquakeData[], progress: number) => void;
    onComplete?: (totalRows: number) => void;
    onError?: (error: Error) => void;
}

/**
 * Parse CSV with streaming and pagination
 */
export function parseCsvStreamingFromUrl(
    url: string,
    options: StreamingParseOptions
): Promise<{ data: RawEarthquakeData[]; totalRows: number; hasMore: boolean }> {
    return new Promise((resolve, reject) => {
        const { pageSize, page = 1, onChunk, onComplete, onError } = options;
        const allRows: RawEarthquakeData[] = [];
        let rowCount = 0;
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;

        Papa.parse(url, {
            ...CSV_PARSE_CONFIG,
            download: true,
            step: (result) => {
                console.log('Papa Parse step result:', result);

                if (result.errors && result.errors.length > 0) {
                    // Log errors but continue parsing
                    console.warn('Row parsing error:', result.errors);
                }

                const row = result.data as RawEarthquakeData;
                console.log('Parsed row:', row);

                if (validateRawEarthquakeData(row)) {
                    rowCount++;
                    console.log('Valid row count:', rowCount);

                    // Only collect rows for the requested page
                    if (rowCount > startIndex && rowCount <= endIndex) {
                        allRows.push(row);
                        console.log('Added row to page, total in page:', allRows.length);
                    }

                    // Notify progress every 100 rows
                    if (rowCount % 100 === 0 && onChunk) {
                        onChunk(allRows.slice(), rowCount);
                    }
                } else {
                    console.log('Invalid row, skipping:', row);
                }
            },
            complete: () => {
                try {
                    if (onComplete) {
                        onComplete(rowCount);
                    }

                    resolve({
                        data: allRows,
                        totalRows: rowCount,
                        hasMore: rowCount > endIndex
                    });
                } catch (error) {
                    const parseError = new CsvParsingError(
                        ERROR_MESSAGES.PARSING_ERROR,
                        error instanceof Error ? error.message : 'Unknown error'
                    );
                    if (onError) onError(parseError);
                    reject(parseError);
                }
            },
            error: (error) => {
                const parseError = new CsvParsingError(ERROR_MESSAGES.PARSING_ERROR, error.message);
                if (onError) onError(parseError);
                reject(parseError);
            },
        });
    });
}

/**
 * Parse CSV with streaming from file with pagination
 */
export function parseCsvStreamingFromFile(
    file: File,
    options: StreamingParseOptions
): Promise<{ data: RawEarthquakeData[]; totalRows: number; hasMore: boolean }> {
    return new Promise((resolve, reject) => {
        const { pageSize, page = 1, onChunk, onComplete, onError } = options;
        const allRows: RawEarthquakeData[] = [];
        let rowCount = 0;
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;

        Papa.parse(file, {
            ...CSV_PARSE_CONFIG,
            step: (result) => {
                if (result.errors && result.errors.length > 0) {
                    console.warn('Row parsing error:', result.errors);
                }

                const row = result.data as RawEarthquakeData;
                if (validateRawEarthquakeData(row)) {
                    rowCount++;

                    // Only collect rows for the requested page
                    if (rowCount > startIndex && rowCount <= endIndex) {
                        allRows.push(row);
                    }

                    // Notify progress every 100 rows
                    if (rowCount % 100 === 0 && onChunk) {
                        onChunk(allRows.slice(), rowCount);
                    }
                }
            },
            complete: () => {
                try {
                    if (onComplete) {
                        onComplete(rowCount);
                    }

                    resolve({
                        data: allRows,
                        totalRows: rowCount,
                        hasMore: rowCount > endIndex
                    });
                } catch (error) {
                    const parseError = new CsvParsingError(
                        ERROR_MESSAGES.PARSING_ERROR,
                        error instanceof Error ? error.message : 'Unknown error'
                    );
                    if (onError) onError(parseError);
                    reject(parseError);
                }
            },
            error: (error) => {
                const parseError = new CsvParsingError(ERROR_MESSAGES.PARSING_ERROR, error.message);
                if (onError) onError(parseError);
                reject(parseError);
            },
        });
    });
}