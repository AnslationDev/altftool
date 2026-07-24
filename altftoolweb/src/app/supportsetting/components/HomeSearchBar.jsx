"use client";

import { useMemo, useState } from "react";
import { Search, ArrowRight, Layers } from "lucide-react";
import { searchEverything } from "../data/search";

/**
 * The hero search bar on the landing page. It shares the exact same
 * searchQuery/onSearchChange state as the sidebar (both are controlled by
 * SupportClient) — typing here filters the sidebar list too, and this bar
 * additionally shows an inline dropdown of top matches so a first-time
 * visitor can go straight from "I need help with X" to that setting's page
 * without ever touching the sidebar. Results prioritize the active
 * platform, with a compact "Other Platforms" row underneath (Universal
 * Search, item 6) rather than mixing every platform together.
 */
const HomeSearchBar = ({ settings, searchQuery, onSearchChange, onSelectSetting, platform, onSwitchPlatform }) => {
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

  const otherPlatforms = useMemo(() => {
    if (!query || !platform) return [];
    return searchEverything(query, { platform }).otherPlatforms;
  }, [query, platform]);

  const showDropdown = focused && query.length > 0;

  const handleSelect = (id) => {
    onSelectSetting(id);
    onSearchChange("");
    setFocused(false);
  };

  const handleSelectOtherPlatform = (targetPlatform, id) => {
    onSwitchPlatform?.(targetPlatform);
    handleSelect(id);
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

          {otherPlatforms.length > 0 && (
            <div className="support-home-search-other-platforms">
              <p className="support-home-search-other-platforms-label">
                <Layers className="h-3 w-3" /> Other Platforms
              </p>
              {otherPlatforms.map((group) => (
                <div key={group.platform} className="support-home-search-other-platform-row">
                  <span className="support-home-search-other-platform-name">{group.label}</span>
                  {group.results.slice(0, 2).map((setting) => (
                    <button
                      key={setting.id}
                      type="button"
                      className="support-home-search-other-platform-chip"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectOtherPlatform(group.platform, setting.id)}
                    >
                      {setting.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeSearchBar;
