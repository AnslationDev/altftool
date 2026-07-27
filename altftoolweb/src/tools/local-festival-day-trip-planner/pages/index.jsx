"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PartyPopper, RotateCcw } from "lucide-react";

import {
  EXIT_ROUTES,
  MAX_STANDING_DENSITY,
  formatClock,
  formatFestivalPlanText,
  formatMinutes,
  planFestivalDay,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  name: "Saturday street festival",
  crowd: "20000",
  startTime: "18:30",
  endTime: "23:00",
  gateLanes: "8",
  laneThroughput: "12",
  peakSharePct: "50",
  peakWindowMin: "60",
  targetWaitMin: "10",
  screeningMin: "5",
  travelToMin: "45",
  walkFromStopMin: "10",
  travelHomeMin: "45",
  lastTransportTime: "23:30",
  exitRoute: "level",
  exitWidthM: "12",
  standingAreaM2: "5000",
  earlyExitMin: "10",
  earlyLeaverSharePct: "15",
};

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--muted)] text-[var(--foreground)]",
  ok: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

function Field({ id, label, value, onChange, type = "number", min, max, step = "1", hint }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        min={min}
        max={max}
        step={type === "number" ? step : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (value) => setState((current) => ({ ...current, [key]: value }));

  const plan = useMemo(
    () =>
      planFestivalDay({
        crowd: Number(state.crowd),
        startTime: state.startTime,
        endTime: state.endTime,
        gateLanes: Number(state.gateLanes),
        laneThroughput: Number(state.laneThroughput),
        peakSharePct: Number(state.peakSharePct),
        peakWindowMin: Number(state.peakWindowMin),
        targetWaitMin: Number(state.targetWaitMin),
        screeningMin: Number(state.screeningMin),
        travelToMin: Number(state.travelToMin),
        walkFromStopMin: Number(state.walkFromStopMin),
        travelHomeMin: Number(state.travelHomeMin),
        lastTransportTime: state.lastTransportTime,
        exitRoute: state.exitRoute,
        exitWidthM: Number(state.exitWidthM),
        standingAreaM2: Number(state.standingAreaM2),
        earlyExitMin: Number(state.earlyExitMin),
        earlyLeaverSharePct: Number(state.earlyLeaverSharePct),
      }),
    [state],
  );

  const copyResult = async () => {
    const text = formatFestivalPlanText(plan, state.name);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PartyPopper className="h-4 w-4" aria-hidden="true" />
          Festival logistics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Local Festival Day Trip Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The queue grows at the difference between how fast people arrive and how fast the gates work, and
          the crowd leaves at a rate set by the width of the exits. Both are arithmetic — here is the day
          planned around them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The event</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fdt-name">
              Event
            </label>
            <input
              id="fdt-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={state.name}
              onChange={(event) => set("name")(event.target.value)}
            />
          </div>
          <Field id="fdt-crowd" label="Expected attendance" value={state.crowd} onChange={set("crowd")} min="1" step="500" />
          <Field
            id="fdt-standing"
            label="Standing area (m², 0 to skip)"
            value={state.standingAreaM2}
            onChange={set("standingAreaM2")}
            min="0"
            step="100"
          />
          <Field id="fdt-start" label="Start time" type="time" value={state.startTime} onChange={set("startTime")} />
          <Field id="fdt-end" label="Finish time" type="time" value={state.endTime} onChange={set("endTime")} />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Getting in</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="fdt-lanes" label="Search lanes or turnstiles" value={state.gateLanes} onChange={set("gateLanes")} min="1" />
          <Field
            id="fdt-throughput"
            label="People per lane per minute"
            value={state.laneThroughput}
            onChange={set("laneThroughput")}
            min="1"
            hint="A bag search runs about 10–15; a ticket scan alone runs far higher."
          />
          <Field
            id="fdt-peak-share"
            label="Share arriving in the peak (%)"
            value={state.peakSharePct}
            onChange={set("peakSharePct")}
            min="1"
            max="100"
            step="5"
          />
          <Field
            id="fdt-peak-window"
            label="Peak window before the start (min)"
            value={state.peakWindowMin}
            onChange={set("peakWindowMin")}
            min="5"
            step="15"
          />
          <Field
            id="fdt-target-wait"
            label="Queue time you will accept (min)"
            value={state.targetWaitMin}
            onChange={set("targetWaitMin")}
            min="0"
            step="5"
          />
          <Field id="fdt-screening" label="The search itself (min)" value={state.screeningMin} onChange={set("screeningMin")} min="0" />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Getting out and home</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fdt-exit-route">
              Exit route
            </label>
            <select
              id="fdt-exit-route"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.exitRoute}
              onChange={(event) => set("exitRoute")(event.target.value)}
            >
              {EXIT_ROUTES.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.label} — {route.rate}/min per metre
                </option>
              ))}
            </select>
          </div>
          <Field
            id="fdt-exit-width"
            label="Total exit width (m)"
            value={state.exitWidthM}
            onChange={set("exitWidthM")}
            min="0.5"
            step="0.5"
          />
          <Field
            id="fdt-early"
            label="Leaving early by (min)"
            value={state.earlyExitMin}
            onChange={set("earlyExitMin")}
            min="0"
            step="5"
          />
          <Field
            id="fdt-early-share"
            label="Share of the crowd that leaves early (%)"
            value={state.earlyLeaverSharePct}
            onChange={set("earlyLeaverSharePct")}
            min="0"
            max="100"
            step="5"
          />
          <Field id="fdt-travel-to" label="Travel from home (min)" value={state.travelToMin} onChange={set("travelToMin")} min="0" step="5" />
          <Field id="fdt-walk" label="Stop to gate on foot (min)" value={state.walkFromStopMin} onChange={set("walkFromStopMin")} min="0" />
          <Field id="fdt-travel-home" label="Travel home (min)" value={state.travelHomeMin} onChange={set("travelHomeMin")} min="0" step="5" />
          <Field
            id="fdt-last"
            label="Last service home"
            type="time"
            value={state.lastTransportTime}
            onChange={set("lastTransportTime")}
          />
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Leave home at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : formatClock(plan.timeline[0].at)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the input above to build the timeline."
                : `Gate ${formatMinutes(plan.arriveBeforeStartMin)} before the start, for a queue of about ${formatMinutes(plan.expectedWaitMin)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the festival day plan"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Gate capacity", plan.error ? DASH : `${Math.round(plan.serviceRate)} people per minute`],
            ["Arrival rate at the peak", plan.error ? DASH : `${Math.round(plan.arrivalRate)} people per minute`],
            ["Queue if you arrive at the last moment", plan.error ? DASH : formatMinutes(plan.worstWaitMin)],
            ["Time to clear the whole venue", plan.error ? DASH : formatMinutes(plan.fullClearMin)],
            ["Your wait at the exit", plan.error ? DASH : formatMinutes(plan.earlyExitWaitMin)],
            [
              "Margin on the last service",
              plan.error ? DASH : plan.catchesLastService ? formatMinutes(plan.spareMinutes) : "missed",
            ],
            [
              "Latest you can leave your spot",
              plan.error ? DASH : formatClock(plan.latestLeaveSeat),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The day, in order</h2>
          <ol className="mt-3 divide-y divide-[var(--border)]">
            {plan.timeline.map((step) => (
              <li key={step.id} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                <span className="font-mono font-semibold text-[var(--primary)]">{formatClock(step.at)}</span>
                <span className="text-right text-[var(--muted-foreground)]">{step.label}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!plan.error && plan.density && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Crowd density</h2>
          <p className="mt-3 text-3xl font-semibold text-[var(--primary)]">
            {Math.round(plan.density.perM2 * 10) / 10} <span className="text-base font-normal">people per m²</span>
          </p>
          <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASS[plan.density.band.tone]}`}>
            {plan.density.band.label}
          </p>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            That is {Math.round(plan.density.areaPerPerson * 100) / 100} m² each. Standing accommodation is
            capped at {MAX_STANDING_DENSITY} people per m² under the Guide to Safety at Sports Grounds, and
            independent movement has largely gone by 4 per m².
          </p>
        </section>
      )}

      {!plan.error && plan.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Watch out for</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {plan.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--foreground)]">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate from the figures you enter, not a safety assessment. Crowd safety at an event is
        the organiser's and the local authority's responsibility — follow stewards' instructions, and if a
        crowd feels too dense to move freely, work your way to an edge rather than forward.
      </p>
    </main>
  );
}
