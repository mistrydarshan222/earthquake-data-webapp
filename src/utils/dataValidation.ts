/**
 * Data validation utilities for earthquake data
 */

import type { EarthquakeData, RawEarthquakeData } from '../types';

/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Coordinate validation constants
 */
const VALIDATION_CONSTANTS = {
    MAX_LATITUDE: 90,
    MIN_LATITUDE: -90,
    MAX_LONGITUDE: 180,
    MIN_LONGITUDE: -180,
    MAX_DEPTH: 1000, // km
    MIN_DEPTH: -10, // km (some earthquakes can be above sea level)
    MIN_MAGNITUDE: -5, // theoretical minimum
    MAX_MAGNITUDE: 10, // theoretical maximum
} as const;

/**
 * Validate raw earthquake data structure
 */
export function validateRawEarthquakeData(data: unknown): data is RawEarthquakeData {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const record = data as Record<string, unknown>;

    // Check required string fields
    const requiredStringFields = ['id', 'time', 'latitude', 'longitude', 'mag'];
    for (const field of requiredStringFields) {
        if (!record[field] || typeof record[field] !== 'string') {
            return false;
        }
    }

    return true;
}

/**
 * Validate processed earthquake data
 */
export function validateEarthquakeData(data: EarthquakeData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!data.id || typeof data.id !== 'string') {
        errors.push('Invalid or missing ID');
    }

    if (!data.time || typeof data.time !== 'string') {
        errors.push('Invalid or missing time');
    } else {
        const timeDate = new Date(data.time);
        if (isNaN(timeDate.getTime())) {
            errors.push('Invalid time format');
        } else {
            const now = new Date();
            const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            if (timeDate > oneYearFromNow) {
                warnings.push('Earthquake time is in the future');
            }
        }
    }

    // Validate coordinates
    if (typeof data.latitude !== 'number' || isNaN(data.latitude)) {
        errors.push('Invalid latitude');
    } else if (data.latitude < VALIDATION_CONSTANTS.MIN_LATITUDE ||
        data.latitude > VALIDATION_CONSTANTS.MAX_LATITUDE) {
        errors.push(`Latitude out of range: ${data.latitude}`);
    }

    if (typeof data.longitude !== 'number' || isNaN(data.longitude)) {
        errors.push('Invalid longitude');
    } else if (data.longitude < VALIDATION_CONSTANTS.MIN_LONGITUDE ||
        data.longitude > VALIDATION_CONSTANTS.MAX_LONGITUDE) {
        errors.push(`Longitude out of range: ${data.longitude}`);
    }

    // Validate depth
    if (typeof data.depth !== 'number' || isNaN(data.depth)) {
        errors.push('Invalid depth');
    } else if (data.depth < VALIDATION_CONSTANTS.MIN_DEPTH ||
        data.depth > VALIDATION_CONSTANTS.MAX_DEPTH) {
        warnings.push(`Unusual depth value: ${data.depth} km`);
    }

    // Validate magnitude
    if (typeof data.magnitude !== 'number' || isNaN(data.magnitude)) {
        errors.push('Invalid magnitude');
    } else if (data.magnitude < VALIDATION_CONSTANTS.MIN_MAGNITUDE ||
        data.magnitude > VALIDATION_CONSTANTS.MAX_MAGNITUDE) {
        warnings.push(`Unusual magnitude value: ${data.magnitude}`);
    }

    // Validate string fields
    if (!data.magType || typeof data.magType !== 'string') {
        warnings.push('Missing magnitude type');
    }

    if (!data.place || typeof data.place !== 'string') {
        warnings.push('Missing place description');
    }

    if (!data.net || typeof data.net !== 'string') {
        warnings.push('Missing network information');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate array of earthquake data
 */
export function validateEarthquakeDataArray(data: EarthquakeData[]): {
    validData: EarthquakeData[];
    invalidData: Array<{ data: EarthquakeData; validation: ValidationResult }>;
    summary: {
        total: number;
        valid: number;
        invalid: number;
        warnings: number;
    };
} {
    const validData: EarthquakeData[] = [];
    const invalidData: Array<{ data: EarthquakeData; validation: ValidationResult }> = [];
    let totalWarnings = 0;

    for (const item of data) {
        const validation = validateEarthquakeData(item);

        if (validation.isValid) {
            validData.push(item);
        } else {
            invalidData.push({ data: item, validation });
        }

        totalWarnings += validation.warnings.length;
    }

    return {
        validData,
        invalidData,
        summary: {
            total: data.length,
            valid: validData.length,
            invalid: invalidData.length,
            warnings: totalWarnings
        }
    };
}

/**
 * Check for duplicate earthquake records
 */
export function findDuplicateRecords(data: EarthquakeData[]): {
    duplicates: Array<{
        id: string;
        records: EarthquakeData[];
    }>;
    uniqueData: EarthquakeData[];
} {
    const idMap = new Map<string, EarthquakeData[]>();

    // Group by ID
    for (const item of data) {
        if (!idMap.has(item.id)) {
            idMap.set(item.id, []);
        }
        idMap.get(item.id)!.push(item);
    }

    const duplicates: Array<{ id: string; records: EarthquakeData[] }> = [];
    const uniqueData: EarthquakeData[] = [];

    for (const [id, records] of idMap.entries()) {
        if (records.length > 1) {
            duplicates.push({ id, records });
            // Keep the most recent record (latest updated time)
            const latest = records.reduce((latest, current) =>
                new Date(current.updated) > new Date(latest.updated) ? current : latest
            );
            uniqueData.push(latest);
        } else {
            uniqueData.push(records[0]);
        }
    }

    return { duplicates, uniqueData };
}

/**
 * Sanitize earthquake data by removing/fixing common issues
 */
export function sanitizeEarthquakeData(data: EarthquakeData[]): EarthquakeData[] {
    return data.map(item => ({
        ...item,
        // Trim string fields
        id: item.id.trim(),
        place: item.place.trim(),
        magType: item.magType.trim(),
        net: item.net.trim(),
        status: item.status.trim(),

        // Ensure numeric fields are within reasonable bounds
        depth: Math.max(VALIDATION_CONSTANTS.MIN_DEPTH,
            Math.min(VALIDATION_CONSTANTS.MAX_DEPTH, item.depth)),

        // Round coordinates to reasonable precision
        latitude: Math.round(item.latitude * 10000) / 10000,
        longitude: Math.round(item.longitude * 10000) / 10000,

        // Round magnitude to 2 decimal places
        magnitude: Math.round(item.magnitude * 100) / 100,
    }));
}

/**
 * Type guard for checking if data is earthquake data array
 */
export function isEarthquakeDataArray(data: unknown): data is EarthquakeData[] {
    return Array.isArray(data) &&
        data.length > 0 &&
        validateEarthquakeData(data[0]).isValid;
}