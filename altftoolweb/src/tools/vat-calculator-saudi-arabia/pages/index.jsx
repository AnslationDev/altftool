"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  KSA_LEGACY_VAT_RATE,
  KSA_MANDATORY_REGISTRATION_THRESHOLD,
  KSA_SIMPLIFIED_INVOICE_LIMIT,
  KSA_STANDARD_VAT_RATE,
  KSA_VOLUNTARY_REGISTRATION_THRESHOLD,
  KSA_ZERO_VAT_RATE,
  calculateKsaVat,
  ksaRegistrationStatus,
} from "../lib";

const SAR = new Intl.NumberFormat("en-SA", {
  style: "currency",
  currency: "SAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PLAIN = new Intl.NumberFormat("en-SA", { maximumFractionDigits: 2 });

const money = (value) => SAR.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  amount: "1150",
  quantity: "1",
  discount: "0",
  rate: String(KSA_STANDARD_VAT_RATE),
  mode: "inclusive",
  turnover: "500000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const RATE_OPTIONS = [
  { value: String(KSA_STANDARD_VAT_RATE), label: "15% standard (from 1 July 2020)" },
  { value: String(KSA_LEGACY_VAT_RATE), label: "5% legacy (Jan 2018 - Jun 2020)" },
  { value: String(KSA_ZERO_VAT_RATE), label: "0% zero-rated supply" },
];

const MODES = [
  { value: "inclusive", label: "Remove VAT", hint: "Price already includes VAT" },
  { value: "exclusive", label: "Add VAT", hint: "Price is before VAT" },
];

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [turnover, setTurnover] = useState(DEFAULTS.turnover);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateKsaVat({
        amount: amount.trim() === "" ? NaN : amount,
        quantity: quantity.trim() === "" ? NaN : quantity,
        discountPercent: discount.trim() === "" ? 0 : discount,
        rate: rate.trim() === "" ? NaN : rate,
        mode,
      }),
    [amount, quantity, discount, rate, mode],
  );

  const registration = useMemo(
    () => ksaRegistrationStatus(turnover.trim() === "" ? NaN : turnover),
    [turnover],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? "—" : money(value));

  const headline = hasError ? "—" : mode === "inclusive" ? money(result.vat) : money(result.gross);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "VAT Calculator Saudi Arabia",
      `Mode: ${mode === "inclusive" ? "Remove VAT (extract from gross)" : "Add VAT (net to gross)"}`,
      `VAT rate: ${PLAIN.format(result.rate)}% (fraction ${result.vatFraction})`,
      `Quantity: ${PLAIN.format(result.quantity)}`,
      `Line discount: ${PLAIN.format(result.discountPercent)}% = ${money(result.discountAmount)}`,
      `Taxable amount: ${money(result.net)}`,
      `VAT: ${money(result.vat)}`,
      `Total including VAT: ${money(result.gross)}`,
    ].join("\n");
  }, [hasError, mode, result]);

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
    setAmount(DEFAULTS.amount);
    setQuantity(DEFAULTS.quantity);
    setDiscount(DEFAULTS.discount);
    setRate(DEFAULTS.rate);
    setMode(DEFAULTS.mode);
    setTurnover(DEFAULTS.turnover);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Saudi VAT · 15%
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          VAT Calculator Saudi Arabia
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pull 15% VAT back out of a tax-inclusive riyal price with the 3/23 fraction, or add it to a
          net price — with line discounts and the legacy 5% rate for older invoices.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Direction</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {MODES.map((option) => {
              const active = mode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(option.value)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {option.label}
                  <span
                    className={`block text-xs font-normal ${active ? "opacity-90" : "text-[var(--muted-foreground)]"}`}
                  >
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ksa-amount">
              {mode === "inclusive" ? "Unit price including VAT (SAR)" : "Unit price before VAT (SAR)"}
            </label>
            <input
              id="ksa-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksa-quantity">
              Quantity
            </label>
            <input
              id="ksa-quantity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksa-discount">
              Line discount (%)
            </label>
            <input
              id="ksa-discount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksa-rate">
              VAT rate
            </label>
            <select
              id="ksa-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            >
              {RATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "inclusive" ? "VAT inside the price" : "Total including VAT"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : mode === "inclusive"
                  ? `Gross x ${result.vatFraction} at ${PLAIN.format(result.rate)}%`
                  : `${PLAIN.format(result.rate)}% on a taxable amount of ${money(result.net)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Saudi VAT result"
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
          {[
            ["Line total before discount", show(result.grossBeforeDiscount)],
            [
              `Discount${hasError ? "" : ` (${PLAIN.format(result.discountPercent)}%)`}`,
              hasError ? "—" : `- ${money(result.discountAmount)}`,
            ],
            ["Taxable amount (excluding VAT)", show(result.net)],
            [`VAT at ${hasError ? "—" : `${PLAIN.format(result.rate)}%`}`, show(result.vat)],
            ["Total including VAT", show(result.gross)],
            ["Unit price including VAT", show(result.unitGross)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.needsFullTaxInvoice
              ? `Above SAR ${PLAIN.format(KSA_SIMPLIFIED_INVOICE_LIMIT)} a supply to a consumer normally needs a full tax invoice rather than a simplified one.`
              : `At or below SAR ${PLAIN.format(KSA_SIMPLIFIED_INVOICE_LIMIT)} a simplified tax invoice is generally acceptable for a consumer sale.`}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">ZATCA registration threshold check</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="ksa-turnover">
            Taxable supplies in the last 12 months (SAR)
          </label>
          <input
            id="ksa-turnover"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={turnover}
            onChange={(event) => setTurnover(event.target.value)}
          />
        </div>
        {registration.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {registration.error}
          </p>
        ) : (
          <div className="mt-3" aria-live="polite" role="status">
            <p
              className={`text-sm font-semibold ${
                registration.status === "mandatory" ? "text-[var(--danger)]" : "text-[var(--success)]"
              }`}
            >
              {registration.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{registration.detail}</p>
            {registration.status !== "mandatory" && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {money(registration.toMandatory)} more in taxable supplies would make registration
                compulsory.
              </p>
            )}
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Mandatory threshold SAR {PLAIN.format(KSA_MANDATORY_REGISTRATION_THRESHOLD)} · voluntary
          threshold SAR {PLAIN.format(KSA_VOLUNTARY_REGISTRATION_THRESHOLD)}.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Real estate disposals carry the separate Real Estate
        Transaction Tax rather than VAT, and e-invoicing (Fatoora) format rules apply on top of these
        figures — check your obligations with ZATCA or a licensed adviser.
      </p>
    </main>
  );
}
