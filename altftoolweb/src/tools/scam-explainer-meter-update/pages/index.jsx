"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert, Zap } from "lucide-react";

import {
  ANATOMY,
  LEGITIMATE_PAYMENT_ROUTES,
  RED_FLAGS,
  STATUTORY_CLEAR_DAYS_NOTICE,
  UPI_TRUTHS,
  assessMessage,
  checkDisconnectionNotice,
  explainUpiRequest,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition hover:border-[var(--primary)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--primary)]/35";

const BAND_TEXT = {
  "almost-certain": "text-[var(--danger)]",
  suspicious: "text-[var(--warning)]",
  watch: "text-[var(--warning)]",
  none: "text-[var(--muted-foreground)]",
};
const BAND_LABEL = {
  "almost-certain": "This is the fraud",
  suspicious: "Highly suspicious",
  watch: "Verify first",
  none: "Nothing selected",
};

const DEFAULT_FLAGS = ["tonight", "mobile-number", "no-consumer-number", "token-payment"];
const DEFAULTS = {
  notice: "2026-07-29",
  cutoff: "2026-07-29",
  written: false,
  situation: "token",
};

export default function ToolHome() {
  const [flags, setFlags] = useState(() => new Set(DEFAULT_FLAGS));
  const [noticeDate, setNoticeDate] = useState(DEFAULTS.notice);
  const [cutoffDate, setCutoffDate] = useState(DEFAULTS.cutoff);
  const [written, setWritten] = useState(DEFAULTS.written);
  const [situation, setSituation] = useState(DEFAULTS.situation);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(() => assessMessage({ flagIds: Array.from(flags) }), [flags]);
  const notice = useMemo(
    () =>
      checkDisconnectionNotice({
        noticeDate,
        disconnectionDate: cutoffDate,
        noticeInWriting: written,
      }),
    [noticeDate, cutoffDate, written],
  );
  const upi = useMemo(() => explainUpiRequest({ situationId: situation }), [situation]);

  const toggleFlag = (id) =>
    setFlags((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const summary = useMemo(() => {
    const lines = [
      "Electricity Meter Update Scam — assessment",
      `Red-flag score: ${assessment.score} of ${assessment.maxScore} (${NUM.format(assessment.percent)}%)`,
      `Verdict: ${BAND_LABEL[assessment.band]} — ${assessment.verdict}`,
    ];
    if (!notice.error) {
      lines.push(
        "",
        `Notice period given: ${notice.clearDays} clear day(s) against a statutory ${notice.requiredClearDays}.`,
        notice.verdict,
      );
    }
    if (!upi.error) {
      lines.push("", `UPI: ${upi.situation} — money moves ${upi.moneyDirection}. ${upi.detail}`);
    }
    lines.push("", "Pay only through your DISCOM's own app or the number on your paper bill. Report fraud on 1930.");
    return lines.join("\n");
  }, [assessment, notice, upi]);

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
    setFlags(new Set(DEFAULT_FLAGS));
    setNoticeDate(DEFAULTS.notice);
    setCutoffDate(DEFAULTS.cutoff);
    setWritten(DEFAULTS.written);
    setSituation(DEFAULTS.situation);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Electricity Meter Update Scam Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          &quot;Your power will be cut tonight at 9:30 — call this officer to update the meter.&quot;
          Score the message, test the deadline against the notice the Electricity Act actually
          requires, and see what the token UPI payment really does.
        </p>
      </header>

      <section className={CARD} aria-labelledby="flags-heading">
        <h2 id="flags-heading" className="text-base font-semibold">
          What does the message ask for?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Weights run from 1 to 4. Four items rule out a genuine billing process on their own.
        </p>
        <ul className="mt-4 space-y-2">
          {RED_FLAGS.map((flag) => {
            const id = `meter-flag-${flag.id}`;
            return (
              <li key={flag.id}>
                <label htmlFor={id} className={CHECK_ROW}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={flags.has(flag.id)}
                    onChange={() => toggleFlag(flag.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="flex-1 leading-6">
                    {flag.label}
                    {flag.decisive ? (
                      <span className="ml-2 rounded-sm bg-[var(--danger-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        decisive
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="verdict-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="verdict-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Red-flag score
            </h2>
            <p className={`mt-1 text-4xl font-semibold ${BAND_TEXT[assessment.band]}`}>
              {assessment.score}
              <span className="text-xl text-[var(--muted-foreground)]"> / {assessment.maxScore}</span>
            </p>
            <p className={`mt-1 text-sm font-semibold ${BAND_TEXT[assessment.band]}`}>
              {BAND_LABEL[assessment.band]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the meter scam assessment" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={`Score is ${NUM.format(assessment.percent)} percent of the maximum`}
        >
          <span
            className={`block h-full ${assessment.band === "almost-certain" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
            style={{ width: `${Math.max(0, Math.min(100, assessment.percent))}%` }}
          />
        </div>

        <p className="mt-4 text-sm leading-6">{assessment.verdict}</p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Signals matched", `${assessment.matchedCount} of ${assessment.totalFlags}`],
            ["Share of maximum", `${NUM.format(assessment.percent)}%`],
            ["Decisive signals present", String(assessment.decisiveCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="notice-heading">
        <h2 id="notice-heading" className="text-base font-semibold">
          How much notice does the law require?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Section 56(1) of the Electricity Act, 2003 allows disconnection for non-payment only after
          not less than {STATUTORY_CLEAR_DAYS_NOTICE} clear days&apos; notice in writing.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="meter-notice">
              Date the notice reached you
            </label>
            <input
              id="meter-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={noticeDate}
              onChange={(event) => setNoticeDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meter-cutoff">
              Date supply is said to be cut
            </label>
            <input
              id="meter-cutoff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={cutoffDate}
              onChange={(event) => setCutoffDate(event.target.value)}
            />
          </div>
        </div>

        <label
          htmlFor="meter-written"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <input
            id="meter-written"
            type="checkbox"
            checked={written}
            onChange={(event) => setWritten(event.target.checked)}
            className="h-5 w-5 accent-[var(--primary)]"
          />
          The notice arrived in writing (post, or on the DISCOM portal), not as an SMS or a call
        </label>

        {notice.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {notice.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Clear days of notice given
          </p>
        )}
        <p
          className={`mt-1 text-4xl font-semibold ${
            notice.error
              ? "text-[var(--muted-foreground)]"
              : notice.lawful
                ? "text-[var(--success)]"
                : "text-[var(--danger)]"
          }`}
        >
          {notice.error ? DASH : `${notice.clearDays} / ${notice.requiredClearDays}`}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Calendar days between the dates", notice.error ? DASH : String(notice.spanDays)],
            ["Statutory minimum", notice.error ? DASH : `${notice.requiredClearDays} clear days`],
            ["Short by", notice.error ? DASH : String(notice.shortfall)],
            ["Notice in writing", notice.error ? DASH : notice.noticeInWriting ? "Yes" : "No"],
            [
              "Meets Section 56(1)",
              notice.error ? DASH : notice.lawful ? "Yes" : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!notice.error && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{notice.verdict}</p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="upi-heading">
        <h2 id="upi-heading" className="text-base font-semibold">
          What the token UPI payment really does
        </h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="meter-upi">
            What were you asked to do?
          </label>
          <select
            id="meter-upi"
            className={`mt-2 ${INPUT_CLASS}`}
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
          >
            {UPI_TRUTHS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.situation}
              </option>
            ))}
          </select>
        </div>

        {upi.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {upi.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Money moves
          </p>
        )}
        <p
          className={`mt-1 text-3xl font-semibold ${
            upi.error ? "text-[var(--muted-foreground)]" : upi.pinNeeded ? "text-[var(--danger)]" : "text-[var(--success)]"
          }`}
        >
          {upi.error ? DASH : upi.moneyDirection}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["PIN required", upi.error ? DASH : upi.pinNeeded ? "Yes" : "No"],
            ["What it means", upi.error ? DASH : upi.detail],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!upi.error && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{upi.rule}</p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="anatomy-heading">
        <h2 id="anatomy-heading" className="text-base font-semibold">
          The script, step by step
        </h2>
        <ol className="mt-4 space-y-4">
          {ANATOMY.map((stage) => (
            <li key={stage.step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                {stage.step}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{stage.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{stage.detail}</p>
                <p className="mt-1.5 flex gap-2 text-sm leading-6">
                  <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                  <span>{stage.tell}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="pay-heading">
        <h2 id="pay-heading" className="text-base font-semibold">
          The only ways to pay an electricity bill
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {LEGITIMATE_PAYMENT_ROUTES.map((route) => (
            <li key={route} className="flex gap-2 leading-6">
              <span aria-hidden="true" className="text-[var(--success)]">
                &bull;
              </span>
              <span>{route}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
          If a remote-access app was installed, disconnect the internet, uninstall it, and change
          your banking credentials from a different device. Call 1930 and your bank if any debit has
          appeared.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Notice periods, tariff rules and disconnection
        procedure are set by the Electricity Act and your state regulatory commission — confirm the
        position with your distribution company or a qualified adviser before acting on a notice.
      </p>
    </main>
  );
}
