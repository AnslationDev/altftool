"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import { FAMILY_HISTORY_OPTIONS, addMonths, parseISODate, planProstateScreening, toISODate } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);
const two = (value) => (Number.isFinite(value) ? NUM2.format(value) : DASH);

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(ms) ? DATE_FMT.format(new Date(ms)) : DASH;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Default the "last discussion" to 14 months ago so the page opens on a live plan. */
const defaultLastDiscussion = () => toISODate(addMonths(parseISODate(todayISO()), -14));

const DEFAULTS = {
  age: "52",
  africanAncestry: false,
  familyHistory: "none",
  geneticRisk: false,
  lastPsa: "1.2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  overdue: "bg-[var(--danger-soft)] text-[var(--danger)]",
  "due-soon": "bg-[var(--warning-soft)] text-[var(--warning)]",
  scheduled: "bg-[var(--success-soft)] text-[var(--success)]",
  "not-scheduled": "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const STATUS_LABEL = {
  overdue: "Overdue",
  "due-soon": "Coming up",
  scheduled: "Scheduled",
  "not-scheduled": "Nothing scheduled yet",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  return Number(trimmed.replace(/,/g, ""));
};

export default function ToolHome() {
  const [today, setToday] = useState(todayISO);
  const [age, setAge] = useState(DEFAULTS.age);
  const [africanAncestry, setAfricanAncestry] = useState(DEFAULTS.africanAncestry);
  const [familyHistory, setFamilyHistory] = useState(DEFAULTS.familyHistory);
  const [geneticRisk, setGeneticRisk] = useState(DEFAULTS.geneticRisk);
  const [lastPsa, setLastPsa] = useState(DEFAULTS.lastPsa);
  const [lastDiscussion, setLastDiscussion] = useState(defaultLastDiscussion);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planProstateScreening({
        age: toNumber(age),
        africanAncestry,
        familyHistory,
        geneticRisk,
        lastPsa: toNumber(lastPsa),
        lastDiscussionISO: lastDiscussion,
        todayISO: today,
      }),
    [age, africanAncestry, familyHistory, geneticRisk, lastPsa, lastDiscussion, today],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Prostate Screening Reminder Planner",
      `Risk tier: ${result.riskTier}`,
      `Discussion usually offered from age: ${zero(result.startAge)}`,
      result.eligible
        ? "You are already at or past that age."
        : `That is ${zero(result.yearsUntilStart)} year(s) away.`,
      result.intervalMonths
        ? `Suggested re-test interval: every ${zero(result.intervalMonths)} months`
        : "No interval yet — no baseline PSA recorded.",
      result.nextDueISO ? `Next discussion due: ${result.nextDueISO}` : "Next discussion: not scheduled",
      ...result.notes.map((note) => `- ${note}`),
    ].join("\n");
  }, [ok, result]);

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
    setToday(todayISO());
    setAge(DEFAULTS.age);
    setAfricanAncestry(DEFAULTS.africanAncestry);
    setFamilyHistory(DEFAULTS.familyHistory);
    setGeneticRisk(DEFAULTS.geneticRisk);
    setLastPsa(DEFAULTS.lastPsa);
    setLastDiscussion(defaultLastDiscussion());
    setCopied(false);
  };

  const rows = [
    ["Risk tier", ok ? result.riskTier : DASH],
    [
      "Already at the usual starting age",
      ok ? (result.eligible ? "Yes" : `No — ${zero(result.yearsUntilStart)} year(s) to go`) : DASH,
    ],
    ["Last recorded PSA", ok && result.hasPsa ? `${two(result.lastPsa)} ng/mL` : DASH],
    [
      "Suggested re-test interval",
      ok && result.intervalMonths ? `Every ${zero(result.intervalMonths)} months` : DASH,
    ],
    ["Last discussion / test", ok && result.lastDiscussionISO ? prettyDate(result.lastDiscussionISO) : DASH],
    ["Next discussion due", ok && result.nextDueISO ? prettyDate(result.nextDueISO) : DASH],
    [
      "Days until due",
      ok && result.daysUntilDue !== null ? zero(result.daysUntilDue) : DASH,
    ],
    ["USPSTF 55–69 window", ok ? (result.inUspstfWindow ? "Yes" : "No") : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Men&apos;s health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Prostate Screening Reminder Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your age and risk factors to see the age at which guidelines suggest starting the
          PSA conversation, the published re-test interval for your last result, and when the next
          discussion falls due.
        </p>
      </header>

      <p className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
        Informational scheduling aid only. It does not recommend for or against screening and it is
        not medical advice — PSA testing is a shared decision to make with your clinician.
      </p>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-age">
              Age (years)
            </label>
            <input
              id="ps-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-family">
              Family history
            </label>
            <select
              id="ps-family"
              className={`mt-2 ${INPUT_CLASS}`}
              value={familyHistory}
              onChange={(event) => setFamilyHistory(event.target.value)}
            >
              {FAMILY_HISTORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-psa">
              Most recent PSA (ng/mL, 0 if never tested)
            </label>
            <input
              id="ps-psa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={lastPsa}
              onChange={(event) => setLastPsa(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-last">
              Date of that test or discussion
            </label>
            <input
              id="ps-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastDiscussion}
              max={today}
              onChange={(event) => setLastDiscussion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-today">
              Today&apos;s date
            </label>
            <input
              id="ps-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div className="grid gap-3">
            <label className={CHECK_CLASS} htmlFor="ps-ancestry">
              <input
                id="ps-ancestry"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={africanAncestry}
                onChange={(event) => setAfricanAncestry(event.target.checked)}
              />
              Black or African ancestry
            </label>
            <label className={CHECK_CLASS} htmlFor="ps-genetic">
              <input
                id="ps-genetic"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={geneticRisk}
                onChange={(event) => setGeneticRisk(event.target.checked)}
              />
              Known BRCA1, BRCA2 or Lynch syndrome
            </label>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Discussion usually starts at age
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? zero(result.startAge) : DASH}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
              {ok ? (
                <>
                  <span>{result.riskTier}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[result.dueStatus]}`}
                  >
                    {STATUS_LABEL[result.dueStatus]}
                  </span>
                </>
              ) : (
                "Fix the inputs above to see a plan."
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy screening plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && result.notes.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What the guidelines say for you</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Starting ages follow the American Cancer Society risk tiers; the 55–69 shared-decision window
        and the recommendation against routine screening from 70 follow the 2018 USPSTF statement.
        National programmes differ — in the UK, for example, there is no screening programme and men
        over 50 may request a PSA test after a discussion. Always decide with a clinician.
      </p>
    </main>
  );
}
