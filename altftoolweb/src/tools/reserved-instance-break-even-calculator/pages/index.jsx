"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";

import { TERM_OPTIONS, computeBreakEven } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  onDemandHourly: "0.10",
  reservedHourly: "0.06",
  upfront: "0",
  termId: "1yr",
};

const DASH = "—";

export default function ToolHome() {
  const [onDemandHourly, setOnDemandHourly] = useState(DEFAULTS.onDemandHourly);
  const [reservedHourly, setReservedHourly] = useState(DEFAULTS.reservedHourly);
  const [upfront, setUpfront] = useState(DEFAULTS.upfront);
  const [termId, setTermId] = useState(DEFAULTS.termId);
  const [copied, setCopied] = useState(false);

  const asNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      computeBreakEven({
        onDemandHourly: asNumber(onDemandHourly),
        reservedHourly: asNumber(reservedHourly),
        upfront: asNumber(upfront),
        termId,
      }),
    [onDemandHourly, reservedHourly, upfront, termId],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Reserved instance break-even analysis",
      `Term: ${result.termLabel}`,
      `On-demand: ${onDemandHourly}/h (${money(result.monthlyOnDemand)}/mo)`,
      `Reservation cost over term: ${money(result.totalReserved)}`,
      `Break-even: ${NUM.format(result.breakEvenMonths)} months of uptime (${NUM.format(result.minUtilizationPercent)}% utilisation)`,
      result.paysOff
        ? `Savings at full utilisation: ${money(result.savingsFullTerm)} (${NUM.format(result.savingsPercent)}%)`
        : "This reservation never beats on-demand, even at 100% utilisation.",
    ].join("\n");
  }, [hasError, result, onDemandHourly]);

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
    setOnDemandHourly(DEFAULTS.onDemandHourly);
    setReservedHourly(DEFAULTS.reservedHourly);
    setUpfront(DEFAULTS.upfront);
    setTermId(DEFAULTS.termId);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["On-demand cost per month", DASH],
        ["Reservation cost over the term", DASH],
        ["Minimum utilisation to break even", DASH],
        ["Savings at full utilisation", DASH],
      ]
    : [
        ["On-demand cost per month (730 h)", money(result.monthlyOnDemand)],
        ["Reserved recurring cost per month", money(result.monthlyReservedRecurring)],
        ["Reservation cost over the term", money(result.totalReserved)],
        ["On-demand cost over the full term", money(result.totalOnDemandFullTerm)],
        [
          "Minimum utilisation to break even",
          `${NUM.format(result.minUtilizationPercent)}% of the term`,
        ],
        [
          "Savings at full utilisation",
          result.paysOff
            ? `${money(result.savingsFullTerm)} (${NUM.format(result.savingsPercent)}%)`
            : `${money(result.savingsFullTerm)} — a loss`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Cloud commitments
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Reserved Instance Break-Even Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A reservation charges you for the whole term whether the instance runs or not. Enter the
          on-demand rate and the reservation&apos;s price to see how many months of real uptime
          make the commitment worth it. Works for AWS RIs and Savings Plans, Azure Reservations and
          GCP committed use.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ri-od">
              On-demand price (USD per hour)
            </label>
            <input
              id="ri-od"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={onDemandHourly}
              onChange={(event) => setOnDemandHourly(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ri-res">
              Reserved recurring price (USD per hour)
            </label>
            <input
              id="ri-res"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={reservedHourly}
              onChange={(event) => setReservedHourly(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Enter 0 for an all-upfront reservation.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ri-upfront">
              Upfront payment (USD)
            </label>
            <input
              id="ri-upfront"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={upfront}
              onChange={(event) => setUpfront(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ri-term">
              Commitment term
            </label>
            <select
              id="ri-term"
              className={`mt-2 ${INPUT_CLASS}`}
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
            >
              {TERM_OPTIONS.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.label}
                </option>
              ))}
            </select>
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
              Break-even uptime
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.breakEvenMonths)} months`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.paysOff
                  ? `Run the workload at least ${NUM.format(result.breakEvenMonths)} of the ${result.termMonths} months (${NUM.format(result.minUtilizationPercent)}% utilisation) and the reservation wins.`
                  : "The reservation costs more than on-demand even at 100% utilisation — do not buy it at these prices."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the break-even analysis"
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
              <dd
                className={`text-right font-semibold ${
                  !hasError && label.startsWith("Savings")
                    ? result.paysOff
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]"
                    : ""
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Months are priced at 730 hours, the convention AWS, Azure and GCP use. The analysis ignores
        the time value of money and any convertible/exchange options a provider offers on its
        reservations — factor those in for large commitments.
      </p>
    </main>
  );
}
