"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import { compareBuyVsRent } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
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
  buyPrice: "3000",
  expectedResale: "1200",
  rentPerTerm: "400",
  terms: "4",
  rentalFees: "0",
  rentalDeposit: "500",
};

const VERDICT = {
  buy: "Buying works out cheaper",
  rent: "Renting works out cheaper",
  equal: "Both cost the same",
};

export default function ToolHome() {
  const [buyPrice, setBuyPrice] = useState(DEFAULTS.buyPrice);
  const [expectedResale, setExpectedResale] = useState(DEFAULTS.expectedResale);
  const [rentPerTerm, setRentPerTerm] = useState(DEFAULTS.rentPerTerm);
  const [terms, setTerms] = useState(DEFAULTS.terms);
  const [rentalFees, setRentalFees] = useState(DEFAULTS.rentalFees);
  const [rentalDeposit, setRentalDeposit] = useState(DEFAULTS.rentalDeposit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareBuyVsRent({
        buyPrice: buyPrice.trim() === "" ? Number.NaN : Number(buyPrice),
        expectedResale: expectedResale.trim() === "" ? 0 : Number(expectedResale),
        rentPerTerm: rentPerTerm.trim() === "" ? Number.NaN : Number(rentPerTerm),
        terms: terms.trim() === "" ? Number.NaN : Number(terms),
        rentalFees: rentalFees.trim() === "" ? 0 : Number(rentalFees),
        rentalDeposit: rentalDeposit.trim() === "" ? 0 : Number(rentalDeposit),
      }),
    [buyPrice, expectedResale, rentPerTerm, terms, rentalFees, rentalDeposit],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Textbook buy vs rent",
      `Buy: ${money(result.buyGross)} minus resale ${money(result.resale)} = net ${money(result.buyNetCost)}`,
      `Rent: ${money(result.rentPerTerm)} x ${result.terms} terms + fees ${money(result.rentalFees)} = ${money(result.rentNetCost)}`,
      `${VERDICT[result.cheaper]} — difference ${money(result.difference)}`,
    ];
    if (result.breakEvenTerms !== null) {
      lines.push(`Break-even: ${NUM.format(result.breakEvenTerms)} terms of use`);
    }
    return lines.join("\n");
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
    setBuyPrice(DEFAULTS.buyPrice);
    setExpectedResale(DEFAULTS.expectedResale);
    setRentPerTerm(DEFAULTS.rentPerTerm);
    setTerms(DEFAULTS.terms);
    setRentalFees(DEFAULTS.rentalFees);
    setRentalDeposit(DEFAULTS.rentalDeposit);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Net cost of buying", DASH],
        ["Net cost of renting", DASH],
        ["Break-even terms", DASH],
      ]
    : [
        ["Purchase price", money(result.buyGross)],
        ["Expected resale after the course", money(result.resale)],
        ["Net cost of buying", money(result.buyNetCost)],
        [
          `Rent over ${result.terms} term${result.terms === 1 ? "" : "s"} (incl. fees)`,
          money(result.rentNetCost),
        ],
        [
          "Refundable rental deposit (locked up, returned later)",
          money(result.rentalDeposit),
        ],
        [
          "Break-even terms of use",
          result.breakEvenTerms === null ? DASH : NUM.format(result.breakEvenTerms),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Student Finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Book Buy vs Rent Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Buying costs price minus what you sell it for later; renting costs the per-term rent
          times the terms you need it. See which wins for your course, and the break-even point.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bvr-price">
              Price to buy (INR)
            </label>
            <input
              id="bvr-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={buyPrice}
              onChange={(event) => setBuyPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvr-resale">
              Expected resale value after the course (INR)
            </label>
            <input
              id="bvr-resale"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={expectedResale}
              onChange={(event) => setExpectedResale(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvr-rent">
              Rent per term / semester (INR)
            </label>
            <input
              id="bvr-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={rentPerTerm}
              onChange={(event) => setRentPerTerm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvr-terms">
              Terms / semesters you need the book
            </label>
            <input
              id="bvr-terms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="24"
              step="1"
              value={terms}
              onChange={(event) => setTerms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvr-fees">
              Non-refundable rental fees — delivery, damage waiver (INR)
            </label>
            <input
              id="bvr-fees"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={rentalFees}
              onChange={(event) => setRentalFees(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bvr-deposit">
              Refundable rental deposit (INR)
            </label>
            <input
              id="bvr-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={rentalDeposit}
              onChange={(event) => setRentalDeposit(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Verdict
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.difference)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the comparison."
                : `${VERDICT[result.cheaper]}${
                    result.breakEvenTerms !== null
                      ? ` — renting stays cheaper only below ${NUM.format(result.breakEvenTerms)} terms of use.`
                      : "."
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the buy vs rent result"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Resale value is an estimate — new editions, markings and wear cut it sharply. If the
        edition changes during your course, assume a lower resale before deciding.
      </p>
    </main>
  );
}
