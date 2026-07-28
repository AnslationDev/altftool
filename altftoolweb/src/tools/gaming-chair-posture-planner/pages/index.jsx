"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gamepad2, RotateCcw } from "lucide-react";

import {
  BREAK_ROUTINE,
  BREAK_ROUTINE_SECONDS,
  PLAY_STYLES,
  POSTURE_BREAK_TARGET_MIN,
  formatMinutes,
  formatSeconds,
  planGamingSetup,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  heightCm: "175",
  sessionHours: "4",
  matchMinutes: "20",
  deskHeightCm: "75",
  playStyle: "competitive",
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
  const [sessionHours, setSessionHours] = useState(DEFAULTS.sessionHours);
  const [matchMinutes, setMatchMinutes] = useState(DEFAULTS.matchMinutes);
  const [deskHeightCm, setDeskHeightCm] = useState(DEFAULTS.deskHeightCm);
  const [playStyle, setPlayStyle] = useState(DEFAULTS.playStyle);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => planGamingSetup({ heightCm, sessionHours, matchMinutes, deskHeightCm, playStyle }),
    [heightCm, sessionHours, matchMinutes, deskHeightCm, playStyle],
  );

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Gaming Chair Posture Planner",
      `Style: ${plan.styleLabel}`,
      `Seat height: ${cm(plan.seatHeightCm)} · Usable seat depth: ${cm(plan.seatDepthCm)}`,
      `Armrest top: ${cm(plan.armrestHeightCm)} above the floor (${cm(plan.armrestAboveSeatCm)} above the seat)`,
      `Lumbar pillow centre: ${cm(plan.lumbarApexCm)} above the seat pan`,
      `Recline while playing: ${plan.activeReclineDeg[0]}–${plan.activeReclineDeg[1]}°, relaxed ${plan.relaxedReclineDeg[0]}–${plan.relaxedReclineDeg[1]}°`,
      `Monitor top edge: ${cm(plan.monitorTopCm)} above the floor, ${plan.viewingDistanceCm[0]}–${plan.viewingDistanceCm[1]} cm away`,
      `Break every ${plan.breakIntervalMin} min (${plan.matchesPerBlock} matches): ${plan.postureBreaks} breaks in the session`,
      `Eye breaks: ${plan.eyeBreaks} · Break routine: ${formatSeconds(plan.routineSeconds)} each`,
    ].join("\n");
  }, [hasError, plan]);

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
    setSessionHours(DEFAULTS.sessionHours);
    setMatchMinutes(DEFAULTS.matchMinutes);
    setDeskHeightCm(DEFAULTS.deskHeightCm);
    setPlayStyle(DEFAULTS.playStyle);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gaming Chair Posture Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A gaming chair has more levers than most office chairs and almost everyone sets them by
          eye. These are the numbers for your height — plus a break rhythm that lands on a match
          boundary instead of mid-round.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gcpp-height">
              Your height (cm)
            </label>
            <input
              id="gcpp-height"
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
            <label className={LABEL_CLASS} htmlFor="gcpp-desk">
              Desk height, floor to surface (cm)
            </label>
            <input
              id="gcpp-desk"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="120"
              step="0.5"
              value={deskHeightCm}
              onChange={(event) => setDeskHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcpp-session">
              Session length (hours)
            </label>
            <input
              id="gcpp-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="16"
              step="0.25"
              value={sessionHours}
              onChange={(event) => setSessionHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcpp-match">
              Typical match or round (minutes)
            </label>
            <input
              id="gcpp-match"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={matchMinutes}
              onChange={(event) => setMatchMinutes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gcpp-style">
              How you play
            </label>
            <select
              id="gcpp-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={playStyle}
              onChange={(event) => setPlayStyle(event.target.value)}
            >
              {Object.entries(PLAY_STYLES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Break after every
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${plan.matchesPerBlock} matches`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your settings."
                : `${plan.breakIntervalMin} minutes of play · ${plan.postureBreaks} breaks across ${formatMinutes(plan.sessionMin)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy gaming chair settings and break plan"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Seat height (shoes on)", hasError ? DASH : cm(plan.seatHeightCm)],
            ["Usable seat depth", hasError ? DASH : cm(plan.seatDepthCm)],
            [
              "Armrest top above the floor",
              hasError
                ? DASH
                : `${cm(plan.armrestHeightCm)} (${cm(plan.armrestAboveSeatCm)} above the seat)`,
            ],
            ["Lumbar pillow centre above the seat", hasError ? DASH : cm(plan.lumbarApexCm)],
            [
              "Recline while playing",
              hasError ? DASH : `${plan.activeReclineDeg[0]}–${plan.activeReclineDeg[1]}°`,
            ],
            [
              "Recline while resting or queueing",
              hasError ? DASH : `${plan.relaxedReclineDeg[0]}–${plan.relaxedReclineDeg[1]}°`,
            ],
            ["Monitor top edge above the floor", hasError ? DASH : cm(plan.monitorTopCm)],
            [
              "Monitor distance",
              hasError ? DASH : `${plan.viewingDistanceCm[0]}–${plan.viewingDistanceCm[1]} cm`,
            ],
            [
              "Desk vs armrest height",
              hasError
                ? DASH
                : plan.deskTooHigh
                  ? `${cm(plan.deskDeltaCm)} too high`
                  : plan.deskTooLow
                    ? `${cm(Math.abs(plan.deskDeltaCm))} too low`
                    : "Matched",
            ],
            ["Eye breaks in the session", hasError ? DASH : String(plan.eyeBreaks)],
            [
              "Time spent on break routines",
              hasError ? DASH : formatSeconds(plan.totalBreakSeconds),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {plan.styleNote}
          </p>
        )}

        {!hasError && (plan.deskTooHigh || plan.deskTooLow) && (
          <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs font-medium text-[var(--warning)]">
            Your desk and armrests are {cm(Math.abs(plan.deskDeltaCm))} apart. Match them so the
            forearm is supported all the way from elbow to wrist — otherwise the armrests get in the
            way and your shoulders end up carrying the arm.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Session blocks</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The {POSTURE_BREAK_TARGET_MIN}-minute break target is rounded up to a whole number of
            matches, so no break lands in a live round.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Block
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Play time
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Matches
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    After it
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.blocks.map((block) => (
                  <tr key={block.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{block.index}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {formatMinutes(block.lengthMin)}
                    </td>
                    <td className="py-2 pr-3 text-right">{block.matches}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {block.breakAfter
                        ? `Break routine — ${formatSeconds(plan.routineSeconds)}`
                        : "End of session"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Between-match routine — {formatSeconds(BREAK_ROUTINE_SECONDS)}
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
              {BREAK_ROUTINE.map((step) => (
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
        Informational only. Every figure is a proportional estimate from 50th-percentile adult body
        dimensions and a starting point for the chair&apos;s own adjustment range — fine-tune until
        your feet are flat, your forearms are supported and your shoulders stay down. See a
        physiotherapist or doctor about wrist, elbow or neck pain that persists.
      </p>
    </main>
  );
}
