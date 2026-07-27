"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import { RECOMMENDED_MIN_NOTICE_DAYS, planDeprecationTimeline } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  featureName: "v1 /search endpoint",
  replacement: "v2 /search endpoint",
  announceDate: "2026-08-01",
  warnAfterDays: "30",
  disableAfterDays: "120",
  removeAfterDays: "180",
};

const DASH = "—";

export default function ToolHome() {
  const [featureName, setFeatureName] = useState(DEFAULTS.featureName);
  const [replacement, setReplacement] = useState(DEFAULTS.replacement);
  const [announceDate, setAnnounceDate] = useState(DEFAULTS.announceDate);
  const [warnAfterDays, setWarnAfterDays] = useState(DEFAULTS.warnAfterDays);
  const [disableAfterDays, setDisableAfterDays] = useState(DEFAULTS.disableAfterDays);
  const [removeAfterDays, setRemoveAfterDays] = useState(DEFAULTS.removeAfterDays);
  const [copied, setCopied] = useState(false);

  const numeric = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      planDeprecationTimeline({
        featureName,
        replacement,
        announceDate,
        warnAfterDays: numeric(warnAfterDays),
        disableAfterDays: numeric(disableAfterDays),
        removeAfterDays: numeric(removeAfterDays),
      }),
    [featureName, replacement, announceDate, warnAfterDays, disableAfterDays, removeAfterDays],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.templates.announcement);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFeatureName(DEFAULTS.featureName);
    setReplacement(DEFAULTS.replacement);
    setAnnounceDate(DEFAULTS.announceDate);
    setWarnAfterDays(DEFAULTS.warnAfterDays);
    setDisableAfterDays(DEFAULTS.disableAfterDays);
    setRemoveAfterDays(DEFAULTS.removeAfterDays);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Versioning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Deprecation Timeline Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plan the four standard stages of a deprecation — announce, warn, brownout and remove —
          with concrete dates and ready-to-send communication templates.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-feature">
              What is being deprecated?
            </label>
            <input
              id="dp-feature"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={featureName}
              onChange={(event) => setFeatureName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-replacement">
              Replacement (optional)
            </label>
            <input
              id="dp-replacement"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-announce">
              Announcement date
            </label>
            <input
              id="dp-announce"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={announceDate}
              onChange={(event) => setAnnounceDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-warn">
              Warnings start (days after announce)
            </label>
            <input
              id="dp-warn"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={warnAfterDays}
              onChange={(event) => setWarnAfterDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-disable">
              Brownouts start (days after announce)
            </label>
            <input
              id="dp-disable"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={disableAfterDays}
              onChange={(event) => setDisableAfterDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-remove">
              Removal (days after announce)
            </label>
            <input
              id="dp-remove"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={removeAfterDays}
              onChange={(event) => setRemoveAfterDays(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Removal date
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.milestones[3].date}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the timeline."
                : `${result.totalDays} days of notice from announcement to removal.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the deprecation announcement template"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy announcement"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.shortNotice ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Only {result.totalDays} days of notice — below the common {RECOMMENDED_MIN_NOTICE_DAYS}-day
            floor for public surfaces. Consider a longer runway.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError
            ? [["Timeline", DASH]].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))
            : result.milestones.map((milestone) => (
                <div key={milestone.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-semibold">{milestone.label}</dt>
                    <dd className="text-right font-mono font-semibold">
                      {milestone.date}
                      <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                        +{milestone.daysFromAnnounce}d
                      </span>
                    </dd>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--muted-foreground)]">
                    {milestone.description}
                  </p>
                </div>
              ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Comms templates</h2>
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Announcement</h3>
              <div className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <pre className="text-xs leading-5 whitespace-pre">
                  <code>{result.templates.announcement}</code>
                </pre>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Runtime warning</h3>
              <div className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <pre className="text-xs leading-5 whitespace-pre">
                  <code>{result.templates.warning}</code>
                </pre>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Removal changelog entry</h3>
              <div className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <pre className="text-xs leading-5 whitespace-pre">
                  <code>{result.templates.removalChangelog}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The announce → warn → brownout → remove staging mirrors the deprecation lifecycles used by
        Node.js and large API providers (GitHub ran brownouts before removing password-based API
        authentication). Match your notice period to what your consumers can actually absorb.
      </p>
    </main>
  );
}
