"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { DISCIPLINES, computeSkatingSession, minutesForTarget } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const kcal = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} kcal` : DASH);
const kcal1 = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} kcal` : DASH);

const DEFAULTS = {
  weight: "70",
  speed: "16",
  minutes: "60",
  discipline: "inline",
  target: "400",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [discipline, setDiscipline] = useState(DEFAULTS.discipline);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSkatingSession({
        weightKg: toNumber(weight),
        speedKmh: toNumber(speed),
        minutes: toNumber(minutes),
        discipline,
      }),
    [weight, speed, minutes, discipline],
  );

  const ok = !result.error;

  const targetMinutes = useMemo(() => {
    if (!ok) return null;
    return minutesForTarget({ kcalPerMinute: result.kcalPerMinute, targetKcal: toNumber(target) });
  }, [ok, result.kcalPerMinute, target]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Skating Calorie Burn Calculator",
      `Body weight: ${NUM1.format(toNumber(weight))} kg`,
      `Discipline: ${result.disciplineLabel}`,
      `Speed: ${NUM1.format(result.speedKmh)} km/h (${NUM1.format(result.speedMph)} mph)`,
      `Session: ${NUM0.format(result.minutes)} minutes, about ${NUM1.format(result.distanceKm)} km`,
      `Intensity used: ${result.met} METs — ${result.bandLabel}`,
      `Gross energy: ${kcal(result.grossKcal)}`,
      `Net energy (above resting): ${kcal(result.netKcal)}`,
      `Energy per km: ${kcal1(result.kcalPerKm)}`,
    ].join("\n");
  }, [ok, weight, result]);

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
    setSpeed(DEFAULTS.speed);
    setMinutes(DEFAULTS.minutes);
    setDiscipline(DEFAULTS.discipline);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const rows = [
    ["Net energy (above resting)", ok ? kcal(result.netKcal) : DASH],
    ["Distance covered", ok ? `${NUM1.format(result.distanceKm)} km` : DASH],
    [
      "Speed",
      ok ? `${NUM1.format(result.speedKmh)} km/h (${NUM1.format(result.speedMph)} mph)` : DASH,
    ],
    ["Intensity used", ok ? `${result.met} METs` : DASH],
    ["Matched Compendium row", ok ? result.bandLabel : DASH],
    ["Energy per km", ok ? kcal1(result.kcalPerKm) : DASH],
    ["Energy per hour", ok ? kcal(result.kcalPerHour) : DASH],
    ["Energy per minute", ok ? `${NUM2.format(result.kcalPerMinute)} kcal` : DASH],
    ["Burned at rest over the same time", ok ? kcal(result.restingKcal) : DASH],
  ];

  const activeDiscipline = DISCIPLINES.find((item) => item.id === discipline) || DISCIPLINES[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Skating
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Skating Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Inline, quad and ice skating burn very different amounts of energy at the same speed. Pick
          your discipline, enter the speed you actually hold and the tool matches the nearest
          published intensity row.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="skate-discipline">
              Discipline
            </label>
            <select
              id="skate-discipline"
              className={`mt-2 ${INPUT_CLASS}`}
              value={discipline}
              onChange={(event) => {
                const next = event.target.value;
                setDiscipline(next);
                const match = DISCIPLINES.find((item) => item.id === next);
                if (match) setSpeed(String(match.defaultSpeedKmh));
              }}
            >
              {DISCIPLINES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="skate-weight">
              Body weight (kg)
            </label>
            <input
              id="skate-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="skate-speed">
              Average skating speed (km/h)
            </label>
            <input
              id="skate-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="60"
              step="0.5"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="skate-minutes">
              Time skating (minutes)
            </label>
            <input
              id="skate-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          {activeDiscipline.bands
            ? "Speed selects the published intensity row for this discipline."
            : "This discipline has a single published intensity row, so speed only affects the distance shown."}
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories burned skating
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kcal(result.grossKcal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM0.format(result.minutes)} minutes at ${NUM1.format(result.speedKmh)} km/h`
                : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy skating calorie result"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Time to hit a calorie target</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="skate-target">
              Calorie target (kcal)
            </label>
            <input
              id="skate-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="25"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm text-[var(--muted-foreground)]">
              Skating time needed at this intensity:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {targetMinutes === null ? DASH : `${NUM0.format(targetMinutes)} min`}
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Intensity rows used</h2>
        <table className="mt-3 w-full min-w-[360px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Discipline
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Pace
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                METs
              </th>
            </tr>
          </thead>
          <tbody>
            {DISCIPLINES.flatMap((sport) =>
              sport.bands
                ? sport.bands.map((band) => (
                    <tr
                      key={`${sport.id}-${band.id}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3">{sport.label}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{band.label}</td>
                      <td className="py-2 text-right font-semibold">{band.met}</td>
                    </tr>
                  ))
                : [
                    <tr key={sport.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{sport.label}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                        Single published row
                      </td>
                      <td className="py-2 text-right font-semibold">{sport.met}</td>
                    </tr>,
                  ],
            )}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET values come from the 2011 Compendium of Physical Activities and are population averages.
        Rink sessions include a lot of coasting and standing, so real-world totals are often lower
        than a continuous-skating estimate. Informational only.
      </p>
    </main>
  );
}
