"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ticket } from "lucide-react";

import {
  APPLICATION_ROUTES,
  EVISA_MAX_VALIDITY_DAYS,
  UNDER_14_AGE,
  VISA_BANDS,
  estimateVietnamVisaCost,
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
  bandId: "single-90",
  routeId: "e-visa",
  adults: "2",
  children: "0",
  approvalLetter: "20",
  exchangeRate: "85",
  photos: "250",
  insurance: "800",
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
  const [bandId, setBandId] = useState(DEFAULTS.bandId);
  const [routeId, setRouteId] = useState(DEFAULTS.routeId);
  const [adults, setAdults] = useState(DEFAULTS.adults);
  const [children, setChildren] = useState(DEFAULTS.children);
  const [approvalLetter, setApprovalLetter] = useState(DEFAULTS.approvalLetter);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [other, setOther] = useState(DEFAULTS.other);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateVietnamVisaCost({
        bandId,
        routeId,
        adults: toNumber(adults),
        childrenUnder14: toNumber(children),
        approvalLetterUsdPerApplicant: toNumber(approvalLetter),
        exchangeRate: toNumber(exchangeRate),
        photoFeeInrPerApplicant: toNumber(photos),
        insuranceInrPerApplicant: toNumber(insurance),
        courierFeeInr: toNumber(courier),
        otherFeeInr: toNumber(other),
        cardMarkupPct: toNumber(markup),
      }),
    [
      bandId,
      routeId,
      adults,
      children,
      approvalLetter,
      exchangeRate,
      photos,
      insurance,
      courier,
      other,
      markup,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Vietnam Visa Cost Estimator",
      `Band: ${result.bandLabel}`,
      `Route: ${result.routeLabel}`,
      `Applicants: ${result.applicants}`,
      `Visa fee: ${dollars(result.visaFeeUsd)}`,
      `Agency approval letter: ${dollars(result.approvalLetterUsd)}`,
      `Dollar charges in rupees: ${moneyExact(result.totalUsdInr)}`,
      `Charges paid in India: ${moneyExact(result.indianChargesInr)}`,
      `Total: ${moneyExact(result.totalInr)}`,
      `Per applicant: ${moneyExact(result.perApplicantInr)}`,
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
    setBandId(DEFAULTS.bandId);
    setRouteId(DEFAULTS.routeId);
    setAdults(DEFAULTS.adults);
    setChildren(DEFAULTS.children);
    setApprovalLetter(DEFAULTS.approvalLetter);
    setExchangeRate(DEFAULTS.exchangeRate);
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
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Vietnam immigration fees
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Vietnam Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Vietnam prices a visa by entries and validity, not by purpose, and charges applicants
          under {UNDER_14_AGE} a concessional flat fee. Pick the band and route to see the rupee
          cost.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Visa and route</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-band">
              Entries and validity
            </label>
            <select
              id="vn-band"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bandId}
              onChange={(event) => setBandId(event.target.value)}
            >
              {VISA_BANDS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — USD {entry.feeUsd}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-route">
              How you are applying
            </label>
            <select
              id="vn-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={routeId}
              onChange={(event) => setRouteId(event.target.value)}
            >
              {APPLICATION_ROUTES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              E-visas are issued for up to {EVISA_MAX_VALIDITY_DAYS} days; longer visas go through
              an embassy or a sponsoring agency.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-adults">
              Applicants aged {UNDER_14_AGE} and over
            </label>
            <input
              id="vn-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={adults}
              onChange={(event) => setAdults(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-children">
              Applicants under {UNDER_14_AGE}
            </label>
            <input
              id="vn-children"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={children}
              onChange={(event) => setChildren(event.target.value)}
            />
            <p className={HINT_CLASS}>Concessional flat fee whatever the validity band.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-letter">
              Agency approval letter, per applicant (USD)
            </label>
            <input
              id="vn-letter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={approvalLetter}
              onChange={(event) => setApprovalLetter(event.target.value)}
            />
            <p className={HINT_CLASS}>Only charged on the visa on arrival route.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-fx">
              Exchange rate (rupees per USD 1)
            </label>
            <input
              id="vn-fx"
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
            <label className={LABEL_CLASS} htmlFor="vn-photos">
              Photographs, per applicant (INR)
            </label>
            <input
              id="vn-photos"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={photos}
              onChange={(event) => setPhotos(event.target.value)}
            />
            <p className={HINT_CLASS}>4 x 6 cm, white background, no glasses.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-insurance">
              Travel insurance, per applicant (INR)
            </label>
            <input
              id="vn-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vn-courier">
              Courier and document handling (INR)
            </label>
            <input
              id="vn-courier"
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
            <label className={LABEL_CLASS} htmlFor="vn-other">
              Other charges (INR)
            </label>
            <input
              id="vn-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vn-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="vn-markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
            />
            <p className={HINT_CLASS}>
              The e-visa fee is charged in dollars online; the stamping fee at the airport is paid
              in cash.
            </p>
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
              Total visa cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.totalInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see a total."
                : `${dollars(result.totalUsd)} in dollar charges across ${result.applicants} applicant${
                    result.applicants === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Vietnam visa cost breakdown"
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
              `Visa fee, ${UNDER_14_AGE} and over`,
              hasError
                ? DASH
                : `${dollars(result.adultFeeUsd)} each = ${money(result.adultsFeeInr)}`,
            ],
            [
              `Visa fee, under ${UNDER_14_AGE}`,
              hasError
                ? DASH
                : `${dollars(result.childFeeUsd)} each = ${money(result.childrenFeeInr)}`,
            ],
            ["Agency approval letter", show(result.approvalLetterInr)],
            ["Dollar charges converted to rupees", show(result.totalUsdInr)],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Per applicant", show(result.perApplicantInr)],
            ["Government share of the total", hasError ? DASH : `${NUM.format(result.govSharePct)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.childSavingUsd > 0 && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            The under-{UNDER_14_AGE} concession saves {dollars(result.childSavingUsd)} against the
            adult rate for the same band.
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
        Informational estimate only. Vietnamese immigration fees and e-visa eligibility change by
        decree — confirm the current fee on the official e-visa portal at evisa.gov.vn before
        paying, and remember the fee is not refunded if the application is rejected.
      </p>
    </main>
  );
}
