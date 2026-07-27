"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import {
  FORMAT_PRESETS,
  FULL_TIME_HOURS,
  HIGH_RISK_WEEKLY_HOURS,
  MIN_ADULT_SLEEP_HOURS,
  SCORE_WEIGHTS,
  WORKING_TIME_LIMIT_HOURS,
  computeWorkload,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const hours = (value) => `${NUM.format(value)} h`;
const pct = (value) => `${NUM0.format(value)}%`;

const DEFAULTS = {
  adminHours: "6",
  daysOff: "1",
  sleep: "7",
  weeksSinceBreak: "6",
  target: String(FULL_TIME_HOURS),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return String(raw).trim() === "" ? NaN : value;
};

export default function ToolHome() {
  const [rows, setRows] = useState(() =>
    FORMAT_PRESETS.map((preset) => ({
      id: preset.id,
      label: preset.label,
      count: String(preset.count),
      hoursEach: String(preset.hoursEach),
    })),
  );
  const [adminHours, setAdminHours] = useState(DEFAULTS.adminHours);
  const [daysOff, setDaysOff] = useState(DEFAULTS.daysOff);
  const [sleep, setSleep] = useState(DEFAULTS.sleep);
  const [weeksSinceBreak, setWeeksSinceBreak] = useState(DEFAULTS.weeksSinceBreak);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeWorkload({
        items: rows.map((row) => ({
          id: row.id,
          label: row.label,
          count: toNumber(row.count),
          hoursEach: toNumber(row.hoursEach),
        })),
        adminHours: toNumber(adminHours),
        daysOffPerWeek: toNumber(daysOff),
        sleepHours: toNumber(sleep),
        weeksSinceBreak: toNumber(weeksSinceBreak),
        targetHours: toNumber(target),
      }),
    [rows, adminHours, daysOff, sleep, weeksSinceBreak, target],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Creator Workload Burnout Calculator",
      `Production: ${hours(result.productionHours)}/week`,
      `Admin & comms: ${hours(result.adminHours)}/week`,
      `Total: ${hours(result.totalHours)}/week over ${result.workingDays} working days`,
      `Per working day: ${hours(result.hoursPerWorkingDay)} (${pct(result.shareOfWakingDay)} of waking hours)`,
      `Load score: ${NUM0.format(result.score)}/100 — ${result.level}`,
      `Vs ${WORKING_TIME_LIMIT_HOURS} h directive ceiling: ${NUM.format(result.hoursVsWorkingTimeLimit)} h`,
      `Vs 55 h WHO/ILO threshold: ${NUM.format(result.hoursVsHighRisk)} h`,
      `Weekly sleep debt: ${hours(result.weeklySleepDebt)}`,
      ...result.flags.map((flag) => `- ${flag}`),
    ].join("\n");
  }, [failed, result]);

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
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
    setRows(
      FORMAT_PRESETS.map((preset) => ({
        id: preset.id,
        label: preset.label,
        count: String(preset.count),
        hoursEach: String(preset.hoursEach),
      })),
    );
    setAdminHours(DEFAULTS.adminHours);
    setDaysOff(DEFAULTS.daysOff);
    setSleep(DEFAULTS.sleep);
    setWeeksSinceBreak(DEFAULTS.weeksSinceBreak);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const componentRows = failed
    ? []
    : [
        ["Hours worked", result.components.hours, SCORE_WEIGHTS.hours],
        ["Sleep", result.components.sleep, SCORE_WEIGHTS.sleep],
        ["Rest days", result.components.restDays, SCORE_WEIGHTS.restDays],
        ["Time since a real break", result.components.timeSinceBreak, SCORE_WEIGHTS.timeSinceBreak],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Creator workload
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Creator Workload Burnout Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add up the real hours behind your posting schedule and see them against the 48-hour EU
          working-time ceiling, the 55-hour WHO/ILO risk threshold and the 7-hour adult sleep floor.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Weekly output</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Hours per piece cover the whole chain — idea, script, shoot, edit, thumbnail, upload.
          Override them with your own timings.
        </p>

        <div className="mt-4 space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <p className="text-sm font-semibold">{row.label}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`count-${row.id}`}>
                    Pieces per week
                  </label>
                  <input
                    id={`count-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={row.count}
                    onChange={(event) => updateRow(row.id, "count", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hours-${row.id}`}>
                    Hours per piece
                  </label>
                  <input
                    id={`hours-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={row.hoursEach}
                    onChange={(event) => updateRow(row.id, "hoursEach", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Everything else</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="admin-hours">
              Admin, comms &amp; brand deals (h/week)
            </label>
            <input
              id="admin-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={adminHours}
              onChange={(event) => setAdminHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="days-off">
              Full days off per week (0-6)
            </label>
            <input
              id="days-off"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6"
              step="1"
              value={daysOff}
              onChange={(event) => setDaysOff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sleep-hours">
              Average sleep (h/night)
            </label>
            <input
              id="sleep-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="3"
              max="12"
              step="0.5"
              value={sleep}
              onChange={(event) => setSleep(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="weeks-break">
              Weeks since a full week off
            </label>
            <input
              id="weeks-break"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={weeksSinceBreak}
              onChange={(event) => setWeeksSinceBreak(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="target-hours">
              Target working week (h)
            </label>
            <input
              id="target-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
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
              Weekly load score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM0.format(result.score)}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${result.level} — ${result.bandNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy workload result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {!failed && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Load score ${NUM0.format(result.score)} out of 100`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Production hours", failed ? DASH : hours(result.productionHours)],
            ["Admin & comms hours", failed ? DASH : hours(result.adminHours)],
            ["Total weekly hours", failed ? DASH : hours(result.totalHours)],
            [
              "Per working day",
              failed
                ? DASH
                : `${hours(result.hoursPerWorkingDay)} across ${result.workingDays} days`,
            ],
            ["Share of waking hours", failed ? DASH : pct(result.shareOfWakingDay)],
            [
              `Vs ${FULL_TIME_HOURS} h full-time week`,
              failed ? DASH : `${result.hoursVsFullTime >= 0 ? "+" : ""}${NUM.format(result.hoursVsFullTime)} h`,
            ],
            [
              `Vs ${HIGH_RISK_WEEKLY_HOURS} h WHO/ILO threshold`,
              failed ? DASH : `${result.hoursVsHighRisk >= 0 ? "+" : ""}${NUM.format(result.hoursVsHighRisk)} h`,
            ],
            ["Weekly sleep debt", failed ? DASH : hours(result.weeklySleepDebt)],
            [
              "Gap to your target week",
              failed ? DASH : `${result.hoursVsTarget >= 0 ? "+" : ""}${NUM.format(result.hoursVsTarget)} h`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">What the score is made of</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {componentRows.map(([label, value, weight]) => (
                <li key={label}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted-foreground)]">
                      {label}{" "}
                      <span className="text-xs">(weight {weight}%)</span>
                    </span>
                    <span className="font-semibold">{NUM0.format(value)}/100</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span className="block h-full bg-[var(--primary)]" style={{ width: `${value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Where the hours go</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Format
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Hours
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Share
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      At {NUM0.format(result.targetHours)} h
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{item.label}</td>
                      <td className="py-2 pr-3 text-right">{hours(item.hours)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {pct(item.share)}
                      </td>
                      <td className="py-2 text-right">{NUM0.format(item.suggestedCount)}/week</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Flags</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.flags.map((flag) => (
                <li key={flag} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The score is a workload model built on published working-time and sleep
        guidance ({WORKING_TIME_LIMIT_HOURS} h, {HIGH_RISK_WEEKLY_HOURS} h, {MIN_ADULT_SLEEP_HOURS} h
        of sleep) — it is not a diagnosis. If exhaustion, low mood or cynicism about your work is
        persisting, speak to a doctor or a qualified mental health professional.
      </p>
    </main>
  );
}
