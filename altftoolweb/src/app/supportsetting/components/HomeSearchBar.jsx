"use client";

import { useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";

/**
 * The hero search bar on the landing page. It shares the exact same
 * searchQuery/onSearchChange state as the sidebar (both are controlled by
 * SupportClient) — typing here filters the sidebar list too, and this bar
 * additionally shows an inline dropdown of top matches so a first-time
 * visitor can go straight from "I need help with X" to that setting's page
 * without ever touching the sidebar.
 */
const HomeSearchBar = ({ settings, searchQuery, onSearchChange, onSelectSetting }) => {
  const [focused, setFocused] = useState(false);
  const query = searchQuery.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    return settings
      .filter(
        (setting) =>
          setting.title.toLowerCase().includes(query) ||
          setting.description?.toLowerCase().includes(query) ||
          setting.heading?.toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [settings, query]);

  const showDropdown = focused && query.length > 0;

  const handleSelect = (id) => {
    onSelectSetting(id);
    onSearchChange("");
    setFocused(false);
  };

  return (
    <div className="support-home-search">
      <div className="support-home-search-box">
        <Search className="h-4.5 w-4.5 support-home-search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="Search for a setting or support topic — try “backup” or “update”"
          aria-label="Search settings and support topics"
          className="support-home-search-input"
        />
      </div>

      {showDropdown && (
        <div className="support-home-search-results" role="listbox">
          {results.length === 0 ? (
            <p className="support-home-search-empty">No settings match &ldquo;{searchQuery}&rdquo;.</p>
          ) : (
            results.map((setting) => {
              const Icon = setting.icon;
              return (
                <button
                  key={setting.id}
                  type="button"
                  role="option"
                  className="support-home-search-result"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(setting.id)}
                >
                  <span className="support-home-search-result-icon" aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="support-home-search-result-text">
                    <span className="support-home-search-result-title">{setting.title}</span>
                    <span className="support-home-search-result-desc">{setting.heading}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 support-home-search-result-arrow" />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default HomeSearchBar;
