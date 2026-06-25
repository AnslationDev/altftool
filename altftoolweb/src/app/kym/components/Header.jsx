"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  editorials,
  episodes,
  explainers,
  freshEntries,
  heroTags,
  latest,
  spotlightCards,
  topEntries,
  topMemes,
} from "../data/kymData";
import { slugifyTitle } from "../data/slug";

const SEARCH_LIMIT = 8;

function cardHref(item) {
  return item.href || `/kym/${slugifyTitle(item.title)}`;
}

function createSearchIndex() {
  const groups = [
    ["Featured", spotlightCards],
    ["Fresh Entry", freshEntries],
    ["Explainer", explainers],
    ["Episode", episodes],
    ["Editorial", editorials],
    ["Latest", latest],
    ["Top Entry", topEntries],
    ["Top Meme", topMemes],
  ];

  const seen = new Set();

  return groups.flatMap(([type, items]) =>
    items.reduce((results, item) => {
      const href = cardHref(item);
      const key = `${href}:${item.title}`.toLowerCase();

      if (seen.has(key)) {
        return results;
      }

      seen.add(key);
      results.push({
        ...item,
        href,
        type: item.category || type,
        searchText: [item.title, item.category, item.meta, type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      });

      return results;
    }, []),
  );
}

export default function Header({ compact = false }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchIndex = useMemo(() => createSearchIndex(), []);
  const cleanQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (cleanQuery.length < 2) {
      return [];
    }

    return searchIndex
      .filter((item) => item.searchText.includes(cleanQuery))
      .sort((a, b) => {
        const aStarts = a.title.toLowerCase().startsWith(cleanQuery) ? 0 : 1;
        const bStarts = b.title.toLowerCase().startsWith(cleanQuery) ? 0 : 1;

        return aStarts - bStarts || a.title.localeCompare(b.title);
      })
      .slice(0, SEARCH_LIMIT);
  }, [cleanQuery, searchIndex]);

  const showResults = isFocused && query.trim().length > 0;

  function goToResult(href) {
    setIsFocused(false);
    router.push(href);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (results[0]) {
      goToResult(results[0].href);
    }
  }

  return (
    <header className={`kym-header${compact ? " kym-header--compact" : ""}`}>
      {compact ? (
        <div className="kym-compact-brand">
          <Link href="/kym">Know Your Meme</Link>
        </div>
      ) : null}

      <div className="kym-hero">
        <h1>Know Your Meme</h1>
        <form className="kym-search" onSubmit={handleSubmit} role="search">
          <button className="kym-search__submit" type="submit" aria-label="Search KYM">
            <Search size={18} strokeWidth={2.5} />
          </button>
          <input
            aria-label="Search memes"
            autoComplete="off"
            placeholder="Search for your favorite meme or keyword..."
            value={query}
            onBlur={() => setTimeout(() => setIsFocused(false), 120)}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="kym-search__clear"
              type="button"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          ) : null}

          {showResults ? (
            <div className="kym-search-results">
              {results.length ? (
                results.map((item) => (
                  <button
                    className="kym-search-result"
                    key={`${item.href}-${item.title}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => goToResult(item.href)}
                  >
                    {item.image?.src ? <img src={item.image.src} alt="" /> : null}
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.type}</small>
                    </span>
                  </button>
                ))
              ) : (
                <p className="kym-search-empty">
                  No KYM results found for &quot;{query.trim()}&quot;.
                </p>
              )}
            </div>
          ) : null}
        </form>

        <div className="kym-tags" aria-label="Popular searches">
          {heroTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => {
                setQuery(tag);
                setIsFocused(true);
              }}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
}
