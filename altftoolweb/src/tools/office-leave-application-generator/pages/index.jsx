"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  EARNED_LEAVE_QUALIFYING_DAYS,
  LEAVE_KINDS,
  buildOfficeLeave,
  earnedLeaveEntitlement,
} from "../lib";

const DEFAULTS = {
  kindId: "earned",
  channelId: "email",
  employeeName: "R Menon",
  designation: "Senior Analyst",
  employeeId: "EMP-2043",
  department: "Risk",
  managerName: "Priya Nair",
  companyName: "Northwind Pvt Ltd",
  from: "2026-08-03",
  to: "2026-08-07",
  applicationDate: "2026-07-20",
  customReason: "",
  handover: "Kabir Shah",
  contactNumber: "",
  attachProof: false,
  countWorkingDaysOnly: true,
  openingBalance: "12",
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

const NOTICE_TONE = {
  ok: "bg-[var(--muted)] text-[var(--foreground)]",
  short: "bg-[var(--danger-soft)] text-[var(--danger)]",
  late: "bg-[var(--danger-soft)] text-[var(--danger)]",
  retrospective: "bg-[var(--muted)] text-[var(--foreground)]",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [daysWorked, setDaysWorked] = useState("250");
  const [youngPerson, setYoungPerson] = useState(false);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => buildOfficeLeave(form), [form]);
  const kind = LEAVE_KINDS.find((entry) => entry.id === form.kindId) ?? LEAVE_KINDS[0];
  const accrual = useMemo(
    () => earnedLeaveEntitlement({ daysWorked: Number(daysWorked), youngPerson }),
    [daysWorked, youngPerson],
  );

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
    setDaysWorked("250");
    setYoungPerson(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Workplace leave
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Office Leave Application Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft a casual, earned, sick or emergency leave application with the dates, the handover
          plan and a contact number. The notice period is checked against what the leave type
          normally expects, and your remaining balance is worked out for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-kind">
              Leave type
            </label>
            <select
              id="ol-kind"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.kindId}
              onChange={(event) => setField("kindId", event.target.value)}
            >
              {LEAVE_KINDS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-channel">
              Sending as
            </label>
            <select
              id="ol-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.channelId}
              onChange={(event) => setField("channelId", event.target.value)}
            >
              {CHANNELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-name">
              Your name
            </label>
            <input
              id="ol-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.employeeName}
              onChange={(event) => setField("employeeName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-designation">
              Designation
            </label>
            <input
              id="ol-designation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.designation}
              onChange={(event) => setField("designation", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-empid">
              Employee ID
            </label>
            <input
              id="ol-empid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.employeeId}
              onChange={(event) => setField("employeeId", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-department">
              Team or department
            </label>
            <input
              id="ol-department"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.department}
              onChange={(event) => setField("department", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-manager">
              Manager&apos;s name (for the email greeting)
            </label>
            <input
              id="ol-manager"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.managerName}
              onChange={(event) => setField("managerName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-company">
              Employer name
            </label>
            <input
              id="ol-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.companyName}
              onChange={(event) => setField("companyName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-from">
              First day of leave
            </label>
            <input
              id="ol-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.from}
              onChange={(event) => setField("from", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-to">
              Last day of leave
            </label>
            <input
              id="ol-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.to}
              onChange={(event) => setField("to", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-applied">
              Date you are applying
            </label>
            <input
              id="ol-applied"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.applicationDate}
              onChange={(event) => setField("applicationDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-balance">
              Current balance of this leave type (optional)
            </label>
            <input
              id="ol-balance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.openingBalance}
              onChange={(event) => setField("openingBalance", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-handover">
              Who will cover your work
            </label>
            <input
              id="ol-handover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.handover}
              onChange={(event) => setField("handover", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-contact">
              Contact number while away (optional)
            </label>
            <input
              id="ol-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.contactNumber}
              onChange={(event) => setField("contactNumber", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ol-reason">
              Reason in your own words (optional)
            </label>
            <textarea
              id="ol-reason"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={form.customReason}
              onChange={(event) => setField("customReason", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="ol-working" className={CHECK_LABEL}>
            <input
              id="ol-working"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.countWorkingDaysOnly}
              onChange={(event) => setField("countWorkingDaysOnly", event.target.checked)}
            />
            Deduct working days only
          </label>
          <label htmlFor="ol-proof" className={CHECK_LABEL}>
            <input
              id="ol-proof"
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
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{kind.note}</p>
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
              Days deducted from balance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Calendar days", "Notice given", "Balance after this leave", "Subject line"].map((label) => (
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
                  Days deducted from balance
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{result.daysApplied}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {form.countWorkingDaysOnly ? "Working days" : "Calendar days"} · both first and last
                  day counted
                </p>
              </div>
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy the leave application"
                className={GHOST_BTN}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy application"}
              </button>
            </div>

            <div
              className={`mt-4 rounded-md px-3 py-2 text-sm ${NOTICE_TONE[result.notice.status] || NOTICE_TONE.ok}`}
              role="status"
            >
              {result.notice.message}
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Calendar days in the period", String(result.period.calendarDays)],
                ["Working days (Mon-Fri)", String(result.period.workingDays)],
                ["Notice given", `${result.notice.noticeDays} day${result.notice.noticeDays === 1 ? "" : "s"}`],
                [
                  "Balance after this leave",
                  result.balance
                    ? result.balance.overdrawn
                      ? `Short by ${result.balance.shortfall} day${result.balance.shortfall === 1 ? "" : "s"}`
                      : `${result.balance.closing} day${result.balance.closing === 1 ? "" : "s"}`
                    : "Not entered",
                ],
                ["Subject line", result.subject],
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
              <h2 className="text-base font-semibold">Your application</h2>
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
              Checklist ({result.completedItems} of {result.totalItems})
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
        </>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Earned leave accrual (Factories Act 1948, s.79)</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Where the Factories Act applies, a worker who completes {EARNED_LEAVE_QUALIFYING_DAYS} days
          of work in a calendar year earns leave in the next year at one day per 20 days worked (one
          per 15 for workers under 18).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ol-worked">
              Days worked last calendar year
            </label>
            <input
              id="ol-worked"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="366"
              value={daysWorked}
              onChange={(event) => setDaysWorked(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label htmlFor="ol-young" className={CHECK_LABEL}>
              <input
                id="ol-young"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={youngPerson}
                onChange={(event) => setYoungPerson(event.target.checked)}
              />
              Worker is under 18
            </label>
          </div>
        </div>
        {accrual.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {accrual.error}
          </p>
        ) : (
          <p className="mt-4 text-sm">
            <span className="text-2xl font-semibold text-[var(--primary)]">{accrual.days}</span>{" "}
            day{accrual.days === 1 ? "" : "s"} of earned leave. {accrual.note}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Casual and sick leave entitlements come from the state
        Shops and Establishments Act that applies to your workplace and from your employer&apos;s own
        policy, so the notice periods shown here are common practice rather than law. Check your
        employee handbook, and take professional advice for anything contested.
      </p>
    </main>
  );
}
