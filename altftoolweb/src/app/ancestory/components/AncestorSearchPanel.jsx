'use client'

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, X } from "lucide-react";

export function AncestorSearchPanel({ large = false, placeholder = "Enter a first name", initialValue = "" }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef(null);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recent_searches") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsFocused(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navigate = (name) => {
    if (!name.trim()) return;
    const clean = name.trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
    if (parts.length === 1) {
      router.push(`/ancestory/meaning?type=first&first=${encodeURIComponent(parts[0])}`);
    } else {
      const first = parts[0];
      const last = parts.slice(1).join(" ");
      router.push(`/ancestory/meaning?type=full&first=${encodeURIComponent(first)}&last=${encodeURIComponent(last)}`);
    }
    setIsFocused(false);
    setSearchTerm("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(searchTerm);
  };

  const clearRecents = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.setItem("recent_searches", "[]");
  };

  const showDropdown = isFocused && recentSearches.length > 0 && !searchTerm;

  return (
    <div className={`relative w-full mx-auto ${large ? "max-w-2xl" : "max-w-xl"}`} ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className={`absolute left-4 text-gray-400 pointer-events-none ${large ? "w-5 h-5" : "w-4 h-4"}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={`w-full border border-gray-300 rounded-full bg-white text-gray-800 placeholder-gray-400 dark:bg-(--background) dark:border-(--border) dark:text-gray-100 dark:placeholder-(--muted-foreground)
              focus:outline-none focus:ring-2 focus:ring-[#005831]/40 focus:border-[#005831] dark:focus:ring-emerald-500/30 dark:focus:border-emerald-500
              transition-all duration-300 shadow-sm
              ${large ? "pl-12 pr-32 py-4 text-base" : "pl-10 pr-24 py-3 text-sm"}`}
          />
          <button
            type="submit"
            className={`absolute right-1.5 bg-[#005831] hover:bg-[#004526] text-white font-semibold rounded-full transition-colors
              ${large ? "px-6 py-2.5 text-sm" : "px-5 py-2 text-xs"}`}
          >
            Search
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden dark:bg-(--muted) dark:border-(--border)">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 dark:border-(--border)">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-(--muted-foreground)">Recent searches</span>
            <button onClick={clearRecents} className="text-xs text-gray-400 hover:text-gray-600 dark:text-(--muted-foreground) dark:hover:text-(--foreground) flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
          <ul>
            {recentSearches.slice(0, 3).map((term, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => navigate(term)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-(--muted-gray) flex items-center gap-3 transition-colors"
                >
                  <Clock className="w-4 h-4 text-gray-300 dark:text-(--muted-foreground) flex-shrink-0" />
                  <span className="text-gray-700 dark:text-(--foreground) capitalize">{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
