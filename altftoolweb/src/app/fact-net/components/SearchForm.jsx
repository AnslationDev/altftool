"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function SearchForm({
  action = "/fact-net/search",
  query = "",
  categoryPath = "",
  sort = "latest",
  categories = [],
  suggestions = [],
  compact = false,
}) {
  const [term, setTerm] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const matches = useMemo(() => {
    const value = term.trim().toLowerCase();
    if (value.length < 2) return [];

    return suggestions
      .filter((item) =>
        `${item.title} ${item.categoryPath} ${item.description}`.toLowerCase().includes(value),
      )
      .slice(0, 6);
  }, [suggestions, term]);

  const clearSearch = () => {
    setTerm("");
    setShowSuggestions(false);
  };

  return (
    <div className="fn-search-wrap">
      <form action={action} className={`fn-search-form ${compact ? "fn-search-form-compact" : ""}`}>
        <div className="fn-search-main">
          <Search className="fn-icon" />
          <input
            name="q"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 180)}
            placeholder="Search original topics..."
            autoComplete="off"
          />
          {term && (
            <button type="button" onClick={clearSearch} className="fn-clear-button" aria-label="Clear search">
              <X className="fn-icon" />
            </button>
          )}
        </div>

        {!compact && (
          <div className="fn-search-filters">
            <select name="category" defaultValue={categoryPath} aria-label="Filter by category">
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.categoryPath} value={category.categoryPath}>
                  {category.name}
                </option>
              ))}
            </select>

            <select name="sort" defaultValue={sort} aria-label="Sort topics">
              <option value="latest">Latest</option>
              <option value="title">Title</option>
              <option value="count">Fact count</option>
            </select>
          </div>
        )}

        <button type="submit" className="fn-search-submit">
          {compact ? <Search className="fn-icon" /> : <SlidersHorizontal className="fn-icon" />}
          {compact ? "Search" : "Apply"}
        </button>
      </form>

      {showSuggestions && matches.length > 0 && (
        <div className="fn-suggestions" role="listbox">
          {matches.map((item) => (
            <Link key={item.href} href={item.href} className="fn-suggestion">
              <strong>{item.title}</strong>
              <span>{item.categoryPath.replaceAll("-", " ")}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
