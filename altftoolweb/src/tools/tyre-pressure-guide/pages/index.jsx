"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw, TriangleAlert } from "lucide-react";

import {
  HOT_TYRE_RISE_PSI,
  LOAD_LEVELS,
  VEHICLE_TYPES,
  recommendTyrePressure,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const psi = (value) => `${NUM1.format(Number.isFinite(value) ? value : 0)} psi`;
const bar = (value) => `${NUM2.format(Number.isFinite(value) ? value : 0)} bar`;

const DEFAULTS = {
  vehicleType: "hatchback",
  loadLevel: "light",
  highway: false,
  fillTemp: "32",
  coldestTemp: "12",
  maxSidewall: "44",
  placardFront: "",
  placardRear: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const optionalNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const requiredNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [vehicleType, setVehicleType] = useState(DEFAULTS.vehicleType);
  const [loadLevel, setLoadLevel] = useState(DEFAULTS.loadLevel);
  const [highway, setHighway] = useState(DEFAULTS.highway);
  const [fillTemp, setFillTemp] = useState(DEFAULTS.fillTemp);
  const [coldestTemp, setColdestTemp] = useState(DEFAULTS.coldestTemp);
  const [maxSidewall, setMaxSidewall] = useState(DEFAULTS.maxSidewall);
  const [placardFront, setPlacardFront] = useState(DEFAULTS.placardFront);
  const [placardRear, setPlacardRear] = useState(DEFAULTS.placardRear);
  const [copied, setCopied] = useState(false);

  const klass = VEHICLE_TYPES[vehicleType]?.klass ?? "car";
  const loadOptions = LOAD_LEVELS[klass];

  const result = useMemo(
    () =>
      recommendTyrePressure({
        vehicleType,
        loadLevel,
        highway,
        fillTempC: requiredNumber(fillTemp),
        coldestTempC: requiredNumber(coldestTemp),
        maxSidewallPsi: optionalNumber(maxSidewall),
        placardFrontPsi: optionalNumber(placardFront),
        placardRearPsi: optionalNumber(placardRear),
      }),
    [vehicleType, loadLevel, highway, fillTemp, coldestTemp, maxSidewall, placardFront, placardRear],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Tyre Pressure Guide",
      `${result.vehicleLabel} — ${result.loadLabel}`,
      `Front (cold): ${psi(result.frontPsi)} / ${bar(result.frontBar)} / ${result.frontKpa} kPa`,
      `Rear (cold): ${psi(result.rearPsi)} / ${bar(result.rearBar)} / ${result.rearKpa} kPa`,
      `Reading at ${coldestTemp} °C: front ${psi(result.frontAtColdest)}, rear ${psi(result.rearAtColdest)}`,
      `Warm-tyre reading to expect: front ${psi(result.frontHotReading)}, rear ${psi(result.rearHotReading)}`,
    ].join("\n");
  }, [result, coldestTemp]);

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
    setVehicleType(DEFAULTS.vehicleType);
    setLoadLevel(DEFAULTS.loadLevel);
    setHighway(DEFAULTS.highway);
    setFillTemp(DEFAULTS.fillTemp);
    setColdestTemp(DEFAULTS.coldestTemp);
    setMaxSidewall(DEFAULTS.maxSidewall);
    setPlacardFront(DEFAULTS.placardFront);
    setPlacardRear(DEFAULTS.placardRear);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Cold inflation pressure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tyre Pressure Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Recommended cold pressure by vehicle class, load and season — in psi, bar and kPa — with
          the temperature drift you should expect and a check against the sidewall maximum.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-vehicle">
              Vehicle type
            </label>
            <select
              id="tp-vehicle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicleType}
              onChange={(event) => {
                setVehicleType(event.target.value);
                setLoadLevel("light");
              }}
            >
              {Object.entries(VEHICLE_TYPES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-load">
              How is it loaded?
            </label>
            <select
              id="tp-load"
              className={`mt-2 ${INPUT_CLASS}`}
              value={loadLevel}
              onChange={(event) => setLoadLevel(event.target.value)}
            >
              {Object.entries(loadOptions).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-fill">
              Temperature when you inflate (°C)
            </label>
            <input
              id="tp-fill"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-40"
              max="60"
              step="1"
              value={fillTemp}
              onChange={(event) => setFillTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-cold">
              Coldest ambient before your next check (°C)
            </label>
            <input
              id="tp-cold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-40"
              max="60"
              step="1"
              value={coldestTemp}
              onChange={(event) => setColdestTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-max">
              Sidewall MAX PRESS (psi, optional)
            </label>
            <input
              id="tp-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={maxSidewall}
              onChange={(event) => setMaxSidewall(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="tp-highway"
            >
              <input
                id="tp-highway"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={highway}
                onChange={(event) => setHighway(event.target.checked)}
              />
              Sustained high-speed run planned
            </label>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-pf">
              Your placard front (psi, optional)
            </label>
            <input
              id="tp-pf"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="Leave blank for typical"
              value={placardFront}
              onChange={(event) => setPlacardFront(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-pr">
              Your placard rear (psi, optional)
            </label>
            <input
              id="tp-pr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="Leave blank for typical"
              value={placardRear}
              onChange={(event) => setPlacardRear(event.target.value)}
            />
          </div>
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
              Cold pressure — front / rear
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM1.format(result.frontPsi)} / ${NUM1.format(result.rearPsi)}` : DASH}
              <span className="ml-2 text-lg font-medium text-[var(--muted-foreground)]">psi</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.vehicleLabel} · ${result.loadLabel}` : "Fix the inputs above to see a figure"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy recommended tyre pressures"
              className={GHOST_BTN}
              disabled={!ok}
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
            ["Front in bar / kPa", ok ? `${bar(result.frontBar)} · ${result.frontKpa} kPa` : DASH],
            ["Rear in bar / kPa", ok ? `${bar(result.rearBar)} · ${result.rearKpa} kPa` : DASH],
            [
              "Typical range for this class",
              ok
                ? result.usedPlacard
                  ? "Using your placard values"
                  : `Front ${result.frontRange[0]}-${result.frontRange[1]} psi · Rear ${result.rearRange[0]}-${result.rearRange[1]} psi`
                : DASH,
            ],
            [
              "Load adder applied",
              ok ? `Front +${NUM1.format(result.loadAddFront)} psi · Rear +${NUM1.format(result.loadAddRear)} psi` : DASH,
            ],
            ["High-speed adder", ok ? `+${NUM1.format(result.highwayAdd)} psi` : DASH],
            [
              `Gauge reading at ${coldestTemp || "?"} °C`,
              ok ? `${psi(result.frontAtColdest)} front · ${psi(result.rearAtColdest)} rear` : DASH,
            ],
            [
              "Drift from the temperature change",
              ok ? `${NUM1.format(result.frontDrift)} psi front · ${NUM1.format(result.rearDrift)} psi rear` : DASH,
            ],
            [
              "Drift per 10 °C fall",
              ok ? `${NUM1.format(result.driftPerTenC)} psi` : DASH,
            ],
            [
              `Warm-tyre reading (+${HOT_TYRE_RISE_PSI} psi typical)`,
              ok ? `${psi(result.frontHotReading)} front · ${psi(result.rearHotReading)} rear` : DASH,
            ],
            ["Space-saver spare", ok ? psi(result.spareSpaceSaverPsi) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.percentLowAtColdest > 5 ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            At {coldestTemp} °C the front tyres sit about {NUM1.format(result.percentLowAtColdest)}% below target. Top
            them up on a cold morning, before driving.
          </p>
        ) : null}

        {ok && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((message) => (
              <li
                key={message}
                className="flex gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                <span>{message}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The pressure on your vehicle&apos;s placard — door jamb, fuel flap or
        swingarm sticker — is the authority, and the MAX PRESS figure on the sidewall is a
        structural ceiling rather than a recommendation. Ask a tyre technician if a tyre has been
        run flat, kerbed or repaired.
      </p>
    </main>
  );
}
