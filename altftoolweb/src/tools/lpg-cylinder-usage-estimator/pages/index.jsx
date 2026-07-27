"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import {
  BIS_MIN_STOVE_EFFICIENCY_PCT,
  BURNER_TYPES,
  CYLINDER_SIZES,
  LPG_CALORIFIC_VALUE_MJ_PER_KG,
  estimateCylinderLife,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const kgs = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} kg` : DASH);
const kwh = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} kWh` : DASH);

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? DASH : DATE_FMT.format(parsed);
};

const DEFAULT_CYLINDER = "14.2";
const DEFAULT_PRICE = "900";
const DEFAULT_EFFICIENCY = String(BIS_MIN_STOVE_EFFICIENCY_PCT);
const DEFAULT_LEAD = "3";

const buildInitialBurners = () =>
  BURNER_TYPES.map((burner) => ({
    id: burner.id,
    label: burner.label,
    kw: String(burner.kw),
    count: "1",
    minutesPerDay: String(burner.minutesPerDay),
  }));

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [burners, setBurners] = useState(buildInitialBurners);
  const [cylinder, setCylinder] = useState(DEFAULT_CYLINDER);
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [efficiency, setEfficiency] = useState(DEFAULT_EFFICIENCY);
  const [startDate, setStartDate] = useState("");
  const [lead, setLead] = useState(DEFAULT_LEAD);
  const [copied, setCopied] = useState(false);

  const updateBurner = (id, patch) => {
    setBurners((current) =>
      current.map((burner) => (burner.id === id ? { ...burner, ...patch } : burner)),
    );
  };

  const cylinderKg = CYLINDER_SIZES.find((item) => item.id === cylinder)?.kg ?? 0;
  const cylinderLabel = CYLINDER_SIZES.find((item) => item.id === cylinder)?.label ?? DASH;

  const result = useMemo(
    () =>
      estimateCylinderLife({
        burners: burners.map((burner) => ({
          id: burner.id,
          label: burner.label,
          kw: toNumber(burner.kw),
          count: toNumber(burner.count),
          minutesPerDay: toNumber(burner.minutesPerDay),
        })),
        cylinderKg,
        cylinderPrice: toNumber(price),
        efficiencyPct: toNumber(efficiency),
        startDateIso: startDate,
        bookingLeadDays: toNumber(lead),
      }),
    [burners, cylinderKg, price, efficiency, startDate, lead],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "LPG Cylinder Usage Estimator",
      `Cylinder: ${cylinderLabel}`,
      `Gas used: ${kgs(result.kgPerDay)} a day, ${kgs(result.kgPerMonth)} a month`,
      `A cylinder lasts about ${num1(result.daysPerCylinder)} days`,
      `Refills a year: ${num1(result.refillsPerYear)}`,
      `Cost: ${money2(result.costPerDay)} a day, ${money(result.costPerYear)} a year`,
      result.emptyDateIso ? `Runs out around: ${prettyDate(result.emptyDateIso)}` : "",
      result.bookByDateIso ? `Book the refill by: ${prettyDate(result.bookByDateIso)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, result, cylinderLabel]);

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
    setBurners(buildInitialBurners());
    setCylinder(DEFAULT_CYLINDER);
    setPrice(DEFAULT_PRICE);
    setEfficiency(DEFAULT_EFFICIENCY);
    setStartDate("");
    setLead(DEFAULT_LEAD);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Cooking gas
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          LPG Cylinder Usage Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A burner&apos;s kilowatt rating is how fast it burns gas, so the number of minutes each
          burner runs is all that is needed to work out how long a cylinder lasts — no guessing by
          family size.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your burners on a typical day</h2>
        <ul className="mt-4 space-y-4">
          {burners.map((burner) => (
            <li
              key={burner.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <p className="text-sm font-semibold">{burner.label}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`lpg-kw-${burner.id}`}>
                    Rating (kW)
                  </label>
                  <input
                    id={`lpg-kw-${burner.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.05"
                    value={burner.kw}
                    onChange={(event) => updateBurner(burner.id, { kw: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`lpg-n-${burner.id}`}>
                    How many
                  </label>
                  <input
                    id={`lpg-n-${burner.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="20"
                    step="1"
                    value={burner.count}
                    onChange={(event) => updateBurner(burner.id, { count: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`lpg-min-${burner.id}`}>
                    Minutes a day (each)
                  </label>
                  <input
                    id={`lpg-min-${burner.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="1440"
                    step="5"
                    value={burner.minutesPerDay}
                    onChange={(event) =>
                      updateBurner(burner.id, { minutesPerDay: event.target.value })
                    }
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-cylinder">
              Cylinder size
            </label>
            <select
              id="lpg-cylinder"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cylinder}
              onChange={(event) => setCylinder(event.target.value)}
            >
              {CYLINDER_SIZES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-price">
              Refill price
            </label>
            <input
              id="lpg-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <p className={HINT_CLASS}>What you actually pay, after any subsidy transfer.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-eff">
              Stove thermal efficiency (%)
            </label>
            <input
              id="lpg-eff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
            <p className={HINT_CLASS}>
              IS 4246 sets a floor of {BIS_MIN_STOVE_EFFICIENCY_PCT}% for domestic stoves.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-lead">
              Book the refill this many days early
            </label>
            <input
              id="lpg-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={lead}
              onChange={(event) => setLead(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lpg-start">
              Date this cylinder was connected (optional)
            </label>
            <input
              id="lpg-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <p className={HINT_CLASS}>Add it to get a run-out date and a booking reminder date.</p>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              A cylinder lasts about
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${num1(result.daysPerCylinder)} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see an estimate."
                : `${kgs(result.kgPerDay)} of gas a day from ${cylinderLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy LPG usage estimate"
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
            ["Gas burned a day", failed ? DASH : kgs(result.kgPerDay)],
            ["Gas burned a month", failed ? DASH : kgs(result.kgPerMonth)],
            ["Refills a year", failed ? DASH : num1(result.refillsPerYear)],
            ["Cost per kg", failed ? DASH : money2(result.pricePerKg)],
            ["Cost a day", failed ? DASH : money2(result.costPerDay)],
            ["Cost a month", failed ? DASH : money(result.costPerMonth)],
            ["Cost a year", failed ? DASH : money(result.costPerYear)],
            ["Heat put into the hob a day", failed ? DASH : kwh(result.dailyKwhInput)],
            [
              `Heat actually reaching the pan (at ${failed ? DASH : num1(result.efficiencyPct)}%)`,
              failed ? DASH : kwh(result.dailyKwhUseful),
            ],
            ["Heat lost around the pan", failed ? DASH : kwh(result.dailyKwhWasted)],
            ["Runs out around", failed ? DASH : prettyDate(result.emptyDateIso)],
            ["Book the refill by", failed ? DASH : prettyDate(result.bookByDateIso)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the gas goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Burner
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Burns
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Minutes/day
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Gas/day
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">
                      {row.label}
                      {row.count > 1 ? ` x${row.count}` : ""}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {NUM2.format(row.gramsPerHourEach)} g/hour
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {row.minutesPerDay}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap font-semibold">
                      {kgs(row.kgPerDay)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Based on a net calorific value of {LPG_CALORIFIC_VALUE_MJ_PER_KG} MJ per kg for
            propane-butane LPG.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate, not a gauge. Real burners rarely run at full rating, cylinders vary slightly in
        fill, and a cylinder that empties far faster than this suggests should be checked for a leak
        with soap solution — never a flame.
      </p>
    </main>
  );
}
