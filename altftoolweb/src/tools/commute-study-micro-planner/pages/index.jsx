"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrainFront } from "lucide-react";

import { planCommuteStudy } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  minutesPerLeg: "45",
  legsPerDay: "2",
  daysPerWeek: "5",
  audioSharePct: "60",
  flashcardSharePct: "30",
};

export default function ToolHome() {
  const [minutesPerLeg, setMinutesPerLeg] = useState(DEFAULTS.minutesPerLeg);
  const [legsPerDay, setLegsPerDay] = useState(DEFAULTS.legsPerDay);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek);
  const [audioSharePct, setAudioSharePct] = useState(DEFAULTS.audioSharePct);
  const [flashcardSharePct, setFlashcardSharePct] = useState(DEFAULTS.flashcardSharePct);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planCommuteStudy({
        minutesPerLeg: Number(minutesPerLeg),
        legsPerDay: Number(legsPerDay),
        daysPerWeek: Number(daysPerWeek),
        audioSharePct: Number(audioSharePct),
        flashcardSharePct: Number(flashcardSharePct),
      }),
    [minutesPerLeg, legsPerDay, daysPerWeek, audioSharePct, flashcardSharePct],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Commute study micro plan",
      `Commute: ${minutesPerLeg} min x ${legsPerDay} legs x ${daysPerWeek} days = ${NUM.format(result.weeklyCommuteMinutes)} min/week`,
      `Audio lectures: ${NUM.format(result.audio.dailyMinutes)} min/day -> ${NUM.format(result.audio.monthlyHours)} hours/month`,
      `Flashcards: ${NUM.format(result.flashcards.dailyMinutes)} min/day -> ~${result.flashcards.cardsPerDay} cards/day (${result.flashcards.cardsPerWeek}/week at ${result.flashcards.secondsPerCard}s each)`,
      `Buffer kept free: ${result.buffer.sharePct}% (${NUM.format(result.buffer.weeklyMinutes)} min/week)`,
    ].join("\n");
  }, [hasError, result, minutesPerLeg, legsPerDay, daysPerWeek]);

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
    setMinutesPerLeg(DEFAULTS.minutesPerLeg);
    setLegsPerDay(DEFAULTS.legsPerDay);
    setDaysPerWeek(DEFAULTS.daysPerWeek);
    setAudioSharePct(DEFAULTS.audioSharePct);
    setFlashcardSharePct(DEFAULTS.flashcardSharePct);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Weekly commute time", DASH],
        ["Audio lectures per day", DASH],
        ["Flashcards per day", DASH],
        ["Monthly audio hours", DASH],
      ]
    : [
        ["Weekly commute time", `${NUM.format(result.weeklyCommuteMinutes)} min`],
        ["Audio lectures per day", `${NUM.format(result.audio.dailyMinutes)} min`],
        [
          "Flashcards per day",
          `~${result.flashcards.cardsPerDay} cards (${NUM.format(result.flashcards.dailyMinutes)} min)`,
        ],
        ["Flashcards per week", `~${result.flashcards.cardsPerWeek} cards`],
        ["Monthly audio listening", `${NUM.format(result.audio.monthlyHours)} hours`],
        [
          "Buffer kept free",
          `${result.buffer.sharePct}% (${NUM.format(result.buffer.weeklyMinutes)} min/week)`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrainFront className="h-4 w-4" aria-hidden="true" />
          Working aspirants
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Commute Study Micro Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your commute is a fixed daily study block hiding in plain sight. Split it between audio
          lectures and flashcard reviews and see the real monthly hours and card counts it buys.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="csm-leg">
              One-way commute (minutes)
            </label>
            <input
              id="csm-leg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={minutesPerLeg}
              onChange={(event) => setMinutesPerLeg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csm-legs">
              Trips per day
            </label>
            <input
              id="csm-legs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              value={legsPerDay}
              onChange={(event) => setLegsPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csm-days">
              Commuting days per week
            </label>
            <input
              id="csm-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csm-audio">
              Audio lecture share (%)
            </label>
            <input
              id="csm-audio"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={audioSharePct}
              onChange={(event) => setAudioSharePct(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="csm-cards">
              Flashcard share (%)
            </label>
            <input
              id="csm-cards"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={flashcardSharePct}
              onChange={(event) => setFlashcardSharePct(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Whatever you leave unallocated stays as buffer for boarding, crowds and breath.
            </p>
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
              Study time reclaimed per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.monthlyCommuteHours)} h`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : `Total commute time per average month — ${NUM.format(result.audio.monthlyHours)} h of it goes to audio lectures under this split.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the commute study plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && !result.audioFeasible ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)]">
            Your legs are under {result.minAudioLegMinutes} minutes — too fragmented for audio
            lectures to land. Shift the split towards flashcards, which work in 30-second bursts.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Card throughput assumes ~{hasError ? 12 : result.flashcards?.secondsPerCard ?? 12} seconds
        per review, the typical spaced-repetition pace. Never study while driving or riding — this
        plan is for trains, buses and metro commutes as a passenger.
      </p>
    </main>
  );
}
