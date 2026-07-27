"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tv } from "lucide-react";

import {
  DEFAULT_STANDBY_W,
  PANEL_TYPES,
  PICTURE_MODES,
  computeTvUsage,
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
  diagonal: "55",
  panelId: "led",
  modeId: "standard",
  hours: "5",
  tariff: "8",
  standby: String(DEFAULT_STANDBY_W),
  knownWatts: "",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SIZE_PRESETS = [32, 43, 55, 65, 75];

export default function ToolHome() {
  const [diagonal, setDiagonal] = useState(DEFAULTS.diagonal);
  const [panelId, setPanelId] = useState(DEFAULTS.panelId);
  const [modeId, setModeId] = useState(DEFAULTS.modeId);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [standby, setStandby] = useState(DEFAULTS.standby);
  const [knownWatts, setKnownWatts] = useState(DEFAULTS.knownWatts);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTvUsage({
        diagonalInches: diagonal,
        panelId,
        modeId,
        hoursPerDay: hours,
        tariff,
        standbyWatts: standby,
        knownWatts: knownWatts.trim() === "" ? null : knownWatts,
      }),
    [diagonal, panelId, modeId, hours, tariff, standby, knownWatts],
  );

  const error = result.error || "";
  const ok = !error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "TV Power Consumption",
      `Screen: ${diagonal} inch ${result.panel.label}`,
      `Picture mode: ${result.mode.label}`,
      `On-mode power: ${NUM.format(result.onWatts)} W`,
      `Viewing: ${hours} h/day`,
      `Energy: ${NUM.format(result.kwhPerDay)} kWh/day, ${NUM.format(result.kwhPerMonth)} kWh/month`,
      `Cost: ${INR2.format(result.costPerMonth)}/month, ${INR.format(result.costPerYear)}/year`,
      `Standby alone: ${INR.format(result.standbyCostPerYear)}/year`,
      `Estimated CO2: ${NUM.format(result.co2KgPerYear)} kg/year`,
    ].join("\n");
  }, [ok, result, diagonal, hours]);

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
    setDiagonal(DEFAULTS.diagonal);
    setPanelId(DEFAULTS.panelId);
    setModeId(DEFAULTS.modeId);
    setHours(DEFAULTS.hours);
    setTariff(DEFAULTS.tariff);
    setStandby(DEFAULTS.standby);
    setKnownWatts(DEFAULTS.knownWatts);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tv className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TV Power Consumption Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate what your television costs to run. Power is modelled from 16:9 screen area and
          panel technology, then multiplied by your viewing hours and tariff.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="tv-diagonal">
              Screen size (inches, diagonal)
            </label>
            <input
              id="tv-diagonal"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="10"
              max="120"
              step="1"
              value={diagonal}
              onChange={(e) => setDiagonal(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZE_PRESETS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setDiagonal(String(size))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {size}&quot;
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="tv-panel">
              Panel technology
            </label>
            <select
              id="tv-panel"
              className={INPUT}
              value={panelId}
              onChange={(e) => setPanelId(e.target.value)}
            >
              {PANEL_TYPES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="tv-mode">
              Picture mode
            </label>
            <select
              id="tv-mode"
              className={INPUT}
              value={modeId}
              onChange={(e) => setModeId(e.target.value)}
            >
              {PICTURE_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="tv-hours">
              Viewing hours per day
            </label>
            <input
              id="tv-hours"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="tv-tariff">
              Electricity tariff (INR per kWh)
            </label>
            <input
              id="tv-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="tv-standby">
              Standby draw (watts)
            </label>
            <input
              id="tv-standby"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={standby}
              onChange={(e) => setStandby(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="tv-known">
              Known on-mode wattage from the energy label (optional)
            </label>
            <input
              id="tv-known"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="Leave blank to estimate from screen size"
              value={knownWatts}
              onChange={(e) => setKnownWatts(e.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated monthly running cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(result.costPerMonth) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${num(result.kwhPerMonth)} kWh a month at ${num(result.onWatts)} W while on`
                : "Fix the highlighted input to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy TV power consumption result"
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
            ["Screen area (16:9)", ok ? `${num(result.areaSqIn)} sq in` : "—"],
            [
              "On-mode power",
              ok
                ? `${num(result.onWatts)} W${result.usedKnownWatts ? " (from your label)" : ""}`
                : "—",
            ],
            ["Energy per day", ok ? `${num(result.kwhPerDay)} kWh` : "—"],
            ["Energy per year", ok ? `${num(result.kwhPerYear)} kWh` : "—"],
            ["Cost per day", ok ? money2(result.costPerDay) : "—"],
            ["Cost per year", ok ? money(result.costPerYear) : "—"],
            ["Cost of one hour of viewing", ok ? money2(result.costPerViewingHour) : "—"],
            ["Standby cost per year", ok ? money2(result.standbyCostPerYear) : "—"],
            ["Standby share of daily energy", ok ? num(result.standbyShareOfDay, "%") : "—"],
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
        Estimates only. Real draw varies with brightness, content and sound level — the on-mode
        power printed on your TV energy label always beats a model, so enter it when you have it.
      </p>
    </main>
  );
}
