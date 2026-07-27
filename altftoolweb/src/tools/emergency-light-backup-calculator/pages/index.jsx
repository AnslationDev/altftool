"use client";

import { useMemo, useState } from "react";
import { BatteryCharging, Check, Copy, RotateCcw } from "lucide-react";

import { AUTONOMY_TARGETS, BATTERY_TYPES, calculateBackup } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  batteryId: "sla",
  voltage: "12",
  capacity: "7.2",
  soh: "100",
  lamps: "2",
  wattsPerLamp: "9",
  driverEff: "85",
  standby: "0.4",
  chargeCurrent: "1",
  target: "3",
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [batteryId, setBatteryId] = useState(DEFAULTS.batteryId);
  const [voltage, setVoltage] = useState(DEFAULTS.voltage);
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [soh, setSoh] = useState(DEFAULTS.soh);
  const [lamps, setLamps] = useState(DEFAULTS.lamps);
  const [wattsPerLamp, setWattsPerLamp] = useState(DEFAULTS.wattsPerLamp);
  const [driverEff, setDriverEff] = useState(DEFAULTS.driverEff);
  const [standby, setStandby] = useState(DEFAULTS.standby);
  const [chargeCurrent, setChargeCurrent] = useState(DEFAULTS.chargeCurrent);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateBackup({
        batteryId,
        voltage: toNumber(voltage),
        capacityAh: toNumber(capacity),
        stateOfHealthPercent: toNumber(soh),
        lampCount: toNumber(lamps),
        wattsPerLamp: toNumber(wattsPerLamp),
        driverEfficiencyPercent: toNumber(driverEff),
        standbyWatts: toNumber(standby),
        chargeCurrentA: toNumber(chargeCurrent),
        targetHours: toNumber(target),
      }),
    [batteryId, voltage, capacity, soh, lamps, wattsPerLamp, driverEff, standby, chargeCurrent, target],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Emergency light backup",
      `Battery: ${result.batteryLabel}, ${voltage} V ${capacity} Ah at ${soh}% health`,
      `Usable energy: ${num(result.usableWh)} Wh (${num(result.depthOfDischargePercent)}% depth of discharge)`,
      `Load: ${num(result.lampLoadW)} W of LED, ${num(result.drawW)} W drawn from the battery at ${num(result.currentA)} A`,
      `Runtime on energy alone: ${num(result.runtimeEnergyH)} h`,
      `Runtime after Peukert derating: ${num(result.runtimePeukertH)} h`,
      `Design backup time: ${result.designRuntimeText}`,
      `Against a ${target} h target: ${result.meetsTarget ? "meets it" : `short by ${num(result.shortfallH)} h`}`,
      `Capacity needed for ${target} h: ${num(result.requiredAh)} Ah`,
      `Recharge after a full discharge: ${result.rechargeText} at ${chargeCurrent} A`,
    ].join("\n");
  }, [failed, result, voltage, capacity, soh, target, chargeCurrent]);

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
    setBatteryId(DEFAULTS.batteryId);
    setVoltage(DEFAULTS.voltage);
    setCapacity(DEFAULTS.capacity);
    setSoh(DEFAULTS.soh);
    setLamps(DEFAULTS.lamps);
    setWattsPerLamp(DEFAULTS.wattsPerLamp);
    setDriverEff(DEFAULTS.driverEff);
    setStandby(DEFAULTS.standby);
    setChargeCurrent(DEFAULTS.chargeCurrent);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const rows = [
    ["LED load", failed ? DASH : `${num(result.lampLoadW)} W`],
    ["Drawn from the battery", failed ? DASH : `${num(result.drawW)} W at ${num(result.currentA)} A`],
    ["Discharge rate", failed ? DASH : `${num(result.cRate)} C`],
    ["Nominal battery energy", failed ? DASH : `${num(result.nominalWh)} Wh`],
    [
      "Usable energy",
      failed ? DASH : `${num(result.usableWh)} Wh at ${num(result.depthOfDischargePercent)}% DoD`,
    ],
    ["Runtime on energy alone", failed ? DASH : `${num(result.runtimeEnergyH)} h`],
    [
      "Runtime after Peukert derating",
      failed ? DASH : `${num(result.runtimePeukertH)} h (n = ${num(result.peukertExponent)})`,
    ],
    ["Design backup time", failed ? DASH : result.designRuntimeText],
    [
      "Against your target",
      failed
        ? DASH
        : result.meetsTarget
          ? `Meets it with ${num(result.marginH)} h spare`
          : `Short by ${num(result.shortfallH)} h`,
    ],
    ["Energy the target needs", failed ? DASH : `${num(result.requiredWh)} Wh`],
    ["Capacity the target needs", failed ? DASH : `${num(result.requiredAh)} Ah`],
    ["Extra capacity to add", failed ? DASH : `${num(result.extraAh)} Ah`],
    ["Amp-hours removed", failed ? DASH : `${num(result.ahRemoved)} Ah`],
    [
      "Recharge time",
      failed ? DASH : `${result.rechargeText} (charge factor ${num(result.chargeFactor)})`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BatteryCharging className="h-4 w-4" aria-hidden="true" />
          Lighting design
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Emergency Light Backup Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how long an emergency light or inverter-backed LED circuit actually runs, including the
          depth of discharge the chemistry allows and the Peukert derating that shortens lead-acid runtime.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Battery</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="eb-type">
              Chemistry
            </label>
            <select
              id="eb-type"
              className={FIELD}
              value={batteryId}
              onChange={(event) => {
                const next = event.target.value;
                setBatteryId(next);
                const preset = BATTERY_TYPES.find((item) => item.id === next);
                if (preset) setVoltage(String(preset.nominalVoltage));
              }}
            >
              {BATTERY_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="eb-voltage">
              Nominal voltage (V)
            </label>
            <input
              id="eb-voltage"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.1"
              value={voltage}
              onChange={(event) => setVoltage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="eb-capacity">
              Rated capacity (Ah)
            </label>
            <input
              id="eb-capacity"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="eb-soh">
              State of health (%)
            </label>
            <input
              id="eb-soh"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={soh}
              onChange={(event) => setSoh(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Load</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="eb-lamps">
              Number of LED heads
            </label>
            <input
              id="eb-lamps"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={lamps}
              onChange={(event) => setLamps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="eb-watts">
              Watts per head
            </label>
            <input
              id="eb-watts"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={wattsPerLamp}
              onChange={(event) => setWattsPerLamp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="eb-driver">
              Driver efficiency (%)
            </label>
            <input
              id="eb-driver"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={driverEff}
              onChange={(event) => setDriverEff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="eb-standby">
              Control circuit standby (W)
            </label>
            <input
              id="eb-standby"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={standby}
              onChange={(event) => setStandby(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Target and charging</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {AUTONOMY_TARGETS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={toNumber(target) === item.hours}
              className={toNumber(target) === item.hours ? CHIP_ON : CHIP}
              onClick={() => setTarget(String(item.hours))}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="eb-target">
              Backup time you need (hours)
            </label>
            <input
              id="eb-target"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="eb-charge">
              Charger output current (A)
            </label>
            <input
              id="eb-charge"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.05"
              step="0.1"
              value={chargeCurrent}
              onChange={(event) => setChargeCurrent(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Backup time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.designRuntimeText}
            </p>
            <p
              className={`mt-1 text-sm ${
                failed
                  ? "text-[var(--muted-foreground)]"
                  : result.meetsTarget
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {failed
                ? "Fix the highlighted input to see a runtime."
                : result.meetsTarget
                  ? `Clears the ${num(result.targetHours)} h target`
                  : `Falls ${num(result.shortfallH)} h short of the ${num(result.targetHours)} h target`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the backup calculation"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Figures are a design estimate for planning. Statutory emergency lighting must be commissioned and
        duration-tested to the standard your fire authority enforces, and the test result — not a
        calculation — is what counts on the log sheet.
      </p>
    </main>
  );
}
