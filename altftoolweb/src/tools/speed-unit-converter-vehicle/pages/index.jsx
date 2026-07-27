"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";
import {
  ALERT_REACTION_SECONDS,
  DESIGN_REACTION_SECONDS,
  SPEED_UNITS,
  SURFACE_FRICTION,
  convertSpeed,
  stoppingDistance,
  unitById,
} from "../lib";

const DEFAULTS = {
  value: "100",
  from: "kmph",
  surface: "dry-asphalt",
  reaction: String(DESIGN_REACTION_SECONDS),
  grade: "0",
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
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const fmt = (value, decimals) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [from, setFrom] = useState(DEFAULTS.from);
  const [surface, setSurface] = useState(DEFAULTS.surface);
  const [reaction, setReaction] = useState(DEFAULTS.reaction);
  const [grade, setGrade] = useState(DEFAULTS.grade);
  const [copied, setCopied] = useState(false);

  const conversion = useMemo(
    () => convertSpeed({ value: toNumber(value), from }),
    [value, from],
  );

  const friction = useMemo(
    () => SURFACE_FRICTION.find((item) => item.id === surface) || SURFACE_FRICTION[0],
    [surface],
  );

  const stop = useMemo(() => {
    if (conversion.error) return { error: conversion.error };
    return stoppingDistance({
      speedMps: conversion.mps,
      reactionSeconds: toNumber(reaction),
      friction: friction.mu,
      gradePercent: toNumber(grade),
    });
  }, [conversion, reaction, friction, grade]);

  const activeUnit = unitById(from);
  const error = conversion.error || stop.error || "";

  const summary = useMemo(() => {
    if (error) return "";
    const lines = [`Speed: ${fmt(toNumber(value), 3)} ${activeUnit.short}`];
    for (const unit of SPEED_UNITS) {
      lines.push(`${unit.label}: ${fmt(conversion.values[unit.id], unit.decimals)} ${unit.short}`);
    }
    lines.push(
      `Surface: ${friction.label} (mu ${friction.mu})`,
      `Reaction distance: ${fmt(stop.reactionDistance, 1)} m`,
      `Braking distance: ${fmt(stop.brakingDistance, 1)} m`,
      `Total stopping distance: ${fmt(stop.totalDistance, 1)} m`,
    );
    return lines.join("\n");
  }, [error, value, activeUnit, conversion, friction, stop]);

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
    setValue(DEFAULTS.value);
    setFrom(DEFAULTS.from);
    setSurface(DEFAULTS.surface);
    setReaction(DEFAULTS.reaction);
    setGrade(DEFAULTS.grade);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Vehicle speed
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Speed Unit Converter (Vehicle)</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a road, marine or aviation speed between km/h, mph, knots, m/s, ft/s and Mach, and
          see the reaction and braking distance that same speed needs on your chosen surface.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="speed-value">
              Speed
            </label>
            <input
              id="speed-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="speed-unit">
              Unit
            </label>
            <select
              id="speed-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            >
              {SPEED_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label} ({unit.short})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="speed-surface">
              Road surface
            </label>
            <select
              id="speed-surface"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surface}
              onChange={(event) => setSurface(event.target.value)}
            >
              {SURFACE_FRICTION.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (mu {item.mu})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="speed-reaction">
              Driver reaction time (seconds)
            </label>
            <input
              id="speed-reaction"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10"
              step="0.1"
              value={reaction}
              onChange={(event) => setReaction(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="speed-grade">
              Road grade (%, negative is downhill)
            </label>
            <input
              id="speed-grade"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-30"
              max="30"
              step="0.5"
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReaction(String(ALERT_REACTION_SECONDS))}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            Alert driver ({ALERT_REACTION_SECONDS}s)
          </button>
          <button
            type="button"
            onClick={() => setReaction(String(DESIGN_REACTION_SECONDS))}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            Design value ({DESIGN_REACTION_SECONDS}s)
          </button>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total stopping distance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : `${fmt(stop.totalDistance, 1)} m`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : `${fmt(conversion.values.kmph, 1)} km/h on ${friction.label.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy speed conversion and stopping distance"
              className={GHOST_BTN}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Reaction distance (before braking starts)", error ? DASH : `${fmt(stop.reactionDistance, 1)} m`],
            ["Braking distance", error ? DASH : `${fmt(stop.brakingDistance, 1)} m`],
            ["Deceleration", error ? DASH : `${fmt(stop.decelerationMps2, 2)} m/s² (${fmt(stop.decelerationG, 2)} g)`],
            ["Time spent braking", error ? DASH : `${fmt(stop.brakingSeconds, 1)} s`],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Same speed in every unit</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Unit</th>
                <th scope="col" className="py-2 text-right font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {SPEED_UNITS.map((unit) => (
                <tr key={unit.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    <span className="font-semibold">{unit.label}</span>
                    <span className="ml-1 text-[var(--muted-foreground)]">({unit.short})</span>
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {conversion.error ? DASH : fmt(conversion.values[unit.id], unit.decimals)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Stopping distance is a physics estimate for a car with good tyres and working ABS. Load,
          tread depth, brake condition and road texture all change it — leave a bigger gap than the
          number here.
        </p>
      </section>
    </main>
  );
}
