"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, Plus, RotateCcw, Scale, Trash2 } from "lucide-react";

import { compareOffers, DEFAULT_GST_ON_FEES_PCT, MAX_OFFERS, MIN_OFFERS } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const MULT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (typeof value === "number" && Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) =>
  typeof value === "number" && Number.isFinite(value) ? `${PCT.format(value)}%` : DASH;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-medium text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const TH = "py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]";
const TD = "py-2 pr-3 whitespace-nowrap";

/** Horizon shortcuts. 600 is the library's tenure ceiling, so it always means "run to term". */
const HORIZON_PRESETS = [
  { label: "Year 1", months: "12" },
  { label: "Year 2", months: "24" },
  { label: "Year 3", months: "36" },
  { label: "Year 5", months: "60" },
  { label: "Full term", months: "600" },
];

const SCHEDULE_PREVIEW_ROWS = 12;

/**
 * Defaults chosen so a real ranking inversion is visible at first paint: Offer A is the
 * cheaper of the two over the full 60 months and the dearer one if the loan is closed in
 * month 36, and Offer C shows what a flat quote is really worth.
 */
const DEFAULT_OFFERS = [
  {
    label: "Offer A",
    principal: "500000",
    tenureMonths: "60",
    nominalRatePct: "10.25",
    rateType: "reducing",
    rateBasis: "fixed",
    flatPayoffBasis: "straight-line",
    processingFeeMode: "percent",
    processingFeeValue: "0.5",
    otherChargesAmount: "2500",
    insuranceAmount: "12000",
    insuranceFinanced: true,
    gstOnFeesPct: String(DEFAULT_GST_ON_FEES_PCT),
    foreclosurePenaltyPct: "5",
  },
  {
    label: "Offer B",
    principal: "500000",
    tenureMonths: "60",
    nominalRatePct: "11.75",
    rateType: "reducing",
    rateBasis: "fixed",
    flatPayoffBasis: "straight-line",
    processingFeeMode: "percent",
    processingFeeValue: "0.5",
    otherChargesAmount: "1000",
    insuranceAmount: "0",
    insuranceFinanced: false,
    gstOnFeesPct: String(DEFAULT_GST_ON_FEES_PCT),
    foreclosurePenaltyPct: "0",
  },
  {
    label: "Offer C",
    principal: "500000",
    tenureMonths: "60",
    nominalRatePct: "6.75",
    rateType: "flat",
    rateBasis: "fixed",
    flatPayoffBasis: "rule-of-78",
    processingFeeMode: "percent",
    processingFeeValue: "0.75",
    otherChargesAmount: "0",
    insuranceAmount: "0",
    insuranceFinanced: false,
    gstOnFeesPct: String(DEFAULT_GST_ON_FEES_PCT),
    foreclosurePenaltyPct: "3",
  },
];

/** Next unused "Offer X" label, scanning A, B, C... so it never collides with a label already
 * in use — offers can be removed and re-added in any order, so array length alone (the previous
 * approach) is not a safe source for the next letter. */
const nextOfferLabel = (existingOffers) => {
  const used = new Set(existingOffers.map((offer) => offer.label));
  for (let i = 0; i < 26; i += 1) {
    const candidate = `Offer ${String.fromCharCode(65 + i)}`;
    if (!used.has(candidate)) return candidate;
  }
  return `Offer ${existingOffers.length + 1}`;
};

const blankOffer = (existingOffers) => ({
  ...DEFAULT_OFFERS[1],
  label: nextOfferLabel(existingOffers),
  otherChargesAmount: "0",
  foreclosurePenaltyPct: "0",
});

export default function ToolHome() {
  const [offers, setOffers] = useState(DEFAULT_OFFERS);
  const [horizonMonths, setHorizonMonths] = useState("36");
  const [includeInsuranceInApr, setIncludeInsuranceInApr] = useState(true);
  const [scheduleIndex, setScheduleIndex] = useState(0);
  const [showAllRows, setShowAllRows] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => compareOffers({ offers, horizonMonths, includeInsuranceInApr }),
    [offers, horizonMonths, includeInsuranceInApr],
  );

  const failed = Boolean(result.error);
  const rows = failed ? [] : result.offers;
  const activeIndex = scheduleIndex < rows.length ? scheduleIndex : 0;
  const active = rows[activeIndex] ?? null;
  const flatOffers = rows.filter((offer) => offer.rateType === "flat");
  const allNotes = rows.flatMap((offer) => offer.notes.map((note) => ({ label: offer.label, note })));
  // The offer that is cheapest AT THE HORIZON — used to describe its own fate accurately: the
  // global result.horizonMonths is clamped to the longest offer's tenure (see compareOffers in
  // ../lib), so a shorter-tenure winning offer may finish naturally well before that month with
  // no foreclosure at all, which result.anyForecloses alone can't tell us.
  const winningOffer = rows.find((offer) => offer.label === result.lowestHorizonAprLabel) ?? null;

  const updateOffer = (index, key, value) => {
    setOffers((current) => current.map((offer, i) => (i === index ? { ...offer, [key]: value } : offer)));
  };

  const addOffer = () => {
    setOffers((current) => (current.length >= MAX_OFFERS ? current : [...current, blankOffer(current)]));
  };

  const removeOffer = (index) => {
    setOffers((current) => (current.length <= MIN_OFFERS ? current : current.filter((_, i) => i !== index)));
    setScheduleIndex(0);
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your offers with the demo/default values and cannot be undone.",
      )
    ) {
      return;
    }
    setOffers(DEFAULT_OFFERS);
    setHorizonMonths("36");
    setIncludeInsuranceInApr(true);
    setScheduleIndex(0);
    setShowAllRows(false);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Effective APR Comparator",
      winningOffer?.forecloses
        ? `Repayment horizon: ${winningOffer.label} cleared in month ${winningOffer.horizon.months}`
        : `Repayment horizon: ${winningOffer?.label ?? DASH} finishes naturally at month ${winningOffer?.tenureMonths ?? result.horizonMonths}`,
      "",
    ];
    result.offers.forEach((offer) => {
      lines.push(
        `${offer.label} — quoted ${pct(offer.quotedRatePct)} ${offer.rateType}, ${offer.tenureMonths} months`,
        `  EMI ${money(offer.emi)} | net disbursed ${money(offer.netDisbursed)} | upfront charges ${money(offer.upfrontCharges)}`,
        `  Effective APR full term ${pct(offer.fullTerm.aprNominalPct)} | at horizon ${pct(offer.horizon.aprNominalPct)}`,
        `  Total cost at horizon ${money(offer.horizon.totalCost)} (rank ${offer.fullTermRank} at full term, ${offer.horizonRank} at horizon)`,
      );
      if (offer.flatGap) {
        lines.push(
          `  Flat ${pct(offer.quotedRatePct)} restated on reducing balance: ${pct(offer.flatGap.reducingNominalAnnualPct)} (${MULT.format(offer.flatGap.multiple)}x)`,
        );
      }
    });
    lines.push(
      "",
      `Lowest APR over the full term: ${result.lowestFullTermAprLabel} at ${pct(result.lowestFullTermAprPct)}`,
      `Lowest APR at the chosen horizon: ${result.lowestHorizonAprLabel} at ${pct(result.lowestHorizonAprPct)}`,
      `Lowest total cost at the chosen horizon: ${result.lowestHorizonCostLabel} at ${money(result.lowestHorizonCost)}`,
      result.rankingFlipped
        ? "The ranking inverts between the full term and the chosen horizon."
        : "The ranking is the same over the full term and at the chosen horizon.",
      "",
      "APR method: IRR of the actual cash flows on the net disbursed amount, reducing balance, annualised x12 — RBI/2024-25/18 dated 15 April 2024, Annex B footnote 10.",
    );
    return lines.join("\n");
  }, [failed, result, winningOffer]);

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

  const scheduleRows =
    active && !showAllRows ? active.schedule.slice(0, SCHEDULE_PREVIEW_ROWS) : (active?.schedule ?? []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Loan comparison
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Effective APR Comparator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the quoted terms of each offer. The effective APR is the internal rate of return of
          the real cash flows — what actually reaches your account after fees, GST and bundled
          insurance, against every instalment and any foreclosure payoff — solved by bisection on
          the net disbursed amount, the method RBI prescribes for the Key Facts Statement.
        </p>
      </header>

      {/* ---------- horizon ---------- */}
      <section className={CARD} aria-labelledby="apr-horizon-heading">
        <h2 id="apr-horizon-heading" className="text-base font-semibold">
          Repayment horizon
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The month you expect to clear the loan. Anything short of the tenure is treated as a
          foreclosure: the outstanding principal, the penalty on it and GST on that penalty all land
          in that month.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="apr-horizon">
              Clear the loan in month
            </label>
            <input
              id="apr-horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="1"
              value={horizonMonths}
              onChange={(event) => setHorizonMonths(event.target.value)}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>Jump to</span>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Repayment horizon shortcuts">
              {HORIZON_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setHorizonMonths(preset.months)}
                  aria-pressed={horizonMonths === preset.months}
                  className={
                    horizonMonths === preset.months
                      ? `${PRIMARY_BTN} px-3`
                      : `${GHOST_BTN} px-3 text-[var(--muted-foreground)]`
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm" htmlFor="apr-insurance-toggle">
          <input
            id="apr-insurance-toggle"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={includeInsuranceInApr}
            onChange={(event) => setIncludeInsuranceInApr(event.target.checked)}
          />
          <span>
            Count bundled insurance as a cost of credit
            <span className="block text-xs text-[var(--muted-foreground)]">
              RBI KFS circular para 7 puts third-party charges routed through the lender, insurance
              named explicitly, inside the APR.
            </span>
          </span>
        </label>
      </section>

      {/* ---------- offers ---------- */}
      <section className="mt-6" aria-labelledby="apr-offers-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="apr-offers-heading" className="text-base font-semibold">
            The offers
          </h2>
          <button
            type="button"
            onClick={addOffer}
            disabled={offers.length >= MAX_OFFERS}
            aria-label="Add another offer"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add offer
          </button>
        </div>

        <div className="grid gap-4">
          {offers.map((offer, index) => (
            <div key={index} className={CARD}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-[12rem] flex-1">
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-label`}>
                    Label
                  </label>
                  <input
                    id={`apr-${index}-label`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={offer.label}
                    onChange={(event) => updateOffer(index, "label", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOffer(index)}
                  disabled={offers.length <= MIN_OFFERS}
                  aria-label={`Remove ${offer.label}`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-principal`}>
                    Loan amount you need in hand (INR)
                  </label>
                  <input
                    id={`apr-${index}-principal`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="10000"
                    value={offer.principal}
                    onChange={(event) => updateOffer(index, "principal", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-tenure`}>
                    Tenure (months)
                  </label>
                  <input
                    id={`apr-${index}-tenure`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="600"
                    step="1"
                    value={offer.tenureMonths}
                    onChange={(event) => updateOffer(index, "tenureMonths", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-rate`}>
                    Quoted interest rate (% a year)
                  </label>
                  <input
                    id={`apr-${index}-rate`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="200"
                    step="0.05"
                    value={offer.nominalRatePct}
                    onChange={(event) => updateOffer(index, "nominalRatePct", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-ratetype`}>
                    Rate is quoted as
                  </label>
                  <select
                    id={`apr-${index}-ratetype`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={offer.rateType}
                    onChange={(event) => updateOffer(index, "rateType", event.target.value)}
                  >
                    <option value="reducing">Reducing balance</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-basis`}>
                    Fixed or floating
                  </label>
                  <select
                    id={`apr-${index}-basis`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={offer.rateBasis}
                    onChange={(event) => updateOffer(index, "rateBasis", event.target.value)}
                  >
                    <option value="fixed">Fixed rate</option>
                    <option value="floating">Floating rate</option>
                  </select>
                </div>
                {offer.rateType === "flat" && (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`apr-${index}-payoff`}>
                      Early-closure payoff basis
                    </label>
                    <select
                      id={`apr-${index}-payoff`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={offer.flatPayoffBasis}
                      onChange={(event) => updateOffer(index, "flatPayoffBasis", event.target.value)}
                    >
                      <option value="straight-line">Straight line</option>
                      <option value="rule-of-78">Rule of 78 (sum of digits)</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-pfmode`}>
                    Processing fee charged as
                  </label>
                  <select
                    id={`apr-${index}-pfmode`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={offer.processingFeeMode}
                    onChange={(event) => updateOffer(index, "processingFeeMode", event.target.value)}
                  >
                    <option value="percent">Percentage of the loan</option>
                    <option value="amount">Flat amount</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-pfvalue`}>
                    {offer.processingFeeMode === "percent"
                      ? "Processing fee (% of loan)"
                      : "Processing fee (INR)"}
                  </label>
                  <input
                    id={`apr-${index}-pfvalue`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={offer.processingFeeMode === "percent" ? "0.05" : "500"}
                    value={offer.processingFeeValue}
                    onChange={(event) => updateOffer(index, "processingFeeValue", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-other`}>
                    Documentation, legal and stamping (INR)
                  </label>
                  <input
                    id={`apr-${index}-other`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="500"
                    value={offer.otherChargesAmount}
                    onChange={(event) => updateOffer(index, "otherChargesAmount", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-gst`}>
                    GST on fees (%)
                  </label>
                  <input
                    id={`apr-${index}-gst`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="50"
                    step="0.5"
                    value={offer.gstOnFeesPct}
                    onChange={(event) => updateOffer(index, "gstOnFeesPct", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-insurance`}>
                    Insurance premium (INR)
                  </label>
                  <input
                    id={`apr-${index}-insurance`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={offer.insuranceAmount}
                    onChange={(event) => updateOffer(index, "insuranceAmount", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`apr-${index}-foreclosure`}>
                    Foreclosure penalty (% of outstanding principal)
                  </label>
                  <input
                    id={`apr-${index}-foreclosure`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="20"
                    step="0.5"
                    value={offer.foreclosurePenaltyPct}
                    onChange={(event) => updateOffer(index, "foreclosurePenaltyPct", event.target.value)}
                  />
                </div>
              </div>

              <label
                className="mt-3 flex min-h-11 items-center gap-3 text-sm"
                htmlFor={`apr-${index}-insfinanced`}
              >
                <input
                  id={`apr-${index}-insfinanced`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={offer.insuranceFinanced}
                  onChange={(event) => updateOffer(index, "insuranceFinanced", event.target.checked)}
                />
                <span>
                  Premium is added to the loan
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    Interest then runs on the premium too, so it raises the EMI as well as the APR.
                  </span>
                </span>
              </label>
            </div>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {result.error}
        </p>
      )}

      {/* ---------- headline ---------- */}
      <section
        className={`mt-6 ${CARD}`}
        aria-labelledby="apr-result-heading"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="apr-result-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              {failed || result.anyForecloses
                ? "Lowest effective APR at your horizon"
                : "Lowest effective APR over the full term"}
            </h2>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : pct(result.lowestHorizonAprPct)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : winningOffer?.forecloses
                  ? `${result.lowestHorizonAprLabel}, if the loan is cleared in month ${winningOffer.horizon.months}`
                  : `${result.lowestHorizonAprLabel}, which finishes naturally at month ${winningOffer?.tenureMonths ?? result.horizonMonths}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the APR comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Lowest APR over the full term",
              failed ? DASH : `${result.lowestFullTermAprLabel} — ${pct(result.lowestFullTermAprPct)}`,
            ],
            [
              "Lowest APR at your horizon",
              failed ? DASH : `${result.lowestHorizonAprLabel} — ${pct(result.lowestHorizonAprPct)}`,
            ],
            [
              "Lowest total cost at your horizon",
              failed ? DASH : `${result.lowestHorizonCostLabel} — ${money(result.lowestHorizonCost)}`,
            ],
            ["Spread between best and worst APR at your horizon", failed ? DASH : pct(result.aprSpreadAtHorizon)],
            [
              "Does the ranking change at your horizon?",
              failed ? DASH : result.rankingFlipped ? "Yes" : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.rankingFlipped && (
          <div className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
            <p className="flex items-center gap-2 font-semibold">
              <ArrowRightLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              The ranking inverts at month {result.horizonMonths}
            </p>
            <ul className="mt-2 space-y-1">
              {result.flips.map((flip) => (
                <li key={flip.pair.join("-")}>
                  {flip.pair[0]} vs {flip.pair[1]}: over the full term {flip.fullTermLower} has the lower
                  APR at {pct(flip.fullTermLowerAprPct)}; cleared in month {result.horizonMonths} it is{" "}
                  {flip.horizonLower} at {pct(flip.horizonLowerAprPct)}.
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------- comparison table ---------- */}
      <section className={`mt-6 ${CARD}`} aria-labelledby="apr-table-heading">
        <h2 id="apr-table-heading" className="text-base font-semibold">
          Offer by offer
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Net disbursed is the sanctioned amount less every upfront charge, which is the base the
          APR is computed on.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className={TH}>Offer</th>
                <th scope="col" className={TH}>Quoted</th>
                <th scope="col" className={TH}>EMI</th>
                <th scope="col" className={TH}>Upfront charges</th>
                <th scope="col" className={TH}>Net disbursed</th>
                <th scope="col" className={TH}>APR full term</th>
                <th scope="col" className={TH}>APR at horizon</th>
                <th scope="col" className={TH}>Total cost at horizon</th>
                <th scope="col" className={TH}>Rank</th>
              </tr>
            </thead>
            <tbody>
              {failed ? (
                <tr>
                  <td className={TD} colSpan={9}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                rows.map((offer) => (
                  <tr key={offer.label} className="border-b border-[var(--border)] last:border-0">
                    <td className={`${TD} font-semibold`}>{offer.label}</td>
                    <td className={TD}>
                      {pct(offer.quotedRatePct)}
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {offer.rateType === "flat" ? "flat" : "reducing"} · {offer.tenureMonths} m
                      </span>
                    </td>
                    <td className={TD}>{money(offer.emi)}</td>
                    <td className={TD}>{money(offer.upfrontCharges)}</td>
                    <td className={TD}>{money(offer.netDisbursed)}</td>
                    <td className={TD}>{pct(offer.fullTerm.aprNominalPct)}</td>
                    <td className={`${TD} font-semibold`}>{pct(offer.horizon.aprNominalPct)}</td>
                    <td className={TD}>{money(offer.horizon.totalCost)}</td>
                    <td className={TD}>
                      {offer.fullTermRank}
                      {" → "}
                      {offer.horizonRank}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          APR is the monthly IRR multiplied by 12, the nominal annualisation RBI uses. The
          annually-compounded equivalent is higher: {failed ? DASH : pct(rows[0]?.horizon.aprEffectivePct)} for{" "}
          {failed ? DASH : rows[0]?.label} at your horizon.
        </p>
      </section>

      {/* ---------- charge breakdown ---------- */}
      {!failed && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="apr-charges-heading">
          <h2 id="apr-charges-heading" className="text-base font-semibold">
            Where the money goes at signing, and at exit
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className={TH}>Offer</th>
                  <th scope="col" className={TH}>Sanctioned</th>
                  <th scope="col" className={TH}>Processing fee</th>
                  <th scope="col" className={TH}>GST on fees</th>
                  <th scope="col" className={TH}>Docs / legal</th>
                  <th scope="col" className={TH}>Insurance</th>
                  <th scope="col" className={TH}>Payoff at exit</th>
                  <th scope="col" className={TH}>Penalty + GST</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((offer) => (
                  <tr key={offer.label} className="border-b border-[var(--border)] last:border-0">
                    <td className={`${TD} font-semibold`}>{offer.label}</td>
                    <td className={TD}>{money(offer.financedPrincipal)}</td>
                    <td className={TD}>{money(offer.processingFee)}</td>
                    <td className={TD}>{money(offer.gstOnUpfrontFees)}</td>
                    <td className={TD}>{money(offer.otherChargesAmount)}</td>
                    <td className={TD}>
                      {money(offer.insuranceAmount)}
                      {offer.insuranceAmount > 0 && (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {offer.insuranceFinanced ? "financed" : "paid upfront"}
                        </span>
                      )}
                    </td>
                    <td className={TD}>{offer.forecloses ? money(offer.horizon.payoffBalance) : DASH}</td>
                    <td className={TD}>
                      {offer.forecloses ? money(offer.horizon.penaltyWithGst) : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------- flat vs reducing ---------- */}
      {!failed && flatOffers.length > 0 && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="apr-flat-heading">
          <h2 id="apr-flat-heading" className="text-base font-semibold">
            Flat quotes, restated on reducing balance
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            A flat rate charges interest on the whole original amount for the whole tenure, even
            though you have already repaid much of it. The reducing-balance equivalent below is the
            rate that produces the same EMI, fees excluded, so it isolates the rate restatement.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[38rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className={TH}>Offer</th>
                  <th scope="col" className={TH}>Quoted flat</th>
                  <th scope="col" className={TH}>Reducing equivalent</th>
                  <th scope="col" className={TH}>Multiple</th>
                  <th scope="col" className={TH}>Total interest</th>
                </tr>
              </thead>
              <tbody>
                {flatOffers.map((offer) => (
                  <tr key={offer.label} className="border-b border-[var(--border)] last:border-0">
                    <td className={`${TD} font-semibold`}>{offer.label}</td>
                    <td className={TD}>{pct(offer.quotedRatePct)}</td>
                    <td className={`${TD} font-semibold text-[var(--danger-text)]`}>
                      {pct(offer.flatGap?.reducingNominalAnnualPct)}
                    </td>
                    <td className={TD}>
                      {offer.flatGap?.multiple ? `${MULT.format(offer.flatGap.multiple)}x` : DASH}
                    </td>
                    <td className={TD}>{money(offer.totalInterestFullTerm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------- schedule ---------- */}
      {!failed && active && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="apr-schedule-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="apr-schedule-heading" className="text-base font-semibold">
                Repayment schedule
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {active.forecloses
                  ? `Rows past month ${result.horizonMonths} are not paid if you clear the loan then.`
                  : "Every instalment to the end of the tenure."}
              </p>
            </div>
            <div className="min-w-[12rem]">
              <label className={LABEL_CLASS} htmlFor="apr-schedule-pick">
                Show schedule for
              </label>
              <select
                id="apr-schedule-pick"
                className={`mt-2 ${INPUT_CLASS}`}
                value={activeIndex}
                onChange={(event) => setScheduleIndex(Number(event.target.value))}
              >
                {rows.map((offer, index) => (
                  <option key={offer.label} value={index}>
                    {offer.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className={TH}>Month</th>
                  <th scope="col" className={TH}>Opening balance</th>
                  <th scope="col" className={TH}>Interest</th>
                  <th scope="col" className={TH}>Principal</th>
                  <th scope="col" className={TH}>Instalment</th>
                  <th scope="col" className={TH}>Closing balance</th>
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((row) => (
                  <tr
                    key={row.month}
                    className={
                      active.forecloses && row.month === result.horizonMonths
                        ? "border-b border-[var(--border)] bg-[var(--warning-soft)]"
                        : "border-b border-[var(--border)] last:border-0"
                    }
                  >
                    <td className={TD}>{row.month}</td>
                    <td className={TD}>{money(row.openingBalance)}</td>
                    <td className={TD}>{money(row.interest)}</td>
                    <td className={TD}>{money(row.principal)}</td>
                    <td className={TD}>{money(row.instalment)}</td>
                    <td className={TD}>{money(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {active.schedule.length > SCHEDULE_PREVIEW_ROWS && (
            <button
              type="button"
              onClick={() => setShowAllRows((current) => !current)}
              aria-label={showAllRows ? "Show fewer schedule rows" : "Show every schedule row"}
              className={`mt-3 ${GHOST_BTN}`}
            >
              {showAllRows ? "Show first 12 months" : `Show all ${active.schedule.length} months`}
            </button>
          )}
        </section>
      )}

      {/* ---------- notes ---------- */}
      {!failed && allNotes.length > 0 && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="apr-notes-heading">
          <h2 id="apr-notes-heading" className="text-base font-semibold">
            Rules that apply to what you entered
          </h2>
          <ul className="mt-3 space-y-3 text-sm text-[var(--muted-foreground)]">
            {allNotes.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <span className="font-semibold text-[var(--foreground)]">{item.label}: </span>
                {item.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- method ---------- */}
      <section className={`mt-6 ${CARD}`} aria-labelledby="apr-method-heading">
        <h2 id="apr-method-heading" className="text-base font-semibold">
          How these figures are produced
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            <span className="font-semibold text-[var(--foreground)]">APR: </span>
            the monthly internal rate of return of the cash-flow series — net disbursed amount
            received at month 0, each instalment paid thereafter, plus the foreclosure payoff in the
            exit month — solved by bisection to a monthly-rate tolerance of 1e-12, then multiplied
            by 12. RBI/2024-25/18, DOR.STR.REC.13/13.03.00/2024-25 dated 15 April 2024, Annex B
            footnote 10: computed on net disbursed amount using the IRR approach and reducing
            balance method. Running the RBI&apos;s own Annex B illustration through it returns
            17.10%.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Net disbursed amount: </span>
            sanctioned amount less all fees and charges payable, per Annex B row 7 of the same
            circular. Para 7 puts charges recovered on behalf of third parties, insurance and legal
            charges named explicitly, inside the APR.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">GST: </span>
            18% on the processing fee, documentation and legal charges and on any foreclosure
            penalty, under heading 9971 of Notification No. 11/2017-Central Tax (Rate) dated 28 June
            2017. Loan interest is exempt and is never grossed up.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Foreclosure: </span>
            the penalty is applied to the principal outstanding on the exit month from the schedule
            above. RBI (Pre-payment Charges on Loans) Directions, 2025 of 2 July 2025 bar such
            charges, and any lock-in, on floating rate loans to individuals for non-business
            purposes sanctioned or renewed on or after 1 January 2026.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Not modelled: </span>
            floating rate resets, late-payment penal charges, part-prepayments short of full
            closure, moratoriums, subvention, and any tax deduction you may separately be entitled
            to. Regulatory text current as read on 29 July 2026.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This page computes and reports numbers from the terms you enter. It does not evaluate
        lenders, does not recommend an offer, and is not financial, tax or legal advice. Confirm
        every figure against the Key Facts Statement and the loan agreement before you sign.
      </p>
    </main>
  );
}
