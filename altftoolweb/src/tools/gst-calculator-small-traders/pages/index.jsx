"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Store } from "lucide-react";

import { BUSINESS_TYPES, STATES, compareSchemes } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  turnover: "6000000",
  purchases: "4500000",
  outRate: "18",
  inRate: "18",
  businessTypeId: "trader",
  state: "Maharashtra",
  interState: false,
};

const SCHEME_LABEL = {
  composition: "Composition scheme",
  regular: "Regular scheme",
  either: "Either scheme",
};

export default function ToolHome() {
  const [turnover, setTurnover] = useState(DEFAULTS.turnover);
  const [purchases, setPurchases] = useState(DEFAULTS.purchases);
  const [outRate, setOutRate] = useState(DEFAULTS.outRate);
  const [inRate, setInRate] = useState(DEFAULTS.inRate);
  const [businessTypeId, setBusinessTypeId] = useState(DEFAULTS.businessTypeId);
  const [state, setState] = useState(DEFAULTS.state);
  const [interState, setInterState] = useState(DEFAULTS.interState);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareSchemes({
        annualTurnover: turnover.trim() === "" ? Number.NaN : Number(turnover),
        annualPurchases: purchases.trim() === "" ? Number.NaN : Number(purchases),
        outputGstRate: outRate.trim() === "" ? Number.NaN : Number(outRate),
        inputGstRate: inRate.trim() === "" ? Number.NaN : Number(inRate),
        businessTypeId,
        state,
        makesInterStateSupplies: interState,
      }),
    [turnover, purchases, outRate, inRate, businessTypeId, state, interState],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GST for small traders — scheme comparison",
      `State: ${result.state} | Business: ${result.businessType}`,
      `Registration threshold: ${money(result.threshold)} — registration ${result.registrationRequired ? "required" : "not yet required"}`,
      `Composition ceiling: ${money(result.compositionCeiling)} — ${result.compositionEligible ? "eligible" : "not eligible"}`,
      `Composition levy @ ${result.compositionRate}%: ${money(result.compositionTax)}`,
      `Regular scheme net GST in cash: ${money(result.regularNetGst)}`,
      `Margin under composition: ${money(result.compositionMargin)}`,
      `Margin under regular: ${money(result.regularMargin)}`,
      `Better for you: ${SCHEME_LABEL[result.betterScheme]}`,
    ].join("\n");
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
    setTurnover(DEFAULTS.turnover);
    setPurchases(DEFAULTS.purchases);
    setOutRate(DEFAULTS.outRate);
    setInRate(DEFAULTS.inRate);
    setBusinessTypeId(DEFAULTS.businessTypeId);
    setState(DEFAULTS.state);
    setInterState(DEFAULTS.interState);
    setCopied(false);
  };

  const compareRows = hasError
    ? [
        ["GST paid for the year", DASH, DASH],
        ["Input tax credit allowed", DASH, DASH],
        ["Margin left after GST", DASH, DASH],
      ]
    : [
        [
          "GST paid for the year",
          money(result.compositionTax),
          money(result.regularNetGst),
        ],
        ["Input tax credit allowed", money(0), money(result.inputTaxCredit)],
        ["Tax collected from customers", money(0), money(result.regularOutputTax)],
        ["Margin left after GST", money(result.compositionMargin), money(result.regularMargin)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Store className="h-4 w-4" aria-hidden="true" />
          Small business GST
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST Calculator for Small Traders
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See whether you have crossed the registration threshold for your state, whether the
          composition scheme is open to you, and which scheme leaves more money in the business at
          the same selling price.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="st-type">
              Kind of business
            </label>
            <select
              id="st-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={businessTypeId}
              onChange={(event) => setBusinessTypeId(event.target.value)}
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-state">
              State or union territory
            </label>
            <select
              id="st-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              {STATES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-turnover">
              Annual turnover / receipts (INR)
            </label>
            <input
              id="st-turnover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={turnover}
              onChange={(event) => setTurnover(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-purchases">
              Annual purchases, GST inclusive (INR)
            </label>
            <input
              id="st-purchases"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={purchases}
              onChange={(event) => setPurchases(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-out-rate">
              GST rate on your sales (%)
            </label>
            <input
              id="st-out-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={outRate}
              onChange={(event) => setOutRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-in-rate">
              Average GST rate on purchases (%)
            </label>
            <input
              id="st-in-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={inRate}
              onChange={(event) => setInRate(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="st-interstate"
        >
          <input
            id="st-interstate"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={interState}
            onChange={(event) => setInterState(event.target.checked)}
          />
          I sell to customers in other states
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Better scheme for you
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : SCHEME_LABEL[result.betterScheme]}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.compositionEligible
                  ? `Difference in margin: ${money(Math.abs(result.marginDifference))} a year.`
                  : "Composition is closed to you, so the regular scheme is the only option."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the GST scheme comparison"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Registration threshold for your state", hasError ? DASH : money(result.threshold)],
            [
              "Registration status",
              hasError
                ? DASH
                : result.registrationRequired
                  ? "Turnover is above the threshold — registration required"
                  : "Below the threshold — registration is optional",
            ],
            ["Composition turnover ceiling", hasError ? DASH : money(result.compositionCeiling)],
            [
              "Composition levy rate",
              hasError ? DASH : `${result.compositionRate}% of ${result.compositionBase}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.compositionBlockers.length > 0 ? (
          <ul className="mt-4 space-y-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.compositionBlockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Side by side, at the same selling price</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Line
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Composition
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Regular
                </th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map(([label, left, right]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{left}</td>
                  <td className="py-2 text-right font-semibold">{right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          A composition dealer cannot collect GST on the invoice and cannot claim input tax credit,
          so the levy and the tax on purchases both come out of the margin. A regular dealer
          recovers the tax from the customer and offsets input tax credit, filing GSTR-1 and GSTR-3B
          instead of quarterly CMP-08 and annual GSTR-4.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Registration is compulsory regardless of turnover in the
        cases listed in section 24 — for example inter-state supply of goods, e-commerce supplies
        and reverse-charge liability. Confirm your position with a GST practitioner before opting
        into or out of composition.
      </p>
    </main>
  );
}
