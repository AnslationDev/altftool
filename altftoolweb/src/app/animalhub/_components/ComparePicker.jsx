"use client";

// The only interactive piece of the compare page.
//
// Selection lives in the URL (`?ids=lion,tiger`), not in component state, so a
// comparison can be linked, shared and rendered on the server. This island's
// whole job is editing that query string.
//
// It receives the light index from getCompareIndex — slug, name, scientific
// name and category, no imagery or measurements — because filtering a list of
// names needs nothing more, and shipping full records would make this the
// heaviest payload on the site.

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MAX_COMPARE = 4;

export function ComparePicker({ index = [], selected = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return index
      .filter((entry) => !selectedSet.has(entry.slug))
      .filter(
        (entry) =>
          entry.name.toLowerCase().includes(needle) ||
          entry.scientificName?.toLowerCase().includes(needle) ||
          entry.category.toLowerCase().includes(needle)
      )
      .slice(0, 8);
  }, [index, query, selectedSet]);

  function commit(slugs) {
    const params = new URLSearchParams(searchParams.toString());
    if (slugs.length) {
      params.set("ids", slugs.join(","));
    } else {
      params.delete("ids");
    }
    router.push(`/animalhub/compare?${params.toString()}`, { scroll: false });
  }

  function add(slug) {
    if (selected.length >= MAX_COMPARE) return;
    setQuery("");
    commit([...selected, slug]);
  }

  const full = selected.length >= MAX_COMPARE;

  return (
    <div className="ah-picker">
      <label className="ah-picker__label" htmlFor="ah-compare-search">
        Add an animal
      </label>
      <input
        id="ah-compare-search"
        type="search"
        className="ah-picker__input"
        placeholder={full ? `Remove one to add another (max ${MAX_COMPARE})` : "Search by name or group"}
        value={query}
        disabled={full}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />

      {query.trim() && !full ? (
        <ul className="ah-picker__results">
          {matches.length ? (
            matches.map((entry) => (
              <li key={entry.slug}>
                <button type="button" className="ah-picker__option" onClick={() => add(entry.slug)}>
                  <span className="ah-picker__option-name">{entry.name}</span>
                  <span className="ah-picker__option-meta">{entry.category}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="ah-picker__empty">No match for “{query.trim()}”</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
