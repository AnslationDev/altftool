"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw } from "lucide-react";
import { EXEMPT_BUYERS, RATE_REGIMES, computeTcsTourPackage } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money0 = (value) => (Number.isFinite(value) ? INR0.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const DEFAULTS = {
  packageAmount: "1500000",
  prior: "0",
  purchaseDate: "2026-05-10",
  panFurnished: true,
  buyerExempt: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW = "flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [packageAmount, setPackageAmount] = useState(DEFAULTS.packageAmount);
  const [prior, setPrior] = useState(DEFAULTS.prior);
  const [purchaseDate, setPurchaseDate] = useState(DEFAULTS.purchaseDate);
  const [panFurnished, setPanFurnished] = useState(DEFAULTS.panFurnished);
  const [buyerExempt, setBuyerExempt] = useState(DEFAULTS.buyerExempt);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTcsTourPackage({
        packageAmount: toNumber(packageAmount),
        priorPurchasesThisFy: toNumber(prior),
        purchaseDate,
        panFurnished,
        buyerExempt,
      }),
    [packageAmount, prior, purchaseDate, panFurnished, buyerExempt],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "TCS on overseas tour package — section 206C(1G)",
      `Package value: ${money(result.packageAmount)}`,
      `Bought earlier this year: ${money(result.priorPurchases)}`,
      `Regime: ${result.regimeLabel}`,
      `At ${result.lowRate}%: ${money(result.amountAtLowRate)}`,
      `At ${result.highRate}%: ${money(result.amountAtHighRate)}`,
      `TCS collected: ${money(result.tcs)}`,
      `Effective rate: ${pct(result.effectiveRate)}`,
      `Total to pay the tour operator: ${money(result.totalPayable)}`,
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
    setPackageAmount(DEFAULTS.packageAmount);
    setPrior(DEFAULTS.prior);
    setPurchaseDate(DEFAULTS.purchaseDate);
    setPanFurnished(DEFAULTS.panFurnished);
    setBuyerExempt(DEFAULTS.buyerExempt);
    setCopied(false);
  };

  const lowShare =
    hasError || !(result.packageAmount > 0)
      ? 0
      : Math.max(0, Math.min(100, (result.amountAtLowRate / result.packageAmount) * 100));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          Section 206C(1G)
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TCS on Overseas Tour Package
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An Indian tour operator collects tax at source when you buy a package abroad — 5% on the
          first Rs 10,00,000 of the year&rsquo;s spend and 20% above it. This shows the split, the
          effective rate and the total your operator will invoice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="t-package">
              Package value (INR)
            </label>
            <input
              id="t-package"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={packageAmount}
              onChange={(event) => setPackageAmount(event.target.value)}
            />
            <p className={HINT_CLASS}>Travel, hotel, boarding and similar package costs.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="t-prior">
              Tour packages already bought this financial year (INR)
            </label>
            <input
              id="t-prior"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={prior}
              onChange={(event) => setPrior(event.target.value)}
            />
            <p className={HINT_CLASS}>The 5% slab is used up across the whole year.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="t-date">
              Date of payment
            </label>
            <input
              id="t-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
            />
            <p className={HINT_CLASS}>Decides which slab structure applies.</p>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="t-pan">
              <input
                id="t-pan"
                type="checkbox"
                className={CHECKBOX}
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              Buyer has furnished PAN or Aadhaar
            </label>
            <p className={HINT_CLASS}>
              Without it, section 206CC applies twice the rate or 5%, whichever is higher.
            </p>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="t-exempt">
              <input
                id="t-exempt"
                type="checkbox"
                className={CHECKBOX}
                checked={buyerExempt}
                onChange={(event) => setBuyerExempt(event.target.checked)}
              />
              Buyer is an exempt entity
            </label>
            <p className={HINT_CLASS}>Government, foreign mission or local authority.</p>
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
              TCS the operator collects
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.tcs)}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the collection." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy overseas tour package TCS result"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Slab structure in force", hasError ? DASH : result.regimeLabel],
            [
              "Yearly threshold",
              hasError ? DASH : result.threshold ? money0(result.threshold) : "No threshold",
            ],
            [
              `Package taxed at ${hasError ? "the lower rate" : `${result.lowRate}%`}`,
              hasError ? DASH : money(result.amountAtLowRate),
            ],
            [
              `Package taxed at ${hasError ? "the higher rate" : `${result.highRate}%`}`,
              hasError ? DASH : money(result.amountAtHighRate),
            ],
            ["Effective rate on this package", hasError ? DASH : pct(result.effectiveRate)],
            [
              "5% slab still unused this year",
              hasError || result.thresholdRemaining === null
                ? DASH
                : money(result.thresholdRemaining),
            ],
            ["Total to pay the tour operator", hasError ? DASH : money(result.totalPayable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.packageAmount > 0 ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${pct(lowShare)} of the package is at the lower rate and ${pct(100 - lowShare)} at the higher rate`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${lowShare}%` }} />
              <span
                className="block h-full bg-[var(--danger)]"
                style={{ width: `${100 - lowShare}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Lower slab {pct(lowShare)} &middot; Higher slab {pct(100 - lowShare)}
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the rates have changed</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {RATE_REGIMES.map((regime) => (
            <li key={regime.id} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <span>{regime.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Buyers with no TCS</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {EXEMPT_BUYERS.map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. TCS is not an extra tax — it appears in your Form 26AS
        and AIS and is set off against your income-tax liability, with any excess refunded. Since
        1 October 2024 a salaried buyer can report it to their employer for adjustment against
        salary TDS. Confirm the rate on your invoice with the tour operator.
      </p>
    </main>
  );
}
