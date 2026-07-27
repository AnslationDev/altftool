"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wheat } from "lucide-react";

import {
  CARD_CATEGORIES,
  MATERNITY_BENEFIT_MIN,
  NFSA_ISSUE_PRICE_COARSE,
  NFSA_ISSUE_PRICE_RICE,
  NFSA_ISSUE_PRICE_WHEAT,
  NFSA_RURAL_COVERAGE_PCT,
  NFSA_URBAN_COVERAGE_PCT,
  compareRationCategories,
  computeRationEntitlement,
  getCardCategory,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const kg = (value) => (Number.isFinite(value) ? `${NUM.format(value)} kg` : "—");
const DASH = "—";

const DEFAULTS = {
  cardType: "phh",
  members: "5",
  ricePct: "100",
  marketRice: "45",
  marketWheat: "32",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [cardType, setCardType] = useState(DEFAULTS.cardType);
  const [members, setMembers] = useState(DEFAULTS.members);
  const [ricePct, setRicePct] = useState(DEFAULTS.ricePct);
  const [marketRice, setMarketRice] = useState(DEFAULTS.marketRice);
  const [marketWheat, setMarketWheat] = useState(DEFAULTS.marketWheat);
  const [copied, setCopied] = useState(false);

  const inputs = useMemo(
    () => ({
      householdMembers: toNumber(members),
      ricePct: toNumber(ricePct),
      marketRicePrice: toNumber(marketRice),
      marketWheatPrice: toNumber(marketWheat),
    }),
    [members, ricePct, marketRice, marketWheat],
  );

  const result = useMemo(
    () => computeRationEntitlement({ ...inputs, cardType }),
    [inputs, cardType],
  );

  const comparison = useMemo(() => compareRationCategories(inputs), [inputs]);
  const category = getCardCategory(cardType);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Ration card category: ${result.categoryLabel}`,
      `Rule: ${result.entitlementRule}`,
      `Members on the card: ${result.householdMembers}`,
      `Monthly entitlement: ${kg(result.monthlyKg)} (${kg(result.perPersonKg)} per person)`,
      `Yearly entitlement: ${kg(result.annualKg)}`,
      `Cost at NFSA issue prices: ${money(result.costAtIssuePrice)} a month`,
      `Cost under PMGKAY: ${money(result.costUnderPmgkay)} — foodgrain is issued free`,
      `Open-market value of the same grain: ${money(result.marketValue)} a month, ${money(result.annualMarketValue)} a year`,
    ].join("\n");
  }, [ok, result]);

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
    setCardType(DEFAULTS.cardType);
    setMembers(DEFAULTS.members);
    setRicePct(DEFAULTS.ricePct);
    setMarketRice(DEFAULTS.marketRice);
    setMarketWheat(DEFAULTS.marketWheat);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wheat className="h-4 w-4" aria-hidden="true" />
          Food security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ration Card Category Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Under the National Food Security Act an AAY card carries a flat 35 kg a month for the
          whole household, while a Priority Household card carries 5 kg per person. See what your
          category gives you, what the grain would cost at market prices, and how the categories
          differ.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ration-type">
              Card category
            </label>
            <select
              id="ration-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cardType}
              onChange={(event) => setCardType(event.target.value)}
            >
              {CARD_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ration-members">
              Members listed on the card
            </label>
            <input
              id="ration-members"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={members}
              onChange={(event) => setMembers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ration-rice">
              Share drawn as rice (%)
            </label>
            <input
              id="ration-rice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={ricePct}
              onChange={(event) => setRicePct(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              The rest is counted as wheat. Which grains a shop actually issues depends on your
              state.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ration-market-rice">
              Market rice price (INR per kg)
            </label>
            <input
              id="ration-market-rice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={marketRice}
              onChange={(event) => setMarketRice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ration-market-wheat">
              Market wheat price (INR per kg)
            </label>
            <input
              id="ration-market-wheat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={marketWheat}
              onChange={(event) => setMarketWheat(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Monthly foodgrain entitlement
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kg(result.monthlyKg) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.entitlementRule : "Fix the input above to see the entitlement"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the ration entitlement result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Per person each month", ok ? kg(result.perPersonKg) : DASH],
            ["Across the year", ok ? kg(result.annualKg) : DASH],
            ["Drawn as rice", ok ? kg(result.riceKg) : DASH],
            ["Drawn as wheat", ok ? kg(result.wheatKg) : DASH],
            [
              "Cost at NFSA issue prices",
              ok ? `${money(result.costAtIssuePrice)} a month` : DASH,
            ],
            ["Cost under PMGKAY", ok ? `${money(result.costUnderPmgkay)} — issued free` : DASH],
            ["Same grain at market prices", ok ? `${money(result.marketValue)} a month` : DASH],
            ["Value of the entitlement over a year", ok ? money(result.annualBenefit) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && !result.hasNfsaEntitlement ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            A non-NFSA card carries no entitlement under the central Act. Whatever it gets comes
            from a state scheme, so check your state food department for the current quantity and
            price.
          </p>
        ) : null}
      </section>

      {Array.isArray(comparison) ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The same household under each category</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <caption className="sr-only">
                Monthly entitlement and value by ration card category
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Per month
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Per person
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Market value
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.cardType} className="border-b border-[var(--border)] last:border-0">
                    <th scope="row" className="py-2.5 pr-3 text-left font-semibold">
                      {row.categoryLabel}
                    </th>
                    <td className="py-2.5 pr-3 text-right">{kg(row.monthlyKg)}</td>
                    <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                      {kg(row.perPersonKg)}
                    </td>
                    <td className="py-2.5 text-right font-semibold">{money(row.marketValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {category ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Who holds a {category.label} card</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{category.who}</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {category.typicalCriteria.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Other entitlements the Act carries</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">
              •
            </span>
            <span>
              Issue prices in Schedule I are {money(NFSA_ISSUE_PRICE_RICE)} a kg for rice,{" "}
              {money(NFSA_ISSUE_PRICE_WHEAT)} for wheat and {money(NFSA_ISSUE_PRICE_COARSE)} for
              coarse grains. Under PMGKAY the NFSA quota is issued free of cost.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">
              •
            </span>
            <span>
              Coverage extends to up to {NFSA_RURAL_COVERAGE_PCT}% of the rural population and{" "}
              {NFSA_URBAN_COVERAGE_PCT}% of the urban population.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">
              •
            </span>
            <span>
              Pregnant women and lactating mothers are entitled to free meals and a maternity
              benefit of not less than {money(MATERNITY_BENEFIT_MIN)}.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">
              •
            </span>
            <span>
              Children get age-appropriate meals: up to six years through anganwadis, and one free
              mid-day meal on school days from classes I to VIII.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--primary)]">
              •
            </span>
            <span>
              The eldest woman of the household aged 18 or above is treated as the head of the
              household for issuing the card.
            </span>
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. State governments identify which households fall into the AAY and
        priority categories and may add their own grain, sugar or pulses on top. Check your state
        food and civil supplies department or your fair price shop for what applies to your card.
      </p>
    </main>
  );
}
