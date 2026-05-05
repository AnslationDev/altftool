import { TrendingUp, Award } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function DemandScoreCard({ demandScore, trendStatus }) {
  const { theme } = useTheme();

  const getScoreBgGradient = (score) => {
    if (score >= 75) return 'from-blue-800 to-blue-950';
    if (score >= 50) return 'from-blue-600 to-blue-800';
    if (score >= 25) return 'from-blue-400 to-blue-600';
    return 'from-blue-100 to-blue-300';
  };


  return (
    <div className="bg-(--card) rounded-2xl shadow-lg p-6 border border-(--border) transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-(--foreground)">Demand Score</h3>
        </div>
        <div
          className={`
            flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
            bg-gradient-to-r ${getScoreBgGradient(demandScore.score)}
            bg-blue-700 text-white
          `}
        >
          <TrendingUp className="w-4 h-4" />
          {demandScore.level}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Score Circle */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-(--muted)"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(demandScore.score / 100) * 351.86} 351.86`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={demandScore.score >= 75 ? '#1e40af' : demandScore.score >= 50 ? '#3b82f6' : demandScore.score >= 25 ? '#60a5fa' : '#93c5fd'} />
                <stop offset="100%" stopColor={demandScore.score >= 75 ? '#1e3a8a' : demandScore.score >= 50 ? '#1e40af' : demandScore.score >= 25 ? '#3b82f6' : '#60a5fa'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${demandScore.color}`}>
              {demandScore.score}
            </span>
            <span className="text-xs text-(--muted-foreground)">out of 100</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-(--muted-foreground)">Job Market</span>
              <span className="font-medium text-(--foreground) whitespace-nowrap">{demandScore.jobScore}%</span>
            </div>
            <div className="h-2 bg-(--muted) rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${demandScore.jobScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-(--muted-foreground)">Salary Level</span>
              <span className="font-medium text-(--foreground) whitespace-nowrap">{demandScore.salaryScore}%</span>
            </div>
            <div className="h-2 bg-(--muted) rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${demandScore.salaryScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-(--muted-foreground)">Market Trend</span>
              <span className="font-medium text-(--foreground) whitespace-nowrap">{demandScore.trendScore}%</span>
            </div>
            <div className="h-2 bg-(--muted) rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${demandScore.trendScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
