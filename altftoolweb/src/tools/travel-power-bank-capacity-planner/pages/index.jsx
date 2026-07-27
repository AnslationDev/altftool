"use client";

import { useMemo, useState } from "react";
import { BatteryCharging, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_TRANSFER_EFFICIENCY,
  DEVICE_PRESETS,
  planPowerBank,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const mah = (v) => `${INT.format(Number.isFinite(v) ? v : 0)} mAh`;
const wh = (v) => `${DEC1.format(Number.isFinite(v) ? v : 0)} Wh`;
const pct = (v) => `${DEC1.format(Number.isFinite(v) ? v : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const makeRow = (presetId, rechargesPerDay, key) => {
  const preset = DEVICE_PRESETS.find((item) => item.id === presetId) ?? DEVICE_PRESETS[0];
  return {
    key,
    presetId: preset.id,
    name: preset.label,
    capacityMah: String(preset.capacityMah),
    nominalV: String(preset.nominalV),
    rechargesPerDay: String(rechargesPerDay),
  };
};

const DEFAULT_ROWS = [
  makeRow("phone-large", 1.5, "d1"),
  makeRow("earbuds", 1, "d2"),
];
const DEFAULT_DAYS = "3";
const DEFAULT_EFFICIENCY = String(Math.round(DEFAULT_TRANSFER_EFFICIENCY * 100));
const DEFAULT_RESERVE = "15";

const BAND_STYLES = {
  free: "bg-[var(--success-soft)] text-[var(--success)]",
  approval: "bg-[var(--warning-soft)] text-[var(--warning)]",
  forbidden: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextKey, setNextKey] = useState(3);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [efficiency, setEfficiency] = useState(DEFAULT_EFFICIENCY);
  const [reserve, setReserve] = useState(DEFAULT_RESERVE);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const d = toNumber(days);
    const eff = toNumber(efficiency);
    const res = toNumber(reserve);
    if ([d, eff, res].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers for days, efficiency and reserve." };
    }
    const devices = rows.map((row) => ({
      name: row.name,
      capacityMah: toNumber(row.capacityMah),
      nominalV: toNumber(row.nominalV),
      rechargesPerDay: toNumber(row.rechargesPerDay),
    }));
    if (devices.some((device) => [device.capacityMah, device.nominalV, device.rechargesPerDay].some(Number.isNaN))) {
      return { error: "Every device needs a numeric capacity, voltage and recharges per day." };
    }
    return planPowerBank({ devices, days: d, efficiency: eff / 100, reservePct: res });
  }, [rows, days, efficiency, reserve]);

  const failed = Boolean(plan.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Travel Power Bank Capacity Planner",
      `Days without mains: ${INT.format(plan.days)}`,
      `Energy needed per day: ${wh(plan.dailyDeliveredWh)}`,
      `Energy delivered over the trip: ${wh(plan.deliveredWh)}`,
      `With ${pct(plan.reservePct)} reserve: ${wh(plan.targetDeliveredWh)}`,
      `Conversion losses at ${pct(plan.efficiency * 100)} efficiency: ${wh(plan.lossesWh)}`,
      `Power bank needed: ${mah(plan.requiredRatedMah)} (${wh(plan.requiredStoredWh)} at 3.7 V)`,
      plan.suggestedSizeMah ? `Nearest retail size: ${mah(plan.suggestedSizeMah)}` : "No single retail size is large enough",
      `Banks to carry: ${INT.format(plan.banksNeeded)}`,
      `Airline band: ${plan.airline.label} — ${plan.airline.detail}`,
    ].join("\n");
  }, [plan, failed]);

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

  const updateRow = (key, patch) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const applyPreset = (key, presetId) => {
    const preset = DEVICE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    updateRow(key, {
      presetId,
      name: preset.label,
      capacityMah: String(preset.capacityMah),
      nominalV: String(preset.nominalV),
    });
  };

  const addRow = () => {
    setRows((current) => [...current, makeRow("smartwatch", 0.5, `d${nextKey}`)]);
    setNextKey((value) => value + 1);
  };

  const removeRow = (key) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  };

  const reset = () => {
    setRows(DEFAULT_ROWS);
    setNextKey(3);
    setDays(DEFAULT_DAYS);
    setEfficiency(DEFAULT_EFFICIENCY);
    setReserve(DEFAULT_RESERVE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BatteryCharging className="h-4 w-4" aria-hidden="true" />
          Travel power
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Travel Power Bank Capacity Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts every device battery to watt-hours, adds the conversion losses a bank really has,
          and tells you the mAh rating to buy — plus whether it clears the 100 Wh airline limit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Devices you need to charge</h2>
        <div className="mt-4 grid gap-4">
          {rows.map((row, index) => (
            <div key={row.key} className="rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Device {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  disabled={rows.length === 1}
                  aria-label={`Remove device ${index + 1}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`preset-${row.key}`}>
                    Device type
                  </label>
                  <select
                    id={`preset-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.presetId}
                    onChange={(event) => applyPreset(row.key, event.target.value)}
                  >
                    {DEVICE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cap-${row.key}`}>
                    Battery capacity (mAh)
                  </label>
                  <input
                    id={`cap-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="50"
                    value={row.capacityMah}
                    onChange={(event) => updateRow(row.key, { capacityMah: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`volt-${row.key}`}>
                    Battery voltage (V)
                  </label>
                  <input
                    id={`volt-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.05"
                    value={row.nominalV}
                    onChange={(event) => updateRow(row.key, { nominalV: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`rech-${row.key}`}>
                    Full recharges per day
                  </label>
                  <input
                    id={`rech-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="0.25"
                    value={row.rechargesPerDay}
                    onChange={(event) => updateRow(row.key, { rechargesPerDay: event.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add device
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Trip and bank assumptions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-days">
              Days without a mains socket
            </label>
            <input
              id="pb-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-eff">
              Transfer efficiency (%)
            </label>
            <input
              id="pb-eff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Real USB banks land near 75-90%. Lower it in the cold.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pb-reserve">
              Safety reserve (%)
            </label>
            <input
              id="pb-reserve"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="5"
              value={reserve}
              onChange={(event) => setReserve(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Power bank to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : mah(plan.requiredRatedMah)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see a capacity."
                : `${wh(plan.requiredStoredWh)} of stored energy at 3.7 V${
                    plan.suggestedSizeMah ? ` · nearest retail size ${mah(plan.suggestedSizeMah)}` : ""
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy power bank sizing result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Energy your devices need per day", failed ? DASH : wh(plan.dailyDeliveredWh)],
            ["Energy over the whole trip", failed ? DASH : wh(plan.deliveredWh)],
            ["Safety reserve added", failed ? DASH : wh(plan.reserveWh)],
            ["Lost to conversion and cables", failed ? DASH : wh(plan.lossesWh)],
            ["Stored energy the bank must hold", failed ? DASH : wh(plan.requiredStoredWh)],
            ["Banks to carry", failed ? DASH : INT.format(plan.banksNeeded)],
            ["Capacity per bank", failed ? DASH : `${mah(plan.perBankMah)} (${wh(plan.perBankWh)})`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div
            className={`mt-5 rounded-md px-3 py-2 text-sm font-medium ${BAND_STYLES[plan.airline.band]}`}
          >
            <span className="font-semibold">Airline: {plan.airline.label}.</span> {plan.airline.detail}
          </div>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the energy goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Device</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per charge</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per day</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Trip total</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((row, index) => (
                  <tr key={`${row.name}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{DEC2.format(row.perChargeWh)} Wh</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {DEC2.format(row.perDayWh)} Wh
                    </td>
                    <td className="py-2 pr-3 text-right">{DEC1.format(row.tripWh)} Wh</td>
                    <td className="py-2 text-right">{pct(row.shareOfTrip)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Airline and airport security rules differ by operator and country —
        check your carrier's dangerous goods page before you fly, and note that power banks must
        always travel in the cabin, never in checked baggage.
      </p>
    </main>
  );
}
