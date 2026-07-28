"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  DEFAULT_DUE_ITEMS,
  DEFAULT_PROCESSING_DAYS,
  DEFAULT_REMINDER_DAYS,
  ENCLOSURES,
  TC_REASONS,
  buildTcRequest,
  formatLongDate,
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

const DEFAULT_DUES = [
  { id: 1, label: DEFAULT_DUE_ITEMS[0], amount: "0" },
  { id: 2, label: DEFAULT_DUE_ITEMS[2], amount: "0" },
];

const DEFAULTS = {
  studentName: "Aarav Menon",
  admissionNumber: "LF/2019/442",
  className: "8",
  section: "B",
  rollNumber: "21",
  parentName: "Sujatha Menon",
  address: "21 Palm Grove, Kochi 682016",
  phone: "98xxxxxx10",
  email: "sujatha.menon@example.com",
  schoolName: "Little Flower High School",
  principalTitle: "The Principal",
  requestDate: "2026-01-20",
  lastAttendedDate: "2026-01-16",
  processingDays: String(DEFAULT_PROCESSING_DAYS),
  reminderDays: String(DEFAULT_REMINDER_DAYS),
  reason: TC_REASONS[0],
  reasonDetail: "",
  newSchoolName: "Delhi Public School",
  newCity: "Hyderabad",
  conduct: true,
  bonafide: false,
  citeRte: true,
};

export default function ToolHome() {
  const [studentName, setStudentName] = useState(DEFAULTS.studentName);
  const [admissionNumber, setAdmissionNumber] = useState(DEFAULTS.admissionNumber);
  const [className, setClassName] = useState(DEFAULTS.className);
  const [section, setSection] = useState(DEFAULTS.section);
  const [rollNumber, setRollNumber] = useState(DEFAULTS.rollNumber);
  const [parentName, setParentName] = useState(DEFAULTS.parentName);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [schoolName, setSchoolName] = useState(DEFAULTS.schoolName);
  const [principalTitle, setPrincipalTitle] = useState(DEFAULTS.principalTitle);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [lastAttendedDate, setLastAttendedDate] = useState(DEFAULTS.lastAttendedDate);
  const [processingDays, setProcessingDays] = useState(DEFAULTS.processingDays);
  const [reminderDays, setReminderDays] = useState(DEFAULTS.reminderDays);
  const [reason, setReason] = useState(DEFAULTS.reason);
  const [reasonDetail, setReasonDetail] = useState(DEFAULTS.reasonDetail);
  const [newSchoolName, setNewSchoolName] = useState(DEFAULTS.newSchoolName);
  const [newCity, setNewCity] = useState(DEFAULTS.newCity);
  const [dues, setDues] = useState(DEFAULT_DUES);
  const [enclosures, setEnclosures] = useState(ENCLOSURES.slice(0, 3));
  const [conduct, setConduct] = useState(DEFAULTS.conduct);
  const [bonafide, setBonafide] = useState(DEFAULTS.bonafide);
  const [citeRte, setCiteRte] = useState(DEFAULTS.citeRte);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildTcRequest({
        studentName,
        admissionNumber,
        className,
        section,
        rollNumber,
        parentName,
        address,
        phone,
        email,
        schoolName,
        principalTitle,
        requestDate,
        lastAttendedDate,
        processingDays,
        reminderDays,
        reason,
        reasonDetail,
        newSchoolName,
        newCity,
        dues,
        enclosures,
        requestConductCertificate: conduct,
        requestBonafide: bonafide,
        citeRte,
      }),
    [
      studentName,
      admissionNumber,
      className,
      section,
      rollNumber,
      parentName,
      address,
      phone,
      email,
      schoolName,
      principalTitle,
      requestDate,
      lastAttendedDate,
      processingDays,
      reminderDays,
      reason,
      reasonDetail,
      newSchoolName,
      newCity,
      dues,
      enclosures,
      conduct,
      bonafide,
      citeRte,
    ],
  );

  const failed = Boolean(result.error);
  const timeline = failed ? null : result.timeline;
  const duesTotal = failed ? null : result.dues.total;

  const updateDue = (id, patch) =>
    setDues((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addDue = () =>
    setDues((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, label: DEFAULT_DUE_ITEMS[0], amount: "" }];
    });

  const removeDue = (id) => setDues((rows) => rows.filter((row) => row.id !== id));

  const toggleEnclosure = (option) =>
    setEnclosures((list) =>
      list.includes(option) ? list.filter((item) => item !== option) : [...list, option],
    );

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
    setAdmissionNumber(DEFAULTS.admissionNumber);
    setClassName(DEFAULTS.className);
    setSection(DEFAULTS.section);
    setRollNumber(DEFAULTS.rollNumber);
    setParentName(DEFAULTS.parentName);
    setAddress(DEFAULTS.address);
    setPhone(DEFAULTS.phone);
    setEmail(DEFAULTS.email);
    setSchoolName(DEFAULTS.schoolName);
    setPrincipalTitle(DEFAULTS.principalTitle);
    setRequestDate(DEFAULTS.requestDate);
    setLastAttendedDate(DEFAULTS.lastAttendedDate);
    setProcessingDays(DEFAULTS.processingDays);
    setReminderDays(DEFAULTS.reminderDays);
    setReason(DEFAULTS.reason);
    setReasonDetail(DEFAULTS.reasonDetail);
    setNewSchoolName(DEFAULTS.newSchoolName);
    setNewCity(DEFAULTS.newCity);
    setDues(DEFAULT_DUES);
    setEnclosures(ENCLOSURES.slice(0, 3));
    setConduct(DEFAULTS.conduct);
    setBonafide(DEFAULTS.bonafide);
    setCiteRte(DEFAULTS.citeRte);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Education documents
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Transfer Certificate Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the student, class and reason, list any pending dues, and get a properly formatted
          TC application with the academic session, the date you can expect the certificate and the
          day to follow up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Student and school</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-student">
              Student&apos;s full name
            </label>
            <input
              id="tc-student"
              className={`mt-2 ${INPUT_CLASS}`}
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-admission">
              Admission number
            </label>
            <input
              id="tc-admission"
              className={`mt-2 ${INPUT_CLASS}`}
              value={admissionNumber}
              onChange={(event) => setAdmissionNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-class">
              Class
            </label>
            <input
              id="tc-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={className}
              onChange={(event) => setClassName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-section">
              Section
            </label>
            <input
              id="tc-section"
              className={`mt-2 ${INPUT_CLASS}`}
              value={section}
              onChange={(event) => setSection(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-roll">
              Roll number
            </label>
            <input
              id="tc-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-school">
              Current school
            </label>
            <input
              id="tc-school"
              className={`mt-2 ${INPUT_CLASS}`}
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-addressee">
              Addressed to
            </label>
            <input
              id="tc-addressee"
              className={`mt-2 ${INPUT_CLASS}`}
              value={principalTitle}
              onChange={(event) => setPrincipalTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-parent">
              Parent or guardian name
            </label>
            <input
              id="tc-parent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={parentName}
              onChange={(event) => setParentName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-address">
              Address
            </label>
            <input
              id="tc-address"
              className={`mt-2 ${INPUT_CLASS}`}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-phone">
              Phone
            </label>
            <input
              id="tc-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-email">
              Email
            </label>
            <input
              id="tc-email"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Reason and dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-reason">
              Reason for the transfer
            </label>
            <select
              id="tc-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              {TC_REASONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-reason-detail">
              Say it in your own words (optional)
            </label>
            <textarea
              id="tc-reason-detail"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={reasonDetail}
              onChange={(event) => setReasonDetail(event.target.value)}
              placeholder="My employer has transferred me to Hyderabad with effect from 1 February 2026."
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-newschool">
              New school (optional)
            </label>
            <input
              id="tc-newschool"
              className={`mt-2 ${INPUT_CLASS}`}
              value={newSchoolName}
              onChange={(event) => setNewSchoolName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-newcity">
              New city (optional)
            </label>
            <input
              id="tc-newcity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={newCity}
              onChange={(event) => setNewCity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-date">
              Date of this application
            </label>
            <input
              id="tc-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-last">
              Last day attended (optional)
            </label>
            <input
              id="tc-last"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lastAttendedDate}
              onChange={(event) => setLastAttendedDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-processing">
              School office processing time (school days)
            </label>
            <input
              id="tc-processing"
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={processingDays}
              onChange={(event) => setProcessingDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-reminder">
              Wait this many days before a reminder
            </label>
            <input
              id="tc-reminder"
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reminderDays}
              onChange={(event) => setReminderDays(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-3">
            <input
              id="tc-conduct"
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={conduct}
              onChange={(event) => setConduct(event.target.checked)}
            />
            <label className="text-sm leading-6 text-[var(--muted-foreground)]" htmlFor="tc-conduct">
              Also ask for a character or conduct certificate
            </label>
          </div>
          <div className="flex items-start gap-3">
            <input
              id="tc-bonafide"
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={bonafide}
              onChange={(event) => setBonafide(event.target.checked)}
            />
            <label
              className="text-sm leading-6 text-[var(--muted-foreground)]"
              htmlFor="tc-bonafide"
            >
              Also ask for a bonafide certificate for the current session
            </label>
          </div>
          <div className="flex items-start gap-3">
            <input
              id="tc-rte"
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={citeRte}
              onChange={(event) => setCiteRte(event.target.checked)}
            />
            <label className="text-sm leading-6 text-[var(--muted-foreground)]" htmlFor="tc-rte">
              Cite Section 5 of the RTE Act, 2009 — relevant for elementary classes 1 to 8
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Pending dues</h2>
          <button type="button" onClick={addDue} className={GHOST_BTN} aria-label="Add a dues row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add due
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {dues.map((row, index) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-2"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`tc-due-label-${row.id}`}>
                  Item {index + 1}
                </label>
                <select
                  id={`tc-due-label-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={DEFAULT_DUE_ITEMS.includes(row.label) ? row.label : DEFAULT_DUE_ITEMS[0]}
                  onChange={(event) => updateDue(row.id, { label: event.target.value })}
                >
                  {DEFAULT_DUE_ITEMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`tc-due-amount-${row.id}`}>
                  Amount (INR)
                </label>
                <input
                  id={`tc-due-amount-${row.id}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.amount}
                  onChange={(event) => updateDue(row.id, { amount: event.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => removeDue(row.id)}
                  aria-label={`Remove dues row ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
          {dues.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">
              No dues listed — the letter will say all fees are cleared.
            </p>
          )}
        </div>

        <div className="mt-5">
          <p className={LABEL_CLASS}>Enclosures</p>
          <div className="mt-2 space-y-2">
            {ENCLOSURES.map((option, index) => (
              <div key={option} className="flex items-start gap-3">
                <input
                  id={`tc-encl-${index}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={enclosures.includes(option)}
                  onChange={() => toggleEnclosure(option)}
                />
                <label
                  className="text-sm leading-6 text-[var(--muted-foreground)]"
                  htmlFor={`tc-encl-${index}`}
                >
                  {option}
                </label>
              </div>
            ))}
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
              Expect the certificate by
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {timeline ? formatLongDate(timeline.expectedIssueDate) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {timeline ? `Academic session ${timeline.session}` : "Fix the inputs above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={failed}
              aria-label="Copy the transfer certificate request letter"
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
            ["Application date", timeline ? formatLongDate(timeline.requestDate) : "—"],
            ["Processing time allowed", timeline ? `${timeline.processingDays} school days` : "—"],
            ["Expected issue date", timeline ? formatLongDate(timeline.expectedIssueDate) : "—"],
            ["Send a reminder on", timeline ? formatLongDate(timeline.reminderDate) : "—"],
            ["Dues to clear first", duesTotal === null ? "—" : money(duesTotal)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Letter preview</h2>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {failed ? "—" : result.letter}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Submit the application at the school office and
        take an acknowledgement with a date stamp — that receipt is what makes any later escalation
        to the block or district education officer worth reading.
      </p>
    </main>
  );
}
