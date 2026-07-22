"use client";

import { forwardRef } from "react";
import { SearchInput } from "@altftool/ui";

/**
 * Wraps @altftool/ui's SearchInput. The `/` keyboard shortcut that focuses
 * this is wired up in SettingsContent via a ref, matching the shortcut
 * documented in KeyboardShortcutsCard.
 */
const SearchBar = forwardRef(function SearchBar({ value, onChange, resultCount, showResultCount }, ref) {
  return (
    <div className="support-search-wrap">
      <SearchInput
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClear={() => onChange("")}
        placeholder="Search support settings… (press / to focus)"
        aria-label="Search support settings"
        className="support-search-input"
      />
      {showResultCount && (
        <p className="support-search-result-count" role="status">
          {resultCount === 0
            ? "No matching settings"
            : `${resultCount} matching setting${resultCount === 1 ? "" : "s"}`}
        </p>
      )}
    </div>
  );
});

export default SearchBar;
