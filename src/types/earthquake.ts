/**
 * Core earthquake data interfaces based on USGS earthquake feed
 * https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.csv
 */

export interface RawEarthquakeData {
    time: string;
    latitude: string;
    longitude: string;
    depth: string;
    mag: string;
    magType: string;
    nst: string;
    gap: string;
    dmin: string;
    rms: string;
    net: string;
    id: string;
    updated: string;
    place: string;
    type: string;
    horizontalError: string;
    depthError: string;
    magError: string;
    magNst: string;
    status: string;
    locationSource: string;
    magSource: string;
}

export interface EarthquakeData {
    id: string;
    time: string;
    latitude: number;
    longitude: number;
    depth: number;
    magnitude: number;
    magType: string;
    place: string;
    type: string;
    net: string;
    status: string;
    updated: string;

    nst?: number;
    gap?: number;
    dmin?: number;
    rms?: number;
    horizontalError?: number;
    depthError?: number;
    magError?: number;
    magNst?: number;
}

/**
 * Numeric fields available for chart axis selection
 */
export type NumericEarthquakeField = 'magnitude' | 'depth' | 'latitude' | 'longitude';

/**
 * All available earthquake data fields
 */
export type EarthquakeField = keyof EarthquakeData;

/**
 * Field display labels for UI components
 */
export const EARTHQUAKE_FIELD_LABELS: Record<NumericEarthquakeField, string> = {
    magnitude: 'Magnitude',
    depth: 'Depth (km)',
    latitude: 'Latitude',
    longitude: 'Longitude',
} as const;