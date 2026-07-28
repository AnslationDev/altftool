"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import { CONTEXTS, LEAVE_TYPES, buildLeaveLetter } from "../lib";

const DEFAULTS = {
  contextId: "school",
  leaveTypeId: "sick",
  applicantName: "Ananya Sharma",
  identity: "Class 9-B",
  rollNumber: "23",
  institution: "St. Xavier High School",
  recipient: "",
  city: "Pune",
  from: "2026-08-03",
  to: "2026-08-05",
  letterDate: "2026-08-02",
  excludeWeekends: false,
  customReason: "",
  handover: "",
  contactNumber: "",
  attachProof: true,
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

  const context = CONTEXTS.find((entry) => entry.id === form.contextId) ?? CONTEXTS[0];
  const availableTypes = LEAVE_TYPES.filter((entry) => entry.contexts.includes(form.contextId));

  const result = useMemo(() => buildLeaveLetter(form), [form]);

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

  const changeContext = (value) => {
    const nextTypes = LEAVE_TYPES.filter((entry) => entry.contexts.includes(value));
    const keepType = nextTypes.some((entry) => entry.id === form.leaveTypeId)
      ? form.leaveTypeId
      : nextTypes[0].id;
    setForm((current) => ({ ...current, contextId: value, leaveTypeId: keepType }));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Formal letter format
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Leave Application Letter Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the details and get a leave application laid out in the standard format — receiver
          block, date, subject line, salutation, body, close and signature — with the leave days
          counted inclusively.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-context">
              Applying to
            </label>
            <select
              id="leave-context"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.contextId}
              onChange={(event) => changeContext(event.target.value)}
            >
              {CONTEXTS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-type">
              Leave type
            </label>
            <select
              id="leave-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.leaveTypeId}
              onChange={(event) => setField("leaveTypeId", event.target.value)}
            >
              {availableTypes.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-name">
              Your full name
            </label>
            <input
              id="leave-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.applicantName}
              onChange={(event) => setField("applicantName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-identity">
              {context.identityLabel}
            </label>
            <input
              id="leave-identity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder={context.identityPlaceholder}
              value={form.identity}
              onChange={(event) => setField("identity", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-roll">
              {form.contextId === "office" ? "Employee number" : "Roll or enrolment number"}
            </label>
            <input
              id="leave-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.rollNumber}
              onChange={(event) => setField("rollNumber", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-institution">
              {form.contextId === "office" ? "Employer name" : "Institution name"}
            </label>
            <input
              id="leave-institution"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.institution}
              onChange={(event) => setField("institution", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-recipient">
              Addressed to (optional)
            </label>
            <input
              id="leave-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder={context.recipient}
              value={form.recipient}
              onChange={(event) => setField("recipient", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-city">
              City (optional)
            </label>
            <input
              id="leave-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.city}
              onChange={(event) => setField("city", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-from">
              First day of leave
            </label>
            <input
              id="leave-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.from}
              onChange={(event) => setField("from", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-to">
              Last day of leave
            </label>
            <input
              id="leave-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.to}
              onChange={(event) => setField("to", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-date">
              Date on the letter
            </label>
            <input
              id="leave-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={(event) => setField("letterDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leave-contact">
              Contact number while away (optional)
            </label>
            <input
              id="leave-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.contactNumber}
              onChange={(event) => setField("contactNumber", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="leave-handover">
              {form.contextId === "office" ? "Who will cover your work (optional)" : "Who will help you catch up (optional)"}
            </label>
            <input
              id="leave-handover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.handover}
              onChange={(event) => setField("handover", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="leave-reason">
              Reason in your own words (optional — replaces the default wording)
            </label>
            <textarea
              id="leave-reason"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={form.customReason}
              onChange={(event) => setField("customReason", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="leave-weekends" className={CHECK_LABEL}>
            <input
              id="leave-weekends"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.excludeWeekends}
              onChange={(event) => setField("excludeWeekends", event.target.checked)}
            />
            Count working days only
          </label>
          <label htmlFor="leave-proof" className={CHECK_LABEL}>
            <input
              id="leave-proof"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.attachProof}
              onChange={(event) => setField("attachProof", event.target.checked)}
            />
            Mention attached document
          </label>
          <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{context.note}</p>
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
              Days of leave requested
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Calendar days", "Working days", "Subject line", "Word count"].map((label) => (
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
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Days of leave requested
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{result.days.countedDays}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Counted inclusively — both the first and last day count
                </p>
              </div>
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy the leave application letter"
                className={GHOST_BTN}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy letter"}
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Calendar days in the period", String(result.days.calendarDays)],
                ["Working days (Mon-Fri)", String(result.days.workingDays)],
                ["Weekend days in the period", String(result.days.weekendDays)],
                ["Subject line", result.subject],
                ["Salutation and close", `${result.salutation} … ${result.close}`],
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
              <h2 className="text-base font-semibold">Your letter</h2>
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
              Format checklist ({result.completedItems} of {result.totalItems})
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
                  <span className={entry.done ? "" : "text-[var(--muted-foreground)]"}>
                    {entry.item}
                    {entry.done ? "" : " — optional, add it if it applies"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Leave entitlements, notice periods and proof requirements are set by your institution or
        employer, and in workplaces by the applicable shops and establishments or factories rules.
        Check your handbook or HR policy before relying on a particular leave type, and read the
        letter through before sending it.
      </p>
    </main>
  );
}
