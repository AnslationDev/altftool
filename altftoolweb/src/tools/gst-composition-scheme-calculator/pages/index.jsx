"use client";

import { useMemo, useState } from "react";
import { Copy, ReceiptText, RotateCcw } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));
const num = (value) => {
  const parsed = Number(String(value).trim() === "" ? 0 : value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const PRESETS = [
  { label: "Trader / supplier of goods", rate: "1", limit: "15000000" },
  { label: "Manufacturer", rate: "1", limit: "15000000" },
  { label: "Restaurant service", rate: "5", limit: "15000000" },
  { label: "Other eligible service", rate: "6", limit: "5000000" },
  { label: "Custom", rate: "2", limit: "15000000" },
];

const DEFAULTS = {
  preset: "0",
  taxableTurnover: "1200000",
  exemptTurnover: "0",
  rate: PRESETS[0].rate,
  limit: PRESETS[0].limit,
  periodMonths: "3",
};

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [taxableTurnover, setTaxableTurnover] = useState(DEFAULTS.taxableTurnover);
  const [exemptTurnover, setExemptTurnover] = useState(DEFAULTS.exemptTurnover);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [limit, setLimit] = useState(DEFAULTS.limit);
  const [periodMonths, setPeriodMonths] = useState(DEFAULTS.periodMonths);
  const [copied, setCopied] = useState(false);

  const choosePreset = (index) => {
    const next = PRESETS[Number(index)] || PRESETS[0];
    setPreset(String(index));
    setRate(next.rate);
    setLimit(next.limit);
  };

  const result = useMemo(() => {
    const taxable = num(taxableTurnover);
    const exempt = num(exemptTurnover);
    const pct = num(rate);
    const cap = num(limit);
    const months = num(periodMonths);

    if ([taxable, exempt, pct, cap, months].some((value) => !Number.isFinite(value))) {
      return { error: "Please enter numeric values only." };
    }
    if ([taxable, exempt, pct, cap, months].some((value) => value < 0)) {
      return { error: "Values cannot be negative." };
    }
    if (months <= 0 || months > 12) {
      return { error: "Period should be between 1 and 12 months." };
    }

    const levy = (taxable * pct) / 100;
    const totalTurnover = taxable + exempt;
    const annualized = (totalTurnover / months) * 12;
    const headroom = cap - annualized;

    return {
      taxable,
      exempt,
      levy,
      totalTurnover,
      annualized,
      headroom,
      limitCrossed: annualized > cap,
      monthlyReserve: levy / months,
    };
  }, [exemptTurnover, limit, periodMonths, rate, taxableTurnover]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "GST Composition Scheme Estimate",
      `Business type: ${PRESETS[Number(preset)]?.label || "Custom"}`,
      `Taxable turnover: ${money(result.taxable)}`,
      `Composition levy at ${rate}%: ${money(result.levy)}`,
      `Annualized turnover check: ${money(result.annualized)} against limit ${money(num(limit))}`,
      result.limitCrossed ? "Warning: annualized turnover is above the entered limit." : `Headroom: ${money(result.headroom)}`,
      "Informational estimate only — confirm eligibility, rate and turnover definitions with your GST advisor.",
    ].join("\n");
  }, [limit, preset, rate, result]);

  const copy = async () => {
    if (!report) return;
    await navigator.clipboard?.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => {
    setPreset(DEFAULTS.preset);
    setTaxableTurnover(DEFAULTS.taxableTurnover);
    setExemptTurnover(DEFAULTS.exemptTurnover);
    setRate(DEFAULTS.rate);
    setLimit(DEFAULTS.limit);
    setPeriodMonths(DEFAULTS.periodMonths);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <ReceiptText className="h-4 w-4" /> GST planning
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">GST Composition Scheme Calculator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Estimate composition levy, annualized turnover and limit headroom for small-business GST planning.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Business type preset</span>
                <select className={FIELD} value={preset} onChange={(event) => choosePreset(event.target.value)}>
                  {PRESETS.map((item, index) => (
                    <option key={item.label} value={index}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              {[
                ["Taxable turnover for period", taxableTurnover, setTaxableTurnover],
                ["Exempt / non-GST turnover", exemptTurnover, setExemptTurnover],
                ["Composition rate (%)", rate, setRate],
                ["Turnover limit", limit, setLimit],
                ["Period months", periodMonths, setPeriodMonths],
              ].map(([label, value, setter]) => (
                <label key={label} className="block">
                  <span className="mb-1 block text-sm font-medium">{label}</span>
                  <input className={FIELD} inputMode="decimal" value={value} onChange={(event) => setter(event.target.value)} />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className={BUTTON} onClick={copy} type="button">
                <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy estimate"}
              </button>
              <button className={GHOST} onClick={reset} type="button">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">Composition result</h2>
            {result.error ? (
              <p className="mt-4 rounded-lg bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">{result.error}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {[
                  ["Taxable turnover", money(result.taxable)],
                  ["Levy payable", money(result.levy)],
                  ["Monthly reserve", money(result.monthlyReserve)],
                  ["Annualized turnover", money(result.annualized)],
                  ["Limit status", result.limitCrossed ? "Above limit" : `${money(result.headroom)} headroom`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-lg bg-[var(--muted)]/30 px-3 py-2">
                    <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
                    <strong className="text-right">{value}</strong>
                  </div>
                ))}
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  Composition taxpayers usually cannot collect tax separately or claim input tax credit. Confirm current rules before filing.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
