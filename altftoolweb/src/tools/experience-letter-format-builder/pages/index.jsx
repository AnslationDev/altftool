"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, Printer, RotateCcw } from "lucide-react";

import {
  CONDUCT_LEVELS,
  DOCUMENT_TYPES,
  PRONOUN_SETS,
  buildExperienceLetter,
} from "../lib";

const DEFAULTS = {
  documentTypeId: "experience",
  companyName: "Northwind Technologies Pvt Ltd",
  companyAddress: "4th Floor, Orchid Tower, Bengaluru 560001",
  referenceNumber: "NW/HR/2026/0412",
  issueDate: "2026-08-05",
  employeeName: "Ananya Sharma",
  pronounId: "she",
  employeeId: "EMP-2043",
  designation: "Senior Analyst",
  previousDesignations: "",
  department: "Risk",
  joiningDate: "2019-06-15",
  lastWorkingDay: "2026-08-03",
  conductId: "good",
  duesSettled: true,
  propertyReturned: true,
  reasonForLeaving: "",
  signatoryName: "Priya Nair",
  signatoryDesignation: "Head of Human Resources",
};

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_LABEL =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => buildExperienceLetter(form), [form]);
  const documentType =
    DOCUMENT_TYPES.find((entry) => entry.id === form.documentTypeId) ?? DOCUMENT_TYPES[0];

  const copyResult = async () => {
    if (result.error) return;
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
          <Award className="h-4 w-4" aria-hidden="true" />
          HR document
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Experience Letter Format Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build an experience certificate, a relieving letter or a service certificate. The exact
          period of service is worked out in years, months and days from the joining and leaving
          dates, and a checklist shows what a valid document still needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="el-type">
              Document to issue
            </label>
            <select
              id="el-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.documentTypeId}
              onChange={(event) => setField("documentTypeId", event.target.value)}
            >
              {DOCUMENT_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{documentType.purpose}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-company">
              Company name
            </label>
            <input
              id="el-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.companyName}
              onChange={(event) => setField("companyName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-address">
              Registered address (letterhead line)
            </label>
            <input
              id="el-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.companyAddress}
              onChange={(event) => setField("companyAddress", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-ref">
              Reference number
            </label>
            <input
              id="el-ref"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.referenceNumber}
              onChange={(event) => setField("referenceNumber", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-issue">
              Date of issue
            </label>
            <input
              id="el-issue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.issueDate}
              onChange={(event) => setField("issueDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-name">
              Employee name
            </label>
            <input
              id="el-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.employeeName}
              onChange={(event) => setField("employeeName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-pronoun">
              Pronouns used in the letter
            </label>
            <select
              id="el-pronoun"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.pronounId}
              onChange={(event) => setField("pronounId", event.target.value)}
            >
              {PRONOUN_SETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-empid">
              Employee ID
            </label>
            <input
              id="el-empid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.employeeId}
              onChange={(event) => setField("employeeId", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-designation">
              Designation at the time of leaving
            </label>
            <input
              id="el-designation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.designation}
              onChange={(event) => setField("designation", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-department">
              Department
            </label>
            <input
              id="el-department"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.department}
              onChange={(event) => setField("department", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-joining">
              Date of joining
            </label>
            <input
              id="el-joining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.joiningDate}
              onChange={(event) => setField("joiningDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-last">
              Last working day
            </label>
            <input
              id="el-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.lastWorkingDay}
              onChange={(event) => setField("lastWorkingDay", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-conduct">
              Conduct wording
            </label>
            <select
              id="el-conduct"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.conductId}
              onChange={(event) => setField("conductId", event.target.value)}
              disabled={!documentType.needsConduct}
            >
              {CONDUCT_LEVELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-signatory">
              Authorised signatory
            </label>
            <input
              id="el-signatory"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.signatoryName}
              onChange={(event) => setField("signatoryName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-signatory-role">
              Signatory designation
            </label>
            <input
              id="el-signatory-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.signatoryDesignation}
              onChange={(event) => setField("signatoryDesignation", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="el-previous">
              Earlier positions during the same employment (optional)
            </label>
            <input
              id="el-previous"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Analyst (2019-2022)"
              value={form.previousDesignations}
              onChange={(event) => setField("previousDesignations", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="el-reason">
              Reason for leaving (optional)
            </label>
            <input
              id="el-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="her resignation dated 3 June 2026"
              value={form.reasonForLeaving}
              onChange={(event) => setField("reasonForLeaving", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="el-dues" className={CHECK_LABEL}>
            <input
              id="el-dues"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.duesSettled}
              onChange={(event) => setField("duesSettled", event.target.checked)}
              disabled={!documentType.needsDues}
            />
            Dues settled
          </label>
          <label htmlFor="el-property" className={CHECK_LABEL}>
            <input
              id="el-property"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.propertyReturned}
              onChange={(event) => setField("propertyReturned", event.target.checked)}
              disabled={!documentType.needsDues}
            />
            Company property returned
          </label>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className={GHOST_BTN}
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print
          </button>
          <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total period of service
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Total days", "Total months", "Document", "Word count"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <div aria-live="polite" role="status">
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Total period of service
                </p>
                <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{result.tenure.label}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Calendar difference between joining and last working day
                </p>
              </div>
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy the experience letter"
                className={GHOST_BTN}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy letter"}
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Years / months / days", `${result.tenure.years} / ${result.tenure.months} / ${result.tenure.days}`],
                ["Total days inclusive", String(result.tenure.totalDays)],
                ["Completed months", String(result.tenure.totalMonths)],
                ["Document", result.documentType.label],
                ["Word count", String(result.wordCount)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">{result.documentType.label}</h2>
              <button type="button" onClick={copyResult} className={PRIMARY_BTN}>
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.letter}
            </pre>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              Validity checklist ({result.completedItems} of {result.totalItems})
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.checklist.map((entry) => (
                <li key={entry.item} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      entry.done
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-[var(--border)] text-[var(--muted-foreground)]"
                    }`}
                    aria-hidden="true"
                  >
                    {entry.done ? "✓" : ""}
                  </span>
                  <span className={entry.done ? "" : "text-[var(--muted-foreground)]"}>{entry.item}</span>
                </li>
              ))}
            </ul>
          </section>
          </div>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Which document is being asked for?</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Document</th>
                    <th scope="col" className="py-2 font-semibold">What it confirms</th>
                  </tr>
                </thead>
                <tbody>
                  {DOCUMENT_TYPES.map((entry) => (
                    <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{entry.label}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{entry.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. A document like this must be issued on company
        letterhead by an authorised signatory and must state only what the employer can stand behind
        — issuing a certificate for employment that did not happen is a serious matter. Several state
        Shops and Establishments Acts require a service certificate on termination; check the Act
        that applies to your establishment.
      </p>
    </main>
  );
}
