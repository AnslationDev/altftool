"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import {
  ALTERNATE_FOOTLINE_CM,
  STANDARD_FOOTLINE_CM,
  scoreSitAndReach,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const SIGNED = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  age: "34",
  sex: "male",
  reading: "30",
  unit: "cm",
  footline: String(STANDARD_FOOTLINE_CM),
  previous: "",
};
const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [reading, setReading] = useState(DEFAULTS.reading);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [footline, setFootline] = useState(DEFAULTS.footline);
  const [previous, setPrevious] = useState(DEFAULTS.previous);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const previousRaw = String(previous).trim();
    return scoreSitAndReach({
      age: toNumber(age),
      sex,
      reading: toNumber(reading),
      unit,
      footlineCm: Number(footline),
      previousReading: previousRaw === "" ? null : toNumber(previousRaw),
    });
  }, [age, sex, reading, unit, footline, previous]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Sit and Reach Flexibility Test",
      `Age ${age} (${result.ageGroup} band), ${sex}`,
      `Reading: ${reading} ${unit} on a ${footline} cm footline box`,
      `Standardised: ${NUM1.format(result.standardCm)} cm (${NUM1.format(result.standardIn)} in) on the 26 cm scale`,
      `Rating: ${result.band}`,
      `Past the toes: ${SIGNED.format(result.pastToesCm)} cm`,
    ];
    if (result.nextBand) {
      lines.push(`${NUM1.format(result.cmToNextBand)} cm more to reach ${result.nextBand}`);
    }
    if (result.change) {
      lines.push(`Change vs previous test: ${SIGNED.format(result.change.deltaCm)} cm`);
    }
    return lines.join("\n");
  }, [hasError, result, age, sex, reading, unit, footline]);

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
    setSex(DEFAULTS.sex);
    setReading(DEFAULTS.reading);
    setUnit(DEFAULTS.unit);
    setFootline(DEFAULTS.footline);
    setPrevious(DEFAULTS.previous);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Flexibility testing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sit and Reach Flexibility Test
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your best sit-and-reach reading in centimetres or inches. The score is converted to
          the standard 26 cm footline scale and rated against the CSEP trunk forward flexion norms
          for your age and sex.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-age">
              Age (years)
            </label>
            <input
              id="sr-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-sex">
              Sex (reference table)
            </label>
            <select
              id="sr-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-reading">
              Best reading (this test)
            </label>
            <input
              id="sr-reading"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.5"
              value={reading}
              onChange={(event) => setReading(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-unit">
              Units
            </label>
            <select
              id="sr-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="cm">Centimetres</option>
              <option value="in">Inches</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-footline">
              Box footline
            </label>
            <select
              id="sr-footline"
              className={`mt-2 ${INPUT_CLASS}`}
              value={footline}
              onChange={(event) => setFootline(event.target.value)}
            >
              <option value={String(STANDARD_FOOTLINE_CM)}>26 cm at the feet (standard)</option>
              <option value={String(ALTERNATE_FOOTLINE_CM)}>23 cm at the feet</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sr-previous">
              Previous reading (optional)
            </label>
            <input
              id="sr-previous"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="0.5"
              placeholder="Leave blank to skip"
              value={previous}
              onChange={(event) => setPrevious(event.target.value)}
            />
          </div>
        </div>
      </section>

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
              Your rating
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.band}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your band."
                : `${NUM1.format(result.standardCm)} cm on the 26 cm scale · ${result.ageGroup} age band`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sit and reach result"
              disabled={hasError}
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            [
              "Standardised score",
              hasError
                ? DASH
                : `${NUM1.format(result.standardCm)} cm / ${NUM1.format(result.standardIn)} in`,
            ],
            [
              "Relative to the toes",
              hasError
                ? DASH
                : `${SIGNED.format(result.pastToesCm)} cm (${
                    result.reachesToes ? "reaches or passes the toes" : "short of the toes"
                  })`,
            ],
            [
              "Next band",
              hasError ? DASH : result.nextBand ? result.nextBand : "Already in the top band",
            ],
            [
              "Distance to next band",
              hasError ? DASH : result.nextBand ? `${NUM1.format(result.cmToNextBand)} cm` : "0 cm",
            ],
            ["Excellent starts at", hasError ? DASH : `${NUM1.format(result.excellentAt)} cm`],
            [
              "Change vs previous test",
              hasError
                ? DASH
                : result.change
                  ? `${SIGNED.format(result.change.deltaCm)} cm (${SIGNED.format(result.change.deltaIn)} in)`
                  : "No previous reading entered",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.change && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              result.change.improved
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {result.change.improved
              ? `Flexibility improved by ${NUM1.format(Math.abs(result.change.deltaCm))} cm since the last test.`
              : `Down ${NUM1.format(Math.abs(result.change.deltaCm))} cm since the last test — check warm-up, time of day and hydration before reading too much into it.`}
          </p>
        )}

        {!hasError && result.ageAboveTable && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            The published table stops at 69, so the 60-69 band is used as the closest reference.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Reference bands · {result.ageGroup} · {sex === "male" ? "male" : "female"}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Rating
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Reading (cm, 26 cm scale)
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.name}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.current ? "font-semibold text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 text-right">
                      {row.max === null ? `${row.min}+` : `${row.min}-${row.max}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Warm up first, keep the knees flat, slide the marker slowly and hold for two seconds. Take
            the best of three or four trials.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational fitness reference only. The sit-and-reach mainly reflects hamstring and lower
        back length and is affected by arm and leg proportions. Stop if you feel nerve pain or
        tingling down the leg and speak to a physiotherapist.
      </p>
    </main>
  );
}
