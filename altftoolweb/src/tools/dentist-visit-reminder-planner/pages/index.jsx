"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, Download, RotateCcw } from "lucide-react";

import {
  ADULT_INTERVAL_RANGE_MONTHS,
  CHILD_INTERVAL_RANGE_MONTHS,
  REMINDER_LEAD_DAYS,
  RISK_BANDS,
  RISK_FACTORS,
  planDentalRecall,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const todayIso = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const FACTOR_GROUPS = [...new Set(RISK_FACTORS.map((factor) => factor.group))];

export default function ToolHome() {
  const [lastVisitDate, setLastVisitDate] = useState("2026-01-15");
  const [today, setToday] = useState(todayIso);
  const [ageYears, setAgeYears] = useState("34");
  const [riskFactors, setRiskFactors] = useState(["no-interdental"]);
  const [copied, setCopied] = useState(false);

  const toggleFactor = (id) => {
    setRiskFactors((previous) => (previous.includes(id) ? previous.filter((v) => v !== id) : [...previous, id]));
  };

  const plan = useMemo(
    () => planDentalRecall({ lastVisitDate, today, ageYears: Number(ageYears), riskFactors }),
    [lastVisitDate, today, ageYears, riskFactors],
  );

  const ok = !plan.error;

  const copySummary = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(plan.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadIcs = () => {
    if (!ok) return;
    const blob = new Blob([plan.icsText], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dental-check-up-${plan.dueDate}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setLastVisitDate("2026-01-15");
    setToday(todayIso());
    setAgeYears("34");
    setRiskFactors(["no-interdental"]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Dental care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Dentist Visit Reminder Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          There is no universal six-month rule. Evidence-based guidance sets the recall interval
          anywhere from {ADULT_INTERVAL_RANGE_MONTHS.min} to {ADULT_INTERVAL_RANGE_MONTHS.max} months
          for adults and {CHILD_INTERVAL_RANGE_MONTHS.min} to {CHILD_INTERVAL_RANGE_MONTHS.max} for
          under-18s, based on risk. Tick what applies and see where you land.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-last">
              Date of last check-up
            </label>
            <input
              id="dr-last"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lastVisitDate}
              onChange={(event) => setLastVisitDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dr-age">
              Age (years)
            </label>
            <input
              id="dr-age"
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dr-today">
              Treat this as today
            </label>
            <input
              id="dr-today"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>
      </section>

      {FACTOR_GROUPS.map((group) => (
        <section key={group} className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{group}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {RISK_FACTORS.filter((factor) => factor.group === group).map((factor) => (
              <label
                key={factor.id}
                htmlFor={`dr-${factor.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                <input
                  id={`dr-${factor.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={riskFactors.includes(factor.id)}
                  onChange={() => toggleFactor(factor.id)}
                />
                <span className="flex-1">
                  {factor.label}
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">+{factor.weight}</span>
                </span>
              </label>
            ))}
          </div>
        </section>
      ))}

      {plan.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Suggested recall interval
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${plan.intervalMonths} months` : DASH}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${ok && plan.overdue ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}
            >
              {ok
                ? plan.overdue
                  ? `Overdue by ${Math.abs(plan.daysUntilDue)} days`
                  : `Next check-up due ${plan.dueDate} — ${plan.daysUntilDue} days away`
                : "Fix the error above to see the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadIcs}
              disabled={!ok}
              aria-label="Download a calendar reminder file"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Calendar file
            </button>
            <button
              type="button"
              onClick={copySummary}
              disabled={!ok}
              aria-label="Copy the recall plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Risk score", ok ? `${plan.score} of ${plan.maxScore}` : DASH],
            ["Risk band", ok ? plan.band.label : DASH],
            [
              "Guideline range that applies",
              ok ? `${plan.range.min}–${plan.range.max} months (${plan.isChild ? "under 18" : "adult"})` : DASH,
            ],
            ["Next check-up due", ok ? plan.dueDate : DASH],
            ["Set a reminder for", ok ? `${plan.reminderDate} (${REMINDER_LEAD_DAYS} days ahead)` : DASH],
            ["Since your last check-up", ok ? `${NUM.format(plan.monthsSinceLastVisit)} months` : DASH],
            ["Risk factors ticked", ok ? plan.selected.length : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && <p className="mt-3 text-xs text-[var(--muted-foreground)]">{plan.band.summary}</p>}
      </section>

      {ok && plan.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {plan.warnings.map((warning) => (
            <li
              key={warning}
              role="alert"
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {ok && plan.actions.length > 0 && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What would shorten this list</h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {plan.actions.map((action) => (
              <li key={action.id} className="py-2.5 text-sm">
                <span className="block font-semibold">{action.label}</span>
                <span className="block text-[var(--muted-foreground)]">{action.action}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the bands map to intervals</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Score</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Adult</th>
                <th scope="col" className="py-2 text-right font-semibold">Under 18</th>
              </tr>
            </thead>
            <tbody>
              {RISK_BANDS.map((band) => (
                <tr
                  key={band.id}
                  className={`border-b border-[var(--border)] last:border-0 ${ok && plan.band.id === band.id ? "font-semibold text-[var(--primary)]" : ""}`}
                >
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 pr-3">
                    {band.maxScore === Infinity ? `${band.minScore}+` : `${band.minScore}–${band.maxScore}`}
                  </td>
                  <td className="py-2 pr-3 text-right">{band.adultMonths} months</td>
                  <td className="py-2 text-right">{band.childMonths} months</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The recall interval is a clinical judgement your dentist makes after
        examining you, and it can be shorter than anything shown here. Use this to understand the
        reasoning and to prompt the conversation, not to replace it — and see a dentist sooner for
        pain, swelling, a broken tooth or bleeding that does not settle.
      </p>
    </main>
  );
}
