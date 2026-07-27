"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  REFERENCE_SETPOINT_C,
  TYPICAL_FIXED_SPEED_ISEER,
  computeInverterAcCost,
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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);

const DEFAULTS = {
  tons: "1.5",
  iseer: "4.7",
  hours: "8",
  days: "30",
  setpoint: "24",
  tariff: "8",
  fixed: "0",
  months: "5",
  compare: String(TYPICAL_FIXED_SPEED_ISEER),
  stabiliser: false,
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeInverterAcCost({
        tons: toNum(form.tons),
        iseer: toNum(form.iseer),
        hoursPerDay: toNum(form.hours),
        daysPerMonth: toNum(form.days),
        setpointC: toNum(form.setpoint),
        tariff: toNum(form.tariff),
        fixedCharge: toNum(form.fixed),
        stabiliser: form.stabiliser,
        monthsPerYear: toNum(form.months),
        compareIseer: toNum(form.compare),
      }),
    [form],
  );

  const ok = !result.error;

  const summary = ok
    ? [
        "Inverter AC Electricity Cost Calculator",
        `${form.tons} ton at ISEER ${form.iseer}, ${form.hours} h/day for ${form.days} days at ${form.setpoint} C`,
        `Average draw: ${NUM.format(result.effectiveWatts)} W (${NUM2.format(result.unitsPerHour)} kWh per hour)`,
        `Monthly: ${NUM1.format(result.monthlyUnits)} kWh = ${money(result.monthlyCost)}`,
        `Per day: ${NUM2.format(result.dailyUnits)} kWh = ${money2(result.dailyCost)}`,
        `Over ${result.monthsPerYear} months: ${NUM.format(result.annualUnits)} kWh = ${money(result.annualCost)}`,
        `Versus an ISEER ${NUM2.format(result.compareIseer)} unit: saves ${money(result.monthlySaving)} a month`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Cooling and HVAC
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Inverter AC Electricity Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out what your inverter AC actually adds to the bill: average draw from the ISEER on
          the BEE label, adjusted for how cold you set the thermostat, plus standby and stabiliser
          losses that never show up in brochure figures.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="iac-tons">
              Capacity (ton)
            </label>
            <input id="iac-tons" className={INPUT} type="number" inputMode="decimal" min="0.5" max="5" step="0.1" value={form.tons} onChange={set("tons")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="iac-iseer">
              ISEER from the BEE label
            </label>
            <input id="iac-iseer" className={INPUT} type="number" inputMode="decimal" min="2" max="7" step="0.05" value={form.iseer} onChange={set("iseer")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="iac-hours">
              Hours of running per day
            </label>
            <input id="iac-hours" className={INPUT} type="number" inputMode="decimal" min="1" max="24" step="0.5" value={form.hours} onChange={set("hours")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="iac-days">
              Days used per month
            </label>
            <input id="iac-days" className={INPUT} type="number" inputMode="numeric" min="1" max="31" step="1" value={form.days} onChange={set("days")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="iac-setpoint">
              Thermostat setting (C)
            </label>
            <input id="iac-setpoint" className={INPUT} type="number" inputMode="decimal" min="16" max="32" step="1" value={form.setpoint} onChange={set("setpoint")} />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {REFERENCE_SETPOINT_C} C is the BEE default setting. Each degree lower adds about 6%.
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="iac-tariff">
              Tariff (per kWh)
            </label>
            <input id="iac-tariff" className={INPUT} type="number" inputMode="decimal" min="0" step="0.25" value={form.tariff} onChange={set("tariff")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="iac-fixed">
              Fixed monthly charge on the bill
            </label>
            <input id="iac-fixed" className={INPUT} type="number" inputMode="decimal" min="0" step="10" value={form.fixed} onChange={set("fixed")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="iac-months">
              Months of use per year
            </label>
            <input id="iac-months" className={INPUT} type="number" inputMode="numeric" min="1" max="12" step="1" value={form.months} onChange={set("months")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="iac-compare">
              Compare against a unit with ISEER
            </label>
            <input id="iac-compare" className={INPUT} type="number" inputMode="decimal" min="2" max="7" step="0.05" value={form.compare} onChange={set("compare")} />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Around {TYPICAL_FIXED_SPEED_ISEER} is typical of a fixed-speed non-inverter split AC.
            </p>
          </div>
        </div>

        <div className="mt-4 flex min-h-11 items-center gap-3">
          <input
            id="iac-stabiliser"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.stabiliser}
            onChange={(event) => setForm((prev) => ({ ...prev, stabiliser: event.target.checked }))}
          />
          <label className="text-sm font-semibold" htmlFor="iac-stabiliser">
            An external servo stabiliser is wired in (adds about 5%)
          </label>
        </div>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Monthly electricity cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.monthlyCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM1.format(result.monthlyUnits)} units a month at ${NUM.format(result.effectiveWatts)} W average draw`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the inverter AC cost result" className={GHOST_BTN} disabled={!ok}>
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
          {(ok
            ? [
                ["Average input power at rated capacity", `${NUM.format(result.inputWatts)} W`],
                ["Setpoint adjustment", `x ${NUM2.format(result.setpointFactorValue)}`],
                ["Effective average draw", `${NUM.format(result.effectiveWatts)} W`],
                ["Units per hour", `${NUM2.format(result.unitsPerHour)} kWh`],
                ["Cost per hour", money2(result.costPerHour)],
                ["Units per day", `${NUM2.format(result.dailyUnits)} kWh`],
                ["Cost per day", money2(result.dailyCost)],
                ["Cooling units per month", `${NUM1.format(result.coolingUnitsPerMonth)} kWh`],
                ["Standby units per month", `${NUM2.format(result.standbyUnitsPerMonth)} kWh`],
                ["Total units per month", `${NUM1.format(result.monthlyUnits)} kWh`],
                ["Fixed monthly charge", money(result.fixedCharge)],
                [`Units over ${result.monthsPerYear} months`, `${NUM.format(result.annualUnits)} kWh`],
                [`Cost over ${result.monthsPerYear} months`, money(result.annualCost)],
                [`Saved vs an ISEER ${NUM2.format(result.compareIseer)} unit (per month)`, money(result.monthlySaving)],
                [`Saved vs an ISEER ${NUM2.format(result.compareIseer)} unit (per year)`, money(result.annualSaving)],
                ["CO2 from a season of cooling", `${NUM.format(result.annualCo2Kg)} kg`],
              ]
            : [
                ["Effective average draw", DASH],
                ["Total units per month", DASH],
                ["Cost per day", DASH],
                ["Cost over the season", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        ISEER is a seasonal average measured under a standard test load, so a badly sized unit, a
        dirty filter, low gas or a room that leaks hot air will all push real consumption above this
        estimate. Slab-based tariffs also mean the marginal rate you pay may be higher than your
        average rate — check your last bill.
      </p>
    </main>
  );
}
