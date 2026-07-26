"use client";

import { useMemo, useState } from "react";
import { Check, Coffee, Copy, RotateCcw, Timer } from "lucide-react";

const MINUTES_PER_DAY = 1440;
const MAX_BLOCKS = 200;

const DEFAULTS = {
  startTime: "09:00",
  windowHours: "3",
  windowMinutes: "0",
  focusLength: "25",
  shortBreak: "5",
  longBreak: "15",
  sessionsBeforeLong: "4",
};

const PRESETS = [
  { label: "Classic 25 / 5", focusLength: "25", shortBreak: "5", longBreak: "15", sessionsBeforeLong: "4" },
  { label: "Deep work 50 / 10", focusLength: "50", shortBreak: "10", longBreak: "20", sessionsBeforeLong: "3" },
  { label: "Short bursts 15 / 3", focusLength: "15", shortBreak: "3", longBreak: "10", sessionsBeforeLong: "4" },
];

const intFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function parseTimeToMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(value || "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatTimeLabel(minutes) {
  const normalised = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = String(Math.floor(normalised / 60)).padStart(2, "0");
  const mins = String(normalised % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

function formatClock(totalMinutes) {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function toNumber(value) {
  if (typeof value !== "string") return Number.NaN;
  if (value.trim() === "") return 0;
  return Number(value);
}

export default function ToolHome() {
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [windowHours, setWindowHours] = useState(DEFAULTS.windowHours);
  const [windowMinutes, setWindowMinutes] = useState(DEFAULTS.windowMinutes);
  const [focusLength, setFocusLength] = useState(DEFAULTS.focusLength);
  const [shortBreak, setShortBreak] = useState(DEFAULTS.shortBreak);
  const [longBreak, setLongBreak] = useState(DEFAULTS.longBreak);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(DEFAULTS.sessionsBeforeLong);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const start = parseTimeToMinutes(startTime);
    if (start === null) {
      return { error: "Enter a start time in 24-hour HH:MM format." };
    }

    const hours = toNumber(windowHours);
    const mins = toNumber(windowMinutes);
    const focus = toNumber(focusLength);
    const shortLen = toNumber(shortBreak);
    const longLen = toNumber(longBreak);
    const cycle = toNumber(sessionsBeforeLong);

    const numbers = [hours, mins, focus, shortLen, longLen, cycle];
    if (numbers.some((value) => !Number.isFinite(value))) {
      return { error: "Every field needs a valid number." };
    }
    if (numbers.some((value) => value < 0)) {
      return { error: "Values cannot be negative." };
    }

    const windowTotal = hours * 60 + mins;
    if (windowTotal <= 0) {
      return { error: "Set how much time you have available — hours, minutes, or both." };
    }
    if (focus <= 0) {
      return { error: "A focus session must be at least 1 minute long." };
    }
    if (cycle < 1) {
      return { error: "Set at least 1 focus session before a long break." };
    }
    if (focus > windowTotal) {
      return {
        error: `A ${intFormatter.format(focus)} minute focus session does not fit in your ${formatClock(
          windowTotal,
        )} window. Shorten the session or add more time.`,
      };
    }

    const cycleLength = Math.floor(cycle);
    const blocks = [];
    let cursor = 0;
    let sessionCount = 0;

    while (cursor + focus <= windowTotal && blocks.length < MAX_BLOCKS) {
      sessionCount += 1;
      blocks.push({
        kind: "focus",
        label: `Focus ${sessionCount}`,
        minutes: focus,
        start: cursor,
        end: cursor + focus,
      });
      cursor += focus;

      const isLongBreak = sessionCount % cycleLength === 0;
      const breakLength = isLongBreak ? longLen : shortLen;

      if (cursor + focus > windowTotal) break; // no room for another session, so no trailing break
      if (breakLength > 0) {
        // Trim the break if a full one would push the next session out of the window.
        const available = windowTotal - cursor - focus;
        const scheduled = Math.min(breakLength, available);
        if (scheduled < 1) break; // not even a one minute break fits before the next session
        blocks.push({
          kind: isLongBreak ? "long" : "short",
          label:
            scheduled < breakLength
              ? `${isLongBreak ? "Long break" : "Short break"} (trimmed)`
              : isLongBreak
                ? "Long break"
                : "Short break",
          minutes: scheduled,
          start: cursor,
          end: cursor + scheduled,
        });
        cursor += scheduled;
      }
    }

    const focusMinutes = blocks
      .filter((block) => block.kind === "focus")
      .reduce((sum, block) => sum + block.minutes, 0);
    const breakMinutes = blocks
      .filter((block) => block.kind !== "focus")
      .reduce((sum, block) => sum + block.minutes, 0);
    const leftover = windowTotal - cursor;

    return {
      error: null,
      blocks,
      sessionCount,
      focusMinutes,
      breakMinutes,
      leftover,
      windowTotal,
      startMinutes: start,
      finishMinutes: start + cursor,
      focusShare: (focusMinutes / windowTotal) * 100,
      longBreaks: blocks.filter((block) => block.kind === "long").length,
    };
  }, [startTime, windowHours, windowMinutes, focusLength, shortBreak, longBreak, sessionsBeforeLong]);

  const report = useMemo(() => {
    if (plan.error) return "";
    return [
      "Pomodoro Session Plan",
      `Window: ${formatTimeLabel(plan.startMinutes)} to ${formatTimeLabel(plan.startMinutes + plan.windowTotal)} (${formatClock(plan.windowTotal)})`,
      "",
      ...plan.blocks.map(
        (block) =>
          `${formatTimeLabel(plan.startMinutes + block.start)}-${formatTimeLabel(
            plan.startMinutes + block.end,
          )}  ${block.label} (${intFormatter.format(block.minutes)} min)`,
      ),
      "",
      `Focus sessions: ${plan.sessionCount}`,
      `Focus time: ${formatClock(plan.focusMinutes)}`,
      `Break time: ${formatClock(plan.breakMinutes)}`,
      `Unused time: ${formatClock(plan.leftover)}`,
    ].join("\n");
  }, [plan]);

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setStartTime(DEFAULTS.startTime);
    setWindowHours(DEFAULTS.windowHours);
    setWindowMinutes(DEFAULTS.windowMinutes);
    setFocusLength(DEFAULTS.focusLength);
    setShortBreak(DEFAULTS.shortBreak);
    setLongBreak(DEFAULTS.longBreak);
    setSessionsBeforeLong(DEFAULTS.sessionsBeforeLong);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setFocusLength(preset.focusLength);
    setShortBreak(preset.shortBreak);
    setLongBreak(preset.longBreak);
    setSessionsBeforeLong(preset.sessionsBeforeLong);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header>
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Focus planner
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Pomodoro Session Planner</h1>
        <p className="mt-2 text-base leading-7 text-[var(--muted-foreground)]">
          Tell it how long you have and how you like to work, and it lays out every focus block and break
          with real clock times — so you know exactly how many sessions fit before you start.
        </p>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="pom-start">
              Start time
            </label>
            <input
              id="pom-start"
              type="time"
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="pom-window-h">
                Window (hours)
              </label>
              <input
                id="pom-window-h"
                type="number"
                min="0"
                max="23"
                step="1"
                inputMode="numeric"
                value={windowHours}
                onChange={(event) => {
                  setWindowHours(event.target.value);
                  setCopied(false);
                }}
                className={`mt-2 ${inputClass}`}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="pom-window-m">
                Window (minutes)
              </label>
              <input
                id="pom-window-m"
                type="number"
                min="0"
                max="59"
                step="5"
                inputMode="numeric"
                value={windowMinutes}
                onChange={(event) => {
                  setWindowMinutes(event.target.value);
                  setCopied(false);
                }}
                className={`mt-2 ${inputClass}`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="pom-focus">
              Focus session (minutes)
            </label>
            <input
              id="pom-focus"
              type="number"
              min="1"
              max="180"
              step="5"
              inputMode="numeric"
              value={focusLength}
              onChange={(event) => {
                setFocusLength(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="pom-short">
              Short break (minutes)
            </label>
            <input
              id="pom-short"
              type="number"
              min="0"
              max="60"
              step="1"
              inputMode="numeric"
              value={shortBreak}
              onChange={(event) => {
                setShortBreak(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="pom-long">
              Long break (minutes)
            </label>
            <input
              id="pom-long"
              type="number"
              min="0"
              max="120"
              step="5"
              inputMode="numeric"
              value={longBreak}
              onChange={(event) => {
                setLongBreak(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="pom-cycle">
              Sessions before a long break
            </label>
            <input
              id="pom-cycle"
              type="number"
              min="1"
              max="12"
              step="1"
              inputMode="numeric"
              value={sessionsBeforeLong}
              onChange={(event) => {
                setSessionsBeforeLong(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold">Rhythm presets</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {plan.error ? (
        <div
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Sessions that fit
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                  {plan.sessionCount}
                  <span className="text-lg font-medium text-[var(--muted-foreground)]">
                    {" "}
                    focus block{plan.sessionCount === 1 ? "" : "s"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {formatTimeLabel(plan.startMinutes)} to {formatTimeLabel(plan.finishMinutes)} of a{" "}
                  {formatClock(plan.windowTotal)} window
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy focus schedule"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset the planner"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Total focus time", formatClock(plan.focusMinutes)],
                ["Total break time", formatClock(plan.breakMinutes)],
                ["Long breaks included", `${plan.longBreaks}`],
                ["Time left over", formatClock(plan.leftover)],
                ["Share of window spent focusing", `${decimalFormatter.format(plan.focusShare)}%`],
                ["Finishes at", formatTimeLabel(plan.finishMinutes)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {plan.leftover > 0 ? (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                {formatClock(plan.leftover)} is left at the end — use it to wrap up notes, or shorten the
                focus length to squeeze in another block.
              </p>
            ) : null}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm font-semibold">Your schedule</p>
            <ol className="mt-3 space-y-2">
              {plan.blocks.map((block, index) => (
                <li
                  key={`${block.kind}-${index}`}
                  className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                    block.kind === "focus"
                      ? "border-[var(--primary)] bg-[var(--background)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {block.kind === "focus" ? (
                      <Timer className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                    ) : (
                      <Coffee className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                    )}
                    {block.label}
                  </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {formatTimeLabel(plan.startMinutes + block.start)} –{" "}
                    {formatTimeLabel(plan.startMinutes + block.end)} ·{" "}
                    {intFormatter.format(block.minutes)} min
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}
