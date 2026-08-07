"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarHeart, Check, Copy, RotateCcw } from "lucide-react";
import {
  DAYS_FROM_LMP,
  TRANSFER_TYPES,
  computeIvfDueDate,
  formatWeeksDays,
  toISODate,
} from "../lib";

/** Deterministic first-paint values; replaced with today's date after mount. */
const SAMPLE_TRANSFER_DATE = "2026-01-01";
const DEFAULT_TYPE = "day5";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function ToolHome() {
  const [transferDate, setTransferDate] = useState(SAMPLE_TRANSFER_DATE);
  const [transferType, setTransferType] = useState(DEFAULT_TYPE);
  const [asOfDate, setAsOfDate] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const today = toISODate(Date.now());
    setAsOfDate(today);
  }, []);

  const result = useMemo(
    () => computeIvfDueDate({ transferDate, transferType, asOfDate }),
    [transferDate, transferType, asOfDate],
  );

  const hasError = Boolean(result.error);

  const summary = (() => {
    if (hasError) return "";
    const lines = [
      "IVF Due Date Calculator",
      `${result.type.label} on ${SHORT_DATE.format(result.transfer)}`,
      `Estimated due date: ${LONG_DATE.format(result.dueDate)}`,
      `Equivalent LMP date: ${SHORT_DATE.format(result.equivalentLmp)}`,
      `Fertilisation / retrieval date: ${SHORT_DATE.format(result.fertilisation)}`,
      `Gestational age on transfer day: ${formatWeeksDays(result.gestationalAgeAtTransfer)}`,
    ];
    if (result.progress) {
      lines.push(
        `Gestational age today: ${formatWeeksDays(result.progress.gestationDays)} (${result.progress.stage})`,
      );
    }
    return lines.join("\n");
  })();

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

  const reset = () => {
    setTransferDate(SAMPLE_TRANSFER_DATE);
    setTransferType(DEFAULT_TYPE);
    setAsOfDate(toISODate(Date.now()));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CalendarHeart className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">IVF Due Date Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          After IVF the conception date is known exactly, so the due date comes from the transfer
          date and the age of the embryo rather than from a last period. Pick the transfer type and
          this counts forward to the due date and every scan milestone in between.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ivf-date">
              Transfer or retrieval date
            </label>
            <input
              id="ivf-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={transferDate}
              onChange={(event) => setTransferDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ivf-type">
              What that date refers to
            </label>
            <select
              id="ivf-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={transferType}
              onChange={(event) => setTransferType(event.target.value)}
            >
              {TRANSFER_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ivf-asof">
              Show gestational age as of
            </label>
            <input
              id="ivf-asof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOfDate}
              onChange={(event) => setAsOfDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated due date
            </p>
            {/* Scoped to just the headline so screen readers announce a single short
                sentence when the transfer date/type or "as of" date changes, instead
                of re-reading the whole results block (matches pregnancy-due-date). */}
            <p
              aria-live="polite"
              role="status"
              className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl"
            >
              {hasError ? DASH : LONG_DATE.format(result.dueDate)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the due date."
                : `${result.type.label} plus ${result.type.offsetDays} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy IVF due date result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.progress && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${formatWeeksDays(result.progress.gestationDays)} of 40 weeks completed`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {formatWeeksDays(result.progress.gestationDays)} of 40 weeks · {result.progress.stage}
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Equivalent LMP date (gestational age is counted from here)",
              hasError ? DASH : SHORT_DATE.format(result.equivalentLmp),
            ],
            [
              "Fertilisation / egg retrieval date",
              hasError ? DASH : SHORT_DATE.format(result.fertilisation),
            ],
            [
              "Gestational age on transfer day",
              hasError ? DASH : formatWeeksDays(result.gestationalAgeAtTransfer),
            ],
            [
              "Gestational age on the selected date",
              hasError || !result.progress
                ? DASH
                : formatWeeksDays(result.progress.gestationDays),
            ],
            [
              "Days to the due date",
              hasError || !result.progress ? DASH : String(result.progress.daysToDue),
            ],
            ["Days counted from the equivalent LMP", hasError ? DASH : String(DAYS_FROM_LMP)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Milestone timeline</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Milestone
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Gestation
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.milestones.map((milestone) => (
                  <tr key={milestone.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{milestone.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {milestone.weeks}w {milestone.days}d
                    </td>
                    <td className="py-2 text-right">{SHORT_DATE.format(milestone.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. IVF dating is precise because the conception date is known, but your
        clinic&apos;s own dating, an early scan, or a twin pregnancy can shift the plan. Scan windows
        and term definitions also vary by country — follow the schedule your fertility clinic or
        obstetrician gives you.
      </p>
    </main>
  );
}
