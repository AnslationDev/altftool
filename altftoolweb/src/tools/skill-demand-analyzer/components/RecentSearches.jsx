import { Clock, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function RecentSearches({ searches, onSelect, onClear }) {
  const { theme } = useTheme();

  if (searches.length === 0) return null;

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-blue-700 bg-blue-100';
    if (score >= 50) return 'text-blue-600 bg-blue-50';
    if (score >= 25) return 'text-blue-500 bg-blue-50';
    return 'text-blue-400 bg-blue-100';
  };

  return (
    <div className="bg-(--card) rounded-2xl shadow-lg p-6 border border-(--border) max-w-2xl mx-auto transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-(--muted-foreground)" />
          <h3 className="text-sm font-semibold text-(--muted-foreground)">Recent Searches</h3>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-(--muted-foreground) hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <button
            key={`${search.skill}-${index}`}
            onClick={() => onSelect(search.skill)}
            className="group flex items-center gap-2 px-3 py-2 bg-(--muted) hover:bg-blue-50 rounded-xl transition-all duration-200 border border-(--border) hover:border-blue-200"
          >
            <span className="text-sm font-medium text-(--foreground) group-hover:text-blue-700">
              {search.skill}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreColor(search.demandScore)}`}>
              {search.demandScore}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
