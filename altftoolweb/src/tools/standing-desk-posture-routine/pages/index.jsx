"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PersonStanding, RotateCcw } from "lucide-react";

import { STANDING_LEVELS, buildStandingRoutine, clockAt, formatMinutes } from "../lib";

const DEFAULTS = {
  workdayHours: "8",
  standBlockMin: "30",
  sitBlockMin: "30",
  heightCm: "170",
  level: "starting",
  startTime: "09:00",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const CM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const parseClock = (value) => {
  const match = String(value ?? "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return { hour: 9, minute: 0 };
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return { hour: 9, minute: 0 };
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return { hour: 9, minute: 0 };
  return { hour, minute };
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildStandingRoutine({
        workdayHours: Number(values.workdayHours),
        standBlockMin: Number(values.standBlockMin),
        sitBlockMin: Number(values.sitBlockMin),
        heightCm: Number(values.heightCm),
        level: values.level,
      }),
    [values],
  );

  const start = useMemo(() => parseClock(values.startTime), [values.startTime]);
  const hasError = Boolean(plan.error);

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Standing Desk Posture Routine",
      `Target level: ${plan.levelLabel}`,
      `Standing total: ${formatMinutes(plan.totalStandMin)} (${PCT.format(plan.standShare)}%)`,
      `Sitting total: ${formatMinutes(plan.totalSitMin)}`,
      `Transitions: ${plan.transitions}`,
      `Standing desk height: ${CM.format(plan.heights.standingDeskCm)} cm`,
      `Monitor top while standing: ${CM.format(plan.heights.monitorTopStandingCm)} cm`,
      "",
      "Routine:",
      ...plan.blocks.slice(0, 18).map((block) => {
        const mode = block.mode === "stand" ? "Stand" : "Sit";
        return `${clockAt(start.hour, start.minute, block.startMin)} - ${clockAt(
          start.hour,
          start.minute,
          block.endMin,
        )} ${mode} (${formatMinutes(block.lengthMin)})`;
      }),
    ];
    if (plan.blocks.length > 18) lines.push(`...${plan.blocks.length - 18} more blocks`);
    return lines.join("\n");
  }, [hasError, plan, start.hour, start.minute]);

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

  const rows = hasError
    ? [
        ["Standing total", DASH],
        ["Sitting total", DASH],
        ["Stand share", DASH],
        ["Transitions", DASH],
        ["Micro-movement prompts", DASH],
        ["Target gap", DASH],
      ]
    : [
        ["Standing total", formatMinutes(plan.totalStandMin)],
        ["Sitting total", formatMinutes(plan.totalSitMin)],
        ["Stand share", `${PCT.format(plan.standShare)}%`],
        ["Transitions", String(plan.transitions)],
        ["Micro-movement prompts", String(plan.microBreaks)],
        ["Target gap", plan.meetsTarget ? "Target met" : formatMinutes(plan.shortfallMin)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PersonStanding className="h-4 w-4" aria-hidden="true" />
          Desk ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Standing Desk Posture Routine
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a sit-stand rotation, add micro-movement prompts and estimate desk,
          chair and monitor heights from your body height.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stand-start">
              Start time
            </label>
            <input id="stand-start" className={`mt-2 ${INPUT_CLASS}`} type="text" inputMode="numeric" placeholder="09:00" value={values.startTime} onChange={(event) => update("startTime", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stand-hours">
              Workday length (hours)
            </label>
            <input id="stand-hours" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0.5" max="16" step="0.5" value={values.workdayHours} onChange={(event) => update("workdayHours", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stand-block">
              Stand block (minutes)
            </label>
            <input id="stand-block" className={`mt-2 ${INPUT_CLASS}`} type="number" min="5" step="5" value={values.standBlockMin} onChange={(event) => update("standBlockMin", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sit-block">
              Sit block (minutes)
            </label>
            <input id="sit-block" className={`mt-2 ${INPUT_CLASS}`} type="number" min="5" step="5" value={values.sitBlockMin} onChange={(event) => update("sitBlockMin", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stand-height">
              Body height (cm)
            </label>
            <input id="stand-height" className={`mt-2 ${INPUT_CLASS}`} type="number" min="120" max="220" step="1" value={values.heightCm} onChange={(event) => update("heightCm", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stand-level">
              Standing target level
            </label>
            <select id="stand-level" className={`mt-2 ${INPUT_CLASS}`} value={values.level} onChange={(event) => update("level", event.target.value)}>
              {Object.entries(STANDING_LEVELS).map(([key, level]) => (
                <option key={key} value={key}>
                  {level.label} — {formatMinutes(level.targetMin)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!hasError && plan.standBlockCapped && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
            Standing blocks are capped at 60 minutes to avoid long uninterrupted standing.
          </p>
        )}
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Standing accumulated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatMinutes(plan.totalStandMin)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the routine."
                : plan.meetsTarget
                  ? `Meets the ${plan.levelLabel.toLowerCase()} target.`
                  : `${formatMinutes(plan.shortfallMin)} short of the ${plan.levelLabel.toLowerCase()} target.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={hasError} className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy routine"}
            </button>
            <button type="button" onClick={reset} className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
              <dt className="text-xs font-medium text-[var(--muted-foreground)]">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Standing desk height", `${CM.format(plan.heights.standingDeskCm)} cm`],
                ["Sitting desk height", `${CM.format(plan.heights.sittingDeskCm)} cm`],
                ["Seat height", `${CM.format(plan.heights.seatHeightCm)} cm`],
                ["Monitor top while standing", `${CM.format(plan.heights.monitorTopStandingCm)} cm`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-[var(--surface-soft)] p-3">
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <tr>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Mode</th>
                      <th className="px-3 py-2">Cue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {plan.blocks.map((block) => (
                      <tr key={block.index}>
                        <td className="px-3 py-2 text-[var(--muted-foreground)]">
                          {clockAt(start.hour, start.minute, block.startMin)}–{clockAt(start.hour, start.minute, block.endMin)}
                        </td>
                        <td className="px-3 py-2 font-semibold">{block.mode === "stand" ? "Stand" : "Sit"}</td>
                        <td className="px-3 py-2 text-[var(--muted-foreground)]">
                          {block.cues[0]?.cue || "Change posture smoothly"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
