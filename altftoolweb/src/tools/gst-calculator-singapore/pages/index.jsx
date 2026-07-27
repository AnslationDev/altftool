"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw } from "lucide-react";

import {
  SG_GST_RATES,
  SG_GST_RATE_PERCENT,
  SG_GST_REGISTRATION_THRESHOLD,
  checkSingaporeRegistration,
  computeSingaporeGst,
} from "../lib";

const SGD = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const SGD0 = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-SG", { maximumFractionDigits: 2 });

const money = (value) => SGD.format(Number.isFinite(value) ? value : 0);
const money0 = (value) => SGD0.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  amount: "109",
  mode: "remove",
  ratePercent: String(SG_GST_RATE_PERCENT),
  quantity: "1",
  pastTurnover: "850000",
  nextTurnover: "1100000",
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
  const [pastTurnover, setPastTurnover] = useState(DEFAULTS.pastTurnover);
  const [nextTurnover, setNextTurnover] = useState(DEFAULTS.nextTurnover);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSingaporeGst({
        amount: toNumber(amount),
        mode,
        ratePercent: toNumber(ratePercent),
        quantity: toNumber(quantity),
      }),
    [amount, mode, ratePercent, quantity],
  );

  const registration = useMemo(
    () =>
      checkSingaporeRegistration({
        pastYearTurnover: toNumber(pastTurnover),
        nextYearTurnover: toNumber(nextTurnover),
      }),
    [pastTurnover, nextTurnover],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GST Calculator Singapore",
      `Mode: ${result.mode === "add" ? "Add GST to a GST-exclusive price" : "Reverse GST out of a GST-inclusive price"}`,
      `GST rate: ${result.ratePercent}%`,
      result.quantity > 1 ? `Quantity: ${result.quantity} x ${money(result.unitAmount)}` : null,
      `Amount before GST: ${money(result.exclusive)}`,
      `GST: ${money(result.gst)}`,
      `Amount including GST: ${money(result.inclusive)}`,
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
    setPastTurnover(DEFAULTS.pastTurnover);
    setNextTurnover(DEFAULTS.nextTurnover);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          Singapore GST
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">GST Calculator Singapore</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add 9% GST to a net amount, or reverse it out of a GST-inclusive price using the exact
          9/109 fraction. Historical 8% and 7% rates and the S$1 million registration test included.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What kind of amount are you starting from?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["add", "GST-exclusive (add GST)"],
              ["remove", "GST-inclusive (reverse GST)"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`sggst-mode-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`sggst-mode-${value}`}
                  type="radio"
                  name="sggst-mode"
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
            <label className={LABEL_CLASS} htmlFor="sggst-amount">
              Amount (SGD)
            </label>
            <input
              id="sggst-amount"
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
                ? "Your net selling price before GST."
                : "The displayed or invoiced price that already includes GST."}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sggst-quantity">
              Quantity
            </label>
            <input
              id="sggst-quantity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <p className={HINT_CLASS}>Units on this invoice line.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sggst-rate">
              GST rate
            </label>
            <select
              id="sggst-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratePercent}
              onChange={(event) => setRatePercent(event.target.value)}
            >
              {SG_GST_RATES.map((rate) => (
                <option key={rate.percent} value={String(rate.percent)}>
                  {rate.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Use the rate in force when the supply was made — 9% applies from 1 January 2024.
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
                : result.mode === "remove" && result.inclusiveFraction
                  ? `${result.ratePercent}% GST reversed out as ${result.inclusiveFraction} of the inclusive price`
                  : `charged at ${result.ratePercent}% of the net amount`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Singapore GST result"
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
            ["Amount before GST", hasError ? DASH : money(result.exclusive)],
            ["GST at the selected rate", hasError ? DASH : money(result.gst)],
            ["Amount including GST", hasError ? DASH : money(result.inclusive)],
            [
              "GST as a share of the inclusive price",
              hasError ? DASH : pct(result.gstShareOfInclusivePercent),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">GST registration test</h2>
        <p className={HINT_CLASS}>
          Compulsory registration bites at {money0(SG_GST_REGISTRATION_THRESHOLD)} of taxable
          turnover on either the retrospective or the prospective basis.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sggst-past">
              Past calendar year taxable turnover
            </label>
            <input
              id="sggst-past"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={pastTurnover}
              onChange={(event) => setPastTurnover(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sggst-next">
              Expected turnover, next 12 months
            </label>
            <input
              id="sggst-next"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={nextTurnover}
              onChange={(event) => setNextTurnover(event.target.value)}
            />
          </div>
        </div>

        {registration.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {registration.error}
          </p>
        ) : (
          <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-sm">
            <p className="font-semibold text-[var(--foreground)]">
              {registration.mustRegister
                ? "Registration is compulsory"
                : "Registration is voluntary"}
            </p>
            <p className="mt-1 text-[var(--muted-foreground)]">{registration.basis}</p>
            <p className="mt-1 text-[var(--muted-foreground)]">{registration.action}</p>
            <p className="mt-1 text-[var(--muted-foreground)]">
              {registration.mustRegister
                ? `Highest figure is ${money0(registration.excess)} above the threshold.`
                : `${money0(registration.headroom)} of headroom left before the threshold.`}
            </p>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Rates, thresholds and notification deadlines are set by
        the Goods and Services Tax Act 1993 and IRAS — confirm before you register or file.
      </p>
    </main>
  );
}
