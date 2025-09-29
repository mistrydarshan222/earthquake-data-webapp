

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'blue' | 'gray' | 'white';
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const colors = {
  blue: 'text-blue-600',
  gray: 'text-gray-600',
  white: 'text-white',
};

export function LoadingSpinner({
  size = 'md',
  className = '',
  color = 'blue',
}: LoadingSpinnerProps) {
  const sizeClasses = sizes[size];
  const colorClasses = colors[color];

  return (
    <div
      className={`inline-block animate-spin ${sizeClasses} ${colorClasses} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg
        fill="none"
        viewBox="0 0 24 24"
        className="h-full w-full"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}