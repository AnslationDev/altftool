"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  ACCOMMODATION_BASIS,
  CERTIFICATE_STYLES,
  DEFAULT_CERT_MAX_AGE_DAYS,
  DEFAULT_STATEMENT_MONTHS,
  buildBalanceCertificateRequest,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const CURRENCIES = ["EUR", "USD", "GBP", "AUD", "CAD", "SGD", "AED", "JPY", "CHF"];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DEFAULTS = {
  tripStart: "2026-04-10",
  tripEnd: "2026-04-20",
  appointmentDate: "2026-02-20",
  requestDate: "2026-02-05",
  basisId: "prepaid",
  perDayAmount: 65,
  currency: "EUR",
  bufferPercent: 10,
  exchangeRate: 92,
  currentBalanceInr: 150000,
  certMaxAgeDays: DEFAULT_CERT_MAX_AGE_DAYS,
  statementMonths: DEFAULT_STATEMENT_MONTHS,
  styleId: "balance-statement",
  applicantName: "Meera Nair",
  accountNumber: "0123456789012",
  branchName: "State Bank of India, Koramangala Branch, Bengaluru",
  destination: "France (Schengen)",
};

export default function ToolHome() {
  const [tripStart, setTripStart] = useState(DEFAULTS.tripStart);
  const [tripEnd, setTripEnd] = useState(DEFAULTS.tripEnd);
  const [appointmentDate, setAppointmentDate] = useState(DEFAULTS.appointmentDate);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [basisId, setBasisId] = useState(DEFAULTS.basisId);
  const [perDayAmount, setPerDayAmount] = useState(String(DEFAULTS.perDayAmount));
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [bufferPercent, setBufferPercent] = useState(String(DEFAULTS.bufferPercent));
  const [exchangeRate, setExchangeRate] = useState(String(DEFAULTS.exchangeRate));
  const [currentBalanceInr, setCurrentBalanceInr] = useState(String(DEFAULTS.currentBalanceInr));
  const [certMaxAgeDays, setCertMaxAgeDays] = useState(String(DEFAULTS.certMaxAgeDays));
  const [statementMonths, setStatementMonths] = useState(String(DEFAULTS.statementMonths));
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [applicantName, setApplicantName] = useState(DEFAULTS.applicantName);
  const [accountNumber, setAccountNumber] = useState(DEFAULTS.accountNumber);
  const [branchName, setBranchName] = useState(DEFAULTS.branchName);
  const [destination, setDestination] = useState(DEFAULTS.destination);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildBalanceCertificateRequest({
        tripStart,
        tripEnd,
        appointmentDate,
        requestDate,
        perDayAmount: Number(perDayAmount),
        bufferPercent: Number(bufferPercent),
        exchangeRate: Number(exchangeRate),
        currentBalanceInr: Number(currentBalanceInr),
        certMaxAgeDays: Number(certMaxAgeDays),
        statementMonths: Number(statementMonths),
        styleId,
        applicantName,
        accountNumber,
        branchName,
        destination,
      }),
    [
      tripStart,
      tripEnd,
      appointmentDate,
      requestDate,
      perDayAmount,
      bufferPercent,
      exchangeRate,
      currentBalanceInr,
      certMaxAgeDays,
      statementMonths,
      styleId,
      applicantName,
      accountNumber,
      branchName,
      destination,
    ],
  );

  const hasError = Boolean(result.error);
  // `inr` rounds to the nearest whole rupee, so a positive shortfall under
  // half a rupee (e.g. ₹0.40) would otherwise render as a self-contradictory
  // "₹0" styled as a shortfall. Treat anything that rounds down to zero as
  // covered — a fraction of a rupee is not an actionable shortfall for a
  // funds-sufficiency check before a visa appointment.
  const hasMeaningfulShortfall = !hasError && Math.round(result.shortfallInr) > 0;

  const foreign = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: CURRENCIES.includes(currency) ? currency : "EUR",
        maximumFractionDigits: 0,
      }),
    [currency],
  );

  const chooseBasis = (id) => {
    setBasisId(id);
    const basis = ACCOMMODATION_BASIS.find((b) => b.id === id);
    if (basis) setPerDayAmount(String(basis.perDay));
  };

  const copyLetter = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will discard the applicant, account, branch, destination, dates and amounts you have entered and cannot be undone.",
      )
    ) {
      return;
    }
    setTripStart(DEFAULTS.tripStart);
    setTripEnd(DEFAULTS.tripEnd);
    setAppointmentDate(DEFAULTS.appointmentDate);
    setRequestDate(DEFAULTS.requestDate);
    setBasisId(DEFAULTS.basisId);
    setPerDayAmount(String(DEFAULTS.perDayAmount));
    setCurrency(DEFAULTS.currency);
    setBufferPercent(String(DEFAULTS.bufferPercent));
    setExchangeRate(String(DEFAULTS.exchangeRate));
    setCurrentBalanceInr(String(DEFAULTS.currentBalanceInr));
    setCertMaxAgeDays(String(DEFAULTS.certMaxAgeDays));
    setStatementMonths(String(DEFAULTS.statementMonths));
    setStyleId(DEFAULTS.styleId);
    setApplicantName(DEFAULTS.applicantName);
    setAccountNumber(DEFAULTS.accountNumber);
    setBranchName(DEFAULTS.branchName);
    setDestination(DEFAULTS.destination);
    setCopied(false);
  };

  const basisNote = ACCOMMODATION_BASIS.find((b) => b.id === basisId)?.note ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Immigration Letters
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Bank Balance Certificate Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sizes the funds a visa file needs from the per-day reference amount and the length of the
          trip, checks the certificate will still be current on appointment day, and drafts the
          request to the branch manager with the wording consulates expect.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-start">
              Trip start date
            </label>
            <input
              id="bc-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={tripStart}
              onChange={(event) => setTripStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-end">
              Trip end date
            </label>
            <input
              id="bc-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={tripEnd}
              onChange={(event) => setTripEnd(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-appointment">
              Visa appointment / submission date
            </label>
            <input
              id="bc-appointment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-request">
              Date of the letter to the bank
            </label>
            <input
              id="bc-request"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-basis">
              Accommodation situation
            </label>
            <select
              id="bc-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={basisId}
              onChange={(event) => chooseBasis(event.target.value)}
            >
              {ACCOMMODATION_BASIS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{basisNote}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-perday">
              Reference amount per day
            </label>
            <input
              id="bc-perday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              step="0.5"
              inputMode="decimal"
              value={perDayAmount}
              onChange={(event) => setPerDayAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-currency">
              Destination currency
            </label>
            <select
              id="bc-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-rate">
              Exchange rate (₹ per 1 {currency})
            </label>
            <input
              id="bc-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-buffer">
              Safety buffer (%)
            </label>
            <input
              id="bc-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max="200"
              step="1"
              inputMode="numeric"
              value={bufferPercent}
              onChange={(event) => setBufferPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-balance">
              Current balance (₹)
            </label>
            <input
              id="bc-balance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              value={currentBalanceInr}
              onChange={(event) => setCurrentBalanceInr(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-maxage">
              Certificate accepted if issued within (days)
            </label>
            <input
              id="bc-maxage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="365"
              step="1"
              inputMode="numeric"
              value={certMaxAgeDays}
              onChange={(event) => setCertMaxAgeDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-months">
              Statements required (months)
            </label>
            <input
              id="bc-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="24"
              step="1"
              inputMode="numeric"
              value={statementMonths}
              onChange={(event) => setStatementMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-style">
              Certificate to ask for
            </label>
            <select
              id="bc-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {CERTIFICATE_STYLES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-destination">
              Visa for
            </label>
            <input
              id="bc-destination"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-name">
              Account holder&rsquo;s name
            </label>
            <input
              id="bc-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={applicantName}
              onChange={(event) => setApplicantName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-account">
              Account number
            </label>
            <input
              id="bc-account"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bc-branch">
              Bank and branch
            </label>
            <input
              id="bc-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={branchName}
              onChange={(event) => setBranchName(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Funds to show
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : inr.format(result.requiredInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${foreign.format(result.requiredForeign)} for ${result.tripDays} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the request letter to the bank"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Days of stay counted</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError ? DASH : `${result.tripDays} (${result.tripNights} nights)`}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Shortfall</dt>
            <dd
              className={`mt-1 text-lg font-semibold ${
                hasMeaningfulShortfall ? "text-[var(--danger-text)]" : "text-[var(--success-text)]"
              }`}
            >
              {hasError
                ? DASH
                : hasMeaningfulShortfall
                  ? inr.format(result.shortfallInr)
                  : "None — balance covers it"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">
              Ask the bank on or after
            </dt>
            <dd className="mt-1 leading-6">
              {hasError ? DASH : result.certificateValidFromLong}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Statement period starts</dt>
            <dd className="mt-1 leading-6">{hasError ? DASH : result.statementFromLong}</dd>
          </div>
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">Letter to the branch</p>
          <p className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
            {hasError ? DASH : result.letter}
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational, not legal or financial advice. Per-day reference amounts are published by each
        Schengen state under Article 21(5) of the Visa Code and differ by country; the defaults here
        are the amounts France publishes and must be checked against the consulate handling your
        application. A sufficient balance does not guarantee a visa.
      </p>
    </main>
  );
}
