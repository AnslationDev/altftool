"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";

import {
  DEFAULT_OVERHEAD_PCT,
  MAX_HOURS_PER_DAY,
  MAX_OVERHEAD_PCT,
  MAX_SPRINT_DAYS,
  MAX_TEAM_SIZE,
  MIN_HOURS_PER_DAY,
  computeSprintCapacity,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const num = (value) => (value.trim() === "" ? Number.NaN : Number(value));

const DEFAULTS = {
  teamSize: "5",
  sprintWorkingDays: "10",
  hoursPerDay: "8",
  publicHolidays: "1",
  leavePersonDays: "4",
  overheadPercent: String(DEFAULT_OVERHEAD_PCT),
};

export default function ToolHome() {
  const [teamSize, setTeamSize] = useState(DEFAULTS.teamSize);
  const [sprintWorkingDays, setSprintWorkingDays] = useState(DEFAULTS.sprintWorkingDays);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [publicHolidays, setPublicHolidays] = useState(DEFAULTS.publicHolidays);
  const [leavePersonDays, setLeavePersonDays] = useState(DEFAULTS.leavePersonDays);
  const [overheadPercent, setOverheadPercent] = useState(DEFAULTS.overheadPercent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSprintCapacity({
        teamSize: num(teamSize),
        sprintWorkingDays: num(sprintWorkingDays),
        hoursPerDay: num(hoursPerDay),
        publicHolidays: num(publicHolidays),
        leavePersonDays: num(leavePersonDays),
        overheadPercent: num(overheadPercent),
      }),
    [teamSize, sprintWorkingDays, hoursPerDay, publicHolidays, leavePersonDays, overheadPercent],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sprint capacity",
      `Team: ${teamSize} people × ${sprintWorkingDays} days × ${hoursPerDay} h`,
      `Gross person-days: ${NUM.format(result.grossPersonDays)}`,
      `Minus holidays (${NUM.format(result.holidayPersonDays)} pd) and leave (${NUM.format(result.leavePersonDays)} pd)`,
      `Available person-days: ${NUM.format(result.availablePersonDays)}`,
      `Overhead ${overheadPercent}%: −${NUM.format(result.overheadHours)} h`,
      `Net capacity: ${NUM.format(result.netCapacityHours)} h (${NUM.format(result.netCapacityPersonDays)} person-days)`,
      `Per person: ${NUM.format(result.perPersonHours)} h`,
    ].join("\n");
  }, [hasError, result, teamSize, sprintWorkingDays, hoursPerDay, overheadPercent]);

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
    setTeamSize(DEFAULTS.teamSize);
    setSprintWorkingDays(DEFAULTS.sprintWorkingDays);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setPublicHolidays(DEFAULTS.publicHolidays);
    setLeavePersonDays(DEFAULTS.leavePersonDays);
    setOverheadPercent(DEFAULTS.overheadPercent);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Gross person-days", DASH],
        ["Holiday person-days", DASH],
        ["Available person-days", DASH],
        ["Overhead deduction", DASH],
        ["Per-person capacity", DASH],
        ["Utilisation of theoretical max", DASH],
      ]
    : [
        ["Gross person-days", NUM.format(result.grossPersonDays)],
        ["Holiday person-days", NUM.format(result.holidayPersonDays)],
        ["Leave person-days", NUM.format(result.leavePersonDays)],
        ["Available person-days", NUM.format(result.availablePersonDays)],
        ["Overhead deduction", `${NUM.format(result.overheadHours)} h`],
        ["Net capacity in person-days", NUM.format(result.netCapacityPersonDays)],
        ["Per-person capacity", `${NUM.format(result.perPersonHours)} h`],
        ["Utilisation of theoretical max", `${NUM.format(result.utilisationPercent)}%`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Engineering process
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sprint Capacity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Capacity = (headcount × working days − holidays − leave) × hours per day, minus an
          overhead percentage for ceremonies and support. Enter your sprint&apos;s facts to get
          the hours the team can honestly commit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scc-team">
              Team size (people, 1–{MAX_TEAM_SIZE})
            </label>
            <input
              id="scc-team"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_TEAM_SIZE}
              value={teamSize}
              onChange={(event) => setTeamSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scc-days">
              Sprint working days (1–{MAX_SPRINT_DAYS})
            </label>
            <input
              id="scc-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_SPRINT_DAYS}
              value={sprintWorkingDays}
              onChange={(event) => setSprintWorkingDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              10 for a two-week sprint, weekends excluded.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scc-hours">
              Working hours per day ({MIN_HOURS_PER_DAY}–{MAX_HOURS_PER_DAY})
            </label>
            <input
              id="scc-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_HOURS_PER_DAY}
              max={MAX_HOURS_PER_DAY}
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scc-holidays">
              Public holidays in the sprint (days)
            </label>
            <input
              id="scc-holidays"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={publicHolidays}
              onChange={(event) => setPublicHolidays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Days off for the whole team at once.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scc-leave">
              Planned leave (total person-days)
            </label>
            <input
              id="scc-leave"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={leavePersonDays}
              onChange={(event) => setLeavePersonDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Sum across people: two devs out 2 days each = 4.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scc-overhead">
              Ceremony + support overhead (% of hours, 0–{MAX_OVERHEAD_PCT})
            </label>
            <input
              id="scc-overhead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_OVERHEAD_PCT}
              value={overheadPercent}
              onChange={(event) => setOverheadPercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Scrum ceremonies alone are ≈12.5% of a two-week sprint; 15% adds support slack.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
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
              Net sprint capacity
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.netCapacityHours)} h`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${NUM.format(result.availablePersonDays)} available person-days after holidays and leave, less ${overheadPercent}% overhead.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the sprint capacity result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Capacity is an upper bound, not a commitment target — teams that plan to 100% of
        capacity have no room for the unplanned work every sprint contains. Many teams commit
        to about 80% of the net figure.
      </p>
    </main>
  );
}
