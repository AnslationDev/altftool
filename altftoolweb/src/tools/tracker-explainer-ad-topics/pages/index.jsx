"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw } from "lucide-react";
import {
  buildResetPlan,
  CONTROL_LEVELS,
  MAX_INTERVAL_DAYS,
  MIN_INTERVAL_DAYS,
  PATH_NOTE,
  PLATFORMS,
  SENSITIVE_CATEGORY_NOTE,
  SIGNAL_SOURCES,
} from "../lib";

const DASH = "—";

const DEFAULT_PLATFORMS = ["chrome-topics", "google-account", "meta", "apple"];
const DEFAULT_INTERVAL = "90";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_PLATFORMS);
  const [interval, setIntervalDays] = useState(DEFAULT_INTERVAL);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const result = useMemo(
    () =>
      buildResetPlan({
        platformIds: selected,
        intervalDays: interval.trim() === "" ? Number.NaN : Number(interval),
      }),
    [selected, interval],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Ad topic reset plan",
      `${result.platformCount} platforms, ${result.totalSteps} steps, about ${result.minutesPerRound} minutes per round.`,
      `Every ${result.intervalDays} days = ${result.roundsPerYear} rounds a year, roughly ${result.hoursPerYear} hours.`,
      `${result.fullOptOutCount} allow a full opt-out; ${result.partialOnlyCount} only let you mute individual topics.`,
      "",
    ];
    result.platforms.forEach((platform) => {
      lines.push(`${platform.name} — ${platform.path}`);
      platform.steps.forEach((step, index) => lines.push(`  ${index + 1}. ${step}`));
      lines.push(`  Catch: ${platform.catch}`);
      lines.push("");
    });
    lines.push(
      "Remember: turning off personalisation changes how ads are chosen. It does not reduce how many you see.",
    );
    return lines.join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSelected(DEFAULT_PLATFORMS);
    setIntervalDays(DEFAULT_INTERVAL);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Tracking literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Ad Topic Profile Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An ad topic is a label a platform infers about you so advertisers can buy an audience
          without buying your name. Pick the platforms you use and get the settings area, the
          steps, and the catch for each one.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where do your ad topics live?</h2>
        <div className="mt-4 space-y-2">
          {PLATFORMS.map((platform) => (
            <label
              key={platform.id}
              htmlFor={`at-${platform.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
            >
              <input
                id={`at-${platform.id}`}
                type="checkbox"
                checked={selected.includes(platform.id)}
                onChange={() => toggle(platform.id)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {platform.name}
                  <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                    {platform.kind} · {CONTROL_LEVELS[platform.control].label}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                  {platform.inference}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="at-interval">
              How often will you redo this? (days)
            </label>
            <input
              id="at-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_INTERVAL_DAYS}
              max={MAX_INTERVAL_DAYS}
              step="1"
              value={interval}
              onChange={(event) => {
                setIntervalDays(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {[30, 90, 180, 365].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setIntervalDays(String(preset));
                  setCopied(false);
                }}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset}d
              </button>
            ))}
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Time this costs you
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.minutesPerRound} min`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `per round across ${result.platformCount} platforms — about ${result.hoursPerYear} hours a year at this interval`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the ad topic reset checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the planner to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Platforms selected", hasError ? DASH : String(result.platformCount)],
            ["Steps in the checklist", hasError ? DASH : String(result.totalSteps)],
            ["Rounds per year", hasError ? DASH : `${result.roundsPerYear} (every ${result.intervalDays} days)`],
            [
              "Full opt-out available",
              hasError
                ? DASH
                : `${result.fullOptOutCount} of ${result.platformCount} (${result.coveragePercent}%)`,
            ],
            ["Mute-only platforms", hasError ? DASH : String(result.partialOnlyCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Your reset checklist</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{PATH_NOTE}</p>
          <div className="mt-4 space-y-4">
            {result.platforms.map((platform) => (
              <article
                key={platform.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <h3 className="text-sm font-semibold">{platform.name}</h3>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Go to: {platform.path}
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6">
                  {platform.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  How long it lasts: {platform.retention}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  The catch: {platform.catch}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What feeds an ad topic profile</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {SIGNAL_SOURCES.map((source) => (
            <div key={source.id} className="py-2.5">
              <dt className="font-semibold">
                {source.label}
                {source.surprising && (
                  <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    Often unexpected
                  </span>
                )}
              </dt>
              <dd className="mt-0.5 text-[var(--muted-foreground)]">{source.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Sensitive categories</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {SENSITIVE_CATEGORY_NOTE}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only. Settings labels and available controls differ by country, account type
        and app version, and change often — treat the paths here as a starting point and confirm
        against the platform&apos;s own help pages.
      </p>
    </main>
  );
}
