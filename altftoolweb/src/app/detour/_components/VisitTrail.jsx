"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, History, Sparkles, Trash2 } from "lucide-react";

/*
 * Where the button has already sent you.
 *
 * This is the fix for the one genuine flaw in every random-website button: you
 * land on something good, close the tab, and it is gone — there is no back
 * button for a random pick, and no way to describe what you saw. The trail
 * turns a lottery into something you can retrace.
 *
 * Stored in localStorage rather than sessionStorage on purpose: the value is
 * almost entirely in "what was that thing I found last week". Nothing leaves
 * the browser — see the note rendered at the bottom of the panel, which is a
 * promise the code has to keep.
 *
 * Renders nothing until it has read storage, because the server has no idea
 * what is in it and rendering an empty panel first causes a visible flash.
 */

const STORAGE_KEY = "altf-detour-trail";
export const TRAIL_LIMIT = 30;

/** Shape stored per entry: slug, name, url, origin, and when it was served. */
export function readTrail() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushTrail(entry) {
  try {
    const next = [
      { ...entry, at: Date.now() },
      ...readTrail().filter((item) => item.slug !== entry.slug),
    ].slice(0, TRAIL_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Same-tab storage events do not fire, so the panel is told directly.
    window.dispatchEvent(new CustomEvent("altf-detour-trail-change"));
    return next;
  } catch {
    return readTrail();
  }
}

/*
 * localStorage is an external store, so the trail is read through
 * `useSyncExternalStore` rather than an effect. That gets the SSR pass right by
 * construction and avoids the cascading render an effect-plus-setState causes.
 *
 * `getSnapshot` must be referentially stable while the data is unchanged, or
 * React re-renders forever. Parsing produces a fresh array every call, so the
 * parsed value is memoised against the raw string it came from.
 */
const EMPTY = Object.freeze([]);
let cachedRaw = null;
let cachedValue = EMPTY;

function subscribe(onChange) {
  window.addEventListener("altf-detour-trail-change", onChange);
  // Covers a second tab writing to the trail; same-tab writes do not fire this.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("altf-detour-trail-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }

  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;

  try {
    const parsed = raw ? JSON.parse(raw) : EMPTY;
    cachedValue = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

/** The server has no storage, so it always renders the empty state. */
function getServerSnapshot() {
  return EMPTY;
}

function timeAgo(timestamp) {
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export default function VisitTrail() {
  const trail = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const clear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to do; the panel simply will not clear.
    }
    window.dispatchEvent(new CustomEvent("altf-detour-trail-change"));
  };

  if (trail.length === 0) return null;

  return (
    <section
      className="mx-auto mt-12 w-full max-w-2xl rounded-2xl border border-border bg-card p-5 text-left"
      aria-labelledby="dtr-trail-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="dtr-trail-heading"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <History className="h-4 w-4" aria-hidden="true" />
          Where you have been
          <span className="font-mono text-xs font-normal text-muted-foreground">
            {trail.length}
          </span>
        </h2>

        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      </div>

      <ul className="mt-3 divide-y divide-border">
        {trail.map((entry) => (
          <li
            key={entry.slug}
            className="flex items-center justify-between gap-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              {entry.origin === "altf" ? (
                <Sparkles
                  className="h-3 w-3 flex-shrink-0"
                  style={{ color: "var(--dtr-accent)" }}
                  aria-hidden="true"
                />
              ) : null}
              <Link
                href={`/detour/site/${entry.slug}`}
                className="truncate text-sm font-medium underline-offset-2 hover:underline"
              >
                {entry.name}
              </Link>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground">
                {timeAgo(entry.at)}
              </span>
              <a
                href={entry.url}
                target={entry.origin === "altf" ? undefined : "_blank"}
                rel={entry.origin === "altf" ? undefined : "noopener noreferrer"}
                className="inline-flex items-center gap-0.5 text-xs font-medium transition-colors hover:underline"
                style={{ color: "var(--dtr-accent-text)" }}
              >
                Again
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Kept in this browser only. Never sent anywhere, and cleared the moment
        you press Clear.
      </p>
    </section>
  );
}
