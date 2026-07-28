"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Music4, RotateCcw } from "lucide-react";

import {
  GARBA_SEGMENTS,
  NAVRATRI_NIGHTS,
  WHO_WEEKLY_MODERATE_MIN,
  computeGarbaCalories,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const BAND_LABEL = { light: "Light", moderate: "Moderate", vigorous: "Vigorous" };

const DEFAULTS = {
  weight: "60",
  weightUnit: "kg",
  nights: String(NAVRATRI_NIGHTS),
  minutes: {
    warmup: "20",
    steady: "45",
    fast: "60",
    standing: "55",
  },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const num = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [nights, setNights] = useState(DEFAULTS.nights);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsed = {};
    for (const segment of GARBA_SEGMENTS) {
      const value = num(minutes[segment.id]);
      if (value === null) return { error: "Enter minutes as plain numbers." };
      parsed[segment.id] = value;
    }
    return computeGarbaCalories({
      weight: num(weight),
      weightUnit,
      minutes: parsed,
      nights: num(nights),
    });
  }, [weight, weightUnit, minutes, nights]);

  const hasError = Boolean(result.error);

  const setSegment = (id, value) => {
    setMinutes((current) => ({ ...current, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Garba Calorie Burn Calculator",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `One night: ${NUM0.format(result.nightMinutes)} min at the venue, ${NUM0.format(result.danceMinutes)} min actually dancing`,
      `Calories: ${NUM0.format(result.nightKcal)} kcal (${NUM0.format(result.nightNetKcal)} kcal above resting)`,
      `Average intensity: ${NUM2.format(result.averageMet)} METs`,
      `Moderate / vigorous minutes: ${NUM0.format(result.moderateMinutes)} / ${NUM0.format(result.vigorousMinutes)}`,
      `Moderate-equivalent minutes per night: ${NUM0.format(result.mvpaEquivalentPerNight)} of ${WHO_WEEKLY_MODERATE_MIN} weekly`,
      `Across ${NUM0.format(result.nights)} nights: ${NUM0.format(result.festivalKcal)} kcal`,
      "",
      "Breakdown:",
    ];
    for (const row of result.rows) {
      lines.push(
        `- ${row.label}: ${NUM0.format(row.minutes)} min at ${NUM1.format(row.met)} METs (${BAND_LABEL[row.band]}) = ${NUM0.format(row.kcal)} kcal`,
      );
    }
    return lines.join("\n");
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
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setNights(DEFAULTS.nights);
    setMinutes(DEFAULTS.minutes);
    setCopied(false);
  };

  const dancingWidth = hasError ? 0 : Math.max(0, Math.min(100, result.dancingShare));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Music4 className="h-4 w-4" aria-hidden="true" />
          Dance calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Garba Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Full-tempo garba and dandiya raas sit at 7.8 METs — vigorous-intensity activity. Enter the
          minutes at each tempo, plus the standing time, for a night you would actually recognise.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="garba-weight">
              Body weight
            </label>
            <input
              id="garba-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="garba-unit">
              Weight unit
            </label>
            <select
              id="garba-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weightUnit}
              onChange={(event) => setWeightUnit(event.target.value)}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="garba-nights">
              Nights you dance
            </label>
            <input
              id="garba-nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="15"
              step="1"
              value={nights}
              onChange={(event) => setNights(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Navratri runs for {NAVRATRI_NIGHTS} nights.
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Minutes in one night</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {GARBA_SEGMENTS.map((segment) => (
            <div key={segment.id}>
              <label className={LABEL_CLASS} htmlFor={`garba-${segment.id}`}>
                {segment.label}
              </label>
              <input
                id={`garba-${segment.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="5"
                value={minutes[segment.id]}
                onChange={(event) => setSegment(segment.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {NUM1.format(segment.met)} METs · {segment.source}
              </p>
            </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories in one night
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.nightKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a result."
                : `${NUM0.format(result.danceMinutes)} minutes dancing out of ${NUM0.format(result.nightMinutes)} at the venue`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy garba calorie result"
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

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              hasError
                ? "No dancing share available"
                : `${NUM0.format(result.dancingShare)} percent of the night was spent dancing`
            }
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${dancingWidth}%` }} />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {hasError
              ? "Dancing share unavailable"
              : `${NUM0.format(result.dancingShare)}% of your time at the venue was actually dancing`}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Net above resting", hasError ? DASH : `${NUM0.format(result.nightNetKcal)} kcal`],
            ["Average intensity", hasError ? DASH : `${NUM2.format(result.averageMet)} METs`],
            ["Burn rate", hasError ? DASH : `${NUM1.format(result.kcalPerMin)} kcal/min`],
            ["Moderate minutes", hasError ? DASH : NUM0.format(result.moderateMinutes)],
            ["Vigorous minutes", hasError ? DASH : NUM0.format(result.vigorousMinutes)],
            [
              "Moderate-equivalent minutes (vigorous counted double)",
              hasError ? DASH : NUM0.format(result.mvpaEquivalentPerNight),
            ],
            [
              "Across all nights entered",
              hasError ? DASH : `${NUM0.format(result.festivalKcal)} kcal`,
            ],
            [
              "Net across all nights",
              hasError ? DASH : `${NUM0.format(result.festivalNetKcal)} kcal`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.meetsWhoInOneNight && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            One night alone already clears the WHO weekly minimum of {WHO_WEEKLY_MODERATE_MIN}
            {" "}moderate-intensity minutes.
          </p>
        )}
      </section>

      {!hasError && result.rows.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Tempo breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Tempo band
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Minutes
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    METs
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Band
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    kcal
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(row.minutes)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(row.met)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {BAND_LABEL[row.band]}
                    </td>
                    <td className="py-2 text-right font-semibold">{NUM0.format(row.kcal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        There is no published MET value for garba specifically, so this uses the general dancing
        entry that covers folk dancing, and names the source for every tempo band. Nine consecutive
        late nights of vigorous dancing is a real training load — hydrate, and stop if you feel
        dizzy or unwell.
      </p>
    </main>
  );
}
