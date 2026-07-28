"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  BONAFIDE_PURPOSES,
  DEFAULT_PROCESSING_WORKING_DAYS,
  MAX_COPIES,
  MAX_PROCESSING_WORKING_DAYS,
  TYPICAL_VALIDITY_DAYS,
  URGENCY,
  assessLeadTime,
  buildBonafideLetter,
  formatLongDate,
} from "../lib";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  studentName: "Aarav Sharma",
  rollNumber: "21CS045",
  courseOrClass: "B.Tech Computer Science, 3rd Year",
  section: "B",
  academicYear: "2026-27",
  institutionName: "Sardar Patel Institute of Technology",
  institutionAddress: "Bhavan's Campus, Andheri West, Mumbai 400058",
  addressee: "The Principal",
  purposeId: "passport",
  purposeDetail: "",
  copies: "2",
  requestDate: "2026-07-28",
  neededBy: "2026-08-14",
  processingDays: String(DEFAULT_PROCESSING_WORKING_DAYS),
  parentName: "Mr. Rakesh Sharma",
  contactPhone: "98xxxxxx21",
  contactEmail: "aarav.sharma@example.com",
};

const URGENCY_COPY = {
  [URGENCY.COMFORTABLE]: "Comfortable — the office has time to process this in the usual course.",
  [URGENCY.TIGHT]: "Tight — the letter asks the office to help meet the date.",
  [URGENCY.LATE]: "Behind schedule — the letter is worded as an urgent request.",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const lead = useMemo(
    () =>
      assessLeadTime({
        requestDateISO: form.requestDate,
        neededByISO: form.neededBy,
        processingWorkingDays: Number(form.processingDays),
      }),
    [form.requestDate, form.neededBy, form.processingDays],
  );

  const letter = useMemo(
    () =>
      buildBonafideLetter({
        studentName: form.studentName,
        rollNumber: form.rollNumber,
        courseOrClass: form.courseOrClass,
        section: form.section,
        academicYear: form.academicYear,
        institutionName: form.institutionName,
        institutionAddress: form.institutionAddress,
        addressee: form.addressee,
        purposeId: form.purposeId,
        purposeDetail: form.purposeDetail,
        copies: Number(form.copies),
        requestDateISO: form.requestDate,
        neededByISO: form.neededBy,
        parentName: form.parentName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        lead,
      }),
    [form, lead],
  );

  const error = lead.error || letter.error || "";

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
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
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Bonafide Certificate Request Letter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in your enrolment details and the purpose. The tool checks whether your deadline is
          realistic against the office turnaround, then writes the request in the format schools,
          colleges and universities expect.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Purpose and timing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bf-purpose">
              What do you need it for?
            </label>
            <select id="bf-purpose" className={INPUT} value={form.purposeId} onChange={set("purposeId")}>
              {BONAFIDE_PURPOSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-request-date">
              Date of this letter
            </label>
            <input id="bf-request-date" className={INPUT} type="date" value={form.requestDate} onChange={set("requestDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-needed-by">
              Needed by
            </label>
            <input id="bf-needed-by" className={INPUT} type="date" value={form.neededBy} onChange={set("neededBy")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-processing">
              Office turnaround (working days)
            </label>
            <input
              id="bf-processing"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_PROCESSING_WORKING_DAYS}
              step="1"
              value={form.processingDays}
              onChange={set("processingDays")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-copies">
              Copies needed (1 to {MAX_COPIES})
            </label>
            <input
              id="bf-copies"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_COPIES}
              step="1"
              value={form.copies}
              onChange={set("copies")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bf-purpose-detail">
              Extra detail about the purpose (optional)
            </label>
            <input
              id="bf-purpose-detail"
              className={INPUT}
              value={form.purposeDetail}
              onChange={set("purposeDetail")}
              placeholder="application reference NSP/2026/884213"
            />
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Expected collection date
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? DASH : formatLongDate(lead.readyByISO)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the dates above." : URGENCY_COPY[lead.urgency]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the bonafide certificate timing summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Bonafide certificate request",
                        `Letter dated: ${formatLongDate(form.requestDate)}`,
                        `Office turnaround: ${lead.processingWorkingDays} working days`,
                        `Expected ready by: ${formatLongDate(lead.readyByISO)}`,
                        `Needed by: ${formatLongDate(form.neededBy)}`,
                        `Buffer: ${lead.bufferDays} day(s)`,
                      ].join("\n"),
                  "summary",
                )
              }
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Calendar days until you need it", error ? DASH : `${lead.calendarDays} days`],
            ["Working days available", error ? DASH : `${lead.workingDaysAvailable} days`],
            ["Buffer after the office turnaround", error ? DASH : `${lead.bufferDays} day(s)`],
            [`Usually treated as stale after ${TYPICAL_VALIDITY_DAYS} days`, error ? DASH : formatLongDate(lead.staleAfterISO)],
            ["Copies requested", error ? DASH : String(letter.copies)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && letter.purposeNote ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {letter.purposeNote}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your enrolment details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="bf-name">
              Full name (as in records)
            </label>
            <input id="bf-name" className={INPUT} value={form.studentName} onChange={set("studentName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-roll">
              Roll / registration number
            </label>
            <input id="bf-roll" className={INPUT} value={form.rollNumber} onChange={set("rollNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-course">
              Class / course and year
            </label>
            <input id="bf-course" className={INPUT} value={form.courseOrClass} onChange={set("courseOrClass")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-section">
              Section or division (optional)
            </label>
            <input id="bf-section" className={INPUT} value={form.section} onChange={set("section")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-year">
              Academic year
            </label>
            <input id="bf-year" className={INPUT} value={form.academicYear} onChange={set("academicYear")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-addressee">
              Addressed to
            </label>
            <input id="bf-addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-institution">
              Institution name
            </label>
            <input id="bf-institution" className={INPUT} value={form.institutionName} onChange={set("institutionName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-parent">
              Parent / guardian name (optional)
            </label>
            <input id="bf-parent" className={INPUT} value={form.parentName} onChange={set("parentName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-phone">
              Phone
            </label>
            <input id="bf-phone" className={INPUT} value={form.contactPhone} onChange={set("contactPhone")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bf-email">
              Email
            </label>
            <input id="bf-email" className={INPUT} type="email" value={form.contactEmail} onChange={set("contactEmail")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="bf-address">
            Institution address
          </label>
          <textarea id="bf-address" rows={2} className={AREA} value={form.institutionAddress} onChange={set("institutionAddress")} />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your request letter</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the bonafide certificate request letter"
            onClick={() => copy(letter.error ? "" : letter.body, "letter")}
          >
            {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{letter.wordCount} words</p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {letter.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Institutions set their own bonafide certificate format, fee and
        turnaround — check your student handbook or the administrative office before you rely on the
        dates shown here.
      </p>
    </main>
  );
}
