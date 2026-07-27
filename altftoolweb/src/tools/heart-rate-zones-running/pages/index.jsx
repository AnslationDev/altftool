"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import {
  computeRunningZones,
  formatPace,
  paceToSeconds,
  MAX_HR_FORMULAS,
  ZONE_METHODS,
} from "../lib";

const DASH = "—";

const DEFAULTS = {
  age: "35",
  restHr: "55",
  formulaId: "tanaka",
  method: "pctmax",
  maxHrOverride: "",
  paceMin: "4",
  paceSec: "30",
  paceUnit: "km",
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
  const [paceMin, setPaceMin] = useState(DEFAULTS.paceMin);
  const [paceSec, setPaceSec] = useState(DEFAULTS.paceSec);
  const [paceUnit, setPaceUnit] = useState(DEFAULTS.paceUnit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeRunningZones({
        age: toNumber(age),
        restHr: toNumber(restHr),
        formulaId,
        method,
        maxHrOverride: toNumber(maxHrOverride),
        thresholdPaceSec: paceToSeconds(toNumber(paceMin), toNumber(paceSec)),
      }),
    [age, restHr, formulaId, method, maxHrOverride, paceMin, paceSec],
  );

  const ok = !result.error;
  const unitLabel = paceUnit === "km" ? "per km" : "per mile";

  const buildSummary = () => {
    if (!ok) return "";
    return [
      "Heart Rate Zones for Running",
      `Maximum heart rate: ${result.maxHrRounded} bpm (${result.formulaLabel}${
        result.formulaExpression ? `, ${result.formulaExpression}` : ""
      })`,
      `Zone method: ${method === "karvonen" ? "Karvonen heart rate reserve" : "% of maximum heart rate"}`,
      ...result.zones.map(
        (zone) =>
          `${zone.name} ${zone.title}: ${zone.lowBpm}–${zone.highBpm} bpm${
            result.paceOk
              ? ` · ${formatPace(zone.fastPaceSec)}–${formatPace(zone.slowPaceSec)} ${unitLabel}`
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
    setPaceMin(DEFAULTS.paceMin);
    setPaceSec(DEFAULTS.paceSec);
    setPaceUnit(DEFAULTS.paceUnit);
    setCopied(false);
  };

  const easy = ok ? result.zones[1] : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Running
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Heart Rate Zones for Running
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Five running zones in real beats per minute, with the matching pace band for each zone
          worked out from your threshold pace.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="run-age">
              Age (years)
            </label>
            <input
              id="run-age"
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
            <label className={LABEL_CLASS} htmlFor="run-formula">
              Max heart rate formula
            </label>
            <select
              id="run-formula"
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
            <label className={LABEL_CLASS} htmlFor="run-method">
              Zone method
            </label>
            <select
              id="run-method"
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
            <label className={LABEL_CLASS} htmlFor="run-rest">
              Resting heart rate (bpm)
            </label>
            <input
              id="run-rest"
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
            <label className={LABEL_CLASS} htmlFor="run-maxhr">
              Measured max heart rate (bpm) — optional
            </label>
            <input
              id="run-maxhr"
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
            <label className={LABEL_CLASS} htmlFor="run-pace-unit">
              Pace unit
            </label>
            <select
              id="run-pace-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paceUnit}
              onChange={(event) => setPaceUnit(event.target.value)}
            >
              <option value="km">Minutes per kilometre</option>
              <option value="mi">Minutes per mile</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="run-pace-min">
                Threshold pace — minutes
              </label>
              <input
                id="run-pace-min"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="2"
                max="15"
                step="1"
                value={paceMin}
                onChange={(event) => setPaceMin(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="run-pace-sec">
                and seconds
              </label>
              <input
                id="run-pace-sec"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                step="1"
                value={paceSec}
                onChange={(event) => setPaceSec(event.target.value)}
              />
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Threshold pace is roughly the pace you could hold flat out for an hour — near your 10 km
          to half-marathon race pace for most runners.
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
              Estimated maximum heart rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.maxHrRounded} bpm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.formulaLabel}${
                    result.formulaExpression ? ` · ${result.formulaExpression}` : ""
                  }`
                : "Fix the input above to see your zones."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy running heart rate zones"
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
            ["Easy-run target (Zone 2)", easy ? `${easy.lowBpm}–${easy.highBpm} bpm` : DASH],
            [
              "Easy-run pace",
              ok && result.paceOk
                ? `${formatPace(easy.fastPaceSec)}–${formatPace(easy.slowPaceSec)} ${unitLabel}`
                : DASH,
            ],
            [
              "Threshold target (Zone 4)",
              ok ? `${result.zones[3].lowBpm}–${result.zones[3].highBpm} bpm` : DASH,
            ],
            [
              "Zone method",
              ok
                ? method === "karvonen"
                  ? `Karvonen · heart rate reserve ${Math.round(result.reserve)} bpm`
                  : "Percentage of maximum heart rate"
                : DASH,
            ],
            [
              "Threshold pace used",
              ok && result.paceOk ? `${formatPace(result.thresholdPaceSec)} ${unitLabel}` : DASH,
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
        <h2 className="text-base font-semibold">Your five running zones</h2>
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
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Pace {unitLabel}
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Typical session
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
                    <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                      {zone.talk}
                    </span>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    {result.paceOk
                      ? `${formatPace(zone.fastPaceSec)}–${formatPace(zone.slowPaceSec)}`
                      : DASH}
                  </td>
                  <td className="py-3 align-top text-[var(--muted-foreground)]">
                    {zone.session}
                    <span className="block text-xs">{zone.purpose}</span>
                  </td>
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
        Age-predicted maximum heart rate carries a standard deviation of roughly 10 bpm, so treat
        these zones as a starting point and adjust them against how the effort actually feels. This
        is general fitness information, not medical advice — check with a doctor before starting
        hard training if you have a heart condition or symptoms during exercise.
      </p>
    </main>
  );
}
