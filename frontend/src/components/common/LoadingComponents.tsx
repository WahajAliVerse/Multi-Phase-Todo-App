import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  count = 1, 
  width, 
  height, 
  circle = false, 
  rounded = false 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`
        animate-pulse
        bg-gray-200
        ${circle ? 'rounded-full' : rounded ? 'rounded-md' : 'rounded-sm'}
        ${className}
      `}
      style={{
        width: width || '100%',
        height: height || '1rem',
      }}
    />
  ));

  return <>{skeletons}</>;
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '', 
  label 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        className={`${sizeClasses[size]} text-gray-400 animate-spin ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {label && <span className="mt-2 text-sm text-gray-500">{label}</span>}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  overlayText?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  children, 
  overlayText = 'Loading...' 
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600">{overlayText}</p>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
};

interface TaskListSkeletonProps {
  count?: number;
}

const TaskListSkeleton: React.FC<TaskListSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Skeleton className="mr-3" width={20} height={20} circle />
            <div className="flex-1">
              <Skeleton className="mb-2" height={20} width="60%" />
              <Skeleton className="mb-2" height={16} width="100%" />
              <Skeleton height={16} width="40%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface TaskDetailSkeletonProps {}

const TaskDetailSkeleton: React.FC<TaskDetailSkeletonProps> = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Skeleton className="mb-4" height={32} width="80%" />
      <Skeleton className="mb-2" height={20} width="100%" />
      <Skeleton className="mb-2" height={20} width="100%" />
      <Skeleton className="mb-2" height={20} width="70%" />
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Skeleton className="mb-3" height={24} width="40%" />
        <div className="flex space-x-2">
          <Skeleton width={60} height={20} rounded />
          <Skeleton width={60} height={20} rounded />
          <Skeleton width={60} height={20} rounded />
        </div>
      </div>
    </div>
  );
};

export { 
  Skeleton, 
  LoadingSpinner, 
  LoadingOverlay, 
  TaskListSkeleton, 
  TaskDetailSkeleton 
};