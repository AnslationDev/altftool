"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, GraduationCap, Pause, Play, RotateCcw } from "lucide-react";

import {
  BLOCK_KINDS,
  EYE_BREAK_DISTANCE_METRES,
  EYE_BREAK_SECONDS,
  EYE_RULE_MINUTES,
  STUDY_PRESETS,
  blockAt,
  buildStudyPlan,
  formatClock,
  formatDuration,
} from "../lib";

const WHOLE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const mmss = (seconds) => {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
};

export default function ToolHome() {
  const [presetId, setPresetId] = useState("classic");
  const [startTime, setStartTime] = useState("09:00");
  const [pomodoroMinutes, setPomodoroMinutes] = useState("25");
  const [shortBreakMinutes, setShortBreakMinutes] = useState("5");
  const [longBreakMinutes, setLongBreakMinutes] = useState("15");
  const [pomodorosPerSet, setPomodorosPerSet] = useState("4");
  const [sets, setSets] = useState("2");
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(null);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const values = {
      pomodoroMinutes: toNumber(pomodoroMinutes),
      shortBreakMinutes: toNumber(shortBreakMinutes),
      longBreakMinutes: toNumber(longBreakMinutes),
      pomodorosPerSet: toNumber(pomodorosPerSet),
      sets: toNumber(sets),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter a number in every field." };
    }
    return buildStudyPlan({ startTime, ...values });
  }, [startTime, pomodoroMinutes, shortBreakMinutes, longBreakMinutes, pomodorosPerSet, sets]);

  const hasError = Boolean(plan.error);
  const totalSeconds = hasError ? 0 : plan.totalMinutes * 60;
  const running = Boolean(anchor);

  useEffect(() => {
    if (!anchor) return undefined;
    const id = setInterval(() => {
      const next = anchor.base + (Date.now() - anchor.at) / 1000;
      setElapsed(next > totalSeconds ? totalSeconds : next);
    }, 200);
    return () => clearInterval(id);
  }, [anchor, totalSeconds]);

  useEffect(() => {
    if (anchor && elapsed >= totalSeconds) setAnchor(null);
  }, [anchor, elapsed, totalSeconds]);

  useEffect(() => {
    setAnchor(null);
    setElapsed(0);
  }, [pomodoroMinutes, shortBreakMinutes, longBreakMinutes, pomodorosPerSet, sets]);

  const current = useMemo(
    () => (hasError ? null : blockAt(plan.blocks, elapsed)),
    [hasError, plan.blocks, elapsed],
  );

  const applyPreset = (preset) => {
    setPresetId(preset.id);
    setPomodoroMinutes(String(preset.pomodoroMinutes));
    setShortBreakMinutes(String(preset.shortBreakMinutes));
    setLongBreakMinutes(String(preset.longBreakMinutes));
    setPomodorosPerSet(String(preset.pomodorosPerSet));
  };

  const toggleRun = () => {
    if (hasError) return;
    if (running) {
      setAnchor(null);
      return;
    }
    const base = elapsed >= totalSeconds ? 0 : elapsed;
    setElapsed(base);
    setAnchor({ at: Date.now(), base });
  };

  const restart = () => {
    setAnchor(null);
    setElapsed(0);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Study session with eye rest",
      `Start ${formatClock(plan.startMinutes)}, finish ${formatClock(plan.endMinutes)}${plan.crossesMidnight ? " (next day)" : ""}`,
      `${plan.totalBlocks} study blocks of ${plan.pomodoroMinutes} minutes`,
      `Short breaks: ${plan.shortBreakCount} x ${plan.shortBreakMinutes} min, long breaks: ${plan.longBreakCount} x ${plan.longBreakMinutes} min`,
      `Total: ${formatDuration(plan.totalMinutes)} (${formatDuration(plan.studyMinutes)} studying, ${formatDuration(plan.breakMinutes)} on breaks)`,
      `Mid-block eye glances: ${plan.glancesPerBlock} per block, ${plan.glanceTotal} in total`,
      `Longest unbroken near work: ${plan.longestNearWorkMinutes} minutes`,
      "",
      "Schedule:",
    ];
    plan.blocks.forEach((block) => {
      lines.push(`  ${formatClock(block.startsAt)}-${formatClock(block.endsAt)}  ${block.label}`);
    });
    return lines.join("\n");
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
    setPresetId("classic");
    setStartTime("09:00");
    setPomodoroMinutes("25");
    setShortBreakMinutes("5");
    setLongBreakMinutes("15");
    setPomodorosPerSet("4");
    setSets("2");
    setAnchor(null);
    setElapsed(0);
    setCopied(false);
  };

  const glanceDue = Boolean(current && current.glanceDue);
  const progressPercent = hasError ? 0 : Math.round(current.overallProgress * 100);

  const fields = [
    { id: "seb-pomodoro", label: "Study block (minutes)", value: pomodoroMinutes, onSet: setPomodoroMinutes, min: 5, max: 90 },
    { id: "seb-short", label: "Short break (minutes)", value: shortBreakMinutes, onSet: setShortBreakMinutes, min: 1, max: 30 },
    { id: "seb-long", label: "Long break (minutes)", value: longBreakMinutes, onSet: setLongBreakMinutes, min: 5, max: 60 },
    { id: "seb-perset", label: "Blocks before a long break", value: pomodorosPerSet, onSet: setPomodorosPerSet, min: 1, max: 8 },
    { id: "seb-sets", label: "Number of sets", value: sets, onSet: setSets, min: 1, max: 12 },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Study and eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Student Eye Break Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A 25 minute pomodoro runs five minutes past the {EYE_RULE_MINUTES} minute eye rule, so this
          adds a {EYE_BREAK_SECONDS} second glance into the distance inside each block — without
          stopping your study timer — and lays the whole revision session out on the clock.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Study pattern</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {STUDY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              aria-pressed={presetId === preset.id}
              className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                presetId === preset.id
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
              }`}
            >
              <span className="block font-semibold text-[var(--foreground)]">{preset.name}</span>
              <span className="block text-xs text-[var(--muted-foreground)]">{preset.note}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="seb-start">
              Start time
            </label>
            <input
              id="seb-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={field.min}
                max={field.max}
                step="1"
                value={field.value}
                onChange={(event) => {
                  field.onSet(event.target.value);
                  setPresetId("custom");
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              You finish at
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">
              {hasError ? DASH : formatClock(plan.endMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above."
                : `${formatDuration(plan.totalMinutes)} from ${formatClock(plan.startMinutes)}${plan.crossesMidnight ? ", running past midnight" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the study schedule"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy schedule"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Study blocks", hasError ? DASH : `${WHOLE.format(plan.totalBlocks)} x ${plan.pomodoroMinutes} min`],
            ["Breaks", hasError ? DASH : `${plan.shortBreakCount} short, ${plan.longBreakCount} long`],
            ["Time studying", hasError ? DASH : formatDuration(plan.studyMinutes)],
            ["Time on breaks", hasError ? DASH : formatDuration(plan.breakMinutes)],
            ["Study as a share of the session", hasError ? DASH : `${WHOLE.format(plan.studySharePercent)}%`],
            ["Eye glances inside each block", hasError ? DASH : WHOLE.format(plan.glancesPerBlock)],
            ["Eye glances in total", hasError ? DASH : WHOLE.format(plan.glanceTotal)],
            [
              "Longest unbroken near work",
              hasError ? DASH : `${WHOLE.format(plan.longestNearWorkMinutes)} minutes`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.blockExceedsEyeRule && (
          <p className="mt-4 rounded-md bg-[var(--primary)]/10 px-3 py-2 text-sm font-medium text-[var(--foreground)]">
            A {plan.pomodoroMinutes} minute block is longer than the {EYE_RULE_MINUTES} minute eye
            rule, so {plan.glancesPerBlock} glance{plan.glancesPerBlock === 1 ? "" : "s"} of{" "}
            {EYE_BREAK_SECONDS} seconds {plan.glancesPerBlock === 1 ? "is" : "are"} scheduled inside
            each block. Look up — do not stop studying.
          </p>
        )}
      </section>

      <section
        className={`mt-6 rounded-xl p-5 ring-1 ${
          glanceDue ? "bg-[var(--primary)]/10 ring-[var(--primary)]" : "bg-[var(--card)] ring-[var(--border)]"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {hasError ? "Timer unavailable" : current.done ? "Session complete" : current.block.label}
        </p>
        <p
          className={`mt-1 text-5xl font-semibold tabular-nums ${
            glanceDue ? "text-[var(--primary)]" : "text-[var(--foreground)]"
          }`}
        >
          {hasError || current.done ? DASH : mmss(current.remaining)}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          {glanceDue && <Eye className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />}
          {hasError
            ? "Fix the inputs above to run the session."
            : current.done
              ? "Done. Get away from the desk properly before the next session."
              : glanceDue
                ? `Look about ${EYE_BREAK_DISTANCE_METRES} m away for ${EYE_BREAK_SECONDS} seconds — keep the block running.`
                : "Keep going. The timer flags when a distance glance is due."}
        </p>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-label="Session progress"
        >
          <span
            className="block h-full bg-[var(--primary)] transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleRun}
            disabled={hasError}
            aria-label={running ? "Pause the study timer" : "Start the study timer"}
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start session"}
          </button>
          <button type="button" onClick={restart} aria-label="Restart the session" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart
          </button>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The session, block by block</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Block</th>
                  <th scope="col" className="py-2 text-right font-semibold">Eye glances</th>
                </tr>
              </thead>
              <tbody>
                {plan.blocks.map((block, index) => (
                  <tr
                    key={`${block.kind}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 tabular-nums text-[var(--muted-foreground)]">
                      {formatClock(block.startsAt)}-{formatClock(block.endsAt)}
                    </td>
                    <td
                      className={`py-2 pr-3 font-semibold ${
                        block.kind === BLOCK_KINDS.STUDY ? "" : "text-[var(--primary)]"
                      }`}
                    >
                      {block.label}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {block.glances > 0 ? block.glanceAt.map((mark) => `+${mark}m`).join(", ") : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Breaks help with the tired, dry, aching feeling of long revision days.
        Headaches or blurred vision that keep coming back during study deserve an eye test — an
        uncorrected prescription is one of the commonest reasons reading becomes uncomfortable.
      </p>
    </main>
  );
}
