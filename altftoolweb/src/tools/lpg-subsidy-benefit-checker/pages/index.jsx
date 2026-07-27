"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw, X } from "lucide-react";

import {
  ANNUAL_SUBSIDISED_REFILLS,
  CYLINDER_SIZES,
  PMUY_QUALIFYING_CATEGORIES,
  PMUY_SUBSIDY_PER_REFILL,
  STANDARD_CYLINDER_KG,
  checkUjjwalaConnectionEligibility,
  compareLpgConsumerTypes,
  computeLpgAnnualCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const DASH = "—";

const DEFAULTS = {
  price: "853",
  size: String(STANDARD_CYLINDER_KG),
  consumerType: "ujjwala",
  refills: "12",
  subsidy: String(PMUY_SUBSIDY_PER_REFILL),
  isAdultWoman: true,
  hasConnection: false,
  category: "secc",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [size, setSize] = useState(DEFAULTS.size);
  const [consumerType, setConsumerType] = useState(DEFAULTS.consumerType);
  const [refills, setRefills] = useState(DEFAULTS.refills);
  const [subsidy, setSubsidy] = useState(DEFAULTS.subsidy);
  const [isAdultWoman, setIsAdultWoman] = useState(DEFAULTS.isAdultWoman);
  const [hasConnection, setHasConnection] = useState(DEFAULTS.hasConnection);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeLpgAnnualCost({
        cylinderPrice: toNumber(price),
        cylinderKg: toNumber(size),
        consumerType,
        refillsPerYear: toNumber(refills),
        subsidyPerStandardRefill: consumerType === "ujjwala" ? toNumber(subsidy) : 0,
      }),
    [price, size, consumerType, refills, subsidy],
  );

  const comparison = useMemo(
    () =>
      compareLpgConsumerTypes({
        cylinderPrice: toNumber(price),
        cylinderKg: toNumber(size),
        refillsPerYear: toNumber(refills),
        subsidyPerStandardRefill: toNumber(subsidy),
      }),
    [price, size, refills, subsidy],
  );

  const connection = useMemo(
    () =>
      checkUjjwalaConnectionEligibility({
        applicantIsAdultWoman: isAdultWoman,
        householdHasLpgConnection: hasConnection,
        qualifyingCategory: category,
      }),
    [isAdultWoman, hasConnection, category],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "LPG subsidy and annual cost",
      `Cylinder: ${NUM.format(result.cylinderKg)} kg at ${money2(result.cylinderPrice)}`,
      `Consumer: ${result.consumerType === "ujjwala" ? "PMUY (Ujjwala) beneficiary" : "General domestic consumer"}`,
      `Refills bought a year: ${result.refillsPerYear}`,
      `Subsidised refills allowed: ${result.subsidisedRefillsAllowed}`,
      `Subsidy per refill: ${money2(result.subsidyPerRefill)}`,
      `Effective price of a subsidised cylinder: ${money2(result.effectivePriceSubsidised)}`,
      `Gross yearly spend: ${money2(result.grossAnnualCost)}`,
      `Subsidy credited by DBT: ${money2(result.totalSubsidy)}`,
      `Net yearly cost: ${money2(result.netAnnualCost)}`,
      `Net cost per kg of LPG: ${money2(result.costPerKg)}`,
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
    setPrice(DEFAULTS.price);
    setSize(DEFAULTS.size);
    setConsumerType(DEFAULTS.consumerType);
    setRefills(DEFAULTS.refills);
    setSubsidy(DEFAULTS.subsidy);
    setIsAdultWoman(DEFAULTS.isAdultWoman);
    setHasConnection(DEFAULTS.hasConnection);
    setCategory(DEFAULTS.category);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Cooking gas
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          LPG Subsidy and Ujjwala Benefit Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Domestic LPG is bought at the market price and the subsidy comes back into the bank
          account through DBT. Enter your city price to see what a cylinder really costs after the
          Ujjwala subsidy, and what the {ANNUAL_SUBSIDISED_REFILLS}-refill annual cap means for your
          yearly bill.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-price">
              Cylinder price in your city (INR)
            </label>
            <input
              id="lpg-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-size">
              Cylinder size
            </label>
            <select
              id="lpg-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={size}
              onChange={(event) => setSize(event.target.value)}
            >
              {CYLINDER_SIZES.map((item) => (
                <option key={item.kg} value={String(item.kg)}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-type">
              Consumer type
            </label>
            <select
              id="lpg-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={consumerType}
              onChange={(event) => setConsumerType(event.target.value)}
            >
              <option value="ujjwala">PMUY (Ujjwala) beneficiary</option>
              <option value="general">General domestic consumer</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-refills">
              Refills bought in a year
            </label>
            <input
              id="lpg-refills"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={refills}
              onChange={(event) => setRefills(event.target.value)}
            />
          </div>
          {consumerType === "ujjwala" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="lpg-subsidy">
                Subsidy per 14.2 kg refill (INR)
              </label>
              <input
                id="lpg-subsidy"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                value={subsidy}
                onChange={(event) => setSubsidy(event.target.value)}
              />
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                The targeted PMUY subsidy was announced at ₹200 in May 2022 and raised to{" "}
                {money(PMUY_SUBSIDY_PER_REFILL)} in October 2023. Change it here if a later revision
                applies to you.
              </p>
            </div>
          ) : null}
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
              What a subsidised cylinder actually costs you
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(result.effectivePriceSubsidised) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money2(result.cylinderPrice)} paid at the counter, ${money2(result.subsidyPerRefill)} back by DBT`
                : "Fix the input above to see the effective price"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the LPG subsidy result"
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
            ["Gross spend in a year", ok ? money2(result.grossAnnualCost) : DASH],
            ["Subsidy credited by DBT", ok ? money2(result.totalSubsidy) : DASH],
            ["Net yearly cost", ok ? money2(result.netAnnualCost) : DASH],
            ["Average per month", ok ? money2(result.monthlyAverage) : DASH],
            [
              "Refills covered by the subsidy",
              ok
                ? `${result.subsidisedRefills} of ${result.refillsPerYear} (cap is ${result.subsidisedRefillsAllowed})`
                : DASH,
            ],
            ["Refills paid at full price", ok ? String(result.unsubsidisedRefills) : DASH],
            ["Net cost per kg of LPG", ok ? money2(result.costPerKg) : DASH],
            ["Subsidy as a share of spend", ok ? `${NUM.format(result.subsidyShare)}%` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.capReached ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.unsubsidisedRefills} refill{result.unsubsidisedRefills === 1 ? "" : "s"} fall
            outside the {result.subsidisedRefillsAllowed}-refill annual entitlement and are paid at
            the full market price with no DBT credit.
          </p>
        ) : null}
      </section>

      {!comparison.error ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Ujjwala versus a general connection</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">
                Yearly cost for the same household under each consumer type
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Line
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Ujjwala
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    General
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Subsidy per refill",
                    money2(comparison.ujjwala.subsidyPerRefill),
                    money2(comparison.general.subsidyPerRefill),
                  ],
                  [
                    "Subsidy in a year",
                    money2(comparison.ujjwala.totalSubsidy),
                    money2(comparison.general.totalSubsidy),
                  ],
                  [
                    "Net yearly cost",
                    money2(comparison.ujjwala.netAnnualCost),
                    money2(comparison.general.netAnnualCost),
                  ],
                ].map(([label, left, right]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <th scope="row" className="py-2.5 pr-3 text-left font-normal text-[var(--muted-foreground)]">
                      {label}
                    </th>
                    <td className="py-2.5 pr-3 text-right font-semibold">{left}</td>
                    <td className="py-2.5 text-right font-semibold">{right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            A PMUY household is {money2(comparison.annualAdvantage)} better off over the year on
            these numbers.
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Can this household get a PMUY connection?</h2>
        <div className="mt-3 grid gap-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="lpg-category">
              Household category
            </label>
            <select
              id="lpg-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {PMUY_QUALIFYING_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <label className={CHECKBOX_ROW} htmlFor="lpg-woman">
            <input
              id="lpg-woman"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={isAdultWoman}
              onChange={(event) => setIsAdultWoman(event.target.checked)}
            />
            The applicant is an adult woman of the household
          </label>
          <label className={CHECKBOX_ROW} htmlFor="lpg-existing">
            <input
              id="lpg-existing"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={hasConnection}
              onChange={(event) => setHasConnection(event.target.checked)}
            />
            The household already has an LPG connection
          </label>
        </div>

        <ul className="mt-4 space-y-3">
          {connection.checks.map((check) => (
            <li key={check.id} className="flex gap-3 rounded-md border border-[var(--border)] p-3 text-sm">
              <span
                className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  check.passed
                    ? "bg-[var(--muted)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
                aria-hidden="true"
              >
                {check.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </span>
              <span>
                <span className="block font-semibold">
                  {check.label}
                  <span className="sr-only">{check.passed ? " — met" : " — not met"}</span>
                </span>
                <span className="mt-0.5 block text-[var(--muted-foreground)]">{check.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Retail LPG prices are revised regularly and differ by city and oil
        marketing company, and the subsidy amount is set by the Ministry of Petroleum and Natural
        Gas and can change. Confirm the credit in your bank statement or on your distributor's
        portal.
      </p>
    </main>
  );
}
