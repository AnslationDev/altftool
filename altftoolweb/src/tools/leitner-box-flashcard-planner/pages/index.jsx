"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import { MAX_BOXES, MIN_BOXES, PRESETS, PRESET_KEYS, boxBreakdown, buildPlan } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_COUNTS = ["40", "30", "20", "10", "5", "5", "5"];
const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ToolHome() {
  const [startDate, setStartDate] = useState(todayIso);
  const [days, setDays] = useState("28");
  const [preset, setPreset] = useState("doubling");
  const [boxCount, setBoxCount] = useState(5);
  const [counts, setCounts] = useState(DEFAULT_COUNTS.slice(0, 5));
  const [stagger, setStagger] = useState(true);
  const [speed, setSpeed] = useState("6");
  const [showAllDays, setShowAllDays] = useState(false);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildPlan({
        startDate,
        days: Number(days),
        preset,
        cardsPerBox: counts.map((value) => Number(value)),
        stagger,
        cardsPerMinute: Number(speed),
      }),
    [startDate, days, preset, counts, stagger, speed],
  );

  const hasError = Boolean(plan.error);
  const boxes = hasError ? [] : boxBreakdown(plan);
  const shownDays = hasError ? [] : showAllDays ? plan.calendar : plan.calendar.slice(0, 14);

  const changeBoxCount = (next) => {
    setBoxCount(next);
    setCounts((current) => {
      if (next <= current.length) return current.slice(0, next);
      return [...current, ...DEFAULT_COUNTS.slice(current.length, next)];
    });
  };

  const setCount = (index, value) =>
    setCounts((current) => current.map((item, position) => (position === index ? value : item)));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Leitner Box Flashcard Plan",
      `Start: ${plan.calendar[0].date} (${plan.calendar[0].weekday})`,
      `Boxes: ${plan.boxes} at intervals ${plan.intervals.join(", ")} days`,
      `Cards: ${plan.counts.join(" / ")} (total ${plan.totalCards})`,
      `Average review load: ${NUM.format(plan.averagePerDay)} cards a day, about ${NUM.format(plan.averageMinutes)} minutes`,
      `Busiest day: day ${plan.peakDay} with ${plan.peakCards} cards (${NUM.format(plan.peakMinutes)} minutes)`,
      `Long-run steady state: ${NUM.format(plan.steadyStatePerDay)} cards a day`,
      `Reviews over ${plan.calendar.length} days: ${plan.totalReviews}`,
    ].join("\n");
  }, [plan, hasError]);

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
    setStartDate(todayIso());
    setDays("28");
    setPreset("doubling");
    setBoxCount(5);
    setCounts(DEFAULT_COUNTS.slice(0, 5));
    setStagger(true);
    setSpeed("6");
    setShowAllDays(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Spaced repetition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Leitner Box Flashcard Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many paper flashcards you will actually face each day. Set the number of
          boxes, the spacing schedule and how many cards sit in each box, and get a dated review
          calendar plus the long-run daily load.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="leitner-start">
              Start date
            </label>
            <input
              id="leitner-start"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leitner-days">
              Plan length (days)
            </label>
            <input
              id="leitner-days"
              type="number"
              inputMode="numeric"
              min="7"
              max="365"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leitner-preset">
              Box schedule
            </label>
            <select
              id="leitner-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={preset}
              onChange={(event) => setPreset(event.target.value)}
            >
              {PRESET_KEYS.map((key) => (
                <option key={key} value={key}>
                  {PRESETS[key].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leitner-boxes">
              Number of boxes
            </label>
            <select
              id="leitner-boxes"
              className={`mt-2 ${INPUT_CLASS}`}
              value={boxCount}
              onChange={(event) => changeBoxCount(Number(event.target.value))}
            >
              {Array.from({ length: MAX_BOXES - MIN_BOXES + 1 }, (_, index) => MIN_BOXES + index).map((value) => (
                <option key={value} value={value}>
                  {value} boxes
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="leitner-speed">
              Cards you check per minute
            </label>
            <input
              id="leitner-speed"
              type="number"
              inputMode="decimal"
              min="1"
              max="120"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="leitner-stagger"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            >
              <input
                id="leitner-stagger"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={stagger}
                onChange={(event) => setStagger(event.target.checked)}
              />
              Stagger box start days
            </label>
          </div>
        </div>

        <p className="mt-3 text-xs text-[var(--muted-foreground)]">{PRESETS[preset].note}</p>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Cards currently in each box</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {counts.map((value, index) => (
              <div key={`box-${index + 1}`}>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`box-${index + 1}`}>
                  Box {index + 1}
                </label>
                <input
                  id={`box-${index + 1}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  className={`mt-1 ${INPUT_CLASS}`}
                  value={value}
                  onChange={(event) => setCount(index, event.target.value)}
                />
              </div>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
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
              Cards to review per day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.averagePerDay)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `about ${NUM.format(plan.averageMinutes)} minutes a day at ${speed} cards a minute`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the Leitner plan summary" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cards in the system", hasError ? DASH : NUM.format(plan.totalCards)],
            ["Box intervals (days)", hasError ? DASH : plan.intervals.join(", ")],
            ["Long-run steady state", hasError ? DASH : `${NUM.format(plan.steadyStatePerDay)} cards a day`],
            [
              "Busiest day in the plan",
              hasError ? DASH : `Day ${plan.peakDay} — ${NUM.format(plan.peakCards)} cards (${NUM.format(plan.peakMinutes)} min)`,
            ],
            ["Days with nothing due", hasError ? DASH : NUM.format(plan.restDays)],
            ["Total card reviews in the plan", hasError ? DASH : NUM.format(plan.totalReviews)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Per-box load</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Box</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Every</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Cards</th>
                    <th scope="col" className="py-2 text-right font-semibold">Reviews / day</th>
                  </tr>
                </thead>
                <tbody>
                  {boxes.map((row) => (
                    <tr key={row.box} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">Box {row.box}</td>
                      <td className="py-2 pr-3 text-right">{row.interval} day{row.interval === 1 ? "" : "s"}</td>
                      <td className="py-2 pr-3 text-right">{NUM.format(row.cards)}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">{NUM.format(row.reviewsPerDay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Review calendar</h2>
              <button
                type="button"
                onClick={() => setShowAllDays((value) => !value)}
                aria-expanded={showAllDays}
                className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {showAllDays ? "Show first 14 days" : `Show all ${plan.calendar.length} days`}
              </button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Boxes due</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Cards</th>
                    <th scope="col" className="py-2 text-right font-semibold">Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {shownDays.map((row) => (
                    <tr key={row.day} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.day}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                        {row.date} · {row.weekday.slice(0, 3)}
                      </td>
                      <td className="py-2 pr-3">{row.boxesDue.length ? row.boxesDue.join(", ") : "rest"}</td>
                      <td className="py-2 pr-3 text-right">{NUM.format(row.cards)}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">{NUM.format(row.minutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The calendar assumes box contents stay roughly stable. In practice cards you fail drop back
        to box 1, which raises the box 1 count and the daily load, so re-run the plan every couple of
        weeks with the counts you actually have.
      </p>
    </main>
  );
}
