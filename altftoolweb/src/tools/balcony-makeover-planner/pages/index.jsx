"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flower2, RotateCcw } from "lucide-react";
import {
  BALCONY_IMPOSED_LOAD_KN_M2,
  FLOOR_FINISHES,
  WALKWAY_MM,
  finishById,
  planBalcony,
} from "../lib";

const DEFAULTS = {
  length: "3",
  depth: "1.2",
  finish: "wpc-deck",
  rate: "3500",
  planters: "4",
  planterDia: "300",
  planterHeight: "300",
  planterCost: "800",
  seats: "2",
  seatCost: "4000",
  lights: "3",
  lightCost: "900",
  storeys: "3",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value, decimals = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(value);

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [finish, setFinish] = useState(DEFAULTS.finish);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [planters, setPlanters] = useState(DEFAULTS.planters);
  const [planterDia, setPlanterDia] = useState(DEFAULTS.planterDia);
  const [planterHeight, setPlanterHeight] = useState(DEFAULTS.planterHeight);
  const [planterCost, setPlanterCost] = useState(DEFAULTS.planterCost);
  const [seats, setSeats] = useState(DEFAULTS.seats);
  const [seatCost, setSeatCost] = useState(DEFAULTS.seatCost);
  const [lights, setLights] = useState(DEFAULTS.lights);
  const [lightCost, setLightCost] = useState(DEFAULTS.lightCost);
  const [storeys, setStoreys] = useState(DEFAULTS.storeys);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planBalcony({
        lengthM: toNumber(length),
        depthM: toNumber(depth),
        finishId: finish,
        finishRatePerM2: toNumber(rate),
        planters: toNumber(planters),
        planterDiameterMm: toNumber(planterDia),
        planterHeightMm: toNumber(planterHeight),
        planterCost: toNumber(planterCost),
        seats: toNumber(seats),
        seatCost: toNumber(seatCost),
        lights: toNumber(lights),
        lightCost: toNumber(lightCost),
        storeys: toNumber(storeys),
      }),
    [
      length,
      depth,
      finish,
      rate,
      planters,
      planterDia,
      planterHeight,
      planterCost,
      seats,
      seatCost,
      lights,
      lightCost,
      storeys,
    ],
  );

  const error = plan.error || "";

  const changeFinish = (id) => {
    setFinish(id);
    const preset = finishById(id);
    if (preset) setRate(String(preset.ratePerM2));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Balcony makeover plan",
      `Balcony: ${num(toNumber(length))} m x ${num(toNumber(depth))} m = ${num(plan.areaM2)} m² (${num(plan.areaSqft, 1)} sq ft)`,
      `Floor: ${plan.finishLabel} — ${money(plan.floorCost)}`,
      `Planters: ${toNumber(planters)} — ${money(plan.planterTotal)}`,
      `Seating: ${toNumber(seats)} — ${money(plan.seatingTotal)}`,
      `Lighting: ${toNumber(lights)} — ${money(plan.lightingTotal)}`,
      `Total budget: ${money(plan.totalCost)} (${money(plan.costPerSqft)} per sq ft)`,
      `Added load: ${num(plan.addedKgPerM2, 1)} kg/m² = ${num(plan.addedKnPerM2, 2)} kN/m², ${num(plan.allowanceUsedPercent, 1)}% of the code allowance`,
    ].join("\n");
  }, [error, length, depth, planters, seats, lights, plan]);

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
    setDepth(DEFAULTS.depth);
    setFinish(DEFAULTS.finish);
    setRate(DEFAULTS.rate);
    setPlanters(DEFAULTS.planters);
    setPlanterDia(DEFAULTS.planterDia);
    setPlanterHeight(DEFAULTS.planterHeight);
    setPlanterCost(DEFAULTS.planterCost);
    setSeats(DEFAULTS.seats);
    setSeatCost(DEFAULTS.seatCost);
    setLights(DEFAULTS.lights);
    setLightCost(DEFAULTS.lightCost);
    setStoreys(DEFAULTS.storeys);
    setCopied(false);
  };

  const fields = [
    ["bal-length", "Balcony length (m)", length, setLength, { min: "0.5", max: "20", step: "0.1" }],
    ["bal-depth", "Balcony depth (m)", depth, setDepth, { min: "0.5", max: "20", step: "0.1" }],
    ["bal-rate", "Floor rate (INR per m², laid)", rate, setRate, { min: "0", step: "100" }],
    ["bal-storeys", "Storeys in the building", storeys, setStoreys, { min: "1", max: "100", step: "1" }],
    ["bal-planters", "Planters", planters, setPlanters, { min: "0", max: "60", step: "1" }],
    ["bal-planter-dia", "Planter diameter (mm)", planterDia, setPlanterDia, { min: "50", max: "1500", step: "10" }],
    ["bal-planter-height", "Planter height (mm)", planterHeight, setPlanterHeight, { min: "50", max: "1500", step: "10" }],
    ["bal-planter-cost", "Cost per planted pot (INR)", planterCost, setPlanterCost, { min: "0", step: "50" }],
    ["bal-seats", "Seats", seats, setSeats, { min: "0", max: "20", step: "1" }],
    ["bal-seat-cost", "Cost per seat (INR)", seatCost, setSeatCost, { min: "0", step: "250" }],
    ["bal-lights", "Light fittings", lights, setLights, { min: "0", max: "40", step: "1" }],
    ["bal-light-cost", "Cost per light (INR)", lightCost, setLightCost, { min: "0", step: "50" }],
  ];

  const loadTone =
    !error && plan.allowanceUsedPercent >= 60
      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
      : "bg-[var(--muted)] text-[var(--muted-foreground)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flower2 className="h-4 w-4" aria-hidden="true" />
          Balcony
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Balcony Makeover Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a floor finish, add planters, seating and lights, and see the budget alongside
          something most balcony plans skip: how much weight the makeover puts on a cantilevered slab.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="bal-finish">
            Floor finish
          </label>
          <select
            id="bal-finish"
            className={`mt-2 ${INPUT_CLASS}`}
            value={finish}
            onChange={(event) => changeFinish(event.target.value)}
          >
            {FLOOR_FINISHES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} — {option.loadKgM2} kg/m²
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter, attrs]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(event) => {
                  setter(event.target.value);
                  setCopied(false);
                }}
                {...attrs}
              />
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Makeover budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : money(plan.totalCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : `${num(plan.areaM2)} m² (${num(plan.areaSqft, 1)} sq ft) · ${money(plan.costPerSqft)} per sq ft`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the balcony makeover plan"
              className={GHOST_BTN}
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
          {[
            ["Floor finish", error ? DASH : `${plan.finishLabel} — ${money(plan.floorCost)}`],
            ["Planters", error ? DASH : money(plan.planterTotal)],
            ["Seating", error ? DASH : money(plan.seatingTotal)],
            ["Lighting", error ? DASH : money(plan.lightingTotal)],
            ["Seats the length can take", error ? DASH : plan.seatsThatFit],
            ["Depth left in front of a chair", error ? DASH : `${num(Math.max(0, plan.depthAfterSeating), 0)} mm`],
            ["Railing height for this building", error ? DASH : `${num(plan.railingHeightMm, 0)} mm`],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>

        {!error && plan.seatingFitsDepth && !plan.canWalkPastSeating ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            A chair fits, but only {num(Math.max(0, plan.depthAfterSeating), 0)} mm is left behind it —
            less than the {WALKWAY_MM} mm someone needs to walk past. Folding or bench seating along
            the rail keeps the balcony usable.
          </p>
        ) : null}

        {!error && !plan.seatingFitsDepth && toNumber(seats) > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            The balcony is shallower than the {num(plan.seatingDepthMm, 0)} mm a chair and its leg room
            need. A wall-hung drop-leaf ledge with stools is the usual answer at this depth.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Weight added to the slab</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Floor finish", error ? DASH : `${num(plan.floorLoadKg, 1)} kg`],
            ["Planters, filled and watered", error ? DASH : `${num(plan.planterLoadKg, 1)} kg`],
            ["Each planter weighs", error ? DASH : `${num(plan.perPlanterKg, 1)} kg`],
            ["People and furniture", error ? DASH : `${num(plan.seatingLoadKg, 1)} kg`],
            ["Total added", error ? DASH : `${num(plan.totalAddedKg, 1)} kg`],
            ["Spread over the floor", error ? DASH : `${num(plan.addedKgPerM2, 1)} kg/m²`],
            ["In code units", error ? DASH : `${num(plan.addedKnPerM2, 2)} kN/m²`],
            [
              `Share of the ${BALCONY_IMPOSED_LOAD_KN_M2} kN/m² allowance`,
              error ? DASH : `${num(plan.allowanceUsedPercent, 1)}%`,
            ],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>

        <p className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${loadTone}`}>
          {error ? DASH : plan.loadVerdict}
        </p>

        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          IS 875 (Part 2) sets the imposed load for balconies in residential buildings at{" "}
          {BALCONY_IMPOSED_LOAD_KN_M2} kN/m². This screening check compares your plan against that
          figure so you can see whether it is light or heading for the limit. It is not a structural
          design — an existing slab's real capacity depends on its reinforcement and condition, so
          anything approaching the allowance, and any change to the railing, needs a structural
          engineer and your housing society's approval.
        </p>
      </section>
    </main>
  );
}
