"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plug, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_HOME,
  DEVICE_PRESETS,
  ONE_WATT_TARGET,
  computeStandbyCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const num0 = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const presetById = Object.fromEntries(DEVICE_PRESETS.map((preset) => [preset.id, preset]));

const buildDefaultRows = () =>
  DEFAULT_HOME.map((item, index) => {
    const preset = presetById[item.presetId];
    return {
      key: index + 1,
      presetId: item.presetId,
      label: preset.label,
      watts: String(preset.watts),
      quantity: String(item.quantity),
      hoursPerDay: String(preset.hoursPerDay),
    };
  });

export default function ToolHome() {
  const [rows, setRows] = useState(buildDefaultRows);
  const [tariffPerKwh, setTariffPerKwh] = useState("8");
  const [copied, setCopied] = useState(false);

  const devices = useMemo(
    () =>
      rows.map((row) => ({
        key: row.key,
        label: row.label,
        watts: toNumber(row.watts),
        quantity: toNumber(row.quantity),
        hoursPerDay: toNumber(row.hoursPerDay),
      })),
    [rows],
  );

  const result = useMemo(
    () => computeStandbyCost({ devices, tariffPerKwh: toNumber(tariffPerKwh) }),
    [devices, tariffPerKwh],
  );
  const hasError = Boolean(result.error);

  const updateRow = (key, patch) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key) => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const addRow = (presetId) => {
    const preset = presetById[presetId];
    if (!preset) return;
    setRows((current) => {
      const nextKey = current.reduce((max, row) => Math.max(max, row.key), 0) + 1;
      return [
        ...current,
        {
          key: nextKey,
          presetId: preset.id,
          label: preset.label,
          watts: String(preset.watts),
          quantity: "1",
          hoursPerDay: String(preset.hoursPerDay),
        },
      ];
    });
  };

  const changePreset = (key, presetId) => {
    const preset = presetById[presetId];
    if (!preset) return;
    updateRow(key, {
      presetId: preset.id,
      label: preset.label,
      watts: String(preset.watts),
      hoursPerDay: String(preset.hoursPerDay),
    });
  };

  const reset = () => {
    setRows(buildDefaultRows());
    setTariffPerKwh("8");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Standby Power Cost",
      `Always-on load: ${num(result.continuousWatts)} W average`,
      `Electricity wasted: ${num(result.annualKwh)} kWh a year`,
      `Cost: ${money(result.monthlyCost)} a month, ${money(result.annualCost)} a year`,
      `Over ten years: ${money(result.tenYearCost)}`,
      "",
      "Worst offenders:",
    ];
    for (const row of result.ranked.slice(0, 5)) {
      lines.push(`  ${row.label} — ${num(row.annualKwh)} kWh, ${money(row.annualCost)} a year`);
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

  const breakdown = hasError
    ? []
    : [
        ["Devices counted", num0(result.deviceCount)],
        ["Average always-on load", `${num(result.continuousWatts)} W`],
        ["Electricity wasted per day", `${num(result.dailyKwh)} kWh`],
        ["Electricity wasted per month", `${num(result.monthlyKwh)} kWh`],
        ["Electricity wasted per year", `${num(result.annualKwh)} kWh`],
        ["Cost per month", money(result.monthlyCost)],
        ["Cost per year", money(result.annualCost)],
        ["Cost over ten years", money(result.tenYearCost)],
        ["From devices above 1 W", `${num(result.avoidableKwh)} kWh · ${money(result.avoidableCost)} a year`],
        ["Grid CO₂ behind it", `${num0(result.annualCo2Kg)} kg a year`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plug className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Standby Power Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The devices quietly drawing power while you are not using them, ranked by what they cost —
          usually not the ones people bother to unplug.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="sp-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariffPerKwh}
              onChange={(event) => setTariffPerKwh(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-add">
              Add a device
            </label>
            <select
              id="sp-add"
              className={`mt-2 ${INPUT_CLASS}`}
              value=""
              onChange={(event) => {
                addRow(event.target.value);
                event.target.value = "";
              }}
            >
              <option value="">Choose a device to add…</option>
              {DEVICE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} · {preset.watts} W
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {rows.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">
              No devices yet — add one from the list above.
            </p>
          )}
          {rows.map((row, index) => (
            <div key={row.key} className="rounded-md border border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <label className={LABEL_CLASS} htmlFor={`sp-device-${row.key}`}>
                    Device {index + 1}
                  </label>
                  <select
                    id={`sp-device-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.presetId}
                    onChange={(event) => changePreset(row.key, event.target.value)}
                  >
                    {DEVICE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  aria-label={`Remove ${row.label}`}
                  className="mt-7 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-watts-${row.key}`}>
                    Standby watts
                  </label>
                  <input
                    id={`sp-watts-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={row.watts}
                    onChange={(event) => updateRow(row.key, { watts: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-qty-${row.key}`}>
                    How many
                  </label>
                  <input
                    id={`sp-qty-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-hours-${row.key}`}>
                    Idle hours a day
                  </label>
                  <input
                    id={`sp-hours-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="1"
                    value={row.hoursPerDay}
                    onChange={(event) => updateRow(row.key, { hoursPerDay: event.target.value })}
                  />
                </div>
              </div>
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
              Wasted every year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : money(result.annualCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${num(result.annualKwh)} units a year · ${num(result.continuousWatts)} W left running`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy standby power cost result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the device list" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">—</dd>
            </div>
          ) : (
            breakdown.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))
          )}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Ranked by what it costs</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Switching off the top one or two lines does most of the work.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Device</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">W</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">kWh/yr</th>
                  <th scope="col" className="py-2 text-right font-semibold">₹/yr</th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.label}
                      {row.quantity > 1 ? ` ×${num0(row.quantity)}` : ""}
                      {row.watts > ONE_WATT_TARGET && (
                        <span className="ml-2 text-xs font-semibold text-[var(--danger)]">above 1 W</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{num(row.watts)}</td>
                    <td className="py-2 pr-3 text-right">{num(row.annualKwh)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.annualCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Preset wattages are typical measured values, not your specific units — a plug-in energy meter
        costing a few hundred rupees will tell you exactly. Do not switch off a device at the socket
        if it needs power to hold settings, run a defrost cycle, or stay reachable in an emergency.
      </p>
    </main>
  );
}
