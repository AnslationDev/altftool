"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  NZ_GST_RATES,
  NZ_GST_RATE_PERCENT,
  NZ_GST_REGISTRATION_THRESHOLD,
  checkNzRegistration,
  computeNzGst,
} from "../lib";

const NZD = new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NZD0 = new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-NZ", { maximumFractionDigits: 2 });

const money = (value) => NZD.format(Number.isFinite(value) ? value : 0);
const money0 = (value) => NZD0.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  amount: "115",
  mode: "remove",
  ratePercent: String(NZ_GST_RATE_PERCENT),
  quantity: "1",
  turnover: "80000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").replace(/\$/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [ratePercent, setRatePercent] = useState(DEFAULTS.ratePercent);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [turnover, setTurnover] = useState(DEFAULTS.turnover);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeNzGst({
        amount: toNumber(amount),
        mode,
        ratePercent: toNumber(ratePercent),
        quantity: toNumber(quantity),
      }),
    [amount, mode, ratePercent, quantity],
  );

  const registration = useMemo(() => checkNzRegistration(toNumber(turnover)), [turnover]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GST Calculator New Zealand",
      `Mode: ${result.mode === "add" ? "Add GST to a GST-exclusive price" : "Remove GST from a GST-inclusive price"}`,
      `GST rate: ${result.ratePercent}%`,
      result.quantity > 1 ? `Quantity: ${result.quantity} x ${money(result.unitAmount)}` : null,
      `Price excluding GST: ${money(result.exclusive)}`,
      `GST: ${money(result.gst)}`,
      `Price including GST: ${money(result.inclusive)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

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
    setMode(DEFAULTS.mode);
    setRatePercent(DEFAULTS.ratePercent);
    setQuantity(DEFAULTS.quantity);
    setTurnover(DEFAULTS.turnover);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          New Zealand GST
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          GST Calculator New Zealand
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add 15% GST to a net price, or pull the GST out of a GST-inclusive price using Inland
          Revenue&rsquo;s 3/23 shortcut. Includes the NZ$60,000 registration threshold check.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What is the amount you have?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["add", "GST-exclusive (add GST)"],
              ["remove", "GST-inclusive (remove GST)"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`nzgst-mode-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`nzgst-mode-${value}`}
                  type="radio"
                  name="nzgst-mode"
                  className="h-4 w-4 accent-[var(--primary)]"
                  value={value}
                  checked={mode === value}
                  onChange={(event) => setMode(event.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nzgst-amount">
              Amount (NZD)
            </label>
            <input
              id="nzgst-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className={HINT_CLASS}>
              {mode === "add"
                ? "The net price before GST is applied."
                : "The shelf or invoice price that already contains GST."}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nzgst-quantity">
              Quantity
            </label>
            <input
              id="nzgst-quantity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <p className={HINT_CLASS}>Number of identical units on the line.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nzgst-rate">
              GST rate
            </label>
            <select
              id="nzgst-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratePercent}
              onChange={(event) => setRatePercent(event.target.value)}
            >
              {NZ_GST_RATES.map((rate) => (
                <option key={rate.percent} value={String(rate.percent)}>
                  {rate.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Historical rates are here for restating old invoices; use 15% for anything supplied
              on or after 1 October 2010.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              GST amount
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.gst)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `at ${result.ratePercent}% GST${result.usesThreeTwentyThirds && result.mode === "remove" ? " (inclusive price x 3 / 23)" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy New Zealand GST result"
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
            ["Price excluding GST", hasError ? DASH : money(result.exclusive)],
            ["GST at the selected rate", hasError ? DASH : money(result.gst)],
            ["Price including GST", hasError ? DASH : money(result.inclusive)],
            ["GST as a share of the inclusive price", hasError ? DASH : pct(result.gstShareOfInclusivePercent)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Do I have to register for GST?</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="nzgst-turnover">
            Taxable supplies in a 12-month period (NZD)
          </label>
          <input
            id="nzgst-turnover"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={turnover}
            onChange={(event) => setTurnover(event.target.value)}
          />
          <p className={HINT_CLASS}>
            Look back over the last 12 months, or forward over the next 12.
          </p>
        </div>

        {registration.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {registration.error}
          </p>
        ) : (
          <>
            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
                registration.mustRegister
                  ? "bg-[var(--muted)] text-[var(--primary)]"
                  : "bg-[var(--muted)] text-[var(--foreground)]"
              }`}
            >
              {registration.mustRegister
                ? `Registration is compulsory — you are ${money0(registration.excess)} over the ${money0(NZ_GST_REGISTRATION_THRESHOLD)} threshold.`
                : `Registration is voluntary — you have ${money0(registration.headroom)} of headroom before the ${money0(NZ_GST_REGISTRATION_THRESHOLD)} threshold.`}
            </p>
            <div className="mt-3 overflow-x-auto">
              <ul className="min-w-[280px] list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                {registration.filingOptions.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Rates and thresholds are set by the Goods and Services
        Tax Act 1985 and can change — confirm with Inland Revenue or a chartered accountant before
        you file.
      </p>
    </main>
  );
}
