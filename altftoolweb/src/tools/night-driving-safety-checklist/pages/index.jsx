"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, RotateCcw } from "lucide-react";

import {
  BREAK_INTERVAL_HOURS,
  BREAK_MINUTES,
  CHECKLIST,
  CIRCADIAN_LOW_END_HOUR,
  CIRCADIAN_LOW_START_HOUR,
  assessNightDrive,
  formatClockHour,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const GROUP_ORDER = ["Lights", "Vision", "Driver", "Vehicle"];

const DEFAULT_CHECKED = {
  "low-beam": true,
  "high-beam": true,
  "tail-brake": true,
  indicators: true,
  windscreen: true,
  wipers: true,
  mirrors: true,
  slept: true,
  "no-sedatives": true,
  tyres: true,
  fuel: true,
  route: true,
};

const DEFAULTS = {
  departure: "21",
  drive: "5",
  awake: "14",
  sleep: "7",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  success: "text-[var(--success)]",
  warn: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [checked, setChecked] = useState(DEFAULT_CHECKED);
  const [notApplicable, setNotApplicable] = useState({});
  const [departure, setDeparture] = useState(DEFAULTS.departure);
  const [drive, setDrive] = useState(DEFAULTS.drive);
  const [awake, setAwake] = useState(DEFAULTS.awake);
  const [sleep, setSleep] = useState(DEFAULTS.sleep);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessNightDrive({
        checked,
        notApplicable,
        departureHour: toNumber(departure),
        driveHours: toNumber(drive),
        hoursAwake: toNumber(awake),
        sleepLastNight: toNumber(sleep),
      }),
    [checked, notApplicable, departure, drive, awake, sleep],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Night Driving Readiness",
      `Checklist score: ${NUM.format(result.score)}% (${result.earned} of ${result.available} points)`,
      `Verdict: ${result.verdict}`,
      result.blockers.length
        ? `Essential items still open: ${result.blockers.join("; ")}`
        : "No essential items outstanding",
      `Fatigue risk: ${result.fatigueRisk}`,
      `Awake by arrival: ${NUM1.format(result.hoursAwakeAtArrival)} h (impairment ≈ ${result.bacAtArrival.toFixed(3)}% BAC)`,
      `Hours inside the 02:00–06:00 window: ${NUM1.format(result.circadianHours)}`,
      `Planned breaks: ${result.recommendedBreaks} × ${BREAK_MINUTES} min`,
    ].join("\n");
  }, [hasError, result]);

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
    setChecked(DEFAULT_CHECKED);
    setNotApplicable({});
    setDeparture(DEFAULTS.departure);
    setDrive(DEFAULTS.drive);
    setAwake(DEFAULTS.awake);
    setSleep(DEFAULTS.sleep);
    setCopied(false);
  };

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleNa = (id) =>
    setNotApplicable((prev) => ({ ...prev, [id]: !prev[id] }));

  const rows = hasError
    ? [
        ["Checklist points earned", DASH],
        ["Essential items outstanding", DASH],
        ["Other items outstanding", DASH],
        ["Fatigue risk", DASH],
        ["Hours awake by arrival", DASH],
        ["Impairment equivalent", DASH],
        ["Hours in the 02:00–06:00 window", DASH],
        ["Arrival time", DASH],
        ["Breaks to plan", DASH],
      ]
    : [
        ["Checklist points earned", `${result.earned} of ${result.available}`],
        ["Essential items outstanding", String(result.blockers.length)],
        ["Other items outstanding", String(result.missing.length)],
        ["Fatigue risk", result.fatigueRisk],
        ["Hours awake by arrival", `${NUM1.format(result.hoursAwakeAtArrival)} h`],
        [
          "Impairment equivalent",
          result.bacAtArrival > 0 ? `≈ ${result.bacAtArrival.toFixed(3)}% BAC` : "none measurable",
        ],
        ["Hours in the 02:00–06:00 window", `${NUM1.format(result.circadianHours)} h`],
        ["Arrival time", formatClockHour(result.arrivalHour)],
        [
          "Breaks to plan",
          `${result.recommendedBreaks} × ${BREAK_MINUTES} min (${result.restMinutes} min resting)`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Before you set off
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Night Driving Safety Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick off the lights, glass and vehicle checks, then add your sleep and departure time — the
          score is weighted, and the fatigue side uses published hours-awake and circadian rules.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The drive
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="night-departure">
              Departure hour (0–23)
            </label>
            <input
              id="night-departure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="23"
              step="1"
              value={departure}
              onChange={(event) => setDeparture(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="night-drive">
              Hours behind the wheel
            </label>
            <input
              id="night-drive"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="24"
              step="0.5"
              value={drive}
              onChange={(event) => setDrive(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="night-awake">
              Hours awake at departure
            </label>
            <input
              id="night-awake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="48"
              step="0.5"
              value={awake}
              onChange={(event) => setAwake(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="night-sleep">
              Sleep in the last 24 hours
            </label>
            <input
              id="night-sleep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={sleep}
              onChange={(event) => setSleep(event.target.value)}
            />
          </div>
        </div>
      </section>

      {GROUP_ORDER.map((group) => (
        <section key={group} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {group}
          </h2>
          <ul className="mt-3 space-y-2">
            {CHECKLIST.filter((item) => item.group === group).map((item) => {
              const na = Boolean(item.optional && notApplicable[item.id]);
              return (
                <li
                  key={item.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={`night-item-${item.id}`}
                      type="checkbox"
                      checked={Boolean(checked[item.id]) && !na}
                      disabled={na}
                      onChange={() => toggle(item.id)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                    <label
                      htmlFor={`night-item-${item.id}`}
                      className={`flex-1 text-sm leading-6 ${na ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}
                    >
                      {item.label}
                      {item.critical && (
                        <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                          essential
                        </span>
                      )}
                    </label>
                  </div>
                  {item.optional && (
                    <button
                      type="button"
                      onClick={() => toggleNa(item.id)}
                      aria-pressed={na}
                      className="mt-2 ml-8 min-h-11 rounded-md px-2 text-xs font-semibold text-[var(--muted-foreground)] underline underline-offset-4 transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {na ? "Applies to me after all" : "Not applicable to my car"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Readiness score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--danger)]" : TONE_CLASS[result.tone]}`}
            >
              {hasError ? DASH : `${NUM.format(result.score)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a verdict." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy night driving readiness result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold capitalize">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {result.groupScores.map((bucket) => (
              <div
                key={bucket.group}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <span className="font-semibold">{bucket.group}</span>
                <span className="float-right text-[var(--muted-foreground)]">
                  {NUM.format(bucket.percent)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {!hasError && result.blockers.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-[var(--danger)]">Essential items still open</h3>
            <ul className="mt-2 space-y-2 text-xs leading-5">
              {result.blockers.map((item) => (
                <li
                  key={item}
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hasError && result.fatigueFlags.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.fatigueFlags.map((flag) => (
              <li key={flag} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {flag}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not a substitute for a mechanic&apos;s inspection or medical advice. The
        impairment figures come from published sleep-deprivation research and describe averages, not
        you personally; the {CIRCADIAN_LOW_START_HOUR}:00–{CIRCADIAN_LOW_END_HOUR}:00 window is when
        sleep-related crashes cluster. If you are drowsy, the only fix is sleep — a break every{" "}
        {BREAK_INTERVAL_HOURS} hours manages tiredness, it does not cure it.
      </p>
    </main>
  );
}
