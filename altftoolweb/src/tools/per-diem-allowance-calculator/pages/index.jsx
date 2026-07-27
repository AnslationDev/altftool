"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw } from "lucide-react";

import { CITY_TIERS, MEAL_SHARES, PART_DAY_PERCENT, computePerDiem } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const START = {
  startDate: "2026-08-10",
  endDate: "2026-08-14",
  tier: "metro",
  dailyRate: String(CITY_TIERS[0].daily),
  lodgingRate: String(CITY_TIERS[0].lodging),
  partDayPercent: String(PART_DAY_PERCENT),
  breakfast: "0",
  lunch: "0",
  dinner: "0",
  breakfastShare: String(MEAL_SHARES.breakfast),
  lunchShare: String(MEAL_SHARES.lunch),
  dinnerShare: String(MEAL_SHARES.dinner),
  incidentals: "0",
  advance: "0",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [state, setState] = useState(START);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setState((current) => ({ ...current, [key]: value }));

  const applyTier = (key) => {
    const tier = CITY_TIERS.find((t) => t.key === key);
    if (!tier) {
      setState((current) => ({ ...current, tier: "custom" }));
      return;
    }
    setState((current) => ({
      ...current,
      tier: tier.key,
      dailyRate: String(tier.daily),
      lodgingRate: String(tier.lodging),
    }));
  };

  const result = useMemo(() => {
    const numbers = {
      dailyRate: toNumber(state.dailyRate),
      lodgingRate: toNumber(state.lodgingRate),
      partDayPercent: toNumber(state.partDayPercent),
      incidentals: toNumber(state.incidentals),
      advance: toNumber(state.advance),
      breakfast: toNumber(state.breakfast),
      lunch: toNumber(state.lunch),
      dinner: toNumber(state.dinner),
      breakfastShare: toNumber(state.breakfastShare),
      lunchShare: toNumber(state.lunchShare),
      dinnerShare: toNumber(state.dinnerShare),
    };
    if (Object.values(numbers).some((value) => Number.isNaN(value))) {
      return { error: "Every amount must be a number — check for stray characters." };
    }
    return computePerDiem({
      startDate: state.startDate,
      endDate: state.endDate,
      dailyRate: numbers.dailyRate,
      lodgingRate: numbers.lodgingRate,
      partDayPercent: numbers.partDayPercent,
      mealsProvided: {
        breakfast: numbers.breakfast,
        lunch: numbers.lunch,
        dinner: numbers.dinner,
      },
      mealShares: {
        breakfast: numbers.breakfastShare,
        lunch: numbers.lunchShare,
        dinner: numbers.dinnerShare,
      },
      incidentals: numbers.incidentals,
      advance: numbers.advance,
    });
  }, [state]);

  const ok = !result.error;

  const copy = async () => {
    if (!ok) return;
    const text = [
      `Per diem claim — ${result.days} days, ${result.nights} nights`,
      `Meals ${money(result.mealsNet)} (gross ${money(result.mealsGross)}, provided meals −${money(result.mealDeduction)})`,
      `Lodging ${money(result.lodgingAmount)}`,
      `Incidentals ${money(result.incidentals)}`,
      `Total ${money(result.total)}`,
      result.balance >= 0
        ? `Payable to traveller ${money(result.dueToTraveller)}`
        : `Recoverable from traveller ${money(result.dueFromTraveller)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(START);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          Travel allowance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Per Diem Allowance Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Total a trip&apos;s daily allowance the way a travel policy does — full days at the city
          rate, the departure and return days at a reduced rate, lodging counted by night, and any
          meal already provided deducted.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Trip and rates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-start">
              Departure date
            </label>
            <input
              id="pd-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={state.startDate}
              onChange={(event) => setField("startDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-end">
              Return date
            </label>
            <input
              id="pd-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={state.endDate}
              onChange={(event) => setField("endDate", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pd-tier">
              City tier
            </label>
            <select
              id="pd-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.tier}
              onChange={(event) => applyTier(event.target.value)}
            >
              {CITY_TIERS.map((tier) => (
                <option key={tier.key} value={tier.key}>
                  {tier.label}
                </option>
              ))}
              <option value="custom">Custom rates</option>
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              India sets no statutory per diem, so these are typical corporate bands. Overwrite them
              with your own policy figures.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-daily">
              Meals &amp; incidentals per day (₹)
            </label>
            <input
              id="pd-daily"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={state.dailyRate}
              onChange={(event) => setField("dailyRate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-lodging">
              Lodging per night (₹)
            </label>
            <input
              id="pd-lodging"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={state.lodgingRate}
              onChange={(event) => setField("lodgingRate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-partday">
              First and last day rate (%)
            </label>
            <input
              id="pd-partday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={state.partDayPercent}
              onChange={(event) => setField("partDayPercent", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-incidentals">
              One-off incidentals (₹)
            </label>
            <input
              id="pd-incidentals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={state.incidentals}
              onChange={(event) => setField("incidentals", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pd-advance">
              Advance already paid (₹)
            </label>
            <input
              id="pd-advance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={state.advance}
              onChange={(event) => setField("advance", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Meals already provided</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Count meals included in a conference fee or the hotel rate. Each is deducted at its share of
          the daily rate.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["breakfast", "Breakfasts provided", "breakfastShare", "Breakfast share (%)"],
            ["lunch", "Lunches provided", "lunchShare", "Lunch share (%)"],
            ["dinner", "Dinners provided", "dinnerShare", "Dinner share (%)"],
          ].map(([countKey, countLabel, shareKey, shareLabel]) => (
            <div key={countKey} className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`pd-${countKey}`}>
                  {countLabel}
                </label>
                <input
                  id={`pd-${countKey}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={state[countKey]}
                  onChange={(event) => setField(countKey, event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`pd-${shareKey}`}>
                  {shareLabel}
                </label>
                <input
                  id={`pd-${shareKey}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="5"
                  value={state[shareKey]}
                  onChange={(event) => setField(shareKey, event.target.value)}
                />
              </div>
            </div>
          ))}
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total allowance
            </p>
            <p className="mt-1 text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
              {ok ? money(result.total) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.days} days · ${result.nights} nights · ${money(result.averagePerDay)} a day on average`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!ok}
              aria-label="Copy the per diem claim"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Full days", ok ? `${result.fullDays} → ${money(result.fullDayAmount)}` : "—"],
            [
              "Part days",
              ok ? `${result.partDays} at ${result.partDayPercent}% → ${money(result.partDayAmount)}` : "—",
            ],
            ["Meals before deductions", ok ? money(result.mealsGross) : "—"],
            ["Provided meals deducted", ok ? `−${money(result.mealDeduction)}` : "—"],
            ["Meals payable", ok ? money(result.mealsNet) : "—"],
            ["Lodging", ok ? `${result.nights} nights → ${money(result.lodgingAmount)}` : "—"],
            ["Incidentals", ok ? money(result.incidentals) : "—"],
            ["Advance paid", ok ? money(result.advance) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-[var(--muted)] px-3 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.balance < 0
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.balance < 0
              ? `${money(result.dueFromTraveller)} of the advance is unspent and has to be returned.`
              : `${money(result.dueToTraveller)} is payable to the traveller after the advance.`}
          </p>
        )}

        {ok && result.deductionCapped && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            The meals provided are worth more than the meals allowance itself, so the deduction has
            been capped and no meal allowance is payable.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        In India a daily allowance for an official tour is exempt under Section 10(14)(i) of the
        Income-tax Act, 1961 read with Rule 2BB(1)(b) to the extent it is actually spent for that
        purpose — an unspent surplus is taxable. This page is informational and not tax advice;
        confirm the treatment with your employer or a chartered accountant.
      </p>
    </main>
  );
}
