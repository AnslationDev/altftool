"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Leaf, RotateCcw } from "lucide-react";

import {
  APPLICATION_TYPES,
  BIOMETRIC_MAX_AGE,
  BIOMETRIC_MIN_AGE,
  BIOMETRIC_VALIDITY_YEARS,
  estimateCanadaVisaCost,
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
const CAD = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_EXACT.format(Number.isFinite(value) ? value : 0);
const cad = (value) => CAD.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  applicationTypeId: "visitor",
  adults: "2",
  children: "1",
  seniors: "0",
  applyingTogether: true,
  biometricsAlreadyValid: false,
  includeOwp: false,
  exchangeRate: "62",
  serviceFee: "1900",
  medical: "0",
  photos: "300",
  courier: "800",
  other: "0",
  markup: "0",
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
  const [applicationTypeId, setApplicationTypeId] = useState(DEFAULTS.applicationTypeId);
  const [adults, setAdults] = useState(DEFAULTS.adults);
  const [children, setChildren] = useState(DEFAULTS.children);
  const [seniors, setSeniors] = useState(DEFAULTS.seniors);
  const [applyingTogether, setApplyingTogether] = useState(DEFAULTS.applyingTogether);
  const [biometricsAlreadyValid, setBiometricsAlreadyValid] = useState(
    DEFAULTS.biometricsAlreadyValid,
  );
  const [includeOwp, setIncludeOwp] = useState(DEFAULTS.includeOwp);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [serviceFee, setServiceFee] = useState(DEFAULTS.serviceFee);
  const [medical, setMedical] = useState(DEFAULTS.medical);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [other, setOther] = useState(DEFAULTS.other);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateCanadaVisaCost({
        applicationTypeId,
        adults14to79: toNumber(adults),
        childrenUnder14: toNumber(children),
        seniors80Plus: toNumber(seniors),
        applyingTogether,
        biometricsAlreadyValid,
        includeOpenWorkPermitHolderFee: includeOwp,
        exchangeRate: toNumber(exchangeRate),
        serviceFeeInrPerApplicant: toNumber(serviceFee),
        medicalExamInrPerApplicant: toNumber(medical),
        photoFeeInrPerApplicant: toNumber(photos),
        courierFeeInr: toNumber(courier),
        otherFeeInr: toNumber(other),
        cardMarkupPct: toNumber(markup),
      }),
    [
      applicationTypeId,
      adults,
      children,
      seniors,
      applyingTogether,
      biometricsAlreadyValid,
      includeOwp,
      exchangeRate,
      serviceFee,
      medical,
      photos,
      courier,
      other,
      markup,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Canada Visa Cost Estimator",
      `Application: ${result.applicationTypeLabel}`,
      `Applicants: ${result.applicants}`,
      `Application fee: ${cad(result.applicationFeeCad)}`,
      `Biometrics: ${cad(result.biometricFeeCad)} for ${result.biometricCandidates} people`,
      `IRCC fees total: ${cad(result.totalCad)} = ${moneyExact(result.totalCadInr)}`,
      `Charges paid in India: ${moneyExact(result.indianChargesInr)}`,
      `Total: ${moneyExact(result.totalInr)}`,
      `Per applicant: ${moneyExact(result.perApplicantInr)}`,
      `Saved by the family caps: ${moneyExact(result.capSavingInr)}`,
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
    setApplicationTypeId(DEFAULTS.applicationTypeId);
    setAdults(DEFAULTS.adults);
    setChildren(DEFAULTS.children);
    setSeniors(DEFAULTS.seniors);
    setApplyingTogether(DEFAULTS.applyingTogether);
    setBiometricsAlreadyValid(DEFAULTS.biometricsAlreadyValid);
    setIncludeOwp(DEFAULTS.includeOwp);
    setExchangeRate(DEFAULTS.exchangeRate);
    setServiceFee(DEFAULTS.serviceFee);
    setMedical(DEFAULTS.medical);
    setPhotos(DEFAULTS.photos);
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
          <Leaf className="h-4 w-4" aria-hidden="true" />
          IRCC temporary residence
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Canada Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Canada caps both the visitor visa fee and the biometrics fee for families who apply
          together, and only charges biometrics for ages {BIOMETRIC_MIN_AGE} to {BIOMETRIC_MAX_AGE}.
          This applies both rules and converts the result to rupees.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Application</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-type">
              Application type
            </label>
            <select
              id="ca-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={applicationTypeId}
              onChange={(event) => setApplicationTypeId(event.target.value)}
            >
              {APPLICATION_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-adults">
              Applicants aged {BIOMETRIC_MIN_AGE} to {BIOMETRIC_MAX_AGE}
            </label>
            <input
              id="ca-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={adults}
              onChange={(event) => setAdults(event.target.value)}
            />
            <p className={HINT_CLASS}>Only this group pays the biometrics fee.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-children">
              Children under {BIOMETRIC_MIN_AGE}
            </label>
            <input
              id="ca-children"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={children}
              onChange={(event) => setChildren(event.target.value)}
            />
            <p className={HINT_CLASS}>Pay the application fee, exempt from biometrics.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-seniors">
              Applicants aged {BIOMETRIC_MAX_AGE + 1} and over
            </label>
            <input
              id="ca-seniors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={seniors}
              onChange={(event) => setSeniors(event.target.value)}
            />
            <p className={HINT_CLASS}>Also exempt from biometrics for temporary residence.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-fx">
              Exchange rate (rupees per CAD 1)
            </label>
            <input
              id="ca-fx"
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

        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW}>
            <input
              id="ca-together"
              type="checkbox"
              className={CHECKBOX}
              checked={applyingTogether}
              onChange={(event) => setApplyingTogether(event.target.checked)}
            />
            <span>
              Everyone applies at the same time and place
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Required before either family maximum can be used.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW}>
            <input
              id="ca-bio-valid"
              type="checkbox"
              className={CHECKBOX}
              checked={biometricsAlreadyValid}
              onChange={(event) => setBiometricsAlreadyValid(event.target.checked)}
            />
            <span>
              Biometrics already given and still valid
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Enrolment stays valid for {BIOMETRIC_VALIDITY_YEARS} years for temporary residence.
              </span>
            </span>
          </label>
          <label className={CHECK_ROW}>
            <input
              id="ca-owp"
              type="checkbox"
              className={CHECKBOX}
              checked={includeOwp}
              onChange={(event) => setIncludeOwp(event.target.checked)}
            />
            <span>
              Add the open work permit holder fee
              <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                Applies only to open work permit applications.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Charges you pay in India</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-service">
              Visa centre service fee, per applicant (INR)
            </label>
            <input
              id="ca-service"
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
            <label className={LABEL_CLASS} htmlFor="ca-medical">
              Panel physician medical exam, per applicant (INR)
            </label>
            <input
              id="ca-medical"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={medical}
              onChange={(event) => setMedical(event.target.value)}
            />
            <p className={HINT_CLASS}>Needed for stays over six months and some occupations.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ca-photos">
              Photographs, per applicant (INR)
            </label>
            <input
              id="ca-photos"
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
            <label className={LABEL_CLASS} htmlFor="ca-courier">
              Passport return courier (INR)
            </label>
            <input
              id="ca-courier"
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
            <label className={LABEL_CLASS} htmlFor="ca-other">
              Other charges (INR)
            </label>
            <input
              id="ca-other"
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
            <label className={LABEL_CLASS} htmlFor="ca-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="ca-markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
            />
            <p className={HINT_CLASS}>IRCC fees are billed in Canadian dollars.</p>
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
        role="status"
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
                : result.cardMarkupInr + result.gstOnMarkupInr > 0
                  ? `${cad(result.totalCad)} to IRCC plus ${money(
                      result.cardMarkupInr + result.gstOnMarkupInr,
                    )} card markup and GST plus ${money(result.indianChargesInr)} paid in India`
                  : `${cad(result.totalCad)} to IRCC plus ${money(result.indianChargesInr)} paid in India`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Canada visa cost breakdown"
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
              "Application fee",
              hasError ? DASH : `${cad(result.applicationFeeCad)} for ${result.applicants}`,
            ],
            [
              "Biometrics fee",
              hasError
                ? DASH
                : `${cad(result.biometricFeeCad)} for ${result.biometricCandidates} eligible`,
            ],
            ["Open work permit holder fee", hasError ? DASH : cad(result.openWorkPermitFeeCad)],
            ["IRCC fees converted to rupees", show(result.totalCadInr)],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Charges paid in India", show(result.indianChargesInr)],
            ["Per applicant", show(result.perApplicantInr)],
            ["Saved by the family maximums", show(result.capSavingInr)],
            ["IRCC share of the total", hasError ? DASH : `${NUM.format(result.govSharePct)}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (result.familyCapApplies || result.biometricCapApplies) && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            A family maximum kicked in and cut {money(result.capSavingInr)} off the IRCC fees. It
            only applies because everyone is applying at the same time and place.
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
        Informational estimate only. IRCC fees are set in Canadian dollars and change from time to
        time — confirm the current schedule on canada.ca before you pay, and remember that
        government fees are not refunded if an application is refused.
      </p>
    </main>
  );
}
