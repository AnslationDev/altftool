"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw } from "lucide-react";

import { PAPERWORK_ITEMS, compareExchangeVsPrivate } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULTS = {
  dealerOffer: "450000",
  exchangeBonus: "25000",
  privateAskingPrice: "520000",
  reconditioningCost: "12000",
  listingCost: "1500",
  paperworkCost: "3000",
  loanOutstanding: "0",
  foreclosureCharge: "0",
  daysToSell: "45",
  monthlyHoldingCost: "3000",
  hoursSpent: "12",
  hourlyValue: "200",
  discountRate: "7",
  annualDepreciation: "15",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const FIELDS = [
  ["dealerOffer", "Dealer exchange offer (INR)", "10000", "0"],
  ["exchangeBonus", "Exchange / loyalty bonus on the new car (INR)", "1000", "0"],
  ["privateAskingPrice", "Realistic private sale price today (INR)", "10000", "0"],
  ["reconditioningCost", "Detailing and pre-sale repairs (INR)", "500", "0"],
  ["listingCost", "Listing / classified fees (INR)", "100", "0"],
  ["paperworkCost", "RTO transfer, NOC and PUC you pay (INR)", "100", "0"],
  ["loanOutstanding", "Loan still outstanding on the car (INR)", "10000", "0"],
  ["foreclosureCharge", "Loan foreclosure charge (INR)", "500", "0"],
  ["daysToSell", "Days you expect it to take to sell", "5", "0"],
  ["monthlyHoldingCost", "Insurance, parking and upkeep per month (INR)", "250", "0"],
  ["hoursSpent", "Hours you will spend on calls and paperwork", "1", "0"],
  ["hourlyValue", "What an hour of your time is worth (INR)", "50", "0"],
  ["discountRate", "Discount rate — what the cash would earn (% a year)", "0.25", "0"],
  ["annualDepreciation", "Depreciation while it sits unsold (% a year)", "1", "0"],
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      compareExchangeVsPrivate({
        dealerOffer: toNumber(values.dealerOffer),
        exchangeBonus: toNumber(values.exchangeBonus),
        privateAskingPrice: toNumber(values.privateAskingPrice),
        reconditioningCost: toNumber(values.reconditioningCost),
        listingCost: toNumber(values.listingCost),
        paperworkCost: toNumber(values.paperworkCost),
        loanOutstanding: toNumber(values.loanOutstanding),
        foreclosureCharge: toNumber(values.foreclosureCharge),
        daysToSell: toNumber(values.daysToSell),
        monthlyHoldingCost: toNumber(values.monthlyHoldingCost),
        hoursSpent: toNumber(values.hoursSpent),
        hourlyValue: toNumber(values.hourlyValue),
        discountRate: toNumber(values.discountRate),
        annualDepreciation: toNumber(values.annualDepreciation),
      }),
    [values],
  );

  const ok = !result.error;

  const verdict = !ok
    ? DASH
    : result.winner === "private"
      ? "Private sale wins"
      : result.winner === "exchange"
        ? "Dealer exchange wins"
        : "Too close to call";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Car Exchange vs Private Sale",
      `Net from dealer exchange (today): ${INR.format(result.netExchange)}`,
      `Net from private sale (present value): ${INR.format(result.netPrivate)}`,
      `${verdict} by ${INR.format(result.absDifference)}`,
      `Private sale friction (costs + waiting + your time): ${INR.format(result.totalPrivateFriction)}`,
      `Break-even private price: ${INR.format(result.breakEvenPrice)} — ${NUM1.format(result.premiumNeededPct)}% above the dealer offer`,
      `Cost of every extra day unsold: ${INR.format(result.effectivePerDayCostOfWaiting)}`,
    ].join("\n");
  }, [ok, result, verdict]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Selling your car
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Car Exchange vs Private Sale
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A dealer pays less but pays today and absorbs every cost. A private buyer pays more, weeks
          later, after you have spent on detailing, listings and paperwork. This puts both on the
          same footing.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Your numbers</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label, step, min]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`cx-${key}`}>
                {label}
              </label>
              <input
                id={`cx-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={min}
                step={step}
                value={values[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`} aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ok && result.winner !== "tie" ? `${verdict} by` : "Difference"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? INR.format(result.absDifference) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${INR.format(result.netPrivate)} private vs ${INR.format(result.netExchange)} exchange, both valued today`
                : "Fix the inputs above to see a comparison"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy exchange versus private sale comparison"
              className={GHOST_BTN}
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-4">
            <h3 className="text-sm font-semibold">Dealer exchange</h3>
            <p className="mt-1 text-2xl font-semibold">{ok ? INR.format(result.netExchange) : DASH}</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">Offer + bonus</dt>
                <dd className="font-semibold">{ok ? INR.format(result.exchangeGross) : DASH}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">Loan payoff + charges</dt>
                <dd className="font-semibold">{ok ? INR.format(result.exchangeDeductions) : DASH}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">Paid on</dt>
                <dd className="font-semibold">Delivery day</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-[var(--border)] p-4">
            <h3 className="text-sm font-semibold">Private sale</h3>
            <p className="mt-1 text-2xl font-semibold">{ok ? INR.format(result.netPrivate) : DASH}</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">Price you close at</dt>
                <dd className="font-semibold">{ok ? INR.format(result.realisedPrice) : DASH}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">Cash costs at sale</dt>
                <dd className="font-semibold">{ok ? INR.format(result.cashCosts) : DASH}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">Paid on</dt>
                <dd className="font-semibold">{ok ? `Day ${result.daysToSell}` : DASH}</dd>
              </div>
            </dl>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Depreciation while it sits unsold", ok ? INR.format(result.depreciationWhileWaiting) : DASH],
            ["Value lost to waiting for the money", ok ? INR.format(result.timeValueLost) : DASH],
            ["Insurance, parking and upkeep meanwhile", ok ? INR.format(result.holdingCost) : DASH],
            ["Your time, valued", ok ? INR.format(result.timeCost) : DASH],
            ["Total private-sale friction", ok ? INR.format(result.totalPrivateFriction) : DASH],
            ["Break-even private price", ok ? INR.format(result.breakEvenPrice) : DASH],
            [
              "Premium a private buyer must pay over the dealer",
              ok ? `${INR.format(result.premiumNeededOverDealer)} (${NUM1.format(result.premiumNeededPct)}%)` : DASH,
            ],
            ["Cost of each extra day unsold", ok ? INR.format(result.effectivePerDayCostOfWaiting) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Paperwork a private sale puts on you</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted-foreground)]">
          {PAPERWORK_ITEMS.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-[var(--primary)]">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Until the RC transfer is recorded, the seller stays liable for challans and for anything
          the car is involved in. A dealer exchange moves that risk on the day you hand over the
          keys, which is worth something even when the rupee difference is small.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Exchange bonuses are usually conditional on buying a specific new car
        and may be withdrawn if you change variant; confirm the terms in writing before treating the
        bonus as money.
      </p>
    </main>
  );
}
