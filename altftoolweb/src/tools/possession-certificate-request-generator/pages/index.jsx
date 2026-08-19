"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";
import {
  DEFAULT_REPLY_DAYS,
  HANDOVER_DOCUMENTS,
  buildPossessionRequestLetter,
  computeDelayInterest,
  computePossessionTimeline,
  formatLongDate,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(Number(value)) ? Number(value) : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EM_DASH = "—";

const DEFAULTS = {
  buyerName: "Asha Menon",
  buyerAddress: "12 Rose Lane, Baner, Pune 411045",
  buyerPhone: "+91 98XXXXXX21",
  buyerEmail: "asha.menon@example.com",
  builderName: "Skyline Developers Private Limited",
  builderAddress: "Skyline House, Baner Road, Pune 411045",
  projectName: "Skyline Meadows Phase II",
  unitNumber: "B-1204",
  reraNumber: "P52100012345",
  bookingDate: "2022-03-11",
  agreementPossessionDate: "2025-06-30",
  ocDate: "2026-01-15",
  ccDate: "2026-01-10",
  referenceDate: "2026-07-28",
  replyDays: String(DEFAULT_REPLY_DAYS),
  amountPaid: "5000000",
  mclr: "9",
};

const DEFAULT_DOC_IDS = HANDOVER_DOCUMENTS.filter((doc) => doc.statutory).map((doc) => doc.id);

export default function ToolHome() {
  const [buyerName, setBuyerName] = useState(DEFAULTS.buyerName);
  const [buyerAddress, setBuyerAddress] = useState(DEFAULTS.buyerAddress);
  const [buyerPhone, setBuyerPhone] = useState(DEFAULTS.buyerPhone);
  const [buyerEmail, setBuyerEmail] = useState(DEFAULTS.buyerEmail);
  const [builderName, setBuilderName] = useState(DEFAULTS.builderName);
  const [builderAddress, setBuilderAddress] = useState(DEFAULTS.builderAddress);
  const [projectName, setProjectName] = useState(DEFAULTS.projectName);
  const [unitNumber, setUnitNumber] = useState(DEFAULTS.unitNumber);
  const [reraNumber, setReraNumber] = useState(DEFAULTS.reraNumber);
  const [bookingDate, setBookingDate] = useState(DEFAULTS.bookingDate);
  const [agreementPossessionDate, setAgreementPossessionDate] = useState(
    DEFAULTS.agreementPossessionDate,
  );
  const [ocDate, setOcDate] = useState(DEFAULTS.ocDate);
  const [ccDate, setCcDate] = useState(DEFAULTS.ccDate);
  const [referenceDate, setReferenceDate] = useState(DEFAULTS.referenceDate);
  const [replyDays, setReplyDays] = useState(DEFAULTS.replyDays);
  const [amountPaid, setAmountPaid] = useState(DEFAULTS.amountPaid);
  const [mclr, setMclr] = useState(DEFAULTS.mclr);
  const [docIds, setDocIds] = useState(DEFAULT_DOC_IDS);
  const [copied, setCopied] = useState(false);

  const timeline = useMemo(
    () =>
      computePossessionTimeline({
        agreementPossessionDate,
        ocDate,
        ccDate,
        referenceDate,
        replyDays: Number(replyDays),
      }),
    [agreementPossessionDate, ocDate, ccDate, referenceDate, replyDays],
  );

  const interest = useMemo(
    () =>
      timeline.error
        ? { error: timeline.error }
        : computeDelayInterest({
            amountPaid: Number(amountPaid),
            mclrPercent: Number(mclr),
            delayDays: timeline.delayDays,
          }),
    [timeline, amountPaid, mclr],
  );

  const selectedDocs = useMemo(
    () => HANDOVER_DOCUMENTS.filter((doc) => docIds.includes(doc.id)).map((doc) => doc.label),
    [docIds],
  );

  const letter = useMemo(
    () =>
      buildPossessionRequestLetter({
        buyerName,
        buyerAddress,
        buyerPhone,
        buyerEmail,
        builderName,
        builderAddress,
        projectName,
        unitNumber,
        reraNumber,
        bookingDate,
        agreementPossessionDate,
        ocDate,
        ccDate,
        referenceDate,
        replyDays: Number(replyDays),
        documents: selectedDocs,
        timeline,
        interest,
        amountPaid: Number(amountPaid),
        currencyFormatter: money,
      }),
    [
      buyerName,
      buyerAddress,
      buyerPhone,
      buyerEmail,
      builderName,
      builderAddress,
      projectName,
      unitNumber,
      reraNumber,
      bookingDate,
      agreementPossessionDate,
      ocDate,
      ccDate,
      referenceDate,
      replyDays,
      selectedDocs,
      timeline,
      interest,
      amountPaid,
    ],
  );

  const error = timeline.error || interest.error || letter.error || "";
  const ok = !error;

  const toggleDoc = (id) => {
    setDocIds((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  };

  const copyResult = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(letter.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBuyerName(DEFAULTS.buyerName);
    setBuyerAddress(DEFAULTS.buyerAddress);
    setBuyerPhone(DEFAULTS.buyerPhone);
    setBuyerEmail(DEFAULTS.buyerEmail);
    setBuilderName(DEFAULTS.builderName);
    setBuilderAddress(DEFAULTS.builderAddress);
    setProjectName(DEFAULTS.projectName);
    setUnitNumber(DEFAULTS.unitNumber);
    setReraNumber(DEFAULTS.reraNumber);
    setBookingDate(DEFAULTS.bookingDate);
    setAgreementPossessionDate(DEFAULTS.agreementPossessionDate);
    setOcDate(DEFAULTS.ocDate);
    setCcDate(DEFAULTS.ccDate);
    setReferenceDate(DEFAULTS.referenceDate);
    setReplyDays(DEFAULTS.replyDays);
    setAmountPaid(DEFAULTS.amountPaid);
    setMclr(DEFAULTS.mclr);
    setDocIds(DEFAULT_DOC_IDS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Property handover
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Possession Certificate Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft a formal letter asking your builder for possession, the possession certificate and
          the full handover document set — with the RERA deadlines and delay interest worked out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Allottee and project</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-buyer">
              Your name
            </label>
            <input
              id="pc-buyer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={buyerName}
              onChange={(event) => setBuyerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-buyer-phone">
              Your phone
            </label>
            <input
              id="pc-buyer-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={buyerPhone}
              onChange={(event) => setBuyerPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-buyer-address">
              Your address
            </label>
            <input
              id="pc-buyer-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={buyerAddress}
              onChange={(event) => setBuyerAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-buyer-email">
              Your email
            </label>
            <input
              id="pc-buyer-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={buyerEmail}
              onChange={(event) => setBuyerEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-builder">
              Builder / promoter name
            </label>
            <input
              id="pc-builder"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={builderName}
              onChange={(event) => setBuilderName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-builder-address">
              Builder address
            </label>
            <input
              id="pc-builder-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={builderAddress}
              onChange={(event) => setBuilderAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-project">
              Project name
            </label>
            <input
              id="pc-project"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-unit">
              Unit / flat number
            </label>
            <input
              id="pc-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={unitNumber}
              onChange={(event) => setUnitNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-rera">
              RERA registration number
            </label>
            <input
              id="pc-rera"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={reraNumber}
              onChange={(event) => setReraNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-booking">
              Booking date
            </label>
            <input
              id="pc-booking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={bookingDate}
              onChange={(event) => setBookingDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Dates and money</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-agreed">
              Possession date in the agreement
            </label>
            <input
              id="pc-agreed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={agreementPossessionDate}
              onChange={(event) => setAgreementPossessionDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-letter-date">
              Letter date
            </label>
            <input
              id="pc-letter-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-oc">
              Occupancy certificate date (leave blank if not issued)
            </label>
            <input
              id="pc-oc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={ocDate}
              onChange={(event) => setOcDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-cc">
              Completion certificate date (optional)
            </label>
            <input
              id="pc-cc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={ccDate}
              onChange={(event) => setCcDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-paid">
              Amount already paid (INR)
            </label>
            <input
              id="pc-paid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-mclr">
              SBI highest MCLR (% per year)
            </label>
            <input
              id="pc-mclr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.05"
              value={mclr}
              onChange={(event) => setMclr(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-reply">
              Reply window (days)
            </label>
            <input
              id="pc-reply"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              value={replyDays}
              onChange={(event) => setReplyDays(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Documents to demand</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {docIds.length} of {HANDOVER_DOCUMENTS.length} selected.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {HANDOVER_DOCUMENTS.map((doc) => (
            <li key={doc.id}>
              <label
                className="flex min-h-11 items-start gap-2 text-sm leading-6"
                htmlFor={`pc-doc-${doc.id}`}
              >
                <input
                  id={`pc-doc-${doc.id}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={docIds.includes(doc.id)}
                  onChange={() => toggleDoc(doc.id)}
                />
                <span>
                  {doc.label}
                  {doc.statutory ? (
                    <span className="ml-1 text-xs font-semibold uppercase text-[var(--primary)]">
                      core
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Delay in handing over possession
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${timeline.delayDays} days` : EM_DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? timeline.isDelayed
                  ? `About ${timeline.delayMonths} month(s) past the agreed date`
                  : "Possession is not yet overdue under the agreement"
                : "Fix the highlighted problem to see the timeline."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the possession request letter"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Possession due (3 months after OC, s.17(1))",
              ok && timeline.possessionDueByOc
                ? `${formatLongDate(timeline.possessionDueByOc)}${
                    timeline.possessionOverdueByOc ? " — overdue" : ""
                  }`
                : ok
                  ? "OC date not entered"
                  : EM_DASH,
            ],
            [
              "Documents due (30 days after CC, s.17(2))",
              ok && timeline.documentsDueByCc
                ? `${formatLongDate(timeline.documentsDueByCc)}${
                    timeline.documentsOverdueByCc ? " — overdue" : ""
                  }`
                : ok
                  ? "CC date not entered"
                  : EM_DASH,
            ],
            ["Prescribed interest rate (MCLR + 2%)", ok ? `${interest.rate}% per year` : EM_DASH],
            ["Delay interest accrued to date", ok ? money(interest.interest) : EM_DASH],
            ["Interest accruing per month", ok ? money(interest.perMonth) : EM_DASH],
            ["Reply requested by", ok ? formatLongDate(timeline.replyBy) : EM_DASH],
            ["Defect liability period", ok ? timeline.defectLiabilityNote : EM_DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Letter</h2>
          <pre className="mt-3 max-h-[30rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)]">
            {letter.text}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
