"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Instagram, RotateCcw, Search } from "lucide-react";

import { GROUPS, SEARCH_ENGINES, buildQueries, searchUrl, toPlainText } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const SMALL_BTN =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  handle: "jane.doe_",
  name: "",
  city: "",
  tag: "",
  engine: "google",
};

export default function ToolHome() {
  const [handle, setHandle] = useState(DEFAULTS.handle);
  const [name, setName] = useState(DEFAULTS.name);
  const [city, setCity] = useState(DEFAULTS.city);
  const [tag, setTag] = useState(DEFAULTS.tag);
  const [engine, setEngine] = useState(DEFAULTS.engine);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(() => buildQueries({ handle, name, city, tag }), [handle, name, city, tag]);
  const ok = !result.error;

  const copyText = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setHandle(DEFAULTS.handle);
    setName(DEFAULTS.name);
    setCity(DEFAULTS.city);
    setTag(DEFAULTS.tag);
    setEngine(DEFAULTS.engine);
    setCopiedId("");
  };

  const allText = ok ? toPlainText(result) : "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Instagram className="h-4 w-4" aria-hidden="true" />
          Self OSINT audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Instagram Self Exposure Query Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Deleting a post does not delete the copies. These searches find where your photos, reels
          and handle have travelled &mdash; embeds in articles, reposts on other networks, and the
          same username used elsewhere. Run them on your own account.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-handle">
              Your username or profile URL
            </label>
            <input
              id="ig-handle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="jane.doe_"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-name">
              Real name on the account (optional)
            </label>
            <input
              id="ig-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-city">
              City or area you post from (optional)
            </label>
            <input
              id="ig-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-tag">
              A hashtag you use (optional)
            </label>
            <input
              id="ig-tag"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="#goatrip"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ig-engine">
              Open queries in
            </label>
            <select
              id="ig-engine"
              className={`mt-2 ${INPUT_CLASS}`}
              value={engine}
              onChange={(event) => setEngine(event.target.value)}
            >
              {SEARCH_ENGINES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Nothing you type is stored or sent &mdash; queries are assembled in this browser tab. Use
          it on your own account only.
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Queries ready to run
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.built : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `out of ${result.total} — add a name, city or hashtag to unlock the rest`
                : "Fix the problem above to build the query set."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText("all", allText)}
              aria-label="Copy every built query"
              className={GHOST_BTN}
            >
              {copiedId === "all" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "all" ? "Copied!" : "Copy all"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Queries built", ok ? `${result.built} of ${result.total}` : DASH],
            ["Waiting on more detail", ok ? String(result.skipped.length) : DASH],
            ["Username detected", ok ? result.resolvedHandle : DASH],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok && result.tagWarning ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            {result.tagWarning}
          </p>
        ) : null}

        {ok && result.skipped.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Not built yet
            </p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
              {result.skipped.map((entry) => (
                <li key={entry.id}>
                  {entry.title} &mdash; needs your {entry.missing.join(" and ")}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {ok
        ? GROUPS.map((group) => {
            const items = result.queries.filter((entry) => entry.group === group);
            if (items.length === 0) return null;
            return (
              <section
                key={group}
                className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                  <h2 className="text-base font-semibold">{group}</h2>
                </div>
                <ul className="mt-3 space-y-3">
                  {items.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <p className="text-sm font-semibold">{entry.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                        {entry.why}
                      </p>
                      <div className="mt-2 overflow-x-auto">
                        <code className="block whitespace-pre text-xs text-[var(--foreground)]">
                          {entry.query}
                        </code>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => copyText(entry.id, entry.query)}
                          aria-label={`Copy the query for ${entry.title}`}
                          className={SMALL_BTN}
                        >
                          {copiedId === entry.id ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {copiedId === entry.id ? "Copied!" : "Copy"}
                        </button>
                        <a
                          className={SMALL_BTN}
                          href={searchUrl(engine, entry.query)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          Run it
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What to do with what you find</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            A private account removes new posts from search over time, but pages that already
            embedded or reposted them keep their copy &mdash; those need a request to the site.
          </li>
          <li>
            Turn off &ldquo;Allow others to tag you&rdquo; and review the tagged tab, since most
            unwanted appearances come from other people&rsquo;s posts rather than your own.
          </li>
          <li>
            Change the username if it is reused on accounts you want kept separate; that link is
            usually what joins two identities together.
          </li>
          <li>
            Remove a phone number or personal email from a business bio &mdash; contact buttons are
            scraped and republished by lead-generation sites.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This tool only assembles search strings for you to run &mdash; it does not search, scrape or
        store anything. Use it to audit your own footprint, not other people&rsquo;s. Whether a page
        can be removed depends on each site&rsquo;s policy, and search engines may serve a cached
        copy for a while after the original changes.
      </p>
    </main>
  );
}
