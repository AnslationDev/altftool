"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";

import {
  MAX_BPM,
  MIN_BPM,
  buildTempoLadder,
  describeTempo,
  summarisePractice,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DASH = "—";
const STORAGE_KEY = "altft-metronome-practice-log-v1";

const CONTROL =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LADDER_DEFAULTS = { start: "72", target: "120", step: "6", minutes: "4" };

/** Local calendar date as YYYY-MM-DD (not UTC, so a late-night session stays on today). */
function localIso(date) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Real calendar date check — rejects silent month rollover such as 2026-02-30. */
function isValidIsoDate(text) {
  const match = typeof text === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(text) : null;
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** Mirrors the shape summarisePractice() expects, so malformed rows never enter state. */
function isValidEntryShape(entry) {
  if (!entry || typeof entry !== "object") return false;
  if (!isValidIsoDate(entry.date)) return false;
  if (typeof entry.exercise !== "string" || entry.exercise.trim() === "") return false;
  if (!Number.isFinite(Number(entry.bpm))) return false;
  if (!Number.isFinite(Number(entry.minutes))) return false;
  return true;
}

function shiftDays(iso, days) {
  const base = Date.parse(`${iso}T00:00:00Z`) + days * 86400000;
  return new Date(base).toISOString().slice(0, 10);
}

function seedEntries(todayIso) {
  return [
    { id: 1, date: shiftDays(todayIso, -2), exercise: "C major scale", bpm: 76, minutes: 12 },
    { id: 2, date: shiftDays(todayIso, -2), exercise: "Chromatic run", bpm: 68, minutes: 8 },
    { id: 3, date: shiftDays(todayIso, -1), exercise: "C major scale", bpm: 82, minutes: 15 },
    { id: 4, date: todayIso, exercise: "C major scale", bpm: 88, minutes: 15 },
    { id: 5, date: todayIso, exercise: "Chromatic run", bpm: 74, minutes: 10 },
  ];
}

export default function ToolHome() {
  const [today, setToday] = useState(null);
  const [entries, setEntries] = useState([]);
  const [nextId, setNextId] = useState(100);

  const [formDate, setFormDate] = useState("");
  const [formExercise, setFormExercise] = useState("");
  const [formBpm, setFormBpm] = useState("90");
  const [formMinutes, setFormMinutes] = useState("15");
  const [formError, setFormError] = useState("");

  const [ladderStart, setLadderStart] = useState(LADDER_DEFAULTS.start);
  const [ladderTarget, setLadderTarget] = useState(LADDER_DEFAULTS.target);
  const [ladderStep, setLadderStep] = useState(LADDER_DEFAULTS.step);
  const [ladderMinutes, setLadderMinutes] = useState(LADDER_DEFAULTS.minutes);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    const iso = localIso(new Date());
    setToday(iso);
    setFormDate(iso);

    let stored = null;
    try {
      stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      stored = null;
    }

    const validStored = Array.isArray(stored) ? stored.filter(isValidEntryShape) : [];

    if (validStored.length > 0) {
      setEntries(validStored);
      setNextId(validStored.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1);
    } else {
      const seeded = seedEntries(iso);
      setEntries(seeded);
      setNextId(seeded.length + 1);
    }
  }, []);

  useEffect(() => {
    if (today === null) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable — the log simply will not persist */
    }
  }, [entries, today]);

  const referenceDate = today || entries[entries.length - 1]?.date || "2000-01-01";
  const summary = useMemo(
    () => summarisePractice(entries, referenceDate),
    [entries, referenceDate],
  );

  const tempoInfo = useMemo(() => describeTempo(Number(formBpm), 4), [formBpm]);
  const ladder = useMemo(
    () =>
      buildTempoLadder({
        startBpm: Number(ladderStart),
        targetBpm: Number(ladderTarget),
        stepBpm: Number(ladderStep),
        minutesPerStep: Number(ladderMinutes),
      }),
    [ladderStart, ladderTarget, ladderStep, ladderMinutes],
  );

  const failed = Boolean(summary.error);
  const empty = !failed && summary.isEmpty;

  const addEntry = (event) => {
    event.preventDefault();
    const bpm = Number(formBpm);
    const minutes = Number(formMinutes);
    const exercise = formExercise.trim();

    if (!formDate) return setFormError("Pick the date you practised.");
    if (!exercise) return setFormError("Name the exercise or passage you worked on.");
    if (!Number.isFinite(bpm) || bpm < MIN_BPM || bpm > MAX_BPM) {
      return setFormError(`Tempo must be between ${MIN_BPM} and ${MAX_BPM} BPM.`);
    }
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return setFormError("Minutes must be greater than zero.");
    }

    setFormError("");
    setEntries((list) => [...list, { id: nextId, date: formDate, exercise, bpm, minutes }]);
    setNextId((value) => value + 1);
    setFormExercise("");
    return undefined;
  };

  const removeEntry = (id) => setEntries((list) => list.filter((item) => item.id !== id));

  const reset = () => {
    if (
      !window.confirm("Reset the practice log to sample data? This clears every logged block and cannot be undone.")
    ) {
      return;
    }
    const iso = today || localIso(new Date());
    const seeded = seedEntries(iso);
    setEntries(seeded);
    setNextId(seeded.length + 1);
    setFormDate(iso);
    setFormExercise("");
    setFormBpm("90");
    setFormMinutes("15");
    setFormError("");
    setLadderStart(LADDER_DEFAULTS.start);
    setLadderTarget(LADDER_DEFAULTS.target);
    setLadderStep(LADDER_DEFAULTS.step);
    setLadderMinutes(LADDER_DEFAULTS.minutes);
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (failed || empty) return "";
    return [
      "Metronome Practice Log",
      `Range: ${summary.firstDate} to ${summary.lastDate}`,
      `Total practice: ${NUM1.format(summary.totalMinutes)} minutes (${NUM2.format(summary.totalHours)} h)`,
      `Blocks: ${summary.sessionCount} across ${summary.dayCount} days`,
      `Average per practice day: ${NUM1.format(summary.averageMinutesPerDay)} minutes`,
      `Minute-weighted average tempo: ${NUM1.format(summary.weightedAverageBpm)} BPM`,
      `Tempo range: ${summary.slowestBpm}-${summary.fastestBpm} BPM`,
      `Current streak: ${summary.currentStreak} days (longest ${summary.longestStreak})`,
      "",
      ...summary.exercises.map(
        (item) =>
          `${item.exercise}: ${NUM1.format(item.minutes)} min, ${item.firstBpm} to ${item.lastBpm} BPM (${item.bpmGain >= 0 ? "+" : ""}${item.bpmGain})`,
      ),
    ].join("\n");
  }, [failed, empty, summary]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setCopyError("");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyError("Could not copy to the clipboard. Select and copy the summary manually.");
    }
  };

  const summaryRows =
    failed || empty
      ? [
          ["Practice blocks", DASH],
          ["Days practised", DASH],
          ["Average per practice day", DASH],
          ["Weighted average tempo", DASH],
          ["Current streak", DASH],
          ["Longest streak", DASH],
        ]
      : [
          ["Practice blocks", `${summary.sessionCount}`],
          ["Days practised", `${summary.dayCount} of ${summary.spanDays} calendar days`],
          ["Average per practice day", `${NUM1.format(summary.averageMinutesPerDay)} min`],
          ["Weighted average tempo", `${NUM1.format(summary.weightedAverageBpm)} BPM`],
          ["Tempo range", `${summary.slowestBpm} – ${summary.fastestBpm} BPM`],
          ["Current streak", `${summary.currentStreak} day${summary.currentStreak === 1 ? "" : "s"}`],
          ["Longest streak", `${summary.longestStreak} days`],
          ["Best day", `${summary.bestDay.date} · ${NUM1.format(summary.bestDay.minutes)} min`],
          ["Logged range", `${summary.firstDate} to ${summary.lastDate}`],
        ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Practice tracking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Metronome Practice Log</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log the tempo and minutes for each thing you practise. The log adds up your time, tracks
          the tempo you have reached on every exercise, and plans the next metronome ladder.
        </p>
      </header>

      <form
        onSubmit={addEntry}
        className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <h2 className="text-base font-semibold">Log a practice block</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="mpl-date">
              Date
            </label>
            <input
              id="mpl-date"
              className={`mt-2 ${CONTROL}`}
              type="date"
              value={formDate}
              onChange={(event) => setFormDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mpl-exercise">
              Exercise or passage
            </label>
            <input
              id="mpl-exercise"
              className={`mt-2 ${CONTROL}`}
              type="text"
              placeholder="e.g. Bar 41-56, left hand"
              value={formExercise}
              onChange={(event) => setFormExercise(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mpl-bpm">
              Metronome tempo (BPM)
            </label>
            <input
              id="mpl-bpm"
              className={`mt-2 ${CONTROL}`}
              type="number"
              inputMode="numeric"
              min={MIN_BPM}
              max={MAX_BPM}
              step="1"
              value={formBpm}
              onChange={(event) => setFormBpm(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {tempoInfo.error
                ? tempoInfo.error
                : `${tempoInfo.marking} · one click every ${NUM2.format(tempoInfo.beatMs)} ms · ${NUM2.format(tempoInfo.barSeconds)} s per 4/4 bar`}
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="mpl-minutes">
              Minutes practised
            </label>
            <input
              id="mpl-minutes"
              className={`mt-2 ${CONTROL}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={formMinutes}
              onChange={(event) => setFormMinutes(event.target.value)}
            />
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {formError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add block
          </button>
          <button type="button" onClick={reset} aria-label="Reset the log to sample data" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </form>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total practice logged
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed || empty ? DASH : `${NUM1.format(summary.totalMinutes)} min`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the log to see totals."
                : empty
                  ? "Add your first block above to start the log."
                  : `${NUM2.format(summary.totalHours)} hours across ${summary.sessionCount} blocks`}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            disabled={failed || empty}
            aria-label={copied ? "Copied" : "Copy practice summary"}
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy summary"}
          </button>
        </div>

        {copyError && (
          <p role="status" aria-live="polite" className="mt-3 text-sm font-medium text-[var(--danger)]">
            {copyError}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {summaryRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!failed && !empty && summary.skipped > 0 && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {summary.skipped} entr{summary.skipped === 1 ? "y was" : "ies were"} ignored because a
            date, tempo or duration was missing or out of range.
          </p>
        )}
      </section>

      {!failed && !empty && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Tempo progress by exercise</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Exercise
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Minutes
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    First → last
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Gain
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.exercises.map((item) => (
                  <tr key={item.exercise} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.exercise}</td>
                    <td className="py-2 pr-3 text-right">
                      {NUM1.format(item.minutes)}
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {NUM1.format(item.shareOfMinutes)}%
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {item.firstBpm} → {item.lastBpm}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${item.bpmGain > 0 ? "text-[var(--success)]" : item.bpmGain < 0 ? "text-[var(--danger)]" : ""}`}
                    >
                      {item.bpmGain > 0 ? "+" : ""}
                      {item.bpmGain} BPM
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {entries.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Logged blocks</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Exercise
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    BPM
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Min
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">{item.date}</td>
                    <td className="py-2 pr-3">{item.exercise}</td>
                    <td className="py-2 pr-3 text-right">{item.bpm}</td>
                    <td className="py-2 pr-3 text-right">{item.minutes}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeEntry(item.id)}
                        aria-label={`Remove ${item.exercise} on ${item.date}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Next tempo ladder</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Play the passage cleanly at the slow tempo, then nudge the metronome up one step and
          repeat until you reach the target.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="mpl-ladder-start">
              Start tempo (BPM)
            </label>
            <input
              id="mpl-ladder-start"
              className={`mt-2 ${CONTROL}`}
              type="number"
              inputMode="numeric"
              min={MIN_BPM}
              max={MAX_BPM}
              value={ladderStart}
              onChange={(event) => setLadderStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mpl-ladder-target">
              Target tempo (BPM)
            </label>
            <input
              id="mpl-ladder-target"
              className={`mt-2 ${CONTROL}`}
              type="number"
              inputMode="numeric"
              min={MIN_BPM}
              max={MAX_BPM}
              value={ladderTarget}
              onChange={(event) => setLadderTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mpl-ladder-step">
              Step size (BPM)
            </label>
            <input
              id="mpl-ladder-step"
              className={`mt-2 ${CONTROL}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={ladderStep}
              onChange={(event) => setLadderStep(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="mpl-ladder-minutes">
              Minutes per step
            </label>
            <input
              id="mpl-ladder-minutes"
              className={`mt-2 ${CONTROL}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={ladderMinutes}
              onChange={(event) => setLadderMinutes(event.target.value)}
            />
          </div>
        </div>

        {ladder.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {ladder.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">
                {ladder.stepCount} rungs · {NUM1.format(ladder.totalMinutes)} minutes
              </span>{" "}
              to gain {NUM1.format(ladder.gainBpm)} BPM ({NUM1.format(ladder.gainPercent)}% faster).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ladder.steps.map((step) => (
                <span
                  key={step.index}
                  className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm font-semibold"
                >
                  {NUM1.format(step.bpm)}
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The log is stored only in this browser. Clearing site data removes it, and it does not sync
        between devices.
      </p>
    </main>
  );
}
