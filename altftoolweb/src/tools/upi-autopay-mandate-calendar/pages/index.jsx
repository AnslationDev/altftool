"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CirclePause,
  CircleX,
  Clipboard,
  Download,
  ExternalLink,
  IndianRupee,
  Info,
  LockKeyhole,
  RefreshCcw,
  Repeat2,
  ShieldCheck,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  buildCountsOnlyMandateReport,
  buildMandateIcs,
  FREQUENCIES,
  OFFICIAL_REFERENCES,
  validateAndPlanMandate,
} from "../lib/mandatePlanner.mjs";

const MONTH_FREQUENCIES = new Set([
  "monthly",
  "bimonthly",
  "quarterly",
  "half-yearly",
  "yearly",
]);

const INITIAL_FORM = {
  merchant: "",
  amount: "",
  frequency: "monthly",
  startDate: "",
  endDate: "",
  debitDay: "1",
  debitReminderDays: "1",
  pauseReminderDate: "",
  revokeReminderDate: "",
  includeAmountInCalendar: false,
};

function formatDisplayDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function downloadText(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <section className="tool-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-foreground">{title}</h2>
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function UpiAutopayMandateCalendar() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [plan, setPlan] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState(
    "Enter a bounded date range to create a private planning estimate.",
  );

  const selectedFrequency = useMemo(
    () => FREQUENCIES.find((frequency) => frequency.id === form.frequency),
    [form.frequency],
  );
  const summary = useMemo(
    () => (plan?.valid ? buildCountsOnlyMandateReport(plan) : ""),
    [plan],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setPlan(null);
    setCopied(false);
  };

  const createPlan = (event) => {
    event.preventDefault();
    const nextPlan = validateAndPlanMandate(form);
    setPlan(nextPlan);
    setCopied(false);
    setNotice(
      nextPlan.valid
        ? `${nextPlan.occurrences.length.toLocaleString("en-US")} estimated debit occurrence${nextPlan.occurrences.length === 1 ? "" : "s"} planned locally.`
        : "Fix the highlighted planning inputs and try again.",
    );
  };

  const resetPlanner = () => {
    setForm(INITIAL_FORM);
    setPlan(null);
    setCopied(false);
    setNotice("Planner reset. No mandate data is retained by this page.");
  };

  const exportIcs = () => {
    if (!plan?.valid || plan.truncated) return;
    try {
      const ics = buildMandateIcs(plan);
      downloadText(
        ics,
        "upi-autopay-mandate-plan.ics",
        "text/calendar;charset=utf-8",
      );
      setNotice(
        "ICS downloaded. It contains estimated events only and cannot change the real mandate.",
      );
    } catch {
      setNotice("The calendar could not be exported. Shorten the date range and try again.");
    }
  };

  const copySummary = async () => {
    if (!summary) return;
    const didCopy = await safeCopyText(summary);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <CalendarClock className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Private recurrence planner
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  UPI AutoPay Mandate Calendar
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Estimate recurring debit dates, add personal pause or revoke review reminders, and
              export tentative calendar events without connecting to a UPI or bank app.
            </p>
          </div>
          <div className="rounded-xl border border-success bg-success-soft p-4 text-sm text-foreground lg:max-w-sm">
            <div className="flex items-center gap-2 font-bold text-success">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              Local planner, not payment control
            </div>
            <p className="mt-2 leading-relaxed">
              Nothing is uploaded or stored. This tool cannot create, approve, debit, modify,
              pause, unpause, revoke, or verify a mandate.
            </p>
          </div>
        </div>
      </header>

      <div
        className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-foreground"
        role="note"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong>Dates are estimates, not an authoritative schedule.</strong> Merchant, bank,
            and UPI-app behavior can differ, including month-end handling, notifications,
            authorization, retries, variable amounts, pauses, and final mandate status. Verify
            every detail in your own app or bank.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-8">
        <section className="tool-card p-5 sm:p-6 xl:col-span-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Repeat2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">Mandate planning details</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Use the details shown in your authorized mandate. No monetary limit is assumed by
                this planner.
              </p>
            </div>
          </div>

          <form className="mt-5 space-y-5" onSubmit={createPlan}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="mandate-merchant" className="text-sm font-bold text-foreground">
                  Merchant or mandate label
                </label>
                <input
                  id="mandate-merchant"
                  type="text"
                  value={form.merchant}
                  maxLength={120}
                  onChange={(event) => updateField("merchant", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Example: Streaming subscription"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="mandate-amount" className="text-sm font-bold text-foreground">
                  Planned amount in INR
                </label>
                <div className="relative mt-2">
                  <IndianRupee
                    className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    id="mandate-amount"
                    type="text"
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(event) =>
                      updateField(
                        "amount",
                        event.target.value.replace(/[^\d,.]/gu, "").slice(0, 24),
                      )
                    }
                    className="h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Amount shown in mandate"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="mandate-frequency" className="text-sm font-bold text-foreground">
                  Planner frequency
                </label>
                <select
                  id="mandate-frequency"
                  value={form.frequency}
                  onChange={(event) => updateField("frequency", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {FREQUENCIES.map((frequency) => (
                    <option key={frequency.id} value={frequency.id}>
                      {frequency.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {selectedFrequency?.description}
                </p>
              </div>
              {MONTH_FREQUENCIES.has(form.frequency) ? (
                <div>
                  <label htmlFor="mandate-debit-day" className="text-sm font-bold text-foreground">
                    Estimated debit day
                  </label>
                  <input
                    id="mandate-debit-day"
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    value={form.debitDay}
                    onChange={(event) => updateField("debitDay", event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Missing dates such as the 31st are estimated as that month’s last day and
                    clearly marked as a planner adjustment.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
                  {form.frequency === "one-time"
                    ? "The start date is the single estimated occurrence."
                    : "This frequency stays anchored to the start date, so no separate debit day is used."}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="mandate-start" className="text-sm font-bold text-foreground">
                  Planning start date
                </label>
                <input
                  id="mandate-start"
                  type="date"
                  value={form.startDate}
                  onChange={(event) => updateField("startDate", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="mandate-end" className="text-sm font-bold text-foreground">
                  Planning end date
                </label>
                <input
                  id="mandate-end"
                  type="date"
                  value={form.endDate}
                  onChange={(event) => updateField("endDate", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  A bounded end date is required for a finite local calendar.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="mandate-lead-days" className="text-sm font-bold text-foreground">
                  Debit reminder lead days
                </label>
                <input
                  id="mandate-lead-days"
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={form.debitReminderDays}
                  onChange={(event) => updateField("debitReminderDays", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="mandate-pause-review" className="text-sm font-bold text-foreground">
                  Pause-review reminder
                  <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="mandate-pause-review"
                  type="date"
                  value={form.pauseReminderDate}
                  onChange={(event) => updateField("pauseReminderDate", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="mandate-revoke-review" className="text-sm font-bold text-foreground">
                  Revoke-review reminder
                  <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="mandate-revoke-review"
                  type="date"
                  value={form.revokeReminderDate}
                  onChange={(event) => updateField("revokeReminderDate", event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-4">
              <input
                type="checkbox"
                checked={form.includeAmountInCalendar}
                onChange={(event) =>
                  updateField("includeAmountInCalendar", event.target.checked)
                }
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-bold text-foreground">
                  Include amount in ICS event titles
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Off by default for privacy. The downloaded ICS always contains merchant label
                  and dates.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Build estimated calendar
              </button>
              <button type="button" className="btn-secondary" onClick={resetPlanner}>
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </form>
        </section>

        <aside className="min-w-0 space-y-6 xl:col-span-3">
          <InfoCard icon={ShieldCheck} title="Capability boundary">
            This page only performs date arithmetic and file generation. To inspect or change a
            real mandate, open your UPI app or contact your bank through a channel you trust.
          </InfoCard>
          <InfoCard icon={BellRing} title="Reminder meaning">
            Calendar alarms and pause/revoke events are personal prompts. They are separate from
            any notification or control offered by a merchant, UPI app, bank, or NPCI flow.
          </InfoCard>
          <div
            className={`rounded-xl border p-4 text-sm ${
              plan && !plan.valid
                ? "border-danger bg-danger-soft text-foreground"
                : "border-border bg-surface-soft text-muted-foreground"
            }`}
            role={plan && !plan.valid ? "alert" : "status"}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {plan && !plan.valid ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
              ) : (
                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="leading-relaxed">{notice}</p>
                {plan && !plan.valid ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    {plan.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {plan?.valid ? (
        <>
          <section className="tool-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Estimated schedule
                </p>
                <h2 className="mt-1 text-xl font-black text-foreground">
                  {plan.occurrences.length.toLocaleString("en-US")} planned occurrence
                  {plan.occurrences.length === 1 ? "" : "s"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {plan.frequency.description} Range: {formatDisplayDate(plan.startDate)} to{" "}
                  {formatDisplayDate(plan.endDate)}, inclusive.
                </p>
              </div>
              <span className="rounded-pill bg-warning-soft px-3 py-1.5 text-xs font-bold text-foreground">
                Estimate only
              </span>
            </div>

            <div className="mt-5 grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <h3 className="font-bold text-foreground">Debit occurrences</h3>
                <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {plan.occurrences.slice(0, 24).map((occurrence) => (
                    <li
                      key={`${occurrence.date}-${occurrence.sequence}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-surface-soft p-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-primary-soft text-xs font-bold text-primary">
                        {occurrence.sequence}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatDisplayDate(occurrence.date)}
                      </span>
                    </li>
                  ))}
                </ol>
                {plan.occurrences.length > 24 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Plus {(plan.occurrences.length - 24).toLocaleString("en-US")} more estimated
                    occurrences in the ICS export.
                  </p>
                ) : null}
              </div>

              <div>
                <h3 className="font-bold text-foreground">Review reminders</h3>
                {plan.reminderEvents.length ? (
                  <ul className="mt-3 space-y-2">
                    {plan.reminderEvents.map((reminder) => (
                      <li
                        key={`${reminder.kind}-${reminder.date}`}
                        className="rounded-lg border border-border bg-surface-soft p-3"
                      >
                        <p className="text-sm font-semibold text-foreground">{reminder.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDisplayDate(reminder.date)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    No optional pause or revoke review reminder was added.
                  </p>
                )}
              </div>
            </div>

            {plan.warnings.length ? (
              <div className="mt-5 rounded-lg border border-warning bg-warning-soft p-4">
                <h3 className="font-bold text-foreground">Planner notes</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground">
                  {plan.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="tool-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-bold text-foreground">Tentative ICS calendar</h2>
                  <p className="text-sm text-muted-foreground">Local file download</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Events are marked tentative and explicitly state that they cannot initiate, pause,
                or revoke a payment. The file contains the merchant label and exact planned dates
                {plan.includeAmountInCalendar ? ", plus the amount you chose to include." : "."}
              </p>
              <button
                type="button"
                className="btn-primary mt-4 w-full"
                onClick={exportIcs}
                disabled={plan.truncated}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download ICS calendar
              </button>
            </section>

            <section className="tool-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Clipboard className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-bold text-foreground">Counts-only summary</h2>
                  <p className="text-sm text-muted-foreground">No merchant, amount, or dates</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <button type="button" className="btn-primary" onClick={copySummary}>
                  <Clipboard className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Summary copied" : "Copy counts-only summary"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    downloadText(
                      summary,
                      "upi-autopay-mandate-counts-only.txt",
                      "text/plain;charset=utf-8",
                    )
                  }
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download summary
                </button>
              </div>
            </section>
          </div>
        </>
      ) : null}

      <section className="tool-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Info className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground">Official concept references</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              NPCI materials describe recurring UPI e-mandates, recurrence options, mandate
              management controls, authorization, and pre-debit notification concepts. This
              planner does not reproduce monetary limits or assume every option is available in
              every app, bank, merchant, or mandate.
            </p>
          </div>
        </div>
        <ul className="mt-5 grid gap-3 lg:grid-cols-3">
          {OFFICIAL_REFERENCES.map((reference) => (
            <li key={reference.url} className="rounded-lg border border-border bg-surface-soft p-4">
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-2 font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{reference.title}</span>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {reference.supports}
              </p>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">
                Accessed {formatDisplayDate(reference.accessedOn)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <InfoCard icon={CirclePause} title="Pause is not simulated">
          A pause-review event is only a reminder to inspect your real mandate. The planner cannot
          determine whether pause is available, active, or effective.
        </InfoCard>
        <InfoCard icon={CircleX} title="Revoke is not simulated">
          A revoke-review event does not cancel anything. Confirm status inside your UPI app or
          bank after taking any real action.
        </InfoCard>
        <InfoCard icon={ShieldCheck} title="No authoritative record">
          The ICS and summary are personal planning artifacts. They are not bank statements,
          mandate authorizations, transaction records, or proof of cancellation.
        </InfoCard>
      </div>
    </main>
  );
}
