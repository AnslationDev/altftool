"use client";

// Animal Hub search field — one component serving every search surface.
//
// Receives the slim search index as a prop (built server-side by
// getSearchIndex), so this component never fetches and never imports data. It
// is used by the homepage hero and by the category browser; `scope` only
// changes the placeholder and which entries are passed in.
//
// Implements the ARIA combobox pattern: arrow keys move through results,
// Enter opens the active one, Escape closes. The listbox is only announced
// once results exist, so a screen reader is not told about an empty popup.

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX_RESULTS = 6;

export function AnimalSearchField({
  index = [],
  placeholder = "Search animals by name or species",
  label = "Search animals",
  size = "md",
}) {
  const router = useRouter();
  const listId = useId();
  const optionId = useId();
  const inputRef = useRef(null);
  const blurTimer = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const scored = [];
    for (const entry of index) {
      let score = 0;
      for (const term of entry.terms) {
        if (term === q) score = Math.max(score, 100);
        else if (term.startsWith(q)) score = Math.max(score, 60);
        else if (term.includes(q)) score = Math.max(score, 30);
      }
      if (score) scored.push({ entry, score });
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((hit) => hit.entry);
  }, [index, query]);

  const isOpen = open && results.length > 0;

  function handleChange(event) {
    setQuery(event.target.value);
    setActive(0);
    setOpen(true);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[active];
      if (target) {
        setOpen(false);
        router.push(target.href);
      }
    }
  }

  // Delay closing so a click on a result registers before blur unmounts it.
  function handleBlur() {
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function handleFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    if (query.trim()) setOpen(true);
  }

  return (
    <div className={`ah-search ah-search--${size}`}>
      <div className="ah-search__field">
        <SearchGlyph />
        <input
          ref={inputRef}
          type="search"
          className="ah-search__input"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={label}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={isOpen ? `${optionId}-${active}` : undefined}
          autoComplete="off"
        />
      </div>

      {isOpen ? (
        <ul className="ah-search__results" id={listId} role="listbox" aria-label="Search results">
          {results.map((entry, i) => (
            <li key={entry.slug} role="none">
              <Link
                id={`${optionId}-${i}`}
                href={entry.href}
                role="option"
                aria-selected={i === active}
                className={`ah-search__result${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => setOpen(false)}
              >
                <span className="ah-search__result-name">{entry.name}</span>
                <span className="ah-search__result-latin">{entry.scientificName}</span>
                <span className="ah-search__result-category">{entry.category}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {query.trim() && !results.length ? (
        <p className="ah-search__empty" role="status">
          No animals match “{query.trim()}”.
        </p>
      ) : null}
    </div>
  );
}

/* A single hairline glyph rather than an icon-set import — one stroke weight,
   sized to the field, and no dependency for one mark. */
function SearchGlyph() {
  return (
    <svg
      className="ah-search__glyph"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path d="m12.75 12.75 4 4" />
    </svg>
  );
}
