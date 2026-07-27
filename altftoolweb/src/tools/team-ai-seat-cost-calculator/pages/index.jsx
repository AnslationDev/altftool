"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";
import { DEFAULT_WORKING_DAYS, computeSeatCost } from "../lib";

const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "EUR", locale: "de-DE" },
  { code: "GBP", locale: "en-GB" },
  { code: "INR", locale: "en-IN" },
];

const DEFAULTS = {
  seats: "25",
  pricePerSeat: "30",
  activeUsers: "14",
  annualDiscountPct: "0",
  messagesPerDay: "30",
  inputTokens: "1500",
  outputTokens: "700",
  inputPricePerM: "3",
  outputPricePerM: "15",
  workingDays: String(DEFAULT_WORKING_DAYS),
  currency: "USD",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const currency = CURRENCIES.find((item) => item.code === values.currency) || CURRENCIES[0];
  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);
  const preciseMoney = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 4,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);

  const result = useMemo(
    () =>
      computeSeatCost({
        seats: toNumber(values.seats),
        pricePerSeat: toNumber(values.pricePerSeat),
        activeUsers: toNumber(values.activeUsers),
        annualDiscountPct: toNumber(values.annualDiscountPct),
        messagesPerDay: toNumber(values.messagesPerDay),
        inputTokens: toNumber(values.inputTokens),
        outputTokens: toNumber(values.outputTokens),
        inputPricePerM: toNumber(values.inputPricePerM),
        outputPricePerM: toNumber(values.outputPricePerM),
        workingDays: toNumber(values.workingDays),
      }),
    [values],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = hasError
    ? ""
    : [
        "Team AI Seat Cost Calculator",
        `Seats: ${values.seats} at ${money(result.discountedSeatPrice)} each per month`,
        `Monthly subscription: ${money(result.monthlySeatCost)} (${money(result.annualSeatCost)} a year)`,
        `Seat utilisation: ${result.utilisationPct}% — ${result.idleSeats} idle seats costing ${money(result.idleMonthlyCost)} a month`,
        `Cost per active user: ${money(result.costPerActiveUser)}`,
        `Usage-based equivalent: ${money(result.apiMonthlyTotal)} a month`,
        `Break-even: ${result.breakEvenMessagesPerDay ?? dash} messages per user per day`,
      ].join("\n");

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const fields = [
    { key: "seats", label: "Paid seats", min: "1", step: "1" },
    { key: "pricePerSeat", label: `Price per seat per month (${currency.code})`, min: "0", step: "1" },
    { key: "activeUsers", label: "People who actually used it", min: "0", step: "1" },
    { key: "annualDiscountPct", label: "Annual-billing discount (%)", min: "0", max: "99", step: "1" },
    { key: "workingDays", label: "Working days per month", min: "1", max: "31", step: "1" },
    { key: "messagesPerDay", label: "Messages per active user per day", min: "0", step: "1" },
  ];

  const apiFields = [
    { key: "inputTokens", label: "Input tokens per message", min: "0", step: "100" },
    { key: "outputTokens", label: "Output tokens per message", min: "0", step: "100" },
    { key: "inputPricePerM", label: `Input price per 1M tokens (${currency.code})`, min: "0", step: "0.1" },
    { key: "outputPricePerM", label: `Output price per 1M tokens (${currency.code})`, min: "0", step: "0.1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          AI spend
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Team AI Seat Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out what your per-seat AI subscription really costs per active user, how much sits
          idle, and the number of messages a day at which pay-as-you-go API pricing would be cheaper.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="seat-currency">
              Currency
            </label>
            <select
              id="seat-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.currency}
              onChange={set("currency")}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>
          </div>
          {fields.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`seat-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`seat-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Pay-as-you-go comparison</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Model APIs bill per million tokens. Put your model&apos;s published rates here to see what
          the same usage would cost without seats.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {apiFields.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`seat-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`seat-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost per active user, per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || result.costPerActiveUser === null ? dash : money(result.costPerActiveUser)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${money(result.monthlySeatCost)} a month across ${values.seats} seats, ${result.utilisationPct}% of them in use`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy seat cost result"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Effective price per seat", hasError ? dash : money(result.discountedSeatPrice)],
            ["Monthly subscription", hasError ? dash : money(result.monthlySeatCost)],
            ["Annual subscription", hasError ? dash : money(result.annualSeatCost)],
            [
              "Idle seats",
              hasError ? dash : `${result.idleSeats} — ${money(result.idleMonthlyCost)} a month`,
            ],
            [
              "Saving if you right-size at renewal",
              hasError
                ? dash
                : `${money(result.rightSizingSaving)} a month (${money(result.rightSizingAnnualSaving)} a year)`,
            ],
            ["Messages per active user per month", hasError ? dash : String(result.messagesPerUserMonth)],
            [
              "Effective cost per message on seats",
              hasError || result.costPerSeatMessage === null ? dash : preciseMoney(result.costPerSeatMessage),
            ],
            ["Same usage on API pricing", hasError ? dash : `${money(result.apiMonthlyTotal)} a month`],
            ["API cost per active user", hasError ? dash : money(result.apiMonthlyPerUser)],
            [
              "Break-even usage",
              hasError || result.breakEvenMessagesPerDay === null
                ? dash
                : `${result.breakEvenMessagesPerDay} messages per user per day`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
            <p className="font-semibold">
              {result.cheaperModel === "seats"
                ? `Seats win by ${money(Math.abs(result.seatVsApiMonthly))} a month.`
                : result.cheaperModel === "usage"
                  ? `Usage pricing would be ${money(Math.abs(result.seatVsApiMonthly))} a month cheaper at this volume.`
                  : "The two models cost the same at this volume."}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Seat licences usually bundle things an API call does not include — admin
        controls, retention settings, connectors, support — so treat the break-even as the price of
        those extras rather than a straight swap. Check your contract for mid-term seat reductions.
      </p>
    </main>
  );
}
