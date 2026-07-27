"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_STUDY_HOURS_PER_DAY,
  STATE_COMMISSIONS,
  addDays,
  buildCountdown,
  buildStudyPlan,
  commissionById,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Default spacing used only to pre-fill the date boxes on first load. */
const DEFAULT_PRELIMS_IN_DAYS = 120;
const DEFAULT_MAINS_AFTER_PRELIMS = 120;
const DEFAULT_INTERVIEW_AFTER_MAINS = 100;

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function prettyDate(iso) {
  if (!iso) return DASH;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return DASH;
  return DATE_FMT.format(parsed);
}

export default function ToolHome() {
  const [today, setToday] = useState("");
  const [commissionId, setCommissionId] = useState("uppsc");
  const [prelims, setPrelims] = useState("");
  const [mains, setMains] = useState("");
  const [interview, setInterview] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("6");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const start = localToday();
    setToday(start);
    setPrelims(addDays(start, DEFAULT_PRELIMS_IN_DAYS) || "");
    setMains(addDays(start, DEFAULT_PRELIMS_IN_DAYS + DEFAULT_MAINS_AFTER_PRELIMS) || "");
    setInterview(
      addDays(
        start,
        DEFAULT_PRELIMS_IN_DAYS + DEFAULT_MAINS_AFTER_PRELIMS + DEFAULT_INTERVIEW_AFTER_MAINS,
      ) || "",
    );
  }, []);

  const commission = commissionById(commissionId);

  const result = useMemo(
    () =>
      today
        ? buildCountdown({
            todayIso: today,
            prelimsIso: prelims,
            mainsIso: mains,
            interviewIso: interview,
            studyHoursPerDay: Number(hoursPerDay),
          })
        : { error: "Loading today's date…" },
    [today, prelims, mains, interview, hoursPerDay],
  );

  const plan = useMemo(() => {
    if (result.error || !result.next) return { error: "Every stage on this list is already over." };
    return buildStudyPlan({
      todayIso: today,
      targetIso: result.next.dateIso,
      studyHoursPerDay: Number(hoursPerDay),
    });
  }, [result, today, hoursPerDay]);

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      `${commission ? commission.abbr : "State PSC"} exam countdown (as on ${prettyDate(today)})`,
    ];
    result.stages.forEach((stage) => {
      const when = stage.status === "past" ? "already held" : `${NUM.format(stage.daysLeft)} days left`;
      lines.push(`${stage.label}: ${prettyDate(stage.dateIso)} — ${when}`);
    });
    if (result.prelimsToMains !== null) {
      lines.push(`Gap between prelims and mains: ${NUM.format(result.prelimsToMains)} days`);
    }
    if (result.next) {
      lines.push(
        `Study hours available before the ${result.next.label.toLowerCase()}: ${NUM.format(result.next.studyHours)} at ${result.studyHoursPerDay} h a day`,
      );
    }
    return lines.join("\n");
  }, [result, commission, today]);

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
    const start = localToday();
    setToday(start);
    setCommissionId("uppsc");
    setPrelims(addDays(start, DEFAULT_PRELIMS_IN_DAYS) || "");
    setMains(addDays(start, DEFAULT_PRELIMS_IN_DAYS + DEFAULT_MAINS_AFTER_PRELIMS) || "");
    setInterview(
      addDays(
        start,
        DEFAULT_PRELIMS_IN_DAYS + DEFAULT_MAINS_AFTER_PRELIMS + DEFAULT_INTERVIEW_AFTER_MAINS,
      ) || "",
    );
    setHoursPerDay("6");
    setCopied(false);
  };

  const hasResult = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          State PSC
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          State PSC Exam Countdown
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your state commission, enter the prelims, mains and interview dates from its
          notification, and see exactly how many days, weeks and study hours are left before each
          stage.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="psc-commission">
              State commission
            </label>
            <select
              id="psc-commission"
              className={`mt-2 ${INPUT_CLASS}`}
              value={commissionId}
              onChange={(event) => setCommissionId(event.target.value)}
            >
              {STATE_COMMISSIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.abbr === item.name ? item.name : `${item.abbr} — ${item.name}`}
                </option>
              ))}
            </select>
            {commission && commission.exam ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {commission.exam}
                {commission.site ? ` · dates are published on ${commission.site}` : ""}
              </p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="psc-today">
              Today&apos;s date
            </label>
            <input
              id="psc-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="psc-hours">
              Study hours a day (0–{MAX_STUDY_HOURS_PER_DAY})
            </label>
            <input
              id="psc-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_STUDY_HOURS_PER_DAY}
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="psc-prelims">
              Preliminary exam date
            </label>
            <input
              id="psc-prelims"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={prelims}
              onChange={(event) => setPrelims(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="psc-mains">
              Main exam date (optional)
            </label>
            <input
              id="psc-mains"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={mains}
              onChange={(event) => setMains(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="psc-interview">
              Interview / personality test date (optional)
            </label>
            <input
              id="psc-interview"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={interview}
              onChange={(event) => setInterview(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {hasResult && result.next ? `Days to ${result.next.label.toLowerCase()}` : "Days to next stage"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult && result.next ? NUM.format(result.next.daysLeft) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasResult && result.next
                ? `${prettyDate(result.next.dateIso)} · ${NUM1.format(result.next.weeksLeft)} weeks`
                : "Set a future exam date to see the countdown."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the exam countdown"
              className={GHOST_BTN}
              disabled={!hasResult}
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
          {[
            [
              "Study hours left before the next stage",
              hasResult && result.next ? `${NUM.format(result.next.studyHours)} hours` : DASH,
            ],
            [
              "Gap between prelims and mains",
              hasResult && result.prelimsToMains !== null
                ? `${NUM.format(result.prelimsToMains)} days`
                : DASH,
            ],
            [
              "Gap between mains and interview",
              hasResult && result.mainsToInterview !== null
                ? `${NUM.format(result.mainsToInterview)} days`
                : DASH,
            ],
            [
              "Days to the final stage on your list",
              hasResult && result.totalDaysToLastStage !== null
                ? `${NUM.format(Math.max(0, result.totalDaysToLastStage))} days`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Stage by stage</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Stage
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Days
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Weeks
                </th>
              </tr>
            </thead>
            <tbody>
              {hasResult ? (
                result.stages.map((stage) => (
                  <tr key={stage.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{stage.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {prettyDate(stage.dateIso)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {stage.status === "past"
                        ? "Held"
                        : stage.status === "today"
                          ? "Today"
                          : NUM.format(stage.daysLeft)}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {stage.status === "upcoming" ? NUM1.format(stage.weeksLeft) : DASH}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Suggested split of the time left</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          A planning heuristic, not a commission rule: half the time on first reading, then
          revision, then full-length mocks.
        </p>
        {plan.error ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{plan.error}</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {plan.phases.map((phase) => (
              <li
                key={phase.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] px-3 py-2"
              >
                <span className="font-semibold">{phase.label}</span>
                <span className="text-[var(--muted-foreground)]">
                  {NUM.format(phase.days)} days · {NUM.format(phase.hours)} h · up to{" "}
                  {prettyDate(phase.endsOn)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Commissions revise their calendars often, and a stage can shift by weeks. Always confirm
        each date against the official notification or annual calendar on the commission&apos;s own
        website before you plan around it.
      </p>
    </main>
  );
}
