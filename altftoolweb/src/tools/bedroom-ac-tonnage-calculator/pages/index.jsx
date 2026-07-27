"use client";

import { useMemo, useState } from "react";
import { BedDouble, Check, Copy, RotateCcw } from "lucide-react";

import {
  CLIMATE_ZONES,
  STANDARD_TONNAGES,
  SUN_EXPOSURE,
  computeBedroomTonnage,
  coverageSqft,
  ratedBtu,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";

const DEFAULTS = {
  length: "12",
  width: "12",
  ceiling: "10",
  topFloor: false,
  sun: "average",
  climate: "composite",
  occupants: "2",
  watts: "150",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" ? Number.NaN : value;
};

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [ceiling, setCeiling] = useState(DEFAULTS.ceiling);
  const [topFloor, setTopFloor] = useState(DEFAULTS.topFloor);
  const [sun, setSun] = useState(DEFAULTS.sun);
  const [climate, setClimate] = useState(DEFAULTS.climate);
  const [occupants, setOccupants] = useState(DEFAULTS.occupants);
  const [watts, setWatts] = useState(DEFAULTS.watts);
  const [copied, setCopied] = useState(false);

  const area = useMemo(() => {
    const l = toNum(length);
    const w = toNum(width);
    if (!Number.isFinite(l) || !Number.isFinite(w)) return Number.NaN;
    return l * w;
  }, [length, width]);

  const result = useMemo(
    () =>
      computeBedroomTonnage({
        areaSqft: area,
        ceilingFt: toNum(ceiling),
        topFloor,
        sunExposure: sun,
        climate,
        occupants: toNum(occupants),
        applianceWatts: toNum(watts),
      }),
    [area, ceiling, topFloor, sun, climate, occupants, watts],
  );

  const ok = !result.error;

  const summary = ok
    ? [
        "Bedroom AC Tonnage Calculator",
        `Room: ${length} x ${width} ft (${NUM.format(result.areaSqft)} sq ft), ${ceiling} ft ceiling`,
        `Top floor: ${topFloor ? "yes" : "no"} | Sun: ${result.sunLabel}`,
        `Climate: ${result.climateLabel}`,
        `Estimated cooling load: ${NUM.format(result.totalBtu)} BTU/hr (${NUM2.format(result.exactTons)} ton)`,
        result.recommendedTons
          ? `Recommended AC: ${NUM2.format(result.recommendedTons)} ton`
          : `Recommended: ${result.unitsNeeded} units, largest standard size each`,
      ].join("\n")
    : "";

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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setCeiling(DEFAULTS.ceiling);
    setTopFloor(DEFAULTS.topFloor);
    setSun(DEFAULTS.sun);
    setClimate(DEFAULTS.climate);
    setOccupants(DEFAULTS.occupants);
    setWatts(DEFAULTS.watts);
    setCopied(false);
  };

  const rows = ok
    ? [
        ["Floor area", `${NUM.format(result.areaSqft)} sq ft`],
        ["Base load at 10 ft ceiling", `${NUM.format(result.baseLoad)} BTU/hr`],
        ["Ceiling height factor", `x ${NUM2.format(result.ceilingFactor)}`],
        ["Roof exposure factor", `x ${NUM2.format(result.roofFactor)}`],
        ["Sun exposure factor", `x ${NUM2.format(result.sunFactor)}`],
        ["Climate factor", `x ${NUM2.format(result.climateFactor)}`],
        ["Envelope load", `${NUM.format(result.envelopeLoad)} BTU/hr`],
        [
          `Extra occupants (${result.extraPeople} beyond 2)`,
          `+ ${NUM.format(result.occupantLoad)} BTU/hr`,
        ],
        ["Appliances and electronics", `+ ${NUM.format(result.applianceLoad)} BTU/hr`],
        ["Total cooling load", `${NUM.format(result.totalBtu)} BTU/hr`],
        ["Load intensity", `${NUM.format(result.btuPerSqft)} BTU/hr per sq ft`],
        ["Exact capacity needed", `${NUM2.format(result.exactTons)} ton`],
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BedDouble className="h-4 w-4" aria-hidden="true" />
          Cooling and HVAC
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bedroom AC Tonnage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Size a bedroom air conditioner from the actual heat load: floor area, ceiling height,
          whether the roof above bakes in the sun, window exposure, climate and how many people
          sleep in the room.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="room-length">
              Room length (ft)
            </label>
            <input
              id="room-length"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="4"
              step="0.5"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="room-width">
              Room width (ft)
            </label>
            <input
              id="room-width"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="4"
              step="0.5"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="room-ceiling">
              Ceiling height (ft)
            </label>
            <input
              id="room-ceiling"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="7"
              max="20"
              step="0.5"
              value={ceiling}
              onChange={(event) => setCeiling(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="room-occupants">
              People sleeping in the room
            </label>
            <input
              id="room-occupants"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={occupants}
              onChange={(event) => setOccupants(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="room-sun">
              Sun exposure
            </label>
            <select
              id="room-sun"
              className={INPUT}
              value={sun}
              onChange={(event) => setSun(event.target.value)}
            >
              {SUN_EXPOSURE.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="room-climate">
              Climate
            </label>
            <select
              id="room-climate"
              className={INPUT}
              value={climate}
              onChange={(event) => setClimate(event.target.value)}
            >
              {CLIMATE_ZONES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="room-watts">
              Electronics left running in the room (watts)
            </label>
            <input
              id="room-watts"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="5000"
              step="10"
              value={watts}
              onChange={(event) => setWatts(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              A TV plus router plus chargers is roughly 150 W. Every watt of electricity in the room
              becomes heat the AC has to remove.
            </p>
          </div>
        </div>

        <div className="mt-4 flex min-h-11 items-center gap-3">
          <input
            id="room-topfloor"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={topFloor}
            onChange={(event) => setTopFloor(event.target.checked)}
          />
          <label className="text-sm font-semibold" htmlFor="room-topfloor">
            Top floor with a sun-exposed roof directly above
          </label>
        </div>
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
              Recommended AC size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok
                ? result.recommendedTons
                  ? `${NUM2.format(result.recommendedTons)} ton`
                  : `${result.unitsNeeded} units`
                : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM.format(result.totalBtu)} BTU/hr of cooling needed (${NUM2.format(result.exactTons)} ton exact)`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the AC tonnage result"
              className={GHOST_BTN}
              disabled={!ok}
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
          {ok
            ? rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))
            : ["Floor area", "Envelope load", "Total cooling load", "Exact capacity needed"].map(
                (label) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{DASH}</dd>
                  </div>
                ),
              )}
        </dl>

        {ok && result.recommendedTons ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            A {NUM2.format(result.recommendedTons)} ton unit leaves about{" "}
            {NUM.format(result.headroomPct)}% spare capacity. Oversizing by much more than 25% makes
            the AC short-cycle, so it never runs long enough to pull humidity out of the room.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Standard sizes sold in India</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tonnage
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rated cooling
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Covers up to
                </th>
              </tr>
            </thead>
            <tbody>
              {STANDARD_TONNAGES.map((size) => (
                <tr
                  key={size}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    ok && result.recommendedTons === size ? "text-[var(--primary)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-semibold">{NUM2.format(size)} ton</td>
                  <td className="py-2 pr-3 text-right">{NUM.format(ratedBtu(size))} BTU/hr</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {NUM.format(coverageSqft(size))} sq ft at base conditions
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a sizing estimate built on standard rule-of-thumb load factors, not a substitute for
        a room-by-room ISHRAE or Manual-J heat load survey. For glass-heavy rooms, unusual
        orientations or ducted systems, ask an HVAC engineer to run a full calculation.
      </p>
    </main>
  );
}
