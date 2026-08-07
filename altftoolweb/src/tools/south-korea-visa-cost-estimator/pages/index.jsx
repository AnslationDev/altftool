"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stamp } from "lucide-react";

import {
  LONG_STAY_THRESHOLD_DAYS,
  VISA_TYPES,
  estimateSouthKoreaVisaCost,
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
  visaTypeId: "single-90",
  applicants: "2",
  plannedTrips: "1",
  exchangeRate: "85",
  serviceFee: "1200",
  photos: "250",
  documents: "0",
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
  const [visaTypeId, setVisaTypeId] = useState(DEFAULTS.visaTypeId);
  const [applicants, setApplicants] = useState(DEFAULTS.applicants);
  const [plannedTrips, setPlannedTrips] = useState(DEFAULTS.plannedTrips);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [serviceFee, setServiceFee] = useState(DEFAULTS.serviceFee);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [documents, setDocuments] = useState(DEFAULTS.documents);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [other, setOther] = useState(DEFAULTS.other);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateSouthKoreaVisaCost({
        visaTypeId,
        applicants: toNumber(applicants),
        plannedTrips: toNumber(plannedTrips),
        exchangeRate: toNumber(exchangeRate),
        serviceFeeInrPerApplicant: toNumber(serviceFee),
        photoFeeInrPerApplicant: toNumber(photos),
        documentFeeInrPerApplicant: toNumber(documents),
        courierFeeInr: toNumber(courier),
        otherFeeInr: toNumber(other),
        cardMarkupPct: toNumber(markup),
      }),
    [
      visaTypeId,
      applicants,
      plannedTrips,
      exchangeRate,
      serviceFee,
      photos,
      documents,
      courier,
      other,
      markup,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "South Korea Visa Cost Estimator",
      `Visa: ${result.visaTypeLabel}`,
      `Applicants: ${result.applicants}`,
      `Consular fee: ${dollars(result.consularFeeUsd)} = ${moneyExact(result.consularFeeInr)}`,
      `Charges paid in India: ${moneyExact(result.indianChargesInr)}`,
      `Total: ${moneyExact(result.totalInr)}`,
      `Per applicant: ${moneyExact(result.perApplicantInr)}`,
      `Cost per usable entry: ${moneyExact(result.costPerEntryInr)}`,
      `Repeat single-entry alternative for ${result.plannedTrips} trips: ${moneyExact(result.repeatSingleEntryInr)}`,
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
    setVisaTypeId(DEFAULTS.visaTypeId);
    setApplicants(DEFAULTS.applicants);
    setPlannedTrips(DEFAULTS.plannedTrips);
    setExchangeRate(DEFAULTS.exchangeRate);
    setServiceFee(DEFAULTS.serviceFee);
    setPhotos(DEFAULTS.photos);
    setDocuments(DEFAULTS.documents);
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
          <Stamp className="h-4 w-4" aria-hidden="true" />
          Korean consular fees
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          South Korea Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Korea prices a visa by entries and by whether the stay runs past{" "}
          {LONG_STAY_THRESHOLD_DAYS} days. Enter how many trips you expect and see whether a
          multiple entry beats applying again each time.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Visa</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-type">
              Visa type
            </label>
            <select
              id="kr-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={visaTypeId}
              onChange={(event) => setVisaTypeId(event.target.value)}
            >
              {VISA_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — USD {entry.feeUsd}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-applicants">
              Applicants
            </label>
            <input
              id="kr-applicants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={applicants}
              onChange={(event) => setApplicants(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-trips">
              Trips you expect to make
            </label>
            <input
              id="kr-trips"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={plannedTrips}
              onChange={(event) => setPlannedTrips(event.target.value)}
            />
            <p className={HINT_CLASS}>Used to compare against re-applying before each trip.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kr-fx">
              Exchange rate (rupees per USD 1)
            </label>
            <input
              id="kr-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
            />
            <p className={HINT_CLASS}>Missions collect the dollar fee in local currency.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Charges you pay in India</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-service">
              Visa centre service fee, per applicant (INR)
            </label>
            <input
              id="kr-service"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={serviceFee}
              onChange={(event) => setServiceFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-photos">
              Photographs, per applicant (INR)
            </label>
            <input
              id="kr-photos"
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
            <label className={LABEL_CLASS} htmlFor="kr-documents">
              Supporting documents, per applicant (INR)
            </label>
            <input
              id="kr-documents"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={documents}
              onChange={(event) => setDocuments(event.target.value)}
            />
            <p className={HINT_CLASS}>Bank statements, tax returns, notarisation, translations.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-courier">
              Passport return courier (INR)
            </label>
            <input
              id="kr-courier"
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
            <label className={LABEL_CLASS} htmlFor="kr-other">
              Other charges (INR)
            </label>
            <input
              id="kr-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="kr-markup"
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

      <section aria-live="polite" className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
                : `${show(result.costPerEntryInr)} per usable entry across ${result.usableEntries} entr${
                    result.usableEntries === 1 ? "y" : "ies"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the South Korea visa cost breakdown"
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
              "Consular visa fee",
              hasError
                ? DASH
                : `${dollars(result.feePerApplicantUsd)} each = ${money(result.consularFeeInr)}`,
            ],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Per applicant", show(result.perApplicantInr)],
            ["Cost per usable entry", show(result.costPerEntryInr)],
            [
              "One fresh single-entry application",
              show(result.oneSingleApplicationInr),
            ],
            [
              `Re-applying before each of ${hasError ? "your" : result.plannedTrips} trips`,
              show(result.repeatSingleEntryInr),
            ],
            ["Consular share of the total", hasError ? DASH : `${NUM.format(result.consularSharePct)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.multipleEntryWorthIt && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            Over {result.plannedTrips} trips this choice saves {money(result.savingVsRepeatInr)}{" "}
            against applying afresh for a short single-entry visa each time
            {result.applicationsNeededForAllTrips > 1
              ? ` — this visa needs to be bought ${result.applicationsNeededForAllTrips} times to cover all ${result.plannedTrips} trips, totaling ${money(result.trueTotalCostInr)}`
              : ""}
            .
          </p>
        )}

        {!hasError && !result.multipleEntryWorthIt && result.plannedTrips > 1 && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            For {result.plannedTrips} trips this visa costs{" "}
            {money(result.extraCostVsRepeatInr)} more than re-applying each time
            {result.applicationsNeededForAllTrips > 1
              ? ` — you would need to buy it ${result.applicationsNeededForAllTrips} times (${money(result.trueTotalCostInr)} total) to cover all trips`
              : ""}
            . A multiple-entry visa only pays off once the trips outnumber the fee difference.
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
        Informational estimate only. Korean consular fees, the mission&apos;s exchange rate and
        application centre charges can change — confirm the current amounts with the Korean embassy
        or consulate, and note that the fee is not refunded if a visa is refused.
      </p>
    </main>
  );
}
