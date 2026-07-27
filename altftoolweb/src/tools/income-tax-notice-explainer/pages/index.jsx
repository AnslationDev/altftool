"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, FileWarning, RotateCcw } from "lucide-react";

import {
  NOTICES,
  SEVERITY_LABELS,
  computeResponseWindow,
  getNotice,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const FALLBACK_DAYS = 15;
const SEED_TODAY = "2025-07-26";
const SEED_NOTICE_DATE = "2025-07-21";
const DEFAULT_NOTICE_ID = "139-9";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const isoOf = (date) => date.toISOString().slice(0, 10);

function freshDates() {
  const now = new Date();
  return {
    today: isoOf(now),
    noticeDate: isoOf(new Date(now.getTime() - 5 * MS_PER_DAY)),
  };
}

const severityTone = {
  informational: "text-[var(--muted-foreground)]",
  "action-needed": "text-[var(--primary)]",
  serious: "text-[var(--danger)]",
};

const statusTone = {
  open: "text-[var(--success)]",
  urgent: "text-[var(--primary)]",
  "due-today": "text-[var(--danger)]",
  overdue: "text-[var(--danger)]",
};

const statusLabel = {
  open: "Reply window open",
  urgent: "Closing very soon",
  "due-today": "Due today",
  overdue: "Reply window has closed",
};

export default function ToolHome() {
  const [noticeId, setNoticeId] = useState(DEFAULT_NOTICE_ID);
  const [noticeDate, setNoticeDate] = useState(SEED_NOTICE_DATE);
  const [today, setToday] = useState(SEED_TODAY);
  const [days, setDays] = useState(
    String(getNotice(DEFAULT_NOTICE_ID)?.responseDays ?? FALLBACK_DAYS),
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dates = freshDates();
    setToday(dates.today);
    setNoticeDate(dates.noticeDate);
  }, []);

  const notice = getNotice(noticeId) ?? NOTICES[0];

  const replyWindow = useMemo(
    () => computeResponseWindow({ noticeDate, responseDays: Number(days), today }),
    [noticeDate, days, today],
  );

  const hasError = Boolean(replyWindow.error);

  const selectNotice = (id) => {
    setNoticeId(id);
    const next = getNotice(id);
    setDays(String(next?.responseDays ?? FALLBACK_DAYS));
    setCopied(false);
  };

  const reset = () => {
    const dates = freshDates();
    setNoticeId(DEFAULT_NOTICE_ID);
    setNoticeDate(dates.noticeDate);
    setToday(dates.today);
    setDays(String(getNotice(DEFAULT_NOTICE_ID)?.responseDays ?? FALLBACK_DAYS));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Income tax notice under section ${notice.section} — ${notice.title}`,
      `What it means: ${notice.meaning}`,
      `Reply window: ${notice.responseBasis}`,
      `Notice dated ${replyWindow.noticeDate}, reply due by ${replyWindow.deadline}`,
      `Days remaining: ${replyWindow.daysRemaining}`,
      `If ignored: ${notice.ifIgnored}`,
      "Next steps:",
      ...notice.steps.map((step, index) => `${index + 1}. ${step}`),
    ].join("\n");
  }, [hasError, notice, replyWindow]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileWarning className="h-4 w-4" aria-hidden="true" />
          Income tax notices
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Income Tax Notice Type Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the section printed at the top of your notice to see what it means, how long the Act
          gives you to reply, what happens if you do not, and the practical next steps.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className={LABEL_CLASS}>Section quoted on the notice</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {NOTICES.map((item) => {
            const active = item.id === notice.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectNotice(item.id)}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.section}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="notice-date">
              Date printed on the notice
            </label>
            <input
              id="notice-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={noticeDate}
              onChange={(event) => setNoticeDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="notice-today">
              Today&apos;s date
            </label>
            <input
              id="notice-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="notice-days">
              Reply window allowed (days)
            </label>
            <input
              id="notice-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{notice.responseBasis}</p>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {replyWindow.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days left to reply
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : replyWindow.daysRemaining}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${hasError ? "text-[var(--muted-foreground)]" : statusTone[replyWindow.status]}`}
            >
              {hasError ? "Fix the dates above to see the deadline." : statusLabel[replyWindow.status]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the notice explanation and deadline"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the notice selection and dates"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Section", `${notice.section} — ${notice.title}`],
            ["How serious", SEVERITY_LABELS[notice.severity]],
            ["Reply due by", hasError ? DASH : replyWindow.deadline],
            ["Days since the notice date", hasError ? DASH : replyWindow.daysElapsed],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd
                className={`text-right font-semibold ${label === "How serious" ? severityTone[notice.severity] : ""}`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What section {notice.section} means</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{notice.meaning}</p>

        <h3 className="mt-5 text-sm font-semibold">Why it was issued</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{notice.trigger}</p>

        <h3 className="mt-5 text-sm font-semibold">If you ignore it</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--danger)]">{notice.ifIgnored}</p>

        <h3 className="mt-5 text-sm font-semibold">Typical next steps</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          {notice.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational summary of statutory provisions, not legal or tax advice. Reply periods stated
        as &quot;as specified in the notice&quot; are set by the officer, so always follow the date
        printed on your own document, and consult a chartered accountant or tax advocate for
        scrutiny and reassessment matters.
      </p>
    </main>
  );
}
