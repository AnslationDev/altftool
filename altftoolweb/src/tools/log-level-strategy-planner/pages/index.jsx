"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";

import { recommendEnvironmentLevels, recommendLevel } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  isFailure: true,
  isServiceWide: false,
  wasRecovered: false,
  isSignificant: false,
  isHighVolume: false,
  costSensitive: false,
  highTraffic: false,
};

function Toggle({ id, label, checked, onChange, disabled = false }) {
  return (
    <label
      htmlFor={id}
      className={`flex min-h-11 items-center gap-3 text-sm ${disabled ? "opacity-50" : "cursor-pointer"}`}
    >
      <input
        id={id}
        type="checkbox"
        className={CHECKBOX_CLASS}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export default function ToolHome() {
  const [isFailure, setIsFailure] = useState(DEFAULTS.isFailure);
  const [isServiceWide, setIsServiceWide] = useState(DEFAULTS.isServiceWide);
  const [wasRecovered, setWasRecovered] = useState(DEFAULTS.wasRecovered);
  const [isSignificant, setIsSignificant] = useState(DEFAULTS.isSignificant);
  const [isHighVolume, setIsHighVolume] = useState(DEFAULTS.isHighVolume);
  const [costSensitive, setCostSensitive] = useState(DEFAULTS.costSensitive);
  const [highTraffic, setHighTraffic] = useState(DEFAULTS.highTraffic);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      recommendLevel({
        isFailure,
        isServiceWide,
        wasRecovered,
        isSignificant,
        isHighVolume,
      }),
    [isFailure, isServiceWide, wasRecovered, isSignificant, isHighVolume],
  );
  const hasError = Boolean(result.error);

  const envPlan = useMemo(
    () => recommendEnvironmentLevels({ costSensitive, highTraffic }),
    [costSensitive, highTraffic],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Recommended log level: ${result.level.toUpperCase()}`,
      result.rationale,
      "",
      "Per-environment minimum levels:",
      ...envPlan.environments.map((e) => `${e.env}: ${e.minLevel}`),
    ].join("\n");
  }, [hasError, result, envPlan]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setIsFailure(DEFAULTS.isFailure);
    setIsServiceWide(DEFAULTS.isServiceWide);
    setWasRecovered(DEFAULTS.wasRecovered);
    setIsSignificant(DEFAULTS.isSignificant);
    setIsHighVolume(DEFAULTS.isHighVolume);
    setCostSensitive(DEFAULTS.costSensitive);
    setHighTraffic(DEFAULTS.highTraffic);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Observability
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Log Level Strategy Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer a few questions about the event you are logging and get the right level from the
          standard trace &lt; debug &lt; info &lt; warn &lt; error &lt; fatal ladder, plus minimum
          levels per environment.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Describe the event</h2>
        <div className="mt-2 space-y-1">
          <Toggle
            id="llp-failure"
            label="It is a failure — something did not work"
            checked={isFailure}
            onChange={setIsFailure}
          />
          <Toggle
            id="llp-servicewide"
            label="It stops the whole process or service (unrecoverable)"
            checked={isServiceWide}
            onChange={setIsServiceWide}
            disabled={!isFailure}
          />
          <Toggle
            id="llp-recovered"
            label="It was recovered automatically (retry succeeded, fallback used)"
            checked={wasRecovered}
            onChange={setWasRecovered}
            disabled={!isFailure || isServiceWide}
          />
          <Toggle
            id="llp-significant"
            label="It is a significant lifecycle or business event (startup, order placed)"
            checked={isSignificant}
            onChange={setIsSignificant}
            disabled={isFailure}
          />
          <Toggle
            id="llp-volume"
            label="It would fire on every iteration, packet or row (very high volume)"
            checked={isHighVolume}
            onChange={setIsHighVolume}
            disabled={isFailure}
          />
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
              Recommended level
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold uppercase text-[var(--primary)]">
              {hasError ? "—" : result.level}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a recommendation." : result.rationale}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the log level recommendation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Visible in production by default</dt>
              <dd className="text-right font-semibold">
                {result.productionVisible ? "Yes" : "No — enabled on demand"}
              </dd>
            </div>
            {result.cautions.map((c) => (
              <div key={c} className="py-2.5">
                <dt className="text-[var(--muted-foreground)]">Caution</dt>
                <dd className="mt-1 font-medium">{c}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Minimum level per environment</h2>
        <div className="mt-3 space-y-1">
          <Toggle
            id="llp-cost"
            label="Log volume is billed or storage-constrained"
            checked={costSensitive}
            onChange={setCostSensitive}
          />
          <Toggle
            id="llp-traffic"
            label="The service handles high request volume"
            checked={highTraffic}
            onChange={setHighTraffic}
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Environment
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Minimum level
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {envPlan.environments.map((e) => (
                <tr key={e.env} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{e.env}</td>
                  <td className="py-2 pr-3 font-mono uppercase text-[var(--primary)]">{e.minLevel}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {envPlan.note}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Level semantics follow the convention shared by log4j, SLF4J, Python logging and syslog
        severities (RFC 5424). Teams differ at the edges — write the chosen rules into your
        engineering guide so reviews stay consistent.
      </p>
    </main>
  );
}
