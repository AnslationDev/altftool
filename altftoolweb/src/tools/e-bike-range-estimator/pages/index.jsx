"use client";

import { useMemo, useState } from "react";
import { BatteryCharging, Check, Copy, RotateCcw } from "lucide-react";
import {
  ASSIST_LEVELS,
  DEFAULT_SYSTEM_EFFICIENCY,
  DEFAULT_USABLE_FRACTION,
  EBIKE_CLASSES,
  TERRAINS,
  estimateEbikeRange,
} from "../lib";

const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const n0 = (value) => (Number.isFinite(value) ? N0.format(value) : "—");
const n1 = (value) => (Number.isFinite(value) ? N1.format(value) : "—");
const n2 = (value) => (Number.isFinite(value) ? N2.format(value) : "—");

const DEFAULTS = {
  batteryVolts: "36",
  batteryAmpHours: "14",
  riderWeightKg: "75",
  bikeWeightKg: "25",
  cargoKg: "0",
  speedKmph: "25",
  terrain: "cityUpright",
  gradePct: "0",
  headwindKmph: "0",
  assist: "tour",
  ebikeClass: "eu",
  systemEfficiency: String(Math.round(DEFAULT_SYSTEM_EFFICIENCY * 100)),
  usableFraction: String(Math.round(DEFAULT_USABLE_FRACTION * 100)),
  temperatureC: "25",
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
  const [batteryVolts, setBatteryVolts] = useState(DEFAULTS.batteryVolts);
  const [batteryAmpHours, setBatteryAmpHours] = useState(DEFAULTS.batteryAmpHours);
  const [riderWeightKg, setRiderWeightKg] = useState(DEFAULTS.riderWeightKg);
  const [bikeWeightKg, setBikeWeightKg] = useState(DEFAULTS.bikeWeightKg);
  const [cargoKg, setCargoKg] = useState(DEFAULTS.cargoKg);
  const [speedKmph, setSpeedKmph] = useState(DEFAULTS.speedKmph);
  const [terrain, setTerrain] = useState(DEFAULTS.terrain);
  const [gradePct, setGradePct] = useState(DEFAULTS.gradePct);
  const [headwindKmph, setHeadwindKmph] = useState(DEFAULTS.headwindKmph);
  const [assist, setAssist] = useState(DEFAULTS.assist);
  const [ebikeClass, setEbikeClass] = useState(DEFAULTS.ebikeClass);
  const [systemEfficiency, setSystemEfficiency] = useState(DEFAULTS.systemEfficiency);
  const [usableFraction, setUsableFraction] = useState(DEFAULTS.usableFraction);
  const [temperatureC, setTemperatureC] = useState(DEFAULTS.temperatureC);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateEbikeRange({
        batteryVolts: toNumber(batteryVolts),
        batteryAmpHours: toNumber(batteryAmpHours),
        riderWeightKg: toNumber(riderWeightKg),
        bikeWeightKg: bikeWeightKg.trim() === "" ? 0 : toNumber(bikeWeightKg),
        cargoKg: cargoKg.trim() === "" ? 0 : toNumber(cargoKg),
        speedKmph: toNumber(speedKmph),
        terrain,
        gradePct: gradePct.trim() === "" ? 0 : toNumber(gradePct),
        headwindKmph: headwindKmph.trim() === "" ? 0 : toNumber(headwindKmph),
        assist,
        ebikeClass,
        systemEfficiency: toNumber(systemEfficiency) / 100,
        usableFraction: toNumber(usableFraction) / 100,
        temperatureC: toNumber(temperatureC),
      }),
    [
      batteryVolts,
      batteryAmpHours,
      riderWeightKg,
      bikeWeightKg,
      cargoKg,
      speedKmph,
      terrain,
      gradePct,
      headwindKmph,
      assist,
      ebikeClass,
      systemEfficiency,
      usableFraction,
      temperatureC,
    ],
  );

  const ok = !result.error;
  const hasRange = ok && Number.isFinite(result.selected.rangeKm);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "E-Bike Range Estimate",
      `Battery: ${n0(result.nominalWh)} Wh nominal, ${n0(result.usableWh)} Wh usable`,
      `Class: ${result.className}`,
      `Assist: ${result.assistLabel} (${Math.round(result.assistRatio * 100)}% of rider power)`,
      `Total power to hold ${speedKmph} km/h: ${n0(result.power.total)} W`,
      `Motor: ${n0(result.selected.motorW)} W · rider: ${n0(result.selected.riderW)} W`,
      hasRange
        ? `Estimated range: ${n1(result.selected.rangeKm)} km at ${n2(result.selected.whPerKm)} Wh/km`
        : "Above the assist cut-off speed — the motor contributes nothing",
      ...result.byLevel.map(
        (level) =>
          `${level.label}: ${Number.isFinite(level.rangeKm) ? `${n1(level.rangeKm)} km` : "no assist"}`,
      ),
    ].join("\n");
  }, [ok, result, hasRange, speedKmph]);

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
    setBatteryVolts(DEFAULTS.batteryVolts);
    setBatteryAmpHours(DEFAULTS.batteryAmpHours);
    setRiderWeightKg(DEFAULTS.riderWeightKg);
    setBikeWeightKg(DEFAULTS.bikeWeightKg);
    setCargoKg(DEFAULTS.cargoKg);
    setSpeedKmph(DEFAULTS.speedKmph);
    setTerrain(DEFAULTS.terrain);
    setGradePct(DEFAULTS.gradePct);
    setHeadwindKmph(DEFAULTS.headwindKmph);
    setAssist(DEFAULTS.assist);
    setEbikeClass(DEFAULTS.ebikeClass);
    setSystemEfficiency(DEFAULTS.systemEfficiency);
    setUsableFraction(DEFAULTS.usableFraction);
    setTemperatureC(DEFAULTS.temperatureC);
    setCopied(false);
  };

  const maxLevelRange = ok
    ? result.byLevel.reduce(
        (max, level) => (Number.isFinite(level.rangeKm) ? Math.max(max, level.rangeKm) : max),
        1,
      )
    : 1;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BatteryCharging className="h-4 w-4" aria-hidden="true" />
          Electric bikes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">E Bike Range Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Range is set by how much energy the motor puts into the road. This estimator computes the
          power needed to hold your speed, splits it between you and the motor at your assist level,
          caps the motor at the legal limit for your class, and derates the battery for reserve and
          cold.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-volts">
              Battery voltage (V)
            </label>
            <input
              id="eb-volts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="12"
              max="120"
              step="0.1"
              value={batteryVolts}
              onChange={(event) => setBatteryVolts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-ah">
              Battery capacity (Ah)
            </label>
            <input
              id="eb-ah"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="60"
              step="0.1"
              value={batteryAmpHours}
              onChange={(event) => setBatteryAmpHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-rider">
              Rider weight (kg)
            </label>
            <input
              id="eb-rider"
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
            <label className={LABEL_CLASS} htmlFor="eb-bike">
              E-bike weight (kg)
            </label>
            <input
              id="eb-bike"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={bikeWeightKg}
              onChange={(event) => setBikeWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-cargo">
              Cargo and luggage (kg)
            </label>
            <input
              id="eb-cargo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={cargoKg}
              onChange={(event) => setCargoKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-speed">
              Riding speed (km/h)
            </label>
            <input
              id="eb-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="60"
              step="1"
              value={speedKmph}
              onChange={(event) => setSpeedKmph(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="eb-terrain">
              Bike and surface
            </label>
            <select
              id="eb-terrain"
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
            <label className={LABEL_CLASS} htmlFor="eb-assist">
              Assist level
            </label>
            <select
              id="eb-assist"
              className={`mt-2 ${INPUT_CLASS}`}
              value={assist}
              onChange={(event) => setAssist(event.target.value)}
            >
              {Object.entries(ASSIST_LEVELS).map(([key, entry]) => (
                <option key={key} value={key}>
                  {entry.label} ({Math.round(entry.ratio * 100)}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-class">
              E-bike class
            </label>
            <select
              id="eb-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ebikeClass}
              onChange={(event) => setEbikeClass(event.target.value)}
            >
              {Object.entries(EBIKE_CLASSES).map(([key, entry]) => (
                <option key={key} value={key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-grade">
              Average gradient (%)
            </label>
            <input
              id="eb-grade"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-25"
              max="25"
              step="0.5"
              value={gradePct}
              onChange={(event) => setGradePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-wind">
              Headwind (km/h)
            </label>
            <input
              id="eb-wind"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-60"
              max="60"
              step="1"
              value={headwindKmph}
              onChange={(event) => setHeadwindKmph(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-temp">
              Ambient temperature (deg C)
            </label>
            <input
              id="eb-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-30"
              max="55"
              step="1"
              value={temperatureC}
              onChange={(event) => setTemperatureC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-usable">
              Usable battery capacity (%)
            </label>
            <input
              id="eb-usable"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="40"
              max="100"
              step="1"
              value={usableFraction}
              onChange={(event) => setUsableFraction(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eb-eff">
              Battery-to-wheel efficiency (%)
            </label>
            <input
              id="eb-eff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="100"
              step="1"
              value={systemEfficiency}
              onChange={(event) => setSystemEfficiency(event.target.value)}
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
              Estimated range on one charge
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasRange ? `${n1(result.selected.rangeKm)} km` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? hasRange
                  ? `${result.assistLabel} assist · ${n2(result.selected.whPerKm)} Wh/km · about ${n1(result.rideHours)} hours of riding`
                  : "Above the assist cut-off — you are riding on your own legs"
                : "Fix the inputs above to see a range"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy e-bike range estimate"
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

        {ok && result.selected.aboveCutoff ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            {n0(speedKmph)} km/h is above the {n0(result.cutoffKmph)} km/h cut-off for this class, so
            the motor legally provides no assistance and the battery is barely used.
          </p>
        ) : null}
        {ok && result.selected.capped ? (
          <p className="mt-4 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm font-medium text-[var(--info)]">
            The motor is pinned at its {n0(result.maxMotorW)} W limit, so the assist level cannot
            deliver its full ratio here. You have to make up the difference.
          </p>
        ) : null}
        {ok && result.riderShortfall > 0 ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            Holding this speed asks {n0(result.selected.riderW)} W of you, about{" "}
            {n0(result.riderShortfall)} W more than a typical rider sustains. Expect to go slower, or
            use a higher assist level.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Battery, nominal", ok ? `${n0(result.nominalWh)} Wh` : "—"],
            [
              "Battery, usable after reserve and temperature",
              ok ? `${n0(result.usableWh)} Wh (${n0(result.tempFactor * 100)}% of rated at this temperature)` : "—",
            ],
            ["Total mass moved", ok ? `${n1(result.massKg)} kg` : "—"],
            ["Power needed at the wheel", ok ? `${n0(result.power.total)} W` : "—"],
            ["Motor share", ok ? `${n0(result.selected.motorW)} W` : "—"],
            ["Your share", ok ? `${n0(result.selected.riderW)} W` : "—"],
            [
              "Energy use",
              hasRange ? `${n2(result.selected.whPerKm)} Wh per km` : "—",
            ],
            ["Riding time on a charge", hasRange ? `${n1(result.rideHours)} hours` : "—"],
            [
              "Total climb over that range",
              hasRange ? `${n0(result.elevationGainM)} m` : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Range at every assist level</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Same route, same speed — only the share of work the motor takes changes.
        </p>
        <ul className="mt-4 space-y-3">
          {ok ? (
            result.byLevel.map((level) => (
              <li key={level.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--muted-foreground)]">
                    {level.label} ({Math.round(level.ratio * 100)}%)
                  </span>
                  <span className="font-semibold">
                    {Number.isFinite(level.rangeKm)
                      ? `${n1(level.rangeKm)} km · motor ${n0(level.motorW)} W`
                      : "No assist at this speed"}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full rounded-full bg-[var(--primary)]"
                    style={{
                      width: `${Number.isFinite(level.rangeKm) ? Math.max(2, Math.min(100, (level.rangeKm / maxLevelRange) * 100)) : 0}%`,
                    }}
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
        A steady-state model: real rides involve stops, starts and varying gradient, all of which cost
        more energy than cruising. Battery capacity also fades with age, typically to around 80% of
        rated after several hundred full cycles. Treat the figure as a planning estimate and keep a
        reserve.
      </p>
    </main>
  );
}
