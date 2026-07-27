"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ship } from "lucide-react";

import {
  MULTIPLE_JOURNEY_VISA_MAX_YEARS,
  PASS_TYPES,
  SG_ARRIVAL_CARD_WINDOW_DAYS,
  estimateSingaporeVisaCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR_EXACT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const SGD = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "SGD",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_EXACT.format(Number.isFinite(value) ? value : 0);
const sgd = (value) => SGD.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  passTypeId: "entry-visa",
  applicants: "2",
  exchangeRate: "64",
  agentFee: "400",
  photos: "250",
  insurance: "0",
  courier: "0",
  other: "0",
  markup: "0",
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
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [passTypeId, setPassTypeId] = useState(DEFAULTS.passTypeId);
  const [applicants, setApplicants] = useState(DEFAULTS.applicants);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [agentFee, setAgentFee] = useState(DEFAULTS.agentFee);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [other, setOther] = useState(DEFAULTS.other);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateSingaporeVisaCost({
        passTypeId,
        applicants: toNumber(applicants),
        exchangeRate: toNumber(exchangeRate),
        agentFeeInrPerApplicant: toNumber(agentFee),
        photoFeeInrPerApplicant: toNumber(photos),
        insuranceInrPerApplicant: toNumber(insurance),
        courierFeeInr: toNumber(courier),
        otherFeeInr: toNumber(other),
        cardMarkupPct: toNumber(markup),
      }),
    [passTypeId, applicants, exchangeRate, agentFee, photos, insurance, courier, other, markup],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Singapore Visa Cost Estimator",
      `Type: ${result.passTypeLabel}`,
      `Applicants: ${result.applicants}`,
      `Processing fee (non-refundable): ${sgd(result.processingFeeSgd)} = ${moneyExact(result.processingFeeInr)}`,
      `Issuance fee (on approval only): ${sgd(result.issuanceFeeSgd)} = ${moneyExact(result.issuanceFeeInr)}`,
      `Charges paid in India: ${moneyExact(result.indianChargesInr)}`,
      `Total if approved: ${moneyExact(result.totalInr)}`,
      `Per applicant: ${moneyExact(result.perApplicantInr)}`,
      `At risk if rejected: ${moneyExact(result.atRiskIfRejectedInr)}`,
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
    setPassTypeId(DEFAULTS.passTypeId);
    setApplicants(DEFAULTS.applicants);
    setExchangeRate(DEFAULTS.exchangeRate);
    setAgentFee(DEFAULTS.agentFee);
    setPhotos(DEFAULTS.photos);
    setInsurance(DEFAULTS.insurance);
    setCourier(DEFAULTS.courier);
    setOther(DEFAULTS.other);
    setMarkup(DEFAULTS.markup);
    setCopied(false);
  };

  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ship className="h-4 w-4" aria-hidden="true" />
          ICA and MOM fees
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Singapore Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Singapore charges a processing fee when you apply and an issuance fee only when the pass
          is granted. Keeping them apart shows exactly how much you lose if the application is
          rejected.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Application</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-type">
              Visa or pass type
            </label>
            <select
              id="sg-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={passTypeId}
              onChange={(event) => setPassTypeId(event.target.value)}
            >
              {PASS_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-applicants">
              Applicants
            </label>
            <input
              id="sg-applicants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={applicants}
              onChange={(event) => setApplicants(event.target.value)}
            />
            <p className={HINT_CLASS}>Each person needs their own application and fee.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-fx">
              Exchange rate (rupees per SGD 1)
            </label>
            <input
              id="sg-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Charges you pay in India</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-agent">
              Authorised agent charge, per applicant (INR)
            </label>
            <input
              id="sg-agent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={agentFee}
              onChange={(event) => setAgentFee(event.target.value)}
            />
            <p className={HINT_CLASS}>Indian applicants submit through an authorised visa agent.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-photos">
              Photographs, per applicant (INR)
            </label>
            <input
              id="sg-photos"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={photos}
              onChange={(event) => setPhotos(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-insurance">
              Travel insurance, per applicant (INR)
            </label>
            <input
              id="sg-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
            <p className={HINT_CLASS}>Not mandatory for a short visit; usually refundable.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-courier">
              Courier and document handling (INR)
            </label>
            <input
              id="sg-courier"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={courier}
              onChange={(event) => setCourier(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-other">
              Other charges (INR)
            </label>
            <input
              id="sg-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
            <p className={HINT_CLASS}>Form V39A local sponsor letter, printing, notarisation.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="sg-markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total if approved
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.totalInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see a total."
                : `${show(result.atRiskIfRejectedInr)} of that is spent even if the application is rejected`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Singapore visa cost breakdown"
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
              aria-label="Reset every input to its default"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Processing fee (non-refundable)",
              hasError
                ? DASH
                : `${sgd(result.processingFeePerApplicantSgd)} each = ${money(result.processingFeeInr)}`,
            ],
            [
              "Issuance fee (only on approval)",
              hasError
                ? DASH
                : result.issuanceFeePerApplicantSgd > 0
                  ? `${sgd(result.issuanceFeePerApplicantSgd)} each = ${money(result.issuanceFeeInr)}`
                  : "None for this type",
            ],
            ["SG Arrival Card", hasError ? DASH : "Free"],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Per applicant", show(result.perApplicantInr)],
            ["At risk if rejected", show(result.atRiskIfRejectedInr)],
            ["Government share of the total", hasError ? DASH : `${NUM.format(result.govSharePct)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            A multiple-journey entry visa can be granted for up to{" "}
            {MULTIPLE_JOURNEY_VISA_MAX_YEARS} years, but the length of each stay is decided by the
            officer at the checkpoint. The SG Arrival Card is free and must be submitted within{" "}
            {SG_ARRIVAL_CARD_WINDOW_DAYS} days before arrival — never pay a third party for it.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Line by line</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Charge
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-medium">{line.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {line.note}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold whitespace-nowrap">
                      {money(line.amountInr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Immigration and Checkpoints Authority and Ministry of Manpower
        fees can change — confirm the current amounts on ica.gov.sg or mom.gov.sg, and note that an
        entry visa allows you to seek entry but does not guarantee it.
      </p>
    </main>
  );
}
