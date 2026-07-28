"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";
import { DEFAULT_PROCESSING_DAYS, PURPOSES, buildBonafideRequest, formatLongDate } from "../lib";

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

const STATUS_STYLE = {
  ok: "bg-[var(--success)]/10 text-[var(--success)]",
  late: "bg-[var(--danger-soft)] text-[var(--danger)]",
  stale: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const DEFAULTS = {
  studentName: "Meera Nair",
  parentName: "K Nair",
  courseOrClass: "B.Tech Computer Science, Year 3",
  section: "",
  rollNumber: "CS21B045",
  admissionNumber: "",
  academicYear: "2025-26",
  institutionName: "Government Engineering College, Thrissur",
  addresseeTitle: "The Principal",
  address: "9 Kuriachira Road, Thrissur 680006",
  phone: "98xxxxxx44",
  email: "meera.nair@example.com",
  purposeKey: "visa",
  purposeDetail: "",
  submittingTo: "the Consulate General of Germany, Chennai",
  requestDate: "2026-02-02",
  processingDays: String(DEFAULT_PROCESSING_DAYS),
  copies: "2",
  feePerCopy: "50",
  submitByDate: "2026-03-15",
  freshnessDays: "",
  wantLetterhead: true,
  wantPhotoAttested: false,
};

export default function ToolHome() {
  const [studentName, setStudentName] = useState(DEFAULTS.studentName);
  const [parentName, setParentName] = useState(DEFAULTS.parentName);
  const [courseOrClass, setCourseOrClass] = useState(DEFAULTS.courseOrClass);
  const [section, setSection] = useState(DEFAULTS.section);
  const [rollNumber, setRollNumber] = useState(DEFAULTS.rollNumber);
  const [admissionNumber, setAdmissionNumber] = useState(DEFAULTS.admissionNumber);
  const [academicYear, setAcademicYear] = useState(DEFAULTS.academicYear);
  const [institutionName, setInstitutionName] = useState(DEFAULTS.institutionName);
  const [addresseeTitle, setAddresseeTitle] = useState(DEFAULTS.addresseeTitle);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [purposeKey, setPurposeKey] = useState(DEFAULTS.purposeKey);
  const [purposeDetail, setPurposeDetail] = useState(DEFAULTS.purposeDetail);
  const [submittingTo, setSubmittingTo] = useState(DEFAULTS.submittingTo);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [processingDays, setProcessingDays] = useState(DEFAULTS.processingDays);
  const [copies, setCopies] = useState(DEFAULTS.copies);
  const [feePerCopy, setFeePerCopy] = useState(DEFAULTS.feePerCopy);
  const [submitByDate, setSubmitByDate] = useState(DEFAULTS.submitByDate);
  const [freshnessDays, setFreshnessDays] = useState(DEFAULTS.freshnessDays);
  const [wantLetterhead, setWantLetterhead] = useState(DEFAULTS.wantLetterhead);
  const [wantPhotoAttested, setWantPhotoAttested] = useState(DEFAULTS.wantPhotoAttested);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildBonafideRequest({
        studentName,
        parentName,
        courseOrClass,
        section,
        rollNumber,
        admissionNumber,
        academicYear,
        institutionName,
        addresseeTitle,
        address,
        phone,
        email,
        purposeKey,
        purposeDetail,
        submittingTo,
        requestDate,
        processingDays,
        copies,
        feePerCopy,
        submitByDate,
        freshnessDays: freshnessDays === "" ? null : freshnessDays,
        wantLetterhead,
        wantPhotoAttested,
      }),
    [
      studentName,
      parentName,
      courseOrClass,
      section,
      rollNumber,
      admissionNumber,
      academicYear,
      institutionName,
      addresseeTitle,
      address,
      phone,
      email,
      purposeKey,
      purposeDetail,
      submittingTo,
      requestDate,
      processingDays,
      copies,
      feePerCopy,
      submitByDate,
      freshnessDays,
      wantLetterhead,
      wantPhotoAttested,
    ],
  );

  const failed = Boolean(result.error);
  const plan = failed ? null : result.plan;

  const copyLetter = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStudentName(DEFAULTS.studentName);
    setParentName(DEFAULTS.parentName);
    setCourseOrClass(DEFAULTS.courseOrClass);
    setSection(DEFAULTS.section);
    setRollNumber(DEFAULTS.rollNumber);
    setAdmissionNumber(DEFAULTS.admissionNumber);
    setAcademicYear(DEFAULTS.academicYear);
    setInstitutionName(DEFAULTS.institutionName);
    setAddresseeTitle(DEFAULTS.addresseeTitle);
    setAddress(DEFAULTS.address);
    setPhone(DEFAULTS.phone);
    setEmail(DEFAULTS.email);
    setPurposeKey(DEFAULTS.purposeKey);
    setPurposeDetail(DEFAULTS.purposeDetail);
    setSubmittingTo(DEFAULTS.submittingTo);
    setRequestDate(DEFAULTS.requestDate);
    setProcessingDays(DEFAULTS.processingDays);
    setCopies(DEFAULTS.copies);
    setFeePerCopy(DEFAULTS.feePerCopy);
    setSubmitByDate(DEFAULTS.submitByDate);
    setFreshnessDays(DEFAULTS.freshnessDays);
    setWantLetterhead(DEFAULTS.wantLetterhead);
    setWantPhotoAttested(DEFAULTS.wantPhotoAttested);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Education documents
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bonafide Certificate Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it who the certificate is for — a visa post, a bank, the passport office or a
          scholarship portal — and it lists the facts that authority needs printed, totals the copy
          fee, and checks the certificate will still be fresh on your submission date.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Purpose</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bc-purpose">
              What is the certificate for?
            </label>
            <select
              id="bc-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purposeKey}
              onChange={(event) => setPurposeKey(event.target.value)}
            >
              {PURPOSES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bc-submitting">
              Submitting it to (optional)
            </label>
            <input
              id="bc-submitting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={submittingTo}
              onChange={(event) => setSubmittingTo(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bc-detail">
              Extra context for the office (optional)
            </label>
            <textarea
              id="bc-detail"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={purposeDetail}
              onChange={(event) => setPurposeDetail(event.target.value)}
              placeholder="My visa appointment is on 20 March 2026 and the checklist asks for a certificate in English."
            />
          </div>
        </div>
        {plan && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {plan.purpose.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Student and institution</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-student">
              Student&apos;s full name
            </label>
            <input
              id="bc-student"
              className={`mt-2 ${INPUT_CLASS}`}
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-parent">
              Father&apos;s or mother&apos;s name
            </label>
            <input
              id="bc-parent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={parentName}
              onChange={(event) => setParentName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bc-course">
              Class or course
            </label>
            <input
              id="bc-course"
              className={`mt-2 ${INPUT_CLASS}`}
              value={courseOrClass}
              onChange={(event) => setCourseOrClass(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-section">
              Section (optional)
            </label>
            <input
              id="bc-section"
              className={`mt-2 ${INPUT_CLASS}`}
              value={section}
              onChange={(event) => setSection(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-roll">
              Roll number
            </label>
            <input
              id="bc-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-admission">
              Admission number (optional)
            </label>
            <input
              id="bc-admission"
              className={`mt-2 ${INPUT_CLASS}`}
              value={admissionNumber}
              onChange={(event) => setAdmissionNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-year">
              Academic year
            </label>
            <input
              id="bc-year"
              className={`mt-2 ${INPUT_CLASS}`}
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-institution">
              School or college
            </label>
            <input
              id="bc-institution"
              className={`mt-2 ${INPUT_CLASS}`}
              value={institutionName}
              onChange={(event) => setInstitutionName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-addressee">
              Addressed to
            </label>
            <input
              id="bc-addressee"
              className={`mt-2 ${INPUT_CLASS}`}
              value={addresseeTitle}
              onChange={(event) => setAddresseeTitle(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bc-address">
              Your address
            </label>
            <input
              id="bc-address"
              className={`mt-2 ${INPUT_CLASS}`}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-phone">
              Phone
            </label>
            <input
              id="bc-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-email">
              Email
            </label>
            <input
              id="bc-email"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Copies, fee and timing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-date">
              Applying on
            </label>
            <input
              id="bc-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-processing">
              Office processing time (working days)
            </label>
            <input
              id="bc-processing"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={processingDays}
              onChange={(event) => setProcessingDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-copies">
              Copies needed
            </label>
            <input
              id="bc-copies"
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={copies}
              onChange={(event) => setCopies(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-fee">
              Fee per copy (INR)
            </label>
            <input
              id="bc-fee"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={feePerCopy}
              onChange={(event) => setFeePerCopy(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-submitby">
              Must be submitted by (optional)
            </label>
            <input
              id="bc-submitby"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={submitByDate}
              onChange={(event) => setSubmitByDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bc-freshness">
              Accepted if issued within (days)
            </label>
            <input
              id="bc-freshness"
              type="number"
              inputMode="numeric"
              min="1"
              max="1825"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={freshnessDays}
              onChange={(event) => setFreshnessDays(event.target.value)}
              placeholder={plan ? String(plan.purpose.freshnessDays) : "90"}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-3">
            <input
              id="bc-letterhead"
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={wantLetterhead}
              onChange={(event) => setWantLetterhead(event.target.checked)}
            />
            <label
              className="text-sm leading-6 text-[var(--muted-foreground)]"
              htmlFor="bc-letterhead"
            >
              Ask for it on institution letterhead with seal and signature
            </label>
          </div>
          <div className="flex items-start gap-3">
            <input
              id="bc-photo"
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={wantPhotoAttested}
              onChange={(event) => setWantPhotoAttested(event.target.checked)}
            />
            <label className="text-sm leading-6 text-[var(--muted-foreground)]" htmlFor="bc-photo">
              Ask for an attested photograph on the certificate
            </label>
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
              Expected in hand
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {plan ? formatLongDate(plan.expectedIssueDate) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan
                ? `${plan.copies} cop${plan.copies === 1 ? "y" : "ies"} · fee ${money(plan.totalFee)}`
                : "Fix the inputs above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={failed}
              aria-label="Copy the bonafide certificate request letter"
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
            ["Applying on", plan ? formatLongDate(plan.requestDate) : "—"],
            ["Processing time", plan ? `${plan.processingDays} working days` : "—"],
            ["Expected issue date", plan ? formatLongDate(plan.expectedIssueDate) : "—"],
            ["Freshness window", plan ? `${plan.freshnessDays} days` : "—"],
            ["Usable until", plan ? formatLongDate(plan.validUntil) : "—"],
            ["Total fee", plan ? money(plan.totalFee) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {plan && plan.freshnessCheck && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${STATUS_STYLE[plan.freshnessCheck.status]}`}
          >
            {plan.freshnessCheck.message}
          </p>
        )}
      </section>

      {plan && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The certificate must state</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            {plan.purpose.mustState.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Letter preview</h2>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {failed ? "—" : result.letter}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only. Freshness windows and required fields vary by consulate, bank
        and scholarship portal — always read the checklist published by the authority you are
        applying to before you submit.
      </p>
    </main>
  );
}
