"use client";

/*
 * Shared parts for the AltF Lexicon word tools.
 *
 * Each tool owns its own form, its own copy and its own empty state, because
 * those are the parts a reader actually reads. What they share is the plumbing:
 * one debounced fetch with abort, one results shell, one set of control sizes.
 *
 * Every interactive target here is at least 44px on its shortest side, and
 * every animation is behind `motion-safe:` so a reader who has asked their
 * system for reduced motion gets a static spinner and a text label instead.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlert, LoaderCircle, SearchX } from "lucide-react";

/* ---------------- control sizes ---------------- */

export const LABEL_CLASS = "block text-sm font-semibold text-foreground";

export const HINT_CLASS = "mt-1.5 text-xs leading-relaxed text-muted-foreground";

export const FIELD_CLASS =
  "mt-2 h-12 w-full rounded-lg border border-border bg-surface px-4 text-base text-foreground outline-none placeholder:text-muted-foreground motion-safe:transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export const AREA_CLASS =
  "mt-2 min-h-[11rem] w-full rounded-lg border border-border bg-surface p-4 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground motion-safe:transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export const SUBMIT_CLASS =
  "inline-flex h-12 min-w-[7rem] items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground motion-safe:transition hover:bg-primary-hover disabled:opacity-60";

export const GHOST_CLASS =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-muted-foreground motion-safe:transition hover:border-border-strong hover:text-foreground";

export const CHIP_CLASS =
  "inline-flex h-11 items-center rounded-lg border border-border bg-surface-soft px-3 font-mono text-sm text-muted-foreground no-underline motion-safe:transition hover:border-border-strong hover:text-foreground";

/* ---------------- the fetch ---------------- */

/**
 * One in-flight request at a time, keyed on the built URL.
 *
 * The abort is the point: a reader typing into a letters box fires a request
 * per keystroke, and without it the answer for "lis" can land after the answer
 * for "listen" and overwrite it.
 */
export function useToolQuery({ build, delay = 250, enabled = true }) {
  // The settled answer carries the URL it answered. Everything the caller
  // renders is derived from comparing that URL to the one the form currently
  // describes, so there is no state to set on the way in and no window where
  // the heading and the list disagree about which query they belong to.
  const [settled, setSettled] = useState({ url: null, data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  const url = enabled ? build() : null;

  useEffect(() => {
    if (!url) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(url, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`The server answered ${response.status}.`);
          return response.json();
        })
        .then((data) => setSettled({ url, data, error: null }))
        .catch((error) => {
          if (error.name === "AbortError") return;
          setSettled({ url, data: null, error: error.message });
        });
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [url, delay, attempt]);

  const retry = useCallback(() => {
    setSettled({ url: null, data: null, error: null });
    setAttempt((count) => count + 1);
  }, []);

  const answered = url !== null && settled.url === url;
  const phase = url === null ? "idle" : !answered ? "loading" : settled.error ? "error" : "done";

  return {
    phase,
    data: answered ? settled.data : null,
    error: answered ? settled.error : null,
    url,
    retry,
  };
}

/* ---------------- results shell ---------------- */

export function ToolPanel({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-border bg-surface-soft p-4 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function Loading({ label = "Searching the corpus…" }) {
  return (
    <p
      className="flex items-center gap-2.5 py-8 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
      {label}
    </p>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-border bg-surface p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <SearchX className="h-4 w-4 shrink-0" aria-hidden="true" />
        {title}
      </p>
      <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        That lookup did not come back
      </p>
      <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
        {message || "The corpus did not answer."} Nothing you typed was lost — try it again.
      </p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={GHOST_CLASS}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

/* ---------------- result rows ---------------- */

/**
 * A word as a link to its own entry.
 *
 * Every answer any of these tools produces is a real headword in the same
 * dictionary, so every answer is a door into it — the meter on the right is
 * the entry's commonness band, which is the fastest way to tell a word you can
 * actually play from a taxonomic curiosity.
 */
export function WordResult({ row, badge }) {
  return (
    <li>
      <Link
        href={`/lexicon/word/${row.s}`}
        className="flex min-h-[2.75rem] items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-[0.9375rem] text-foreground no-underline motion-safe:transition hover:border-border-strong hover:text-primary"
      >
        <span className="min-w-0 truncate">{row.w}</span>
        <span className="flex shrink-0 items-center gap-2">
          {badge ? (
            <span className="font-mono text-xs font-semibold tabular-nums text-primary">{badge}</span>
          ) : null}
          <span
            className="afl-meter"
            style={{ "--afl-meter-ink": `var(--afl-rank-${row.c || 1})` }}
            aria-label={`Commonness ${row.c || 1} of 5`}
          >
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                className={`afl-meter__seg${step <= (row.c || 1) ? " afl-meter__seg--on" : ""}`}
                style={{ width: "0.25rem", height: "0.25rem" }}
              />
            ))}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function ResultGroups({ groups = [], badgeOf }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="flex flex-wrap items-baseline gap-2 border-b border-border pb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            {group.label}
            <span className="text-muted-foreground normal-case tracking-normal">
              {group.words.length.toLocaleString("en-US")}
            </span>
          </h3>
          <ul
            className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2"
            style={{ listStyle: "none" }}
          >
            {group.words.map((row) => (
              <WordResult key={row.s} row={row} badge={badgeOf ? badgeOf(row) : null} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** The line above a result set: what was asked, what came back, what was cut. */
export function ResultSummary({ children, capped, total, limit }) {
  return (
    <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
      {children}
      {capped ? (
        <>
          {" "}
          <span className="text-foreground">
            Showing the first {limit.toLocaleString("en-US")} of{" "}
            {total.toLocaleString("en-US")} matches — narrow the input to see the rest.
          </span>
        </>
      ) : null}
    </p>
  );
}
