"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";
import {
  CASH_DEDUCTION_LIMIT,
  DEDUCTION_CATEGORIES,
  PAYMENT_MODES,
  PURPOSES,
  QUALIFYING_LIMIT_PERCENT,
  buildDonationReceipt,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  organisationName: "Asha Foundation",
  organisationAddress: "12 Gandhi Marg, New Delhi 110001",
  organisationPan: "AAATA1234C",
  registration12A: "AAATA1234CE20214",
  approval80G: "AAATA1234CF20231",
  approval80GValidity: "AY 2027-28",
  uniqueRegistrationNumber: "AAATA1234CF2023101",
  fcraNumber: "",
  contactEmail: "donations@example.org",
  contactPhone: "011-4xxxxxx0",
  receiptNumber: "AF/2025-26/0417",
  receiptDate: "2026-01-20",
  donorName: "Ravi Iyer",
  donorAddress: "44 MG Road, Bengaluru 560001",
  donorPan: "ABCDE1234F",
  donorEmail: "ravi.iyer@example.com",
  amount: "50000",
  modeKey: "upi",
  transactionReference: "UPI/604512339",
  purpose: PURPOSES[0],
  categoryKey: "50_with_limit",
  adjustedGrossTotalIncome: "800000",
  regime: "old",
  isForeignContribution: false,
  authorisedSignatory: "S. Krishnan",
  signatoryDesignation: "Treasurer",
};

export default function ToolHome() {
  const [organisationName, setOrganisationName] = useState(DEFAULTS.organisationName);
  const [organisationAddress, setOrganisationAddress] = useState(DEFAULTS.organisationAddress);
  const [organisationPan, setOrganisationPan] = useState(DEFAULTS.organisationPan);
  const [registration12A, setRegistration12A] = useState(DEFAULTS.registration12A);
  const [approval80G, setApproval80G] = useState(DEFAULTS.approval80G);
  const [approval80GValidity, setApproval80GValidity] = useState(DEFAULTS.approval80GValidity);
  const [uniqueRegistrationNumber, setUniqueRegistrationNumber] = useState(
    DEFAULTS.uniqueRegistrationNumber,
  );
  const [fcraNumber, setFcraNumber] = useState(DEFAULTS.fcraNumber);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [contactPhone, setContactPhone] = useState(DEFAULTS.contactPhone);
  const [receiptNumber, setReceiptNumber] = useState(DEFAULTS.receiptNumber);
  const [receiptDate, setReceiptDate] = useState(DEFAULTS.receiptDate);
  const [donorName, setDonorName] = useState(DEFAULTS.donorName);
  const [donorAddress, setDonorAddress] = useState(DEFAULTS.donorAddress);
  const [donorPan, setDonorPan] = useState(DEFAULTS.donorPan);
  const [donorEmail, setDonorEmail] = useState(DEFAULTS.donorEmail);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [modeKey, setModeKey] = useState(DEFAULTS.modeKey);
  const [transactionReference, setTransactionReference] = useState(DEFAULTS.transactionReference);
  const [purpose, setPurpose] = useState(DEFAULTS.purpose);
  const [categoryKey, setCategoryKey] = useState(DEFAULTS.categoryKey);
  const [adjustedGrossTotalIncome, setAdjustedGrossTotalIncome] = useState(
    DEFAULTS.adjustedGrossTotalIncome,
  );
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [isForeignContribution, setIsForeignContribution] = useState(
    DEFAULTS.isForeignContribution,
  );
  const [authorisedSignatory, setAuthorisedSignatory] = useState(DEFAULTS.authorisedSignatory);
  const [signatoryDesignation, setSignatoryDesignation] = useState(DEFAULTS.signatoryDesignation);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildDonationReceipt({
        organisationName,
        organisationAddress,
        organisationPan,
        registration12A,
        approval80G,
        approval80GValidity,
        uniqueRegistrationNumber,
        fcraNumber,
        contactEmail,
        contactPhone,
        receiptNumber,
        receiptDate,
        donorName,
        donorAddress,
        donorPan,
        donorEmail,
        amount,
        modeKey,
        transactionReference,
        purpose,
        categoryKey,
        adjustedGrossTotalIncome,
        regime,
        isForeignContribution,
        authorisedSignatory,
        signatoryDesignation,
      }),
    [
      organisationName,
      organisationAddress,
      organisationPan,
      registration12A,
      approval80G,
      approval80GValidity,
      uniqueRegistrationNumber,
      fcraNumber,
      contactEmail,
      contactPhone,
      receiptNumber,
      receiptDate,
      donorName,
      donorAddress,
      donorPan,
      donorEmail,
      amount,
      modeKey,
      transactionReference,
      purpose,
      categoryKey,
      adjustedGrossTotalIncome,
      regime,
      isForeignContribution,
      authorisedSignatory,
      signatoryDesignation,
    ],
  );

  const failed = Boolean(result.error);
  const deduction = failed ? null : result.deduction;
  const category = DEDUCTION_CATEGORIES.find((item) => item.key === categoryKey);

  const copyReceipt = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.receipt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOrganisationName(DEFAULTS.organisationName);
    setOrganisationAddress(DEFAULTS.organisationAddress);
    setOrganisationPan(DEFAULTS.organisationPan);
    setRegistration12A(DEFAULTS.registration12A);
    setApproval80G(DEFAULTS.approval80G);
    setApproval80GValidity(DEFAULTS.approval80GValidity);
    setUniqueRegistrationNumber(DEFAULTS.uniqueRegistrationNumber);
    setFcraNumber(DEFAULTS.fcraNumber);
    setContactEmail(DEFAULTS.contactEmail);
    setContactPhone(DEFAULTS.contactPhone);
    setReceiptNumber(DEFAULTS.receiptNumber);
    setReceiptDate(DEFAULTS.receiptDate);
    setDonorName(DEFAULTS.donorName);
    setDonorAddress(DEFAULTS.donorAddress);
    setDonorPan(DEFAULTS.donorPan);
    setDonorEmail(DEFAULTS.donorEmail);
    setAmount(DEFAULTS.amount);
    setModeKey(DEFAULTS.modeKey);
    setTransactionReference(DEFAULTS.transactionReference);
    setPurpose(DEFAULTS.purpose);
    setCategoryKey(DEFAULTS.categoryKey);
    setAdjustedGrossTotalIncome(DEFAULTS.adjustedGrossTotalIncome);
    setRegime(DEFAULTS.regime);
    setIsForeignContribution(DEFAULTS.isForeignContribution);
    setAuthorisedSignatory(DEFAULTS.authorisedSignatory);
    setSignatoryDesignation(DEFAULTS.signatoryDesignation);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Nonprofit compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Donation Receipt Format Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a receipt that carries everything a donor needs for section 80G — registration
          numbers, amount in words, mode of payment and the deduction actually available after the{" "}
          {QUALIFYING_LIMIT_PERCENT}% qualifying limit and the {money(CASH_DEDUCTION_LIMIT)} cash
          rule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Donation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-amount">
              Amount received (INR)
            </label>
            <input
              id="dr-amount"
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-mode">
              Mode of payment
            </label>
            <select
              id="dr-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={modeKey}
              onChange={(event) => setModeKey(event.target.value)}
            >
              {PAYMENT_MODES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-ref">
              Transaction reference
            </label>
            <input
              id="dr-ref"
              className={`mt-2 ${INPUT_CLASS}`}
              value={transactionReference}
              onChange={(event) => setTransactionReference(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-purpose">
              Purpose
            </label>
            <select
              id="dr-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            >
              {PURPOSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dr-category">
              80G category the institution falls in
            </label>
            <select
              id="dr-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryKey}
              onChange={(event) => setCategoryKey(event.target.value)}
            >
              {DEDUCTION_CATEGORIES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            {category && (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {category.examples}
              </p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-agti">
              Donor&apos;s adjusted gross total income (INR)
            </label>
            <input
              id="dr-agti"
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              className={`mt-2 ${INPUT_CLASS}`}
              value={adjustedGrossTotalIncome}
              onChange={(event) => setAdjustedGrossTotalIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-regime">
              Donor&apos;s tax regime
            </label>
            <select
              id="dr-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              <option value="old">Old regime (80G available)</option>
              <option value="new">New regime under section 115BAC</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <input
            id="dr-fcra"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={isForeignContribution}
            onChange={(event) => setIsForeignContribution(event.target.checked)}
          />
          <label className="text-sm leading-6 text-[var(--muted-foreground)]" htmlFor="dr-fcra">
            This is a foreign contribution received in the designated FCRA account
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Donor</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-donor">
              Donor name
            </label>
            <input
              id="dr-donor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={donorName}
              onChange={(event) => setDonorName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-donorpan">
              Donor PAN
            </label>
            <input
              id="dr-donorpan"
              className={`mt-2 ${INPUT_CLASS}`}
              maxLength={10}
              value={donorPan}
              onChange={(event) => setDonorPan(event.target.value.toUpperCase())}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dr-donoraddr">
              Donor address
            </label>
            <input
              id="dr-donoraddr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={donorAddress}
              onChange={(event) => setDonorAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-donoremail">
              Donor email
            </label>
            <input
              id="dr-donoremail"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={donorEmail}
              onChange={(event) => setDonorEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-receiptno">
              Receipt number
            </label>
            <input
              id="dr-receiptno"
              className={`mt-2 ${INPUT_CLASS}`}
              value={receiptNumber}
              onChange={(event) => setReceiptNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-receiptdate">
              Receipt date
            </label>
            <input
              id="dr-receiptdate"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={receiptDate}
              onChange={(event) => setReceiptDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Institution</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-org">
              Organisation name
            </label>
            <input
              id="dr-org"
              className={`mt-2 ${INPUT_CLASS}`}
              value={organisationName}
              onChange={(event) => setOrganisationName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-orgpan">
              Organisation PAN
            </label>
            <input
              id="dr-orgpan"
              className={`mt-2 ${INPUT_CLASS}`}
              maxLength={10}
              value={organisationPan}
              onChange={(event) => setOrganisationPan(event.target.value.toUpperCase())}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dr-orgaddr">
              Registered address
            </label>
            <input
              id="dr-orgaddr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={organisationAddress}
              onChange={(event) => setOrganisationAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-12a">
              12A / 12AB registration number
            </label>
            <input
              id="dr-12a"
              className={`mt-2 ${INPUT_CLASS}`}
              value={registration12A}
              onChange={(event) => setRegistration12A(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-80g">
              80G approval number
            </label>
            <input
              id="dr-80g"
              className={`mt-2 ${INPUT_CLASS}`}
              value={approval80G}
              onChange={(event) => setApproval80G(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-80gval">
              80G approval valid up to
            </label>
            <input
              id="dr-80gval"
              className={`mt-2 ${INPUT_CLASS}`}
              value={approval80GValidity}
              onChange={(event) => setApproval80GValidity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-urn">
              Unique Registration Number (URN)
            </label>
            <input
              id="dr-urn"
              className={`mt-2 ${INPUT_CLASS}`}
              value={uniqueRegistrationNumber}
              onChange={(event) => setUniqueRegistrationNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-fcrano">
              FCRA registration number
            </label>
            <input
              id="dr-fcrano"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fcraNumber}
              onChange={(event) => setFcraNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-phone">
              Contact phone
            </label>
            <input
              id="dr-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-email">
              Contact email
            </label>
            <input
              id="dr-email"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-signatory">
              Authorised signatory
            </label>
            <input
              id="dr-signatory"
              className={`mt-2 ${INPUT_CLASS}`}
              value={authorisedSignatory}
              onChange={(event) => setAuthorisedSignatory(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-designation">
              Designation
            </label>
            <input
              id="dr-designation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={signatoryDesignation}
              onChange={(event) => setSignatoryDesignation(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
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
              Deduction available to the donor
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {deduction ? money(deduction.deduction) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above"
                : `on a donation of ${money(deduction.amount)} · FY ${result.financialYear}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReceipt}
              disabled={failed}
              aria-label="Copy the donation receipt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy receipt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Amount received", deduction ? money(deduction.amount) : "—"],
            ["Amount in words", failed ? "—" : result.amountWords],
            [
              `Qualifying limit (${QUALIFYING_LIMIT_PERCENT}% of adjusted GTI)`,
              deduction && deduction.qualifyingLimit !== null
                ? money(deduction.qualifyingLimit)
                : "not applicable",
            ],
            ["Amount that qualifies", deduction ? money(deduction.eligibleAmount) : "—"],
            ["Deduction rate", deduction ? `${deduction.deductionRate}%` : "—"],
            ["Deduction", deduction ? money(deduction.deduction) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {deduction && deduction.blocked && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {deduction.blocked}
          </p>
        )}
        {deduction &&
          deduction.notes.map((note) => (
            <p
              key={note}
              className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Receipt preview</h2>
        <pre className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {failed ? "—" : result.receipt}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not tax advice. The deduction shown assumes the figures entered
        are correct and that the institution&apos;s 80G approval is valid on the date of the
        donation — have your chartered accountant confirm the category and the Form 10BD filing.
      </p>
    </main>
  );
}
