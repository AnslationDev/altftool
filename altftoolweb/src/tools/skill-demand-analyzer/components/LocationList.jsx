import { MapPin, Building2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function LocationList({ topLocations = [] }) {
  const { theme } = useTheme();

  if (!Array.isArray(topLocations) || topLocations.length === 0) {
    return (
      <div className="bg-(--card) rounded-2xl shadow-lg p-6 border border-(--border) transition-colors duration-300 text-(--muted-foreground)">
        No location data available
      </div>
    );
  }

  const maxCount = Math.max(...topLocations.map(l => l.count || 0));

  return (
    <div className="bg-(--card) rounded-2xl shadow-lg p-6 border border-(--border) transition-colors duration-300">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-(--foreground)">Top Locations</h3>
      </div>

      <div className="space-y-4">
        {topLocations.map((location, index) => {
          const label = location.location || location.city || 'Unknown';
          const percentage = (location.count / maxCount) * 100;

          return (
            <div key={`${label}-${index}`} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    text-sm font-bold
                    ${index === 0 ? 'bg-linear-to-br from-blue-500 to-blue-600 text-white' :
                      index === 1 ? 'bg-linear-to-br from-blue-400 to-blue-500 text-white' :
                        index === 2 ? 'bg-linear-to-br from-blue-300 to-blue-400 text-white' :
                          'bg-(--muted) text-(--muted-foreground)'
                    }
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-(--foreground) group-hover:text-blue-600 transition-colors">
                      {label}
                    </div>
                    <div className="text-sm text-(--muted-foreground)">
                      {location.count} jobs
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-(--muted-foreground)">
                  {Math.round(percentage)}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-(--muted) rounded-full overflow-hidden">
                <div
                  className={`
                    h-full rounded-full transition-all duration-700
                    ${index === 0 ? 'bg-linear-to-r from-blue-500 to-blue-600' :
                      index === 1 ? 'bg-linear-to-r from-blue-400 to-blue-500' :
                        index === 2 ? 'bg-linear-to-r from-blue-300 to-blue-400' :
                          'bg-linear-to-r from-blue-200 to-blue-300'
                    }
                  `}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-(--border)">
        <div className="flex items-center gap-2 text-sm text-(--muted-foreground)">
          <Building2 className="w-4 h-4" />
          <span>Based on current job postings</span>
        </div>
      </div>
    </div>
  );
}
