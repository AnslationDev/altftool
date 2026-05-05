import { Search, TrendingUp, Briefcase, DollarSign } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function EmptyState() {
  const { theme } = useTheme();

  return (
    <div className="bg-(--card) rounded-2xl shadow-lg p-12 border border-(--border) max-w-3xl mx-auto transition-colors duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-(--foreground) mb-2">
          Analyze Skill Market Demand
        </h2>

        <p className="text-(--muted-foreground) mb-8 max-w-md">
          Enter a skill above to discover job opportunities, salary trends, and market growth insights.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <Briefcase className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-(--foreground) mb-1">Job Count</h3>
            <p className="text-sm text-(--muted-foreground)">Total available positions</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
            <DollarSign className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="font-semibold text-(--foreground) mb-1">Salary Data</h3>
            <p className="text-sm text-(--muted-foreground)">Min, max & average pay</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-sky-600 mb-2" />
            <h3 className="font-semibold text-(--foreground) mb-1">Market Trends</h3>
            <p className="text-sm text-(--muted-foreground)">Growth & demand analysis</p>
          </div>
        </div>

        {/* Popular skills suggestions */}
        <div className="mt-8">
          <p className="text-sm text-(--muted-foreground) mb-3">Popular skills to explore:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['React', 'Python', 'JavaScript', 'Data Science', 'Machine Learning', 'DevOps'].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-(--muted) text-(--muted-foreground) rounded-full text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
