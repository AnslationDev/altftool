"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import {
  FEATURES,
  LOOKAHEAD_MONTHS,
  MAX_AGE_MONTHS,
  SAFE_WATER_TEMP_C,
  buildSafetyChecklist,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  age: "10",
  waterTemp: "60",
  features: { stairs: true, balcony: true, pool: false, waterStore: true, garden: false },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PRIORITY_STYLE = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  high: "bg-[var(--warning-soft)] text-[var(--warning)]",
  standard: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [waterTemp, setWaterTemp] = useState(DEFAULTS.waterTemp);
  const [features, setFeatures] = useState(DEFAULTS.features);
  const [doneIds, setDoneIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSafetyChecklist({
        ageMonths: toNumber(age),
        features,
        doneIds,
        waterTempC: toNumber(waterTemp),
      }),
    [age, features, doneIds, waterTemp],
  );

  const failed = Boolean(result.error);

  const toggleFeature = (id) =>
    setFeatures((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleDone = (id) =>
    setDoneIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Child Safety Home Checklist",
      `Child age: ${result.ageMonths} months (${result.stage.label})`,
      `Items due now: ${result.totalItems}, done ${result.doneCount}, outstanding ${result.outstandingCount}`,
      `Critical still open: ${result.criticalOutstanding} of ${result.criticalCount}`,
      `Readiness: ${result.readinessPct.toFixed(0)}%`,
      "",
      "Outstanding, highest priority first:",
      ...result.nextActions.map((item) => `- [${item.priority}] ${item.action}`),
    ].join("\n");
  }, [failed, result]);

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
    setAge(DEFAULTS.age);
    setWaterTemp(DEFAULTS.waterTemp);
    setFeatures(DEFAULTS.features);
    setDoneIds([]);
    setCopied(false);
  };

  const readinessLabel = failed ? DASH : `${NUM0.format(Math.round(result.readinessPct))}%`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Childproofing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Child Safety Home Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Childproofing is not one job. Each new skill — rolling, crawling, pulling up, climbing —
          opens a different set of hazards, so the list below is filtered to the age you enter and
          to what your home actually has.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-age">
              Child&apos;s age (months)
            </label>
            <input
              id="cs-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_AGE_MONTHS}
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
            <p className={HINT_CLASS}>
              0 to {MAX_AGE_MONTHS} months. Items appear {LOOKAHEAD_MONTHS} months before the skill
              that makes them relevant.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-water">
              Hot water setting (°C)
            </label>
            <input
              id="cs-water"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={waterTemp}
              onChange={(event) => setWaterTemp(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Recommended maximum with young children in the house: {SAFE_WATER_TEMP_C} °C.
            </p>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className={LABEL_CLASS}>What does your home have?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <label
                  key={feature.id}
                  htmlFor={`cs-feat-${feature.id}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <input
                    id={`cs-feat-${feature.id}`}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={Boolean(features[feature.id])}
                    onChange={() => toggleFeature(feature.id)}
                  />
                  <span>{feature.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {failed && (
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
              Childproofing readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{readinessLabel}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the age above to build the list."
                : `${result.stage.label} — ${result.doneCount} of ${result.totalItems} items done`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy safety checklist summary"
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

        {!failed && (
          <>
            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                result.criticalOutstanding > 0
                  ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                  : "bg-[var(--success-soft)] text-[var(--success)]"
              }`}
            >
              {result.verdict}
            </p>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{result.stage.summary}</p>
          </>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Items that apply at this age", failed ? DASH : NUM0.format(result.totalItems)],
            ["Still outstanding", failed ? DASH : NUM0.format(result.outstandingCount)],
            [
              "Critical items open",
              failed ? DASH : `${result.criticalOutstanding} of ${result.criticalCount}`,
            ],
            [
              "Coming up in the next 3 months",
              failed ? DASH : NUM0.format(result.upcoming.length),
            ],
            [
              "Hot water burn time (adult skin)",
              failed || !result.scald || result.scald.error
                ? DASH
                : result.scald.safe
                  ? "Within the recommended limit"
                  : `about ${result.scald.seconds} s`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.scald && !result.scald.error && !result.scald.safe && (
          <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            {result.scald.note}
          </p>
        )}
      </section>

      {!failed &&
        result.byRoom.map((room) => (
          <section
            key={room.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold">{room.label}</h2>
              <span className="text-xs text-[var(--muted-foreground)]">
                {room.items.filter((item) => item.done).length} / {room.items.length} done
              </span>
            </div>
            <ul className="mt-3 space-y-3">
              {room.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <label htmlFor={`cs-item-${item.id}`} className="flex cursor-pointer gap-3">
                    <input
                      id={`cs-item-${item.id}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={item.done}
                      onChange={() => toggleDone(item.id)}
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            item.done ? "text-[var(--muted-foreground)] line-through" : ""
                          }`}
                        >
                          {item.action}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRIORITY_STYLE[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {item.why}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      {!failed && result.upcoming.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Do these before the next stage</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            These become relevant within {LOOKAHEAD_MONTHS} months. Fitting them early is easier
            than fitting them after the first incident.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Due at
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.upcoming.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 align-top whitespace-nowrap font-semibold">
                      {item.fromMonths} mo
                    </td>
                    <td className="py-2 align-top text-[var(--muted-foreground)]">{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and no checklist replaces supervision — most serious injuries to small
        children happen in homes that were partly childproofed. Standards cited are CPSC 16 CFR
        rules, ASTM and ANSI/WCMA voluntary standards and published paediatric guidance; check the
        equivalents that apply where you live, and speak to your paediatrician or local fire service
        about anything specific to your child or building.
      </p>
    </main>
  );
}
