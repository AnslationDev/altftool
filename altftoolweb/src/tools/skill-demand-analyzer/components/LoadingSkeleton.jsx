import { useTheme } from '@/contexts/ThemeContext';

export function LoadingSkeleton() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 animate-pulse">
      {/* Demand Score Skeleton */}
      <div className="bg-(--card) rounded-2xl shadow-lg p-6 border border-(--border) transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-(--muted) rounded-lg" />
            <div className="h-6 w-32 bg-(--muted) rounded" />
          </div>
          <div className="h-8 w-24 bg-(--muted) rounded-full" />
        </div>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-(--muted) rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-(--muted) rounded w-full" />
            <div className="h-4 bg-(--muted) rounded w-3/4" />
            <div className="h-4 bg-(--muted) rounded w-1/2" />
          </div>
        </div>
      </div>

      {/* Job Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-(--card) rounded-2xl shadow-lg p-6 border border-(--border) transition-colors duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-(--muted) rounded-xl" />
              <div className="h-4 w-24 bg-(--muted) rounded" />
            </div>
            <div className="h-8 w-32 bg-(--muted) rounded mb-2" />
            <div className="h-4 w-20 bg-(--muted) rounded" />
          </div>
        ))}
      </div>

      {/* Chart and Location Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-(--card) rounded-2xl shadow-lg p-6 border border-(--border) transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-40 bg-(--muted) rounded" />
            <div className="h-12 w-20 bg-(--muted) rounded" />
          </div>
          <div className="h-64 bg-(--muted) rounded-xl" />
        </div>
        <div className="bg-(--card) rounded-2xl shadow-lg p-6 border border-(--border) transition-colors duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-(--muted) rounded" />
            <div className="h-6 w-32 bg-(--muted) rounded" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-(--muted) rounded-full" />
                    <div className="h-4 w-24 bg-(--muted) rounded" />
                  </div>
                  <div className="h-4 w-10 bg-(--muted) rounded" />
                </div>
                <div className="h-2 bg-(--muted) rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
