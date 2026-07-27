"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";
import {
  ISO_PRESETS,
  POWER_FRACTIONS,
  STANDARD_APERTURES,
  buildDistanceTable,
  computeFlashExposure,
  guideNumberFrom,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const STOPS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  guideNumber: "32",
  unit: "m",
  iso: "100",
  power: "1",
  mode: "aperture",
  distance: "4",
  aperture: "8",
  knownAperture: "8",
  knownDistance: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [guideNumber, setGuideNumber] = useState(DEFAULTS.guideNumber);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [iso, setIso] = useState(DEFAULTS.iso);
  const [power, setPower] = useState(DEFAULTS.power);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [aperture, setAperture] = useState(DEFAULTS.aperture);
  const [knownAperture, setKnownAperture] = useState(DEFAULTS.knownAperture);
  const [knownDistance, setKnownDistance] = useState(DEFAULTS.knownDistance);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFlashExposure({
        guideNumber: guideNumber.trim() === "" ? NaN : Number(guideNumber),
        iso: iso.trim() === "" ? NaN : Number(iso),
        powerFraction: Number(power),
        mode,
        distance: distance.trim() === "" ? NaN : Number(distance),
        aperture: Number(aperture),
        unit,
      }),
    [guideNumber, iso, power, mode, distance, aperture, unit],
  );

  const hasError = Boolean(result.error);
  const dash = "—";
  const unitLabel = unit === "ft" ? "ft" : "m";

  const derived = useMemo(
    () =>
      guideNumberFrom({
        aperture: knownAperture.trim() === "" ? NaN : Number(knownAperture),
        distance: knownDistance.trim() === "" ? NaN : Number(knownDistance),
      }),
    [knownAperture, knownDistance],
  );

  const table = useMemo(
    () =>
      hasError
        ? []
        : buildDistanceTable({
            guideNumber: result.guideNumber,
            iso: result.iso,
            powerFraction: result.powerFraction,
          }),
    [hasError, result],
  );

  const headline = hasError
    ? dash
    : mode === "distance"
      ? `${NUM.format(result.distance)} ${unitLabel}`
      : `f/${NUM.format(result.aperture)}`;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Flash Guide Number Calculator",
      `Guide number: ${result.guideNumber} (${unitLabel}, ISO 100)`,
      `Effective GN at ISO ${result.iso} and ${NUM.format(result.powerFraction * 100)}% power: ${NUM.format(result.effectiveGuideNumber)}`,
      `Aperture: f/${NUM.format(result.aperture)}`,
      `Flash-to-subject distance: ${NUM.format(result.distance)} ${unitLabel} (${NUM.format(result.distanceMetres)} m / ${NUM.format(result.distanceFeet)} ft)`,
    ].join("\n");
  }, [hasError, result, unitLabel]);

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

  const reset = () => {
    setGuideNumber(DEFAULTS.guideNumber);
    setUnit(DEFAULTS.unit);
    setIso(DEFAULTS.iso);
    setPower(DEFAULTS.power);
    setMode(DEFAULTS.mode);
    setDistance(DEFAULTS.distance);
    setAperture(DEFAULTS.aperture);
    setKnownAperture(DEFAULTS.knownAperture);
    setKnownDistance(DEFAULTS.knownDistance);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Manual flash
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Flash Guide Number Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A guide number is simply f-number × distance. Give it two of the three and it returns the
          third, scaled for the ISO you are shooting and the manual power fraction on the flash.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-value">
              Guide number at ISO 100
            </label>
            <input
              id="gn-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={guideNumber}
              onChange={(event) => setGuideNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-unit">
              Distance unit
            </label>
            <select
              id="gn-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="m">Metres</option>
              <option value="ft">Feet</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-iso">
              ISO
            </label>
            <input
              id="gn-iso"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="6"
              step="100"
              value={iso}
              onChange={(event) => setIso(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {ISO_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setIso(String(preset))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-power">
              Flash power
            </label>
            <select
              id="gn-power"
              className={`mt-2 ${INPUT_CLASS}`}
              value={power}
              onChange={(event) => setPower(event.target.value)}
            >
              {POWER_FRACTIONS.map((fraction) => (
                <option key={fraction.label} value={fraction.value}>
                  {fraction.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="gn-mode">
              Solve for
            </label>
            <select
              id="gn-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="aperture">Aperture, from a known distance</option>
              <option value="distance">Distance, from a chosen aperture</option>
            </select>
          </div>

          {mode === "aperture" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="gn-distance">
                Flash-to-subject distance ({unitLabel})
              </label>
              <input
                id="gn-distance"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={distance}
                onChange={(event) => setDistance(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="gn-aperture">
                Aperture (f-number)
              </label>
              <select
                id="gn-aperture"
                className={`mt-2 ${INPUT_CLASS}`}
                value={aperture}
                onChange={(event) => setAperture(event.target.value)}
              >
                {STANDARD_APERTURES.map((value) => (
                  <option key={value} value={value}>
                    f/{value}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {hasError && (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "distance" ? "Correct flash distance" : "Correct aperture"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `effective guide number ${NUM.format(result.effectiveGuideNumber)} ${unitLabel} at ISO ${result.iso}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy flash exposure result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Aperture", hasError ? dash : `f/${NUM.format(result.aperture)}`],
            ["Distance", hasError ? dash : `${NUM.format(result.distance)} ${unitLabel}`],
            [
              "Distance in both units",
              hasError
                ? dash
                : `${NUM.format(result.distanceMetres)} m · ${NUM.format(result.distanceFeet)} ft`,
            ],
            [
              "Effective guide number",
              hasError ? dash : `${NUM.format(result.effectiveGuideNumber)} ${unitLabel}`,
            ],
            ["ISO gain", hasError ? dash : `${STOPS.format(result.isoStops)} stops`],
            ["Power setting cost", hasError ? dash : `${STOPS.format(result.powerStops)} stops`],
            [
              "Guide number in the other unit",
              hasError
                ? dash
                : `${NUM.format(result.guideNumberOtherUnit)} ${unit === "ft" ? "m" : "ft"}`,
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
        <h2 className="text-base font-semibold">Find the guide number of a flash you own</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Take one correctly exposed manual frame at full power and ISO 100, then enter what you
          used.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-known-aperture">
              Aperture used
            </label>
            <input
              id="gn-known-aperture"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={knownAperture}
              onChange={(event) => setKnownAperture(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gn-known-distance">
              Distance ({unitLabel})
            </label>
            <input
              id="gn-known-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={knownDistance}
              onChange={(event) => setKnownDistance(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Measured guide number
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {derived.error ? dash : `${NUM.format(derived.guideNumber)} ${unitLabel}`}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Working distance by aperture</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Aperture</th>
                <th scope="col" className="py-2 text-right font-semibold">Distance ({unitLabel})</th>
              </tr>
            </thead>
            <tbody>
              {table.length === 0 ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{dash}</td>
                  <td className="py-2 text-right">{dash}</td>
                </tr>
              ) : (
                table.map((row) => (
                  <tr key={row.aperture} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">f/{row.aperture}</td>
                    <td className="py-2 text-right">{NUM.format(row.distance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Manufacturer guide numbers assume the flash head zoomed to its longest setting and a bare,
        direct flash. Bouncing, diffusers and wider zoom positions all cut the effective GN, often
        by two stops or more, so treat the result as a starting point and check the histogram.
      </p>
    </main>
  );
}
