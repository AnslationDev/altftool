"use client";

import { useMemo, useState } from "react";
import { Bed, Check, Clock, Copy, Moon, RotateCcw, Sunrise } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULTS = {
  mode: "wake",
  wakeTime: "07:00",
  bedTime: "23:00",
  fallAsleep: 15,
  cycleLength: 90,
};

/** Cycle counts shown, best-rest first. */
const CYCLE_OPTIONS = [6, 5, 4, 3];

const QUALITY = {
  6: { label: "Ideal", tone: "success" },
  5: { label: "Recommended", tone: "success" },
  4: { label: "Short night", tone: "muted" },
  3: { label: "Bare minimum", tone: "muted" },
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** "HH:MM" -> minutes past midnight, or null when malformed. */
function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatClock(totalMinutes) {
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const date = new Date(2000, 0, 1, Math.floor(wrapped / 60), wrapped % 60);
  return timeFormatter.format(date);
}

function formatDuration(totalMinutes) {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Day offset relative to the anchor time, for "tonight / tomorrow" hints. */
function dayHint(anchorMinutes, targetMinutes, direction) {
  if (direction === "back") {
    return targetMinutes > anchorMinutes ? "previous evening" : "same day";
  }
  return targetMinutes < anchorMinutes ? "next day" : "same day";
}

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [wakeTime, setWakeTime] = useState(DEFAULTS.wakeTime);
  const [bedTime, setBedTime] = useState(DEFAULTS.bedTime);
  const [fallAsleep, setFallAsleep] = useState(String(DEFAULTS.fallAsleep));
  const [cycleLength, setCycleLength] = useState(String(DEFAULTS.cycleLength));
  const [copied, setCopied] = useState(false);

  const calculation = useMemo(() => {
    const anchorRaw = mode === "wake" ? wakeTime : bedTime;
    const anchor = parseTime(anchorRaw);
    if (anchor === null) {
      return { error: "Enter a valid time in 24-hour HH:MM format (for example 07:00)." };
    }

    const latency = Number(fallAsleep);
    if (!Number.isFinite(latency) || latency < 0 || latency > 120) {
      return { error: "Time to fall asleep must be a number between 0 and 120 minutes." };
    }

    const cycle = Number(cycleLength);
    if (!Number.isFinite(cycle) || cycle < 60 || cycle > 120) {
      return { error: "Sleep cycle length must be between 60 and 120 minutes." };
    }

    const options = CYCLE_OPTIONS.map((cycles) => {
      const sleepMinutes = cycles * cycle;
      const target =
        mode === "wake"
          ? anchor - sleepMinutes - latency
          : anchor + latency + sleepMinutes;
      return {
        cycles,
        sleepMinutes,
        time: formatClock(target),
        rawMinutes: ((Math.round(target) % 1440) + 1440) % 1440,
        hint: dayHint(anchor, ((Math.round(target) % 1440) + 1440) % 1440, mode === "wake" ? "back" : "forward"),
        quality: QUALITY[cycles],
      };
    });

    const headline = options.find((option) => option.cycles === 5) || options[0];

    return {
      error: null,
      anchor,
      anchorLabel: formatClock(anchor),
      latency,
      cycle,
      options,
      headline,
    };
  }, [mode, wakeTime, bedTime, fallAsleep, cycleLength]);

  const summary = useMemo(() => {
    if (calculation.error) return "";
    const heading =
      mode === "wake"
        ? `Sleep Cycle Calculator — bedtimes to wake at ${calculation.anchorLabel}`
        : `Sleep Cycle Calculator — wake times for a ${calculation.anchorLabel} bedtime`;
    const lines = calculation.options.map(
      (option) =>
        `${mode === "wake" ? "Go to bed" : "Wake up"} ${option.time} — ${option.cycles} cycles, ${formatDuration(
          option.sleepMinutes
        )} asleep (${option.quality.label})`
    );
    return [
      heading,
      `Cycle length: ${calculation.cycle} min · Time to fall asleep: ${calculation.latency} min`,
      "",
      ...lines,
    ].join("\n");
  }, [calculation, mode]);

  const handleCopy = async () => {
    if (!summary) return;
    const ok = await safeCopyText(summary);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleReset = () => {
    setMode(DEFAULTS.mode);
    setWakeTime(DEFAULTS.wakeTime);
    setBedTime(DEFAULTS.bedTime);
    setFallAsleep(String(DEFAULTS.fallAsleep));
    setCycleLength(String(DEFAULTS.cycleLength));
    setCopied(false);
  };

  const useCurrentTime = () => {
    const now = new Date();
    const value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    if (mode === "wake") setWakeTime(value);
    else setBedTime(value);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Moon className="h-4 w-4" aria-hidden="true" />
            Sleep timing
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sleep Cycle Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Sleep runs in roughly 90-minute cycles. Waking at the end of a cycle usually feels easier than waking
            mid-cycle, so this tool works backwards (or forwards) in whole cycles and adds the time you normally take to
            drift off.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div
              className="grid grid-cols-2 gap-2"
              role="group"
              aria-label="Choose what you want to calculate"
            >
              <button
                type="button"
                onClick={() => setMode("wake")}
                aria-pressed={mode === "wake"}
                className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === "wake"
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                I must wake at…
              </button>
              <button
                type="button"
                onClick={() => setMode("bed")}
                aria-pressed={mode === "bed"}
                className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === "bed"
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                I go to bed at…
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {mode === "wake" ? (
                <div>
                  <label htmlFor="scc-wake" className="mb-1.5 block text-sm font-semibold">
                    Wake-up time
                  </label>
                  <input
                    id="scc-wake"
                    type="time"
                    value={wakeTime}
                    onChange={(event) => setWakeTime(event.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="scc-bed" className="mb-1.5 block text-sm font-semibold">
                    Bedtime (lights out)
                  </label>
                  <input
                    id="scc-bed"
                    type="time"
                    value={bedTime}
                    onChange={(event) => setBedTime(event.target.value)}
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={useCurrentTime}
                className="min-h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Clock className="mr-2 inline h-4 w-4" aria-hidden="true" />
                Use the time right now
              </button>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="scc-latency" className="mb-1.5 block text-sm font-semibold">
                    Time to fall asleep (min)
                  </label>
                  <input
                    id="scc-latency"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="120"
                    step="1"
                    value={fallAsleep}
                    onChange={(event) => setFallAsleep(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="scc-cycle" className="mb-1.5 block text-sm font-semibold">
                    Cycle length (min)
                  </label>
                  <input
                    id="scc-cycle"
                    type="number"
                    inputMode="numeric"
                    min="60"
                    max="120"
                    step="5"
                    value={cycleLength}
                    onChange={(event) => setCycleLength(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                Most adults cycle every 90 minutes and take about 15 minutes to fall asleep. Adjust both if you know
                your own pattern.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopy}
                disabled={Boolean(calculation.error)}
                aria-label="Copy sleep schedule to clipboard"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy schedule"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {calculation.error ? (
              <div role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {calculation.error}
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  {/* The headline is the 5-cycle row, whose length follows the
                      user's cycle setting — hardcoding 7h 30m went wrong the
                      moment anyone changed it from 90 minutes. */}
                  {mode === "wake" ? "Best bedtime for a full " : "Best wake-up time for a full "}
                  {formatDuration(calculation.headline.sleepMinutes)}
                </p>
                <p className="mt-1 text-4xl font-semibold tracking-tight text-[var(--primary)] sm:text-5xl">
                  {calculation.headline.time}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {mode === "wake"
                    ? `Lights out then, and you wake at ${calculation.anchorLabel} after ${calculation.headline.cycles} complete cycles.`
                    : `Head to bed at ${calculation.anchorLabel} and you finish ${calculation.headline.cycles} complete cycles by then.`}
                </p>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[320px] border-collapse text-sm">
                    <caption className="sr-only">
                      {mode === "wake" ? "Bedtime options by number of sleep cycles" : "Wake-up options by number of sleep cycles"}
                    </caption>
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 pr-3 font-semibold">
                          {mode === "wake" ? "Go to bed" : "Wake up"}
                        </th>
                        <th scope="col" className="py-2 pr-3 font-semibold">Cycles</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">Asleep</th>
                        <th scope="col" className="py-2 font-semibold">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculation.options.map((option) => (
                        <tr
                          key={option.cycles}
                          className="border-t border-[var(--border)] align-middle"
                        >
                          <td className="py-3 pr-3">
                            <span className="inline-flex items-center gap-2 font-semibold">
                              {mode === "wake" ? (
                                <Bed className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                              ) : (
                                <Sunrise className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                              )}
                              {option.time}
                            </span>
                            {option.hint !== "same day" ? (
                              <span className="ml-1 block text-xs text-[var(--muted-foreground)] sm:ml-6">
                                {option.hint}
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3 pr-3 tabular-nums text-[var(--muted-foreground)]">{option.cycles}</td>
                          <td className="py-3 pr-3 tabular-nums text-[var(--muted-foreground)]">
                            {formatDuration(option.sleepMinutes)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                option.quality.tone === "success"
                                  ? "text-[var(--success)]"
                                  : "text-[var(--muted-foreground)]"
                              }`}
                            >
                              {option.quality.label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <dl className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm text-[var(--muted-foreground)]">
                      {mode === "wake" ? "Wake-up target" : "Bedtime"}
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums">{calculation.anchorLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm text-[var(--muted-foreground)]">Falling-asleep buffer</dt>
                    <dd className="text-sm font-semibold tabular-nums">{calculation.latency} min</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm text-[var(--muted-foreground)]">Cycle length used</dt>
                    <dd className="text-sm font-semibold tabular-nums">{calculation.cycle} min</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm text-[var(--muted-foreground)]">Adult target range</dt>
                    <dd className="text-sm font-semibold">7–9 hours</dd>
                  </div>
                </dl>

                <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                  Cycle lengths vary between people and across a night, so treat these times as a planning guide rather
                  than a medical recommendation. Persistent sleep problems are worth discussing with a clinician.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
