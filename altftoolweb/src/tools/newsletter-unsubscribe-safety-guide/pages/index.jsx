"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailMinus, RotateCcw } from "lucide-react";

import {
  SPAM_SIGNALS,
  assessUnsubscribe,
  buildDeadlines,
  formatGuidance,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const EMPTY_SIGNALS = {
  neverSignedUp: false,
  senderUnknown: false,
  linkDomainMismatch: false,
  noListUnsubscribe: false,
  aliasMismatch: false,
  pressureLanguage: false,
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [signals, setSignals] = useState(EMPTY_SIGNALS);
  const [hasAccount, setHasAccount] = useState(false);
  const [hasNativeButton, setHasNativeButton] = useState(true);
  const [unsubscribedOn, setUnsubscribedOn] = useState(todayIso);
  const [today, setToday] = useState(todayIso);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(
    () => assessUnsubscribe({ signals, hasAccount, hasNativeButton }),
    [signals, hasAccount, hasNativeButton],
  );
  const deadlines = useMemo(() => buildDeadlines(unsubscribedOn, today), [unsubscribedOn, today]);
  const guidance = useMemo(() => formatGuidance(assessment, deadlines), [assessment, deadlines]);

  const toggleSignal = (id) => setSignals((current) => ({ ...current, [id]: !current[id] }));

  const reset = () => {
    setSignals(EMPTY_SIGNALS);
    setHasAccount(false);
    setHasNativeButton(true);
    setUnsubscribedOn(todayIso());
    setToday(todayIso());
    setCopied(false);
  };

  const copyGuidance = async () => {
    if (!guidance) return;
    try {
      await navigator.clipboard.writeText(guidance);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const dateError = Boolean(deadlines.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MailMinus className="h-4 w-4" aria-hidden="true" />
          Email security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Newsletter Unsubscribe Safety Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          On a list you joined, unsubscribing is the right move. On mail you never asked for, the
          same click tells the sender a human reads the address. Tick what you see in the message
          and get the safe route, plus the date the sender is required to stop.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-base font-semibold">What do you see in this message?</legend>
          <div className="mt-4 grid gap-2">
            {SPAM_SIGNALS.map((signal) => (
              <label
                key={signal.id}
                htmlFor={`unsub-${signal.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`unsub-${signal.id}`}
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={Boolean(signals[signal.id])}
                  onChange={() => toggleSignal(signal.id)}
                />
                <span>
                  <span className="font-semibold">{signal.label}</span>
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">+{signal.weight}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-2">
          <label
            htmlFor="unsub-account"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
          >
            <input
              id="unsub-account"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={hasAccount}
              onChange={() => setHasAccount((value) => !value)}
            />
            <span className="font-semibold">I have a real account with this company</span>
          </label>
          <label
            htmlFor="unsub-native"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
          >
            <input
              id="unsub-native"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={hasNativeButton}
              onChange={() => setHasNativeButton((value) => !value)}
            />
            <span className="font-semibold">My mail client shows its own unsubscribe button</span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Unsolicited score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{assessment.score}/100</p>
            <p className="mt-1 text-sm font-semibold">{assessment.band.label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyGuidance}
              aria-label="Copy the unsubscribe guidance"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy guidance"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the guide" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm font-semibold text-[var(--primary)]">{assessment.action.label}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {assessment.action.detail}
          </p>
          <ol className="mt-4 space-y-3">
            {assessment.action.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Signals ticked", NUM.format(assessment.activeSignals.length)],
            ["Route chosen", assessment.action.label],
            ["Deadlines already passed", dateError ? "—" : NUM.format(deadlines.overdueCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Unsolicited score ${assessment.score} out of 100`}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${assessment.score}%` }} />
          </div>
        </div>

        {assessment.warnings.length > 0 && (
          <ul className="mt-5 space-y-2">
            {assessment.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {assessment.activeSignals.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Why those signals matter</h2>
          <ul className="mt-4 space-y-3">
            {assessment.activeSignals.map((signal) => (
              <li key={signal.id} className="text-sm leading-6">
                <span className="font-semibold">{signal.label}</span>
                <span className="block text-[var(--muted-foreground)]">{signal.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">When must the mail stop?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="unsub-date">
              Date you unsubscribed
            </label>
            <input
              id="unsub-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={unsubscribedOn}
              onChange={(event) => setUnsubscribedOn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="unsub-today">
              Count from
            </label>
            <input
              id="unsub-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>

        {dateError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {deadlines.error}
          </p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Where</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Rule</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Stop by</th>
                    <th scope="col" className="py-2 text-right font-semibold">Days left</th>
                  </tr>
                </thead>
                <tbody>
                  {deadlines.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.region}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.rule}</td>
                      <td className="py-2 pr-3">{row.due}</td>
                      <td
                        className={`py-2 text-right font-semibold ${row.overdue ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
                      >
                        {row.overdue ? `${NUM.format(Math.abs(row.daysLeft))} overdue` : NUM.format(row.daysLeft)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {deadlines.rows.map((row) => (
                <li key={`${row.id}-note`}>
                  <span className="font-semibold text-[var(--foreground)]">{row.rule}: </span>
                  {row.note}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice — deadlines are counted from the rules named above and
        ignore public holidays, which can push a business-day deadline later. If mail continues past
        the deadline, keep the original message and the unsubscribe date and raise it with the
        relevant regulator or a qualified adviser.
      </p>
    </main>
  );
}
