"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/*
 * The lookup box.
 *
 * A dictionary lives or dies on this control, so it does the three things
 * people actually expect and nothing else: it suggests as you type, arrow keys
 * move through the suggestions, and Enter goes straight to the word rather
 * than to a results page you then have to click through.
 *
 * Suggestions come from /lexicon/api/suggest, which reads one letter index
 * server-side. Shipping a 147,000-word index to the browser to save a 40 ms
 * round trip would cost every visitor several megabytes.
 */
export default function SearchBox({
  autoFocus = false,
  size = "lg",
  placeholder = "Look up any word…",
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlighted, setHighlighted] = useState(-1);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return undefined;
    }

    // Abort in-flight lookups so a fast typist never sees results for a
    // prefix they have already moved past.
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/lexicon/api/suggest?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : { words: [] }))
        .then((data) => {
          setSuggestions(data.words || []);
          setHighlighted(-1);
        })
        .catch(() => {});
    }, 120);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onClickAway = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const go = (slug) => {
    setOpen(false);
    router.push(`/lexicon/word/${slug}`);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (highlighted >= 0 && suggestions[highlighted]) {
      go(suggestions[highlighted].s);
      return;
    }
    // Straight to the word page: it resolves inflections and falls back to a
    // "did you mean" list itself, so a search results page in between is a
    // click the reader did not ask for.
    router.push(`/lexicon/word/${encodeURIComponent(trimmed.toLowerCase().replace(/\s+/g, "-"))}`);
  };

  const onKeyDown = (event) => {
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const isLarge = size === "lg";

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={onSubmit} role="search">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Look up a word
        </label>
        <div className="relative">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground ${
              isLarge ? "h-5 w-5" : "h-4 w-4"
            }`}
            aria-hidden="true"
          />
          <input
            id={`${listId}-input`}
            type="search"
            value={query}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck="false"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            placeholder={placeholder}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              if (nextQuery.trim().length < 2) {
                setSuggestions([]);
                setHighlighted(-1);
              }
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className={`w-full rounded-lg border border-border bg-surface text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              isLarge ? "h-14 pl-12 pr-28 text-lg" : "h-11 pl-10 pr-4 text-[0.9375rem]"
            }`}
          />
          {isLarge ? (
            <button
              type="submit"
              className="absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            >
              Look up
            </button>
          ) : null}
        </div>
      </form>

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[22rem] overflow-y-auto overscroll-contain rounded-lg border border-border bg-surface p-1 shadow-lg"
          style={{ listStyle: "none" }}
        >
          {suggestions.map((word, index) => (
            <li key={word.s}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => go(word.s)}
                className={`flex w-full items-baseline gap-3 rounded-md px-3 py-2 text-left transition ${
                  index === highlighted ? "bg-surface-soft" : ""
                }`}
              >
                <span className="afl-headword shrink-0 text-[0.9375rem] text-foreground">
                  {word.w}
                </span>
                <span className="truncate text-xs text-muted-foreground">{word.g}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
