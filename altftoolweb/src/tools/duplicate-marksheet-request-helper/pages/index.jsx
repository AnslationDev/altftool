"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileWarning, RotateCcw } from "lucide-react";

import { ADDRESSEE_OPTIONS, REASON_OPTIONS, buildDuplicateMarksheetRequest } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  applicantName: "Rohan Verma",
  parentName: "Suresh Verma",
  rollNumber: "4152873",
  examName: "Class 12 (Senior School Certificate Examination)",
  yearOfExam: "2019",
  boardOrUniversity: "Central Board of Secondary Education",
  officeCity: "Regional Office, Delhi",
  addresseeId: "regional-officer",
  reasonId: "lost",
  firNumber: "",
  letterDate: "2026-07-26",
  contact: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => buildDuplicateMarksheetRequest(form), [form]);
  const hasError = Boolean(result.error);
  const reason = REASON_OPTIONS.find((option) => option.id === form.reasonId);

  const copyText = async (key, text) => {
    if (hasError) return;
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
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileWarning className="h-4 w-4" aria-hidden="true" />
          Document Vault
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Duplicate Marksheet Request Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft the application, the affidavit skeleton and the document checklist for a lost,
          stolen, damaged or destroyed marksheet — the requirements change with the reason.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-name">
              Full name (as on the marksheet)
            </label>
            <input id="dmr-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.applicantName} onChange={set("applicantName")} autoComplete="name" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-parent">
              Parent/guardian name (optional)
            </label>
            <input id="dmr-parent" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.parentName} onChange={set("parentName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-roll">
              Roll / enrolment number
            </label>
            <input id="dmr-roll" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.rollNumber} onChange={set("rollNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-exam">
              Examination name
            </label>
            <input id="dmr-exam" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.examName} onChange={set("examName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-year">
              Year of examination
            </label>
            <input id="dmr-year" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1950" max="2100" value={form.yearOfExam} onChange={set("yearOfExam")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-board">
              Board / university
            </label>
            <input id="dmr-board" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.boardOrUniversity} onChange={set("boardOrUniversity")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-city">
              Office / city line (optional)
            </label>
            <input id="dmr-city" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.officeCity} onChange={set("officeCity")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-addressee">
              Addressed to
            </label>
            <select id="dmr-addressee" className={`mt-2 ${INPUT_CLASS}`} value={form.addresseeId} onChange={set("addresseeId")}>
              {ADDRESSEE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-reason">
              Reason the original is unavailable
            </label>
            <select id="dmr-reason" className={`mt-2 ${INPUT_CLASS}`} value={form.reasonId} onChange={set("reasonId")}>
              {REASON_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {reason?.requiresFir ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="dmr-fir">
                Police complaint / FIR number (optional)
              </label>
              <input id="dmr-fir" className={`mt-2 ${INPUT_CLASS}`} type="text" placeholder="e.g. LR No. 2026/01234" value={form.firNumber} onChange={set("firNumber")} />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-date">
              Letter date
            </label>
            <input id="dmr-date" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dmr-contact">
              Phone / email under signature (optional)
            </label>
            <input id="dmr-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Application letter
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--primary)]">
              {hasError ? "—" : result.subject}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText("letter", result.letter)}
              disabled={hasError}
              aria-label="Copy the duplicate marksheet application letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "letter" ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields to the example values" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Fix the highlighted input above to see the drafted application.
          </p>
        ) : (
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 font-sans text-sm leading-6 text-[var(--foreground)]">
            {result.letter}
          </pre>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-base font-semibold">Affidavit skeleton</h2>
          <button
            type="button"
            onClick={() => copyText("affidavit", result.affidavit)}
            disabled={hasError}
            aria-label="Copy the affidavit skeleton"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied === "affidavit" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "affidavit" ? "Copied!" : "Copy affidavit"}
          </button>
        </div>
        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">—</p>
        ) : (
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 font-sans text-sm leading-6 text-[var(--foreground)]">
            {result.affidavit}
          </pre>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Document checklist for this reason</h2>
        {hasError ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">—</p>
        ) : (
          <>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
              {result.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{result.newspaperNote}</p>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fees, stamp-paper value and forms differ by board, university and state — CBSE, for
        instance, takes duplicate document applications through its DADS portal. This helper is
        informational, not legal advice; have the affidavit reviewed by the notary executing it.
      </p>
    </main>
  );
}
