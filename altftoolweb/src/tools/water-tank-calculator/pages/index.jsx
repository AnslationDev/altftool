"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Car,
  Container,
  Copy,
  Droplets,
  Gauge,
  Info,
  Leaf,
  Ruler,
  Timer,
  Users,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const LPCD_ROWS = [
  { use: "Drinking", lpcd: 5, note: "IS 1172 domestic norm" },
  { use: "Cooking", lpcd: 5, note: "Includes utensil rinsing before cooking" },
  { use: "Bathing", lpcd: 55, note: "Largest single head — showers push this up" },
  { use: "Washing clothes & utensils", lpcd: 25, note: "Machine wash lands near the top of this" },
  { use: "Flushing", lpcd: 45, note: "Full flushing system; 6 L dual-flush cisterns cut this" },
];

const DOMESTIC_LPCD = LPCD_ROWS.reduce((sum, row) => sum + row.lpcd, 0);
const HELP_LPCD = 45;
const BATHROOM_ALLOWANCE = 15;
const GARDEN_LPSQM = 5;
const CAR_WASH_LITRES = 50;
const FT_TO_M = 0.3048;

const MARKET_SIZES = [500, 750, 1000, 1500, 2000, 5000];

const PUMP_PRESETS = [
  { label: "Municipal tap", lpm: 12 },
  { label: "0.5 HP pump", lpm: 35 },
  { label: "1 HP pump", lpm: 60 },
  { label: "1.5 HP pump", lpm: 90 },
];

const num = (value, digits = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clampMin = (value, min = 0) => Math.max(min, toNumber(value));

const inputClass =
  "h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";
const cardClass =
  "rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]";

function NumberField({ label, value, onChange, min = 0, step = 1, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`mt-2 ${inputClass}`}
      />
      {hint && <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{hint}</span>}
    </label>
  );
}

export default function ToolHome() {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(2);
  const [help, setHelp] = useState(1);
  const [bathrooms, setBathrooms] = useState(2);
  const [gardenOn, setGardenOn] = useState(true);
  const [gardenArea, setGardenArea] = useState(20);
  const [cars, setCars] = useState(1);
  const [washesPerWeek, setWashesPerWeek] = useState(3);
  const [childFactor, setChildFactor] = useState(0.6);
  const [wastagePct, setWastagePct] = useState(5);
  const [reserveDays, setReserveDays] = useState(2);

  const [shape, setShape] = useState("rect");
  const [unit, setUnit] = useState("m");
  const [dimMode, setDimMode] = useState("toLitres");
  const [freeboard, setFreeboard] = useState(true);
  const [length, setLength] = useState(1.5);
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [diameter, setDiameter] = useState(1.2);
  const [targetLitres, setTargetLitres] = useState(1000);
  const [preferredDepth, setPreferredDepth] = useState(1);
  const [ratio, setRatio] = useState(2);

  const [flowLpm, setFlowLpm] = useState(35);
  const [copied, setCopied] = useState(false);

  const demand = useMemo(() => {
    const adultL = clampMin(adults) * DOMESTIC_LPCD;
    const childL = clampMin(children) * DOMESTIC_LPCD * clampMin(childFactor);
    const helpL = clampMin(help) * HELP_LPCD;
    const bathroomL = clampMin(bathrooms) * BATHROOM_ALLOWANCE;
    const gardenL = gardenOn ? clampMin(gardenArea) * GARDEN_LPSQM : 0;
    const carL = (clampMin(cars) * clampMin(washesPerWeek) * CAR_WASH_LITRES) / 7;

    const rows = [
      {
        label: "Adults",
        detail: `${num(clampMin(adults))} × ${DOMESTIC_LPCD} lpcd (IS 1172 domestic norm)`,
        litres: adultL,
      },
      {
        label: "Children",
        detail: `${num(clampMin(children))} × ${num(DOMESTIC_LPCD * clampMin(childFactor))} lpcd (${num(
          clampMin(childFactor) * 100
        )}% of adult norm)`,
        litres: childL,
      },
      {
        label: "Domestic help (non-resident)",
        detail: `${num(clampMin(help))} × ${HELP_LPCD} lpcd (washing + flushing, no bathing)`,
        litres: helpL,
      },
      {
        label: "Bathroom & fixture cleaning",
        detail: `${num(clampMin(bathrooms))} × ${BATHROOM_ALLOWANCE} L/day allowance`,
        litres: bathroomL,
      },
      {
        label: "Garden watering",
        detail: gardenOn
          ? `${num(clampMin(gardenArea))} sq m × ${GARDEN_LPSQM} L/sq m/day`
          : "Not applicable",
        litres: gardenL,
      },
      {
        label: "Car washing",
        detail: `${num(clampMin(cars))} car(s) × ${num(clampMin(washesPerWeek))} wash/week × ${CAR_WASH_LITRES} L ÷ 7`,
        litres: carL,
      },
    ];

    const subtotal = rows.reduce((sum, row) => sum + row.litres, 0);
    const wastage = subtotal * (clampMin(wastagePct) / 100);
    const total = subtotal + wastage;
    const people = clampMin(adults) + clampMin(children);

    return { rows, subtotal, wastage, total, people, perPerson: people > 0 ? total / people : 0 };
  }, [adults, children, help, bathrooms, gardenOn, gardenArea, cars, washesPerWeek, childFactor, wastagePct]);

  const sizing = useMemo(() => {
    const days = Math.max(1, clampMin(reserveDays, 1));
    const capacity = demand.total * days;
    const overhead = capacity / 3;
    const sump = (capacity * 2) / 3;
    const recommendedChip =
      MARKET_SIZES.find((size) => size >= overhead) || MARKET_SIZES[MARKET_SIZES.length - 1];
    const chipsNeeded = overhead > 0 ? Math.ceil(overhead / recommendedChip) : 1;
    return { days, capacity, overhead, sump, recommendedChip, chipsNeeded };
  }, [demand.total, reserveDays]);

  const dims = useMemo(() => {
    const factor = unit === "ft" ? FT_TO_M : 1;
    const usableFactor = freeboard ? 0.9 : 1;

    if (dimMode === "toLitres") {
      const h = clampMin(height) * factor;
      let grossM3;
      if (shape === "rect") {
        grossM3 = clampMin(length) * factor * clampMin(width) * factor * h;
      } else {
        const radius = (clampMin(diameter) * factor) / 2;
        grossM3 = Math.PI * radius * radius * h;
      }
      const gross = grossM3 * 1000;
      return { gross, usable: gross * usableFactor };
    }

    const target = clampMin(targetLitres);
    const grossLitres = target / usableFactor;
    const volumeM3 = grossLitres / 1000;
    const depth = Math.max(0.01, clampMin(preferredDepth) * factor);
    const area = volumeM3 / depth;

    if (shape === "rect") {
      const r = Math.max(0.1, clampMin(ratio, 0.1));
      const w = Math.sqrt(area / r);
      return {
        gross: grossLitres,
        usable: target,
        suggested: { length: (w * r) / factor, width: w / factor, height: depth / factor },
      };
    }

    const d = 2 * Math.sqrt(area / Math.PI);
    return {
      gross: grossLitres,
      usable: target,
      suggested: { diameter: d / factor, height: depth / factor },
    };
  }, [
    dimMode,
    shape,
    unit,
    freeboard,
    length,
    width,
    height,
    diameter,
    targetLitres,
    preferredDepth,
    ratio,
  ]);

  const fill = useMemo(() => {
    const flow = clampMin(flowLpm);
    const volume = sizing.recommendedChip * sizing.chipsNeeded;
    if (flow <= 0) return { minutes: 0, volume, label: "—" };
    const minutes = volume / flow;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return {
      minutes,
      volume,
      label: hours > 0 ? `${hours} h ${mins} min` : `${Math.round(minutes)} min`,
    };
  }, [flowLpm, sizing.recommendedChip, sizing.chipsNeeded]);

  const unitLabel = unit === "ft" ? "ft" : "m";

  const summary = useMemo(
    () =>
      [
        "Water Tank Size Calculator",
        "",
        `Household: ${num(clampMin(adults))} adults, ${num(clampMin(children))} children, ${num(
          clampMin(help)
        )} domestic help, ${num(clampMin(bathrooms))} bathrooms`,
        "",
        "Daily requirement breakdown:",
        ...demand.rows
          .filter((row) => row.litres > 0)
          .map((row) => `  ${row.label}: ${num(row.litres)} L  (${row.detail})`),
        `  Subtotal: ${num(demand.subtotal)} L`,
        `  Wastage/leakage buffer @ ${num(clampMin(wastagePct))}%: ${num(demand.wastage)} L`,
        `  TOTAL DAILY REQUIREMENT: ${num(demand.total)} L/day`,
        `  Effective per person: ${num(demand.perPerson)} lpcd`,
        "",
        `Reserve: ${num(sizing.days)} day(s)`,
        `Recommended storage: ${num(sizing.capacity)} L`,
        `  Overhead tank (1/3): ${num(sizing.overhead)} L`,
        `  Underground sump (2/3): ${num(sizing.sump)} L`,
        `Nearest market size for the overhead tank: ${
          sizing.chipsNeeded > 1 ? `${sizing.chipsNeeded} × ` : ""
        }${num(sizing.recommendedChip)} L`,
        "",
        `Filling time for ${num(fill.volume)} L at ${num(clampMin(flowLpm))} lpm: ${fill.label}`,
        "",
        "Norms: IS 1172:1993 / CPHEEO manual — 135 lpcd domestic standard for piped supply with sewerage.",
        `Generated: ${new Date().toLocaleString("en-IN")}`,
      ].join("\n"),
    [adults, children, help, bathrooms, demand, wastagePct, sizing, fill, flowLpm]
  );

  const copySummary = async () => {
    const ok = await safeCopyText(summary);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className={`${cardClass} 2xl:p-8`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Droplets className="h-4 w-4" />
            BIS / CPHEEO norms
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Water Tank Size Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Work out how much water your home actually uses per day using the Indian standard per-capita norms,
            then size the overhead tank and sump, check the dimensions, and see how long the pump takes to fill
            it.
          </p>
          <div className="tool-compact-grid mt-6">
            {[
              ["Daily requirement", `${num(demand.total)} L`],
              ["Storage for " + num(sizing.days) + " day(s)", `${num(sizing.capacity)} L`],
              ["Overhead tank", `${num(sizing.overhead)} L`],
              ["Underground sump", `${num(sizing.sump)} L`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Your household</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-2">
              <NumberField label="Adults" value={adults} onChange={setAdults} />
              <NumberField label="Children" value={children} onChange={setChildren} />
              <NumberField label="Domestic help" value={help} onChange={setHelp} hint="Non-resident" />
              <NumberField label="Bathrooms / taps" value={bathrooms} onChange={setBathrooms} />
            </div>

            <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Leaf className="h-4 w-4 text-[var(--primary)]" />
                  Garden
                </span>
                <button
                  type="button"
                  onClick={() => setGardenOn((value) => !value)}
                  aria-pressed={gardenOn}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    gardenOn
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {gardenOn ? "Yes" : "No"}
                </button>
              </div>
              {gardenOn && (
                <div className="mt-3">
                  <NumberField
                    label="Garden area (sq m)"
                    value={gardenArea}
                    onChange={setGardenArea}
                    hint={`${num(clampMin(gardenArea) * 10.764)} sq ft · ${GARDEN_LPSQM} L per sq m per day`}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Car className="h-4 w-4 text-[var(--primary)]" />
                Car washing
              </span>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <NumberField label="Cars" value={cars} onChange={setCars} />
                <NumberField label="Washes / week" value={washesPerWeek} onChange={setWashesPerWeek} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {CAR_WASH_LITRES} L per bucket wash. A hose pipe runs closer to 100–150 L.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Child factor"
                value={childFactor}
                onChange={setChildFactor}
                step={0.05}
                hint="Practical assumption, not a BIS figure"
              />
              <NumberField
                label="Wastage buffer (%)"
                value={wastagePct}
                onChange={setWastagePct}
                hint="Leaks, overflow, spillage"
              />
            </div>

            <div className="mt-4">
              <span className="text-sm font-semibold">Reserve days</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 5, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setReserveDays(days)}
                    aria-pressed={reserveDays === days}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      reserveDays === days
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {days} day{days > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Two days is the common default for a city home on daily municipal supply. Go to 3–7 if supply is
                alternate-day or tanker-fed.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className={cardClass}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Daily requirement breakdown</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Every litre traced back to the norm it came from.
                  </p>
                </div>
                <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="p-2 font-semibold">Head</th>
                      <th className="p-2 font-semibold">How it is worked out</th>
                      <th className="p-2 text-right font-semibold">Litres / day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demand.rows.map((row) => (
                      <tr key={row.label} className="border-b border-[var(--border)]">
                        <td className="p-2 font-semibold">{row.label}</td>
                        <td className="p-2 text-xs text-[var(--muted-foreground)]">{row.detail}</td>
                        <td className="p-2 text-right tabular-nums">{num(row.litres)}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-[var(--border)]">
                      <td className="p-2 font-semibold">Subtotal</td>
                      <td className="p-2" />
                      <td className="p-2 text-right font-semibold tabular-nums">{num(demand.subtotal)}</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="p-2 font-semibold">Wastage buffer</td>
                      <td className="p-2 text-xs text-[var(--muted-foreground)]">
                        {num(clampMin(wastagePct))}% of subtotal
                      </td>
                      <td className="p-2 text-right tabular-nums">{num(demand.wastage)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="p-2 font-semibold">Total daily requirement</td>
                      <td className="p-2 text-xs text-[var(--muted-foreground)]">
                        {num(demand.perPerson)} lpcd effective across {num(demand.people)} residents
                      </td>
                      <td className="p-2 text-right text-lg font-semibold tabular-nums text-[var(--primary)]">
                        {num(demand.total)} L
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-1 flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Where 135 lpcd comes from</h2>
              </div>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                IS 1172:1993 and the CPHEEO manual fix <strong>135 litres per capita per day</strong> as the
                domestic standard for towns with piped supply and full sewerage. This is how that number splits.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[460px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="p-2 font-semibold">Use</th>
                      <th className="p-2 text-right font-semibold">lpcd</th>
                      <th className="p-2 text-right font-semibold">Share</th>
                      <th className="p-2 font-semibold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LPCD_ROWS.map((row) => (
                      <tr key={row.use} className="border-b border-[var(--border)]">
                        <td className="p-2 font-semibold">{row.use}</td>
                        <td className="p-2 text-right tabular-nums">{row.lpcd}</td>
                        <td className="p-2 text-right tabular-nums text-[var(--muted-foreground)]">
                          {num((row.lpcd / DOMESTIC_LPCD) * 100)}%
                        </td>
                        <td className="p-2 text-xs text-[var(--muted-foreground)]">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="p-2 font-semibold">Total</td>
                      <td className="p-2 text-right font-semibold tabular-nums text-[var(--primary)]">
                        {DOMESTIC_LPCD}
                      </td>
                      <td className="p-2 text-right font-semibold tabular-nums">100%</td>
                      <td className="p-2" />
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Non-resident domestic help is counted at {HELP_LPCD} lpcd — the IS 1172 figure for premises
                without bathing. Where supply is limited, CPHEEO allows a lower 70–100 lpcd basis.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-1 flex items-center gap-2">
              <Container className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Recommended storage</h2>
            </div>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              {num(demand.total)} L/day × {num(sizing.days)} day(s) reserve ={" "}
              <strong className="text-[var(--foreground)]">{num(sizing.capacity)} L</strong> of total storage.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-[var(--muted)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Overhead tank (1/3)
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">{num(sizing.overhead)} L</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Enough for one day, fed by the pump.
                </p>
              </div>
              <div className="rounded-md bg-[var(--muted)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Underground sump (2/3)
                </p>
                <p className="mt-1 text-2xl font-semibold">{num(sizing.sump)} L</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Catches the mains supply whenever it arrives.
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold">Standard market sizes (overhead)</p>
            <div className="mt-2 flex flex-wrap gap-2" aria-live="polite">
              {MARKET_SIZES.map((size) => {
                const active = size === sizing.recommendedChip;
                return (
                  <span
                    key={size}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {num(size)} L{active ? " · pick this" : ""}
                  </span>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {sizing.chipsNeeded > 1
                ? `Your overhead need of ${num(sizing.overhead)} L is beyond a single standard tank — use ${sizing.chipsNeeded} × ${num(sizing.recommendedChip)} L linked at the base.`
                : `The smallest standard tank that covers ${num(sizing.overhead)} L is the ${num(sizing.recommendedChip)} L — that leaves ${num(sizing.recommendedChip - sizing.overhead)} L of headroom.`}
            </p>
          </div>

          <div className={cardClass}>
            <div className="mb-1 flex items-center gap-2">
              <Ruler className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Dimension helper</h2>
            </div>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              1 m³ = 1000 litres. Work either direction — measure a tank, or design one for a target capacity.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDimMode(dimMode === "toLitres" ? "toDims" : "toLitres")}
                className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
              >
                <ArrowRightLeft className="h-4 w-4" />
                {dimMode === "toLitres" ? "Dimensions → litres" : "Litres → dimensions"}
              </button>
              {[
                { id: "rect", label: "Rectangular" },
                { id: "cyl", label: "Cylindrical" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setShape(item.id)}
                  aria-pressed={shape === item.id}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    shape === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {["m", "ft"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setUnit(item)}
                  aria-pressed={unit === item}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    unit === item
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item === "m" ? "Metres" : "Feet"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFreeboard((value) => !value)}
                aria-pressed={freeboard}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  freeboard
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                {freeboard ? "10% freeboard on" : "No freeboard"}
              </button>
            </div>

            {dimMode === "toLitres" ? (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {shape === "rect" ? (
                    <>
                      <NumberField
                        label={`Length (${unitLabel})`}
                        value={length}
                        onChange={setLength}
                        step={0.1}
                      />
                      <NumberField label={`Width (${unitLabel})`} value={width} onChange={setWidth} step={0.1} />
                      <NumberField
                        label={`Height (${unitLabel})`}
                        value={height}
                        onChange={setHeight}
                        step={0.1}
                      />
                    </>
                  ) : (
                    <>
                      <NumberField
                        label={`Diameter (${unitLabel})`}
                        value={diameter}
                        onChange={setDiameter}
                        step={0.1}
                      />
                      <NumberField
                        label={`Height (${unitLabel})`}
                        value={height}
                        onChange={setHeight}
                        step={0.1}
                      />
                    </>
                  )}
                </div>
                <div className="mt-4 rounded-md bg-[var(--muted)] p-4" aria-live="polite">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Usable capacity
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{num(dims.usable)} L</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    Formula:{" "}
                    {shape === "rect"
                      ? "L × W × H (in m) × 1000"
                      : "π × (D ÷ 2)² × H (in m) × 1000"}{" "}
                    = {num(dims.gross)} L brim-full
                    {freeboard ? `, minus 10% freeboard = ${num(dims.usable)} L usable.` : "."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <NumberField label="Target capacity (L)" value={targetLitres} onChange={setTargetLitres} />
                  <NumberField
                    label={`Preferred depth (${unitLabel})`}
                    value={preferredDepth}
                    onChange={setPreferredDepth}
                    step={0.1}
                  />
                  {shape === "rect" && (
                    <NumberField
                      label="Length : width ratio"
                      value={ratio}
                      onChange={setRatio}
                      step={0.1}
                      hint="2 means twice as long as wide"
                    />
                  )}
                </div>
                <div className="mt-4 rounded-md bg-[var(--muted)] p-4" aria-live="polite">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Suggested internal size
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                    {shape === "rect"
                      ? `${num(dims.suggested?.length, 2)} × ${num(dims.suggested?.width, 2)} × ${num(
                          dims.suggested?.height,
                          2
                        )} ${unitLabel}`
                      : `⌀ ${num(dims.suggested?.diameter, 2)} × ${num(dims.suggested?.height, 2)} ${unitLabel}`}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    Holds {num(targetLitres)} L usable
                    {freeboard
                      ? ` — built to ${num(dims.gross)} L brim volume so there is a 10% air gap.`
                      : " filled to the brim."}{" "}
                    Measure internal faces; brick and plaster thickness sits outside these numbers.
                  </p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setDimMode("toDims");
                setTargetLitres(sizing.recommendedChip);
              }}
              className="btn-secondary mt-3 w-full text-sm"
            >
              <Ruler className="h-4 w-4" />
              Design for my {num(sizing.recommendedChip)} L tank
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-1 flex items-center gap-2">
              <Timer className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Filling time</h2>
            </div>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              How long the pump must run to fill {num(fill.volume)} L of overhead tank.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField label="Pump flow rate (litres/min)" value={flowLpm} onChange={setFlowLpm} />
              <div className="rounded-md bg-[var(--muted)] p-4" aria-live="polite">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Time to fill</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">{fill.label}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {PUMP_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFlowLpm(preset.lpm)}
                  aria-pressed={flowLpm === preset.lpm}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    flowLpm === preset.lpm
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {preset.label} · ~{preset.lpm} lpm
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Formula: volume ÷ flow rate = minutes. Preset flow rates are typical delivery at normal domestic
              head — a longer vertical lift or a narrow pipe will drop the real figure. Time the first fill once
              and correct the number here.
            </p>
          </div>

          <div className={cardClass}>
            <div className="mb-1 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Material, placement &amp; cleaning</h2>
            </div>
            <div className="mt-3 grid gap-3 text-sm leading-6">
              {[
                [
                  "Material",
                  "Triple-layer HDPE is the default for overhead tanks — the black middle layer blocks light and stops algae. RCC is standard for underground sumps. Stainless steel costs more but lasts longest and does not leach in the sun.",
                ],
                [
                  "Placement",
                  "Keep the overhead tank at least 1.5–2 m above the highest tap — every metre of height gives you roughly 0.1 bar of pressure. Keep the sump a minimum of 2 m away from any septic tank or soak pit.",
                ],
                [
                  "Sun & heat",
                  "A shaded or insulated tank stays cooler and grows less algae. A bare black tank on an open terrace can push summer water past 45 °C.",
                ],
                [
                  "Cleaning frequency",
                  "Overhead tank every 6 months, sump once a year. Scrub the walls, do not just drain. Check for cracks and sediment at the same time.",
                ],
                [
                  "Fittings",
                  "Keep the lid locked, mesh the overflow and vent pipes against mosquitoes, and fit a float valve so the pump cannot overflow the tank.",
                ],
              ].map(([title, body]) => (
                <div key={title} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-[var(--muted-foreground)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
