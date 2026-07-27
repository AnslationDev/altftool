"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import {
  SEMIDIURNAL_INTERVAL_MIN,
  TIDE_PREFERENCES,
  UV_PROTECTION_INDEX,
  bandForScore,
  formatClock,
  formatBeachPlanText,
  formatMinutes,
  planBeachDay,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const TONE_CLASS = {
  ok: "bg-[var(--muted)] text-[var(--success)]",
  warn: "bg-[var(--muted)] text-[var(--foreground)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const DEFAULTS = {
  beach: "The nearest beach",
  sunrise: "05:45",
  sunset: "20:15",
  highTide: "06:12",
  tidePreference: "low",
  busynessPct: "70",
  arriveNoEarlier: "07:00",
  leaveBy: "20:00",
  hoursWanted: "3",
};

const SAFETY = [
  "Swim at a lifeguarded beach and stay between the flags where there are any.",
  "Caught in a rip current: do not swim against it. Float, signal for help, and if you can swim, swim parallel to the shore until you are out of it.",
  "Check the tide before walking out onto sand or rocks — the water moves fastest in the two hours around mid-tide and cuts people off every season.",
];

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
      planBeachDay({
        sunrise: state.sunrise,
        sunset: state.sunset,
        highTide: state.highTide,
        tidePreference: state.tidePreference,
        busynessPct: Number(state.busynessPct),
        arriveNoEarlier: state.arriveNoEarlier,
        leaveBy: state.leaveBy,
        hoursWanted: Number(state.hoursWanted),
      }),
    [state],
  );

  const copyResult = async () => {
    const text = formatBeachPlanText(plan, state.beach);
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

  const activePreference = TIDE_PREFERENCES.find((item) => item.id === state.tidePreference);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Beach timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Beach Day Tide and Timing Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          UV peaks at solar noon, the air peaks two to three hours later, the crowd peaks somewhere in
          between, and the tide ignores all three. Every half-hour of daylight is scored against the four so
          you can pick the window that suits you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The day</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bdt-beach">
              Beach
            </label>
            <input
              id="bdt-beach"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={state.beach}
              onChange={(event) => set("beach")(event.target.value)}
            />
          </div>
          <Field id="bdt-sunrise" label="Sunrise" type="time" value={state.sunrise} onChange={set("sunrise")} />
          <Field id="bdt-sunset" label="Sunset" type="time" value={state.sunset} onChange={set("sunset")} />
          <Field
            id="bdt-high"
            label="A known high water time"
            type="time"
            value={state.highTide}
            onChange={set("highTide")}
            hint={`Successive high waters are ${formatMinutes(SEMIDIURNAL_INTERVAL_MIN)} apart.`}
          />
          <div>
            <label className={LABEL_CLASS} htmlFor="bdt-tide-pref">
              What you want from the tide
            </label>
            <select
              id="bdt-tide-pref"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.tidePreference}
              onChange={(event) => set("tidePreference")(event.target.value)}
            >
              {TIDE_PREFERENCES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activePreference ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{activePreference.note}</p>
            ) : null}
          </div>
          <Field id="bdt-earliest" label="Earliest you could arrive" type="time" value={state.arriveNoEarlier} onChange={set("arriveNoEarlier")} />
          <Field id="bdt-latest" label="Time you have to leave" type="time" value={state.leaveBy} onChange={set("leaveBy")} />
          <Field
            id="bdt-hours"
            label="How long you want to stay (hours)"
            value={state.hoursWanted}
            onChange={set("hoursWanted")}
            min="0.5"
            max="14"
            step="0.5"
          />
          <Field
            id="bdt-busy"
            label="How busy this beach gets (%)"
            value={state.busynessPct}
            onChange={set("busynessPct")}
            min="0"
            max="100"
            step="5"
            hint="0 for a deserted cove, 100 for a city beach in August."
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
              Best window
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : `${formatClock(plan.best.start)}–${formatClock(plan.best.end)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the input above to score the day."
                : `${plan.bestBand.label} — scoring ${Math.round(plan.best.average)}/100 across the window`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the beach day plan"
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
            ["Solar noon (UV peak)", plan.error ? DASH : formatClock(plan.solarNoon)],
            [
              "Strongest UV",
              plan.error ? DASH : `${formatClock(plan.uvWindow.from)}–${formatClock(plan.uvWindow.to)}`,
            ],
            ["Hottest air", plan.error ? DASH : formatClock(plan.heatPeak)],
            ["Busiest", plan.error ? DASH : formatClock(plan.crowdPeak)],
            ["Daylight", plan.error ? DASH : formatMinutes(plan.daylightMinutes)],
            ["Best single half-hour", plan.error ? DASH : `${formatClock(plan.bestSlot.start)} (${Math.round(plan.bestSlot.score)}/100)`],
            ["Worst half-hour", plan.error ? DASH : `${formatClock(plan.worstSlot.start)} (${Math.round(plan.worstSlot.score)}/100)`],
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
          <h2 className="text-base font-semibold">Tides today</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {plan.tideEventsToday.map((event) => (
              <li
                key={`${event.type}-${event.at}`}
                className="flex items-baseline justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <span className="font-mono font-semibold text-[var(--primary)]">{formatClock(event.at)}</span>
                <span className="text-[var(--muted-foreground)]">
                  {event.type === "high" ? "High water" : "Low water"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Projected from the high water you entered on the {formatMinutes(SEMIDIURNAL_INTERVAL_MIN)}{" "}
            semidiurnal interval. Check the official tide table for your port — local geography shifts real
            times, and some coasts are not semidiurnal at all.
          </p>
        </section>
      )}

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Hour by hour</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Tide</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Score</th>
                  <th scope="col" className="py-2 font-semibold">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {plan.slots
                  .filter((_, index) => index % 2 === 0)
                  .map((slot) => {
                    const band = bandForScore(slot.score);
                    const inBest = slot.start >= plan.best.start && slot.end <= plan.best.end;
                    return (
                      <tr key={slot.start} className="border-b border-[var(--border)] last:border-0">
                        <td className={`py-2 pr-3 font-semibold ${inBest ? "text-[var(--primary)]" : ""}`}>
                          {formatClock(slot.start)}
                        </td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                          {Math.round(slot.level * 100)}%
                        </td>
                        <td className="py-2 pr-3 text-right">{Math.round(slot.score)}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TONE_CLASS[band.tone]}`}>
                            {band.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Tide column is the water level as a share of the range: 0% is low water, 100% is high water.
          </p>
        </section>
      )}

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {plan.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--foreground)]">
                {note}
              </li>
            ))}
          </ul>

          <h3 className="mt-5 text-sm font-semibold">Safety</h3>
          <ul className="mt-2 space-y-2 text-sm leading-6">
            {SAFETY.map((item) => (
              <li key={item} className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Sun protection is needed from UV Index {UV_PROTECTION_INDEX} upwards under WHO and WMO guidance,
            and sand and water both reflect UV, so shade alone is not full cover.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate from the times you enter, not a tide table or a forecast. Always use the official
        tide table for your port and current local safety advice before going into the water or out onto
        sand and rocks.
      </p>
    </main>
  );
}
