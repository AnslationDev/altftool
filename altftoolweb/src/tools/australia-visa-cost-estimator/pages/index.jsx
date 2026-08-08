"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, RotateCcw } from "lucide-react";

import {
  ADULT_AGE,
  PAYMENT_METHODS,
  VISA_SUBCLASSES,
  defaultChargesFor,
  estimateAustraliaVisaCost,
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
const AUD = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_EXACT.format(Number.isFinite(value) ? value : 0);
const aud = (value) => AUD.format(Number.isFinite(value) ? value : 0);

const DASH = "—";
const START_SUBCLASS = "600-tourist";
const START_CHARGES = defaultChargesFor(START_SUBCLASS);

const DEFAULTS = {
  subclassId: START_SUBCLASS,
  base: String(START_CHARGES.baseAud),
  addAdultCharge: String(START_CHARGES.additionalAdultAud),
  addChildCharge: String(START_CHARGES.additionalChildAud),
  additionalAdults: "0",
  additionalChildren: "0",
  paymentMethodId: "visa-mastercard",
  paperLodgement: false,
  subsequent: false,
  exchangeRate: "56",
  serviceFee: "2200",
  healthExam: "0",
  healthCoverMonthly: "0",
  healthCoverMonths: "0",
  photos: "300",
  courier: "600",
  other: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const CHECK_ROW = "flex min-h-11 items-start gap-3 text-sm font-semibold";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]";
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
  const [subclassId, setSubclassId] = useState(DEFAULTS.subclassId);
  const [base, setBase] = useState(DEFAULTS.base);
  const [addAdultCharge, setAddAdultCharge] = useState(DEFAULTS.addAdultCharge);
  const [addChildCharge, setAddChildCharge] = useState(DEFAULTS.addChildCharge);
  const [additionalAdults, setAdditionalAdults] = useState(DEFAULTS.additionalAdults);
  const [additionalChildren, setAdditionalChildren] = useState(DEFAULTS.additionalChildren);
  const [paymentMethodId, setPaymentMethodId] = useState(DEFAULTS.paymentMethodId);
  const [paperLodgement, setPaperLodgement] = useState(DEFAULTS.paperLodgement);
  const [subsequent, setSubsequent] = useState(DEFAULTS.subsequent);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [serviceFee, setServiceFee] = useState(DEFAULTS.serviceFee);
  const [healthExam, setHealthExam] = useState(DEFAULTS.healthExam);
  const [healthCoverMonthly, setHealthCoverMonthly] = useState(DEFAULTS.healthCoverMonthly);
  const [healthCoverMonths, setHealthCoverMonths] = useState(DEFAULTS.healthCoverMonths);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [other, setOther] = useState(DEFAULTS.other);
  const [copied, setCopied] = useState(false);

  const surchargePct =
    PAYMENT_METHODS.find((entry) => entry.id === paymentMethodId)?.surchargePct ?? 0;

  const changeSubclass = (nextId) => {
    setSubclassId(nextId);
    const charges = defaultChargesFor(nextId);
    if (charges) {
      setBase(String(charges.baseAud));
      setAddAdultCharge(String(charges.additionalAdultAud));
      setAddChildCharge(String(charges.additionalChildAud));
    }
  };

  const result = useMemo(
    () =>
      estimateAustraliaVisaCost({
        subclassId,
        baseChargeAud: toNumber(base),
        additionalAdultChargeAud: toNumber(addAdultCharge),
        additionalChildChargeAud: toNumber(addChildCharge),
        additionalAdults: toNumber(additionalAdults),
        additionalChildren: toNumber(additionalChildren),
        surchargePct,
        paperLodgement,
        subsequentTemporaryApplication: subsequent,
        exchangeRate: toNumber(exchangeRate),
        serviceFeeInrPerApplicant: toNumber(serviceFee),
        healthExamInrPerApplicant: toNumber(healthExam),
        healthCoverInrPerMonth: toNumber(healthCoverMonthly),
        healthCoverMonths: toNumber(healthCoverMonths),
        photoFeeInrPerApplicant: toNumber(photos),
        courierFeeInr: toNumber(courier),
        otherFeeInr: toNumber(other),
      }),
    [
      subclassId,
      base,
      addAdultCharge,
      addChildCharge,
      additionalAdults,
      additionalChildren,
      surchargePct,
      paperLodgement,
      subsequent,
      exchangeRate,
      serviceFee,
      healthExam,
      healthCoverMonthly,
      healthCoverMonths,
      photos,
      courier,
      other,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Australia Visa Cost Estimator",
      `Subclass: ${result.subclassLabel}`,
      `Applicants: ${result.applicants}`,
      `Visa Application Charge: ${aud(result.visaApplicationChargeAud)}`,
      `Card surcharge: ${aud(result.surchargeAud)}`,
      `Payable to Home Affairs: ${aud(result.totalAud)} = ${moneyExact(result.totalAudInr)}`,
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
    setSubclassId(DEFAULTS.subclassId);
    setBase(DEFAULTS.base);
    setAddAdultCharge(DEFAULTS.addAdultCharge);
    setAddChildCharge(DEFAULTS.addChildCharge);
    setAdditionalAdults(DEFAULTS.additionalAdults);
    setAdditionalChildren(DEFAULTS.additionalChildren);
    setPaymentMethodId(DEFAULTS.paymentMethodId);
    setPaperLodgement(DEFAULTS.paperLodgement);
    setSubsequent(DEFAULTS.subsequent);
    setExchangeRate(DEFAULTS.exchangeRate);
    setServiceFee(DEFAULTS.serviceFee);
    setHealthExam(DEFAULTS.healthExam);
    setHealthCoverMonthly(DEFAULTS.healthCoverMonthly);
    setHealthCoverMonths(DEFAULTS.healthCoverMonths);
    setPhotos(DEFAULTS.photos);
    setCourier(DEFAULTS.courier);
    setOther(DEFAULTS.other);
    setCopied(false);
  };

  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          Home Affairs visa charges
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Australia Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An Australian Visa Application Charge is a base charge plus a separate charge for every
          extra family member, with a card surcharge on top. Edit the dollar amounts — they are
          indexed on 1 July every year.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Visa and charges</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="au-subclass">
              Visa subclass
            </label>
            <select
              id="au-subclass"
              className={`mt-2 ${INPUT_CLASS}`}
              value={subclassId}
              onChange={(event) => changeSubclass(event.target.value)}
            >
              {VISA_SUBCLASSES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Selecting a subclass fills in the published charges — check them against
              immi.homeaffairs.gov.au before you rely on the total.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="au-base">
              Base Application Charge (AUD)
            </label>
            <input
              id="au-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={base}
              onChange={(event) => setBase(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="au-fx">
              Exchange rate (rupees per AUD 1)
            </label>
            <input
              id="au-fx"
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
            <label className={LABEL_CLASS} htmlFor="au-add-adult-charge">
              Additional applicant charge, {ADULT_AGE} and over (AUD)
            </label>
            <input
              id="au-add-adult-charge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={addAdultCharge}
              onChange={(event) => setAddAdultCharge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="au-add-adults">
              How many additional applicants {ADULT_AGE} and over
            </label>
            <input
              id="au-add-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={additionalAdults}
              onChange={(event) => setAdditionalAdults(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="au-add-child-charge">
              Additional applicant charge, under {ADULT_AGE} (AUD)
            </label>
            <input
              id="au-add-child-charge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={addChildCharge}
              onChange={(event) => setAddChildCharge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="au-add-children">
              How many additional applicants under {ADULT_AGE}
            </label>
            <input
              id="au-add-children"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={additionalChildren}
              onChange={(event) => setAdditionalChildren(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="au-payment">
              Payment method
            </label>
            <select
              id="au-payment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paymentMethodId}
              onChange={(event) => setPaymentMethodId(event.target.value)}
            >
              {PAYMENT_METHODS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — {entry.surchargePct}% surcharge
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              The surcharge is charged on the visa application charge only, at the moment of
              payment.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW}>
            <input
              id="au-subsequent"
              type="checkbox"
              className={CHECKBOX}
              checked={subsequent}
              onChange={(event) => setSubsequent(event.target.checked)}
            />
            <span>
              Applying from inside Australia for a subsequent temporary visa
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Adds the Subsequent Temporary Application Charge for every applicant.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW}>
            <input
              id="au-paper"
              type="checkbox"
              className={CHECKBOX}
              checked={paperLodgement}
              onChange={(event) => setPaperLodgement(event.target.checked)}
            />
            <span>
              Lodging on paper rather than online
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Adds the Non-Internet Application Charge.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Charges you pay in India</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="au-service">
              Biometrics and lodgement fee, per applicant (INR)
            </label>
            <input
              id="au-service"
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
            <label className={LABEL_CLASS} htmlFor="au-health-exam">
              Health examination, per applicant (INR)
            </label>
            <input
              id="au-health-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={healthExam}
              onChange={(event) => setHealthExam(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="au-cover-monthly">
              Health cover premium per month, per applicant (INR)
            </label>
            <input
              id="au-cover-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={healthCoverMonthly}
              onChange={(event) => setHealthCoverMonthly(event.target.value)}
            />
            <p className={HINT_CLASS}>
              {result.healthCoverRelevant
                ? "Student visas require cover for the whole visa period."
                : "Optional for this subclass."}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="au-cover-months">
              Months of health cover
            </label>
            <input
              id="au-cover-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={healthCoverMonths}
              onChange={(event) => setHealthCoverMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="au-photos">
              Photographs, per applicant (INR)
            </label>
            <input
              id="au-photos"
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
            <label className={LABEL_CLASS} htmlFor="au-courier">
              Courier and document handling (INR)
            </label>
            <input
              id="au-courier"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={courier}
              onChange={(event) => setCourier(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="au-other">
              Other charges (INR)
            </label>
            <input
              id="au-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
            <p className={HINT_CLASS}>Skills assessment, English test, translations, police checks.</p>
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
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
                : `${aud(result.totalAud)} to Home Affairs across ${result.applicants} applicant${
                    result.applicants === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Australia visa cost breakdown"
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
            ["Base Application Charge", hasError ? DASH : aud(result.baseAud)],
            ["Additional applicants, adults", hasError ? DASH : aud(result.additionalAdultsAud)],
            ["Additional applicants, children", hasError ? DASH : aud(result.additionalChildrenAud)],
            ["Subsequent Temporary Application Charge", hasError ? DASH : aud(result.subsequentAud)],
            ["Non-Internet Application Charge", hasError ? DASH : aud(result.paperAud)],
            ["Visa Application Charge", hasError ? DASH : aud(result.visaApplicationChargeAud)],
            ["Card surcharge", hasError ? DASH : aud(result.surchargeAud)],
            ["Payable to Home Affairs in rupees", show(result.totalAudInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Per applicant", show(result.perApplicantInr)],
            ["Home Affairs share of the total", hasError ? DASH : `${NUM.format(result.govSharePct)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
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
        Informational estimate only. Visa application charges are indexed on 1 July each year and
        can be amended at any time — check the current amount with the Home Affairs pricing
        estimator before you lodge, and treat the charge as non-refundable once paid.
      </p>
    </main>
  );
}
