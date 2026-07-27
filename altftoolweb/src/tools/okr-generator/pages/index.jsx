"use client";

import { useMemo, useState } from "react";
import { Check, CircleDot, Copy, RotateCcw, X } from "lucide-react";

import {
  AMBITION_LEVELS,
  generateOKR,
  gradeOKR,
  MAX_KEY_RESULTS,
  MIN_KEY_RESULTS,
  OKR_DOMAINS,
  okrToText,
} from "../lib";

const DEFAULTS = {
  domain: "product",
  focus: "self-serve onboarding",
  period: "Q3 FY27",
  ambition: "stretch",
  keyResultCount: "3",
  owner: "Priya",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [domain, setDomain] = useState(DEFAULTS.domain);
  const [focus, setFocus] = useState(DEFAULTS.focus);
  const [period, setPeriod] = useState(DEFAULTS.period);
  const [ambition, setAmbition] = useState(DEFAULTS.ambition);
  const [keyResultCount, setKeyResultCount] = useState(DEFAULTS.keyResultCount);
  const [owner, setOwner] = useState(DEFAULTS.owner);
  const [progress, setProgress] = useState({});
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateOKR({
        domain,
        focus,
        period,
        ambition,
        keyResultCount: toNumber(keyResultCount),
        owner,
      }),
    [domain, focus, period, ambition, keyResultCount, owner],
  );

  const hasError = Boolean(result.error);

  const grade = useMemo(() => {
    if (hasError) return { error: "No key results to grade yet." };
    const rows = result.keyResults.map((kr) => ({
      baseline: kr.baseline,
      target: kr.target,
      current: progress[kr.id] === undefined ? kr.baseline : toNumber(progress[kr.id]),
    }));
    return gradeOKR(rows);
  }, [hasError, result, progress]);

  const summary = useMemo(() => (hasError ? "" : okrToText(result)), [hasError, result]);

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
    setDomain(DEFAULTS.domain);
    setFocus(DEFAULTS.focus);
    setPeriod(DEFAULTS.period);
    setAmbition(DEFAULTS.ambition);
    setKeyResultCount(DEFAULTS.keyResultCount);
    setOwner(DEFAULTS.owner);
    setProgress({});
    setCopied(false);
  };

  const countOptions = Array.from(
    { length: MAX_KEY_RESULTS - MIN_KEY_RESULTS + 1 },
    (_, index) => MIN_KEY_RESULTS + index,
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CircleDot className="h-4 w-4" aria-hidden="true" />
          Objectives &amp; key results
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">OKR Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a domain, name what the quarter is about, and get one qualitative objective with
          three to five numeric key results, target values derived from your ambition level, and
          initiatives to start on.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="okr-focus">
              What is this quarter about?
            </label>
            <input
              id="okr-focus"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={focus}
              placeholder="self-serve onboarding, enterprise renewals, the mobile app…"
              onChange={(event) => setFocus(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="okr-domain">
              Domain
            </label>
            <select
              id="okr-domain"
              className={`mt-2 ${INPUT_CLASS}`}
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            >
              {OKR_DOMAINS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="okr-period">
              Period
            </label>
            <input
              id="okr-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={period}
              placeholder="Q3 FY27"
              onChange={(event) => setPeriod(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="okr-ambition">
              Ambition level
            </label>
            <select
              id="okr-ambition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ambition}
              onChange={(event) => setAmbition(event.target.value)}
            >
              {AMBITION_LEVELS.map((level) => (
                <option key={level.key} value={level.key}>
                  {level.label} (+{Math.round(level.uplift * 100)}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="okr-count">
              Number of key results
            </label>
            <select
              id="okr-count"
              className={`mt-2 ${INPUT_CLASS}`}
              value={keyResultCount}
              onChange={(event) => setKeyResultCount(event.target.value)}
            >
              {countOptions.map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="okr-owner">
              Objective owner
            </label>
            <input
              id="okr-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Objective
            </p>
            <p className="mt-1 text-2xl leading-snug font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.objective}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fill in the focus and period to generate an objective."
                : `${result.owner} · ${result.domainLabel} · ${result.ambition.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated OKR to the clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy OKR"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Score right now",
              hasError || grade.error ? DASH : `${NUM.format(grade.score)} / 1.0 — ${grade.band.label}`,
            ],
            [
              "Ambition",
              hasError ? DASH : `${result.ambition.label} · target uplift ${Math.round(result.ambition.uplift * 100)}%`,
            ],
            [
              "Success line for this ambition",
              hasError ? DASH : NUM.format(result.ambition.expectedScore),
            ],
            ["Key results", hasError ? DASH : String(result.keyResults.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && <p className="mt-3 text-sm text-[var(--muted-foreground)]">{result.ambition.note}</p>}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Key results</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Type where each number stands today to score the objective.
          </p>
          <ul className="mt-4 space-y-4">
            {result.keyResults.map((kr, index) => (
              <li key={kr.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm font-semibold">
                  KR{index + 1}. {kr.statement}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`kr-current-${kr.id}`}>
                      Where it stands today ({kr.unit})
                    </label>
                    <input
                      id={`kr-current-${kr.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={progress[kr.id] === undefined ? String(kr.baseline) : progress[kr.id]}
                      onChange={(event) =>
                        setProgress((current) => ({ ...current, [kr.id]: event.target.value }))
                      }
                    />
                  </div>
                  <dl className="grid content-end gap-1 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--muted-foreground)]">Start</dt>
                      <dd className="font-semibold">{kr.baseline} {kr.unit}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--muted-foreground)]">Target</dt>
                      <dd className="font-semibold">{kr.target} {kr.unit}</dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Suggested initiatives</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.initiatives.map((initiative) => (
              <li key={initiative} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {initiative}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Quality checks</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.checks.map((check) => (
              <li key={check.key} className="flex items-start gap-3 rounded-md border border-[var(--border)] px-3 py-2">
                <span
                  className={
                    check.pass
                      ? "mt-0.5 text-[var(--success)]"
                      : "mt-0.5 text-[var(--danger)]"
                  }
                  aria-hidden="true"
                >
                  {check.pass ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span>
                  <span className="font-semibold">{check.label}</span>
                  <span className="sr-only">{check.pass ? " — passes" : " — fails"}</span>
                  <span className="block text-[var(--muted-foreground)]">{check.why}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Baseline numbers are typical starting points, not your data — replace them with your own
        before the OKR is committed. Grading uses the standard 0.0–1.0 scale where 0.7 is the
        success line for aspirational objectives.
      </p>
    </main>
  );
}
