"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";
import { GROSS_EFFICIENCY, TERRAINS, estimateCyclingCalories } from "../lib";

const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const n0 = (value) => (Number.isFinite(value) ? N0.format(value) : "—");
const n1 = (value) => (Number.isFinite(value) ? N1.format(value) : "—");

const duration = (hours) => {
  if (!Number.isFinite(hours)) return "—";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};

const DEFAULTS = {
  distanceKm: "20",
  speedKmph: "25",
  riderWeightKg: "75",
  bikeWeightKg: "10",
  terrain: "roadHoods",
  gradePct: "0",
  headwindKmph: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [distanceKm, setDistanceKm] = useState(DEFAULTS.distanceKm);
  const [speedKmph, setSpeedKmph] = useState(DEFAULTS.speedKmph);
  const [riderWeightKg, setRiderWeightKg] = useState(DEFAULTS.riderWeightKg);
  const [bikeWeightKg, setBikeWeightKg] = useState(DEFAULTS.bikeWeightKg);
  const [terrain, setTerrain] = useState(DEFAULTS.terrain);
  const [gradePct, setGradePct] = useState(DEFAULTS.gradePct);
  const [headwindKmph, setHeadwindKmph] = useState(DEFAULTS.headwindKmph);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateCyclingCalories({
        distanceKm: toNumber(distanceKm),
        speedKmph: toNumber(speedKmph),
        riderWeightKg: toNumber(riderWeightKg),
        bikeWeightKg: bikeWeightKg.trim() === "" ? 0 : toNumber(bikeWeightKg),
        terrain,
        gradePct: gradePct.trim() === "" ? 0 : toNumber(gradePct),
        headwindKmph: headwindKmph.trim() === "" ? 0 : toNumber(headwindKmph),
      }),
    [distanceKm, speedKmph, riderWeightKg, bikeWeightKg, terrain, gradePct, headwindKmph],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Cycling Calorie Estimate",
      `${distanceKm} km at ${speedKmph} km/h on ${result.surface.label.toLowerCase()}`,
      `Ride time: ${duration(result.hours)}`,
      `Calories burned: ${n0(result.kcal)} kcal`,
      `Average power: ${n0(result.avgPowerW)} W · mechanical work ${n0(result.workKj)} kJ`,
      `Per hour: ${n0(result.kcalPerHour)} kcal · per km: ${n1(result.kcalPerKm)} kcal`,
      `Compendium MET method (${result.metBand.met} MET): ${n0(result.metKcal)} kcal`,
      `Elevation change: ${n0(result.elevationGainM)} m`,
    ].join("\n");
  }, [ok, result, distanceKm, speedKmph]);

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
    setDistanceKm(DEFAULTS.distanceKm);
    setSpeedKmph(DEFAULTS.speedKmph);
    setRiderWeightKg(DEFAULTS.riderWeightKg);
    setBikeWeightKg(DEFAULTS.bikeWeightKg);
    setTerrain(DEFAULTS.terrain);
    setGradePct(DEFAULTS.gradePct);
    setHeadwindKmph(DEFAULTS.headwindKmph);
    setCopied(false);
  };

  const split = ok ? result.powerSplit : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Cycling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cycling Calorie Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out the power you have to produce against rolling resistance, air drag and gravity,
          then converts that work into food energy at {Math.round(GROSS_EFFICIENCY * 100)}% gross
          efficiency — the same reasoning a power meter uses.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-distance">
              Distance (km)
            </label>
            <input
              id="cc-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={distanceKm}
              onChange={(event) => setDistanceKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-speed">
              Average speed (km/h)
            </label>
            <input
              id="cc-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="0.5"
              value={speedKmph}
              onChange={(event) => setSpeedKmph(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-weight">
              Your weight (kg)
            </label>
            <input
              id="cc-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="250"
              step="0.5"
              value={riderWeightKg}
              onChange={(event) => setRiderWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-bike">
              Bike, kit and bottles (kg)
            </label>
            <input
              id="cc-bike"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={bikeWeightKg}
              onChange={(event) => setBikeWeightKg(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-terrain">
              Bike, position and surface
            </label>
            <select
              id="cc-terrain"
              className={`mt-2 ${INPUT_CLASS}`}
              value={terrain}
              onChange={(event) => setTerrain(event.target.value)}
            >
              {Object.entries(TERRAINS).map(([key, entry]) => (
                <option key={key} value={key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-grade">
              Average gradient (%)
            </label>
            <input
              id="cc-grade"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-30"
              max="30"
              step="0.5"
              value={gradePct}
              onChange={(event) => setGradePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-wind">
              Headwind (km/h, negative for tailwind)
            </label>
            <input
              id="cc-wind"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-100"
              max="100"
              step="1"
              value={headwindKmph}
              onChange={(event) => setHeadwindKmph(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n0(result.kcal)} kcal` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${duration(result.hours)} at an average of ${n0(result.avgPowerW)} W`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy cycling calorie estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {ok && result.power.coasting ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            At this gradient and speed gravity does all the work, so no pedalling energy is required.
            The figure shown is resting metabolism for the time spent riding.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Ride time", ok ? duration(result.hours) : "—"],
            ["Average power at the pedals", ok ? `${n0(result.avgPowerW)} W` : "—"],
            ["Mechanical work done", ok ? `${n0(result.workKj)} kJ` : "—"],
            ["Calories per hour", ok ? `${n0(result.kcalPerHour)} kcal/h` : "—"],
            ["Calories per km", ok ? `${n1(result.kcalPerKm)} kcal/km` : "—"],
            ["Total mass moved", ok ? `${n1(result.massKg)} kg` : "—"],
            ["Elevation change over the ride", ok ? `${n0(result.elevationGainM)} m` : "—"],
            [
              "Body fat energy equivalent",
              ok ? `${n0(result.fatGrams)} g` : "—",
            ],
            [
              `Compendium MET method (${ok ? result.metBand.met : "—"} MET)`,
              ok ? `${n0(result.metKcal)} kcal` : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where the effort goes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Share of pedalling power spent on each resistance.
        </p>
        <ul className="mt-4 space-y-3">
          {ok && split.some((part) => part.share > 0) ? (
            split.map((part) => (
              <li key={part.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--muted-foreground)]">{part.label}</span>
                  <span className="font-semibold">
                    {n0(part.watts)} W · {n0(part.share)}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${Math.max(0, Math.min(100, part.share))}%` }}
                  />
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-[var(--muted-foreground)]">—</li>
          )}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only, and individual metabolism varies by roughly 10-15% around these figures.
        Drivetrain losses, tyre pressure, altitude and drafting all shift the answer. This is general
        information, not dietary or medical advice — talk to a qualified professional before building
        a weight-loss plan around calorie targets.
      </p>
    </main>
  );
}
