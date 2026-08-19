"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import {
  RATE_BASES,
  UTILISATION_PRESETS,
  buildCapacity,
  convertRate,
  netTakeHome,
  salaryEquivalentRate,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const CURRENCY_LOCALES = {
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
  INR: "en-IN",
  AED: "en-AE",
  SGD: "en-SG",
  AUD: "en-AU",
  CAD: "en-CA",
};

const DEFAULTS = {
  amount: "50",
  basis: "hourly",
  currency: "USD",
  hoursPerDay: "8",
  daysPerWeek: "5",
  weeksPerYear: "46",
  utilisation: "70",
  projectHours: "60",
  annualCosts: "12000",
  taxPercent: "30",
  salary: "60000",
  onCost: "15",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [basis, setBasis] = useState(DEFAULTS.basis);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek);
  const [weeksPerYear, setWeeksPerYear] = useState(DEFAULTS.weeksPerYear);
  const [utilisation, setUtilisation] = useState(DEFAULTS.utilisation);
  const [projectHours, setProjectHours] = useState(DEFAULTS.projectHours);
  const [annualCosts, setAnnualCosts] = useState(DEFAULTS.annualCosts);
  const [taxPercent, setTaxPercent] = useState(DEFAULTS.taxPercent);
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [onCost, setOnCost] = useState(DEFAULTS.onCost);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const locale = CURRENCY_LOCALES[currency] ?? "en-US";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    const precise = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    });
    return { round: (v) => formatter.format(Number.isFinite(v) ? v : 0), exact: (v) => precise.format(Number.isFinite(v) ? v : 0) };
  }, [currency]);

  const num = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }), []);

  const capacity = useMemo(
    () =>
      buildCapacity({
        hoursPerDay: toNumber(hoursPerDay),
        daysPerWeek: toNumber(daysPerWeek),
        weeksPerYear: toNumber(weeksPerYear),
        utilisationPercent: toNumber(utilisation),
      }),
    [hoursPerDay, daysPerWeek, weeksPerYear, utilisation],
  );

  const rates = useMemo(
    () =>
      convertRate({
        amount: toNumber(amount),
        basis,
        capacity,
        projectHours: toNumber(projectHours),
      }),
    [amount, basis, capacity, projectHours],
  );

  const takeHome = useMemo(() => {
    if (rates.error || capacity.error) return { error: rates.error ?? capacity.error };
    return netTakeHome({
      annualRevenue: rates.annual,
      annualCosts: toNumber(annualCosts),
      taxPercent: toNumber(taxPercent),
      billableHoursPerYear: capacity.billableHoursPerYear,
    });
  }, [rates, capacity, annualCosts, taxPercent]);

  const equivalent = useMemo(() => {
    if (capacity.error) return { error: capacity.error };
    return salaryEquivalentRate({
      salary: toNumber(salary),
      employerOnCostPercent: toNumber(onCost),
      annualCosts: toNumber(annualCosts),
      billableHoursPerYear: capacity.billableHoursPerYear,
    });
  }, [capacity, salary, onCost, annualCosts]);

  const error = capacity.error || rates.error || null;

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Freelance Contract Rate Converter",
      `Quoted: ${money.exact(toNumber(amount))} ${RATE_BASES[basis].label.toLowerCase()}`,
      `Billable capacity: ${num.format(capacity.billableHoursPerYear)} hours a year`,
      `Hourly: ${money.exact(rates.hourly)}`,
      `Daily: ${money.round(rates.daily)}`,
      `Weekly: ${money.round(rates.weekly)}`,
      `Monthly: ${money.round(rates.monthly)}`,
      `Annual: ${money.round(rates.annual)}`,
      rates.project ? `Project (${rates.projectHours} h): ${money.round(rates.project)}` : null,
      takeHome.error ? null : `Take-home after costs and tax: ${money.round(takeHome.netAnnual)} a year`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [error, money, amount, basis, capacity, rates, takeHome, num]);

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
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset all fields to defaults? This clears your entered rate, costs, and salary details and cannot be undone.",
      )
    ) {
      return;
    }
    setAmount(DEFAULTS.amount);
    setBasis(DEFAULTS.basis);
    setCurrency(DEFAULTS.currency);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setDaysPerWeek(DEFAULTS.daysPerWeek);
    setWeeksPerYear(DEFAULTS.weeksPerYear);
    setUtilisation(DEFAULTS.utilisation);
    setProjectHours(DEFAULTS.projectHours);
    setAnnualCosts(DEFAULTS.annualCosts);
    setTaxPercent(DEFAULTS.taxPercent);
    setSalary(DEFAULTS.salary);
    setOnCost(DEFAULTS.onCost);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Freelance pricing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Freelance Contract Rate Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Quote in one unit, see them all. Every conversion runs through your real billable capacity,
          so unpaid admin time and weeks off are priced in rather than wished away.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your rate</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-amount">Rate</label>
            <input id="fr-amount" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-basis">Quoted per</label>
            <select id="fr-basis" className={`mt-2 ${INPUT_CLASS}`} value={basis} onChange={(e) => setBasis(e.target.value)}>
              {Object.values(RATE_BASES).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-currency">Currency</label>
            <select id="fr-currency" className={`mt-2 ${INPUT_CLASS}`} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CURRENCY_LOCALES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-projhours">Hours in the fixed-fee project</label>
            <input id="fr-projhours" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={projectHours} onChange={(e) => setProjectHours(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Billable capacity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-hpd">Hours a working day</label>
            <input id="fr-hpd" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="24" step="0.5" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-dpw">Days a week</label>
            <input id="fr-dpw" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="7" step="0.5" value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-wpy">Weeks worked a year (52 minus leave)</label>
            <input id="fr-wpy" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="52" step="1" value={weeksPerYear} onChange={(e) => setWeeksPerYear(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-util">Utilisation (% of hours that are billable)</label>
            <input id="fr-util" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="1" max="100" step="1" value={utilisation} onChange={(e) => setUtilisation(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {UTILISATION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setUtilisation(String(preset.percent))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.percent}%
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Equivalent hourly rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : money.exact(rates.hourly)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `${num.format(capacity.billableHoursPerYear)} billable hours a year`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted rates" className={GHOST_BTN} disabled={!summary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy rates"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Per day", error ? DASH : money.round(rates.daily)],
            ["Per week", error ? DASH : money.round(rates.weekly)],
            ["Per month", error ? DASH : money.round(rates.monthly)],
            ["Per year", error ? DASH : money.round(rates.annual)],
            ["Fixed project fee", error || !rates.project ? DASH : `${money.round(rates.project)} for ${rates.projectHours} h`],
            ["Value of each scheduled hour", error ? DASH : money.exact(rates.perScheduledHour)],
            ["Unbilled hours a year", error ? DASH : num.format(capacity.unbilledHoursPerYear)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What you actually keep</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-costs">Business costs a year</label>
            <input id="fr-costs" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="500" value={annualCosts} onChange={(e) => setAnnualCosts(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-tax">Tax and contributions on profit (%)</label>
            <input id="fr-tax" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="99" step="1" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          </div>
        </div>
        {takeHome.error && !error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {takeHome.error}
          </p>
        ) : null}
        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Profit before tax", takeHome.error ? DASH : money.round(takeHome.profitBeforeTax)],
            ["Tax and contributions", takeHome.error ? DASH : money.round(takeHome.tax)],
            ["Take-home a year", takeHome.error ? DASH : money.round(takeHome.netAnnual)],
            ["Take-home a month", takeHome.error ? DASH : money.round(takeHome.netMonthly)],
            ["Net per billable hour", takeHome.error ? DASH : money.exact(takeHome.netHourly)],
            ["Share of billings you keep", takeHome.error ? DASH : `${num.format(takeHome.keepRatePercent)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rate needed to replace a salary</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-salary">Gross salary you are replacing</label>
            <input id="fr-salary" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1000" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-oncost">Employer on-costs you now fund (%)</label>
            <input id="fr-oncost" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="1" value={onCost} onChange={(e) => setOnCost(e.target.value)} />
          </div>
        </div>
        {equivalent.error && !error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {equivalent.error}
          </p>
        ) : null}
        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Billings you need a year", equivalent.error ? DASH : money.round(equivalent.requiredAnnual)],
            ["Hourly rate that gets you there", equivalent.error ? DASH : money.exact(equivalent.requiredHourly)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for planning, not tax advice. Effective tax on self-employment depends on your
        country, entity type and allowances — confirm the figures with a qualified accountant before
        you set a rate or sign a contract.
      </p>
    </main>
  );
}
