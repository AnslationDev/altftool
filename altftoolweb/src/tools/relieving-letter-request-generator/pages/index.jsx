"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck, RotateCcw } from "lucide-react";

import {
  DOCUMENT_ITEMS,
  GRATUITY_PAYMENT_DAYS,
  TYPICAL_FNF_DAYS,
  WAGES_SETTLEMENT_WORKING_DAYS,
  buildRelievingRequest,
  computeExitStatus,
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

const DEFAULT_DOCS = ["relieving", "experience", "fnf", "form16", "pf-exit"];

const DEFAULTS = {
  employeeName: "Priya Nair",
  employeeId: "EMP-4821",
  designation: "Senior Analyst",
  department: "Risk",
  companyName: "Northbridge Services Pvt. Ltd.",
  addressee: "The Head of Human Resources",
  joiningDate: "2019-06-15",
  lastWorkingDay: "2026-08-31",
  letterDate: "2026-09-20",
  reminderCount: "0",
  personalEmail: "priya.nair@example.com",
  personalPhone: "98xxxxxx77",
  postalAddress: "Flat 12, Park Residency, Pune 411005",
  extraNotes: "",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : 0;
};

const TONE_COPY = {
  polite: "Still within the usual settlement window — a straightforward request.",
  firm: `Past the ${TYPICAL_FNF_DAYS}-day window most employers work to — the letter now reads as a reminder.`,
  final: "Well overdue — the letter escalates and names the labour authorities.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [docs, setDocs] = useState(DEFAULT_DOCS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleDoc = (id) =>
    setDocs((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const status = useMemo(
    () =>
      computeExitStatus({
        joiningDateISO: form.joiningDate,
        lastWorkingDayISO: form.lastWorkingDay,
        todayISO: form.letterDate,
      }),
    [form.joiningDate, form.lastWorkingDay, form.letterDate],
  );

  const letter = useMemo(
    () =>
      buildRelievingRequest({
        employeeName: form.employeeName,
        employeeId: form.employeeId,
        designation: form.designation,
        department: form.department,
        companyName: form.companyName,
        addressee: form.addressee,
        joiningDateISO: form.joiningDate,
        lastWorkingDayISO: form.lastWorkingDay,
        letterDateISO: form.letterDate,
        requestedDocIds: docs,
        reminderCount: toNumber(form.reminderCount),
        personalEmail: form.personalEmail,
        personalPhone: form.personalPhone,
        postalAddress: form.postalAddress,
        extraNotes: form.extraNotes,
        status,
      }),
    [form, docs, status],
  );

  const error = status.error || letter.error || "";

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
    setDocs(DEFAULT_DOCS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileCheck className="h-4 w-4" aria-hidden="true" />
          Exit documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Relieving Letter Request Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your joining date and last working day. The tool computes your exact tenure, the
          statutory settlement deadlines, and how overdue the employer is — then writes the request in
          a tone that matches how long you have waited.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Employment dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="joining-date">Date of joining</label>
            <input id="joining-date" className={INPUT} type="date" value={form.joiningDate} onChange={set("joiningDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="last-day">Last working day</label>
            <input id="last-day" className={INPUT} type="date" value={form.lastWorkingDay} onChange={set("lastWorkingDay")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="letter-date">Date of this letter</label>
            <input id="letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="reminder-count">Reminders already sent</label>
            <input id="reminder-count" className={INPUT} type="number" inputMode="numeric" min="0" step="1"
              value={form.reminderCount} onChange={set("reminderCount")} />
          </div>
        </div>
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
              Total service to state in the letter
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? "—" : status.tenureText}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the dates above." : `${status.elapsedDays} days since your last working day. ${TONE_COPY[status.tone]}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} aria-label="Copy the tenure and deadline summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Exit document status",
                        `Total service: ${status.tenureText} (${status.serviceDays} days)`,
                        `Wages were due by: ${formatLongDate(status.wagesDueISO)}`,
                        `Gratuity due by: ${formatLongDate(status.gratuityDueISO)}`,
                        `Days since last working day: ${status.elapsedDays}`,
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
            ["Service in days", error ? "—" : `${status.serviceDays} days`],
            [`Wages due (${WAGES_SETTLEMENT_WORKING_DAYS} working days after exit)`, error ? "—" : formatLongDate(status.wagesDueISO)],
            [`Gratuity due (${GRATUITY_PAYMENT_DAYS} days after exit)`, error ? "—" : formatLongDate(status.gratuityDueISO)],
            ["Typical settlement window ends", error ? "—" : formatLongDate(status.typicalFnfISO)],
            ["Wages overdue by", error ? "—" : `${status.wagesOverdueBy} days`],
            [
              "Gratuity position",
              error
                ? "—"
                : status.gratuityEligible
                  ? "Eligible — five years of continuous service completed"
                  : status.gratuityBorderline
                    ? "Borderline — under five years, but past four years and 240 days"
                    : "Not eligible on length of service",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What to ask for</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Tick everything still pending.</p>
        <div className="mt-4 grid gap-3">
          {DOCUMENT_ITEMS.map((item) => (
            <label key={item.id} htmlFor={`doc-${item.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <input id={`doc-${item.id}`} type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={docs.includes(item.id)} onChange={() => toggleDoc(item.id)} />
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{item.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="employee-name">Your name</label>
            <input id="employee-name" className={INPUT} value={form.employeeName} onChange={set("employeeName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="employee-id">Employee ID</label>
            <input id="employee-id" className={INPUT} value={form.employeeId} onChange={set("employeeId")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="designation">Designation held</label>
            <input id="designation" className={INPUT} value={form.designation} onChange={set("designation")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="department">Department</label>
            <input id="department" className={INPUT} value={form.department} onChange={set("department")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="company-name">Company name</label>
            <input id="company-name" className={INPUT} value={form.companyName} onChange={set("companyName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="addressee">Addressed to</label>
            <input id="addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="personal-email">Personal email</label>
            <input id="personal-email" className={INPUT} type="email" value={form.personalEmail} onChange={set("personalEmail")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="personal-phone">Phone</label>
            <input id="personal-phone" className={INPUT} value={form.personalPhone} onChange={set("personalPhone")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="postal-address">Postal address for the hard copy</label>
          <input id="postal-address" className={INPUT} value={form.postalAddress} onChange={set("postalAddress")} />
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="extra-notes">Your own paragraph (optional)</label>
          <textarea id="extra-notes" rows={3} className={AREA} value={form.extraNotes} onChange={set("extraNotes")}
            placeholder="Laptop and access card returned to IT on 29 August; no-dues signed by all four departments." />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your request letter</h2>
          <button type="button" className={PRIMARY_BTN} aria-label="Copy the relieving letter request"
            onClick={() => copy(letter.error ? "" : letter.body, "letter")}>
            {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        {letter.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {letter.error}
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
        Informational only, not legal advice. No central statute mandates a document called a
        relieving letter, though several state Shops and Establishments Acts require a service
        certificate on request. For a withheld settlement or gratuity, speak to a labour lawyer or
        the jurisdictional Labour Commissioner.
      </p>
    </main>
  );
}
