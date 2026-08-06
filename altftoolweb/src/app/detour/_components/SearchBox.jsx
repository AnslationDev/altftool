"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

/*
 * Search input for the directory.
 *
 * The query lives in the URL like every other filter, so a search is linkable,
 * server-rendered and crawlable. The input holds its own value between
 * keystrokes and pushes to the URL on a debounce — typing straight into the URL
 * would fire a navigation per character.
 *
 * `router.replace` rather than `push`: a search is a refinement, not a
 * destination, and pushing would put every intermediate keystroke in the back
 * stack so leaving the page took twenty presses.
 */

const DEBOUNCE_MS = 220;

export default function SearchBox({
  initialQuery = "",
  basePath = "/detour/browse",
  preserve = {},
  autoFocus = false,
  placeholder = "Search 1,300+ sites…",
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  // Skips the push that would otherwise fire on mount and clobber the URL.
  const dirtyRef = useRef(false);

  const preserveKey = JSON.stringify(preserve);

  const commit = useCallback(
    (query) => {
      const params = new URLSearchParams();
      Object.entries(JSON.parse(preserveKey)).forEach(([key, entry]) => {
        // `q` is set from the live value below, never carried over — the
        // preserved params still hold the previous query, so copying it here
        // would make clearing the box put the old term straight back.
        // `page` is dropped because a changed query invalidates the offset.
        if (key === "q" || key === "page") return;
        if (entry !== undefined && entry !== null && entry !== "") {
          params.set(key, String(entry));
        }
      });
      if (query.trim()) params.set("q", query.trim());
      const search = params.toString();
      router.replace(search ? `${basePath}?${search}` : basePath, {
        scroll: false,
      });
    },
    [basePath, preserveKey, router],
  );

  useEffect(() => {
    if (!dirtyRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commit(value), DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [value, commit]);

  // "/" focuses search from anywhere, the convention everywhere else on the
  // web. Ignored while the user is already typing into something.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const clear = () => {
    dirtyRef.current = true;
    setValue("");
    clearTimeout(timerRef.current);
    commit("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label htmlFor="dtr-search" className="sr-only">
        Search the directory
      </label>

      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      <input
        id="dtr-search"
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => {
          dirtyRef.current = true;
          setValue(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            clearTimeout(timerRef.current);
            commit(value);
          }
          if (event.key === "Escape" && value) clear();
        }}
        placeholder={placeholder}
        autoComplete="off"
        // The browser's own clear affordance would sit under ours.
        className="dtr-search-input w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-sm outline-none transition-colors focus-visible:border-[var(--dtr-accent)]"
      />

      {value ? (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
          /
        </kbd>
      )}
    </div>
  );
}
