"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText, TriangleAlert } from "lucide-react";

import { GAP_REASONS, RELATIONS, buildGapAffidavit } from "../lib";

const todayIso = () => new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  deponentName: "Rahul Verma",
  relation: "son",
  parentName: "Suresh Verma",
  age: "20",
  address: "14 Ashok Vihar, Delhi 110052",
  lastExam: "Class XII",
  board: "CBSE",
  passingSession: "May 2024",
  rollNumber: "",
  reasonId: "medical",
  reasonDetail: "",
  targetCourse: "B.Sc. (Hons) Physics",
  targetInstitution: "",
  place: "Delhi",
  gapStart: "2024-06-01",
  gapEnd: "2025-07-15",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [affidavitDate, setAffidavitDate] = useState(() => todayIso());
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const affidavit = useMemo(
    () =>
      buildGapAffidavit({
        deponentName: form.deponentName,
        relation: form.relation,
        parentName: form.parentName,
        age: toNumber(form.age),
        address: form.address,
        lastExam: form.lastExam,
        board: form.board,
        passingSession: form.passingSession,
        rollNumber: form.rollNumber,
        gapStart: form.gapStart,
        gapEnd: form.gapEnd,
        reasonId: form.reasonId,
        reasonDetail: form.reasonDetail,
        targetCourse: form.targetCourse,
        targetInstitution: form.targetInstitution,
        place: form.place,
        affidavitDate,
      }),
    [form, affidavitDate],
  );

  const hasError = Boolean(affidavit.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(affidavit.affidavitText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setAffidavitDate(todayIso());
    setCopied(false);
  };

  const facts = hasError
    ? [
        ["Deponent", DASH],
        ["Gap period", DASH],
        ["Length of gap", DASH],
        ["Reason", DASH],
        ["Last examination", DASH],
        ["Applying for", DASH],
        ["Executed at", DASH],
        ["Dated", DASH],
      ]
    : affidavit.keyFacts;

  const isOther = form.reasonId === "other";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Affidavit formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gap Year Affidavit Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the dates and the reason for your break in studies, and get the standard eight-clause
          gap affidavit with its verification wording and a notarisation checklist.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The deponent</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-name">
              Student&apos;s full name
            </label>
            <input
              id="gya-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.deponentName}
              onChange={setField("deponentName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-relation">
              Relationship line
            </label>
            <select
              id="gya-relation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.relation}
              onChange={setField("relation")}
            >
              {RELATIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-parent">
              Parent or guardian&apos;s name
            </label>
            <input
              id="gya-parent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.parentName}
              onChange={setField("parentName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-age">
              Age (years)
            </label>
            <input
              id="gya-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="1"
              value={form.age}
              onChange={setField("age")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gya-address">
              Residential address
            </label>
            <input
              id="gya-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.address}
              onChange={setField("address")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Study record and the gap</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-exam">
              Last examination passed
            </label>
            <input
              id="gya-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.lastExam}
              onChange={setField("lastExam")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-board">
              Board or university
            </label>
            <input
              id="gya-board"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.board}
              onChange={setField("board")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-session">
              Month and year of passing
            </label>
            <input
              id="gya-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.passingSession}
              onChange={setField("passingSession")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-roll">
              Roll / enrolment number
            </label>
            <input
              id="gya-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.rollNumber}
              onChange={setField("rollNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-start">
              Gap started on
            </label>
            <input
              id="gya-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.gapStart}
              onChange={setField("gapStart")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-end">
              Gap ended on
            </label>
            <input
              id="gya-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.gapEnd}
              onChange={setField("gapEnd")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gya-reason">
              Reason for the gap
            </label>
            <select
              id="gya-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.reasonId}
              onChange={setField("reasonId")}
            >
              {GAP_REASONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          {isOther && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="gya-reason-detail">
                Write the reason in your own words
              </label>
              <textarea
                id="gya-reason-detail"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                placeholder="I was &hellip;"
                value={form.reasonDetail}
                onChange={setField("reasonDetail")}
              />
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Admission and execution</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-course">
              Course applied for
            </label>
            <input
              id="gya-course"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.targetCourse}
              onChange={setField("targetCourse")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-institution">
              Institution applied to
            </label>
            <input
              id="gya-institution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.targetInstitution}
              onChange={setField("targetInstitution")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-place">
              Place of execution
            </label>
            <input
              id="gya-place"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.place}
              onChange={setField("place")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gya-date">
              Date of the affidavit
            </label>
            <input
              id="gya-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={affidavitDate}
              onChange={(event) => {
                setAffidavitDate(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {affidavit.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Length of the gap
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : affidavit.gapLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the affidavit."
                : `${affidavit.gapStartLabel} to ${affidavit.gapEndLabel} · ${affidavit.clauses.length} clauses`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the affidavit text"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy affidavit"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && affidavit.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Check these before you print it
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {affidavit.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]"
                />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your affidavit</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-[var(--muted-foreground)]">
              {affidavit.affidavitText}
            </pre>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to carry to the notary and the college</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {affidavit.checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Print the affidavit on non-judicial stamp paper of the value your state and institution
            require — commonly between Rs {affidavit.stampPaperRange.min} and Rs{" "}
            {affidavit.stampPaperRange.max}, because affidavit stamp duty is fixed by each state&apos;s
            Stamp Act schedule rather than nationally. Sign it only in the presence of the notary or
            oath commissioner.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. An affidavit is a sworn statement and a false
        declaration carries legal consequences, so state only what is true. Institutions vary in the
        wording and stamp value they accept — confirm with the admission office, and consult a lawyer
        or notary if anything is unclear.
      </p>
    </main>
  );
}
