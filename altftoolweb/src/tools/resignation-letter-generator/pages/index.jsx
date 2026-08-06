"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LogOut, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  DEFAULT_BUYOUT_DIVISOR,
  NOTICE_PRESETS,
  REASONS,
  TONES,
  buildResignationLetter,
  noticeBuyout,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DEFAULTS = {
  employeeName: "R Menon",
  designation: "Senior Analyst",
  employeeId: "EMP-2043",
  department: "Risk",
  companyName: "Northwind Pvt Ltd",
  managerName: "Priya Nair",
  resignationDate: "2026-08-03",
  noticeDays: "60",
  countWorkingDays: false,
  proposedLastDay: "",
  toneId: "standard",
  reasonId: "none",
  customReason: "",
  handoverTo: "Kabir Shah",
  handoverNotes: "",
  requestExperienceLetter: true,
  offerFlexibility: true,
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
  const [salary, setSalary] = useState("90000");
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () => buildResignationLetter({ ...form, noticeDays: Number(form.noticeDays) }),
    [form],
  );

  const buyout = useMemo(() => {
    if (result.error || result.shortfall.shortfallDays === 0) return null;
    return noticeBuyout({
      monthlySalary: Number(salary),
      shortfallDays: result.shortfall.shortfallDays,
      divisor: DEFAULT_BUYOUT_DIVISOR,
    });
  }, [result, salary]);

  const copyResult = () => {
    if (result.error) return;
    copyToClipboard("letter", result.letter, { label: "resignation letter" });
  };

  const reset = () => {
    setForm(DEFAULTS);
    setSalary("90000");
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Notice and handover
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Resignation Letter Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your notice period and the letter works out your last working day, states the
          handover, and asks for the relieving letter and settlement. If you want to leave earlier,
          it shows exactly how many days short you are.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-name">
              Your name
            </label>
            <input
              id="rl-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.employeeName}
              onChange={(event) => setField("employeeName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-designation">
              Designation
            </label>
            <input
              id="rl-designation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.designation}
              onChange={(event) => setField("designation", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-empid">
              Employee ID
            </label>
            <input
              id="rl-empid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.employeeId}
              onChange={(event) => setField("employeeId", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-department">
              Team or department
            </label>
            <input
              id="rl-department"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.department}
              onChange={(event) => setField("department", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-company">
              Employer name
            </label>
            <input
              id="rl-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.companyName}
              onChange={(event) => setField("companyName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-manager">
              Manager&apos;s name (optional)
            </label>
            <input
              id="rl-manager"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.managerName}
              onChange={(event) => setField("managerName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-date">
              Date you are resigning
            </label>
            <input
              id="rl-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.resignationDate}
              onChange={(event) => setField("resignationDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-notice">
              Notice period
            </label>
            <select
              id="rl-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.noticeDays}
              onChange={(event) => setField("noticeDays", event.target.value)}
            >
              {NOTICE_PRESETS.map((entry) => (
                <option key={entry.id} value={String(entry.days)}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-proposed">
              Last day you want (blank = full notice)
            </label>
            <input
              id="rl-proposed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              min={form.resignationDate || undefined}
              value={form.proposedLastDay}
              onChange={(event) => setField("proposedLastDay", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-tone">
              Tone
            </label>
            <select
              id="rl-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.toneId}
              onChange={(event) => setField("toneId", event.target.value)}
            >
              {TONES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-reason">
              Reason (optional — never required)
            </label>
            <select
              id="rl-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.reasonId}
              onChange={(event) => setField("reasonId", event.target.value)}
            >
              {REASONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-handover">
              Handing over to
            </label>
            <input
              id="rl-handover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.handoverTo}
              onChange={(event) => setField("handoverTo", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rl-handover-notes">
              What you will document (optional)
            </label>
            <input
              id="rl-handover-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="the model documentation and the client tracker"
              value={form.handoverNotes}
              onChange={(event) => setField("handoverNotes", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rl-custom">
              Reason in your own words (optional)
            </label>
            <textarea
              id="rl-custom"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={form.customReason}
              onChange={(event) => setField("customReason", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="rl-working" className={CHECK_LABEL}>
            <input
              id="rl-working"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.countWorkingDays}
              onChange={(event) => setField("countWorkingDays", event.target.checked)}
            />
            Notice counts working days only
          </label>
          <label htmlFor="rl-experience" className={CHECK_LABEL}>
            <input
              id="rl-experience"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.requestExperienceLetter}
              onChange={(event) => setField("requestExperienceLetter", event.target.checked)}
            />
            Ask for relieving letter and settlement
          </label>
          <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
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
              Last working day
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Full notice ends", "Shortfall", "Subject line", "Word count"].map((label) => (
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
                  Last working day
                </p>
                <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
                  {result.finalLastDay.long}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{result.shortfall.message}</p>
              </div>
              <button
                type="button"
                onClick={copyResult}
                aria-label={
                  isCopied("letter")
                    ? "Copied the resignation letter to clipboard"
                    : "Copy the resignation letter"
                }
                className={GHOST_BTN}
              >
                {isCopied("letter") ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {isCopied("letter") ? "Copied!" : "Copy letter"}
              </button>
            </div>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Full notice ends on", result.requiredLastDay.long],
                [
                  "Notice served",
                  `${form.noticeDays} ${form.countWorkingDays ? "working" : "calendar"} days`,
                ],
                [
                  "Shortfall",
                  result.shortfall.shortfallDays > 0
                    ? `${result.shortfall.shortfallDays} day${result.shortfall.shortfallDays === 1 ? "" : "s"}`
                    : "None",
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

            {result.finalLastDay.isWeekend && (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm" role="status">
                Your last working day falls on a weekend. Most employers move it to the previous
                working day — confirm which date HR will record.
              </p>
            )}
          </section>

          {result.shortfall.shortfallDays > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Notice buyout estimate</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Where a contract allows buying out the shortfall, the deduction is usually the daily
                rate of the salary component named in your appointment letter, multiplied by the days
                short. Which component applies is contractual — check before relying on this.
              </p>
              <div className="mt-4">
                <label className={LABEL_CLASS} htmlFor="rl-salary">
                  Monthly salary component used for the buyout
                </label>
                <input
                  id="rl-salary"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={salary}
                  onChange={(event) => setSalary(event.target.value)}
                />
              </div>
              {buyout && buyout.error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {buyout.error}
                </p>
              ) : (
                buyout && (
                  <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                    {[
                      ["Daily rate", `${INR.format(buyout.dailyRate)} (÷ ${buyout.divisor} days)`],
                      ["Days short", String(buyout.shortfallDays)],
                      ["Estimated buyout", INR.format(buyout.amount)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                        <dt className="text-[var(--muted-foreground)]">{label}</dt>
                        <dd className="text-right font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )
              )}
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Your letter</h2>
              <button
                type="button"
                onClick={copyResult}
                aria-label={
                  isCopied("letter")
                    ? "Copied the resignation letter to clipboard"
                    : "Copy the resignation letter"
                }
                className={PRIMARY_BTN}
              >
                {isCopied("letter") ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {isCopied("letter") ? "Copied!" : "Copy"}
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Your notice period, whether it is counted in calendar
        or working days, and whether a shortfall can be bought out all come from your appointment
        letter and company policy. Read those before you send anything, and take professional advice
        if the exit is contested.
      </p>
    </main>
  );
}
