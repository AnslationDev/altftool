"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";

import {
  BILLING_INCREMENTS,
  ROUNDING_MODES,
  computeInvoice,
  priceLine,
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

const START_LINES = [
  { id: 1, description: "Discovery workshop", time: "12:30", rate: "80", taxable: true },
  { id: 2, description: "Interface build", time: "6h 45m", rate: "120", taxable: true },
  { id: 3, description: "Client calls", time: "2.25", rate: "80", taxable: true },
];

const DEFAULTS = {
  currency: "USD",
  increment: "15",
  mode: "up",
  discountPercent: "0",
  discountFlat: "0",
  taxPercent: "20",
  expenses: "0",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [lines, setLines] = useState(START_LINES);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [increment, setIncrement] = useState(DEFAULTS.increment);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [discountPercent, setDiscountPercent] = useState(DEFAULTS.discountPercent);
  const [discountFlat, setDiscountFlat] = useState(DEFAULTS.discountFlat);
  const [taxPercent, setTaxPercent] = useState(DEFAULTS.taxPercent);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const locale = CURRENCY_LOCALES[currency] ?? "en-US";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const hoursFmt = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }), []);

  const incrementMinutes = useMemo(
    () => BILLING_INCREMENTS.find((item) => item.id === increment)?.minutes ?? 0,
    [increment],
  );

  const priced = useMemo(
    () =>
      lines.map((line) =>
        priceLine({
          time: line.time,
          rate: toNumber(line.rate),
          incrementMinutes,
          mode,
          taxable: line.taxable,
          description: line.description,
        }),
      ),
    [lines, incrementMinutes, mode],
  );

  const invoice = useMemo(
    () =>
      computeInvoice({
        lines: priced,
        discountPercent: toNumber(discountPercent),
        discountFlat: toNumber(discountFlat),
        taxPercent: toNumber(taxPercent),
        expenses: toNumber(expenses),
      }),
    [priced, discountPercent, discountFlat, taxPercent, expenses],
  );

  const ok = !invoice.error;

  const updateLine = (id, field, value) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  };

  const addLine = () => {
    setLines((prev) => {
      const nextId = prev.reduce((max, line) => Math.max(max, line.id), 0) + 1;
      return [...prev, { id: nextId, description: "", time: "1:00", rate: "80", taxable: true }];
    });
  };

  const removeLine = (id) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Timesheet to Invoice",
      `Lines: ${invoice.lineCount}`,
      `Logged: ${hoursFmt.format(invoice.loggedHours)} h`,
      `Billed: ${hoursFmt.format(invoice.billedHours)} h`,
      `Subtotal: ${money(invoice.subtotal)}`,
      `Discount: ${money(invoice.discount)}`,
      `Tax: ${money(invoice.tax)}`,
      `Expenses: ${money(invoice.expenses)}`,
      `Invoice total: ${money(invoice.total)}`,
    ].join("\n");
  }, [ok, invoice, money, hoursFmt]);

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
    setLines(START_LINES);
    setCurrency(DEFAULTS.currency);
    setIncrement(DEFAULTS.increment);
    setMode(DEFAULTS.mode);
    setDiscountPercent(DEFAULTS.discountPercent);
    setDiscountFlat(DEFAULTS.discountFlat);
    setTaxPercent(DEFAULTS.taxPercent);
    setExpenses(DEFAULTS.expenses);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Billing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Timesheet to Invoice Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste time as 7:30, 7.5 or 7h 30m, set your billing increment, and get the billable total
          with discount, tax and pass-through expenses.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Billing rules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-increment">Billing increment</label>
            <select id="ts-increment" className={`mt-2 ${INPUT_CLASS}`} value={increment} onChange={(e) => setIncrement(e.target.value)}>
              {BILLING_INCREMENTS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-mode">Rounding rule</label>
            <select id="ts-mode" className={`mt-2 ${INPUT_CLASS}`} value={mode} onChange={(e) => setMode(e.target.value)}>
              {Object.values(ROUNDING_MODES).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-currency">Currency</label>
            <select id="ts-currency" className={`mt-2 ${INPUT_CLASS}`} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CURRENCY_LOCALES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-tax">Tax / VAT / GST (%)</label>
            <input id="ts-tax" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.5" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-discpct">Discount (%)</label>
            <input id="ts-discpct" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="1" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-discflat">Flat discount</label>
            <input id="ts-discflat" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={discountFlat} onChange={(e) => setDiscountFlat(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ts-exp">Pass-through expenses (not taxed here)</label>
            <input id="ts-exp" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Timesheet lines</h2>
          <button type="button" onClick={addLine} className={GHOST_BTN} aria-label="Add a timesheet line">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </button>
        </div>

        <div className="mt-4 grid gap-5">
          {lines.map((line, index) => {
            const row = priced[index];
            return (
              <div key={line.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLASS} htmlFor={`ts-desc-${line.id}`}>Task</label>
                    <input
                      id={`ts-desc-${line.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, "description", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`ts-time-${line.id}`}>Time logged</label>
                    <input
                      id={`ts-time-${line.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      inputMode="text"
                      value={line.time}
                      onChange={(e) => updateLine(line.id, "time", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`ts-rate-${line.id}`}>Hourly rate</label>
                    <input
                      id={`ts-rate-${line.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={line.rate}
                      onChange={(e) => updateLine(line.id, "rate", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold" htmlFor={`ts-taxable-${line.id}`}>
                      <input
                        id={`ts-taxable-${line.id}`}
                        type="checkbox"
                        className="h-5 w-5 accent-[var(--primary)]"
                        checked={line.taxable}
                        onChange={(e) => updateLine(line.id, "taxable", e.target.checked)}
                      />
                      Taxable
                    </label>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className={GHOST_BTN}
                      aria-label={`Remove line ${index + 1}`}
                      disabled={lines.length === 1}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm">
                  {row.error ? (
                    <span role="alert" className="inline-block rounded-md bg-[var(--danger-soft)] px-3 py-2 font-medium text-[var(--danger)]">
                      {row.error}
                    </span>
                  ) : (
                    <span className="text-[var(--muted-foreground)]">
                      {hoursFmt.format(row.loggedHours)} h logged → billed {hoursFmt.format(row.billedHours)} h ={" "}
                      <strong className="text-[var(--foreground)]">{money(row.amount)}</strong>
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {invoice.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {invoice.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Invoice total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(invoice.total) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${hoursFmt.format(invoice.billedHours)} billable hours across ${invoice.lineCount} lines` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the invoice summary" className={GHOST_BTN} disabled={!summary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the timesheet" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Hours logged", ok ? `${hoursFmt.format(invoice.loggedHours)} h` : DASH],
            ["Hours billed after rounding", ok ? `${hoursFmt.format(invoice.billedHours)} h` : DASH],
            ["Added by the increment", ok ? `${hoursFmt.format(invoice.roundingHours)} h` : DASH],
            ["Subtotal", ok ? money(invoice.subtotal) : DASH],
            ["Discount", ok ? `-${money(invoice.discount)}` : DASH],
            ["Taxable value after discount", ok ? money(invoice.netTaxable) : DASH],
            ["Tax", ok ? money(invoice.tax) : DASH],
            ["Expenses", ok ? money(invoice.expenses) : DASH],
            ["Effective rate per billed hour", ok ? money(invoice.effectiveHourly) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Whether a supply is taxable, and at what rate, depends on where you and
        your client are established and on reverse-charge rules for cross-border services — check
        with a qualified accountant before you issue the invoice.
      </p>
    </main>
  );
}
