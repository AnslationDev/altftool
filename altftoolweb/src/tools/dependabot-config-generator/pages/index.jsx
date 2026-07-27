"use client";

import { useMemo, useState } from "react";
import { Bot, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_OPEN_PR_LIMIT,
  ECOSYSTEMS,
  INTERVALS,
  WEEK_DAYS,
  buildDependabotConfig,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const makeEntry = (ecosystem = "npm") => ({
  ecosystem,
  directory: "/",
  interval: "weekly",
  day: "monday",
  time: "",
  timezone: "",
  openPrLimit: String(DEFAULT_OPEN_PR_LIMIT),
  groupMinorPatch: true,
  ignoreMajor: false,
});

const DEFAULT_ENTRIES = [makeEntry("npm"), makeEntry("github-actions")];

export default function ToolHome() {
  const [entries, setEntries] = useState(DEFAULT_ENTRIES);
  const [copied, setCopied] = useState(false);

  const setEntry = (index, key, value) =>
    setEntries((current) =>
      current.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry)),
    );

  const addEntry = () => {
    const used = new Set(entries.map((entry) => entry.ecosystem));
    const next = ECOSYSTEMS.find((eco) => !used.has(eco.id));
    setEntries((current) => [...current, makeEntry(next ? next.id : "npm")]);
  };

  const removeEntry = (index) =>
    setEntries((current) => current.filter((_, i) => i !== index));

  const reset = () => {
    setEntries(DEFAULT_ENTRIES);
    setCopied(false);
  };

  const result = useMemo(() => buildDependabotConfig({ updates: entries }), [entries]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bot className="h-4 w-4" aria-hidden="true" />
          Dependabot
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dependabot Config Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a valid <code>.github/dependabot.yml</code> — pick your package ecosystems, set the
          update schedule, group minor and patch bumps into one PR, and ignore major versions.
        </p>
      </header>

      {entries.map((entry, index) => (
        <section
          key={index}
          className="mb-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Update entry {index + 1}</h2>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                aria-label={`Remove update entry ${index + 1}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--danger)] transition hover:border-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor={`db-eco-${index}`}>
                Package ecosystem
              </label>
              <select
                id={`db-eco-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={entry.ecosystem}
                onChange={(event) => setEntry(index, "ecosystem", event.target.value)}
              >
                {ECOSYSTEMS.map((eco) => (
                  <option key={eco.id} value={eco.id}>
                    {eco.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`db-dir-${index}`}>
                Directory (manifest location)
              </label>
              <input
                id={`db-dir-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={entry.directory}
                onChange={(event) => setEntry(index, "directory", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`db-int-${index}`}>
                Schedule interval
              </label>
              <select
                id={`db-int-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={entry.interval}
                onChange={(event) => setEntry(index, "interval", event.target.value)}
              >
                {INTERVALS.map((interval) => (
                  <option key={interval} value={interval}>
                    {interval}
                  </option>
                ))}
              </select>
            </div>
            {entry.interval === "weekly" && (
              <div>
                <label className={LABEL_CLASS} htmlFor={`db-day-${index}`}>
                  Day of week
                </label>
                <select
                  id={`db-day-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={entry.day}
                  onChange={(event) => setEntry(index, "day", event.target.value)}
                >
                  {WEEK_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={LABEL_CLASS} htmlFor={`db-time-${index}`}>
                Time (HH:MM, optional)
              </label>
              <input
                id={`db-time-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder="05:00"
                value={entry.time}
                onChange={(event) => setEntry(index, "time", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`db-tz-${index}`}>
                Timezone (IANA, optional)
              </label>
              <input
                id={`db-tz-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder="Asia/Kolkata"
                value={entry.timezone}
                onChange={(event) => setEntry(index, "timezone", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`db-limit-${index}`}>
                Open PR limit (0 disables version PRs)
              </label>
              <input
                id={`db-limit-${index}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="99"
                step="1"
                value={entry.openPrLimit}
                onChange={(event) => setEntry(index, "openPrLimit", event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={`db-group-${index}`}
            >
              <input
                id={`db-group-${index}`}
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={entry.groupMinorPatch}
                onChange={(event) => setEntry(index, "groupMinorPatch", event.target.checked)}
              />
              Group minor and patch updates into a single pull request
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={`db-major-${index}`}
            >
              <input
                id={`db-major-${index}`}
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={entry.ignoreMajor}
                onChange={(event) => setEntry(index, "ignoreMajor", event.target.checked)}
              />
              Ignore major version updates for all dependencies
            </label>
          </div>
        </section>
      ))}

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" onClick={addEntry} className={GHOST_BTN}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add ecosystem
        </button>
        <button type="button" onClick={reset} aria-label="Reset to defaults" className={GHOST_BTN}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError && (
        <p
          role="alert"
          className="mb-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated file
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              .github/dependabot.yml
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.updateCount} update entr${result.updateCount === 1 ? "y" : "ies"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            disabled={hasError}
            aria-label="Copy the generated dependabot.yml"
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy YAML"}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
          <pre className="p-4 text-xs leading-5">
            <code>{hasError ? DASH : result.yaml}</code>
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Commit the file to <code>.github/dependabot.yml</code> on your default branch — Dependabot
        picks it up automatically, no other setup needed. Security updates stay on even when the
        open PR limit is 0.
      </p>
    </main>
  );
}
