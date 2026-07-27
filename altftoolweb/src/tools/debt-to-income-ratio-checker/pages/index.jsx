"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { FOIR_ZONES, computeDebtToIncome } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DASH = "—";

const DEFAULTS = {
  grossMonthlyIncome: "120000",
  netMonthlyIncome: "95000",
  homeLoanEmi: "30000",
  carLoanEmi: "8000",
  personalLoanEmi: "5000",
  creditCardMinimumDue: "2000",
  otherEmi: "0",
  rentPaid: "0",
  includeRent: false,
  targetFoirPercent: "50",
};

const ZONE_STYLES = {
  comfortable: "bg-[var(--success-soft)] text-[var(--success)]",
  manageable: "bg-[var(--info-soft)] text-[var(--info)]",
  stretched: "bg-[var(--warning-soft)] text-[var(--warning)]",
  overleveraged: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const ZONE_BAR = {
  comfortable: "bg-[var(--success)]",
  manageable: "bg-[var(--info)]",
  stretched: "bg-[var(--warning)]",
  overleveraged: "bg-[var(--danger)]",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState(DEFAULTS.grossMonthlyIncome);
  const [netMonthlyIncome, setNetMonthlyIncome] = useState(DEFAULTS.netMonthlyIncome);
  const [homeLoanEmi, setHomeLoanEmi] = useState(DEFAULTS.homeLoanEmi);
  const [carLoanEmi, setCarLoanEmi] = useState(DEFAULTS.carLoanEmi);
  const [personalLoanEmi, setPersonalLoanEmi] = useState(DEFAULTS.personalLoanEmi);
  const [creditCardMinimumDue, setCreditCardMinimumDue] = useState(DEFAULTS.creditCardMinimumDue);
  const [otherEmi, setOtherEmi] = useState(DEFAULTS.otherEmi);
  const [rentPaid, setRentPaid] = useState(DEFAULTS.rentPaid);
  const [includeRent, setIncludeRent] = useState(DEFAULTS.includeRent);
  const [targetFoirPercent, setTargetFoirPercent] = useState(DEFAULTS.targetFoirPercent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDebtToIncome({
        grossMonthlyIncome: toNumber(grossMonthlyIncome),
        netMonthlyIncome: toNumber(netMonthlyIncome),
        homeLoanEmi: toNumber(homeLoanEmi),
        carLoanEmi: toNumber(carLoanEmi),
        personalLoanEmi: toNumber(personalLoanEmi),
        creditCardMinimumDue: toNumber(creditCardMinimumDue),
        otherEmi: toNumber(otherEmi),
        rentPaid: toNumber(rentPaid),
        includeRent,
        targetFoirPercent: toNumber(targetFoirPercent),
      }),
    [
      grossMonthlyIncome,
      netMonthlyIncome,
      homeLoanEmi,
      carLoanEmi,
      personalLoanEmi,
      creditCardMinimumDue,
      otherEmi,
      rentPaid,
      includeRent,
      targetFoirPercent,
    ],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));
  const showPct = (value) => (hasError ? DASH : pct(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Debt to income check",
      `Gross income: ${money(result.grossMonthlyIncome)} a month`,
      `Take-home income: ${money(result.netMonthlyIncome)} a month`,
      `Total monthly obligations: ${money(result.totalObligations)}`,
      `FOIR on take-home pay: ${pct(result.foirNetPercent)} — ${result.zoneLabel}`,
      `Debt to income on gross pay: ${pct(result.dtiGrossPercent)} against the 36% benchmark`,
      `Housing share of gross pay: ${pct(result.frontEndGrossPercent)} against the 28% benchmark`,
      result.hasHeadroom
        ? `Room for another ${money(result.headroom)} of EMI at a ${pct(result.targetFoirPercent)} FOIR`
        : `Obligations exceed a ${pct(result.targetFoirPercent)} FOIR by ${money(result.reduceBy)}`,
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
    setGrossMonthlyIncome(DEFAULTS.grossMonthlyIncome);
    setNetMonthlyIncome(DEFAULTS.netMonthlyIncome);
    setHomeLoanEmi(DEFAULTS.homeLoanEmi);
    setCarLoanEmi(DEFAULTS.carLoanEmi);
    setPersonalLoanEmi(DEFAULTS.personalLoanEmi);
    setCreditCardMinimumDue(DEFAULTS.creditCardMinimumDue);
    setOtherEmi(DEFAULTS.otherEmi);
    setRentPaid(DEFAULTS.rentPaid);
    setIncludeRent(DEFAULTS.includeRent);
    setTargetFoirPercent(DEFAULTS.targetFoirPercent);
    setCopied(false);
  };

  const barWidth = hasError ? 0 : Math.max(0, Math.min(100, result.foirNetPercent));

  const fields = [
    ["dti-home", "Home loan EMI (INR)", homeLoanEmi, setHomeLoanEmi, null],
    ["dti-car", "Car or vehicle loan EMI (INR)", carLoanEmi, setCarLoanEmi, null],
    ["dti-personal", "Personal loan EMI (INR)", personalLoanEmi, setPersonalLoanEmi, null],
    [
      "dti-card",
      "Credit card minimum due (INR)",
      creditCardMinimumDue,
      setCreditCardMinimumDue,
      "Lenders count the minimum due, not the full outstanding.",
    ],
    ["dti-other", "Other EMIs (INR)", otherEmi, setOtherEmi, "Education loan, gold loan, consumer durable."],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          FOIR check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Debt to Income Ratio Checker India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Indian lenders underwrite to FOIR — total EMIs as a share of take-home pay. See where you
          sit, how you score against the 28/36 rule, and how much EMI room is left.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dti-gross">
              Gross monthly income (INR)
            </label>
            <input
              id="dti-gross"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={grossMonthlyIncome}
              onChange={(event) => setGrossMonthlyIncome(event.target.value)}
            />
            <p className={HINT_CLASS}>Before tax and deductions.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dti-net">
              Net take-home income (INR)
            </label>
            <input
              id="dti-net"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={netMonthlyIncome}
              onChange={(event) => setNetMonthlyIncome(event.target.value)}
            />
            <p className={HINT_CLASS}>What actually lands in your bank account.</p>
          </div>

          {fields.map(([id, label, value, setter, hint]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
              {hint && <p className={HINT_CLASS}>{hint}</p>}
            </div>
          ))}

          <div>
            <label className={LABEL_CLASS} htmlFor="dti-rent">
              Rent paid (INR)
            </label>
            <input
              id="dti-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={rentPaid}
              onChange={(event) => setRentPaid(event.target.value)}
            />
            <label className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={includeRent}
                onChange={(event) => setIncludeRent(event.target.checked)}
              />
              Count rent as an obligation
            </label>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="dti-target">
              Lender FOIR to test against (%)
            </label>
            <input
              id="dti-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={targetFoirPercent}
              onChange={(event) => setTargetFoirPercent(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              FOIR on take-home pay
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {showPct(result.foirNetPercent)}
            </p>
            {hasError ? (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Fix the input above to see your figures.
              </p>
            ) : (
              <p
                className={`mt-2 inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold ${ZONE_STYLES[result.zoneId]}`}
              >
                {result.zoneLabel}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the debt to income result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {!hasError && (
          <>
            <div
              className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`FOIR is ${pct(result.foirNetPercent)} of take-home pay, which is ${result.zoneLabel}`}
            >
              <span
                className={`block h-full ${ZONE_BAR[result.zoneId]}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{result.zoneNote}</p>
          </>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total monthly obligations", show(result.totalObligations)],
            ["Housing payment counted", show(result.housingPayment)],
            [
              "Debt to income on gross pay",
              hasError
                ? DASH
                : `${pct(result.dtiGrossPercent)} — benchmark ${pct(result.backEndBenchmarkPercent)} (${result.passesBackEnd ? "inside" : "over"})`,
            ],
            [
              "Housing share of gross pay",
              hasError
                ? DASH
                : `${pct(result.frontEndGrossPercent)} — benchmark ${pct(result.frontEndBenchmarkPercent)} (${result.passesFrontEnd ? "inside" : "over"})`,
            ],
            [
              `Obligation ceiling at ${hasError ? DASH : pct(result.targetFoirPercent)} FOIR`,
              show(result.targetObligationCeiling),
            ],
            [
              result.hasHeadroom ? "Room for a new EMI" : "Amount you are over by",
              hasError ? DASH : money(result.hasHeadroom ? result.headroom : result.reduceBy),
            ],
            [
              "Income left after all obligations",
              hasError ? DASH : `${money(result.residualIncome)} (${pct(result.residualPercent)})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.components.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <caption className="pb-2 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                What makes up the obligation
              </caption>
              <tbody>
                {result.components.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.label}</td>
                    <td className="py-2 text-right font-semibold">{money(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the zones read</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {FOIR_ZONES.map((zone, index) => (
            <div key={zone.id} className="py-2.5">
              <dt className="font-semibold">
                {zone.label} —{" "}
                {Number.isFinite(zone.upTo)
                  ? `${index === 0 ? "up to" : `${FOIR_ZONES[index - 1].upTo}% to`} ${zone.upTo}%`
                  : `above ${FOIR_ZONES[index - 1].upTo}%`}
              </dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{zone.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Guidance only, not a credit decision. FOIR caps are set by each lender's credit policy and
        vary with credit score, employer category and whether there is a co-applicant. Speak to your
        lender or a qualified adviser about your own position.
      </p>
    </main>
  );
}
