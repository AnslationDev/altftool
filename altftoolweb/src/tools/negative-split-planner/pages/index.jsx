"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingDown } from "lucide-react";
import {
  RACE_PRESETS,
  SPLIT_MODES,
  formatDuration,
  formatPace,
  planNegativeSplit,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  preset: "marathon",
  distanceKm: "42.195",
  hours: "4",
  minutes: "0",
  seconds: "0",
  splitPct: "2",
  mode: "block",
  segmentKm: "5",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [distanceKm, setDistanceKm] = useState(DEFAULTS.distanceKm);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [splitPct, setSplitPct] = useState(DEFAULTS.splitPct);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [segmentKm, setSegmentKm] = useState(DEFAULTS.segmentKm);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => planNegativeSplit({ distanceKm, hours, minutes, seconds, splitPct, mode, segmentKm }),
    [distanceKm, hours, minutes, seconds, splitPct, mode, segmentKm],
  );

  const ok = !plan.error;

  const choosePreset = (id) => {
    setPreset(id);
    const match = RACE_PRESETS.find((race) => race.id === id);
    if (match && match.km !== null) setDistanceKm(String(match.km));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Negative Split Planner",
      `${n2(plan.distanceKm)} km in ${formatDuration(plan.totalSeconds)} with a ${n1(plan.splitPct)}% negative split`,
      `Average pace: ${formatPace(plan.averagePace)} /km`,
      `First half (${n2(plan.halfDistanceKm)} km): ${formatDuration(plan.firstHalfSeconds)} at ${formatPace(plan.firstHalfPace)} /km`,
      `Second half: ${formatDuration(plan.secondHalfSeconds)} at ${formatPace(plan.secondHalfPace)} /km`,
      `Gap between halves: ${formatDuration(plan.differenceSeconds)}`,
      "",
      "Segment splits:",
    ];
    plan.segments.forEach((segment) => {
      lines.push(
        `${n2(segment.to)} km — ${formatPace(segment.pacePerKm)} /km — elapsed ${formatDuration(segment.cumulativeSeconds)}`,
      );
    });
    return lines.join("\n");
  }, [ok, plan]);

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
    setPreset(DEFAULTS.preset);
    setDistanceKm(DEFAULTS.distanceKm);
    setHours(DEFAULTS.hours);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setSplitPct(DEFAULTS.splitPct);
    setMode(DEFAULTS.mode);
    setSegmentKm(DEFAULTS.segmentKm);
    setCopied(false);
  };

  const rows = [
    [
      "Average pace needed",
      ok ? `${formatPace(plan.averagePace)} /km · ${formatPace(plan.averagePacePerMile)} /mile` : DASH,
    ],
    ["First half time", ok ? `${formatDuration(plan.firstHalfSeconds)} (${n2(plan.halfDistanceKm)} km)` : DASH],
    ["First half pace", ok ? `${formatPace(plan.firstHalfPace)} /km` : DASH],
    ["Second half time", ok ? formatDuration(plan.secondHalfSeconds) : DASH],
    ["Second half pace", ok ? `${formatPace(plan.secondHalfPace)} /km` : DASH],
    ["Halves differ by", ok ? formatDuration(plan.differenceSeconds) : DASH],
    ["Opening pace on the plan", ok ? `${formatPace(plan.startPace)} /km` : DASH],
    ["Closing pace on the plan", ok ? `${formatPace(plan.finishPace)} /km` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
          Race pacing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Negative Split Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a goal finish time and how much faster you want the back half to be. The planner solves
          the two half times, then prints a split sheet you can write on a pace band.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nsp-preset">
              Race
            </label>
            <select
              id="nsp-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={preset}
              onChange={(event) => choosePreset(event.target.value)}
            >
              {RACE_PRESETS.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nsp-distance">
              Distance (km)
            </label>
            <input
              id="nsp-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={distanceKm}
              onChange={(event) => {
                setPreset("custom");
                setDistanceKm(event.target.value);
              }}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Goal finish time</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="nsp-hours">
                Hours
              </label>
              <input
                id="nsp-hours"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="23"
                step="1"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="nsp-minutes">
                Minutes
              </label>
              <input
                id="nsp-minutes"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="nsp-seconds">
                Seconds
              </label>
              <input
                id="nsp-seconds"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nsp-split">
              Second half faster by (%)
            </label>
            <input
              id="nsp-split"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={splitPct}
              onChange={(event) => setSplitPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nsp-mode">
              Plan shape
            </label>
            <select
              id="nsp-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {SPLIT_MODES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nsp-segment">
              Split table step (km)
            </label>
            <input
              id="nsp-segment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={segmentKm}
              onChange={(event) => setSegmentKm(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["1", "2", "3", "5"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSplitPct(value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value}% split
            </button>
          ))}
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
              Halfway split
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatDuration(plan.firstHalfSeconds) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Then come home in ${formatDuration(plan.secondHalfSeconds)} — ${formatDuration(plan.differenceSeconds)} quicker`
                : "Fix the highlighted input to see a plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy negative split plan"
              className={GHOST_BTN}
              disabled={!ok}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Split sheet</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">At km</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Pace /km</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Segment</th>
                  <th scope="col" className="py-2 text-right font-semibold">Elapsed</th>
                </tr>
              </thead>
              <tbody>
                {plan.segments.map((segment) => (
                  <tr key={segment.to} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{n2(segment.to)}</td>
                    <td className="py-2 pr-3 text-right">{formatPace(segment.pacePerKm)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {formatDuration(segment.seconds)}
                    </td>
                    <td className="py-2 text-right">{formatDuration(segment.cumulativeSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {ok && plan.notes.length > 0 ? (
        <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {plan.notes.map((note) => (
            <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A pacing plan only works if the goal time is realistic for your current fitness. Hills, heat
        and aid stations all move the splits, so treat the sheet as a guide and run by effort when
        conditions change.
      </p>
    </main>
  );
}
