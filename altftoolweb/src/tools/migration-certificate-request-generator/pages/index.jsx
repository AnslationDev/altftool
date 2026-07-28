"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw, TriangleAlert } from "lucide-react";
import {
  DELIVERY_MODES,
  ISSUERS,
  OFFICE_WEEKS,
  REQUEST_TYPES,
  buildMigrationRequest,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  issuerId: "university",
  requestTypeId: "original",
  deliveryId: "speed-post",
  officeWeekId: "six-day",
  applicationDate: "2026-08-03",
  admissionDeadline: "2026-09-15",
  resultDeclared: true,
  processingDays: "15",
  baseFee: "500",
  duplicateFee: "750",
  lateFee: "0",
  postage: "100",
  studentName: "Ananya Sharma",
  rollNumber: "21BCS1043",
  courseName: "B.Tech Computer Science and Engineering",
  passingYear: "2025",
  institutionName: "Anna University, Chennai",
  receivingInstitution: "Indian Institute of Technology Madras",
  contact: "ananya.sharma@example.com",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const result = useMemo(
    () =>
      buildMigrationRequest({
        issuerId: form.issuerId,
        requestTypeId: form.requestTypeId,
        deliveryId: form.deliveryId,
        officeWeekId: form.officeWeekId,
        applicationDate: form.applicationDate,
        admissionDeadline: form.admissionDeadline,
        resultDeclared: form.resultDeclared,
        processingDays: Number(form.processingDays),
        baseFee: Number(form.baseFee),
        duplicateFee: Number(form.duplicateFee),
        lateFee: Number(form.lateFee),
        postage: Number(form.postage),
        studentName: form.studentName,
        rollNumber: form.rollNumber,
        courseName: form.courseName,
        passingYear: form.passingYear,
        institutionName: form.institutionName,
        receivingInstitution: form.receivingInstitution,
        contact: form.contact,
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Migration certificate request",
      `Issuing body: ${form.institutionName} (${result.issuerLabel})`,
      `Request: ${result.requestTypeLabel}`,
      `Applied on: ${result.appliedLong}`,
      `Ready at the office by: ${result.readyLong} (${result.processingDays} working days)`,
      `In hand by: ${result.inHandLong} (${result.deliveryLabel})`,
      `Total payable: ${money(result.totalFee)}`,
      `Documents to enclose: ${result.documentCount}`,
      "",
      result.letter,
    ].join("\n");
  }, [failed, form.institutionName, result]);

  const copy = async (what, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Education records
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Migration Certificate Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft the application to your university or board, work out what to enclose, what it costs
          and the date the certificate realistically reaches you — before an admission deadline
          catches you out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Who you are writing to</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-issuer">
              Issuing body
            </label>
            <select
              id="mig-issuer"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.issuerId}
              onChange={set("issuerId")}
            >
              {ISSUERS.map((issuer) => (
                <option key={issuer.id} value={issuer.id}>
                  {issuer.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-institution">
              Full name of the university or board
            </label>
            <input
              id="mig-institution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.institutionName}
              onChange={set("institutionName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-type">
              First issue or duplicate
            </label>
            <select
              id="mig-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.requestTypeId}
              onChange={set("requestTypeId")}
            >
              {REQUEST_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-receiving">
              Institution you are joining (optional)
            </label>
            <input
              id="mig-receiving"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.receivingInstitution}
              onChange={set("receivingInstitution")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your record</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-name">
              Name exactly as on the marksheet
            </label>
            <input
              id="mig-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.studentName}
              onChange={set("studentName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-roll">
              Roll or enrolment number
            </label>
            <input
              id="mig-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.rollNumber}
              onChange={set("rollNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-course">
              Course or class completed
            </label>
            <input
              id="mig-course"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.courseName}
              onChange={set("courseName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-year">
              Year of passing
            </label>
            <input
              id="mig-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={form.passingYear}
              onChange={set("passingYear")}
            />
            <p className={HINT_CLASS}>Four digits, e.g. 2025, or a session such as 2024-25.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mig-contact">
              Contact for the registry (optional)
            </label>
            <input
              id="mig-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contact}
              onChange={set("contact")}
            />
          </div>
        </div>
        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"
          htmlFor="mig-result"
        >
          <input
            id="mig-result"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={form.resultDeclared}
            onChange={set("resultDeclared")}
          />
          The final result of my last examination has been declared
        </label>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Timeline and fees</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-applied">
              Date you submit the application
            </label>
            <input
              id="mig-applied"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.applicationDate}
              onChange={set("applicationDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-deadline">
              Admission deadline (optional)
            </label>
            <input
              id="mig-deadline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.admissionDeadline}
              onChange={set("admissionDeadline")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-processing">
              Processing time quoted (working days)
            </label>
            <input
              id="mig-processing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="1"
              value={form.processingDays}
              onChange={set("processingDays")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-week">
              Office working week
            </label>
            <select
              id="mig-week"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.officeWeekId}
              onChange={set("officeWeekId")}
            >
              {OFFICE_WEEKS.map((week) => (
                <option key={week.id} value={week.id}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mig-delivery">
              How you will receive it
            </label>
            <select
              id="mig-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.deliveryId}
              onChange={set("deliveryId")}
            >
              {DELIVERY_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                  {mode.transitDays > 0 ? ` (+${mode.transitDays} days transit)` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-fee">
              Prescribed fee (INR)
            </label>
            <input
              id="mig-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.baseFee}
              onChange={set("baseFee")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-dupfee">
              Duplicate surcharge (INR)
            </label>
            <input
              id="mig-dupfee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.duplicateFee}
              onChange={set("duplicateFee")}
            />
            <p className={HINT_CLASS}>Counted only when you ask for a duplicate.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-late">
              Late or tatkal charge (INR)
            </label>
            <input
              id="mig-late"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.lateFee}
              onChange={set("lateFee")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mig-postage">
              Postage or courier charge (INR)
            </label>
            <input
              id="mig-postage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.postage}
              onChange={set("postage")}
            />
            <p className={HINT_CLASS}>Ignored if you collect at the counter.</p>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Certificate in hand by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.inHandLong}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see the timeline."
                : `${result.calendarDays} calendar days from application, including transit`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("summary", summary)}
              aria-label="Copy the request summary and letter"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "summary" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field to the defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total payable", failed ? DASH : money(result.totalFee)],
            ["Prescribed fee", failed ? DASH : money(result.fees.base)],
            ["Duplicate surcharge", failed ? DASH : money(result.fees.duplicate)],
            ["Late or tatkal charge", failed ? DASH : money(result.fees.late)],
            ["Postage or courier", failed ? DASH : money(result.fees.postage)],
            [
              "Ready at the office by",
              failed ? DASH : `${result.readyLong} (${result.processingDays} working days)`,
            ],
            ["Transit allowance", failed ? DASH : `${result.transitDays} calendar days`],
            [
              "Documents to enclose",
              failed ? DASH : `${result.documentCount} (${result.criticalCount} essential)`,
            ],
            [
              "Meets the admission deadline",
              failed || result.meetsDeadline === null
                ? DASH
                : result.meetsDeadline
                  ? `Yes — ${result.deadlineLong}`
                  : `No — deadline is ${result.deadlineLong}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.warnings.length > 0 && (
          <ul className="mt-5 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        )}

        {!failed && (
          <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.issuerNote}
          </p>
        )}
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">What to enclose</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {result.documents.map((doc) => (
                <li key={doc.id} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                  <p className="font-semibold">
                    {doc.label}
                    {doc.critical && (
                      <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-[var(--danger)]">
                        Essential
                      </span>
                    )}
                  </p>
                  <p className="mt-1 leading-6 text-[var(--muted-foreground)]">{doc.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Application letter</h2>
              <button
                type="button"
                onClick={() => copy("letter", result.letter)}
                aria-label="Copy the application letter only"
                className={GHOST_BTN}
              >
                {copied === "letter" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "letter" ? "Copied!" : "Copy letter"}
              </button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <pre className="min-w-0 rounded-md bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
                {result.letter}
              </pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Fees, forms and processing times are set by each university or board and
        revised without notice — confirm them on the issuing body&apos;s own examination or registry
        page before you pay, and use its prescribed form where one is published.
      </p>
    </main>
  );
}
