"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import { RISK_FACTORS, planCheckup } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DEFAULTS = {
  age: "34",
  lastExam: "2024-03-15",
  today: "2026-07-28",
  screenHours: "8",
};

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(ms) ? DATE_FMT.format(new Date(ms)) : DASH;
};

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [lastExam, setLastExam] = useState(DEFAULTS.lastExam);
  const [today, setToday] = useState(DEFAULTS.today);
  const [screenHours, setScreenHours] = useState(DEFAULTS.screenHours);
  const [riskIds, setRiskIds] = useState([]);
  const [contactLenses, setContactLenses] = useState(false);
  const [symptoms, setSymptoms] = useState(false);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planCheckup({
        age: toNumber(age),
        lastExamDate: lastExam,
        todayDate: today,
        riskIds,
        contactLenses,
        screenHours: toNumber(screenHours),
        symptoms,
      }),
    [age, lastExam, today, riskIds, contactLenses, screenHours, symptoms],
  );

  const hasError = Boolean(plan.error);

  const toggleRisk = (id) => {
    setRiskIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const headline = hasError
    ? DASH
    : plan.daysUntilDue >= 0
      ? `in ${plan.daysUntilDue} day${plan.daysUntilDue === 1 ? "" : "s"}`
      : `${Math.abs(plan.daysUntilDue)} day${Math.abs(plan.daysUntilDue) === 1 ? "" : "s"} overdue`;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Eye Checkup Reminder Planner",
      `Age band: ${plan.band.label}`,
      `Recommended interval: ${plan.months} months`,
      ...plan.reasons.map((reason) => `- ${reason}`),
      `Last examination: ${plan.lastExamDate} (${plan.monthsSinceLast} months ago)`,
      `Next due: ${plan.dueIso} — ${headline}`,
      `Status: ${plan.statusLabel}`,
    ].join("\n");
  }, [plan, hasError, headline]);

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
    setAge(DEFAULTS.age);
    setLastExam(DEFAULTS.lastExam);
    setToday(DEFAULTS.today);
    setScreenHours(DEFAULTS.screenHours);
    setRiskIds([]);
    setContactLenses(false);
    setSymptoms(false);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Age band", DASH],
        ["Recommended interval", DASH],
        ["Last examination", DASH],
        ["Time since last exam", DASH],
        ["Status", DASH],
        ["Risk factors recorded", DASH],
        ["Contact lens aftercare", DASH],
      ]
    : [
        ["Age band", plan.band.label],
        ["Recommended interval", `${plan.months} months`],
        ["Last examination", prettyDate(plan.lastExamDate)],
        ["Time since last exam", `${NUM.format(plan.monthsSinceLast)} months (${plan.daysSinceLast} days)`],
        ["Status", plan.statusLabel],
        [
          "Risk factors recorded",
          plan.risks.length > 0 ? plan.risks.map((risk) => risk.label).join(", ") : "None",
        ],
        ["Contact lens aftercare", plan.contactLenses ? "Yes — annual review" : "Not applicable"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Eye Checkup Reminder Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Applies the published age-based examination intervals — annual for children and from 65,
          at least every two years for low-risk adults — then shortens the interval where a risk
          factor or contact lens wear calls for it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-age">
              Age (years)
            </label>
            <input
              id="ecr-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-screen">
              Screen hours per day
            </label>
            <input
              id="ecr-screen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={screenHours}
              onChange={(event) => setScreenHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-last">
              Last eye examination
            </label>
            <input
              id="ecr-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastExam}
              onChange={(event) => setLastExam(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-today">
              Check against this date
            </label>
            <input
              id="ecr-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Risk factors</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {RISK_FACTORS.map((risk) => {
              const checked = riskIds.includes(risk.id);
              return (
                <label
                  key={risk.id}
                  htmlFor={`risk-${risk.id}`}
                  className={`${CHECK_ROW} ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`risk-${risk.id}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRisk(risk.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  />
                  <span className="font-medium">{risk.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            htmlFor="ecr-lenses"
            className={`${CHECK_ROW} ${
              contactLenses ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)] bg-[var(--background)]"
            }`}
          >
            <input
              id="ecr-lenses"
              type="checkbox"
              checked={contactLenses}
              onChange={(event) => {
                setContactLenses(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            />
            <span className="font-medium">I wear contact lenses</span>
          </label>
          <label
            htmlFor="ecr-symptoms"
            className={`${CHECK_ROW} ${
              symptoms ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)] bg-[var(--background)]"
            }`}
          >
            <input
              id="ecr-symptoms"
              type="checkbox"
              checked={symptoms}
              onChange={(event) => {
                setSymptoms(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            />
            <span className="font-medium">I have new or changing vision symptoms</span>
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next eye examination due
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && (plan.status === "overdue" || plan.status === "symptoms")
                  ? "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : prettyDate(plan.dueIso)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a due date." : `${headline} · ${plan.statusLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the eye examination schedule"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Why this interval</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {plan.reasons.map((reason) => (
              <li key={reason} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{plan.guidance}</p>
          {plan.notes.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {plan.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. These are general recommended intervals, not medical advice, and your
        own optometrist or ophthalmologist may set a different schedule. Sudden flashes, new
        floaters, a shadow or curtain across the vision, sudden blur, double vision or eye pain need
        same-day attention regardless of when the last examination was.
      </p>
    </main>
  );
}
