import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ErrorState({ message, onRetry }) {
  const { theme } = useTheme();

  return (
    <div className="bg-(--card) rounded-2xl shadow-lg p-8 border border-red-100 max-w-2xl mx-auto transition-colors duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-xl font-semibold text-(--foreground) mb-2">
          Oops! Something went wrong
        </h3>

        <p className="text-(--muted-foreground) mb-6">
          {message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
