"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

import {
  GST_RATES,
  REGISTRATION_TYPES,
  SUPPLY_NATURES,
  SUPPLY_TYPES,
  checkGstOnAdvance,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

const DEFAULTS = {
  advanceAmount: "118000",
  supplyType: "services",
  registration: "regular",
  supplyNature: "intra",
  gstRate: "18",
  rateKnown: true,
  amountIncludesGst: true,
  reverseCharge: false,
  exportUnderLut: false,
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setState((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const amount = toNumber(state.advanceAmount);
    const rate = toNumber(state.gstRate);
    if (Number.isNaN(amount) || Number.isNaN(rate)) {
      return { error: "Enter the advance amount and the GST rate as numbers." };
    }
    return checkGstOnAdvance({
      advanceAmount: amount,
      gstRate: rate,
      supplyType: state.supplyType,
      registration: state.registration,
      supplyNature: state.supplyNature,
      rateKnown: state.rateKnown,
      amountIncludesGst: state.amountIncludesGst,
      reverseCharge: state.reverseCharge,
      exportUnderLut: state.exportUnderLut,
    });
  }, [state]);

  const ok = !result.error;
  const payable = ok && result.status === "payable";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "GST on Advance Received",
      `Verdict: ${result.statusLabel}`,
      `Advance: ${money(result.advanceAmount)}`,
      payable ? `Taxable value: ${money(result.taxableValue)}` : "Taxable value: —",
      payable ? `Rate applied: ${result.appliedRate}%` : "Rate applied: —",
      payable
        ? result.resolvedNature === "intra"
          ? `CGST ${money(result.cgst)} + SGST ${money(result.sgst)}`
          : `IGST ${money(result.igst)}`
        : "Tax split: —",
      payable ? `Total tax: ${money(result.totalTax)}` : "Total tax: —",
      payable ? `Liable to pay: ${result.liableParty === "recipient" ? "Recipient (reverse charge)" : "Supplier"}` : "",
      "",
      "Why:",
      ...result.reasons.map((reason) => `- ${reason}`),
      "",
      "Documents:",
      ...result.documents.map((item) => `- ${item}`),
      "",
      "Reporting:",
      ...result.reporting.map((item) => `- ${item}`),
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, payable, result]);

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
    setState(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          Time of supply
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST on Advance Received Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Advances for services are taxed the day the money arrives; advances for goods are not.
          Describe the receipt and get the verdict, the tax split, the voucher to issue and the
          return line to use.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ga-amount">
              Advance received
            </label>
            <input
              id="ga-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={state.advanceAmount}
              onChange={(event) => setField("advanceAmount", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ga-supply">
              What is being supplied
            </label>
            <select
              id="ga-supply"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.supplyType}
              onChange={(event) => setField("supplyType", event.target.value)}
            >
              {SUPPLY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ga-reg">
              Supplier's registration status
            </label>
            <select
              id="ga-reg"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.registration}
              onChange={(event) => setField("registration", event.target.value)}
            >
              {REGISTRATION_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ga-nature">
              Nature of supply
            </label>
            <select
              id="ga-nature"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.supplyNature}
              onChange={(event) => setField("supplyNature", event.target.value)}
            >
              {SUPPLY_NATURES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ga-rate">
              GST rate on the supply (%)
            </label>
            <input
              id="ga-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              disabled={!state.rateKnown}
              value={state.gstRate}
              onChange={(event) => setField("gstRate", event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GST_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setField("gstRate", String(rate));
                    setField("rateKnown", true);
                  }}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
          <div className="grid content-end gap-3">
            <label className={TOGGLE_CLASS} htmlFor="ga-rate-known">
              <input
                id="ga-rate-known"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={!state.rateKnown}
                onChange={(event) => setField("rateKnown", !event.target.checked)}
              />
              Rate not determinable yet
            </label>
            <label className={TOGGLE_CLASS} htmlFor="ga-incl">
              <input
                id="ga-incl"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.amountIncludesGst}
                onChange={(event) => setField("amountIncludesGst", event.target.checked)}
              />
              Advance already includes GST
            </label>
          </div>
          <div className="flex items-end">
            <label className={TOGGLE_CLASS} htmlFor="ga-rcm">
              <input
                id="ga-rcm"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.reverseCharge}
                onChange={(event) => setField("reverseCharge", event.target.checked)}
              />
              Reverse charge applies
            </label>
          </div>
          <div className="flex items-end">
            <label className={TOGGLE_CLASS} htmlFor="ga-lut">
              <input
                id="ga-lut"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.exportUnderLut}
                onChange={(event) => setField("exportUnderLut", event.target.checked)}
              />
              Export / zero-rated under LUT
            </label>
          </div>
        </div>
      </section>

      {result.error && (
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
              Verdict
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? result.statusLabel : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? payable
                  ? `${money(result.totalTax)} of tax, payable by the ${result.liableParty === "recipient" ? "recipient under reverse charge" : "supplier"}`
                  : "No tax is due at the time this money is received"
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy GST on advance verdict"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
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
            ["Advance received", ok ? money(result.advanceAmount) : "—"],
            ["Taxable value", payable ? money(result.taxableValue) : "—"],
            [
              "Rate applied",
              payable ? `${result.appliedRate}%${result.rateWasAssumed ? " (rule 50 fallback)" : ""}` : "—",
            ],
            ["CGST", payable && result.resolvedNature === "intra" ? money(result.cgst) : "—"],
            ["SGST / UTGST", payable && result.resolvedNature === "intra" ? money(result.sgst) : "—"],
            ["IGST", payable && result.resolvedNature === "inter" ? money(result.igst) : "—"],
            ["Total tax", payable ? money(result.totalTax) : "—"],
            ["Total cash including tax", payable ? money(result.grossOutflow) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Why</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-6">
              {result.reasons.map((reason) => (
                <li key={reason} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Documents to issue</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-6">
              {result.documents.map((item) => (
                <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
            <h2 className="mt-5 text-base font-semibold">Where it is reported</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-6">
              {result.reporting.map((item) => (
                <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational summary of the CGST Act and Rules, not a legal opinion. Sector notifications
        and contract terms can change the answer — have a GST practitioner confirm the treatment
        before you file.
      </p>
    </main>
  );
}
