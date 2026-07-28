"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Timer } from "lucide-react";

import { PRESETS, buildRepPlan, formatDuration, phaseAt } from "../lib";

const DASH = "—";

const DEFAULTS = {
  presetId: "glute-bridge",
  sets: "3",
  reps: "10",
  concentric: "2",
  hold: "5",
  eccentric: "3",
  restRep: "2",
  restSet: "60",
  perDay: "1",
  daysWeek: "7",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [sets, setSets] = useState(DEFAULTS.sets);
  const [reps, setReps] = useState(DEFAULTS.reps);
  const [concentric, setConcentric] = useState(DEFAULTS.concentric);
  const [hold, setHold] = useState(DEFAULTS.hold);
  const [eccentric, setEccentric] = useState(DEFAULTS.eccentric);
  const [restRep, setRestRep] = useState(DEFAULTS.restRep);
  const [restSet, setRestSet] = useState(DEFAULTS.restSet);
  const [perDay, setPerDay] = useState(DEFAULTS.perDay);
  const [daysWeek, setDaysWeek] = useState(DEFAULTS.daysWeek);
  const [copied, setCopied] = useState(false);

  const [startEpoch, setStartEpoch] = useState(null);
  const [bankedSeconds, setBankedSeconds] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (startEpoch === null) return undefined;
    const id = setInterval(() => setTick(Date.now()), 200);
    return () => clearInterval(id);
  }, [startEpoch]);

  const elapsedSeconds =
    startEpoch === null ? bankedSeconds : bankedSeconds + Math.max(0, (tick - startEpoch) / 1000);

  const plan = useMemo(
    () =>
      buildRepPlan({
        sets: Number(sets),
        reps: Number(reps),
        concentricSeconds: Number(concentric),
        holdSeconds: Number(hold),
        eccentricSeconds: Number(eccentric),
        restRepSeconds: Number(restRep),
        restSetSeconds: Number(restSet),
        sessionsPerDay: Number(perDay),
        daysPerWeek: Number(daysWeek),
      }),
    [sets, reps, concentric, hold, eccentric, restRep, restSet, perDay, daysWeek],
  );

  const hasError = Boolean(plan.error);
  const state = useMemo(() => phaseAt(elapsedSeconds, plan), [elapsedSeconds, plan]);
  const running = startEpoch !== null;
  const show = (value) => (hasError ? DASH : value);

  const applyPreset = (id) => {
    setPresetId(id);
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setSets(String(preset.sets));
    setReps(String(preset.reps));
    setConcentric(String(preset.concentric));
    setHold(String(preset.hold));
    setEccentric(String(preset.eccentric));
    setRestRep(String(preset.restRep));
    setRestSet(String(preset.restSet));
    setStartEpoch(null);
    setBankedSeconds(0);
    setCopied(false);
  };

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
      "Rehab exercise prescription",
      `${plan.sets} sets x ${plan.reps} reps`,
      `Tempo: ${plan.concentric}s lift / ${plan.hold}s hold / ${plan.eccentric}s lower`,
      `Rest: ${plan.restRep}s between reps, ${plan.restSet}s between sets`,
      `Session time: ${formatDuration(plan.totalSeconds)}`,
      `Time under tension: ${plan.totalTut} seconds across ${plan.totalReps} reps`,
      `Weekly volume: ${plan.weeklyReps} reps over ${formatDuration(plan.weeklySeconds)}`,
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

  const resetAll = () => {
    applyPreset(DEFAULTS.presetId);
    setPerDay(DEFAULTS.perDay);
    setDaysWeek(DEFAULTS.daysWeek);
    resetTimer();
    setCopied(false);
  };

  const preset = PRESETS.find((item) => item.id === presetId);
  const emphasise = state.phase === "hold" || state.phase === "concentric" || state.phase === "eccentric";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Rehab and recovery
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Physio Rep and Hold Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the sets, reps and tempo your physiotherapist prescribed. The timer calls each lift,
          hold, lower and rest, and totals the time under tension you are actually accumulating.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError
                ? "Waiting for valid settings"
                : state.done
                  ? "Session complete"
                  : `Set ${state.setNumber} of ${plan.sets} · rep ${state.repNumber} of ${plan.reps}`}
            </p>
            <p
              className={`mt-1 font-semibold tabular-nums ${emphasise ? "text-5xl text-[var(--primary)]" : "text-5xl text-[var(--muted-foreground)]"}`}
              aria-live="polite"
            >
              {hasError ? DASH : formatDuration(state.remainingSeconds)}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {hasError ? DASH : state.phaseLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {running ? (
              <button type="button" onClick={pauseTimer} className={PRIMARY_BTN} aria-label="Pause the exercise timer">
                <Pause className="h-4 w-4" aria-hidden="true" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={startTimer}
                className={PRIMARY_BTN}
                aria-label="Start the exercise timer"
                disabled={hasError}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {bankedSeconds > 0 ? "Resume" : "Start"}
              </button>
            )}
            <button type="button" onClick={resetTimer} className={GHOST_BTN} aria-label="Reset the timer to the start">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset timer
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Current phase is ${state.progressPct}% complete`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, state.progressPct))}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Current phase</p>
          </div>
          <div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Session is ${state.sessionProgressPct}% complete`}
            >
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, state.sessionProgressPct))}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Whole session — {formatDuration(elapsedSeconds)} of{" "}
              {hasError ? DASH : formatDuration(plan.totalSeconds)} · {running ? "running" : "paused"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Prescription</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-preset">
              Start from a known protocol
            </label>
            <select
              id="pr-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {preset && <p className="mt-2 text-xs text-[var(--muted-foreground)]">{preset.note}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-sets">
              Sets
            </label>
            <input
              id="pr-sets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-reps">
              Reps per set
            </label>
            <input
              id="pr-reps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-con">
              Lift / concentric (seconds)
            </label>
            <input
              id="pr-con"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="1"
              value={concentric}
              onChange={(event) => setConcentric(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-hold">
              Hold / isometric (seconds)
            </label>
            <input
              id="pr-hold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="1"
              value={hold}
              onChange={(event) => setHold(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-ecc">
              Lower / eccentric (seconds)
            </label>
            <input
              id="pr-ecc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="1"
              value={eccentric}
              onChange={(event) => setEccentric(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-restrep">
              Reset between reps (seconds)
            </label>
            <input
              id="pr-restrep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="600"
              step="1"
              value={restRep}
              onChange={(event) => setRestRep(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-restset">
              Rest between sets (seconds)
            </label>
            <input
              id="pr-restset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="600"
              step="5"
              value={restSet}
              onChange={(event) => setRestSet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-perday">
              Sessions per day
            </label>
            <input
              id="pr-perday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={perDay}
              onChange={(event) => setPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-days">
              Days per week
            </label>
            <input
              id="pr-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              value={daysWeek}
              onChange={(event) => setDaysWeek(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the exercise prescription"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy prescription"}
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
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Session length
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {hasError ? DASH : formatDuration(plan.totalSeconds)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {show(`${plan.sets} sets of ${plan.reps} reps · ${plan.totalReps} reps in total`)}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["One rep", show(`${plan.repSeconds} s (${plan.workSeconds} s working + ${plan.restRep} s reset)`)],
            ["One set", show(`${formatDuration(plan.setSeconds)} of work`)],
            ["Time under tension per set", show(`${plan.tutPerSet} s`)],
            ["Time under tension in the session", show(`${plan.totalTut} s`)],
            ["Share of the session spent resting", show(`${plan.restShareOfSessionPct}%`)],
            [
              "Weekly volume",
              show(`${plan.weeklyReps} reps over ${formatDuration(plan.weeklySeconds)}`),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A timing aid, not a prescription. Follow the sets, reps, tempo and load your physiotherapist
        or doctor gave you, and stop if an exercise causes sharp pain, pain that keeps rising during
        the set, or symptoms that are worse the following morning.
      </p>
    </main>
  );
}
