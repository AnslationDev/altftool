"use client";

import { useMemo, useState } from "react";
import { AirVent, Check, Copy, RotateCcw } from "lucide-react";

import { USAGE_PRESETS, computeInverterPayback } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  capacity: "1.5",
  capacityUnit: "ton",
  usage: "standard",
  eflh: String(USAGE_PRESETS.standard.eflh),
  inverterIseer: "5.2",
  fixedIseer: "3.65",
  inverterPrice: "42000",
  fixedPrice: "32000",
  tariff: "8",
  escalation: "5",
  horizon: "10",
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
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [capacityUnit, setCapacityUnit] = useState(DEFAULTS.capacityUnit);
  const [usage, setUsage] = useState(DEFAULTS.usage);
  const [eflh, setEflh] = useState(DEFAULTS.eflh);
  const [inverterIseer, setInverterIseer] = useState(DEFAULTS.inverterIseer);
  const [fixedIseer, setFixedIseer] = useState(DEFAULTS.fixedIseer);
  const [inverterPrice, setInverterPrice] = useState(DEFAULTS.inverterPrice);
  const [fixedPrice, setFixedPrice] = useState(DEFAULTS.fixedPrice);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [escalation, setEscalation] = useState(DEFAULTS.escalation);
  const [horizon, setHorizon] = useState(DEFAULTS.horizon);
  const [showSchedule, setShowSchedule] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeInverterPayback({
        capacity,
        capacityUnit,
        eflh,
        inverterIseer,
        fixedIseer,
        inverterPrice,
        fixedPrice,
        tariff,
        escalation,
        horizon,
      }),
    [
      capacity,
      capacityUnit,
      eflh,
      inverterIseer,
      fixedIseer,
      inverterPrice,
      fixedPrice,
      tariff,
      escalation,
      horizon,
    ],
  );

  const failed = Boolean(result.error);

  const applyUsage = (key) => {
    setUsage(key);
    if (USAGE_PRESETS[key]) setEflh(String(USAGE_PRESETS[key].eflh));
  };

  const headline = failed
    ? DASH
    : result.paybackYears === null
      ? "No payback"
      : result.paybackYears === 0
        ? "Immediate"
        : `${NUM.format(result.paybackYears)} years`;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Inverter AC Payback Calculator",
      `Capacity: ${INT.format(result.capacityW)} W`,
      `Inverter unit: ${INT.format(result.invKwh)} kWh/year`,
      `Fixed-speed unit: ${INT.format(result.fixKwh)} kWh/year`,
      `Energy saved: ${INT.format(result.kwhSaved)} kWh/year (${NUM.format(result.energySavingPct)}%)`,
      `Price premium: ${INR.format(result.premium)}`,
      `First-year saving: ${INR.format(result.firstYearSaving)}`,
      `Payback: ${headline}`,
      `Savings over ${result.years} years: ${INR.format(result.totalSavings)}`,
      `Net benefit after the premium: ${INR.format(result.netBenefit)}`,
      `CO₂ avoided over ${result.years} years: ${INT.format(result.co2SavedKg)} kg`,
    ].join("\n");
  }, [failed, result, headline]);

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
    setCapacity(DEFAULTS.capacity);
    setCapacityUnit(DEFAULTS.capacityUnit);
    setUsage(DEFAULTS.usage);
    setEflh(DEFAULTS.eflh);
    setInverterIseer(DEFAULTS.inverterIseer);
    setFixedIseer(DEFAULTS.fixedIseer);
    setInverterPrice(DEFAULTS.inverterPrice);
    setFixedPrice(DEFAULTS.fixedPrice);
    setTariff(DEFAULTS.tariff);
    setEscalation(DEFAULTS.escalation);
    setHorizon(DEFAULTS.horizon);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Inverter unit consumption", DASH],
        ["Fixed-speed unit consumption", DASH],
        ["Energy saved each year", DASH],
        ["Price premium to repay", DASH],
        ["First-year bill saving", DASH],
        ["Savings over the analysis period", DASH],
        ["Net benefit after the premium", DASH],
        ["CO₂ avoided", DASH],
      ]
    : [
        ["Inverter unit consumption", `${INT.format(result.invKwh)} kWh/yr`],
        ["Fixed-speed unit consumption", `${INT.format(result.fixKwh)} kWh/yr`],
        [
          "Energy saved each year",
          `${INT.format(result.kwhSaved)} kWh (${NUM.format(result.energySavingPct)}%)`,
        ],
        ["Price premium to repay", INR.format(result.premium)],
        ["First-year bill saving", INR.format(result.firstYearSaving)],
        [`Savings over ${result.years} years`, INR.format(result.totalSavings)],
        ["Net benefit after the premium", INR.format(result.netBenefit)],
        ["CO₂ avoided", `${INT.format(result.co2SavedKg)} kg`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AirVent className="h-4 w-4" aria-hidden="true" />
          Appliance economics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Inverter AC Payback Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compares the running cost of an inverter air conditioner against a fixed-speed one using
          their BEE ISEER ratings, then works out how long the higher purchase price takes to repay
          itself at your tariff.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-capacity">
              Cooling capacity
            </label>
            <input
              id="ac-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-capacity-unit">
              Capacity unit
            </label>
            <select
              id="ac-capacity-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={capacityUnit}
              onChange={(event) => setCapacityUnit(event.target.value)}
            >
              <option value="ton">Tons (TR)</option>
              <option value="kw">Kilowatts (kW)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ac-usage">
              Usage pattern
            </label>
            <select
              id="ac-usage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={usage}
              onChange={(event) => applyUsage(event.target.value)}
            >
              {Object.values(USAGE_PRESETS).map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-eflh">
              Equivalent full-load hours / year
            </label>
            <input
              id="ac-eflh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={eflh}
              onChange={(event) => setEflh(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-tariff">
              Electricity tariff (₹ per kWh)
            </label>
            <input
              id="ac-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-inv-iseer">
              Inverter unit ISEER
            </label>
            <input
              id="ac-inv-iseer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.05"
              value={inverterIseer}
              onChange={(event) => setInverterIseer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-fix-iseer">
              Fixed-speed unit ISEER
            </label>
            <input
              id="ac-fix-iseer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.05"
              value={fixedIseer}
              onChange={(event) => setFixedIseer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-inv-price">
              Inverter unit installed price (₹)
            </label>
            <input
              id="ac-inv-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={inverterPrice}
              onChange={(event) => setInverterPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-fix-price">
              Fixed-speed unit installed price (₹)
            </label>
            <input
              id="ac-fix-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={fixedPrice}
              onChange={(event) => setFixedPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-esc">
              Tariff increase (% per year)
            </label>
            <input
              id="ac-esc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-20"
              max="30"
              step="0.5"
              value={escalation}
              onChange={(event) => setEscalation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-horizon">
              Analysis period (years)
            </label>
            <input
              id="ac-horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="25"
              step="1"
              value={horizon}
              onChange={(event) => setHorizon(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Payback period
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
              {failed ? "Fix the input above to see a result." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy inverter AC payback result"
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

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Year-by-year savings</h2>
            <button
              type="button"
              onClick={() => setShowSchedule((value) => !value)}
              aria-expanded={showSchedule}
              className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {showSchedule ? "Hide" : "Show"}
            </button>
          </div>
          {showSchedule && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Year
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Saving
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Cumulative
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {INR.format(row.saving)}
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          row.cumulative >= result.premium
                            ? "text-[var(--success)]"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {INR.format(row.cumulative)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Real consumption depends on room insulation, thermostat
        setting, servicing and ambient temperature, and ISEER is measured under standard test
        conditions rather than in your home.
      </p>
    </main>
  );
}
