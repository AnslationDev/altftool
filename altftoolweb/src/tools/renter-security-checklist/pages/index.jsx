"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import {
  CHECKLIST,
  SECTIONS,
  SEVERITY_WEIGHT,
  SMOKE_ALARM_LIFE_YEARS,
  TOTAL_WEIGHT,
  formatReport,
  scoreChecklist,
  smokeAlarmLife,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const SEVERITY_LABEL = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Good practice",
};

/** Items ticked by default: the paperwork most renters already have on day one. */
const DEFAULT_DONE = ["condition-photos", "deposit-receipt", "emergency-contacts"];

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ToolHome() {
  const [done, setDone] = useState(() => new Set(DEFAULT_DONE));
  const [alarmDate, setAlarmDate] = useState("2019-06-01");
  const [checkDate, setCheckDate] = useState(todayIso);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreChecklist(Array.from(done)), [done]);
  const alarm = useMemo(() => smokeAlarmLife(alarmDate, checkDate), [alarmDate, checkDate]);

  const hasError = Boolean(result.error);
  const alarmError = Boolean(alarm.error);

  const summary = useMemo(() => formatReport(result), [result]);

  const toggle = (id) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setCopied(false);
  };

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
    setDone(new Set(DEFAULT_DONE));
    setAlarmDate("2019-06-01");
    setCheckDate(todayIso());
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Items complete", DASH],
        ["Weighted points earned", DASH],
        ["Open critical items", DASH],
        ["Rating", DASH],
      ]
    : [
        ["Items complete", `${result.completedCount} of ${result.totalCount}`],
        ["Weighted points earned", `${result.earnedWeight} of ${result.totalWeight}`],
        ["Open critical items", NUM.format(result.criticalOpen.length)],
        ["Rating", result.band.label],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Move-in safety audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Renter Security Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work through {CHECKLIST.length} verification steps drawn from NFPA 72 alarm placement,
          ANSI/BHMA A156.5 deadbolt grading and NEC 210.8 GFCI rules. Each item carries a severity
          weight, so the score reflects risk rather than raw item count.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Weighted security score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${Math.round(result.score)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.band.advice}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the renter security report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.criticalOpen.length > 0 ? (
          <div className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {result.criticalOpen.length} critical item
              {result.criticalOpen.length === 1 ? "" : "s"} still open
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.criticalOpen.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Smoke alarm age check</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          NFPA 72 retires a smoke alarm {SMOKE_ALARM_LIFE_YEARS} years from the manufacture date
          printed on the back of the unit — not from the date it was installed.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="alarm-made">
              Date of manufacture
            </label>
            <input
              id="alarm-made"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={alarmDate}
              onChange={(event) => setAlarmDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alarm-today">
              Check against date
            </label>
            <input
              id="alarm-today"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={checkDate}
              onChange={(event) => setCheckDate(event.target.value)}
            />
          </div>
        </div>

        {alarmError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {alarm.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Alarm age</dt>
            <dd className="text-right font-semibold">
              {alarmError ? DASH : `${NUM.format(alarm.ageYears)} years`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Replace by</dt>
            <dd className="text-right font-semibold">{alarmError ? DASH : alarm.replaceBy}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Status</dt>
            <dd
              className={`text-right font-semibold ${
                alarmError ? "" : alarm.expired ? "text-[var(--danger)]" : "text-[var(--success)]"
              }`}
            >
              {alarmError
                ? DASH
                : alarm.expired
                  ? "Past its service life — replace it"
                  : `${NUM.format(alarm.yearsLeft)} years of life left`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 space-y-4">
        {SECTIONS.map((section) => {
          const items = CHECKLIST.filter((item) => item.section === section.id);
          const progress = hasError
            ? null
            : result.bySection.find((entry) => entry.id === section.id);
          return (
            <div
              key={section.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{section.label}</h2>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {progress ? `${progress.done}/${progress.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-1">
                {items.map((item) => {
                  const checked = done.has(item.id);
                  return (
                    <li key={item.id}>
                      <label
                        className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-[var(--muted)]"
                        htmlFor={`item-${item.id}`}
                      >
                        <input
                          id={`item-${item.id}`}
                          type="checkbox"
                          className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                          checked={checked}
                          onChange={() => toggle(item.id)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                            {SEVERITY_LABEL[item.severity]} · {SEVERITY_WEIGHT[item.severity]} pt
                            {SEVERITY_WEIGHT[item.severity] === 1 ? "" : "s"} · {item.basis}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Scoring is weighted out of {TOTAL_WEIGHT} points across {CHECKLIST.length} items. This is a
        practical safety audit, not legal advice — tenancy obligations and fire codes vary by
        country, state and municipality, so confirm anything you plan to raise with your landlord
        against your local rules.
      </p>
    </main>
  );
}
