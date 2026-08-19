"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Cpu, RotateCcw } from "lucide-react";

import {
  DEFAULT_IDLE_W,
  DEFAULT_MONITOR_W,
  DEFAULT_OTHER_W,
  DEFAULT_SLEEP_W,
  PSU_RATINGS,
  WORKLOADS,
  computeGamingPcCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : "—");
const num = (v, unit = "") => (Number.isFinite(v) ? `${NUM.format(v)}${unit}` : "—");

const DEFAULTS = {
  gpu: "320",
  cpu: "125",
  other: String(DEFAULT_OTHER_W),
  monitor: String(DEFAULT_MONITOR_W),
  psuId: "gold",
  workloadId: "aaa",
  gamingHours: "3",
  idleHours: "5",
  idleWatts: String(DEFAULT_IDLE_W),
  sleepWatts: String(DEFAULT_SLEEP_W),
  tariff: "8",
};

const GPU_PRESETS = [
  ["Entry (60-class)", 130],
  ["Mid (70-class)", 220],
  ["High (80-class)", 320],
  ["Flagship (90-class)", 450],
];

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [gpu, setGpu] = useState(DEFAULTS.gpu);
  const [cpu, setCpu] = useState(DEFAULTS.cpu);
  const [other, setOther] = useState(DEFAULTS.other);
  const [monitor, setMonitor] = useState(DEFAULTS.monitor);
  const [psuId, setPsuId] = useState(DEFAULTS.psuId);
  const [workloadId, setWorkloadId] = useState(DEFAULTS.workloadId);
  const [gamingHours, setGamingHours] = useState(DEFAULTS.gamingHours);
  const [idleHours, setIdleHours] = useState(DEFAULTS.idleHours);
  const [idleWatts, setIdleWatts] = useState(DEFAULTS.idleWatts);
  const [sleepWatts, setSleepWatts] = useState(DEFAULTS.sleepWatts);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeGamingPcCost({
        gpuWatts: gpu,
        cpuWatts: cpu,
        otherWatts: other,
        monitorWatts: monitor,
        psuId,
        workloadId,
        gamingHours,
        idleHours,
        idleWatts,
        sleepWatts,
        tariff,
      }),
    [gpu, cpu, other, monitor, psuId, workloadId, gamingHours, idleHours, idleWatts, sleepWatts, tariff],
  );

  const error = result.error || "";
  const ok = !error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Gaming PC Electricity Cost",
      `Workload: ${result.workload.label}`,
      `Wall draw under load: ${NUM.format(result.loadWallWatts)} W`,
      `Idle draw: ${NUM.format(result.idleWallWatts)} W`,
      `Energy: ${NUM.format(result.kwhPerDay)} kWh/day, ${NUM.format(result.kwhPerMonth)} kWh/month`,
      `Cost: ${INR2.format(result.costPerMonth)}/month, ${INR.format(result.costPerYear)}/year`,
      `Cost per hour of gaming: ${INR2.format(result.costPerHourGaming)}`,
      `Suggested PSU: ${result.suggestedPsuWatts} W`,
    ].join("\n");
  }, [ok, result]);

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
    setGpu(DEFAULTS.gpu);
    setCpu(DEFAULTS.cpu);
    setOther(DEFAULTS.other);
    setMonitor(DEFAULTS.monitor);
    setPsuId(DEFAULTS.psuId);
    setWorkloadId(DEFAULTS.workloadId);
    setGamingHours(DEFAULTS.gamingHours);
    setIdleHours(DEFAULTS.idleHours);
    setIdleWatts(DEFAULTS.idleWatts);
    setSleepWatts(DEFAULTS.sleepWatts);
    setTariff(DEFAULTS.tariff);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Cpu className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gaming PC Electricity Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add up GPU, CPU and platform power, convert it to wall-socket draw through your PSU&apos;s
          efficiency, then price the gaming, idle and sleep hours separately.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="pc-gpu">
              GPU board power / TGP (watts)
            </label>
            <input
              id="pc-gpu"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={gpu}
              onChange={(e) => setGpu(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GPU_PRESETS.map(([label, watts]) => (
                <button key={label} type="button" className={CHIP} onClick={() => setGpu(String(watts))}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-cpu">
              CPU package power limit (watts)
            </label>
            <input
              id="pc-cpu"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={cpu}
              onChange={(e) => setCpu(e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-other">
              Board, RAM, drives, fans and RGB (watts)
            </label>
            <input
              id="pc-other"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-monitor">
              Monitor(s) (watts)
            </label>
            <input
              id="pc-monitor"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={monitor}
              onChange={(e) => setMonitor(e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-psu">
              Power supply efficiency rating
            </label>
            <select id="pc-psu" className={INPUT} value={psuId} onChange={(e) => setPsuId(e.target.value)}>
              {PSU_RATINGS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({Math.round(p.efficiency * 100)}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-workload">
              Workload
            </label>
            <select
              id="pc-workload"
              className={INPUT}
              value={workloadId}
              onChange={(e) => setWorkloadId(e.target.value)}
            >
              {WORKLOADS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-gaming-hours">
              Hours per day under load
            </label>
            <input
              id="pc-gaming-hours"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={gamingHours}
              onChange={(e) => setGamingHours(e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-idle-hours">
              Hours per day on but idle
            </label>
            <input
              id="pc-idle-hours"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={idleHours}
              onChange={(e) => setIdleHours(e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-idle-watts">
              Idle system draw (watts, DC)
            </label>
            <input
              id="pc-idle-watts"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={idleWatts}
              onChange={(e) => setIdleWatts(e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="pc-sleep-watts">
              Sleep / soft-off draw (watts)
            </label>
            <input
              id="pc-sleep-watts"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={sleepWatts}
              onChange={(e) => setSleepWatts(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="pc-tariff">
              Electricity tariff (INR per kWh)
            </label>
            <input
              id="pc-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
            />
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated monthly electricity cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(result.costPerMonth) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${num(result.kwhPerMonth)} kWh a month, ${num(result.loadWallWatts)} W at the socket under load`
                : "Fix the highlighted input to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy gaming PC electricity cost result"
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
            ["Component (DC) load", ok ? `${num(result.dcLoadWatts)} W` : "—"],
            ["Wasted as PSU heat", ok ? `${num(result.psuLossWatts)} W` : "—"],
            ["Wall draw under load (with monitor)", ok ? `${num(result.loadWallWatts)} W` : "—"],
            ["Wall draw while idle", ok ? `${num(result.idleWallWatts)} W` : "—"],
            ["Energy per day", ok ? `${num(result.kwhPerDay)} kWh` : "—"],
            ["Energy per year", ok ? `${num(result.kwhPerYear)} kWh` : "—"],
            ["Cost per hour of play", ok ? money2(result.costPerHourGaming) : "—"],
            ["Cost per day", ok ? money2(result.costPerDay) : "—"],
            ["Cost per year", ok ? money(result.costPerYear) : "—"],
            ["Peak component load", ok ? `${num(result.peakDcWatts)} W` : "—"],
            ["Suggested PSU size", ok ? `${result.suggestedPsuWatts} W` : "—"],
            ["Estimated CO2 per year", ok ? `${num(result.co2KgPerYear)} kg` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Actual draw swings with frame-rate caps, resolution, overclocks and ambient
        temperature; a plug-in energy meter is the only way to measure your own rig exactly.
      </p>
    </main>
  );
}
