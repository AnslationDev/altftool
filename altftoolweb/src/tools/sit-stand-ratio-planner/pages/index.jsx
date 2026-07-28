"use client";

import { useMemo, useState } from "react";
import { Armchair, Check, Copy, RotateCcw } from "lucide-react";

import {
  CYCLE_OPTIONS,
  MEETING_PLACEMENTS,
  formatClock,
  formatDuration,
  planSitStand,
} from "../lib";

const DEFAULTS = {
  workdayHours: "8",
  meetingHours: "2",
  standingTargetHours: "2",
  cycleMinutes: "60",
  meetingPlacement: "midday",
  startTime: "09:00",
};

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const KCAL = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MODE_LABEL = { sit: "Sit", stand: "Stand", meeting: "Meeting (seated)" };
const DASH = "—";

export default function ToolHome() {
  const [workdayHours, setWorkdayHours] = useState(DEFAULTS.workdayHours);
  const [meetingHours, setMeetingHours] = useState(DEFAULTS.meetingHours);
  const [standingTargetHours, setStandingTargetHours] = useState(DEFAULTS.standingTargetHours);
  const [cycleMinutes, setCycleMinutes] = useState(DEFAULTS.cycleMinutes);
  const [meetingPlacement, setMeetingPlacement] = useState(DEFAULTS.meetingPlacement);
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planSitStand({
        workdayHours,
        meetingHours,
        standingTargetHours,
        cycleMinutes,
        meetingPlacement,
        startTime,
      }),
    [workdayHours, meetingHours, standingTargetHours, cycleMinutes, meetingPlacement, startTime],
  );

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Sit-Stand Ratio Planner",
      `Workday: ${formatClock(plan.dayStart)} to ${formatClock(plan.dayEnd)} (${formatDuration(plan.totalMin)})`,
      `Standing: ${formatDuration(plan.standingMin)} (${PCT.format(plan.standingSharePct)}% of the day)`,
      `Seated: ${formatDuration(plan.seatedMin)}`,
      `Rotation: sit ${plan.sitPerCycle} min, stand ${plan.standPerCycle} min, per ${plan.cycleMinutes}-minute cycle`,
      "",
      ...plan.blocks.map(
        (block) =>
          `${formatClock(block.start)} - ${formatClock(block.end)}  ${MODE_LABEL[block.mode]} (${formatDuration(block.minutes)})`,
      ),
    ];
    return lines.join("\n");
  }, [hasError, plan]);

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
    setWorkdayHours(DEFAULTS.workdayHours);
    setMeetingHours(DEFAULTS.meetingHours);
    setStandingTargetHours(DEFAULTS.standingTargetHours);
    setCycleMinutes(DEFAULTS.cycleMinutes);
    setMeetingPlacement(DEFAULTS.meetingPlacement);
    setStartTime(DEFAULTS.startTime);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Seated time", DASH],
        ["Share of the workday standing", DASH],
        ["Rotation", DASH],
        ["Standing blocks", DASH],
        ["Posture changes", DASH],
        ["Longest unbroken sit", DASH],
        ["Extra energy vs sitting all day", DASH],
      ]
    : [
        ["Seated time", formatDuration(plan.seatedMin)],
        ["Share of the workday standing", `${PCT.format(plan.standingSharePct)}%`],
        [
          "Rotation",
          `Sit ${plan.sitPerCycle} min, stand ${plan.standPerCycle} min, every ${plan.cycleMinutes} min`,
        ],
        ["Standing blocks", `${plan.standingSessions}`],
        ["Posture changes", `${plan.postureChanges}`],
        ["Longest unbroken sit", formatDuration(plan.longestSeated)],
        ["Extra energy vs sitting all day", `${KCAL.format(plan.extraKcal)} kcal`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Armchair className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sit-Stand Ratio Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your workday, your locked-in seated meetings and how much standing you want to
          accumulate. You get a clock-timed rotation you can copy straight into a calendar.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-start">
              Workday starts (24-hour clock)
            </label>
            <input
              id="ssr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              placeholder="09:00"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-workday">
              Workday length (hours at the desk)
            </label>
            <input
              id="ssr-workday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="16"
              step="0.5"
              value={workdayHours}
              onChange={(event) => setWorkdayHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-meetings">
              Seated meeting hours
            </label>
            <input
              id="ssr-meetings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={meetingHours}
              onChange={(event) => setMeetingHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-target">
              Standing target (hours per day)
            </label>
            <input
              id="ssr-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={standingTargetHours}
              onChange={(event) => setStandingTargetHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-cycle">
              Rotation cycle length (minutes)
            </label>
            <select
              id="ssr-cycle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cycleMinutes}
              onChange={(event) => setCycleMinutes(event.target.value)}
            >
              {CYCLE_OPTIONS.map((option) => (
                <option key={option} value={String(option)}>
                  {option} minutes
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssr-placement">
              When your meetings sit
            </label>
            <select
              id="ssr-placement"
              className={`mt-2 ${INPUT_CLASS}`}
              value={meetingPlacement}
              onChange={(event) => setMeetingPlacement(event.target.value)}
            >
              {MEETING_PLACEMENTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["Starter (2 h)", "2"],
            ["Building (3 h)", "3"],
            ["Expert target (4 h)", "4"],
          ].map(([label, value]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStandingTargetHours(value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Standing per day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(plan.standingMin)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your rotation."
                : `${formatClock(plan.dayStart)} to ${formatClock(plan.dayEnd)}, spread over ${plan.standingSessions} standing block${plan.standingSessions === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sit-stand rotation plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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

        {!hasError && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Standing is ${PCT.format(plan.standingSharePct)} percent of the workday`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, plan.standingSharePct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Standing {PCT.format(plan.standingSharePct)}% · Seated{" "}
              {PCT.format(100 - plan.standingSharePct)}%
            </p>
          </div>
        )}
      </section>

      {!hasError && plan.warnings.length > 0 && (
        <ul className="mt-6 space-y-2">
          {plan.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your day, block by block</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Time
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Posture
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.blocks.map((block) => (
                  <tr
                    key={`${block.start}-${block.mode}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatClock(block.start)} – {formatClock(block.end)}
                    </td>
                    <td
                      className={`py-2 pr-3 font-semibold ${
                        block.mode === "stand" ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {MODE_LABEL[block.mode]}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {formatDuration(block.minutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid, not medical advice. Build standing time up gradually and speak to
        a clinician or occupational therapist if you have back, hip, knee, circulatory or pregnancy
        related concerns about standing at work.
      </p>
    </main>
  );
}
