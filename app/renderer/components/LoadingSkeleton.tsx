import React from 'react';

interface LoadingSkeletonProps {
  type: 'card' | 'list-item' | 'text' | 'chart';
  count?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-knoux-background-surface/50 p-6 rounded-2xl border border-white/5 animate-pulse ${className}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
              <div className="w-3 h-3 bg-white/10 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
              <div className="h-8 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/5 rounded w-1/3"></div>
            </div>
          </div>
        );
      case 'list-item':
        return (
          <div className={`flex items-center space-x-4 p-4 bg-knoux-background-surface/30 rounded-xl border border-white/5 animate-pulse ${className}`}>
            <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className={`space-y-2 animate-pulse ${className}`}>
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
            <div className="h-4 bg-white/10 rounded w-4/6"></div>
          </div>
        );
      case 'chart':
        return (
            <div className={`bg-knoux-background-surface/50 p-6 rounded-2xl border border-white/5 animate-pulse ${className}`}>
                <div className="h-6 bg-white/10 rounded w-1/3 mb-6"></div>
                <div className="flex items-end justify-between space-x-2 h-32">
                    <div className="w-full bg-white/5 rounded-t h-1/3"></div>
                    <div className="w-full bg-white/5 rounded-t h-2/3"></div>
                    <div className="w-full bg-white/5 rounded-t h-1/2"></div>
                    <div className="w-full bg-white/5 rounded-t h-3/4"></div>
                    <div className="w-full bg-white/5 rounded-t h-2/5"></div>
                </div>
            </div>
        )
      default:
        return <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default LoadingSkeleton;
