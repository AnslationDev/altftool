"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileClock, Plus, RotateCcw, Trash2 } from "lucide-react";

import { CHANGE_TYPES, generateChangelog } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const SELECT_CLASS = INPUT_CLASS;
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ENTRIES = [
  {
    id: "e1",
    type: "added",
    summary: "Idempotency-Key header accepted on every POST endpoint",
    endpoint: "POST /v2/payments",
    breaking: false,
    migration: "",
  },
  {
    id: "e2",
    type: "removed",
    summary: "Legacy card detach route",
    endpoint: "DELETE /v1/cards/{id}",
    breaking: true,
    migration: "Call POST /v1/cards/{id}/detach instead.",
  },
  {
    id: "e3",
    type: "deprecated",
    summary: "`amount_cents` field replaced by `amount` in minor units",
    endpoint: "GET /v2/payments/{id}",
    breaking: false,
    migration: "Sunset date 2027-01-31; read the new field from today.",
  },
];

const DEFAULTS = {
  apiName: "Payments API",
  currentVersion: "1.4.2",
  releaseDate: "2026-08-14",
  compareBaseUrl: "https://github.com/acme/payments",
  overrideLevel: "auto",
  unreleased: false,
};

export default function ToolHome() {
  const [apiName, setApiName] = useState(DEFAULTS.apiName);
  const [currentVersion, setCurrentVersion] = useState(DEFAULTS.currentVersion);
  const [releaseDate, setReleaseDate] = useState(DEFAULTS.releaseDate);
  const [compareBaseUrl, setCompareBaseUrl] = useState(DEFAULTS.compareBaseUrl);
  const [overrideLevel, setOverrideLevel] = useState(DEFAULTS.overrideLevel);
  const [unreleased, setUnreleased] = useState(DEFAULTS.unreleased);
  const [entries, setEntries] = useState(DEFAULT_ENTRIES);
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateChangelog({
        apiName,
        currentVersion,
        releaseDate,
        compareBaseUrl,
        overrideLevel,
        includeUnreleasedHeading: unreleased,
        entries,
      }),
    [apiName, currentVersion, releaseDate, compareBaseUrl, overrideLevel, unreleased, entries],
  );

  const updateEntry = (id, patch) => {
    setEntries((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addEntry = () => {
    const id = `e${nextId}`;
    setNextId((value) => value + 1);
    setEntries((list) => [
      ...list,
      { id, type: "added", summary: "", endpoint: "", breaking: false, migration: "" },
    ]);
  };

  const removeEntry = (id) => setEntries((list) => list.filter((item) => item.id !== id));

  const copyResult = async () => {
    if (!result.markdown) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setApiName(DEFAULTS.apiName);
    setCurrentVersion(DEFAULTS.currentVersion);
    setReleaseDate(DEFAULTS.releaseDate);
    setCompareBaseUrl(DEFAULTS.compareBaseUrl);
    setOverrideLevel(DEFAULTS.overrideLevel);
    setUnreleased(DEFAULTS.unreleased);
    setEntries(DEFAULT_ENTRIES);
    setNextId(4);
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileClock className="h-4 w-4" aria-hidden="true" />
          Release notes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">API Changelog Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List what changed, and get a Keep a Changelog 1.1.0 section with the correct Semantic
          Versioning bump, breaking-change callouts and a compare link.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-name">
              API name
            </label>
            <input
              id="cl-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={apiName}
              onChange={(event) => setApiName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-version">
              Current version (SemVer)
            </label>
            <input
              id="cl-version"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="decimal"
              value={currentVersion}
              onChange={(event) => setCurrentVersion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-date">
              Release date
            </label>
            <input
              id="cl-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={releaseDate}
              onChange={(event) => setReleaseDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cl-level">
              Version bump
            </label>
            <select
              id="cl-level"
              className={`mt-2 ${SELECT_CLASS}`}
              value={overrideLevel}
              onChange={(event) => setOverrideLevel(event.target.value)}
            >
              <option value="auto">Auto (from the changes below)</option>
              <option value="major">Force major</option>
              <option value="minor">Force minor</option>
              <option value="patch">Force patch</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cl-compare">
              Repository URL for the compare link (optional)
            </label>
            <input
              id="cl-compare"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={compareBaseUrl}
              onChange={(event) => setCompareBaseUrl(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="cl-unreleased"
        >
          <input
            id="cl-unreleased"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={unreleased}
            onChange={(event) => setUnreleased(event.target.checked)}
          />
          Keep an empty <code>[Unreleased]</code> heading at the top
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Changes in this release</h2>
          <button type="button" onClick={addEntry} className={GHOST_BTN} aria-label="Add a change">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add change
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cl-type-${entry.id}`}>
                    Type
                  </label>
                  <select
                    id={`cl-type-${entry.id}`}
                    className={`mt-2 ${SELECT_CLASS}`}
                    value={entry.type}
                    onChange={(event) => updateEntry(entry.id, { type: event.target.value })}
                  >
                    {CHANGE_TYPES.map((type) => (
                      <option key={type.key} value={type.key}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cl-endpoint-${entry.id}`}>
                    Endpoint or field (optional)
                  </label>
                  <input
                    id={`cl-endpoint-${entry.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={entry.endpoint}
                    onChange={(event) => updateEntry(entry.id, { endpoint: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`cl-summary-${entry.id}`}>
                    What changed
                  </label>
                  <input
                    id={`cl-summary-${entry.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={entry.summary}
                    onChange={(event) => updateEntry(entry.id, { summary: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`cl-migration-${entry.id}`}>
                    Migration note (optional)
                  </label>
                  <input
                    id={`cl-migration-${entry.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={entry.migration}
                    onChange={(event) => updateEntry(entry.id, { migration: event.target.value })}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label
                  className="flex min-h-11 items-center gap-3 text-sm"
                  htmlFor={`cl-breaking-${entry.id}`}
                >
                  <input
                    id={`cl-breaking-${entry.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={Boolean(entry.breaking)}
                    onChange={(event) => updateEntry(entry.id, { breaking: event.target.checked })}
                  />
                  Not backwards compatible
                </label>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  aria-label={`Remove change ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              New version
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : result.version}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? dash : `${result.previousVersion} → ${result.version} (${result.level} bump)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated changelog markdown"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy markdown"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the changelog inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Recommended bump", result.error ? dash : result.recommendedLevel],
            ["Documented changes", result.error ? dash : String(result.stats.total)],
            ["Breaking changes", result.error ? dash : String(result.stats.breaking)],
            [
              "Sections used",
              result.error
                ? dash
                : CHANGE_TYPES.filter((type) => result.stats.counts[type.key] > 0)
                    .map((type) => `${type.label} (${result.stats.counts[type.key]})`)
                    .join(", ") || dash,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">CHANGELOG.md</h2>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {result.markdown}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Semantic Versioning treats any incompatible API change as a major bump, including a removed
        field or a narrowed response. Deprecations are announced in a minor release and only removed
        in the next major one, so consumers get a full version to migrate.
      </p>
    </main>
  );
}
