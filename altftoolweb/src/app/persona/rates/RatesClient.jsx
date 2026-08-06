"use client";

import { useMemo, useState } from "react";
import {
  QUOTE_FIELDS,
  buildProductionBudget,
  buildQuote,
} from "@altftool/core/persona/economics";
import { Disclaimer, Stamp } from "../_components/Shell";

const EMPTY_QUOTE = Object.fromEntries(QUOTE_FIELDS.map((field) => [field.id, 0]));
const EMPTY_BUDGET = {
  posts: 1,
  tools: 0,
  training: 0,
  storage: 0,
  other: 0,
  hours: 0,
  hourlyRate: 0,
};

const formatMoney = (currency, value) =>
  `${currency} ${Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;

export default function RatesClient() {
  const [currency, setCurrency] = useState("USD");
  const [quoteInput, setQuoteInput] = useState(EMPTY_QUOTE);
  const [budgetInput, setBudgetInput] = useState(EMPTY_BUDGET);

  const quote = useMemo(
    () => buildQuote({ ...quoteInput, currency }),
    [currency, quoteInput],
  );
  const budget = useMemo(
    () => buildProductionBudget({ ...budgetInput, currency }),
    [budgetInput, currency],
  );

  const updateQuote = (id, value) => {
    setQuoteInput((current) => ({ ...current, [id]: value }));
  };
  const updateBudget = (id, value) => {
    setBudgetInput((current) => ({ ...current, [id]: value }));
  };

  return (
    <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="psn-sheet rounded-xl p-5">
        <label className="block max-w-xs text-sm font-medium text-foreground">
          Currency label
          <input
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            maxLength={8}
            inputMode="text"
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm uppercase text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          This is a label only. The worksheet does not convert currencies or
          fetch exchange rates.
        </p>
      </div>

      <section className="mt-10" aria-labelledby="quote-heading">
        <Stamp>Quote worksheet</Stamp>
        <h2 id="quote-heading" className="mt-2 text-xl font-semibold text-foreground">
          Build a quote from your own numbers
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Enter the amounts you have agreed, researched, or chosen. AltF Persona
          does not supply a market rate or pretend one formula applies to every
          platform, niche, country, and contract.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUOTE_FIELDS.map((field) => (
            <NumberField
              key={field.id}
              label={field.label}
              value={quoteInput[field.id]}
              onChange={(value) => updateQuote(field.id, value)}
            />
          ))}
        </div>

        <dl className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {quote.lines.map((line) => (
            <div key={line.id} className="flex justify-between gap-4 bg-background p-4 text-sm">
              <dt className="text-muted-foreground">{line.label}</dt>
              <dd className="psn-seed font-medium text-foreground">
                {formatMoney(quote.currency, line.value)}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 bg-[var(--psn-accent-soft)] p-4 text-sm">
            <dt className="font-semibold text-foreground">Quote total</dt>
            <dd className="psn-seed font-semibold text-foreground">
              {formatMoney(quote.currency, quote.total)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-12" aria-labelledby="budget-heading">
        <Stamp>Production budget</Stamp>
        <h2 id="budget-heading" className="mt-2 text-xl font-semibold text-foreground">
          Price the work using your actual costs
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Add the subscriptions and setup charges shown by your providers, then
          decide how to value your own time. Nothing is pre-filled with an
          unsourced industry estimate.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField label="Assets in this budget" min={1} step={1} value={budgetInput.posts} onChange={(value) => updateBudget("posts", value)} />
          <NumberField label="Generation tools" value={budgetInput.tools} onChange={(value) => updateBudget("tools", value)} />
          <NumberField label="Training or setup" value={budgetInput.training} onChange={(value) => updateBudget("training", value)} />
          <NumberField label="Storage" value={budgetInput.storage} onChange={(value) => updateBudget("storage", value)} />
          <NumberField label="Other costs" value={budgetInput.other} onChange={(value) => updateBudget("other", value)} />
          <NumberField label="Production hours" value={budgetInput.hours} onChange={(value) => updateBudget("hours", value)} />
          <NumberField label="Your hourly value" value={budgetInput.hourlyRate} onChange={(value) => updateBudget("hourlyRate", value)} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Summary label="Cash costs" value={formatMoney(budget.currency, budget.cash)} />
          <Summary label="Time value" value={formatMoney(budget.currency, budget.labour)} />
          <Summary label="Cost per asset" value={formatMoney(budget.currency, budget.perPost)} />
        </div>
      </section>

      <Disclaimer>
        This worksheet performs arithmetic on values you enter. It is not a
        market-rate database, quote, valuation, or financial recommendation.
        Check current provider pricing and contract terms before relying on the
        result.
      </Disclaimer>
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, step = "any" }) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
    </label>
  );
}

function Summary({ label, value }) {
  return (
    <div className="psn-sheet rounded-xl p-5">
      <Stamp>{label}</Stamp>
      <p className="psn-seed mt-2 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
