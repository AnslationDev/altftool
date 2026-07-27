"use client";

import { useMemo, useState } from "react";
import { AlarmClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  COMPOUNDING,
  DAY_COUNT_BASES,
  EU_MINIMUM_RECOVERY_EUR,
  PRESETS,
  buildAccrualTable,
  computeLateFee,
  ukFixedCompensation,
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
  GBP: "en-GB",
  EUR: "en-IE",
  USD: "en-US",
  INR: "en-IN",
  AED: "en-AE",
  SGD: "en-SG",
  AUD: "en-AU",
  CAD: "en-CA",
};

const todayISO = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const DEFAULTS = {
  invoiceAmount: "100000",
  currency: "INR",
  dueDate: "2026-01-31",
  graceDays: "0",
  rate: "18",
  basis: "act/365",
  compounding: "simple",
  flatFee: "0",
  percentFee: "0",
  capPercent: "0",
  preset: "custom",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [invoiceAmount, setInvoiceAmount] = useState(DEFAULTS.invoiceAmount);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [dueDate, setDueDate] = useState(DEFAULTS.dueDate);
  const [paymentDate, setPaymentDate] = useState(todayISO);
  const [graceDays, setGraceDays] = useState(DEFAULTS.graceDays);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [basis, setBasis] = useState(DEFAULTS.basis);
  const [compounding, setCompounding] = useState(DEFAULTS.compounding);
  const [flatFee, setFlatFee] = useState(DEFAULTS.flatFee);
  const [percentFee, setPercentFee] = useState(DEFAULTS.percentFee);
  const [capPercent, setCapPercent] = useState(DEFAULTS.capPercent);
  const [preset, setPreset] = useState(DEFAULTS.preset);
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

  const num = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }), []);

  const input = useMemo(
    () => ({
      invoiceAmount: toNumber(invoiceAmount),
      dueDateISO: dueDate,
      paymentDateISO: paymentDate,
      graceDays: toNumber(graceDays),
      annualRatePercent: toNumber(rate),
      basis,
      compoundingId: compounding,
      flatFee: toNumber(flatFee),
      percentFeePercent: toNumber(percentFee),
      capPercent: toNumber(capPercent),
    }),
    [invoiceAmount, dueDate, paymentDate, graceDays, rate, basis, compounding, flatFee, percentFee, capPercent],
  );

  const result = useMemo(() => computeLateFee(input), [input]);
  const table = useMemo(() => (result.error ? [] : buildAccrualTable(input, 12)), [result, input]);

  const applyPreset = (id) => {
    setPreset(id);
    const chosen = PRESETS[id];
    if (!chosen || id === "custom") return;
    if (chosen.annualRatePercent !== undefined) setRate(String(chosen.annualRatePercent));
    if (chosen.basis) setBasis(chosen.basis);
    if (chosen.compounding) setCompounding(chosen.compounding);
    if (chosen.graceDays !== undefined) setGraceDays(String(chosen.graceDays));
    if (chosen.fixedFeeRule === "uk") {
      setCurrency("GBP");
      setFlatFee(String(ukFixedCompensation(toNumber(invoiceAmount))));
    }
    if (chosen.fixedFeeRule === "eu") {
      setCurrency("EUR");
      setFlatFee(String(EU_MINIMUM_RECOVERY_EUR));
    }
    if (id === "india-msme") setCurrency("INR");
  };

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Invoice Late Fee Calculator",
      `Invoice amount: ${money(toNumber(invoiceAmount))}`,
      `Days late: ${result.daysLate} (chargeable ${result.chargeableDays} after ${result.graceDays} days grace)`,
      `Rate: ${num.format(toNumber(rate))}% a year, ${DAY_COUNT_BASES[basis].label}, ${COMPOUNDING[compounding].label}`,
      `Interest: ${money(result.interest)}`,
      `Flat fee: ${money(result.flatFee)}`,
      `Percentage fee: ${money(result.percentFee)}`,
      `Total late charge: ${money(result.totalFee)}${result.capApplied ? " (capped)" : ""}`,
      `Total now payable: ${money(result.totalPayable)}`,
    ].join("\n");
  }, [result, money, invoiceAmount, rate, basis, compounding, num]);

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
    setInvoiceAmount(DEFAULTS.invoiceAmount);
    setCurrency(DEFAULTS.currency);
    setDueDate(DEFAULTS.dueDate);
    setPaymentDate(todayISO());
    setGraceDays(DEFAULTS.graceDays);
    setRate(DEFAULTS.rate);
    setBasis(DEFAULTS.basis);
    setCompounding(DEFAULTS.compounding);
    setFlatFee(DEFAULTS.flatFee);
    setPercentFee(DEFAULTS.percentFee);
    setCapPercent(DEFAULTS.capPercent);
    setPreset(DEFAULTS.preset);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlarmClock className="h-4 w-4" aria-hidden="true" />
          Overdue invoices
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Invoice Late Fee Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Interest plus fixed and percentage late fees on an overdue invoice, using the day-count
          basis and compounding your contract actually specifies.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="lf-preset">Start from a known term set</label>
          <select id="lf-preset" className={`mt-2 ${INPUT_CLASS}`} value={preset} onChange={(e) => applyPreset(e.target.value)}>
            {Object.values(PRESETS).map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Presets that float with a central-bank rate load an illustrative rate only — replace it
            with the reference rate in force on your due date.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-amount">Invoice amount outstanding</label>
            <input id="lf-amount" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="100" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-currency">Currency</label>
            <select id="lf-currency" className={`mt-2 ${INPUT_CLASS}`} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CURRENCY_LOCALES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-due">Due date</label>
            <input id="lf-due" className={`mt-2 ${INPUT_CLASS}`} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-paid">Payment date (or today, if unpaid)</label>
            <input id="lf-paid" className={`mt-2 ${INPUT_CLASS}`} type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-rate">Interest rate (% a year)</label>
            <input id="lf-rate" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.25" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-grace">Grace period (days)</label>
            <input id="lf-grace" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="0" step="1" value={graceDays} onChange={(e) => setGraceDays(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-basis">Day-count basis</label>
            <select id="lf-basis" className={`mt-2 ${INPUT_CLASS}`} value={basis} onChange={(e) => setBasis(e.target.value)}>
              {Object.values(DAY_COUNT_BASES).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-comp">Interest accrual</label>
            <select id="lf-comp" className={`mt-2 ${INPUT_CLASS}`} value={compounding} onChange={(e) => setCompounding(e.target.value)}>
              {Object.values(COMPOUNDING).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-flat">Fixed / statutory fee</label>
            <input id="lf-flat" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={flatFee} onChange={(e) => setFlatFee(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lf-pct">One-off penalty (% of invoice)</label>
            <input id="lf-pct" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.5" value={percentFee} onChange={(e) => setPercentFee(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lf-cap">Cap on total charges (% of invoice, 0 = none)</label>
            <input id="lf-cap" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={capPercent} onChange={(e) => setCapPercent(e.target.value)} />
          </div>
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total late charge
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.totalFee) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.onTime
                  ? "Paid on or before the due date — nothing chargeable"
                  : `${result.daysLate} days late, ${result.chargeableDays} chargeable`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the late fee breakdown" className={GHOST_BTN} disabled={!summary}>
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
            ["Interest", ok ? money(result.interest) : DASH],
            ["Interest per chargeable day", ok && result.chargeableDays > 0 ? money(result.dailyInterest) : DASH],
            ["Fixed / statutory fee", ok ? money(result.flatFee) : DASH],
            ["Percentage penalty", ok ? money(result.percentFee) : DASH],
            ["Days counted for interest", ok ? `${result.countedDays ?? 0} (${result.basis})` : DASH],
            ["Effective annual cost of the charge", ok && result.chargeableDays > 0 ? `${num.format(result.effectiveAnnualPercent)}%` : DASH],
            ["Total now payable", ok ? money(result.totalPayable) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.capApplied && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            The charge hit your cap of {money(result.capAmount)} and has been limited to it.
          </p>
        )}
      </section>

      {table.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">How the charge grows if it stays unpaid</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Days past due</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Interest</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Total charge</th>
                  <th scope="col" className="py-2 text-right font-semibold">Payable</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.day} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.day}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money(row.interest)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.total)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.payable)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Whether a late fee is enforceable depends on your
        contract and on local law — several jurisdictions cap penalty rates or strike out charges
        that are punitive rather than compensatory. Check with a qualified adviser before invoicing a
        penalty.
      </p>
    </main>
  );
}
