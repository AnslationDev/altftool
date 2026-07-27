"use client";

import { useMemo, useState } from "react";
import { Check, CloudRain, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  SENSITIVITIES,
  buildBackupPlan,
  formatBackupPlanText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const PCT = (value) => `${Math.round(value * 100)}%`;

const STARTER_DAYS = [
  { id: "day-1", label: "Mon", activity: "Island boat trip", rainPct: 70, sensitivity: "high", isIndoor: false },
  { id: "day-2", label: "Tue", activity: "Old town walking tour", rainPct: 40, sensitivity: "medium", isIndoor: false },
  { id: "day-3", label: "Wed", activity: "National museum", rainPct: 20, sensitivity: "medium", isIndoor: true },
  { id: "day-4", label: "Thu", activity: "Coastal hike", rainPct: 55, sensitivity: "high", isIndoor: false },
  { id: "day-5", label: "Fri", activity: "Covered market", rainPct: 30, sensitivity: "low", isIndoor: false },
];

const STARTER_OPTIONS = [
  { id: "option-1", label: "Aquarium", hours: 3, bookingNeeded: false },
  { id: "option-2", label: "Cooking class", hours: 4, bookingNeeded: true },
];

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--muted)] text-[var(--foreground)]",
  ok: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [days, setDays] = useState(STARTER_DAYS);
  const [options, setOptions] = useState(STARTER_OPTIONS);
  const [nextDayId, setNextDayId] = useState(STARTER_DAYS.length + 1);
  const [nextOptionId, setNextOptionId] = useState(STARTER_OPTIONS.length + 1);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => buildBackupPlan({ days, options }), [days, options]);

  const addDay = () => {
    const id = `day-${nextDayId}`;
    setNextDayId((value) => value + 1);
    setDays((current) => [
      ...current,
      { id, label: `Day ${current.length + 1}`, activity: "", rainPct: 30, sensitivity: "medium", isIndoor: false },
    ]);
  };

  const updateDay = (id, patch) =>
    setDays((current) => current.map((day) => (day.id === id ? { ...day, ...patch } : day)));

  const removeDay = (id) => setDays((current) => current.filter((day) => day.id !== id));

  const addOption = () => {
    const id = `option-${nextOptionId}`;
    setNextOptionId((value) => value + 1);
    setOptions((current) => [...current, { id, label: "", hours: 2, bookingNeeded: false }]);
  };

  const updateOption = (id, patch) =>
    setOptions((current) => current.map((option) => (option.id === id ? { ...option, ...patch } : option)));

  const removeOption = (id) => setOptions((current) => current.filter((option) => option.id !== id));

  const copyResult = async () => {
    const text = formatBackupPlanText(plan);
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
    setDays(STARTER_DAYS);
    setOptions(STARTER_OPTIONS);
    setNextDayId(STARTER_DAYS.length + 1);
    setNextOptionId(STARTER_OPTIONS.length + 1);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CloudRain className="h-4 w-4" aria-hidden="true" />
          Wet weather planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Rainy Day Backup Plan Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six days at 30% each is not a 30% problem — it is an 88% chance of losing a day. Enter the
          forecast for each day, say what rain would actually ruin, and get the backups and swaps that
          bring the risk down.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">The itinerary</h2>
          <button type="button" onClick={addDay} className={GHOST_BTN} aria-label="Add a day to the itinerary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add day
          </button>
        </div>

        <ul className="mt-4 space-y-3">
          {days.map((day, index) => (
            <li key={day.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rdb-label-${day.id}`}>
                    Day
                  </label>
                  <input
                    id={`rdb-label-${day.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    value={day.label}
                    onChange={(event) => updateDay(day.id, { label: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rdb-activity-${day.id}`}>
                    Planned activity
                  </label>
                  <input
                    id={`rdb-activity-${day.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    value={day.activity}
                    onChange={(event) => updateDay(day.id, { activity: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rdb-rain-${day.id}`}>
                    Chance of rain (%)
                  </label>
                  <input
                    id={`rdb-rain-${day.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    step="5"
                    value={day.rainPct}
                    onChange={(event) => updateDay(day.id, { rainPct: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rdb-sens-${day.id}`}>
                    What rain does to it
                  </label>
                  <select
                    id={`rdb-sens-${day.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={day.sensitivity}
                    onChange={(event) => updateDay(day.id, { sensitivity: event.target.value })}
                    disabled={day.isIndoor}
                  >
                    {SENSITIVITIES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor={`rdb-indoor-${day.id}`}
                  className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
                >
                  <input
                    id={`rdb-indoor-${day.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={day.isIndoor}
                    onChange={() => updateDay(day.id, { isIndoor: !day.isIndoor })}
                  />
                  <span>Already an indoor day</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeDay(day.id)}
                  aria-label={`Remove ${day.label || `day ${index + 1}`}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Indoor alternatives you have researched</h2>
          <button type="button" onClick={addOption} className={GHOST_BTN} aria-label="Add an indoor alternative">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add option
          </button>
        </div>

        <ul className="mt-4 space-y-3">
          {options.map((option, index) => (
            <li key={option.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rdb-opt-${option.id}`}>
                    Alternative {index + 1}
                  </label>
                  <input
                    id={`rdb-opt-${option.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="Aquarium, gallery, thermal baths…"
                    value={option.label}
                    onChange={(event) => updateOption(option.id, { label: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rdb-opt-hours-${option.id}`}>
                    Hours it fills
                  </label>
                  <input
                    id={`rdb-opt-hours-${option.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="0.5"
                    value={option.hours}
                    onChange={(event) => updateOption(option.id, { hours: Number(event.target.value) })}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor={`rdb-opt-booking-${option.id}`}
                  className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
                >
                  <input
                    id={`rdb-opt-booking-${option.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={option.bookingNeeded}
                    onChange={() => updateOption(option.id, { bookingNeeded: !option.bookingNeeded })}
                  />
                  <span>Needs booking ahead</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  aria-label={`Remove ${option.label || `alternative ${index + 1}`}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
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
              Chance of losing at least one outdoor day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : PCT(plan.pAtLeastOne)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the itinerary above to run the numbers."
                : `${Math.round(plan.expectedWashouts * 10) / 10} days lost on average, across ${plan.outdoorDays.length} outdoor day${plan.outdoorDays.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the backup plan"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the itinerary" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Chance every outdoor day stays dry", plan.error ? DASH : PCT(plan.pNone)],
            ["Expected days lost", plan.error ? DASH : (Math.round(plan.expectedWashouts * 100) / 100).toString()],
            ["Chance every outdoor day is lost", plan.error ? DASH : PCT(plan.pAllOutdoorLost)],
            ["Days needing a backup", plan.error ? DASH : plan.assignments.length],
            ["At-risk days with no alternative", plan.error ? DASH : plan.uncovered.length],
            [
              "Expected days lost after suggested swaps",
              plan.error || plan.swaps.length === 0 ? DASH : (Math.round(plan.expectedAfterSwaps * 100) / 100).toString(),
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
          <h2 className="text-base font-semibold">Day by day</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Plan</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Rain</th>
                  <th scope="col" className="py-2 text-right font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {plan.days.map((day) => (
                  <tr key={day.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{day.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {day.activity || "—"}
                      {day.isIndoor ? " (indoor)" : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">{day.rainPct}%</td>
                    <td className="py-2 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TONE_CLASS[day.band.tone]}`}>
                        {day.isIndoor ? "safe" : `${PCT(day.risk)} · ${day.band.label}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!plan.error && plan.assignments.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Backups assigned to the riskiest days</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {plan.assignments.map((entry) => (
              <li
                key={entry.day.id}
                className={`rounded-md px-3 py-2 ${entry.option ? "bg-[var(--muted)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}
              >
                <span className="font-semibold">{entry.day.label}</span>
                {entry.day.activity ? ` (${entry.day.activity})` : ""} —{" "}
                {entry.option ? (
                  <>
                    fall back to <span className="font-semibold">{entry.option.label}</span>, {entry.option.hours} h
                    {entry.option.bookingNeeded ? ", book ahead" : ", walk-up"}
                  </>
                ) : (
                  "no indoor alternative listed"
                )}
              </li>
            ))}
          </ol>
          {plan.spareOptions.length > 0 && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Held in reserve: {plan.spareOptions.map((option) => option.label).join(", ")}.
            </p>
          )}
        </section>
      )}

      {!plan.error && plan.swaps.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Swaps worth making</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {plan.swaps.map((swap) => (
              <li key={`${swap.from.id}-${swap.to.id}`} className="rounded-md bg-[var(--muted)] px-3 py-2">
                Move <span className="font-semibold">{swap.from.activity || swap.from.label}</span> from{" "}
                {swap.from.label} ({swap.from.rainPct}%) to {swap.to.label} ({swap.to.rainPct}%) — risk drops
                from {PCT(swap.riskBefore)} to {PCT(swap.riskAfter)}.
              </li>
            ))}
          </ul>
        </section>
      )}

      {!plan.error && plan.notes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planning arithmetic on the forecast figures you enter, not a forecast itself. Days are treated as
        independent, which overstates the spread when one weather system covers the whole trip — check a
        current forecast close to the date.
      </p>
    </main>
  );
}
