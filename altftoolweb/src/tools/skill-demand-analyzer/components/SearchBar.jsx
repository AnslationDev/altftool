import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function SearchBar({ onSearch, loading = false, disabled = false }) {
  const { theme } = useTheme();
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const MIN_QUERY_LENGTH = 3;
  const COMMON_SKILLS = ['JavaScript', 'Python', 'Java', 'C#', 'C++', 'Node.js', 'React', 'Angular', 'SQL', 'Go', 'Ruby', 'PHP'];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      const v = value.trim();
      if (!v) return;
      if (v.length < MIN_QUERY_LENGTH) {
        setShowSuggestions(true);
        return;
      }
      setShowSuggestions(false);
      onSearch(v);
    }
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  const handleAnalyzeClick = () => {
    const v = value.trim();
    if (!v) return;
    if (v.length < MIN_QUERY_LENGTH) {
      setShowSuggestions(true);
      return;
    }
    setShowSuggestions(false);
    onSearch(v);
  };

  const filteredSuggestions = value.trim()
    ? COMMON_SKILLS.filter((s) => s.toLowerCase().startsWith(value.trim().toLowerCase())).slice(0, 8)
    : COMMON_SKILLS.slice(0, 8);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative flex items-center overflow-hidden
          bg-(--card) rounded-2xl
          border-2 transition-all duration-300
          ${isFocused
            ? 'border-blue-500 shadow-lg shadow-blue-200'
            : 'border-(--border) hover:border-blue-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Search Icon */}
        <Search
          className={`
            w-5 h-5 ml-4 shrink-0 transition-colors duration-300
            ${isFocused ? 'text-blue-500' : 'text-(--muted-foreground)'}
          `}
        />

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter a skill (e.g., React, Python, Data Science)"
          disabled={disabled || loading}
          className="
            flex-1 min-w-0 px-4 py-4 text-lg
            bg-transparent outline-none border-none
            text-(--foreground)
            placeholder:text-(--muted-foreground)
          "
        />

        {/* Clear Button */}
        {value && !loading && (
          <button
            onClick={handleClear}
            className="
              mr-2 p-2 rounded-full
              text-gray-500 hover:bg-gray-100
              transition
            "
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Analyze Button */}
        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={!value.trim() || loading || disabled}
          className={`
            h-full px-6 py-4 border-l
            font-medium transition-all duration-300
            ${value.trim() && !loading && !disabled
              ? 'border-blue-500 text-gray-700 hover:bg-blue-50'
              : 'border-(--border) text-(--muted-foreground) cursor-not-allowed'
            }
          `}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      {/* Suggestions dropdown for short queries */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="max-w-2xl mx-auto mt-2 bg-(--card) rounded-md p-2 shadow-md">
          <div className="text-sm text-(--muted-foreground) mb-2">Please enter at least 3 characters or choose a suggestion:</div>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => { setValue(s); setShowSuggestions(false); onSearch(s); }}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}