"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import {
  computeCyclingZones,
  DEFAULT_CYCLING_HR_OFFSET,
  LTHR_FRACTION_OF_MAX,
  MAX_HR_FORMULAS,
} from "../lib";

const DASH = "—";
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULTS = {
  age: "40",
  formulaId: "tanaka",
  maxHrOverride: "",
  cyclingOffset: String(DEFAULT_CYCLING_HR_OFFSET),
  lthr: "",
  ftp: "250",
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
  const [formulaId, setFormulaId] = useState(DEFAULTS.formulaId);
  const [maxHrOverride, setMaxHrOverride] = useState(DEFAULTS.maxHrOverride);
  const [cyclingOffset, setCyclingOffset] = useState(DEFAULTS.cyclingOffset);
  const [lthr, setLthr] = useState(DEFAULTS.lthr);
  const [ftp, setFtp] = useState(DEFAULTS.ftp);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCyclingZones({
        age: toNumber(age),
        formulaId,
        maxHrOverride: toNumber(maxHrOverride),
        cyclingOffset: toNumber(cyclingOffset),
        lthr: toNumber(lthr),
        ftp: toNumber(ftp),
      }),
    [age, formulaId, maxHrOverride, cyclingOffset, lthr, ftp],
  );

  const ok = !result.error;

  const buildSummary = () => {
    if (!ok) return "";
    return [
      "Heart Rate Zones for Cycling",
      `Bike threshold heart rate (LTHR): ${result.thresholdHrRounded} bpm${
        result.measuredLthr ? " (measured)" : " (estimated)"
      }`,
      ...result.zones.map(
        (zone) => `${zone.name} ${zone.title}: ${zone.lowBpm}–${zone.highBpm} bpm · ${zone.power}`,
      ),
      result.hasFtp ? `FTP: ${result.ftp} W` : "FTP: not entered",
      ...(result.hasFtp
        ? result.powerZones.map(
            (zone) => `Power ${zone.name} ${zone.title}: ${zone.lowWatts}–${zone.highWatts} W`,
          )
        : []),
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
    setFormulaId(DEFAULTS.formulaId);
    setMaxHrOverride(DEFAULTS.maxHrOverride);
    setCyclingOffset(DEFAULTS.cyclingOffset);
    setLthr(DEFAULTS.lthr);
    setFtp(DEFAULTS.ftp);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Cycling
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Heart Rate Zones for Cycling
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Friel bike zones built from your threshold heart rate rather than your maximum, with the
          matching Coggan power band next to each one.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-age">
              Age (years)
            </label>
            <input
              id="bike-age"
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
            <label className={LABEL_CLASS} htmlFor="bike-formula">
              Max heart rate formula
            </label>
            <select
              id="bike-formula"
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
            <label className={LABEL_CLASS} htmlFor="bike-maxhr">
              Measured max heart rate (bpm) — optional
            </label>
            <input
              id="bike-maxhr"
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
            <label className={LABEL_CLASS} htmlFor="bike-offset">
              Cycling offset below running max (bpm)
            </label>
            <input
              id="bike-offset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="15"
              step="1"
              value={cyclingOffset}
              onChange={(event) => setCyclingOffset(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-lthr">
              Bike threshold heart rate (bpm) — optional
            </label>
            <input
              id="bike-lthr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="90"
              max="210"
              step="1"
              placeholder="From a 20 or 30 min time trial"
              value={lthr}
              onChange={(event) => setLthr(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-ftp">
              FTP (watts) — optional
            </label>
            <input
              id="bike-ftp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="40"
              max="600"
              step="5"
              value={ftp}
              onChange={(event) => setFtp(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          If you have not tested your bike threshold heart rate it is estimated at{" "}
          {PCT.format(LTHR_FRACTION_OF_MAX * 100)}% of your cycling maximum. Averaging heart rate
          over the last 20 minutes of a hard 30-minute solo time trial is far more accurate.
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
              Bike threshold heart rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.thresholdHrRounded} bpm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.measuredLthr
                  ? "Taken from the threshold heart rate you entered."
                  : `Estimated from a cycling maximum of ${result.bikeMaxHrRounded} bpm.`
                : "Fix the input above to see your zones."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy cycling heart rate zones"
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
              "Estimated general max heart rate",
              ok && Number.isFinite(result.maxHrRounded)
                ? `${result.maxHrRounded} bpm (${result.formulaLabel})`
                : DASH,
            ],
            [
              "Cycling max heart rate",
              ok && Number.isFinite(result.bikeMaxHrRounded)
                ? `${result.bikeMaxHrRounded} bpm (−${result.cyclingOffset} bpm)`
                : DASH,
            ],
            [
              "Endurance ride target (Zone 2)",
              ok ? `${result.zones[1].lowBpm}–${result.zones[1].highBpm} bpm` : DASH,
            ],
            [
              "Sub-threshold target (Zone 4)",
              ok ? `${result.zones[3].lowBpm}–${result.zones[3].highBpm} bpm` : DASH,
            ],
            ["FTP used for power zones", ok && result.hasFtp ? `${result.ftp} W` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Friel bike heart rate zones</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Zone
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  % of LTHR
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Heart rate
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Power pairing
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
                  <td className="py-3 pr-3 align-top text-[var(--muted-foreground)]">
                    {zone.openLow ? "up to " : ""}
                    {zone.openLow
                      ? `${PCT.format(zone.high * 100)}%`
                      : `${PCT.format(zone.low * 100)}–${PCT.format(zone.high * 100)}%`}
                    {zone.openHigh ? "+" : ""}
                  </td>
                  <td className="py-3 pr-3 align-top font-semibold">
                    {zone.lowBpm}–{zone.highBpm}
                    {zone.openHigh ? "+" : ""}
                  </td>
                  <td className="py-3 align-top text-[var(--muted-foreground)]">
                    {zone.power}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Coggan power zones from your FTP</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Zone
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  % of FTP
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Watts
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.powerZones : []).map((zone) => (
                <tr key={zone.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3">
                    <span className="font-semibold">{zone.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {zone.title}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                    {PCT.format(zone.low * 100)}–{PCT.format(zone.high * 100)}
                    {zone.openHigh ? "+" : ""}%
                  </td>
                  <td className="py-2.5 font-semibold">
                    {result.hasFtp
                      ? `${zone.lowWatts}–${zone.highWatts}${zone.openHigh ? "+" : ""}`
                      : DASH}
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
        Heart rate lags power by 30 to 90 seconds and drifts upward in heat and on long rides, so
        for efforts under about three minutes trust watts or perceived effort instead. General
        training information only — speak to a doctor before hard efforts if you have a heart
        condition.
      </p>
    </main>
  );
}
