"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  UAE_MANDATORY_REGISTRATION_THRESHOLD,
  UAE_STANDARD_VAT_RATE,
  UAE_TOURIST_REFUND_MIN_SPEND,
  UAE_VOLUNTARY_REGISTRATION_THRESHOLD,
  calculateUaeVat,
  uaeRegistrationStatus,
} from "../lib";

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PLAIN = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 2 });

const money = (value) => AED.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  amount: "1000",
  quantity: "1",
  rate: String(UAE_STANDARD_VAT_RATE),
  mode: "exclusive",
  turnover: "500000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const RATE_PRESETS = [
  { value: "5", label: "5% standard" },
  { value: "0", label: "0% zero-rated" },
];

const MODES = [
  { value: "exclusive", label: "Add VAT", hint: "Amount is before VAT" },
  { value: "inclusive", label: "Remove VAT", hint: "Amount already includes VAT" },
];

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [turnover, setTurnover] = useState(DEFAULTS.turnover);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateUaeVat({
        amount: amount.trim() === "" ? NaN : amount,
        rate: rate.trim() === "" ? NaN : rate,
        quantity: quantity.trim() === "" ? NaN : quantity,
        mode,
      }),
    [amount, rate, quantity, mode],
  );

  const registration = useMemo(
    () => uaeRegistrationStatus(turnover.trim() === "" ? NaN : turnover),
    [turnover],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? "—" : money(value));

  const headline = hasError
    ? "—"
    : mode === "inclusive"
      ? money(result.vat)
      : money(result.gross);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "VAT Calculator UAE",
      `Mode: ${mode === "inclusive" ? "Remove VAT (price includes VAT)" : "Add VAT (price excludes VAT)"}`,
      `VAT rate: ${PLAIN.format(result.rate)}%`,
      `Quantity: ${PLAIN.format(result.quantity)}`,
      `Net (excluding VAT): ${money(result.net)}`,
      `VAT amount: ${money(result.vat)}`,
      `Gross (including VAT): ${money(result.gross)}`,
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
    setRate(DEFAULTS.rate);
    setMode(DEFAULTS.mode);
    setTurnover(DEFAULTS.turnover);
    setCopied(false);
  };

  const ratePreset = RATE_PRESETS.some((preset) => preset.value === rate) ? rate : "custom";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          UAE VAT · 5%
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">VAT Calculator UAE</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add 5% VAT to a net price, or pull the VAT back out of a tax-inclusive price using the
          5/105 fraction the Federal Tax Authority applies.
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
            <label className={LABEL_CLASS} htmlFor="uae-amount">
              {mode === "inclusive" ? "Price including VAT (AED)" : "Price excluding VAT (AED)"}
            </label>
            <input
              id="uae-amount"
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
            <label className={LABEL_CLASS} htmlFor="uae-quantity">
              Quantity
            </label>
            <input
              id="uae-quantity"
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
            <label className={LABEL_CLASS} htmlFor="uae-rate-preset">
              Supply type
            </label>
            <select
              id="uae-rate-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratePreset}
              onChange={(event) => {
                if (event.target.value !== "custom") setRate(event.target.value);
              }}
            >
              {RATE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Custom rate</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="uae-rate">
              VAT rate (%)
            </label>
            <input
              id="uae-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
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
          <div role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "inclusive" ? "VAT contained in the price" : "Total payable including VAT"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : mode === "inclusive"
                  ? `Extracted with the ${result.vatFraction} fraction`
                  : `${PLAIN.format(result.rate)}% added to ${money(result.net)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy UAE VAT result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" role="status" aria-live="polite">
          {[
            ["Net amount (excluding VAT)", show(result.net)],
            [`VAT at ${hasError ? "—" : `${PLAIN.format(result.rate)}%`}`, show(result.vat)],
            ["Gross amount (including VAT)", show(result.gross)],
            ["Unit price excluding VAT", show(result.unitNet)],
            ["Unit price including VAT", show(result.unitGross)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.rate > 0 && (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]"
          >
            {mode === "inclusive"
              ? `VAT = gross x ${result.vatFraction}. On ${money(result.gross)} that is ${money(result.vat)}.`
              : `VAT = net x ${PLAIN.format(result.rate)}%. On ${money(result.net)} that is ${money(result.vat)}.`}
          </p>
        )}

        {!hasError && (
          <p role="status" aria-live="polite" className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.qualifiesForTouristRefund
              ? `This invoice total clears the AED ${PLAIN.format(UAE_TOURIST_REFUND_MIN_SPEND)} minimum spend for the tourist VAT refund scheme.`
              : `Below the AED ${PLAIN.format(UAE_TOURIST_REFUND_MIN_SPEND)} minimum invoice value for the tourist VAT refund scheme.`}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Registration threshold check</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="uae-turnover">
            Taxable supplies in the last 12 months (AED)
          </label>
          <input
            id="uae-turnover"
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
                {money(registration.toMandatory)} of further taxable supplies would trigger mandatory
                registration.
              </p>
            )}
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Mandatory threshold AED {PLAIN.format(UAE_MANDATORY_REGISTRATION_THRESHOLD)} · voluntary
          threshold AED {PLAIN.format(UAE_VOLUNTARY_REGISTRATION_THRESHOLD)}.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Zero-rated, exempt and reverse-charge supplies follow
        specific conditions in the Decree-Law — confirm the treatment of your supply with the Federal
        Tax Authority or a registered tax agent.
      </p>
    </main>
  );
}
