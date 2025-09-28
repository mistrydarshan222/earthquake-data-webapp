/**
 * Data formatting utilities for earthquake data display
 */

/**
 * Format a date/time string to a user-friendly format
 */
export function formatTime(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
    });
  } catch {
    return timeString;
  }
}

/**
 * Format a date/time string to a compact format for tables
 */
export function formatTimeCompact(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timeString;
  }
}

/**
 * Format a date to just the date portion
 */
export function formatDate(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return timeString;
  }
}

/**
 * Format a number to a specified number of decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
}

/**
 * Format magnitude with appropriate precision and color coding
 */
export function formatMagnitude(magnitude: number): {
  formatted: string;
  colorClass: string;
} {
  const formatted = formatNumber(magnitude, 1);
  let colorClass = 'text-gray-600';

  if (magnitude >= 6.0) {
    colorClass = 'text-red-600 font-semibold';
  } else if (magnitude >= 4.5) {
    colorClass = 'text-orange-600 font-medium';
  } else if (magnitude >= 3.0) {
    colorClass = 'text-yellow-600';
  }

  return { formatted, colorClass };
}

/**
 * Format location text for display, truncating if too long
 */
export function formatLocation(place: string, maxLength: number = 40): string {
  if (!place || typeof place !== 'string') {
    return 'Unknown location';
  }

  if (place.length <= maxLength) {
    return place;
  }

  return place.substring(0, maxLength - 3) + '...';
}

/**
 * Format depth with units
 */
export function formatDepth(depth: number): string {
  const formatted = formatNumber(depth, 1);
  return `${formatted} km`;
}

/**
 * Format coordinates (latitude/longitude) with appropriate precision
 */
export function formatCoordinate(coordinate: number): string {
  return formatNumber(coordinate, 3);
}

/**
 * Format coordinates as a pair
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
}

/**
 * Get magnitude color class based on magnitude value
 */
export function getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 6.0) return 'text-red-600 font-semibold';
  if (magnitude >= 4.5) return 'text-orange-600 font-medium';
  if (magnitude >= 3.0) return 'text-yellow-600';
  return 'text-gray-600';
}

/**
 * Format status with appropriate styling
 */
export function formatStatus(status: string): {
  formatted: string;
  className: string;
} {
  const formatted = status.charAt(0).toUpperCase() + status.slice(1);

  let className = 'inline-flex px-2 py-1 text-xs font-medium rounded-full ';

  switch (status.toLowerCase()) {
    case 'reviewed':
      className += 'bg-green-100 text-green-800';
      break;
    case 'automatic':
      className += 'bg-yellow-100 text-yellow-800';
      break;
    case 'deleted':
      className += 'bg-red-100 text-red-800';
      break;
    default:
      className += 'bg-gray-100 text-gray-800';
  }

  return { formatted, className };
}

/**
 * Format magnitude type for display
 */
export function formatMagnitudeType(magType: string): string {
  return magType.toUpperCase();
}

/**
 * Format large numbers with appropriate units (K, M, etc.)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format a time duration in a human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

/**
 * Format time relative to now (e.g., "2 hours ago")
 */
export function formatTimeAgo(timeString: string): string {
  try {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return formatDuration(diffMs);
  } catch {
    return timeString;
  }
}