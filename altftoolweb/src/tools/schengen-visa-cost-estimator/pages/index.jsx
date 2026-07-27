"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stamp } from "lucide-react";

import {
  FEE_BASIS,
  MIN_MEDICAL_COVER_EUR,
  estimateSchengenVisaCost,
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
const EUR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_EXACT.format(Number.isFinite(value) ? value : 0);
const euro = (value) => EUR.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  feeBasisId: "standard",
  adults: "2",
  children6to11: "0",
  childrenUnder6: "0",
  exchangeRate: "95",
  serviceFee: "1900",
  courier: "800",
  photos: "300",
  insurance: "1200",
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
  const [feeBasisId, setFeeBasisId] = useState(DEFAULTS.feeBasisId);
  const [adults, setAdults] = useState(DEFAULTS.adults);
  const [children6to11, setChildren6to11] = useState(DEFAULTS.children6to11);
  const [childrenUnder6, setChildrenUnder6] = useState(DEFAULTS.childrenUnder6);
  const [exchangeRate, setExchangeRate] = useState(DEFAULTS.exchangeRate);
  const [serviceFee, setServiceFee] = useState(DEFAULTS.serviceFee);
  const [courier, setCourier] = useState(DEFAULTS.courier);
  const [photos, setPhotos] = useState(DEFAULTS.photos);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [other, setOther] = useState(DEFAULTS.other);
  const [markup, setMarkup] = useState(DEFAULTS.markup);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateSchengenVisaCost({
        feeBasisId,
        adults: toNumber(adults),
        children6to11: toNumber(children6to11),
        childrenUnder6: toNumber(childrenUnder6),
        exchangeRate: toNumber(exchangeRate),
        serviceFeeInrPerApplicant: toNumber(serviceFee),
        courierFeeInr: toNumber(courier),
        photoFeeInrPerApplicant: toNumber(photos),
        insuranceInrPerApplicant: toNumber(insurance),
        otherFeeInr: toNumber(other),
        cardMarkupPct: toNumber(markup),
      }),
    [
      feeBasisId,
      adults,
      children6to11,
      childrenUnder6,
      exchangeRate,
      serviceFee,
      courier,
      photos,
      insurance,
      other,
      markup,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Schengen Visa Cost Estimator",
      `Applicants: ${result.applicants}`,
      `Visa fee: ${euro(result.govFeeEur)} = ${moneyExact(result.govFeeInr)}`,
      `Visa centre service fee: ${moneyExact(result.serviceFeeInr)}`,
      `Courier: ${moneyExact(result.courierInr)}`,
      `Photographs: ${moneyExact(result.photosInr)}`,
      `Travel medical insurance: ${moneyExact(result.insuranceInr)}`,
      `Card markup + GST: ${moneyExact(result.cardMarkupInr + result.gstOnMarkupInr)}`,
      `Other charges: ${moneyExact(result.otherInr)}`,
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
    setFeeBasisId(DEFAULTS.feeBasisId);
    setAdults(DEFAULTS.adults);
    setChildren6to11(DEFAULTS.children6to11);
    setChildrenUnder6(DEFAULTS.childrenUnder6);
    setExchangeRate(DEFAULTS.exchangeRate);
    setServiceFee(DEFAULTS.serviceFee);
    setCourier(DEFAULTS.courier);
    setPhotos(DEFAULTS.photos);
    setInsurance(DEFAULTS.insurance);
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
          Schengen Type C
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Schengen Visa Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The visa fee is set by the EU Visa Code; everything else — the visa centre service fee,
          courier, photos, insurance — is added on top. Edit every line and see one total in rupees.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Applicants</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-basis">
              Fee category
            </label>
            <select
              id="sch-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={feeBasisId}
              onChange={(event) => setFeeBasisId(event.target.value)}
            >
              {FEE_BASIS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-adults">
              Applicants aged 12 and over
            </label>
            <input
              id="sch-adults"
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
            <label className={LABEL_CLASS} htmlFor="sch-child">
              Children aged 6 to 11
            </label>
            <input
              id="sch-child"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={children6to11}
              onChange={(event) => setChildren6to11(event.target.value)}
            />
            <p className={HINT_CLASS}>Reduced visa fee band.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-infant">
              Children under 6
            </label>
            <input
              id="sch-infant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={childrenUnder6}
              onChange={(event) => setChildrenUnder6(event.target.value)}
            />
            <p className={HINT_CLASS}>Exempt from the visa fee.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-fx">
              Exchange rate (rupees per EUR 1)
            </label>
            <input
              id="sch-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
            />
            <p className={HINT_CLASS}>Missions publish their own consular rate each month.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Charges you pay in India</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-service">
              Visa centre service fee, per applicant (INR)
            </label>
            <input
              id="sch-service"
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
            <label className={LABEL_CLASS} htmlFor="sch-courier">
              Passport return courier (INR, whole family)
            </label>
            <input
              id="sch-courier"
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
            <label className={LABEL_CLASS} htmlFor="sch-photos">
              Photographs, per applicant (INR)
            </label>
            <input
              id="sch-photos"
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
            <label className={LABEL_CLASS} htmlFor="sch-insurance">
              Travel medical insurance, per applicant (INR)
            </label>
            <input
              id="sch-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Must cover at least {euro(MIN_MEDICAL_COVER_EUR)} of emergency care.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-other">
              Other charges (INR)
            </label>
            <input
              id="sch-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
            <p className={HINT_CLASS}>SMS alerts, premium lounge, form filling, attestation.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-markup">
              Card cross-currency markup (%)
            </label>
            <input
              id="sch-markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
            />
            <p className={HINT_CLASS}>Leave at 0 if you pay the visa fee in rupees at the centre.</p>
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
                : `${show(result.perApplicantInr)} per applicant across ${result.applicants} applicant${
                    result.applicants === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Schengen visa cost breakdown"
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
              "Visa fee set by the EU Visa Code",
              hasError ? DASH : `${euro(result.govFeeEur)} = ${money(result.govFeeInr)}`,
            ],
            ["Visa centre service fee", show(result.serviceFeeInr)],
            ["Biometric enrolment", hasError ? DASH : "Included in the visa fee"],
            ["Passport return courier", show(result.courierInr)],
            ["Photographs", show(result.photosInr)],
            ["Travel medical insurance", show(result.insuranceInr)],
            ["Card markup and GST on it", show(result.cardMarkupInr + result.gstOnMarkupInr)],
            ["Other charges", show(result.otherInr)],
            ["Government share of the total", hasError ? DASH : `${NUM.format(result.govSharePct)}%`],
            ["Non-refundable if the visa is refused", show(result.sunkIfRefusedInr)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.serviceFeeExceedsCap && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            The service fee you entered is above the Visa Code cap of{" "}
            {euro(result.serviceCapEurPerApplicant)} ({money(result.serviceCapInrPerApplicant)}) per
            applicant — half the visa fee. Check whether optional extras have been bundled in.
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
        Informational estimate only. Consular fees, the mission&apos;s exchange rate and visa centre
        charges change without notice — confirm the current amounts on the embassy or consulate
        website for the country that is your main destination before you pay.
      </p>
    </main>
  );
}
