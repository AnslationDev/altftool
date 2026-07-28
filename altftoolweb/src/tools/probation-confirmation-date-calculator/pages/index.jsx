"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import { COMMON_PROBATION_MONTHS, computeConfirmation } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const todayIso = () => new Date().toISOString().slice(0, 10);

const isoMonthsAgo = (months) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, 1))
    .toISOString()
    .slice(0, 10);
};

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ms));
};

export default function ToolHome() {
  const [joiningDate, setJoiningDate] = useState(() => isoMonthsAgo(2));
  const [today, setToday] = useState(todayIso);
  const [probationMonths, setProbationMonths] = useState("6");
  const [extensionMonths, setExtensionMonths] = useState("0");
  const [lopDays, setLopDays] = useState("0");
  const [noticeProbation, setNoticeProbation] = useState("15");
  const [noticeConfirmed, setNoticeConfirmed] = useState("60");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeConfirmation({
        joiningDate,
        today,
        probationMonths: Number(probationMonths),
        extensionMonths: Number(extensionMonths),
        lopDays: Number(lopDays),
        noticeProbation: Number(noticeProbation),
        noticeConfirmed: Number(noticeConfirmed),
      }),
    [joiningDate, today, probationMonths, extensionMonths, lopDays, noticeProbation, noticeConfirmed],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Probation confirmation",
      `Joined: ${result.joiningDate}`,
      `Probation: ${result.probationMonths} months${result.extensionMonths ? ` + ${result.extensionMonths} month extension` : ""}`,
      `Leave without pay: ${result.lopDays} days`,
      `Last day of probation: ${result.lastDayOfProbation}`,
      `Confirmation effective from: ${result.confirmationDate}`,
      `Originally due: ${result.scheduledConfirmationDate}`,
      `Status today (${today}): ${result.status}`,
      `Days served / total: ${result.daysServed} of ${result.totalDays}`,
      `Notice period applicable today: ${result.noticeToday} days`,
    ].join("\n");
  }, [result, today]);

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
    setJoiningDate(isoMonthsAgo(2));
    setToday(todayIso());
    setProbationMonths("6");
    setExtensionMonths("0");
    setLopDays("0");
    setNoticeProbation("15");
    setNoticeConfirmed("60");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Employment dates
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Probation Confirmation Date Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the joining date and probation length, add any extension and days of leave without
          pay, and see the last day of probation, the confirmation date and how far along you are.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="prob-join">
              Joining date
            </label>
            <input
              id="prob-join"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={joiningDate}
              onChange={(event) => setJoiningDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prob-today">
              Today&apos;s date
            </label>
            <input
              id="prob-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prob-months">
              Probation in the offer letter (months)
            </label>
            <input
              id="prob-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="24"
              step="1"
              value={probationMonths}
              onChange={(event) => setProbationMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prob-ext">
              Extension granted (months)
            </label>
            <input
              id="prob-ext"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="24"
              step="1"
              value={extensionMonths}
              onChange={(event) => setExtensionMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prob-lop">
              Leave without pay (days)
            </label>
            <input
              id="prob-lop"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={lopDays}
              onChange={(event) => setLopDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prob-notice-p">
              Notice during probation (days)
            </label>
            <input
              id="prob-notice-p"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={noticeProbation}
              onChange={(event) => setNoticeProbation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prob-notice-c">
              Notice after confirmation (days)
            </label>
            <input
              id="prob-notice-c"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={noticeConfirmed}
              onChange={(event) => setNoticeConfirmed(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {COMMON_PROBATION_MONTHS.map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setProbationMonths(String(months))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {months} months
            </button>
          ))}
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
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Confirmation effective from
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Last day of probation", "Originally due", "Days served", "Days remaining"].map(
                (item) => (
                  <div key={item} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{item}</dt>
                    <dd className="text-right font-semibold">{DASH}</dd>
                  </div>
                ),
              )}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Confirmation effective from
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {prettyDate(result.confirmationDate)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.status} · {result.totalMonths} months of probation
                  {result.lopDays > 0 ? ` + ${result.lopDays} days of unpaid leave` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the confirmation dates"
                  className={GHOST_BTN}
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

            <div className="mt-5">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Probation is ${result.percentComplete} percent complete`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, result.percentComplete))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {result.daysServed} of {result.totalDays} days served · {result.percentComplete}%
                complete
              </p>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Last day of probation", prettyDate(result.lastDayOfProbation)],
                [
                  "Originally due (before extension / unpaid leave)",
                  prettyDate(result.scheduledConfirmationDate),
                ],
                [
                  "Pushed back by",
                  result.daysPushed > 0 ? `${result.daysPushed} days` : "Not pushed back",
                ],
                ["Days remaining", `${result.daysRemaining} days`],
                ["Notice period applicable today", `${result.noticeToday} days`],
                [
                  "Notice on probation / after confirmation",
                  `${result.noticeProbation} / ${result.noticeConfirmed} days`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Review timeline</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Milestone
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.milestones.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{item.label}</td>
                      <td className="py-2 text-right font-semibold">{prettyDate(item.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or HR advice. Your appointment letter and the standing orders
        that apply to your establishment decide whether unpaid leave extends probation and whether
        confirmation is automatic or needs a written order.
      </p>
    </main>
  );
}
