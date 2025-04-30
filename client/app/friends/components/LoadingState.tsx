"use client";

export default function LoadingState() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between animate-pulse border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cosmic-purple-200 dark:bg-cosmic-purple-900/50 rounded-full animate-pulse-glow"></div>
            <div>
              <div className="h-4 bg-cosmic-purple-200 dark:bg-cosmic-purple-900/50 rounded w-32 mb-2"></div>
              <div className="h-3 bg-cosmic-purple-200 dark:bg-cosmic-purple-900/50 rounded w-24"></div>
            </div>
          </div>
          <div className="w-8 h-8 bg-cosmic-purple-200 dark:bg-cosmic-purple-900/50 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}
