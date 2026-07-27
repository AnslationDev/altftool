"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UtensilsCrossed } from "lucide-react";

import {
  CURRENCIES,
  DEFAULT_CONTINGENCY_PCT,
  TYPICAL_SHARES,
  currencyFormatter,
  formatBudgetText,
  planFoodBudget,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  currency: "INR",
  days: "7",
  people: "2",
  streetMeals: "2",
  streetPrice: "80",
  cafeMeals: "1",
  cafePrice: "250",
  snacksPerDay: "2",
  snackPrice: "40",
  drinksPerDay: "3",
  drinkPrice: "25",
  niceMeals: "2",
  nicePrice: "1500",
  contingencyPct: String(DEFAULT_CONTINGENCY_PCT),
  budget: "30000",
};

function NumberField({ id, label, value, onChange, min = "0", step = "1", hint }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [days, setDays] = useState(DEFAULTS.days);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [streetMeals, setStreetMeals] = useState(DEFAULTS.streetMeals);
  const [streetPrice, setStreetPrice] = useState(DEFAULTS.streetPrice);
  const [cafeMeals, setCafeMeals] = useState(DEFAULTS.cafeMeals);
  const [cafePrice, setCafePrice] = useState(DEFAULTS.cafePrice);
  const [snacksPerDay, setSnacksPerDay] = useState(DEFAULTS.snacksPerDay);
  const [snackPrice, setSnackPrice] = useState(DEFAULTS.snackPrice);
  const [drinksPerDay, setDrinksPerDay] = useState(DEFAULTS.drinksPerDay);
  const [drinkPrice, setDrinkPrice] = useState(DEFAULTS.drinkPrice);
  const [niceMeals, setNiceMeals] = useState(DEFAULTS.niceMeals);
  const [nicePrice, setNicePrice] = useState(DEFAULTS.nicePrice);
  const [contingencyPct, setContingencyPct] = useState(DEFAULTS.contingencyPct);
  const [budget, setBudget] = useState(DEFAULTS.budget);
  const [copied, setCopied] = useState(false);

  const format = useMemo(() => {
    const formatter = currencyFormatter(currency);
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const plan = useMemo(
    () =>
      planFoodBudget({
        days: Number(days),
        people: Number(people),
        streetMeals: Number(streetMeals),
        streetPrice: Number(streetPrice),
        cafeMeals: Number(cafeMeals),
        cafePrice: Number(cafePrice),
        snacksPerDay: Number(snacksPerDay),
        snackPrice: Number(snackPrice),
        drinksPerDay: Number(drinksPerDay),
        drinkPrice: Number(drinkPrice),
        niceMeals: Number(niceMeals),
        nicePrice: Number(nicePrice),
        contingencyPct: Number(contingencyPct),
        budget: Number(budget),
      }),
    [
      days,
      people,
      streetMeals,
      streetPrice,
      cafeMeals,
      cafePrice,
      snacksPerDay,
      snackPrice,
      drinksPerDay,
      drinkPrice,
      niceMeals,
      nicePrice,
      contingencyPct,
      budget,
    ],
  );

  const copyResult = async () => {
    const text = formatBudgetText(plan, format);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCurrency(DEFAULTS.currency);
    setDays(DEFAULTS.days);
    setPeople(DEFAULTS.people);
    setStreetMeals(DEFAULTS.streetMeals);
    setStreetPrice(DEFAULTS.streetPrice);
    setCafeMeals(DEFAULTS.cafeMeals);
    setCafePrice(DEFAULTS.cafePrice);
    setSnacksPerDay(DEFAULTS.snacksPerDay);
    setSnackPrice(DEFAULTS.snackPrice);
    setDrinksPerDay(DEFAULTS.drinksPerDay);
    setDrinkPrice(DEFAULTS.drinkPrice);
    setNiceMeals(DEFAULTS.niceMeals);
    setNicePrice(DEFAULTS.nicePrice);
    setContingencyPct(DEFAULTS.contingencyPct);
    setBudget(DEFAULTS.budget);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          Trip food budget
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Street Food Budget Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the budget from a typical day of eating, then see how many splurge meals actually fit. A
          nice dinner replaces a meal you were paying for anyway, so only the difference counts as new
          spending.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sfb-currency">
              Currency
            </label>
            <select
              id="sfb-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} — {item.label}
                </option>
              ))}
            </select>
          </div>
          <NumberField id="sfb-days" label="Days of eating" value={days} onChange={setDays} min="1" />
          <NumberField id="sfb-people" label="Travellers" value={people} onChange={setPeople} min="1" />
          <NumberField
            id="sfb-budget"
            label="Total food budget (0 to skip)"
            value={budget}
            onChange={setBudget}
            step="100"
            hint="For everyone, for the whole trip."
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">A typical day, per person</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberField id="sfb-street-meals" label="Street meals per day" value={streetMeals} onChange={setStreetMeals} />
          <NumberField id="sfb-street-price" label="Price of one street meal" value={streetPrice} onChange={setStreetPrice} step="10" />
          <NumberField id="sfb-cafe-meals" label="Café / sit-down meals per day" value={cafeMeals} onChange={setCafeMeals} />
          <NumberField id="sfb-cafe-price" label="Price of one café meal" value={cafePrice} onChange={setCafePrice} step="10" />
          <NumberField id="sfb-snacks" label="Snacks or chai stops per day" value={snacksPerDay} onChange={setSnacksPerDay} />
          <NumberField id="sfb-snack-price" label="Price of one snack" value={snackPrice} onChange={setSnackPrice} step="5" />
          <NumberField id="sfb-drinks" label="Drinks or bottles of water per day" value={drinksPerDay} onChange={setDrinksPerDay} />
          <NumberField id="sfb-drink-price" label="Price of one drink" value={drinkPrice} onChange={setDrinkPrice} step="5" />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Splurge meals and buffer</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberField
            id="sfb-nice-meals"
            label="Splurge meals over the trip"
            value={niceMeals}
            onChange={setNiceMeals}
            hint="Each one replaces a routine meal that day."
          />
          <NumberField id="sfb-nice-price" label="Price of one splurge meal" value={nicePrice} onChange={setNicePrice} step="50" />
          <NumberField
            id="sfb-buffer"
            label="Planning buffer (%)"
            value={contingencyPct}
            onChange={setContingencyPct}
            hint="15% is the usual convention."
          />
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total food budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : format(plan.grandTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the input above to build the plan."
                : `${format(plan.perPersonPerDay)} per person per day over ${plan.days} day${plan.days === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the food budget plan"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Routine eating, per person per day", plan.error ? DASH : format(plan.routinePerHeadPerDay)],
            ["Average routine meal price", plan.error ? DASH : format(plan.averageRoutineMealPrice)],
            [
              "Extra cost of one splurge meal",
              plan.error ? DASH : `${format(plan.upliftPerNiceMealPerHead)} per person over the meal it replaces`,
            ],
            ["Routine eating, whole trip", plan.error ? DASH : format(plan.routineTotal)],
            ["Splurge uplift, whole trip", plan.error ? DASH : format(plan.spurgeUplift)],
            ["Planning buffer", plan.error ? DASH : format(plan.buffer)],
            ["Whole group, per day", plan.error ? DASH : format(plan.perDay)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error && plan.budgetGap !== null && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Against your budget</h2>
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm font-semibold ${
              plan.budgetGap >= 0
                ? "bg-[var(--muted)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {plan.budgetGap >= 0
              ? `Under budget by ${format(plan.budgetGap)}.`
              : `Over budget by ${format(Math.abs(plan.budgetGap))}.`}
          </p>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Splurge meals that fit inside this budget:{" "}
            <span className="font-semibold text-[var(--foreground)]">{plan.niceMealsAffordable}</span>
            {plan.niceMealsAffordable === plan.days ? " (one every day of the trip)" : ""}
          </p>
        </section>
      )}

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the money goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {plan.componentTotals.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{format(row.amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{Math.round(row.share)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            For reference, street-food trips usually land near{" "}
            {TYPICAL_SHARES.map((share) => `${share.label.toLowerCase()} ${share.low}–${share.high}%`).join(", ")}.
          </p>

          {plan.notes.length > 0 && (
            <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {plan.notes.map((note) => (
                <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate built from the prices you enter. Local prices, tourist pricing and service
        charges vary, so check a few real menus at your destination before fixing a daily allowance.
      </p>
    </main>
  );
}
