"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, RotateCcw } from "lucide-react";

import {
  ACCOUNT_TYPES,
  CAUSES,
  EVIDENCE_CHECKLIST,
  IMMEDIATE_STEPS,
  LIMITED_LIABILITY_WORKING_DAYS,
  MAX_ASSESSMENT_DATE,
  MIN_ASSESSMENT_DATE,
  OMBUDSMAN_WAIT_DAYS,
  RESOLUTION_CALENDAR_DAYS,
  SHADOW_REVERSAL_WORKING_DAYS,
  ZERO_LIABILITY_WORKING_DAYS,
  assessLiability,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const showDate = (iso) => (iso ? DATE_FMT.format(new Date(`${iso}T00:00:00Z`)) : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const BAND_LABEL = {
  zero: "Zero customer liability",
  limited: "Limited liability",
  policy: "Decided by the bank's policy",
  negligence: "Loss borne until you reported",
};
const BAND_TEXT = {
  zero: "text-[var(--success)]",
  limited: "text-[var(--warning)]",
  policy: "text-[var(--warning)]",
  negligence: "text-[var(--danger)]",
};

const DEFAULTS = {
  communication: "2026-07-01",
  notification: "2026-07-06",
  account: "savings",
  cause: "third-party",
  value: "30000",
  holidays: "0",
};

export default function ToolHome() {
  const [communication, setCommunication] = useState(DEFAULTS.communication);
  const [notification, setNotification] = useState(DEFAULTS.notification);
  const [account, setAccount] = useState(DEFAULTS.account);
  const [cause, setCause] = useState(DEFAULTS.cause);
  const [value, setValue] = useState(DEFAULTS.value);
  const [holidays, setHolidays] = useState(DEFAULTS.holidays);
  const [done, setDone] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessLiability({
        communicationDate: communication,
        notificationDate: notification,
        accountTypeId: account,
        transactionValueInr: value.trim() === "" ? NaN : Number(value),
        causeId: cause,
        additionalHolidays: holidays.trim() === "" ? NaN : Number(holidays),
      }),
    [communication, notification, account, cause, value, holidays],
  );

  const selectedCause = CAUSES.find((item) => item.id === cause);

  const toggleStep = (id) =>
    setDone((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const summary = useMemo(() => {
    if (result.error) return `Cloned card playbook — input problem: ${result.error}`;
    return [
      "Cloned Card Response Playbook",
      `Disputed amount: ${money(result.transactionValue)}`,
      `Account type: ${result.accountType} (liability cap ${money(result.liabilityCap)})`,
      `Cause: ${result.cause}`,
      `Reported after ${result.delayWorkingDays} working day(s)`,
      `Position: ${BAND_LABEL[result.band]}`,
      result.customerLiability === null
        ? "Your liability: set by the bank's board-approved policy — ask for it in writing."
        : `Your liability: ${money(result.customerLiability)} · Bank's share: ${money(result.bankLiability)}`,
      "",
      result.basis,
      "",
      `Shadow reversal due by ${result.shadowReversalBy}`,
      `Complaint to be resolved by ${result.resolutionBy}`,
      `Ombudsman available from ${result.ombudsmanFrom} if there is no resolution`,
      "",
      `Steps completed: ${done.size} of ${IMMEDIATE_STEPS.length}`,
    ].join("\n");
  }, [result, done]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every input? This clears your case details and the playbook checklist you have ticked off.",
      )
    ) {
      return;
    }
    setCommunication(DEFAULTS.communication);
    setNotification(DEFAULTS.notification);
    setAccount(DEFAULTS.account);
    setCause(DEFAULTS.cause);
    setValue(DEFAULTS.value);
    setHolidays(DEFAULTS.holidays);
    setDone(new Set());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Incident response
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cloned Card Response Playbook
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What to do in the first hour, then the first week, and where you stand under the RBI
          limited-liability circular of 6 July 2017 — worked out in bank working days, not calendar
          days.
        </p>
      </header>

      <section className={CARD} aria-labelledby="inputs-heading">
        <h2 id="inputs-heading" className="text-base font-semibold">
          Your case
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-comm">
              Date the bank&apos;s alert reached you
            </label>
            <input
              id="cc-comm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              min={MIN_ASSESSMENT_DATE}
              max={MAX_ASSESSMENT_DATE}
              value={communication}
              onChange={(event) => setCommunication(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-notif">
              Date you notified the bank
            </label>
            <input
              id="cc-notif"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              min={MIN_ASSESSMENT_DATE}
              max={MAX_ASSESSMENT_DATE}
              value={notification}
              onChange={(event) => setNotification(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-value">
              Disputed amount (INR)
            </label>
            <input
              id="cc-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-holidays">
              Extra bank holidays in that gap
            </label>
            <input
              id="cc-holidays"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={holidays}
              onChange={(event) => setHolidays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-account">
              Account or card type
            </label>
            <select
              id="cc-account"
              className={`mt-2 ${INPUT_CLASS}`}
              value={account}
              onChange={(event) => setAccount(event.target.value)}
            >
              {ACCOUNT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — cap {item.cap}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-cause">
              How did the loss arise?
            </label>
            <select
              id="cc-cause"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cause}
              onChange={(event) => setCause(event.target.value)}
            >
              {CAUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {selectedCause ? (
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {selectedCause.detail}
              </p>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Working days are counted from the day after the bank&apos;s communication, treating Sundays
          and the second and fourth Saturday of each month as non-working. Add any further branch
          holidays above.
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`} aria-labelledby="liability-heading" aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="liability-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Your liability under the circular
            </h2>
            <p
              className={`mt-1 text-4xl font-semibold ${result.error ? "text-[var(--muted-foreground)]" : BAND_TEXT[result.band]}`}
            >
              {result.error
                ? DASH
                : result.customerLiability === null
                  ? "Bank policy"
                  : money(result.customerLiability)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${result.error ? "text-[var(--muted-foreground)]" : BAND_TEXT[result.band]}`}
            >
              {result.error ? DASH : BAND_LABEL[result.band]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the liability assessment" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Disputed amount", result.error ? DASH : money(result.transactionValue)],
            [
              "Bank's share of the loss",
              result.error || result.bankLiability === null ? DASH : money(result.bankLiability),
            ],
            [
              "Working days before you reported",
              result.error ? DASH : String(result.delayWorkingDays),
            ],
            [
              "Cap for this account type",
              result.error ? DASH : money(result.liabilityCap),
            ],
            [
              `Zero-liability deadline (${ZERO_LIABILITY_WORKING_DAYS} working days)`,
              result.error ? DASH : showDate(result.zeroLiabilityDeadline),
            ],
            [
              `Limited-liability deadline (${LIMITED_LIABILITY_WORKING_DAYS} working days)`,
              result.error ? DASH : showDate(result.limitedLiabilityDeadline),
            ],
          ].map(([label, item]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{item}</dd>
            </div>
          ))}
        </dl>

        {!result.error && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{result.basis}</p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="deadlines-heading">
        <h2 id="deadlines-heading" className="text-base font-semibold">
          What the bank owes you, and by when
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              `Shadow reversal of the disputed amount (${SHADOW_REVERSAL_WORKING_DAYS} working days from notification)`,
              result.error ? DASH : showDate(result.shadowReversalBy),
            ],
            [
              `Complaint resolved and liability established (${RESOLUTION_CALENDAR_DAYS} days)`,
              result.error ? DASH : showDate(result.resolutionBy),
            ],
            [
              `Ombudsman route opens (${OMBUDSMAN_WAIT_DAYS} days without resolution)`,
              result.error ? DASH : showDate(result.ombudsmanFrom),
            ],
          ].map(([label, item]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="shrink-0 text-right font-semibold">{item}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          The reversal is a credit into your account while the dispute is investigated; the bank may
          not make it conditional on your filing an FIR. If the bank finds against you, it can
          reverse the credit — get the finding in writing either way.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-base font-semibold">
          The playbook, in order
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {done.size} of {IMMEDIATE_STEPS.length} done. Tick as you go — the list survives while this
          page is open.
        </p>
        <ol className="mt-4 space-y-2">
          {IMMEDIATE_STEPS.map((step) => {
            const id = `step-${step.id}`;
            return (
              <li key={step.id}>
                <label
                  htmlFor={id}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition hover:border-[var(--primary)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--primary)]/35"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={done.has(step.id)}
                    onChange={() => toggleStep(step.id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {step.order}. {step.title}
                      </span>
                      <span className="rounded-sm bg-[var(--muted)] px-1.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
                        {step.window}
                      </span>
                    </span>
                    <span className="mt-1 block leading-6 text-[var(--muted-foreground)]">
                      {step.detail}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="evidence-heading">
        <h2 id="evidence-heading" className="text-base font-semibold">
          Evidence that decides these disputes
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {EVIDENCE_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2 leading-6">
              <span aria-hidden="true" className="text-[var(--primary)]">
                &bull;
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The figures follow the RBI circular
        DBR.No.Leg.BC.78/09.07.005/2017-18 of 6 July 2017; your bank&apos;s board-approved policy,
        the working schedule of your home branch and the facts of your case decide the outcome. For a
        disputed or high-value loss, consult a qualified adviser.
      </p>
    </main>
  );
}
