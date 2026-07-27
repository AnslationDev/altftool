"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SlidersHorizontal } from "lucide-react";

import { WORKFLOWS, buildChecklist, checklistProgress } from "../lib";

const DEC0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const d0 = (value) => DEC0.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  workflowId: "web-srgb",
  hasColorimeter: true,
  ambientLux: "60",
  lastCalibrated: "2026-07-01",
  hoursPerDay: "8",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [workflowId, setWorkflowId] = useState(DEFAULTS.workflowId);
  const [hasColorimeter, setHasColorimeter] = useState(DEFAULTS.hasColorimeter);
  const [ambientLux, setAmbientLux] = useState(DEFAULTS.ambientLux);
  const [lastCalibrated, setLastCalibrated] = useState(DEFAULTS.lastCalibrated);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildChecklist({
        workflowId,
        hasColorimeter,
        ambientLux: Number(ambientLux),
        lastCalibrated,
        hoursPerDay: Number(hoursPerDay),
      }),
    [workflowId, hasColorimeter, ambientLux, lastCalibrated, hoursPerDay],
  );

  const failed = Boolean(plan.error);

  const progress = useMemo(
    () => checklistProgress(failed ? [] : plan.steps, done),
    [plan, done, failed],
  );

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `Display calibration checklist — ${plan.workflow.label}`,
      `White point: ${plan.workflow.whitePoint} · Tone curve: ${plan.workflow.gamma}`,
      `White luminance: ${plan.workflow.luminanceNits[0]}-${plan.workflow.luminanceNits[1]} cd/m²`,
      `Room light target: ${plan.workflow.ambientLux[0]}-${plan.workflow.ambientLux[1]} lux (measured ${d0(plan.ambientLux)})`,
      `Next calibration due ${plan.schedule.dueDate} (${plan.schedule.daysUntilDue} days, limited by ${plan.schedule.limitedBy})`,
      "",
      ...plan.grouped.flatMap((group) => [
        `${group.phase}:`,
        ...group.steps.map(
          (step) => `  [${done.includes(step.id) ? "x" : " "}] ${step.title}${step.critical ? " (critical)" : ""}`,
        ),
      ]),
    ].join("\n");
  }, [plan, done, failed]);

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
    setWorkflowId(DEFAULTS.workflowId);
    setHasColorimeter(DEFAULTS.hasColorimeter);
    setAmbientLux(DEFAULTS.ambientLux);
    setLastCalibrated(DEFAULTS.lastCalibrated);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Colour management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Display Calibration Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the work the screen is for and get the white point, tone curve, luminance and room
          light the relevant standard asks for, plus the order to do things in so nothing gets
          measured twice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dcc-workflow">
              What is this display for?
            </label>
            <select
              id="dcc-workflow"
              className={`mt-2 ${INPUT_CLASS}`}
              value={workflowId}
              onChange={(event) => setWorkflowId(event.target.value)}
            >
              {WORKFLOWS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dcc-lux">
              Room light at the screen (lux)
            </label>
            <input
              id="dcc-lux"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100000"
              step="5"
              value={ambientLux}
              onChange={(event) => setAmbientLux(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dcc-hours">
              Screen hours per day
            </label>
            <input
              id="dcc-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="24"
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dcc-last">
              Last calibrated
            </label>
            <input
              id="dcc-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastCalibrated}
              onChange={(event) => setLastCalibrated(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold"
              htmlFor="dcc-device"
            >
              <input
                id="dcc-device"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={hasColorimeter}
                onChange={(event) => setHasColorimeter(event.target.checked)}
              />
              I have a colorimeter
            </label>
          </div>
        </div>
      </section>

      {failed && (
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
              Checklist complete
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${d0(progress.percent)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to build the checklist."
                : progress.ready
                  ? "Every critical step is ticked."
                  : `${progress.criticalRemaining} critical step${progress.criticalRemaining === 1 ? "" : "s"} left`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the calibration checklist"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, progress.percent))}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["White point", failed ? DASH : plan.workflow.whitePoint],
            ["Tone curve", failed ? DASH : plan.workflow.gamma],
            [
              "White luminance",
              failed
                ? DASH
                : plan.workflow.luminanceNits[0] === plan.workflow.luminanceNits[1]
                  ? `${plan.workflow.luminanceNits[0]} cd/m²`
                  : `${plan.workflow.luminanceNits[0]}–${plan.workflow.luminanceNits[1]} cd/m²`,
            ],
            [
              "Room light target",
              failed
                ? DASH
                : `${plan.workflow.ambientLux[0]}–${plan.workflow.ambientLux[1]} lux`,
            ],
            ["Steps ticked", failed ? DASH : `${progress.completed} of ${progress.total}`],
            [
              "Next calibration due",
              failed ? DASH : `${plan.schedule.dueDate} (${plan.schedule.daysUntilDue} days)`,
            ],
            ["Due date limited by", failed ? DASH : plan.schedule.limitedBy],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && plan.warnings.length > 0 && (
          <ul className="mt-4 space-y-2">
            {plan.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}

        {!failed && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{plan.workflow.source}</p>
        )}
      </section>

      {!failed &&
        plan.grouped.map((group) => (
          <section
            key={group.phase}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{group.phase}</h2>
            <ul className="mt-3 space-y-3">
              {group.steps.map((step) => (
                <li key={step.id}>
                  <label
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] p-3"
                    htmlFor={`dcc-step-${step.id}`}
                  >
                    <input
                      id={`dcc-step-${step.id}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={done.includes(step.id)}
                      onChange={() => toggle(step.id)}
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        {step.title}
                        {step.critical && (
                          <span className="ml-2 rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                            Critical
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                        {step.detail}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Targets follow published standards, but a specific facility, print house or delivery spec may
        ask for different numbers — when a deliverable names its own values, those win.
      </p>
    </main>
  );
}
