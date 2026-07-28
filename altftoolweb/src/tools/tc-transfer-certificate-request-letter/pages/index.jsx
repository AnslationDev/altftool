"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileOutput, RotateCcw } from "lucide-react";

import {
  MAX_SCHOOL_CLASS,
  PRONOUN_SETS,
  RTE_ELEMENTARY_MAX_CLASS,
  RTE_MAX_AGE_YEARS,
  RTE_MIN_AGE_YEARS,
  TRANSFER_REASONS,
  assessTransfer,
  buildTcRequestLetter,
  formatLongDate,
  reasonById,
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

const RELATIONS = [
  ["son", "My son"],
  ["daughter", "My daughter"],
  ["ward", "My ward"],
  ["self", "Myself (I am the student)"],
];

const DEFAULTS = {
  studentName: "Ishaan Verma",
  admissionNumber: "2019/1184",
  classNumber: "7",
  section: "A",
  academicYear: "2026-27",
  schoolName: "St. Xavier's High School",
  schoolAddress: "Sector 21, Noida, Uttar Pradesh 201301",
  addressee: "The Principal",
  relationKey: "son",
  reasonId: "job-transfer",
  newPlace: "Bengaluru",
  newSchoolName: "National Public School, Indiranagar",
  reasonDetail: "",
  dob: "2014-05-20",
  lastAttendance: "2026-08-07",
  letterDate: "2026-07-28",
  neededBy: "2026-08-10",
  parentName: "Mrs. Anita Verma",
  contactPhone: "99xxxxxx08",
  contactEmail: "anita.verma@example.com",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [duesCleared, setDuesCleared] = useState(true);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const assessment = useMemo(
    () =>
      assessTransfer({
        dobISO: form.dob,
        letterDateISO: form.letterDate,
        neededByISO: form.neededBy,
        classNumber: Number(form.classNumber),
      }),
    [form.dob, form.letterDate, form.neededBy, form.classNumber],
  );

  const letter = useMemo(
    () =>
      buildTcRequestLetter({
        studentName: form.studentName,
        admissionNumber: form.admissionNumber,
        classNumber: Number(form.classNumber),
        section: form.section,
        academicYear: form.academicYear,
        schoolName: form.schoolName,
        schoolAddress: form.schoolAddress,
        addressee: form.addressee,
        relationKey: form.relationKey,
        reasonId: form.reasonId,
        newPlace: form.newPlace,
        newSchoolName: form.newSchoolName,
        reasonDetail: form.reasonDetail,
        lastAttendanceISO: form.lastAttendance,
        letterDateISO: form.letterDate,
        neededByISO: form.neededBy,
        parentName: form.parentName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        duesCleared,
        assessment,
      }),
    [form, duesCleared, assessment],
  );

  const error = assessment.error || letter.error || "";
  const reason = reasonById(form.reasonId);

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
    setDuesCleared(true);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileOutput className="h-4 w-4" aria-hidden="true" />
          Letter format
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Transfer Certificate Request Letter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the student&apos;s class, admission number and date of birth. The tool works out
          whether the RTE Act&apos;s immediate-issue rule covers the child, then drafts the TC
          request with the right section cited.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Student and dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="tc-relation">
              Who is the TC for?
            </label>
            <select id="tc-relation" className={INPUT} value={form.relationKey} onChange={set("relationKey")}>
              {RELATIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-class">
              Class (1 to {MAX_SCHOOL_CLASS})
            </label>
            <input
              id="tc-class"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_SCHOOL_CLASS}
              step="1"
              value={form.classNumber}
              onChange={set("classNumber")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-dob">
              Date of birth
            </label>
            <input id="tc-dob" className={INPUT} type="date" value={form.dob} onChange={set("dob")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-letter-date">
              Date of this letter
            </label>
            <input id="tc-letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-last-day">
              Last day of attendance
            </label>
            <input id="tc-last-day" className={INPUT} type="date" value={form.lastAttendance} onChange={set("lastAttendance")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-needed-by">
              New school needs it by
            </label>
            <input id="tc-needed-by" className={INPUT} type="date" value={form.neededBy} onChange={set("neededBy")} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="tc-reason">
              Reason for the transfer
            </label>
            <select id="tc-reason" className={INPUT} value={form.reasonId} onChange={set("reasonId")}>
              {TRANSFER_REASONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {reason.needsPlace ? (
            <div>
              <label className={LABEL} htmlFor="tc-place">
                New city or town
              </label>
              <input id="tc-place" className={INPUT} value={form.newPlace} onChange={set("newPlace")} />
            </div>
          ) : null}
          <div>
            <label className={LABEL} htmlFor="tc-new-school">
              New school or college
            </label>
            <input id="tc-new-school" className={INPUT} value={form.newSchoolName} onChange={set("newSchoolName")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="tc-reason-detail">
              {form.reasonId === "other" ? "Describe the reason" : "Anything to add (optional)"}
            </label>
            <textarea id="tc-reason-detail" rows={2} className={AREA} value={form.reasonDetail} onChange={set("reasonDetail")} />
          </div>
        </div>

        <label
          htmlFor="tc-dues"
          className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
        >
          <input
            id="tc-dues"
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
            checked={duesCleared}
            onChange={(event) => setDuesCleared(event.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold">All fees and dues are cleared</span>
            <span className="block text-xs text-[var(--muted-foreground)]">
              Untick this and the letter asks the school to state what is outstanding instead.
            </span>
          </span>
        </label>
      </section>

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Age on the date of the letter
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? DASH : assessment.ageText}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the details above."
                : assessment.rteApplies
                  ? "RTE section 5(3) applies — the school must issue the TC immediately."
                  : "Outside the RTE age or class range — the board and school rules govern the timeline."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the transfer certificate position summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Transfer certificate request",
                        `Class: ${assessment.classNumber}`,
                        `Age on letter date: ${assessment.ageText}`,
                        `RTE s.5(3) immediate issue applies: ${assessment.rteApplies ? "yes" : "no"}`,
                        `Needed by: ${formatLongDate(form.neededBy)} (${assessment.daysUntilNeeded} days away)`,
                        `Follow up after: ${formatLongDate(assessment.followUpISO)}`,
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
            [
              `In elementary education (class 1 to ${RTE_ELEMENTARY_MAX_CLASS})`,
              error ? DASH : assessment.inElementary ? "Yes" : "No",
            ],
            [
              `In the RTE age band (${RTE_MIN_AGE_YEARS} to under ${RTE_MAX_AGE_YEARS})`,
              error ? DASH : assessment.inRteAge ? "Yes" : "No",
            ],
            ["Days until the new school needs it", error ? DASH : `${assessment.daysUntilNeeded} days`],
            ["Send a written reminder after", error ? DASH : formatLongDate(assessment.followUpISO)],
            ["If it is refused, escalate to", error ? DASH : assessment.escalation],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Names and contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="tc-student">
              Student&apos;s full name
            </label>
            <input id="tc-student" className={INPUT} value={form.studentName} onChange={set("studentName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-admission">
              Admission number
            </label>
            <input id="tc-admission" className={INPUT} value={form.admissionNumber} onChange={set("admissionNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-section">
              Section (optional)
            </label>
            <input id="tc-section" className={INPUT} value={form.section} onChange={set("section")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-academic-year">
              Academic year
            </label>
            <input id="tc-academic-year" className={INPUT} value={form.academicYear} onChange={set("academicYear")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-school">
              Current school name
            </label>
            <input id="tc-school" className={INPUT} value={form.schoolName} onChange={set("schoolName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-addressee">
              Addressed to
            </label>
            <input id="tc-addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-parent">
              Parent / guardian name
            </label>
            <input id="tc-parent" className={INPUT} value={form.parentName} onChange={set("parentName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="tc-phone">
              Phone
            </label>
            <input id="tc-phone" className={INPUT} value={form.contactPhone} onChange={set("contactPhone")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="tc-email">
              Email
            </label>
            <input id="tc-email" className={INPUT} type="email" value={form.contactEmail} onChange={set("contactEmail")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="tc-school-address">
            School address
          </label>
          <textarea id="tc-school-address" rows={2} className={AREA} value={form.schoolAddress} onChange={set("schoolAddress")} />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your TC request letter</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the transfer certificate request letter"
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
        Informational only, not legal advice. Boards, universities and state education departments
        add their own TC and migration certificate rules on top of the RTE Act. If a school refuses
        or withholds a transfer certificate, take it up with the education officer for your block or
        district.
      </p>
    </main>
  );
}
