"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Moon, RotateCcw } from "lucide-react";

import {
  CONE_ADAPTATION_MINUTES,
  EYE_BREAK_DISTANCE_METRES,
  EYE_BREAK_SECONDS,
  EYE_RULE_MINUTES,
  LOW_WINDOW_BREAK_MULTIPLIER,
  ROD_ADAPTATION_MINUTES,
  buildNightShiftPlan,
  formatClock,
  formatDuration,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
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
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
  const minutes = Math.floor(safe / 60);
  return minutes > 0 ? `${minutes}m ${String(safe % 60).padStart(2, "0")}s` : `${safe}s`;
};

export default function ToolHome() {
  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("06:00");
  const [breakIntervalMinutes, setBreakIntervalMinutes] = useState(String(EYE_RULE_MINUTES));
  const [breakSeconds, setBreakSeconds] = useState(String(EYE_BREAK_SECONDS));
  const [windDownMinutes, setWindDownMinutes] = useState("60");
  const [sleepAfterShift, setSleepAfterShift] = useState(true);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const plan = useMemo(() => {
    const values = {
      breakIntervalMinutes: toNumber(breakIntervalMinutes),
      breakSeconds: toNumber(breakSeconds),
      windDownMinutes: toNumber(windDownMinutes),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter a number in every field." };
    }
    return buildNightShiftPlan({ startTime, endTime, ...values });
  }, [startTime, endTime, breakIntervalMinutes, breakSeconds, windDownMinutes]);

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Night shift eye break plan",
      `Shift: ${formatClock(plan.startMinutes)} to ${formatClock(plan.endMinutes)} (${formatDuration(plan.durationMinutes)})`,
      `Break every ${plan.interval} minutes for ${plan.restSeconds} seconds`,
      `Breaks in the shift: ${plan.breakCount}`,
      `Breaks in the 03:00-05:00 circadian low: ${plan.lowWindowBreaks} (lengthened to ${plan.restSeconds * LOW_WINDOW_BREAK_MULTIPLIER}s each)`,
      `Total eye rest: ${mmss(plan.eyeRestSeconds)}`,
      plan.windDownMinutes > 0
        ? `Screen wind-down from ${plan.windDownStartClock} (${plan.windDownMinutes} minutes)`
        : "No screen wind-down set",
      "",
      "Break times:",
    ];
    plan.breaks.forEach((item) => {
      const tags = [item.inLowWindow ? "circadian low" : "", item.inWindDown ? "wind-down" : ""]
        .filter(Boolean)
        .join(", ");
      lines.push(`  ${item.clock}  ${item.seconds}s${tags ? ` (${tags})` : ""}`);
    });
    return lines.join("\n");
  }, [hasError, plan]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copiedTimeoutRef.current = null;
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStartTime("22:00");
    setEndTime("06:00");
    setBreakIntervalMinutes(String(EYE_RULE_MINUTES));
    setBreakSeconds(String(EYE_BREAK_SECONDS));
    setWindDownMinutes("60");
    setSleepAfterShift(true);
    setCopied(false);
  };

  const lightTip = sleepAfterShift
    ? "Going straight to sleep after the shift? Wear sunglasses on the way home. Morning daylight is the strongest signal there is for shifting the body clock, and it will fight the sleep you are trying to get."
    : "Staying up after the shift? Get bright light early instead — it helps pull your clock back towards a daytime pattern.";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Overnight screen work
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Night Shift Eye Strain Timer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Puts every {EYE_RULE_MINUTES} minute eye break on the wall clock across your shift, makes
          the breaks that land in the 03:00-05:00 circadian low longer, and sets a screen wind-down
          before you finish so the last hours of light do not push your sleep further out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-start">
              Shift starts
            </label>
            <input
              id="nse-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-end">
              Shift ends
            </label>
            <input
              id="nse-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-interval">
              Break interval (minutes)
            </label>
            <input
              id="nse-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="60"
              step="5"
              value={breakIntervalMinutes}
              onChange={(event) => setBreakIntervalMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-break">
              Break length (seconds)
            </label>
            <input
              id="nse-break"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="300"
              step="5"
              value={breakSeconds}
              onChange={(event) => setBreakSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nse-winddown">
              Screen wind-down before the end (minutes)
            </label>
            <input
              id="nse-winddown"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="15"
              value={windDownMinutes}
              onChange={(event) => setWindDownMinutes(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setSleepAfterShift((value) => !value)}
              aria-pressed={sleepAfterShift}
              aria-label="Toggle whether you sleep after this shift"
              className={`${GHOST_BTN} w-full`}
            >
              {sleepAfterShift ? "Sleeping after this shift" : "Staying up after this shift"}
            </button>
          </div>
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

      <section
        role="status"
        aria-live="polite"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Eye breaks this shift
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--primary)]">
              {hasError ? DASH : WHOLE.format(plan.breakCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above."
                : `${formatClock(plan.startMinutes)} to ${formatClock(plan.endMinutes)} · ${formatDuration(plan.durationMinutes)}${plan.crossesMidnight ? ", crossing midnight" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the night shift break schedule"
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
            ["Shift length", hasError ? DASH : formatDuration(plan.durationMinutes)],
            ["Break pattern", hasError ? DASH : `every ${plan.interval} min for ${plan.restSeconds}s`],
            [
              "Time inside the 03:00-05:00 low",
              hasError ? DASH : formatDuration(plan.lowWindowMinutes),
            ],
            [
              "Breaks in the circadian low",
              hasError
                ? DASH
                : `${WHOLE.format(plan.lowWindowBreaks)} (lengthened to ${plan.restSeconds * LOW_WINDOW_BREAK_MULTIPLIER}s)`,
            ],
            ["Total eye rest", hasError ? DASH : mmss(plan.eyeRestSeconds)],
            ["Rest as a share of the shift", hasError ? DASH : `${NUM.format(plan.restSharePercent)}%`],
            [
              "Screen wind-down starts",
              hasError ? DASH : plan.windDownMinutes > 0 ? plan.windDownStartClock : "Not set",
            ],
            [
              "Breaks in the wind-down window",
              hasError ? DASH : plan.windDownMinutes > 0 ? WHOLE.format(plan.windDownBreaks) : "Not set",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !plan.followsRule && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This pattern is looser than the 20-20-20 rule, which asks for a break at least every{" "}
            {EYE_RULE_MINUTES} minutes lasting at least {EYE_BREAK_SECONDS} seconds.
          </p>
        )}

        {!hasError && !plan.coversCircadianLow && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            None of this shift falls inside the 03:00-05:00 circadian low, so no breaks have been
            lengthened.
          </p>
        )}
      </section>

      {!hasError && plan.breaks.length > 0 && (
        <section
          role="status"
          aria-live="polite"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <h2 className="text-base font-semibold">Break times</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Clock</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Into the shift</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Length</th>
                  <th scope="col" className="py-2 text-right font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {plan.breaks.map((item) => (
                  <tr key={item.offsetMinutes} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold tabular-nums">{item.clock}</td>
                    <td className="py-2 pr-3 tabular-nums text-[var(--muted-foreground)]">
                      {formatDuration(item.offsetMinutes)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{item.seconds}s</td>
                    <td
                      className={`py-2 text-right text-xs ${
                        item.inLowWindow ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {item.inLowWindow ? "Circadian low" : item.inWindDown ? "Wind-down" : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Working the night without wrecking your eyes</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {[
            `Do not stare into a black room on your break. Find something ${EYE_BREAK_DISTANCE_METRES} m away that is lit — a corridor, a lit window, a far wall — so accommodation actually relaxes.`,
            `If your workspace is dark, remember how slow dark adaptation is: the cones settle over roughly ${CONE_ADAPTATION_MINUTES} minutes and rod sensitivity keeps improving for ${ROD_ADAPTATION_MINUTES} minutes or more. Flicking repeatedly between a bright screen and darkness is what makes night work feel punishing.`,
            "Match screen brightness to the room. A bright display against a black surround makes the pupil keep readjusting; a small light behind the monitor cuts that contrast far more effectively than dimming the screen alone.",
            "Dryness is worse at night — blink rate is already down during concentration and air conditioning strips humidity. Preservative-free artificial tears are the usual first step for persistent grittiness.",
            lightTip,
          ].map((tip) => (
            <li key={tip} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Shift work carries health risks that a break schedule cannot undo, and
        light timing that suits one rotation can be wrong for another. Persistent insomnia, excessive
        sleepiness at work, or eye pain and blurred vision should be discussed with a doctor or
        occupational health service.
      </p>
    </main>
  );
}
