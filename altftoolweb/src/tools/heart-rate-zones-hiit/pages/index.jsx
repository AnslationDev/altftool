"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  computeHiitPlan,
  formatDuration,
  HIIT_FORMATS,
  MAX_HR_FORMULAS,
  ZONE_METHODS,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  age: "45",
  restHr: "60",
  formulaId: "tanaka",
  method: "pctmax",
  maxHrOverride: "",
  formatId: "4x4",
  reps: "4",
  workSeconds: "60",
  restSeconds: "60",
  warmupMinutes: "10",
  cooldownMinutes: "5",
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

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [restHr, setRestHr] = useState(DEFAULTS.restHr);
  const [formulaId, setFormulaId] = useState(DEFAULTS.formulaId);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [maxHrOverride, setMaxHrOverride] = useState(DEFAULTS.maxHrOverride);
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [reps, setReps] = useState(DEFAULTS.reps);
  const [workSeconds, setWorkSeconds] = useState(DEFAULTS.workSeconds);
  const [restSeconds, setRestSeconds] = useState(DEFAULTS.restSeconds);
  const [warmupMinutes, setWarmupMinutes] = useState(DEFAULTS.warmupMinutes);
  const [cooldownMinutes, setCooldownMinutes] = useState(DEFAULTS.cooldownMinutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeHiitPlan({
        age: toNumber(age),
        restHr: toNumber(restHr),
        formulaId,
        method,
        maxHrOverride: toNumber(maxHrOverride),
        formatId,
        reps: toNumber(reps),
        workSeconds: toNumber(workSeconds),
        restSeconds: toNumber(restSeconds),
        warmupMinutes: toNumber(warmupMinutes),
        cooldownMinutes: toNumber(cooldownMinutes),
      }),
    [
      age,
      restHr,
      formulaId,
      method,
      maxHrOverride,
      formatId,
      reps,
      workSeconds,
      restSeconds,
      warmupMinutes,
      cooldownMinutes,
    ],
  );

  const ok = !result.error;

  const selectFormat = (nextId) => {
    const preset = HIIT_FORMATS.find((entry) => entry.id === nextId);
    setFormatId(nextId);
    if (preset) {
      setReps(String(preset.reps));
      setWorkSeconds(String(preset.workSeconds));
      setRestSeconds(String(preset.restSeconds));
    }
  };

  const buildSummary = () => {
    if (!ok) return "";
    return [
      "Heart Rate Zones for HIIT",
      `Maximum heart rate: ${result.maxHrRounded} bpm (${result.formulaLabel}${
        result.formulaExpression ? `, ${result.formulaExpression}` : ""
      })`,
      `Format: ${result.formatLabel} — ${result.reps} × ${formatDuration(result.workSeconds)} work / ${formatDuration(
        result.restSeconds,
      )} recovery`,
      `Work target: ${result.workLowBpm}–${result.workHighBpm} bpm`,
      `Recovery target: ${result.recoveryLowBpm}–${result.recoveryHighBpm} bpm`,
      `Interval block: ${formatDuration(result.intervalSeconds)} (${formatDuration(
        result.totalWorkSeconds,
      )} at intensity)`,
      `Whole session with warm-up and cool-down: ${formatDuration(result.totalSessionSeconds)}`,
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
    setFormatId(DEFAULTS.formatId);
    setReps(DEFAULTS.reps);
    setWorkSeconds(DEFAULTS.workSeconds);
    setRestSeconds(DEFAULTS.restSeconds);
    setWarmupMinutes(DEFAULTS.warmupMinutes);
    setCooldownMinutes(DEFAULTS.cooldownMinutes);
    setCopied(false);
  };

  const custom = formatId === "custom";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Interval training
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Heart Rate Zones for HIIT
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work and recovery heart rate targets for the interval formats sessions are actually built
          from — 4 × 4, Tabata, 30/30 and sprint intervals — with the session clock worked out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hiit-age">
              Age (years)
            </label>
            <input
              id="hiit-age"
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
            <label className={LABEL_CLASS} htmlFor="hiit-formula">
              Max heart rate formula
            </label>
            <select
              id="hiit-formula"
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
            <label className={LABEL_CLASS} htmlFor="hiit-method">
              Target method
            </label>
            <select
              id="hiit-method"
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
            <label className={LABEL_CLASS} htmlFor="hiit-rest">
              Resting heart rate (bpm)
            </label>
            <input
              id="hiit-rest"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="hiit-maxhr">
              Measured max heart rate (bpm) — optional
            </label>
            <input
              id="hiit-maxhr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="230"
              step="1"
              placeholder="Leave blank to use the formula"
              value={maxHrOverride}
              onChange={(event) => setMaxHrOverride(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hiit-format">
              Interval format
            </label>
            <select
              id="hiit-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formatId}
              onChange={(event) => selectFormat(event.target.value)}
            >
              {HIIT_FORMATS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hiit-reps">
              Repetitions
            </label>
            <input
              id="hiit-reps"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              disabled={!custom}
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="hiit-work">
                Work (s)
              </label>
              <input
                id="hiit-work"
                className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                type="number"
                inputMode="numeric"
                min="5"
                max="600"
                step="5"
                disabled={!custom}
                value={workSeconds}
                onChange={(event) => setWorkSeconds(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="hiit-rest-sec">
                Recovery (s)
              </label>
              <input
                id="hiit-rest-sec"
                className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
                type="number"
                inputMode="numeric"
                min="5"
                max="600"
                step="5"
                disabled={!custom}
                value={restSeconds}
                onChange={(event) => setRestSeconds(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hiit-warmup">
              Warm-up (min)
            </label>
            <input
              id="hiit-warmup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={warmupMinutes}
              onChange={(event) => setWarmupMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hiit-cooldown">
              Cool-down (min)
            </label>
            <input
              id="hiit-cooldown"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={cooldownMinutes}
              onChange={(event) => setCooldownMinutes(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Work and recovery lengths are fixed by each preset. Choose the custom format to set your
          own.
        </p>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Work interval target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.workLowBpm}–${result.workHighBpm} bpm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.formatLabel} · recover to ${result.recoveryLowBpm}–${result.recoveryHighBpm} bpm between reps`
                : "Fix the input above to see your targets."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy HIIT heart rate targets"
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
              "Session shape",
              ok
                ? `${result.reps} × ${formatDuration(result.workSeconds)} work / ${formatDuration(
                    result.restSeconds,
                  )} recovery`
                : DASH,
            ],
            ["Work-to-rest ratio", ok ? `1 : ${NUM.format(result.workRestRatio)}` : DASH],
            ["Time at intensity", ok ? formatDuration(result.totalWorkSeconds) : DASH],
            ["Interval block", ok ? formatDuration(result.intervalSeconds) : DASH],
            [
              "Whole session",
              ok
                ? `${formatDuration(result.totalSessionSeconds)} including ${result.warmupMinutes} min warm-up and ${result.cooldownMinutes} min cool-down`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.formatNote}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your heart rate bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Heart rate
                </th>
                <th scope="col" className="py-2 font-semibold">
                  When it is used
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.bands : []).map((band) => (
                <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{band.name}</td>
                  <td className="py-2.5 pr-3 font-semibold">
                    {band.lowBpm}–{band.highBpm}
                  </td>
                  <td className="py-2.5 text-[var(--muted-foreground)]">{band.use}</td>
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
        <h2 className="text-base font-semibold">The formats side by side</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Format
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Work target
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Time at intensity
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Block length
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.comparison : []).map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3">
                    <span className="font-semibold">{entry.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {entry.reps} × {formatDuration(entry.workSeconds)} /{" "}
                      {formatDuration(entry.restSeconds)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 font-semibold">
                    {entry.workLowBpm}–{entry.workHighBpm}
                  </td>
                  <td className="py-2.5 pr-3">{formatDuration(entry.totalWorkSeconds)}</td>
                  <td className="py-2.5">{formatDuration(entry.totalSeconds)}</td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        On intervals shorter than about a minute your heart rate never catches the effort, so judge
        those rounds by pace, watts or how much you can repeat, and use heart rate mainly to check
        you are recovering between them. High-intensity work is demanding — if you are new to
        exercise, pregnant, or have a heart condition, high blood pressure or symptoms during
        exertion, talk to a doctor before starting.
      </p>
    </main>
  );
}
