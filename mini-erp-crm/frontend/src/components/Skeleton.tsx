import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5
}) => {
  return (
    <div className="w-full animate-pulse space-y-4 p-6">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-8 bg-gray-100 dark:bg-gray-800/60 rounded-lg flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded w-40" />
    </div>
  );
};
