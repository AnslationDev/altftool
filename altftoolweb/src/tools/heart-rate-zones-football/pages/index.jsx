"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Goal, RotateCcw } from "lucide-react";

import {
  computeFootballZones,
  INTERVAL_PROTOCOL,
  MAX_HR_FORMULAS,
  ZONE_METHODS,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DEFAULTS = {
  age: "22",
  restHr: "55",
  formulaId: "tanaka",
  method: "pctmax",
  maxHrOverride: "",
  reps: String(INTERVAL_PROTOCOL.reps),
  workMinutes: String(INTERVAL_PROTOCOL.workMinutes),
  recoveryMinutes: String(INTERVAL_PROTOCOL.recoveryMinutes),
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
  const [reps, setReps] = useState(DEFAULTS.reps);
  const [workMinutes, setWorkMinutes] = useState(DEFAULTS.workMinutes);
  const [recoveryMinutes, setRecoveryMinutes] = useState(DEFAULTS.recoveryMinutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFootballZones({
        age: toNumber(age),
        restHr: toNumber(restHr),
        formulaId,
        method,
        maxHrOverride: toNumber(maxHrOverride),
        reps: toNumber(reps),
        workMinutes: toNumber(workMinutes),
        recoveryMinutes: toNumber(recoveryMinutes),
      }),
    [age, restHr, formulaId, method, maxHrOverride, reps, workMinutes, recoveryMinutes],
  );

  const ok = !result.error;
  const interval = ok ? result.interval : null;

  const buildSummary = () => {
    if (!ok) return "";
    return [
      "Heart Rate Zones for Football",
      `Maximum heart rate: ${result.maxHrRounded} bpm (${result.formulaLabel}${
        result.formulaExpression ? `, ${result.formulaExpression}` : ""
      })`,
      `Typical match average: ${result.matchMeanBpm} bpm (${result.matchMeanPct}% of max)`,
      ...result.zones.map(
        (zone) => `${zone.name} ${zone.title}: ${zone.lowBpm}–${zone.highBpm} bpm — ${zone.drill}`,
      ),
      `Aerobic intervals: ${interval.reps} × ${interval.workMinutes} min at ${interval.workLowBpm}–${interval.workHighBpm} bpm, ${interval.recoveryMinutes} min recovery near ${interval.recoveryBpm} bpm`,
      `Total session: ${interval.totalSessionMinutes} min (${interval.totalWorkMinutes} min of work)`,
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
    setWorkMinutes(DEFAULTS.workMinutes);
    setRecoveryMinutes(DEFAULTS.recoveryMinutes);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Goal className="h-4 w-4" aria-hidden="true" />
          Football
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Heart Rate Zones for Football
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Match-play zone targets in beats per minute, with the drill that belongs in each zone and
          a 4 × 4 minute aerobic interval session built from your own maximum heart rate.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fb-age">
              Age (years)
            </label>
            <input
              id="fb-age"
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
            <label className={LABEL_CLASS} htmlFor="fb-formula">
              Max heart rate formula
            </label>
            <select
              id="fb-formula"
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
            <label className={LABEL_CLASS} htmlFor="fb-method">
              Zone method
            </label>
            <select
              id="fb-method"
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
            <label className={LABEL_CLASS} htmlFor="fb-rest">
              Resting heart rate (bpm)
            </label>
            <input
              id="fb-rest"
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
            <label className={LABEL_CLASS} htmlFor="fb-maxhr">
              Measured max heart rate (bpm) — optional
            </label>
            <input
              id="fb-maxhr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="230"
              step="1"
              placeholder="From a Yo-Yo test or a hard match"
              value={maxHrOverride}
              onChange={(event) => setMaxHrOverride(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fb-reps">
              Interval repetitions
            </label>
            <input
              id="fb-reps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="fb-work">
                Work (min)
              </label>
              <input
                id="fb-work"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.5"
                max="10"
                step="0.5"
                value={workMinutes}
                onChange={(event) => setWorkMinutes(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="fb-recovery">
                Recovery (min)
              </label>
              <input
                id="fb-recovery"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.5"
                max="8"
                step="0.5"
                value={recoveryMinutes}
                onChange={(event) => setRecoveryMinutes(event.target.value)}
              />
            </div>
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
              Typical match average
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.matchMeanBpm} bpm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `About ${result.matchMeanPct}% of your maximum, roughly ${result.matchMeanVo2Pct}% of VO2 max — the mean intensity reported across match heart rate studies.`
                : "Fix the input above to see your zones."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy football heart rate zones"
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
              "Aerobic power target (Zone 4)",
              ok ? `${result.zones[3].lowBpm}–${result.zones[3].highBpm} bpm` : DASH,
            ],
            [
              "Interval work target",
              interval ? `${interval.workLowBpm}–${interval.workHighBpm} bpm` : DASH,
            ],
            ["Active recovery target", interval ? `about ${interval.recoveryBpm} bpm` : DASH],
            [
              "Session length",
              interval
                ? `${NUM.format(interval.totalSessionMinutes)} min · ${NUM.format(
                    interval.totalWorkMinutes,
                  )} min at intensity`
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
        <h2 className="text-base font-semibold">Zones and the drills that hit them</h2>
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
                  Session content
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Football heart rate is noisy: it spikes with duels and drops during stoppages, so judge a
        session by time spent above a threshold rather than by its average alone. General training
        information, not medical advice — any player with chest pain, fainting or an unexplained
        drop in capacity should be assessed by a doctor before returning to play.
      </p>
    </main>
  );
}
