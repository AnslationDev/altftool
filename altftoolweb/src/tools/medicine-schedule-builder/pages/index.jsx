"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pill, RotateCcw } from "lucide-react";

import {
  buildSchedule,
  FOOD_INSTRUCTIONS,
  FREQUENCIES,
  formatDuration,
  minutesBetween,
  nextDose,
  scheduleToText,
} from "../lib";

const DEFAULTS = {
  name: "Amoxicillin",
  dose: "500 mg",
  frequencyId: "tds",
  firstDose: "08:00",
  startDate: "2026-01-01",
  days: "5",
  food: "after",
  unitsPerDose: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");

/** Local "YYYY-MM-DDTHH:MM" for a Date, without any UTC shift. */
const localStamp = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const [nowStamp, setNowStamp] = useState("");

  // Read the clock only on the client, so the server and first paint agree.
  useEffect(() => {
    const tick = () => setNowStamp(localStamp(new Date()));
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, []);

  // Start the course today once the client knows what today is.
  useEffect(() => {
    if (!nowStamp) return;
    setValues((previous) =>
      previous.startDate === DEFAULTS.startDate
        ? { ...previous, startDate: nowStamp.slice(0, 10) }
        : previous,
    );
  }, [nowStamp]);

  const setField = (id, value) => {
    setValues((previous) => ({ ...previous, [id]: value }));
    setCopied(false);
  };

  const schedule = useMemo(
    () =>
      buildSchedule({
        name: values.name,
        dose: values.dose,
        frequencyId: values.frequencyId,
        firstDose: values.firstDose,
        startDate: values.startDate,
        days: Number.parseInt(values.days, 10),
        food: values.food,
        unitsPerDose: Number(values.unitsPerDose),
      }),
    [values],
  );

  const hasError = Boolean(schedule.error);

  const upcoming = useMemo(() => {
    if (hasError || schedule.asNeeded || !nowStamp) return null;
    return nextDose(schedule.doses, nowStamp);
  }, [hasError, schedule, nowStamp]);

  const minutesAway = useMemo(() => {
    if (!upcoming || !nowStamp) return null;
    return minutesBetween(nowStamp, upcoming.stamp);
  }, [upcoming, nowStamp]);

  const summary = useMemo(() => (hasError ? "" : scheduleToText(schedule)), [hasError, schedule]);

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
    setValues({ ...DEFAULTS, startDate: nowStamp ? nowStamp.slice(0, 10) : DEFAULTS.startDate });
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Pill className="h-4 w-4" aria-hidden="true" />
          Dose planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Medicine Schedule Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a prescription frequency — OD, BD, TDS, QDS or a strict q6h/q8h interval — into a
          dated timetable with every dose time, the total number of doses, and how many tablets to
          have in stock. Everything is worked out in your browser.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="msb-name">
            Medicine name
          </label>
          <input
            id="msb-name"
            className={`${INPUT_CLASS} mt-1`}
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            type="text"
            autoComplete="off"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="msb-dose">
            Dose per intake
          </label>
          <input
            id="msb-dose"
            className={`${INPUT_CLASS} mt-1`}
            value={values.dose}
            onChange={(event) => setField("dose", event.target.value)}
            type="text"
            placeholder="500 mg, 1 tablet, 10 ml"
            autoComplete="off"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="msb-frequency">
            How often
          </label>
          <select
            id="msb-frequency"
            className={`${INPUT_CLASS} mt-1`}
            value={values.frequencyId}
            onChange={(event) => setField("frequencyId", event.target.value)}
          >
            {FREQUENCIES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="msb-first">
            First dose of the day
          </label>
          <input
            id="msb-first"
            className={`${INPUT_CLASS} mt-1`}
            value={values.firstDose}
            onChange={(event) => setField("firstDose", event.target.value)}
            type="time"
            step="60"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="msb-start">
            Start date
          </label>
          <input
            id="msb-start"
            className={`${INPUT_CLASS} mt-1`}
            value={values.startDate}
            onChange={(event) => setField("startDate", event.target.value)}
            type="date"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="msb-days">
            Course length (days)
          </label>
          <input
            id="msb-days"
            className={`${INPUT_CLASS} mt-1`}
            value={values.days}
            onChange={(event) => setField("days", event.target.value)}
            type="number"
            min="1"
            max="365"
            step="1"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="msb-food">
            Food instruction
          </label>
          <select
            id="msb-food"
            className={`${INPUT_CLASS} mt-1`}
            value={values.food}
            onChange={(event) => setField("food", event.target.value)}
          >
            {FOOD_INSTRUCTIONS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="msb-units">
            Tablets / ml per dose
          </label>
          <input
            id="msb-units"
            className={`${INPUT_CLASS} mt-1`}
            value={values.unitsPerDose}
            onChange={(event) => setField("unitsPerDose", event.target.value)}
            type="number"
            min="0.5"
            step="0.5"
            inputMode="decimal"
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {schedule.error}
          </p>
        ) : null}

        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Doses in the whole course
        </p>
        <p className="mt-1 text-5xl leading-none font-bold">
          {hasError ? DASH : NUM.format(schedule.totalDoses)}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : schedule.asNeeded
              ? "Taken only when needed — there is no fixed timetable."
              : `${schedule.name} · ${schedule.dose} · ${schedule.frequencyLabel}`}
        </p>

        <dl className="mt-4">
          <Row label="Times each day" value={hasError || schedule.asNeeded ? DASH : schedule.dailyTimes.join(", ")} />
          <Row label="Doses per day" value={hasError ? DASH : NUM.format(schedule.dosesPerDay)} />
          <Row
            label="Course"
            value={hasError ? DASH : `${schedule.startDate} → ${schedule.endDate} (${NUM.format(schedule.days)} days)`}
          />
          <Row label="Food instruction" value={hasError ? DASH : schedule.foodLabel} />
          <Row
            label="Units to have in stock"
            value={hasError || schedule.asNeeded ? DASH : NUM.format(schedule.totalUnits)}
          />
          <Row
            label="Next dose"
            value={
              hasError || !upcoming
                ? DASH
                : `${upcoming.date} at ${upcoming.time}${
                    formatDuration(minutesAway) ? ` (in ${formatDuration(minutesAway)})` : ""
                  }`
            }
          />
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            aria-label="Copy the medicine schedule to the clipboard"
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {!hasError && !schedule.asNeeded ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-lg font-semibold">Every dose</h2>
          <div className="mt-3 max-h-96 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-sm border-collapse text-sm">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">#</th>
                  <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">Day</th>
                  <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">Date</th>
                  <th scope="col" className="border-b border-[var(--border)] py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {schedule.doses.map((entry) => (
                  <tr key={entry.stamp + entry.doseNumber}>
                    <td className="border-b border-[var(--border)] py-2 pr-3">{entry.doseNumber}</td>
                    <td className="border-b border-[var(--border)] py-2 pr-3">{entry.dayNumber}</td>
                    <td className="border-b border-[var(--border)] py-2 pr-3">{entry.date}</td>
                    <td className="border-b border-[var(--border)] py-2 font-semibold">{entry.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        This is an organiser, not medical advice. &ldquo;Three times a day&rdquo; (TDS) spreads
        doses across waking hours, while &ldquo;every eight hours&rdquo; (q8h) runs round the clock
        — they are different instructions. Always follow the label on your own prescription and ask
        a pharmacist if the two disagree.
      </p>
    </main>
  );
}
