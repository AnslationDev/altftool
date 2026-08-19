"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import { APPLIANCES, SPECIES, calculateFirewood } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const ONE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const MONEY = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DEFAULTS = {
  basis: "demand",
  heatDemand: "60",
  demandUnit: "mmbtu",
  hoursPerDay: "6",
  seasonDays: "120",
  burnRateKgH: "2",
  species: "redOak",
  appliance: "noncatStove",
  logLengthIn: "16",
  stackHeightFt: "4",
  pricePerCord: "300",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [basis, setBasis] = useState(DEFAULTS.basis);
  const [heatDemand, setHeatDemand] = useState(DEFAULTS.heatDemand);
  const [demandUnit, setDemandUnit] = useState(DEFAULTS.demandUnit);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [seasonDays, setSeasonDays] = useState(DEFAULTS.seasonDays);
  const [burnRateKgH, setBurnRateKgH] = useState(DEFAULTS.burnRateKgH);
  const [species, setSpecies] = useState(DEFAULTS.species);
  const [appliance, setAppliance] = useState(DEFAULTS.appliance);
  const [logLengthIn, setLogLengthIn] = useState(DEFAULTS.logLengthIn);
  const [stackHeightFt, setStackHeightFt] = useState(DEFAULTS.stackHeightFt);
  const [pricePerCord, setPricePerCord] = useState(DEFAULTS.pricePerCord);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copiedTimeoutRef.current), []);

  const result = useMemo(
    () =>
      calculateFirewood({
        basis,
        heatDemand,
        demandUnit,
        hoursPerDay,
        seasonDays,
        burnRateKgH,
        species,
        appliance,
        logLengthIn,
        stackHeightFt,
        pricePerCord,
      }),
    [
      basis,
      heatDemand,
      demandUnit,
      hoursPerDay,
      seasonDays,
      burnRateKgH,
      species,
      appliance,
      logLengthIn,
      stackHeightFt,
      pricePerCord,
    ],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Firewood Cord Calculator",
      `Species: ${result.speciesLabel} — ${result.mmbtuPerCord} MMBtu per cord`,
      `Appliance: ${result.applianceLabel} at ${result.efficiencyPercent}% efficiency`,
      `Basis: ${result.basisNote}`,
      `Firewood needed: ${NUM.format(result.cords)} full cords (${NUM.format(result.faceCords)} face cords at ${result.logLengthIn}" logs)`,
      `Volume: ${ONE.format(result.cubicFeet)} ft³ (${NUM.format(result.cubicMetres)} m³)`,
      `Weight: ${INT.format(result.totalPounds)} lb (${INT.format(result.totalKg)} kg) seasoned`,
      `Stack: ${ONE.format(result.stackLengthFt)} ft long at ${result.stackHeightFt} ft high and ${result.logLengthIn}" deep`,
      `Heat delivered: ${ONE.format(result.deliveredMMBtu)} MMBtu (${INT.format(result.deliveredKwh)} kWh)`,
      `Cost: ${MONEY.format(result.totalCost)} at ${MONEY.format(Number(pricePerCord) || 0)} per cord`,
      `Cost per delivered MMBtu: ${MONEY.format(result.costPerDeliveredMMBtu)}`,
    ].join("\n");
  }, [failed, result, pricePerCord]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBasis(DEFAULTS.basis);
    setHeatDemand(DEFAULTS.heatDemand);
    setDemandUnit(DEFAULTS.demandUnit);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setSeasonDays(DEFAULTS.seasonDays);
    setBurnRateKgH(DEFAULTS.burnRateKgH);
    setSpecies(DEFAULTS.species);
    setAppliance(DEFAULTS.appliance);
    setLogLengthIn(DEFAULTS.logLengthIn);
    setStackHeightFt(DEFAULTS.stackHeightFt);
    setPricePerCord(DEFAULTS.pricePerCord);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Face cords", DASH],
        ["Heat per cord", DASH],
        ["Stacked volume", DASH],
        ["Seasoned weight", DASH],
        ["Stack length", DASH],
        ["Heat delivered to the room", DASH],
        ["Total cost", DASH],
        ["Cost per delivered MMBtu", DASH],
      ]
    : [
        ["Face cords", `${NUM.format(result.faceCords)} at ${result.logLengthIn}" logs`],
        [
          "Heat per cord",
          `${result.mmbtuPerCord} MMBtu · ${INT.format(result.poundsPerCord)} lb (${INT.format(result.kgPerCord)} kg)`,
        ],
        [
          "Stacked volume",
          `${ONE.format(result.cubicFeet)} ft³ (${NUM.format(result.cubicMetres)} m³)`,
        ],
        [
          "Seasoned weight",
          `${INT.format(result.totalPounds)} lb (${INT.format(result.totalKg)} kg)`,
        ],
        [
          "Stack length",
          `${ONE.format(result.stackLengthFt)} ft (${ONE.format(result.stackLengthM)} m) at ${result.stackHeightFt} ft high`,
        ],
        [
          "Heat delivered to the room",
          `${ONE.format(result.deliveredMMBtu)} MMBtu (${INT.format(result.deliveredKwh)} kWh)`,
        ],
        ["Total cost", MONEY.format(result.totalCost)],
        ["Cost per delivered MMBtu", MONEY.format(result.costPerDeliveredMMBtu)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Home heating
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Firewood Cord Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out full cords, face cords, weight and stack length for a heating season from the
          species you burn and how efficient your stove or fireplace is.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fw-basis">
              Work it out from
            </label>
            <select
              id="fw-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={basis}
              onChange={(event) => setBasis(event.target.value)}
            >
              <option value="demand">Heat I need for the season</option>
              <option value="burn">How much I actually burn</option>
            </select>
          </div>

          {basis === "demand" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="fw-demand">
                  Heat needed for the season
                </label>
                <input
                  id="fw-demand"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  step="1"
                  value={heatDemand}
                  onChange={(event) => setHeatDemand(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="fw-demand-unit">
                  Heat unit
                </label>
                <select
                  id="fw-demand-unit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={demandUnit}
                  onChange={(event) => setDemandUnit(event.target.value)}
                >
                  <option value="mmbtu">Million BTU (MMBtu)</option>
                  <option value="kwh">Kilowatt-hours (kWh)</option>
                  <option value="gj">Gigajoules (GJ)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="fw-hours">
                  Burning hours per day
                </label>
                <input
                  id="fw-hours"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(event) => setHoursPerDay(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="fw-days">
                  Heating season (days)
                </label>
                <input
                  id="fw-days"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="365"
                  step="1"
                  value={seasonDays}
                  onChange={(event) => setSeasonDays(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="fw-rate">
                  Burn rate (kg of wood per hour)
                </label>
                <input
                  id="fw-rate"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  max="30"
                  step="0.1"
                  value={burnRateKgH}
                  onChange={(event) => setBurnRateKgH(event.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="fw-species">
              Wood species
            </label>
            <select
              id="fw-species"
              className={`mt-2 ${INPUT_CLASS}`}
              value={species}
              onChange={(event) => setSpecies(event.target.value)}
            >
              {Object.values(SPECIES).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label} — {option.mmbtuPerCord} MMBtu/cord
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-appliance">
              Burning appliance
            </label>
            <select
              id="fw-appliance"
              className={`mt-2 ${INPUT_CLASS}`}
              value={appliance}
              onChange={(event) => setAppliance(event.target.value)}
            >
              {Object.values(APPLIANCES).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label} — {Math.round(option.efficiency * 100)}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-log">
              Log length / stack depth (inches)
            </label>
            <input
              id="fw-log"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="48"
              step="1"
              value={logLengthIn}
              onChange={(event) => setLogLengthIn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-height">
              Stack height (feet)
            </label>
            <input
              id="fw-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="8"
              step="0.5"
              value={stackHeightFt}
              onChange={(event) => setStackHeightFt(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fw-price">
              Delivered price per full cord
            </label>
            <input
              id="fw-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={pricePerCord}
              onChange={(event) => setPricePerCord(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Firewood needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(result.cords)} cords`}
            </p>
            <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
              {failed ? "Fix the input above to see a result." : result.basisNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy firewood calculation result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A full cord is 128 ft³ stacked 4 × 4 × 8 ft; a face cord is only 4 × 8 ft by the log length,
        so 16-inch logs give three face cords per full cord. Figures assume seasoned wood at about
        20% moisture — burning unseasoned wood roughly halves the useful heat and coats the flue with
        creosote.
      </p>
    </main>
  );
}
