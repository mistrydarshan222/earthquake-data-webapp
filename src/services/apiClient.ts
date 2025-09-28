/**
 * HTTP client utility for making API requests with error handling and retries
 */

import { USGS_CONFIG, ERROR_MESSAGES } from '../utils/constants';

/**
 * HTTP client error class with additional context
 */
export class ApiError extends Error {
    statusCode?: number;
    response?: Response;

    constructor(
        message: string,
        statusCode?: number,
        response?: Response
    ) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.response = response;
    }
}

/**
 * Retry configuration
 */
interface RetryConfig {
    maxRetries: number;
    delay: number;
    backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: USGS_CONFIG.MAX_RETRIES,
    delay: USGS_CONFIG.RETRY_DELAY,
    backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = USGS_CONFIG.TIMEOUT
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(ERROR_MESSAGES.TIMEOUT);
        }
        throw error;
    }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, options);

            if (!response.ok) {
                throw new ApiError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    response
                );
            }

            return response;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            // Don't retry on the last attempt
            if (attempt === retryConfig.maxRetries) {
                break;
            }

            // Don't retry client errors (4xx)
            if (error instanceof ApiError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                break;
            }

            // Wait before retry with exponential backoff
            const delay = retryConfig.delay * Math.pow(retryConfig.backoffMultiplier, attempt);
            await sleep(delay);
        }
    }

    throw new ApiError(
        ERROR_MESSAGES.NETWORK_ERROR,
        lastError instanceof ApiError ? lastError.statusCode : undefined
    );
}

/**
 * Main API client class
 */
export class ApiClient {
    private baseUrl: string;
    private defaultOptions: RequestInit;

    constructor(baseUrl: string = '', defaultOptions: RequestInit = {}) {
        this.baseUrl = baseUrl;
        this.defaultOptions = {
            headers: {
                'Accept': 'text/csv,text/plain,*/*',
                'Cache-Control': 'no-cache',
                ...defaultOptions.headers,
            },
            ...defaultOptions,
        };
    }

    /**
     * GET request with retry logic
     */
    async get(url: string, options: RequestInit = {}): Promise<Response> {
        const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;
        const mergedOptions = {
            ...this.defaultOptions,
            ...options,
            method: 'GET',
            headers: {
                ...this.defaultOptions.headers,
                ...options.headers,
            },
        };

        return fetchWithRetry(fullUrl, mergedOptions);
    }

    /**
     * Fetch text content from URL
     */
    async getText(url: string, options: RequestInit = {}): Promise<string> {
        const response = await this.get(url, options);
        return response.text();
    }

    /**
     * Fetch JSON content from URL
     */
    async getJson<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
        const response = await this.get(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                ...options.headers,
            },
        });
        return response.json();
    }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();