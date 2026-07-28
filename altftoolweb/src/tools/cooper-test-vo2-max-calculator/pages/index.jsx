"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";
import {
  COOPER_DURATION_MIN,
  DISTANCE_UNITS,
  computeCooperTest,
} from "../lib";

const DEFAULTS = { distance: "2400", unit: "m", age: "32", sex: "male" };

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeCooperTest({
        distance: Number(form.distance),
        unit: form.unit,
        age: Number(form.age),
        sex: form.sex,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cooper 12-minute run test",
      `Distance: ${NUM0.format(result.metres)} m (${NUM2.format(result.miles)} miles, ${NUM2.format(result.laps400)} laps of a 400 m track)`,
      `Estimated VO2 max: ${NUM1.format(result.vo2Max)} ml/kg/min`,
      `Rating for a ${result.age}-year-old ${result.sex}: ${result.rating}`,
      `Average speed: ${NUM1.format(result.speedKmh)} km/h (${result.paceLabel})`,
      `Aerobic capacity: ${NUM1.format(result.mets)} METs`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Fitness test
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cooper Test VO2 Max Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Run or walk as far as you can in {COOPER_DURATION_MIN} minutes on a flat measured course,
          enter the distance, and Cooper&apos;s 1968 equation estimates your VO2 max along with the
          pace, METs and the fitness rating for your age and sex.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Your test</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="cooper-distance">
              Distance covered in {COOPER_DURATION_MIN} minutes
            </label>
            <input
              id="cooper-distance"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.distance}
              onChange={setField("distance")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cooper-unit">
              Unit
            </label>
            <select id="cooper-unit" className={FIELD} value={form.unit} onChange={setField("unit")}>
              {DISTANCE_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="cooper-age">
              Age (years)
            </label>
            <input
              id="cooper-age"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="13"
              max="100"
              step="1"
              value={form.age}
              onChange={setField("age")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cooper-sex">
              Sex (for the rating table)
            </label>
            <select id="cooper-sex" className={FIELD} value={form.sex} onChange={setField("sex")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[1600, 2000, 2400, 2800].map((metres) => (
            <button
              key={metres}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, distance: String(metres), unit: "m" }))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {metres} m
            </button>
          ))}
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated VO2 max
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM1.format(result.vo2Max)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see an estimate." : `ml/kg/min · ${result.rating} for your age and sex`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Cooper test result"
              className={GHOST_BTN}
              disabled={hasError}
            >
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
            ["Distance", hasError ? DASH : `${NUM0.format(result.metres)} m · ${NUM2.format(result.miles)} miles`],
            ["Laps of a 400 m track", hasError ? DASH : NUM2.format(result.laps400)],
            ["Average speed", hasError ? DASH : `${NUM1.format(result.speedKmh)} km/h`],
            ["Pace", hasError ? DASH : result.paceLabel],
            ["Aerobic capacity", hasError ? DASH : `${NUM1.format(result.mets)} METs`],
            ["Cooper rating", hasError ? DASH : result.rating],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.ratingRow && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">
            Cooper distance bands — {result.sex === "male" ? "men" : "women"} aged {result.ratingRow.minAge}
            {result.ratingRow.maxAge >= 100 ? "+" : `-${result.ratingRow.maxAge}`}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Rating</th>
                  <th scope="col" className="py-2 font-semibold">Distance in 12 minutes</th>
                </tr>
              </thead>
              <tbody>
                {result.ratingRow.bands.map((band, index) => {
                  const upper = index === 0 ? null : result.ratingRow.bands[index - 1].min - 1;
                  const isYours = band.label === result.rating;
                  return (
                    <tr
                      key={band.label}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        isYours ? "font-semibold text-[var(--primary)]" : ""
                      }`}
                    >
                      <td className="py-2 pr-3">{band.label}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">
                        {upper === null ? `${band.min} m and above` : `${band.min}-${upper} m`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Running the test properly</h2>
        <ul className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
          <li>Warm up for 10 minutes and use a flat, measured course — a 400 m track is ideal.</li>
          <li>Cover as much ground as you can in 12 minutes; walking breaks are allowed and still count.</li>
          <li>Avoid a hot day, a headwind or a hilly route, all of which shorten the distance and the estimate.</li>
          <li>Repeat under the same conditions if you want to compare, and cool down afterwards.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This is a field estimate, not a laboratory measurement, and it typically
        sits within a few ml/kg/min of a treadmill test. A maximal effort is not suitable for
        everyone — if you are inactive, unwell, pregnant, or have a heart, lung or joint condition,
        speak to a doctor before attempting the test, and stop if you feel chest pain, dizziness or
        unusual breathlessness.
      </p>
    </main>
  );
}
