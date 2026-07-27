"use client";

import { useMemo, useState } from "react";
import { BatteryCharging, Check, Copy, RotateCcw } from "lucide-react";
import {
  BATTERY_TYPES,
  BATTERY_VOLTAGES,
  COMMON_LOADS,
  DEFAULT_BATTERY_TYPE,
  EFFICIENCY_PRESETS,
  RATED_DISCHARGE_HOURS,
  computeBackup,
  requiredAh,
  splitHours,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  batteryAh: "150",
  batteryVolts: "12",
  batteryCount: "1",
  loadWatts: "300",
  efficiencyPct: "80",
  batteryType: DEFAULT_BATTERY_TYPE,
  chargePercent: "100",
  targetHours: "4",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function durationText(hours) {
  const { hours: h, minutes: m } = splitHours(hours);
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

export default function ToolHome() {
  const [batteryAh, setBatteryAh] = useState(DEFAULTS.batteryAh);
  const [batteryVolts, setBatteryVolts] = useState(DEFAULTS.batteryVolts);
  const [batteryCount, setBatteryCount] = useState(DEFAULTS.batteryCount);
  const [loadWatts, setLoadWatts] = useState(DEFAULTS.loadWatts);
  const [efficiencyPct, setEfficiencyPct] = useState(DEFAULTS.efficiencyPct);
  const [batteryType, setBatteryType] = useState(DEFAULTS.batteryType);
  const [chargePercent, setChargePercent] = useState(DEFAULTS.chargePercent);
  const [targetHours, setTargetHours] = useState(DEFAULTS.targetHours);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBackup({
        batteryAh: toNumber(batteryAh),
        batteryVolts: toNumber(batteryVolts),
        batteryCount: toNumber(batteryCount),
        loadWatts: toNumber(loadWatts),
        efficiencyPct: toNumber(efficiencyPct),
        batteryType,
        chargePercent: toNumber(chargePercent),
      }),
    [batteryAh, batteryVolts, batteryCount, loadWatts, efficiencyPct, batteryType, chargePercent],
  );

  const sizing = useMemo(() => {
    if (result.error) return null;
    return requiredAh({
      loadWatts: toNumber(loadWatts),
      targetHours: toNumber(targetHours),
      bankVolts: result.bankVolts,
      efficiencyPct: toNumber(efficiencyPct),
      batteryType,
    });
  }, [result, loadWatts, targetHours, efficiencyPct, batteryType]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Inverter Backup Time Calculator",
      `Battery bank: ${batteryCount} x ${batteryAh} Ah @ ${batteryVolts} V = ${result.bankVolts} V, ${result.bankAh} Ah`,
      `Battery type: ${result.batteryLabel} (usable depth of discharge ${NUM.format(result.dodPercent)}%)`,
      `Connected load: ${NUM.format(toNumber(loadWatts))} W at ${NUM.format(toNumber(efficiencyPct))}% inverter efficiency`,
      `DC draw: ${NUM.format(result.dcWatts)} W = ${NUM2.format(result.dcCurrent)} A`,
      `Usable energy: ${NUM.format(result.usableWh)} Wh`,
      `Realistic backup (Peukert corrected): ${durationText(result.realisticHours)}`,
      `Ideal backup (no Peukert loss): ${durationText(result.simpleHours)}`,
    ].join("\n");
  }, [result, batteryAh, batteryVolts, batteryCount, loadWatts, efficiencyPct]);

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
    setBatteryAh(DEFAULTS.batteryAh);
    setBatteryVolts(DEFAULTS.batteryVolts);
    setBatteryCount(DEFAULTS.batteryCount);
    setLoadWatts(DEFAULTS.loadWatts);
    setEfficiencyPct(DEFAULTS.efficiencyPct);
    setBatteryType(DEFAULTS.batteryType);
    setChargePercent(DEFAULTS.chargePercent);
    setTargetHours(DEFAULTS.targetHours);
    setCopied(false);
  };

  const addLoad = (watts) => {
    const current = toNumber(loadWatts);
    const base = Number.isNaN(current) ? 0 : current;
    setLoadWatts(String(Math.round(base + watts)));
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BatteryCharging className="h-4 w-4" aria-hidden="true" />
          Home electrical
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Inverter Backup Time Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          How long your inverter really runs — battery Ah and bank voltage against the connected
          load, adjusted for inverter losses, usable depth of discharge and the Peukert capacity
          drop that lead-acid batteries show at high discharge rates.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ibt-ah">
              Battery capacity per block (Ah at C{RATED_DISCHARGE_HOURS})
            </label>
            <input
              id="ibt-ah"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={batteryAh}
              onChange={(event) => setBatteryAh(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ibt-volts">
              Battery voltage (V)
            </label>
            <select
              id="ibt-volts"
              className={`mt-2 ${INPUT_CLASS}`}
              value={batteryVolts}
              onChange={(event) => setBatteryVolts(event.target.value)}
            >
              {BATTERY_VOLTAGES.map((volt) => (
                <option key={volt} value={String(volt)}>
                  {volt} V
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ibt-count">
              Batteries in series
            </label>
            <input
              id="ibt-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="24"
              step="1"
              value={batteryCount}
              onChange={(event) => setBatteryCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ibt-type">
              Battery type
            </label>
            <select
              id="ibt-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={batteryType}
              onChange={(event) => setBatteryType(event.target.value)}
            >
              {Object.entries(BATTERY_TYPES).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ibt-load">
              Connected load (W)
            </label>
            <input
              id="ibt-load"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={loadWatts}
              onChange={(event) => setLoadWatts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ibt-eff">
              Inverter efficiency (%)
            </label>
            <input
              id="ibt-eff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={efficiencyPct}
              onChange={(event) => setEfficiencyPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ibt-soc">
              Battery state of charge (%)
            </label>
            <input
              id="ibt-soc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="5"
              value={chargePercent}
              onChange={(event) => setChargePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ibt-target">
              Backup you want (hours)
            </label>
            <input
              id="ibt-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={targetHours}
              onChange={(event) => setTargetHours(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Add a typical appliance to the load
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_LOADS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addLoad(item.watts)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                + {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          {EFFICIENCY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setEfficiencyPct(String(preset.value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Realistic backup time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? durationText(result.realisticHours) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM.format(toNumber(loadWatts))} W load on a ${result.bankVolts} V / ${result.bankAh} Ah bank`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy inverter backup time result"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bank voltage", ok ? `${NUM.format(result.bankVolts)} V` : DASH],
            ["Nominal stored energy", ok ? `${NUM.format(result.nominalWh)} Wh` : DASH],
            [
              "Usable energy this cycle",
              ok ? `${NUM.format(result.usableWh)} Wh (${NUM.format(result.dodPercent)}% depth of discharge)` : DASH,
            ],
            ["DC power drawn from battery", ok ? `${NUM.format(result.dcWatts)} W` : DASH],
            ["DC discharge current", ok ? `${NUM2.format(result.dcCurrent)} A` : DASH],
            [
              `Current at the C${RATED_DISCHARGE_HOURS} rating`,
              ok ? `${NUM2.format(result.ratedCurrent)} A` : DASH,
            ],
            ["Ideal backup (energy balance only)", ok ? durationText(result.simpleHours) : DASH],
            [
              "Peukert capacity factor",
              ok ? `${NUM.format(result.capacityFactor * 100)}% (exponent k = ${result.peukert})` : DASH,
            ],
            ["Energy lost as inverter heat", ok ? `${NUM.format(result.inverterLossWh)} Wh` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Battery size for your target backup</h2>
        {ok && sizing && !sizing.error ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            To hold {NUM.format(toNumber(loadWatts))} W for {NUM.format(toNumber(targetHours))} hours
            on a {result.bankVolts} V bank you need roughly{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {NUM.format(sizing.ah)} Ah
            </span>{" "}
            of rated capacity. Round up to the next standard block — real lead-acid banks give less
            than the energy-balance figure once the Peukert drop is counted.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Actual runtime depends on battery age, ambient temperature, motor starting
        surges and how accurate the printed Ah rating is. Have an electrician size and wire the bank.
      </p>
    </main>
  );
}
