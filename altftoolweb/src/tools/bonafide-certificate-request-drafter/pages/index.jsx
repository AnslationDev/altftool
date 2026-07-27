"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileBadge, RotateCcw } from "lucide-react";

import { ADDRESSEE_OPTIONS, PURPOSE_OPTIONS, buildBonafideRequest } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  studentName: "Aarav Sharma",
  parentName: "Rajesh Sharma",
  rollNumber: "21CSE1042",
  course: "B.Tech Computer Science and Engineering",
  yearOrSemester: "3rd year (Semester VI)",
  institutionName: "Government Engineering College",
  institutionCity: "Bhopal, Madhya Pradesh",
  addresseeId: "principal",
  purposeId: "passport",
  customPurpose: "",
  letterDate: "2026-07-26",
  contact: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => buildBonafideRequest(form), [form]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileBadge className="h-4 w-4" aria-hidden="true" />
          Document Vault
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bonafide Certificate Request Drafter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in your details and purpose to get a ready-to-submit application to your Principal or
          Registrar in the standard Indian formal-letter format.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-name">
              Student's full name
            </label>
            <input
              id="bcr-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.studentName}
              onChange={set("studentName")}
              autoComplete="name"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-parent">
              Parent/guardian name (optional)
            </label>
            <input
              id="bcr-parent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.parentName}
              onChange={set("parentName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-roll">
              Roll / enrolment number
            </label>
            <input
              id="bcr-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.rollNumber}
              onChange={set("rollNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-course">
              Class / course and branch
            </label>
            <input
              id="bcr-course"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.course}
              onChange={set("course")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-stage">
              Year / semester / section (optional)
            </label>
            <input
              id="bcr-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.yearOrSemester}
              onChange={set("yearOrSemester")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-institution">
              Institution name
            </label>
            <input
              id="bcr-institution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.institutionName}
              onChange={set("institutionName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-city">
              Institution city (optional)
            </label>
            <input
              id="bcr-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.institutionCity}
              onChange={set("institutionCity")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-addressee">
              Addressed to
            </label>
            <select
              id="bcr-addressee"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.addresseeId}
              onChange={set("addresseeId")}
            >
              {ADDRESSEE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-purpose">
              Purpose of the certificate
            </label>
            <select
              id="bcr-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.purposeId}
              onChange={set("purposeId")}
            >
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {form.purposeId === "other" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="bcr-custom">
                Describe your purpose
              </label>
              <input
                id="bcr-custom"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder="e.g. submitting to my employer for a fee reimbursement claim"
                value={form.customPurpose}
                onChange={set("customPurpose")}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-date">
              Letter date
            </label>
            <input
              id="bcr-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={set("letterDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bcr-contact">
              Phone / email under signature (optional)
            </label>
            <input
              id="bcr-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contact}
              onChange={set("contact")}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your application letter
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--primary)]">
              {hasError ? "—" : result.subject}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the drafted bonafide certificate request letter"
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
              aria-label="Reset all fields to the example values"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Fix the highlighted input above to see the drafted letter.
          </p>
        ) : (
          <>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 font-sans text-sm leading-6 text-[var(--foreground)]">
              {result.letter}
            </pre>
            <dl className="mt-4 text-sm">
              <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <dt className="shrink-0 font-semibold text-[var(--muted-foreground)]">
                  Tip for this purpose
                </dt>
                <dd className="text-[var(--foreground)] sm:text-right">{result.purposeNote}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Institutions may have their own application form or a small processing fee — check with the
        office before submitting. This drafter produces a general-purpose letter and is
        informational, not legal advice.
      </p>
    </main>
  );
}
