import { useState, useEffect, useRef } from "react";
import { Search, Clock, X, Delete } from "lucide-react";

const RECENT_KEY = "recent_searches";
const MAX_RECENT = 8;

const loadRecentSearches = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export default function SearchBar({ word, setWord, loading, onSearch }) {
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // recent search save karo
  const saveRecentSearch = (searchWord) => {
    const updated = [
      searchWord,
      ...recentSearches.filter((w) => w !== searchWord),
    ].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  // recent search remove karo
  const removeRecent = (e, searchWord) => {
    e.stopPropagation();
    const updated = recentSearches.filter((w) => w !== searchWord);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  // all recent clear karo
  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  // type karne pe datamuse se suggestions fetch karo
  useEffect(() => {
    const query = word.trim();
    if (query.length < 2) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.datamuse.com/sug?s=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (!cancelled) {
          setSuggestions(data.slice(0, 6).map((item) => item.word));
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      }
    }, 250); // 250ms debounce

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [word]);

  // dropdown mein kya dikhana hai
  const showRecents = !word.trim() && recentSearches.length > 0;
  const visibleSuggestions = word.trim().length >= 2 ? suggestions : [];
  const showSuggestions = visibleSuggestions.length > 0;
  const dropdownItems = showRecents ? recentSearches : showSuggestions ? visibleSuggestions : [];
  const shouldShowDropdown = showDropdown && dropdownItems.length > 0;

  // search handle karo
  const handleSelect = (selectedWord) => {
    setWord(selectedWord);
    saveRecentSearch(selectedWord);
    setShowDropdown(false);
    setActiveSuggestion(-1);
    onSearch(selectedWord);
  };

  const handleSearchClick = () => {
    if (!word.trim()) return;
    saveRecentSearch(word.trim());
    setShowDropdown(false);
    onSearch(word.trim());
  };

  // keyboard navigation
  const handleKeyDown = (e) => {
    if (!shouldShowDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < dropdownItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (activeSuggestion >= 0) {
        e.preventDefault();
        handleSelect(dropdownItems[activeSuggestion]);
      } else {
        handleSearchClick();
        setShowDropdown(false);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveSuggestion(-1);
    }
  };

  // bahar click karne pe dropdown band karo
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 relative">
      <div className="border border-(--border) rounded-lg p-4 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center relative">

          {/* Input */}
          <div className="relative flex-1 ">
            <Search
              size={16}
              className="sm:size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)"
            />
            <input
              ref={inputRef}
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                setShowDropdown(true);
                setActiveSuggestion(-1);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search for a word..."
              className="w-full pl-11 pr-4 py-3 sm:py-4  border border-(--border) rounded-md text-sm sm:text-base"
            />
          </div>

          {/* Search button */}
          <button
            onClick={handleSearchClick}
            disabled={loading}
            className="sm:px-6 px-4 py-2 sm:py-4 bg-(--primary) text-white rounded-md cursor-pointer transition text-sm sm:text-base font-medium whitespace-nowrap disabled:opacity-60 "
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-1 mx-0 bg-(--background) border border-(--border) rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-(--border)">
            <span className="text-xs text-(--muted-foreground) font-medium">
              {showRecents ? "Recent searches" : "Suggestions"}
            </span>
            {showRecents && (
              <button
                onClick={clearAllRecent}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
              >
                <Delete size={12} />
                Clear all
              </button>
            )}
          </div>

          {/* Items */}
          {dropdownItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item)}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition text-sm
                ${activeSuggestion === idx
                  ? "bg-(--muted)"
                  : "hover:bg-(--muted)"
                }`}
            >
              <div className="flex items-center gap-3">
                {showRecents ? (
                  <Clock size={14} className="text-(--muted-foreground)" />
                ) : (
                  <Search size={14} className="text-(--muted-foreground)" />
                )}
                <span className="text-(--foreground)">{item}</span>
              </div>

              {/* Recent wale ke saath X button */}
              {showRecents && (
                <button
                  onClick={(e) => removeRecent(e, item)}
                  className="text-(--muted-foreground) hover:text-red-500 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
