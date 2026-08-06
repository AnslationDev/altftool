"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";

/*
 * Cmd/Ctrl-K jump-to across the whole catalog.
 *
 * Written against plain DOM rather than the `cmdk` package already in the
 * dependency tree: cmdk owns focus, filtering and list virtualisation, and all
 * three fight the two things this needs — ranking that puts an exact domain
 * match first, and rows that are links rather than commands.
 *
 * The index is fetched on first open, not shipped with the page. 292 entries
 * of searchable text is ~40 KB, which is not worth adding to every Atlas page
 * for a feature most visitors never trigger.
 */
export default function AtlasPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    fetch("/altfatlas/search-index.json")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setIndex([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, index]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [open]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!index || needle.length < 2) return [];

    return index
      .map((row) => {
        const name = row.n.toLowerCase();
        let score = 0;
        if (name === needle) score += 100;
        else if (name.startsWith(needle)) score += 60;
        else if (name.includes(needle)) score += 40;
        if (row.d.toLowerCase().includes(needle)) score += 30;
        if (row.t.toLowerCase().includes(needle)) score += 10;
        return { row, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.row.n.localeCompare(b.row.n))
      .slice(0, 12)
      .map((item) => item.row);
  }, [index, query]);

  const go = (row) => {
    if (!row) return;
    setOpen(false);
    setQuery("");
    router.push(`/altfatlas/site/${row.s}`);
  };

  const onInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      {/* Discoverability: a keyboard shortcut nobody is told about does not
          exist. Shown on desktop only — there is no Cmd key on a phone. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-[var(--anslation-ds-shadow-lg)] transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:inline-flex"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        Jump to a site
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.625rem]">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Jump to a site in the Atlas"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-xl overflow-hidden rounded-lg border border-border bg-[var(--anslation-ds-surface)] shadow-[var(--anslation-ds-shadow-lg)]">
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  // Reset the highlight here rather than in an effect: the
                  // keystroke is the cause, so an effect would just be a
                  // second render reacting to a state change we already own.
                  setActive(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder={
                  index?.length
                    ? `Search ${index.length} sites…`
                    : "Search the Atlas…"
                }
                aria-label="Search the Atlas"
                aria-controls="atlas-palette-results"
                autoComplete="off"
                className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <ul
              id="atlas-palette-results"
              ref={listRef}
              className="max-h-[50vh] overflow-y-auto p-2"
            >
              {results.map((row, position) => (
                <li key={row.s}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(position)}
                    onClick={() => go(row)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition ${
                      position === active ? "bg-muted" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">
                        {row.n}
                      </span>
                      <span className="afa-domain block truncate">{row.t}</span>
                    </span>
                    <span className="afa-domain shrink-0">{row.d}</span>
                    <ArrowRight
                      className={`h-4 w-4 shrink-0 ${
                        position === active
                          ? "text-primary"
                          : "text-transparent"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}

              {query.trim().length >= 2 && !results.length ? (
                <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                  {index === null
                    ? "Loading the index…"
                    : `Nothing matches “${query.trim()}”.`}
                </li>
              ) : null}

              {query.trim().length < 2 ? (
                <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Type at least two characters.
                </li>
              ) : null}
            </ul>

            <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[0.6875rem] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border px-1 font-mono">
                  ↑↓
                </kbd>
                move
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border px-1 font-mono">
                  ↵
                </kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border px-1 font-mono">
                  esc
                </kbd>
                close
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
