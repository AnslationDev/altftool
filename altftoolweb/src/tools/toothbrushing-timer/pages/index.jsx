"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Timer } from "lucide-react";

import {
  ALLOWED_SEGMENTS,
  BRUSH_LIFE_DAYS,
  RECOMMENDED_SECONDS,
  buildBrushingPlan,
  formatClock,
  segmentAtSecond,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  totalSeconds: "120",
  segments: "4",
  ageYears: "30",
  sessionsPerDay: "2",
};

const todayIso = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export default function ToolHome() {
  const [totalSeconds, setTotalSeconds] = useState(DEFAULTS.totalSeconds);
  const [segments, setSegments] = useState(DEFAULTS.segments);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [sessionsPerDay, setSessionsPerDay] = useState(DEFAULTS.sessionsPerDay);
  const [brushStartDate, setBrushStartDate] = useState(todayIso);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildBrushingPlan({
        totalSeconds: Number(totalSeconds),
        segments: Number(segments),
        ageYears: Number(ageYears),
        sessionsPerDay: Number(sessionsPerDay),
        brushStartDate,
      }),
    [totalSeconds, segments, ageYears, sessionsPerDay, brushStartDate],
  );

  const ok = !plan.error;
  const target = ok ? plan.totalSeconds : 0;

  // Wall-clock timer: anchor to a real timestamp on start/resume instead of
  // counting fired setInterval callbacks, so a backgrounded tab or locked
  // screen (which browsers throttle/suspend) can't make the timer drift
  // slower than real time. `elapsed` is re-derived from Date.now() on every
  // tick and immediately resynced when the tab becomes visible again.
  const timeBaseRef = useRef({ startedAtMs: 0, baseElapsedMs: 0 });

  useEffect(() => {
    if (!running || !ok) return undefined;
    timeBaseRef.current = { startedAtMs: Date.now(), baseElapsedMs: elapsed * 1000 };
    const tick = () => {
      const { startedAtMs, baseElapsedMs } = timeBaseRef.current;
      const elapsedMs = baseElapsedMs + (Date.now() - startedAtMs);
      setElapsed(Math.min(target, Math.floor(elapsedMs / 1000)));
    };
    const id = setInterval(tick, 1000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // `elapsed`/`target` are intentionally read once to seed the wall-clock
    // baseline when a run starts; re-running per tick would defeat the fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, ok]);

  useEffect(() => {
    if (ok && elapsed >= target && running) setRunning(false);
  }, [ok, elapsed, target, running]);

  // Gate the "active zone" on whether the session has actually started
  // (running, or resumed with elapsed > 0) — not merely on `elapsed`, which
  // is 0 both before Start is pressed and mid-session; without this guard
  // the UI pre-highlights zone 1 as in-progress on every fresh mount.
  const started = running || elapsed > 0;
  const current = ok && started ? segmentAtSecond(plan.schedule, elapsed) : null;
  const finished = ok && elapsed >= target;
  const remaining = ok ? Math.max(0, target - elapsed) : 0;
  const zoneRemaining = current ? current.endSecond - elapsed : 0;
  const progressPct = ok && target > 0 ? Math.min(100, (elapsed / target) * 100) : 0;

  // Announcement text intentionally excludes the per-second countdown (zoneRemaining) so
  // assistive tech only hears an update when the zone actually changes or the session
  // finishes, not once a second.
  const zoneAnnouncement = !ok
    ? ""
    : finished
      ? "Brushing finished. Spit out — do not rinse."
      : current
        ? `Now brushing: ${current.zone}. ${current.detail}.`
        : "Ready to start.";

  const restart = () => {
    setElapsed(0);
    setRunning(false);
  };

  const changeConfig = (setter) => (event) => {
    setter(event.target.value);
    setElapsed(0);
    setRunning(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Brushing plan — ${plan.totalSeconds} seconds across ${plan.segments} zones`,
      ...plan.schedule.map(
        (segment) => `${formatClock(segment.startSecond)}–${formatClock(segment.endSecond)}  ${segment.zone} (${segment.seconds}s) — ${segment.cue}`,
      ),
      "",
      `Toothpaste: ${plan.fluoride.amount}, ${plan.fluoride.ppm}`,
      `${plan.sessionsPerDay} sessions a day = ${plan.weeklyMinutes.toFixed(0)} minutes of brushing a week`,
      plan.replaceBy ? `Replace this brush head by ${plan.replaceBy}` : "",
      "",
      ...plan.afterBrushing.map((item) => `- ${item}`),
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, plan]);

  const copyPlan = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const resetAll = () => {
    setTotalSeconds(DEFAULTS.totalSeconds);
    setSegments(DEFAULTS.segments);
    setAgeYears(DEFAULTS.ageYears);
    setSessionsPerDay(DEFAULTS.sessionsPerDay);
    setBrushStartDate(todayIso());
    setElapsed(0);
    setRunning(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Dental care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Toothbrushing Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {RECOMMENDED_SECONDS} seconds, split evenly across the mouth so no quadrant gets skipped,
          with modified Bass technique cues and the right amount of fluoride toothpaste for the age.
        </p>
      </header>

      {plan.error && (
        <p role="alert" className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {plan.error}
        </p>
      )}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {zoneAnnouncement}
        </p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {finished ? "Done" : current ? current.zone : "Ready"}
            </p>
            <p className="mt-1 text-5xl font-semibold tabular-nums text-[var(--primary)]">
              {ok ? formatClock(remaining) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {!ok
                ? "Fix the error above to start the timer."
                : finished
                  ? "Spit out — do not rinse."
                  : current
                    ? `${zoneRemaining}s left in this zone · ${current.detail}`
                    : "Press start when the brush is on the teeth."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={!ok || finished}
              aria-label={running ? "Pause the brushing timer" : "Start the brushing timer"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </button>
            <button type="button" onClick={restart} aria-label="Restart the timer at zero" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restart
            </button>
          </div>
        </div>

        <div
          className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPct)}
          aria-label="Brushing session progress"
        >
          <span className="block h-full bg-[var(--primary)]" style={{ width: `${progressPct}%` }} />
        </div>

        {ok && (
          <ol className="mt-5 grid gap-2">
            {plan.schedule.map((segment) => {
              const done = elapsed >= segment.endSecond;
              const active = current && current.index === segment.index;
              return (
                <li
                  key={segment.index}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done || active
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {segment.index + 1}
                  </span>
                  <span className="flex-1">
                    <span className={`block font-semibold ${done ? "opacity-60" : ""}`}>
                      {segment.zone} · {segment.seconds}s
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">{segment.cue}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--muted-foreground)]">
                    {formatClock(segment.startSecond)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Set up the session</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-seconds">
              Total brushing time (seconds)
            </label>
            <input
              id="tb-seconds"
              type="number"
              inputMode="numeric"
              min="30"
              max="600"
              step="10"
              className={`mt-2 ${INPUT_CLASS}`}
              value={totalSeconds}
              onChange={changeConfig(setTotalSeconds)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-segments">
              Split the mouth into
            </label>
            <select id="tb-segments" className={`mt-2 ${INPUT_CLASS}`} value={segments} onChange={changeConfig(setSegments)}>
              {ALLOWED_SEGMENTS.map((count) => (
                <option key={count} value={String(count)}>
                  {count} zones
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-age">
              Age of the person brushing
            </label>
            <input
              id="tb-age"
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-sessions">
              Brushing sessions a day
            </label>
            <input
              id="tb-sessions"
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sessionsPerDay}
              onChange={(event) => setSessionsPerDay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tb-brush-date">
              Started using this brush head on
            </label>
            <input
              id="tb-brush-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={brushStartDate}
              onChange={(event) => setBrushStartDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-base font-semibold">Your plan</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPlan}
              disabled={!ok}
              aria-label="Copy the brushing plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={resetAll} aria-label="Reset everything to the defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Seconds per zone", ok ? plan.secondsPerZone.join(" · ") : DASH],
            ["Toothpaste amount", ok ? plan.fluoride.amount : DASH],
            ["Fluoride strength", ok ? plan.fluoride.ppm : DASH],
            ["Age guidance", ok ? plan.fluoride.label : DASH],
            ["Brushing per day", ok ? `${plan.dailySeconds} seconds` : DASH],
            ["Brushing per week", ok ? `${plan.weeklyMinutes.toFixed(0)} minutes` : DASH],
            ["Replace brush head by", ok && plan.replaceBy ? `${plan.replaceBy} (${BRUSH_LIFE_DAYS} days)` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && <p className="mt-3 text-xs text-[var(--muted-foreground)]">{plan.fluoride.note}</p>}
      </section>

      {ok && plan.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {plan.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {ok && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">After you brush</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {plan.afterBrushing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General oral-hygiene information, not personal dental advice. Fluoride amounts, brushing
        technique and recall intervals should be confirmed with your own dentist, especially for
        young children, people with dry mouth, braces or a history of decay.
      </p>
    </main>
  );
}
