interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingClass = paddingClasses[padding];
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}