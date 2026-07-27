"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";
import {
  BIKE_TYPES,
  HEIGHT_CHARTS,
  LEMOND_SADDLE_FACTOR,
  MTB_INCH_FACTOR,
  ROAD_CT_FACTOR,
  computeFrameSize,
} from "../lib";

const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const cm = (value) => (Number.isFinite(value) ? `${N1.format(value)} cm` : "—");
const inch = (value) => (Number.isFinite(value) ? `${N1.format(value)}"` : "—");

const DEFAULTS = { heightCm: "178", inseamCm: "83", bikeType: "road" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [inseamCm, setInseamCm] = useState(DEFAULTS.inseamCm);
  const [bikeType, setBikeType] = useState(DEFAULTS.bikeType);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFrameSize({
        heightCm: toNumber(heightCm),
        inseamCm: inseamCm.trim() === "" ? undefined : toNumber(inseamCm),
        bikeType,
      }),
    [heightCm, inseamCm, bikeType],
  );

  const ok = !result.error;
  const isMtb = bikeType === "mtb";

  const headline = ok
    ? isMtb
      ? inch(result.recommendedInches)
      : cm(result.recommendedCm)
    : "—";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Bicycle Frame Size",
      `${result.bikeTypeLabel} · height ${cm(result.heightCm)} · inseam ${cm(result.inseamCm)}${result.inseamEstimated ? " (estimated)" : ""}`,
      `Frame from inseam formula: ${isMtb ? inch(result.recommendedInches) : cm(result.recommendedCm)}`,
      result.chart
        ? `Manufacturer height chart: ${result.chart.size} (${result.chart.letter})`
        : "Height is outside the published chart range",
      `Road seat tube: ${cm(result.roadCt)} centre-to-top, ${cm(result.roadCc)} centre-to-centre`,
      `Mountain frame: ${inch(result.mtbInches)}`,
      `Hybrid frame: ${cm(result.hybridCm)}`,
      `Saddle height (BB to saddle top): ${cm(result.saddleHeightCm)}`,
      `Target standover height: ${cm(result.standoverIdealCm)} to ${cm(result.standoverMaxCm)}`,
    ].join("\n");
  }, [ok, result, isMtb]);

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
    setHeightCm(DEFAULTS.heightCm);
    setInseamCm(DEFAULTS.inseamCm);
    setBikeType(DEFAULTS.bikeType);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Bike fit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bicycle Frame Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Frame size follows your inseam, not your height. Enter both and get the seat tube length
          from the classic fit multipliers alongside the height band a shop will quote you, so you
          can see when the two disagree.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-height">
              Height (cm)
            </label>
            <input
              id="fs-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="230"
              step="0.5"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-inseam">
              Cycling inseam (cm)
            </label>
            <input
              id="fs-inseam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="110"
              step="0.5"
              value={inseamCm}
              onChange={(event) => setInseamCm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fs-type">
              Bike type
            </label>
            <select
              id="fs-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bikeType}
              onChange={(event) => setBikeType(event.target.value)}
            >
              {Object.entries(BIKE_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Measure inseam barefoot with your back to a wall and a hardback book pulled firmly up into
          your crotch — floor to the top edge of the book. Leave it blank and it will be estimated
          from your height, which is less accurate.
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ok ? `${result.bikeTypeLabel} frame size` : "Frame size"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.chart
                  ? `Height chart says ${result.chart.size} (${result.chart.letter})`
                  : "Your height is outside the published chart — go by the inseam figure"
                : "Fix the inputs above to see a size"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy bicycle frame size result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {ok && result.inseamEstimated ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            Inseam was estimated as {cm(result.inseamCm)} from your height. Measure it for a reliable
            size.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Road seat tube, centre-to-top", ok ? cm(result.roadCt) : "—"],
            ["Road seat tube, centre-to-centre", ok ? cm(result.roadCc) : "—"],
            ["Mountain frame", ok ? `${inch(result.mtbInches)} (${cm(result.mtbCm)})` : "—"],
            ["Hybrid / city frame", ok ? cm(result.hybridCm) : "—"],
            ["Saddle height, BB centre to saddle top", ok ? cm(result.saddleHeightCm) : "—"],
            [
              "Target standover height",
              ok ? `${cm(result.standoverIdealCm)} to ${cm(result.standoverMaxCm)}` : "—",
            ],
            [
              "Standover clearance for this type",
              ok ? `${result.clearanceRange[0]}-${result.clearanceRange[1]} cm` : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your height on every chart</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Bike type</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Frame size</th>
                <th scope="col" className="py-2 text-right font-semibold">Letter</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.allCharts.map((entry) => (
                  <tr key={entry.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{entry.label}</td>
                    <td className="py-2 pr-3">{entry.band ? entry.band.size : "Off chart"}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {entry.band ? entry.band.letter : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3 font-semibold">—</td>
                  <td className="py-2 pr-3">—</td>
                  <td className="py-2 text-right">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Full {BIKE_TYPES[bikeType].toLowerCase()} height chart</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Rider height</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Frame size</th>
                <th scope="col" className="py-2 text-right font-semibold">Letter</th>
              </tr>
            </thead>
            <tbody>
              {HEIGHT_CHARTS[bikeType].map((band) => {
                const active = ok && result.chart && result.chart.minHeight === band.minHeight;
                return (
                  <tr
                    key={band.minHeight}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "bg-[var(--primary-soft)]" : ""}`}
                  >
                    <td className="py-2 pr-3">
                      {band.minHeight}-{band.maxHeight} cm
                    </td>
                    <td className="py-2 pr-3 font-semibold">{band.size}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{band.letter}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Formulas used: road seat tube = inseam x {ROAD_CT_FACTOR}; mountain frame in inches =
          inseam in cm x {MTB_INCH_FACTOR}; saddle height = inseam x {LEMOND_SADDLE_FACTOR}.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Modern frames vary a lot in reach and stack even at the same nominal size, and gravel and
        endurance geometry runs shorter than race geometry. Treat this as a starting size, then test
        ride and confirm with a fitter.
      </p>
    </main>
  );
}
