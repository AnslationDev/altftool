"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import {
  CONDONATION_FLOOR_PERCENT,
  REQUIRED_PERCENT,
  analyseAttendance,
  percentAfterAttending,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${num(value)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  held: "40",
  attended: "28",
  totalPlanned: "60",
  classesPerWeek: "4",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const STATUS_STYLE = {
  eligible: "bg-[var(--success-soft)] text-[var(--success)]",
  condonable: "bg-[var(--muted)] text-[var(--foreground)]",
  detained: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export default function ToolHome() {
  const [held, setHeld] = useState(DEFAULTS.held);
  const [attended, setAttended] = useState(DEFAULTS.attended);
  const [totalPlanned, setTotalPlanned] = useState(DEFAULTS.totalPlanned);
  const [classesPerWeek, setClassesPerWeek] = useState(DEFAULTS.classesPerWeek);
  const [copied, setCopied] = useState(false);

  const heldNum = toNumber(held);
  const attendedNum = toNumber(attended);

  const result = useMemo(
    () =>
      analyseAttendance({
        held: heldNum,
        attended: attendedNum,
        totalPlanned: toNumber(totalPlanned),
        classesPerWeek: toNumber(classesPerWeek),
      }),
    [heldNum, attendedNum, totalPlanned, classesPerWeek],
  );

  const ok = !result.error;

  const projection = useMemo(() => {
    if (!ok) return [];
    return [2, 4, 6, 8, 10, 12].map((extra) => ({
      extra,
      percent: percentAfterAttending(heldNum, attendedNum, extra),
    }));
  }, [ok, heldNum, attendedNum]);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Anna University attendance",
      `Attendance: ${pct(result.percent)} (${result.attended} of ${result.held} classes)`,
      `Status: ${result.status.title}`,
    ];
    if (result.needForRequired > 0) {
      lines.push(
        `Attend ${result.needForRequired} classes in a row to reach ${REQUIRED_PERCENT}%`,
      );
    } else {
      lines.push(`You can miss ${result.canMiss} more classes and stay at ${REQUIRED_PERCENT}%`);
    }
    if (result.plan) {
      lines.push(
        `Term plan: attend ${result.plan.stillNeeded} of the ${result.plan.remaining} classes left (${result.plan.mustAttendOverall} of ${result.plan.totalPlanned} overall)`,
      );
    }
    return lines.join("\n");
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
    setHeld(DEFAULTS.held);
    setAttended(DEFAULTS.attended);
    setTotalPlanned(DEFAULTS.totalPlanned);
    setClassesPerWeek(DEFAULTS.classesPerWeek);
    setCopied(false);
  };

  const barWidth = ok ? Math.max(0, Math.min(100, result.percent)) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Anna University
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Anna University Attendance Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out your attendance percentage for one course, which side of the{" "}
          {REQUIRED_PERCENT}% exam requirement you sit on, and exactly how many classes it takes to
          get back above the line.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="anna-held">
              Classes held so far
            </label>
            <input
              id="anna-held"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1000"
              step="1"
              value={held}
              onChange={(event) => setHeld(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="anna-attended">
              Classes you attended
            </label>
            <input
              id="anna-attended"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1000"
              step="1"
              value={attended}
              onChange={(event) => setAttended(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="anna-total">
              Classes planned for the whole term (optional)
            </label>
            <input
              id="anna-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1000"
              step="1"
              value={totalPlanned}
              onChange={(event) => setTotalPlanned(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave blank if the timetable is open-ended.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="anna-per-week">
              Classes of this course per week (optional)
            </label>
            <input
              id="anna-per-week"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={classesPerWeek}
              onChange={(event) => setClassesPerWeek(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Attendance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? pct(result.percent) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.attended} attended of ${result.held} held · ${result.missed} missed`
                : "Correct the class counts above to see your attendance."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy attendance result"
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

        {ok ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Attendance ${num(result.percent)} percent against a ${REQUIRED_PERCENT} percent requirement`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {CONDONATION_FLOOR_PERCENT}% condonation floor · {REQUIRED_PERCENT}% exam requirement
            </p>
            <p className={`mt-3 rounded-md px-3 py-2 text-sm font-medium ${STATUS_STYLE[result.status.key]}`}>
              <span className="font-semibold">{result.status.title}.</span> {result.status.detail}
            </p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              `Classes to attend in a row for ${REQUIRED_PERCENT}%`,
              ok ? (result.needForRequired === null ? "Not reachable" : String(result.needForRequired)) : DASH,
            ],
            [
              `Classes to attend in a row for ${CONDONATION_FLOOR_PERCENT}%`,
              ok
                ? result.needForCondonation === null
                  ? "Not reachable"
                  : String(result.needForCondonation)
                : DASH,
            ],
            [
              `Classes you can still miss and hold ${REQUIRED_PERCENT}%`,
              ok && result.canMiss !== null ? String(result.canMiss) : DASH,
            ],
            [
              "Weeks of full attendance to clear the requirement",
              ok && result.weeks && result.weeks.weeksToRequired !== null
                ? `${num(result.weeks.weeksToRequired)} weeks at ${result.weeks.classesPerWeek} a week`
                : DASH,
            ],
            [
              "Classes you must attend across the whole term",
              ok && result.plan ? `${result.plan.mustAttendOverall} of ${result.plan.totalPlanned}` : DASH,
            ],
            [
              "Of the classes still to come, you must attend",
              ok && result.plan ? `${result.plan.stillNeeded} of ${result.plan.remaining}` : DASH,
            ],
            [
              "Classes you can still skip this term",
              ok && result.plan ? String(result.plan.skippableFromHere) : DASH,
            ],
            [
              "Best percentage still possible",
              ok && result.plan ? pct(result.plan.bestPossiblePercent) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.plan && !result.plan.feasible ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Even attending every remaining class only reaches{" "}
            {pct(result.plan.bestPossiblePercent)}, short of {REQUIRED_PERCENT}%. Talk to your
            department about the condonation route now rather than at the end of term.
          </p>
        ) : null}

        {ok ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[20rem] text-sm">
              <caption className="sr-only">
                Attendance percentage after attending more classes without missing any
              </caption>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Attend next</th>
                  <th scope="col" className="py-2 text-right font-semibold">Attendance becomes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {projection.map((row) => (
                  <tr key={row.extra}>
                    <td className="py-2 pr-3">{row.extra} classes</td>
                    <td className="py-2 text-right font-semibold">
                      {row.percent === null ? DASH : pct(row.percent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Condonation is granted by your college under the university&apos;s rules
        and usually needs documentation and a fee — the bands here are the standard ones, not an
        assurance that a shortage will be condoned. Check the current regulation for your batch.
      </p>
    </main>
  );
}
