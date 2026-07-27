"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Trophy } from "lucide-react";

import {
  computeBasketballZones,
  formatDuration,
  DEFAULT_RECOVERY_FRACTION,
  HRR1_ABNORMAL_THRESHOLD,
  MAX_HR_FORMULAS,
  ZONE_METHODS,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DEFAULTS = {
  age: "25",
  restHr: "58",
  formulaId: "tanaka",
  method: "pctmax",
  maxHrOverride: "",
  reps: "10",
  workSeconds: "30",
  restSeconds: "60",
  recoveryPct: String(Math.round(DEFAULT_RECOVERY_FRACTION * 100)),
  peakBpm: "185",
  oneMinuteBpm: "158",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const PERCENT_TO_FRACTION = 100;

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [restHr, setRestHr] = useState(DEFAULTS.restHr);
  const [formulaId, setFormulaId] = useState(DEFAULTS.formulaId);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [maxHrOverride, setMaxHrOverride] = useState(DEFAULTS.maxHrOverride);
  const [reps, setReps] = useState(DEFAULTS.reps);
  const [workSeconds, setWorkSeconds] = useState(DEFAULTS.workSeconds);
  const [restSeconds, setRestSeconds] = useState(DEFAULTS.restSeconds);
  const [recoveryPct, setRecoveryPct] = useState(DEFAULTS.recoveryPct);
  const [peakBpm, setPeakBpm] = useState(DEFAULTS.peakBpm);
  const [oneMinuteBpm, setOneMinuteBpm] = useState(DEFAULTS.oneMinuteBpm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const pct = toNumber(recoveryPct);
    return computeBasketballZones({
      age: toNumber(age),
      restHr: toNumber(restHr),
      formulaId,
      method,
      maxHrOverride: toNumber(maxHrOverride),
      reps: toNumber(reps),
      workSeconds: toNumber(workSeconds),
      restSeconds: toNumber(restSeconds),
      recoveryFraction: Number.isFinite(pct) ? pct / PERCENT_TO_FRACTION : NaN,
      peakBpm: toNumber(peakBpm),
      oneMinuteBpm: toNumber(oneMinuteBpm),
    });
  }, [
    age,
    restHr,
    formulaId,
    method,
    maxHrOverride,
    reps,
    workSeconds,
    restSeconds,
    recoveryPct,
    peakBpm,
    oneMinuteBpm,
  ]);

  const ok = !result.error;
  const drill = ok ? result.drill : null;

  const buildSummary = () => {
    if (!ok) return "";
    return [
      "Heart Rate Zones for Basketball",
      `Maximum heart rate: ${result.maxHrRounded} bpm (${result.formulaLabel}${
        result.formulaExpression ? `, ${result.formulaExpression}` : ""
      })`,
      `Live-play band: ${result.gameLowBpm}–${result.gameHighBpm} bpm`,
      ...result.zones.map(
        (zone) => `${zone.name} ${zone.title}: ${zone.lowBpm}–${zone.highBpm} bpm — ${zone.drill}`,
      ),
      `Drill block: ${drill.reps} × ${drill.workSeconds} s work / ${drill.restSeconds} s rest, total ${formatDuration(
        drill.totalSeconds,
      )}`,
      `Restart the next rep when heart rate drops below ${drill.restartCueBpm} bpm`,
      result.hrr1.ok
        ? `One-minute heart rate recovery: ${result.hrr1.drop} bpm`
        : "One-minute heart rate recovery: not entered",
    ].join("\n");
  };

  const copyResult = async () => {
    const summary = buildSummary();
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
    setAge(DEFAULTS.age);
    setRestHr(DEFAULTS.restHr);
    setFormulaId(DEFAULTS.formulaId);
    setMethod(DEFAULTS.method);
    setMaxHrOverride(DEFAULTS.maxHrOverride);
    setReps(DEFAULTS.reps);
    setWorkSeconds(DEFAULTS.workSeconds);
    setRestSeconds(DEFAULTS.restSeconds);
    setRecoveryPct(DEFAULTS.recoveryPct);
    setPeakBpm(DEFAULTS.peakBpm);
    setOneMinuteBpm(DEFAULTS.oneMinuteBpm);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Basketball
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Heart Rate Zones for Basketball
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Court-work zone bands in beats per minute, a shuttle drill planner with a heart-rate
          restart cue, and your one-minute recovery score.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-age">
              Age (years)
            </label>
            <input
              id="bb-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-formula">
              Max heart rate formula
            </label>
            <select
              id="bb-formula"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formulaId}
              onChange={(event) => setFormulaId(event.target.value)}
            >
              {MAX_HR_FORMULAS.map((formula) => (
                <option key={formula.id} value={formula.id}>
                  {formula.label} — {formula.expression}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-method">
              Zone method
            </label>
            <select
              id="bb-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {ZONE_METHODS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-rest">
              Resting heart rate (bpm)
            </label>
            <input
              id="bb-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max="120"
              step="1"
              value={restHr}
              onChange={(event) => setRestHr(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bb-maxhr">
              Measured max heart rate (bpm) — optional
            </label>
            <input
              id="bb-maxhr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="230"
              step="1"
              placeholder="Highest reading from a hard scrimmage or test"
              value={maxHrOverride}
              onChange={(event) => setMaxHrOverride(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Live-play heart rate band
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.gameLowBpm}–${result.gameHighBpm} bpm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? "Match analysis puts live basketball around 85–90% of maximum heart rate for most of the time on court."
                : "Fix the input above to see your zones."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy basketball heart rate zones"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Maximum heart rate", ok ? `${result.maxHrRounded} bpm (${result.formulaLabel})` : DASH],
            [
              "Repeated-sprint target (Zone 5)",
              ok ? `${result.zones[4].lowBpm}–${result.zones[4].highBpm} bpm` : DASH,
            ],
            [
              "Practice tempo (Zone 3)",
              ok ? `${result.zones[2].lowBpm}–${result.zones[2].highBpm} bpm` : DASH,
            ],
            [
              "Zone method",
              ok
                ? method === "karvonen"
                  ? `Karvonen · heart rate reserve ${Math.round(result.reserve)} bpm`
                  : "Percentage of maximum heart rate"
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Court conditioning zones</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Zone
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Heart rate
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Court work
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.zones : []).map((zone) => (
                <tr key={zone.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3 pr-3 align-top">
                    <span className="font-semibold">{zone.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {zone.title}
                    </span>
                  </td>
                  <td className="py-3 pr-3 align-top font-semibold">
                    {zone.lowBpm}–{zone.highBpm}
                  </td>
                  <td className="py-3 align-top text-[var(--muted-foreground)]">
                    {zone.drill}
                    <span className="block text-xs">{zone.purpose}</span>
                  </td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Shuttle drill planner</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-reps">
              Repetitions
            </label>
            <input
              id="bb-reps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-recovery">
              Restart cue (% of max heart rate)
            </label>
            <input
              id="bb-recovery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="40"
              max="90"
              step="1"
              value={recoveryPct}
              onChange={(event) => setRecoveryPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-work">
              Work per rep (seconds)
            </label>
            <input
              id="bb-work"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="300"
              step="5"
              value={workSeconds}
              onChange={(event) => setWorkSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-rest-sec">
              Rest between reps (seconds)
            </label>
            <input
              id="bb-rest-sec"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="600"
              step="5"
              value={restSeconds}
              onChange={(event) => setRestSeconds(event.target.value)}
            />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total block time", drill ? formatDuration(drill.totalSeconds) : DASH],
            ["Total time working", drill ? formatDuration(drill.totalWorkSeconds) : DASH],
            [
              "Work-to-rest ratio",
              drill ? `1 : ${NUM.format(drill.workRestRatio)}` : DASH,
            ],
            [
              "Start the next rep below",
              drill ? `${drill.restartCueBpm} bpm (${drill.recoveryPct}% of max)` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">One-minute heart rate recovery</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-peak">
              Peak heart rate at the end of the drill (bpm)
            </label>
            <input
              id="bb-peak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="230"
              step="1"
              value={peakBpm}
              onChange={(event) => setPeakBpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-onemin">
              Heart rate one minute later (bpm)
            </label>
            <input
              id="bb-onemin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="40"
              max="230"
              step="1"
              value={oneMinuteBpm}
              onChange={(event) => setOneMinuteBpm(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-4 text-2xl font-semibold text-[var(--primary)]">
          {ok && result.hrr1.ok ? `${result.hrr1.drop} bpm drop` : DASH}
        </p>
        {ok && result.hrr1.ok ? (
          <p
            className={`mt-3 rounded-md px-3 py-2 text-xs leading-5 ${
              result.hrr1.abnormal
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.hrr1.abnormal
              ? `A fall of ${HRR1_ABNORMAL_THRESHOLD} bpm or less in the first minute after stopping was classed as an abnormal response in the research this marker comes from. One reading proves nothing on its own — repeat it when rested, and mention it to a doctor if it keeps happening.`
              : `A drop of more than ${HRR1_ABNORMAL_THRESHOLD} bpm in the first minute is the normal response, and the number usually grows as conditioning improves.`}
          </p>
        ) : (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {ok ? result.hrr1.message : "Fix the input above first."}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Heart rate lags short sprints by up to a minute, so a five-second closeout will never show
        its true cost on a monitor — judge those by output and by how quickly you recover. General
        training information only, not medical advice or a cardiac screening test.
      </p>
    </main>
  );
}
