"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, SkipForward, Timer, Trash2 } from "lucide-react";

import {
  SPRINT_PRESETS,
  blockProgressPercent,
  buildSchedule,
  formatDuration,
  formatMinutes,
  minutesToSeconds,
  projectSprints,
  sprintStats,
  statsToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");
const ONE_DP = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

const DEFAULTS = {
  sprintMinutes: "25",
  breakMinutes: "5",
  sprints: "4",
  longBreakEvery: "4",
  longBreakMinutes: "15",
  targetWords: "1667",
  wordsInput: "",
};

export default function ToolHome() {
  const [sprintMinutes, setSprintMinutes] = useState(DEFAULTS.sprintMinutes);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULTS.breakMinutes);
  const [sprints, setSprints] = useState(DEFAULTS.sprints);
  const [longBreakEvery, setLongBreakEvery] = useState(DEFAULTS.longBreakEvery);
  const [longBreakMinutes, setLongBreakMinutes] = useState(DEFAULTS.longBreakMinutes);
  const [targetWords, setTargetWords] = useState(DEFAULTS.targetWords);
  const [wordsInput, setWordsInput] = useState(DEFAULTS.wordsInput);
  const [log, setLog] = useState([]);
  const [blockIndex, setBlockIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const schedule = useMemo(
    () =>
      buildSchedule({
        sprintMinutes: sprintMinutes === "" ? NaN : Number(sprintMinutes),
        breakMinutes: breakMinutes === "" ? NaN : Number(breakMinutes),
        sprints: sprints === "" ? NaN : Number(sprints),
        longBreakEvery: longBreakEvery === "" ? NaN : Number(longBreakEvery),
        longBreakMinutes: longBreakMinutes === "" ? NaN : Number(longBreakMinutes),
      }),
    [sprintMinutes, breakMinutes, sprints, longBreakEvery, longBreakMinutes],
  );

  const scheduleError = Boolean(schedule.error);
  const blocks = scheduleError ? [] : schedule.blocks;
  const safeIndex = blocks.length > 0 ? Math.min(blockIndex, blocks.length - 1) : 0;
  const currentBlock = blocks[safeIndex] || null;
  const blockSeconds = currentBlock ? minutesToSeconds(currentBlock.minutes) : 0;

  // Reset the countdown whenever the block or the schedule changes.
  useEffect(() => {
    setSecondsLeft(blockSeconds);
  }, [blockSeconds, safeIndex]);

  // Settings change: go back to the top of the schedule and stop.
  const signature = `${sprintMinutes}|${breakMinutes}|${sprints}|${longBreakEvery}|${longBreakMinutes}`;
  useEffect(() => {
    setBlockIndex(0);
    setRunning(false);
  }, [signature]);

  // Tick.
  useEffect(() => {
    if (!running || secondsLeft <= 0) return undefined;
    const id = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  // Block finished: move on, or stop at the end of the session.
  useEffect(() => {
    if (!running || secondsLeft > 0 || blocks.length === 0) return;
    if (safeIndex < blocks.length - 1) {
      setBlockIndex(safeIndex + 1);
    } else {
      setRunning(false);
    }
  }, [running, secondsLeft, safeIndex, blocks.length]);

  const stats = useMemo(() => sprintStats(log), [log]);

  const measuredWpm = stats.error ? 0 : stats.overallWpm;

  const projection = useMemo(
    () =>
      projectSprints({
        targetWords: targetWords === "" ? NaN : Number(targetWords),
        wpm: measuredWpm > 0 ? measuredWpm : NaN,
        sprintMinutes: schedule.sprintMinutes ?? 25,
        breakMinutes: schedule.breakMinutes ?? 5,
        wordsSoFar: stats.error ? 0 : stats.totalWords,
      }),
    [targetWords, measuredWpm, schedule.sprintMinutes, schedule.breakMinutes, stats],
  );

  const plainText = useMemo(() => statsToText(stats, projection), [stats, projection]);

  const logSprint = () => {
    const words = Number(wordsInput);
    if (!Number.isFinite(words) || words < 0 || wordsInput === "") return;
    const minutes = schedule.sprintMinutes ?? 25;
    setLog((current) => [...current, { minutes, words: Math.round(words) }]);
    setWordsInput("");
  };

  const removeEntry = (position) => {
    setLog((current) => current.filter((_, index) => index !== position));
  };

  const copyResult = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSprintMinutes(DEFAULTS.sprintMinutes);
    setBreakMinutes(DEFAULTS.breakMinutes);
    setSprints(DEFAULTS.sprints);
    setLongBreakEvery(DEFAULTS.longBreakEvery);
    setLongBreakMinutes(DEFAULTS.longBreakMinutes);
    setTargetWords(DEFAULTS.targetWords);
    setWordsInput(DEFAULTS.wordsInput);
    setLog([]);
    setBlockIndex(0);
    setRunning(false);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setSprintMinutes(String(preset.minutes));
    setBreakMinutes(String(preset.breakMinutes));
  };

  const progressPercent = blockProgressPercent(blockSeconds, secondsLeft);

  const statRows = stats.error
    ? [
        ["Sprints logged", DASH],
        ["Words written", DASH],
        ["Time writing", DASH],
        ["Overall pace", DASH],
        ["Best sprint", DASH],
      ]
    : [
        ["Sprints logged", String(stats.count)],
        ["Words written", NUM.format(stats.totalWords)],
        ["Time writing", formatMinutes(stats.totalMinutes)],
        ["Overall pace", `${ONE_DP.format(stats.overallWpm)} words per minute`],
        ["Best sprint", `#${stats.bestSprint.index} at ${ONE_DP.format(stats.bestSprint.wpm)} wpm`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Sprint sessions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Writing Sprint Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A Pomodoro-shaped countdown for writing: sprint, break, repeat, with a longer break after
          every fourth block. Log the words you produced in each sprint and the tool works out your
          real pace and how many more sprints your target needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wst-sprint">
              Sprint length (minutes)
            </label>
            <input
              id="wst-sprint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="180"
              step="1"
              value={sprintMinutes}
              onChange={(event) => setSprintMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wst-break">
              Break length (minutes)
            </label>
            <input
              id="wst-break"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wst-count">
              Sprints in this session
            </label>
            <input
              id="wst-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="24"
              step="1"
              value={sprints}
              onChange={(event) => setSprints(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wst-longevery">
              Long break after every N sprints (0 = none)
            </label>
            <input
              id="wst-longevery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="12"
              step="1"
              value={longBreakEvery}
              onChange={(event) => setLongBreakEvery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wst-longmin">
              Long break length (minutes)
            </label>
            <input
              id="wst-longmin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={longBreakMinutes}
              onChange={(event) => setLongBreakMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wst-target">
              Word target for the day
            </label>
            <input
              id="wst-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={targetWords}
              onChange={(event) => setTargetWords(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SPRINT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {scheduleError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {schedule.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {scheduleError ? "Timer" : `${currentBlock?.label ?? "Ready"} of ${blocks.length} blocks`}
        </p>
        <p
          className="mt-1 font-mono text-6xl font-semibold tabular-nums text-[var(--primary)]"
          role="timer"
          aria-live="off"
        >
          {scheduleError ? DASH : formatDuration(secondsLeft)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]" aria-live="polite">
          {scheduleError
            ? "Fix the settings above to start the timer."
            : `${currentBlock?.kind === "sprint" ? "Write" : "Rest"} — whole session runs ${formatMinutes(schedule.totalMinutes)}`}
        </p>

        {!scheduleError && (
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <span
              className="block h-full bg-[var(--primary)] transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRunning((current) => !current)}
            disabled={scheduleError}
            aria-label={running ? "Pause the sprint timer" : "Start the sprint timer"}
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setBlockIndex((current) => Math.min(blocks.length - 1, current + 1));
            }}
            disabled={scheduleError || safeIndex >= blocks.length - 1}
            aria-label="Skip to the next block"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
            Skip
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setBlockIndex(0);
              setSecondsLeft(blocks[0] ? minutesToSeconds(blocks[0].minutes) : 0);
            }}
            disabled={scheduleError}
            aria-label="Restart the session from the first sprint"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart session
          </button>
        </div>

        {!scheduleError && (
          <div className="mt-5 overflow-x-auto">
            <ol className="flex min-w-max gap-1.5">
              {blocks.map((block, index) => (
                <li key={block.id}>
                  <span
                    className={`inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold ${
                      index === safeIndex
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : block.kind === "sprint"
                          ? "bg-[var(--muted)] text-[var(--foreground)]"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {block.kind === "sprint" ? `S${block.label.replace("Sprint ", "")}` : `${block.minutes}m`}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Log a finished sprint</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className={LABEL_CLASS} htmlFor="wst-words">
              Words written in that sprint
            </label>
            <input
              id="wst-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={wordsInput}
              onChange={(event) => setWordsInput(event.target.value)}
              placeholder="520"
            />
          </div>
          <button
            type="button"
            onClick={logSprint}
            disabled={wordsInput === "" || scheduleError}
            aria-label="Add this sprint to the log"
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            Add sprint
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your measured pace
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {stats.error ? DASH : `${ONE_DP.format(stats.overallWpm)} wpm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stats.error
                ? "Log a sprint to measure your real writing speed."
                : `${NUM.format(stats.totalWords)} words across ${stats.count} sprint${stats.count === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={Boolean(stats.error)}
              aria-label="Copy the sprint log"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy log"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset everything" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {statRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!stats.error && stats.trendPercent !== null && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            {stats.trendDirection === "up"
              ? `Your later sprints are running ${ONE_DP.format(Math.abs(stats.trendPercent))}% faster than your earlier ones.`
              : stats.trendDirection === "down"
                ? `Your later sprints are running ${ONE_DP.format(Math.abs(stats.trendPercent))}% slower — a longer break may be worth more than another sprint.`
                : "Your pace is holding steady across the session."}
          </p>
        )}

        {!stats.error && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">Logged sprints</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Sprint</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Words</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Minutes</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">wpm</th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.rows.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.index}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.words)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.minutes}</td>
                    <td className="py-2 pr-3 text-right">{ONE_DP.format(row.wpm)}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeEntry(row.index - 1)}
                        aria-label={`Remove sprint ${row.index} from the log`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What your target needs</h2>
        {projection.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {projection.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-4xl font-semibold text-[var(--primary)]">
              {projection.complete ? "Target met" : `${projection.sprintsNeeded} more`}
            </p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Target", `${NUM.format(projection.target)} words`],
                ["Written so far", `${NUM.format(projection.wordsSoFar)} words (${projection.percentDone}%)`],
                ["Still to write", `${NUM.format(projection.remaining)} words`],
                ["Words per sprint at this pace", NUM.format(Math.round(projection.wordsPerSprint))],
                ["Sprints still needed", String(projection.sprintsNeeded)],
                ["Clock time including breaks", formatMinutes(projection.clockMinutes)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The log lives in this browser tab only and is cleared when you close or reload the page —
        copy it before you leave if you want to keep it. Word counts you log are self-reported, so
        the pace figure is only as accurate as the counting.
      </p>
    </main>
  );
}
