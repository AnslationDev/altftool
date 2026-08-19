"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Facebook, RotateCcw, Search } from "lucide-react";

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
  name: "Jane Doe",
  handle: "jane.doe.9",
  city: "",
  org: "",
  engine: "google",
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [handle, setHandle] = useState(DEFAULTS.handle);
  const [city, setCity] = useState(DEFAULTS.city);
  const [org, setOrg] = useState(DEFAULTS.org);
  const [engine, setEngine] = useState(DEFAULTS.engine);
  const [copiedId, setCopiedId] = useState("");
  const [copyError, setCopyError] = useState("");

  const result = useMemo(() => buildQueries({ name, handle, city, org }), [name, handle, city, org]);
  const ok = !result.error;

  const copyText = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setCopyError("");
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
      setCopyError(id);
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setHandle(DEFAULTS.handle);
    setCity(DEFAULTS.city);
    setOrg(DEFAULTS.org);
    setEngine(DEFAULTS.engine);
    setCopiedId("");
    setCopyError("");
  };

  const allText = ok ? toPlainText(result) : "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Facebook className="h-4 w-4" aria-hidden="true" />
          Self OSINT audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Facebook Self Exposure Query Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your own privacy settings do not cover public group posts, events, the people directory or
          pages that link to your profile. These searches show what a stranger can read without
          sending you a friend request.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fb-name">
              Name on your profile
            </label>
            <input
              id="fb-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fb-handle">
              Username, profile link or numeric id
            </label>
            <input
              id="fb-handle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="jane.doe.9"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fb-city">
              City or town (optional)
            </label>
            <input
              id="fb-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fb-org">
              Employer, school or club (optional)
            </label>
            <input
              id="fb-org"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={org}
              onChange={(event) => setOrg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fb-engine">
              Open queries in
            </label>
            <select
              id="fb-engine"
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
          it on your own profile only.
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

      <section aria-live="polite" className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
                ? `out of ${result.total} — add a city or employer to unlock the rest`
                : "Fix the problem above to build the query set."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText("all", allText)}
              aria-label={copiedId === "all" ? "Copied every built query" : "Copy every built query"}
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

        {copyError === "all" ? (
          <p role="alert" className="mt-3 text-xs font-medium text-[var(--danger)]">
            Couldn&rsquo;t copy automatically &mdash; copy the text manually.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Queries built", ok ? `${result.built} of ${result.total}` : DASH],
            ["Waiting on more detail", ok ? String(result.skipped.length) : DASH],
            [
              "Profile reference detected",
              ok
                ? result.resolvedHandle
                  ? `${result.resolvedHandle} (${result.handleKind === "id" ? "numeric id" : "username"})`
                  : "None"
                : DASH,
            ],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] break-words text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok && result.handleError ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            {result.handleError}
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
                          aria-label={
                            copiedId === entry.id
                              ? `Copied the query for ${entry.title}`
                              : `Copy the query for ${entry.title}`
                          }
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
                      {copyError === entry.id ? (
                        <p role="alert" className="mt-2 text-xs font-medium text-[var(--danger)]">
                          Couldn&rsquo;t copy automatically &mdash; copy the text manually.
                        </p>
                      ) : null}
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
            Use Settings &gt; Privacy &gt; &ldquo;Do you want search engines outside Facebook to
            link to your profile?&rdquo; to drop the profile out of results, and the &ldquo;Limit
            past posts&rdquo; tool to pull old public posts back to friends-only.
          </li>
          <li>
            Public group posts stay public whatever your profile settings say. Review the groups you
            post in before assuming a locked profile covers you.
          </li>
          <li>
            Check &ldquo;Who can look me up using the email address / phone number you provided&rdquo;,
            which is a separate setting from profile visibility.
          </li>
          <li>
            Archived snapshots survive deletion. If an old page matters, deal with the archive
            directly rather than assuming removal on Facebook is enough.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This tool only assembles search strings for you to run &mdash; it does not search, scrape or
        store anything. Use it to audit your own profile, not other people&rsquo;s. Search engines
        may keep a cached copy for a while after a page changes, and removal always depends on the
        hosting site&rsquo;s own policy.
      </p>
    </main>
  );
}
