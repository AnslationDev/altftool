"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";
import { MAX_HR_FORMULAS, computeWalkingZones, walksPerWeek } from "../lib";

const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const bpm = (value) => (Number.isFinite(value) ? `${N0.format(value)} bpm` : DASH);

const DEFAULTS = { age: "40", restingHr: "65", formula: "tanaka", minutesPerWalk: "30", method: "max" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [restingHr, setRestingHr] = useState(DEFAULTS.restingHr);
  const [formula, setFormula] = useState(DEFAULTS.formula);
  const [minutesPerWalk, setMinutesPerWalk] = useState(DEFAULTS.minutesPerWalk);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => computeWalkingZones({ age: toNumber(age), restingHr: toNumber(restingHr), formula }),
    [age, restingHr, formula],
  );

  const ok = !result.error;
  const usingHrr = method === "hrr";
  const walks = walksPerWeek(toNumber(minutesPerWalk));

  const lowOf = (zone) => (usingHrr ? zone.hrrLowBpm : zone.maxLowBpm);
  const highOf = (zone) => (usingHrr ? zone.hrrHighBpm : zone.maxHighBpm);

  const briskLow = ok ? (usingHrr ? result.briskHrrLowBpm : result.briskLowBpm) : NaN;
  const briskHigh = ok ? (usingHrr ? result.briskHrrHighBpm : result.briskHighBpm) : NaN;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Heart Rate Zones for Walking",
      `Age ${age}, resting heart rate ${restingHr} bpm`,
      `Estimated maximum heart rate: ${result.maxHrRounded} bpm (${result.formulaLabel})`,
      `Heart rate reserve: ${Math.round(result.heartRateReserve)} bpm`,
      `Brisk-walk target: ${briskLow}-${briskHigh} bpm`,
      "",
      ...result.zones.map(
        (zone) => `${zone.label}: ${lowOf(zone)}-${highOf(zone)} bpm, cadence ${zone.cadence}`,
      ),
      "",
      `Weekly target: ${result.weeklyModerateMinutes} min moderate or ${result.weeklyVigorousMinutes} min vigorous`,
    ].join("\n");
  }, [ok, result, age, restingHr, briskLow, briskHigh, usingHrr]);

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
    setRestingHr(DEFAULTS.restingHr);
    setFormula(DEFAULTS.formula);
    setMinutesPerWalk(DEFAULTS.minutesPerWalk);
    setMethod(DEFAULTS.method);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Heart rate zones
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Heart Rate Zones for Walking
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Walking counts as exercise once it is brisk enough. These are the beats-per-minute bands
          for your age and resting pulse, with the steps-per-minute cadence that usually goes with
          each one, so you can hit the zone without staring at a watch.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hrw-age">
              Age (years)
            </label>
            <input
              id="hrw-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hrw-resting">
              Resting heart rate (bpm)
            </label>
            <input
              id="hrw-resting"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max="120"
              step="1"
              value={restingHr}
              onChange={(event) => setRestingHr(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hrw-formula">
              Maximum heart rate formula
            </label>
            <select
              id="hrw-formula"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
            >
              {Object.values(MAX_HR_FORMULAS).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hrw-minutes">
              Minutes per walk
            </label>
            <input
              id="hrw-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="240"
              step="5"
              value={minutesPerWalk}
              onChange={(event) => setMinutesPerWalk(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["max", "% of maximum HR"],
            ["hrr", "% of heart rate reserve"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMethod(value)}
              aria-pressed={method === value}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                method === value
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Brisk-walk target zone
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${briskLow}–${briskHigh}` : DASH}
              <span className="ml-2 text-base font-semibold text-[var(--muted-foreground)]">bpm</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? "Moderate intensity — talk but not sing, roughly 100–129 steps per minute"
                : "Fix the inputs above to see your zones"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy walking heart rate zones"
              className={`${GHOST_BTN} disabled:opacity-50`}
              disabled={!ok}
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
            ["Estimated maximum heart rate", ok ? bpm(result.maxHrRounded) : DASH],
            ["Resting heart rate", ok ? bpm(result.restingHr) : DASH],
            ["Heart rate reserve", ok ? bpm(Math.round(result.heartRateReserve)) : DASH],
            ["Formula used", ok ? result.formulaLabel : DASH],
            [
              "Walks per week to hit 150 moderate minutes",
              ok && walks ? `${walks} walks of ${minutesPerWalk} min` : DASH,
            ],
            [
              "Weekly guideline",
              ok
                ? `${result.weeklyModerateMinutes} min moderate or ${result.weeklyVigorousMinutes} min vigorous`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">{result.formulaNote}</p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">
            Your zones by {usingHrr ? "heart rate reserve" : "percentage of maximum"}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Zone
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Heart rate
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Cadence
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    How it should feel
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.zones.map((zone) => (
                  <tr
                    key={zone.key}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      zone.key === "moderate" ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{zone.label}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {lowOf(zone)}–{highOf(zone)}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{zone.cadence}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{zone.feel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Age-based maximum heart rate is an estimate with a standard deviation of roughly 10 bpm, so
        treat the boundaries as soft. Beta blockers and some other medicines lower heart rate at any
        effort, which makes these zones meaningless — use perceived effort and the talk test instead,
        and ask your doctor before starting a new exercise programme if you have a heart condition.
      </p>
    </main>
  );
}
