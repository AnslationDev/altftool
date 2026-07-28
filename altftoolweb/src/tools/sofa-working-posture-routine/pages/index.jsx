"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sofa } from "lucide-react";

import {
  RESET_ROUTINE,
  RESET_ROUTINE_SECONDS,
  SOFA_CRITERIA,
  analyseSofaSetup,
  formatSeconds,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULT_ANSWERS = {
  screenAtEyeLevel: false,
  externalKeyboard: false,
  hipsBack: true,
  lumbarSupport: false,
  feetSupported: true,
  forearmsSupported: false,
  movesEvery30: true,
};

const DEFAULTS = {
  heightCm: "170",
  seatDepthCm: "60",
  seatHeightCm: "42",
  sessionMinutes: "120",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const cm = (value) => `${NUM.format(value)} cm`;

export default function ToolHome() {
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [seatDepthCm, setSeatDepthCm] = useState(DEFAULTS.seatDepthCm);
  const [seatHeightCm, setSeatHeightCm] = useState(DEFAULTS.seatHeightCm);
  const [sessionMinutes, setSessionMinutes] = useState(DEFAULTS.sessionMinutes);
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => analyseSofaSetup({ heightCm, seatDepthCm, seatHeightCm, sessionMinutes, answers }),
    [heightCm, seatDepthCm, seatHeightCm, sessionMinutes, answers],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setAnswers((current) => ({ ...current, [id]: !current[id] }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sofa Working Posture Routine",
      `Set-up score: ${result.score}/${result.outOf} (${result.scorePercent}%) — ${result.bandLabel}`,
      `Longest unbroken stint: ${result.maxStintMin} min`,
      `Session plan: ${result.stints} × ${NUM.format(result.stintLengthMin)} min with ${result.resets} reset routines`,
      `Reset routine: ${formatSeconds(result.resetRoutineSeconds)} each, ${formatSeconds(result.resetSeconds)} in total`,
      `Behind-the-back cushion: ${result.backCushionCm > 0 ? cm(result.backCushionCm) : "not needed"}`,
      `Seat cushion to raise you: ${result.seatCushionCm > 0 ? cm(result.seatCushionCm) : "not needed"}`,
      `Footrest: ${result.footrestCm > 0 ? cm(result.footrestCm) : "not needed"}`,
    ].join("\n");
  }, [hasError, result]);

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
    setHeightCm(DEFAULTS.heightCm);
    setSeatDepthCm(DEFAULTS.seatDepthCm);
    setSeatHeightCm(DEFAULTS.seatHeightCm);
    setSessionMinutes(DEFAULTS.sessionMinutes);
    setAnswers(DEFAULT_ANSWERS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sofa className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sofa Working Posture Routine
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sometimes the couch is the only desk available. Score what you have, get the cushion sizes
          that make a deep sofa fit your body, and split the session into stints with a timed reset
          routine between them.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Measurements</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swpr-height">
              Your height (cm)
            </label>
            <input
              id="swpr-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="220"
              step="1"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swpr-session">
              Session length (minutes)
            </label>
            <input
              id="swpr-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="720"
              step="5"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swpr-depth">
              Seat depth, front edge to backrest (cm)
            </label>
            <input
              id="swpr-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="90"
              step="1"
              value={seatDepthCm}
              onChange={(event) => setSeatDepthCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swpr-seat">
              Seat height when you sit on it (cm)
            </label>
            <input
              id="swpr-seat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="70"
              step="1"
              value={seatHeightCm}
              onChange={(event) => setSeatHeightCm(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Which of these are true right now?</h2>
        <ul className="mt-3 space-y-1">
          {SOFA_CRITERIA.map((criterion) => (
            <li key={criterion.id}>
              <label
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 py-2 text-sm"
                htmlFor={`swpr-${criterion.id}`}
              >
                <input
                  id={`swpr-${criterion.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  checked={Boolean(answers[criterion.id])}
                  onChange={() => toggle(criterion.id)}
                />
                <span>{criterion.label}</span>
              </label>
            </li>
          ))}
        </ul>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Set-up score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.score}/${result.outOf}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : `${result.bandLabel} · get up at least every ${result.maxStintMin} minutes`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy sofa posture plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Set-up score ${result.scorePercent} percent`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.scorePercent))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {result.scorePercent}% of the seven set-up criteria met
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Cushion behind your back",
              hasError
                ? DASH
                : result.backCushionCm > 0
                  ? `${cm(result.backCushionCm)} thick`
                  : "Not needed",
            ],
            [
              "Firm cushion under you",
              hasError
                ? DASH
                : result.seatCushionCm > 0
                  ? `${cm(result.seatCushionCm)} thick`
                  : "Not needed",
            ],
            [
              "Footrest height",
              hasError ? DASH : result.footrestCm > 0 ? cm(result.footrestCm) : "Not needed",
            ],
            ["Seat depth your body needs", hasError ? DASH : cm(result.neededDepthCm)],
            [
              "Session split",
              hasError ? DASH : `${result.stints} × ${NUM.format(result.stintLengthMin)} min`,
            ],
            [
              "Reset routines",
              hasError
                ? DASH
                : `${result.resets} × ${formatSeconds(result.resetRoutineSeconds)} = ${formatSeconds(result.resetSeconds)}`,
            ],
            [
              "Total time including resets",
              hasError ? DASH : `${NUM.format(result.totalWithResetsMin)} min`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.unmet.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Fix these first</h2>
          <ol className="mt-3 space-y-3">
            {result.unmet.map((criterion, index) => (
              <li key={criterion.id} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{criterion.fix}</p>
                  <p className="mt-0.5 text-sm leading-6 text-[var(--muted-foreground)]">
                    {criterion.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Reset routine — {formatSeconds(RESET_ROUTINE_SECONDS)}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Move
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Time
                </th>
                <th scope="col" className="py-2 font-semibold">
                  How
                </th>
              </tr>
            </thead>
            <tbody>
              {RESET_ROUTINE.map((step) => (
                <tr key={step.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{step.name}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {formatSeconds(step.seconds)}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{step.cue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Cushion sizes come from 50th-percentile adult body proportions and are a
        starting point, not a prescription. Stop any stretch that causes pain, and see a
        physiotherapist or doctor about back or neck pain that lasts more than a couple of weeks or
        comes with numbness, tingling or weakness.
      </p>
    </main>
  );
}
