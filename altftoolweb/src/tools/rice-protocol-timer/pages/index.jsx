"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Snowflake } from "lucide-react";

import {
  ACUTE_PHASE_HOURS,
  COMPRESSION_CHECKS,
  GAP_MAX_HOURS,
  GAP_MIN_HOURS,
  ICE_CONTRAINDICATIONS,
  ICE_DEFAULT_MINUTES,
  ICE_MAX_MINUTES,
  ICE_MIN_MINUTES,
  RED_FLAGS,
  RICE_STEPS,
  buildIceSchedule,
  cycleState,
  formatDuration,
} from "../lib";

const DASH = "—";

/** Fixed so the first server and client render match; replaced on mount. */
const FALLBACK_START_CLOCK = "08:00";

const DEFAULTS = {
  iceMinutes: String(ICE_DEFAULT_MINUTES),
  gapHours: "2",
  protocolHours: String(ACUTE_PHASE_HOURS),
  sleepClock: "23:00",
  wakeClock: "07:00",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function nowClock() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function ToolHome() {
  const [iceMinutes, setIceMinutes] = useState(DEFAULTS.iceMinutes);
  const [gapHours, setGapHours] = useState(DEFAULTS.gapHours);
  const [protocolHours, setProtocolHours] = useState(DEFAULTS.protocolHours);
  const [startClock, setStartClock] = useState(FALLBACK_START_CLOCK);
  const [sleepClock, setSleepClock] = useState(DEFAULTS.sleepClock);
  const [wakeClock, setWakeClock] = useState(DEFAULTS.wakeClock);
  const [copied, setCopied] = useState(false);

  // Timer state: an anchor epoch while running, plus banked seconds when paused.
  const [startEpoch, setStartEpoch] = useState(null);
  const [bankedSeconds, setBankedSeconds] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setStartClock(nowClock());
  }, []);

  useEffect(() => {
    if (startEpoch === null) return undefined;
    const id = setInterval(() => setTick(Date.now()), 500);
    return () => clearInterval(id);
  }, [startEpoch]);

  const elapsedSeconds =
    startEpoch === null ? bankedSeconds : bankedSeconds + Math.max(0, (tick - startEpoch) / 1000);

  const schedule = useMemo(
    () =>
      buildIceSchedule({
        startClock,
        iceMinutes: Number(iceMinutes),
        gapHours: Number(gapHours),
        protocolHours: Number(protocolHours),
        sleepClock,
        wakeClock,
      }),
    [startClock, iceMinutes, gapHours, protocolHours, sleepClock, wakeClock],
  );

  const hasError = Boolean(schedule.error);

  const state = useMemo(
    () =>
      cycleState({
        elapsedSeconds,
        iceMinutes: Number(iceMinutes),
        gapHours: Number(gapHours),
      }),
    [elapsedSeconds, iceMinutes, gapHours],
  );

  const running = startEpoch !== null;

  const startTimer = () => {
    const stamp = Date.now();
    setStartEpoch(stamp);
    setTick(stamp);
  };

  const pauseTimer = () => {
    if (startEpoch === null) return;
    setBankedSeconds(bankedSeconds + Math.max(0, (Date.now() - startEpoch) / 1000));
    setStartEpoch(null);
  };

  const resetTimer = () => {
    setStartEpoch(null);
    setBankedSeconds(0);
    setTick(0);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "RICE protocol plan",
      `Ice: ${schedule.iceMinutes} minutes on, ${schedule.offMinutes} minutes off, every ${schedule.gapHours} hours`,
      `Protocol length: ${schedule.protocolHours} hours from ${startClock}`,
      `Applications while awake: ${schedule.awakeSessions} (${schedule.totalIceMinutes} minutes of icing in total)`,
      `Applications falling during sleep: ${schedule.sleptThroughSessions} — skip these, do not set an alarm`,
      "Compression: snug elastic bandage, re-wrap if it digs in.",
      "Elevation: injured part above heart level.",
    ].join("\n");
  }, [hasError, schedule, startClock]);

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

  const resetAll = () => {
    setIceMinutes(DEFAULTS.iceMinutes);
    setGapHours(DEFAULTS.gapHours);
    setProtocolHours(DEFAULTS.protocolHours);
    setStartClock(nowClock());
    setSleepClock(DEFAULTS.sleepClock);
    setWakeClock(DEFAULTS.wakeClock);
    resetTimer();
    setCopied(false);
  };

  const isIcePhase = state.phase === "ice";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Snowflake className="h-4 w-4" aria-hidden="true" />
          Rehab and recovery
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">RICE Protocol Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rest, Ice, Compression, Elevation for a fresh sprain or strain. Run the ice-on / ice-off
          timer, and print a schedule of applications for the first {ACUTE_PHASE_HOURS} hours.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {isIcePhase ? `Ice on — cycle ${state.cycleNumber}` : `Ice off — cycle ${state.cycleNumber}`}
            </p>
            <p
              className="mt-1 text-5xl font-semibold tabular-nums text-[var(--primary)]"
              aria-live="polite"
            >
              {hasError ? DASH : formatDuration(state.remainingSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : isIcePhase
                  ? "Cold pack on, damp cloth between the pack and your skin."
                  : "Pack off. Keep it compressed and elevated until the next application."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {running ? (
              <button type="button" onClick={pauseTimer} className={PRIMARY_BTN} aria-label="Pause the timer">
                <Pause className="h-4 w-4" aria-hidden="true" />
                Pause
              </button>
            ) : (
              <button type="button" onClick={startTimer} className={PRIMARY_BTN} aria-label="Start the timer">
                <Play className="h-4 w-4" aria-hidden="true" />
                {bankedSeconds > 0 ? "Resume" : "Start"}
              </button>
            )}
            <button type="button" onClick={resetTimer} className={GHOST_BTN} aria-label="Reset the timer to zero">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset timer
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${isIcePhase ? "Ice on" : "Ice off"} phase is ${state.progressPct}% complete`}
          >
            <span
              className={`block h-full ${isIcePhase ? "bg-[var(--primary)]" : "bg-[var(--success)]"}`}
              style={{ width: `${Math.max(0, Math.min(100, state.progressPct))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Total elapsed {formatDuration(elapsedSeconds)} · {running ? "running" : "paused"}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rice-ice">
              Ice on (minutes)
            </label>
            <input
              id="rice-ice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={ICE_MIN_MINUTES}
              max={ICE_MAX_MINUTES}
              step="1"
              value={iceMinutes}
              onChange={(event) => setIceMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rice-gap">
              Hours between applications
            </label>
            <input
              id="rice-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={GAP_MIN_HOURS}
              max={GAP_MAX_HOURS}
              step="0.5"
              value={gapHours}
              onChange={(event) => setGapHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rice-start">
              First application at
            </label>
            <input
              id="rice-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startClock}
              onChange={(event) => setStartClock(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rice-hours">
              Protocol length (hours)
            </label>
            <input
              id="rice-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="72"
              step="1"
              value={protocolHours}
              onChange={(event) => setProtocolHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rice-sleep">
              You go to bed at
            </label>
            <input
              id="rice-sleep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={sleepClock}
              onChange={(event) => setSleepClock(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rice-wake">
              You get up at
            </label>
            <input
              id="rice-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={wakeClock}
              onChange={(event) => setWakeClock(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the RICE plan"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy plan"}
          </button>
          <button type="button" onClick={resetAll} aria-label="Reset everything" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset all
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {schedule.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your protocol at a glance</h2>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cycle", hasError ? DASH : `${schedule.iceMinutes} min on, ${schedule.offMinutes} min off`],
            ["Applications planned", hasError ? DASH : `${schedule.totalSessions} over ${schedule.protocolHours} hours`],
            ["Applications while awake", hasError ? DASH : schedule.awakeSessions],
            ["Falling during sleep", hasError ? DASH : `${schedule.sleptThroughSessions} — skip, do not set alarms`],
            ["Total icing time", hasError ? DASH : `${schedule.totalIceMinutes} minutes`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Application schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Ice on</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Ice off</th>
                  <th scope="col" className="py-2 text-right font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {schedule.sessions.map((session) => (
                  <tr
                    key={`${session.index}-${session.startClock}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">{session.index}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">Day {session.dayOffset + 1}</td>
                    <td className="py-2 pr-3">{session.startClock}</td>
                    <td className="py-2 pr-3">{session.endClock}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {session.asleep ? "asleep — skip" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What each letter means</h2>
        <dl className="mt-4 space-y-4">
          {RICE_STEPS.map((step) => (
            <div key={step.id}>
              <dt className="text-sm font-semibold">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                  {step.letter}
                </span>
                {step.label}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{step.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Loosen the bandage if you notice</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {COMPRESSION_CHECKS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Do not ice if you have</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {ICE_CONTRAINDICATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold text-[var(--danger)]">Get it looked at if</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          {RED_FLAGS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        First-aid information only, not a diagnosis or a treatment plan. Sports medicine has largely
        moved on from strict rest towards protected, gradually increased loading after the first day,
        so ask a physiotherapist or doctor what is right for your specific injury.
      </p>
    </main>
  );
}
