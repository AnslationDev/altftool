"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import {
  computeRowingBands,
  formatSplit,
  splitToSeconds,
  MAX_HR_FORMULAS,
  ZONE_METHODS,
} from "../lib";

const DASH = "—";

const DEFAULTS = {
  age: "30",
  restHr: "55",
  formulaId: "tanaka",
  method: "pctmax",
  maxHrOverride: "",
  splitMin: "1",
  splitSec: "50",
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
  const [splitMin, setSplitMin] = useState(DEFAULTS.splitMin);
  const [splitSecs, setSplitSecs] = useState(DEFAULTS.splitSec);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeRowingBands({
        age: toNumber(age),
        restHr: toNumber(restHr),
        formulaId,
        method,
        maxHrOverride: toNumber(maxHrOverride),
        splitSec: splitToSeconds(toNumber(splitMin), toNumber(splitSecs)),
      }),
    [age, restHr, formulaId, method, maxHrOverride, splitMin, splitSecs],
  );

  const ok = !result.error;

  const buildSummary = () => {
    if (!ok) return "";
    return [
      "Heart Rate Zones for Rowing",
      `Maximum heart rate: ${result.maxHrRounded} bpm (${result.formulaLabel}${
        result.formulaExpression ? `, ${result.formulaExpression}` : ""
      })`,
      result.splitOk
        ? `2 km test pace: ${formatSplit(result.splitSec)} per 500 m (${formatSplit(result.time2kSec)} for 2 km)`
        : "2 km test pace: not entered",
      ...result.bands.map(
        (band) =>
          `${band.name} ${band.title}: ${band.lowBpm}–${band.highBpm} bpm · rate ${band.rateLow}–${band.rateHigh} spm${
            result.splitOk
              ? ` · ${formatSplit(band.fastSplitSec)}–${formatSplit(band.slowSplitSec)} per 500 m`
              : ""
          }`,
      ),
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
    setSplitMin(DEFAULTS.splitMin);
    setSplitSecs(DEFAULTS.splitSec);
    setCopied(false);
  };

  const ut2 = ok ? result.bands[0] : null;
  const at = ok ? result.bands[2] : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Rowing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Heart Rate Zones for Rowing
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          UT2, UT1, AT, TR and AN bands in beats per minute, each with its stroke rate window and
          the 500 m split it should sit at, worked out from your 2 km test pace.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="row-age">
              Age (years)
            </label>
            <input
              id="row-age"
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
            <label className={LABEL_CLASS} htmlFor="row-formula">
              Max heart rate formula
            </label>
            <select
              id="row-formula"
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
            <label className={LABEL_CLASS} htmlFor="row-method">
              Band method
            </label>
            <select
              id="row-method"
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
            <label className={LABEL_CLASS} htmlFor="row-rest">
              Resting heart rate (bpm)
            </label>
            <input
              id="row-rest"
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
            <label className={LABEL_CLASS} htmlFor="row-maxhr">
              Measured max heart rate (bpm) — optional
            </label>
            <input
              id="row-maxhr"
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
            <label className={LABEL_CLASS} htmlFor="row-split-min">
              2 km split — minutes
            </label>
            <input
              id="row-split-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="3"
              step="1"
              value={splitMin}
              onChange={(event) => setSplitMin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="row-split-sec">
              and seconds
            </label>
            <input
              id="row-split-sec"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="59"
              step="1"
              value={splitSecs}
              onChange={(event) => setSplitSecs(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          The 2 km split is your average pace per 500 m in an all-out 2 km test — the number every
          rowing programme is built around.
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Steady state target (UT2)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ut2 ? `${ut2.lowBpm}–${ut2.highBpm} bpm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Rate ${ut2.rateLow}–${ut2.rateHigh} spm${
                    result.splitOk
                      ? ` at ${formatSplit(ut2.fastSplitSec)}–${formatSplit(ut2.slowSplitSec)} per 500 m`
                      : ""
                  }`
                : "Fix the input above to see your bands."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy rowing heart rate bands"
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
            [
              "Maximum heart rate",
              ok
                ? `${result.maxHrRounded} bpm (${result.formulaLabel})`
                : DASH,
            ],
            ["Threshold band (AT)", at ? `${at.lowBpm}–${at.highBpm} bpm` : DASH],
            [
              "Band method",
              ok
                ? method === "karvonen"
                  ? `Karvonen · heart rate reserve ${Math.round(result.reserve)} bpm`
                  : "Percentage of maximum heart rate"
                : DASH,
            ],
            [
              "2 km test pace",
              ok && result.splitOk ? `${formatSplit(result.splitSec)} per 500 m` : DASH,
            ],
            ["Implied 2 km time", ok && result.splitOk ? formatSplit(result.time2kSec) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your rowing training bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Heart rate
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rate
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Split /500 m
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Typical session
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.bands : []).map((band) => (
                <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3 pr-3 align-top">
                    <span className="font-semibold">{band.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {band.title}
                    </span>
                  </td>
                  <td className="py-3 pr-3 align-top font-semibold">
                    {band.lowBpm}–{band.highBpm}
                  </td>
                  <td className="py-3 pr-3 align-top text-[var(--muted-foreground)]">
                    {band.rateLow}–{band.rateHigh} spm
                  </td>
                  <td className="py-3 pr-3 align-top">
                    {result.splitOk
                      ? `${formatSplit(band.fastSplitSec)}–${formatSplit(band.slowSplitSec)}`
                      : DASH}
                  </td>
                  <td className="py-3 align-top text-[var(--muted-foreground)]">
                    {band.session}
                    <span className="block text-xs">{band.purpose}</span>
                  </td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={5}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        On the water, wind, stream and boat class move the split for the same effort, so use heart
        rate and rate as the anchor and treat the split column as an erg reference. General
        training information only, not medical advice.
      </p>
    </main>
  );
}
