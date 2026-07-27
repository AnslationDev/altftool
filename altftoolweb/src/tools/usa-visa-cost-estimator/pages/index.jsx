"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlaneTakeoff, RotateCcw } from "lucide-react";

import {
  VISA_CLASSES,
  VISA_INTEGRITY_FEE_USD,
  estimateUsaVisaCost,
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
const USD = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_EXACT.format(Number.isFinite(value) ? value : 0);
const dollars = (value) => USD.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  visaClassId: "b1b2",
  applicants: "1",
  exchangeRate: "85",
  reciprocity: "0",
  includeIntegrityFee: false,
  photos: "400",
  courier: "0",
  travel: "3000",
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
  const [visaClassId, setVisaClassId] = useState(DEFAULTS.visaClassId);
  const [applicants, setApplicants] = useState(DEFAULTS.applicants);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [reciprocity, setReciprocity] = useState(DEFAULTS.reciprocity);
  const [includeIntegrityFee, setIncludeIntegrityFee] = useState(DEFAULTS.includeIntegrityFee);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [travel, setTravel] = useState(DEFAULTS.travel);
  const [other, setOther] = useState(DEFAULTS.other);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateUsaVisaCost({
        visaClassId,
        applicants: toNumber(applicants),
        exchangeRate: toNumber(exchangeRate),
        reciprocityFeeUsdPerApplicant: toNumber(reciprocity),
        includeIntegrityFee,
        photoFeeInrPerApplicant: toNumber(photos),
        courierFeeInr: toNumber(courier),
        travelFeeInr: toNumber(travel),
        otherFeeInr: toNumber(other),
        cardMarkupPct: toNumber(markup),
      }),
    [
      visaClassId,
      applicants,
      exchangeRate,
      reciprocity,
      includeIntegrityFee,
      photos,
      courier,
      travel,
      other,
      markup,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "USA Visa Cost Estimator",
      `Visa class: ${result.visaClassLabel}`,
      `Applicants: ${result.applicants}`,
      `MRV application fee: ${moneyExact(result.mrvFeeInr)}`,
      `SEVIS I-901 fee: ${moneyExact(result.sevisFeeInr)}`,
      `US fees in dollars: ${dollars(result.totalUsd)}`,
      `Charges paid in India: ${moneyExact(result.indianChargesInr)}`,
      `Total: ${moneyExact(result.totalInr)}`,
      `Per applicant: ${moneyExact(result.perApplicantInr)}`,
      `Non-refundable if refused: ${moneyExact(result.sunkIfRefusedInr)}`,
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
    setVisaClassId(DEFAULTS.visaClassId);
    setApplicants(DEFAULTS.applicants);
    setExchangeRate(DEFAULTS.exchangeRate);
    setReciprocity(DEFAULTS.reciprocity);
    setIncludeIntegrityFee(DEFAULTS.includeIntegrityFee);
    setPhotos(DEFAULTS.photos);
    setCourier(DEFAULTS.courier);
    setTravel(DEFAULTS.travel);
    setOther(DEFAULTS.other);
    setMarkup(DEFAULTS.markup);
    setCopied(false);
  };

  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
          US nonimmigrant visa
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">USA Visa Cost Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The MRV fee, the SEVIS I-901 fee and the reciprocity fee are three different payments to
          two different agencies. Pick your visa class and see what the whole application costs in
          rupees.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Application</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="us-class">
              Visa class
            </label>
            <select
              id="us-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={visaClassId}
              onChange={(event) => setVisaClassId(event.target.value)}
            >
              {VISA_CLASSES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="us-applicants">
              Applicants
            </label>
            <input
              id="us-applicants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={applicants}
              onChange={(event) => setApplicants(event.target.value)}
            />
            <p className={HINT_CLASS}>Every applicant, including infants, pays the full MRV fee.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-fx">
              Exchange rate (rupees per USD 1)
            </label>
            <input
              id="us-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-recip">
              Issuance (reciprocity) fee per applicant (USD)
            </label>
            <input
              id="us-recip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={reciprocity}
              onChange={(event) => setReciprocity(event.target.value)}
            />
            <p className={HINT_CLASS}>Depends on nationality; nil for most Indian applicants.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="us-markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
            />
            <p className={HINT_CLASS}>Applies if you pay the SEVIS or MRV fee on an Indian card.</p>
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input
            id="us-integrity"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={includeIntegrityFee}
            onChange={(event) => setIncludeIntegrityFee(event.target.checked)}
          />
          <span>
            Add the {dollars(VISA_INTEGRITY_FEE_USD)} Visa Integrity Fee
            <span className="block text-xs font-normal text-[var(--muted-foreground)]">
              Created by Public Law 119-21; switch on only if your post is already collecting it.
            </span>
          </span>
        </label>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Charges you pay in India</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="us-photos">
              Photographs, per applicant (INR)
            </label>
            <input
              id="us-photos"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={photos}
              onChange={(event) => setPhotos(event.target.value)}
            />
            <p className={HINT_CLASS}>51 x 51 mm on a white background.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-travel">
              Travel and stay for OFC plus consulate (INR)
            </label>
            <input
              id="us-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={travel}
              onChange={(event) => setTravel(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-courier">
              Passport courier or pickup (INR)
            </label>
            <input
              id="us-courier"
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
            <label className={LABEL_CLASS} htmlFor="us-other">
              Other charges (INR)
            </label>
            <input
              id="us-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
            <p className={HINT_CLASS}>Attestation, translations, document couriers.</p>
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
              Total application cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.totalInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see a total."
                : `${dollars(result.totalUsd)} in US government fees plus ${money(
                    result.indianChargesInr,
                  )} paid in India`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the US visa cost breakdown"
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
              "MRV application fee",
              hasError
                ? DASH
                : `${dollars(result.mrvFeePerApplicantUsd)} each = ${money(result.mrvFeeInr)}`,
            ],
            [
              "SEVIS I-901 fee",
              hasError
                ? DASH
                : result.sevisFeePerApplicantUsd > 0
                  ? `${dollars(result.sevisFeePerApplicantUsd)} each = ${money(result.sevisFeeInr)}`
                  : "Not payable for this class",
            ],
            ["Issuance (reciprocity) fee", show(result.reciprocityInr)],
            ["Visa Integrity Fee", show(result.integrityFeeInr)],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Per applicant", show(result.perApplicantInr)],
            ["US government share of the total", hasError ? DASH : `${NUM.format(result.usFeeSharePct)}%`],
            ["Non-refundable if refused", show(result.sunkIfRefusedInr)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            The MRV receipt stays usable for {result.mrvValidityMonths} months from the date of
            payment, within which the interview must be booked. After a refusal under section
            214(b), a paid SEVIS fee can be reused for the same programme for{" "}
            {result.sevisReuseMonths} months.
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
        Informational estimate only. Consular fees are set by the US Department of State and can
        change at any time — confirm the current amounts on travel.state.gov and the US Mission
        India site before paying, and treat every US fee as non-refundable.
      </p>
    </main>
  );
}
