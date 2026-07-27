"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HousePlug, RotateCcw, Trash2 } from "lucide-react";
import {
  CURRENCIES,
  DEVICE_LIBRARY,
  STANDBY_BENCHMARK_WATTS,
  computePowerBudget,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const fromLibrary = (id, key) => {
  const device = DEVICE_LIBRARY.find((entry) => entry.id === id);
  return {
    key,
    label: device.label,
    qty: "1",
    standbyWatts: String(device.standbyWatts),
    activeWatts: String(device.activeWatts),
    hours: String(device.hours),
  };
};

const DEFAULT_ROWS = [
  { ...fromLibrary("router", 1) },
  { ...fromLibrary("speaker-small", 2), qty: "2" },
  { ...fromLibrary("bulb", 3), qty: "8" },
  { ...fromLibrary("cam-indoor", 4), qty: "2" },
  { ...fromLibrary("tv", 5) },
];

const DEFAULTS = { tariff: "8", currency: "INR" };

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextKey, setNextKey] = useState(DEFAULT_ROWS.length + 1);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [copied, setCopied] = useState(false);

  const currencyMeta = CURRENCIES.find((entry) => entry.code === currency) ?? CURRENCIES[0];
  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(currencyMeta.locale, {
      style: "currency",
      currency: currencyMeta.code,
      maximumFractionDigits: 0,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currencyMeta]);

  const result = useMemo(
    () =>
      computePowerBudget({
        tariff: toNumber(tariff),
        devices: rows.map((row) => ({
          label: row.label,
          qty: toNumber(row.qty),
          standbyWatts: toNumber(row.standbyWatts),
          activeWatts: toNumber(row.activeWatts),
          hours: toNumber(row.hours),
        })),
      }),
    [rows, tariff],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Smart Home Power Budget",
      `${result.totalDevices} mains-powered devices`,
      `Daily: ${NUM2.format(result.dailyKwh)} kWh · ${money(result.dailyCost)}`,
      `Monthly: ${NUM1.format(result.monthlyKwh)} kWh · ${money(result.monthlyCost)}`,
      `Yearly: ${NUM.format(result.yearlyKwh)} kWh · ${money(result.yearlyCost)}`,
      `Always-on standby load: ${NUM1.format(result.alwaysOnWatts)} W`,
      `Standby share of consumption: ${NUM1.format(result.standbySharePct)}%`,
      `Standby alone costs ${money(result.standbyYearlyCost)} a year`,
      "Biggest consumers:",
      ...result.byImpact
        .slice(0, 3)
        .map((row) => `- ${row.label} x${row.qty}: ${NUM1.format(row.dailyWh)} Wh/day`),
    ].join("\n");
  }, [ok, result, money, tariff]);

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
    setRows(DEFAULT_ROWS);
    setNextKey(DEFAULT_ROWS.length + 1);
    setTariff(DEFAULTS.tariff);
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  const addDevice = (id) => {
    setRows((current) => [...current, fromLibrary(id, nextKey)]);
    setNextKey((value) => value + 1);
  };

  const updateRow = (key, field, value) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  };

  const removeRow = (key) => setRows((current) => current.filter((row) => row.key !== key));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HousePlug className="h-4 w-4" aria-hidden="true" />
          Home electrical
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Smart Home Power Budget</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every hub, bulb, camera and speaker draws power around the clock, not only while you use
          it. List yours and see the daily kWh, the running cost and how much of it is pure standby.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shp-tariff">
              Electricity tariff (per kWh)
            </label>
            <input
              id="shp-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shp-currency">
              Currency
            </label>
            <select
              id="shp-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.label} ({entry.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Add a device</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEVICE_LIBRARY.map((device) => (
              <button
                key={device.id}
                type="button"
                onClick={() => addDevice(device.id)}
                className={CHIP_BTN}
              >
                + {device.label}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your devices</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Nothing listed yet — tap a device above.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {rows.map((row) => (
              <li
                key={row.key}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{row.label}</p>
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    aria-label={`Remove ${row.label}`}
                    className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`shp-qty-${row.key}`}>
                      How many
                    </label>
                    <input
                      id={`shp-qty-${row.key}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={row.qty}
                      onChange={(event) => updateRow(row.key, "qty", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`shp-hours-${row.key}`}>
                      Active hours per day
                    </label>
                    <input
                      id={`shp-hours-${row.key}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="24"
                      step="0.5"
                      value={row.hours}
                      onChange={(event) => updateRow(row.key, "hours", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`shp-standby-${row.key}`}>
                      Standby watts
                    </label>
                    <input
                      id={`shp-standby-${row.key}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.1"
                      value={row.standbyWatts}
                      onChange={(event) => updateRow(row.key, "standbyWatts", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`shp-active-${row.key}`}>
                      Active watts
                    </label>
                    <input
                      id={`shp-active-${row.key}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.5"
                      value={row.activeWatts}
                      onChange={(event) => updateRow(row.key, "activeWatts", event.target.value)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
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
              Monthly electricity cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.monthlyCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM1.format(result.monthlyKwh)} kWh a month across ${result.totalDevices} devices`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy smart home power budget"
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
            ["Energy per day", ok ? `${NUM2.format(result.dailyKwh)} kWh · ${money(result.dailyCost)}` : DASH],
            ["Energy per year", ok ? `${NUM.format(result.yearlyKwh)} kWh · ${money(result.yearlyCost)}` : DASH],
            ["Average continuous draw", ok ? `${NUM1.format(result.averageWatts)} W` : DASH],
            ["Always-on standby load", ok ? `${NUM1.format(result.alwaysOnWatts)} W` : DASH],
            ["Standby share of all consumption", ok ? `${NUM1.format(result.standbySharePct)}%` : DASH],
            [
              "Standby alone, per year",
              ok ? `${NUM1.format(result.standbyYearlyKwh)} kWh · ${money(result.standbyYearlyCost)}` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Standby is ${NUM1.format(result.standbySharePct)} percent of consumption`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.activeSharePct))}%` }}
              />
              <span
                className="block h-full bg-[var(--warning)]"
                style={{ width: `${Math.max(0, Math.min(100, result.standbySharePct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Active use {NUM1.format(result.activeSharePct)}% · Standby{" "}
              {NUM1.format(result.standbySharePct)}%
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where the energy goes</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Rows marked above benchmark idle at more than the {STANDBY_BENCHMARK_WATTS} W standby cap
          in EU Ecodesign Regulation 1275/2008 — normal for networked devices, but worth grouping
          onto one switchable strip.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Device</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Wh/day</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">of which standby</th>
                <th scope="col" className="py-2 text-right font-semibold">Cost/month</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.byImpact.map((row, index) => (
                  <tr
                    key={`${row.label}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {row.label}
                      {row.aboveBenchmark ? (
                        <span className="ml-2 rounded bg-[var(--warning-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--warning-text)]">
                          above benchmark
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.qty}</td>
                    <td className="py-2 pr-3 text-right">{NUM1.format(row.dailyWh)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(row.standbyWh)}
                    </td>
                    <td className="py-2 text-right">{money(row.monthlyCost)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3" colSpan={5}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. The preset watt figures are typical measured values, not your exact model —
        a plug-in energy meter will give you the real numbers in a few minutes per device.
      </p>
    </main>
  );
}
