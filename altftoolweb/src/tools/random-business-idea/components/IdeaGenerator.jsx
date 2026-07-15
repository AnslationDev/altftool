"use client";

import { useState, useEffect, useRef } from "react";
import { Lightbulb, Zap, SlidersHorizontal, X } from "lucide-react";
import { FILTER_OPTIONS } from "../utils/ideas";

const COUNT_OPTIONS = [1, 3, 5, 10];

export default function IdeaGenerator({
  onGenerate,
  isLoading,
  count,
  setCount,
  filters,
  setFilters,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [localIndustry, setLocalIndustry] = useState(filters.industry || "");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const filterRef = useRef(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleGenerate = () => {
    onGenerate({ industry: localIndustry });
  };

  const clearFilters = () => {
    setLocalIndustry("");
    setFilters({});
  };

  const hasFilters = localIndustry.length > 0;

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex-1 relative" ref={selectRef}>
          <button
            type="button"
            onClick={() => setIsSelectOpen(!isSelectOpen)}
            className="w-full flex items-center justify-between pl-10 pr-10 py-2.5 rounded-xl border border-(--border) bg-(--page) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted-foreground) pointer-events-none z-10" />
              <span className={localIndustry ? "text-(--foreground)" : "text-(--muted-foreground)"}>
                {localIndustry || "Filter by industry (optional)..."}
              </span>
            </span>
            <svg className={`w-4 h-4 text-(--muted-foreground) transition-transform duration-200 ${isSelectOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSelectOpen && (
            <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-(--surface) border border-(--border) rounded-xl shadow-lg z-30 py-1 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setLocalIndustry("");
                  setIsSelectOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition hover:bg-(--primary)/10 ${
                  !localIndustry ? "bg-(--primary)/5 font-semibold text-(--primary)" : "text-(--foreground)"
                }`}
              >
                Any industry
              </button>
              {FILTER_OPTIONS.industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => {
                    setLocalIndustry(ind);
                    setIsSelectOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition hover:bg-(--primary)/10 ${
                    localIndustry === ind ? "bg-(--primary)/5 font-semibold text-(--primary)" : "text-(--foreground)"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex gap-1 bg-(--page) rounded-xl p-1 border border-(--border)">
            {COUNT_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  count === c
                    ? "bg-(--surface) text-(--foreground) shadow-sm border border-(--border)"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition ${
                hasFilters
                  ? "bg-(--primary)/10 text-(--primary) border-(--primary)/30"
                  : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-(--surface) border border-(--border) rounded-xl shadow-lg overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">Filters</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-xs text-(--primary) hover:underline">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted-foreground) mb-1 block">Industry</label>
                    <select
                      value={localIndustry}
                      onChange={(e) => setLocalIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--page) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                    >
                      <option value="">Any industry</option>
                      {FILTER_OPTIONS.industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-2 rounded-lg bg-(--primary) text-white text-sm font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-(--muted-foreground)">Filtered by:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--primary)/10 text-(--primary) text-xs font-medium">
            {localIndustry}
            <button onClick={() => { setLocalIndustry(""); setFilters({}); }}>
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition shadow-md ${
          isLoading
            ? "bg-(--muted)/30 text-(--muted-foreground) cursor-not-allowed"
            : "bg-(--primary) text-white hover:opacity-90"
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Generate {count > 1 ? `${count} Business Ideas` : "a Business Idea"}
          </>
        )}
      </button>
    </div>
  );
}
