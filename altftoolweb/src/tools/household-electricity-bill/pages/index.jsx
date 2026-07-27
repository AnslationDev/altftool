"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plug, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  APPLIANCE_PRESETS,
  STATE_TARIFFS,
  calculateElectricityBill,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const units = (value) => (Number.isFinite(value) ? `${NUM.format(value)} kWh` : DASH);

const DEFAULT_ROWS = [
  { id: 1, presetId: "ac-15-split", name: "Split AC 1.5 ton (5 star)", watts: "1200", hours: "6", quantity: "1" },
  { id: 2, presetId: "fridge-double", name: "Refrigerator, double door", watts: "250", hours: "8", quantity: "1" },
  { id: 3, presetId: "ceiling-fan", name: "Ceiling fan", watts: "75", hours: "12", quantity: "3" },
  { id: 4, presetId: "led-bulb", name: "LED bulb 9 W", watts: "9", hours: "6", quantity: "8" },
];

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(DEFAULT_ROWS.length + 1);
  const [tariffMode, setTariffMode] = useState("slab");
  const [stateId, setStateId] = useState("delhi");
  const [flatRate, setFlatRate] = useState("7.5");
  const [billingDays, setBillingDays] = useState("30");
  const [includeTax, setIncludeTax] = useState(true);
  const [copied, setCopied] = useState(false);

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const applyPreset = (id, presetId) => {
    const preset = APPLIANCE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    updateRow(id, {
      presetId,
      name: preset.label,
      watts: String(preset.watts),
      hours: String(preset.hours),
    });
  };

  const addRow = () => {
    const preset = APPLIANCE_PRESETS[0];
    setRows((current) => [
      ...current,
      {
        id: nextId,
        presetId: preset.id,
        name: preset.label,
        watts: String(preset.watts),
        hours: String(preset.hours),
        quantity: "1",
      },
    ]);
    setNextId((value) => value + 1);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const result = useMemo(
    () =>
      calculateElectricityBill({
        appliances: rows.map((row) => ({
          name: row.name,
          watts: toNumber(row.watts),
          hours: toNumber(row.hours),
          quantity: toNumber(row.quantity),
        })),
        tariffMode,
        stateId,
        flatRate: toNumber(flatRate),
        includeTax,
        billingDays: toNumber(billingDays),
      }),
    [rows, tariffMode, stateId, flatRate, includeTax, billingDays],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Household electricity bill estimate",
      `Tariff: ${result.stateName}${tariffMode === "slab" ? " slab tariff" : ""}`,
      `Billing period: ${result.billingDays} days`,
      `Units consumed: ${result.periodUnits} kWh`,
      `Energy charge: ${money2(result.energyCharge)}`,
      `Fixed charge: ${money2(result.fixedCharge)}`,
      `Electricity duty (${result.taxPercent}%): ${money2(result.taxAmount)}`,
      `Estimated bill: ${money2(result.totalCost)}`,
      `Effective rate: ${money2(result.effectiveRate)} per unit`,
      result.biggestConsumer
        ? `Biggest consumer: ${result.biggestConsumer.name} (${result.biggestConsumer.sharePercent}% of units)`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, tariffMode]);

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
    setNextId(DEFAULT_ROWS.length + 1);
    setTariffMode("slab");
    setStateId("delhi");
    setFlatRate("7.5");
    setBillingDays("30");
    setIncludeTax(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Plug className="h-4 w-4" aria-hidden="true" />
          Electricity bill
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Household Electricity Bill Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List what you run and for how long. Units are computed as watts x quantity x hours / 1000
          and priced through your state&apos;s telescopic domestic slabs, plus fixed charge and duty.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Appliances</h2>
        <div className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`preset-${row.id}`}>
                    Appliance {index + 1}
                  </label>
                  <select
                    id={`preset-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.presetId}
                    onChange={(event) => applyPreset(row.id, event.target.value)}
                  >
                    {APPLIANCE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`watts-${row.id}`}>
                    Power rating (watts)
                  </label>
                  <input
                    id={`watts-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="1"
                    value={row.watts}
                    onChange={(event) => updateRow(row.id, { watts: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qty-${row.id}`}>
                    How many
                  </label>
                  <input
                    id={`qty-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.id, { quantity: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hours-${row.id}`}>
                    Hours used per day
                  </label>
                  <input
                    id={`hours-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="0.25"
                    value={row.hours}
                    onChange={(event) => updateRow(row.id, { hours: event.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className={`${GHOST_BTN} w-full`}
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    aria-label={`Remove ${row.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className={`${PRIMARY_BTN} mt-4`} onClick={addRow}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add appliance
        </button>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Tariff</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tariff-mode">
              Pricing method
            </label>
            <select
              id="tariff-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tariffMode}
              onChange={(event) => setTariffMode(event.target.value)}
            >
              <option value="slab">State slab tariff</option>
              <option value="flat">Flat rate from my bill</option>
            </select>
          </div>
          {tariffMode === "slab" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="state-id">
                State
              </label>
              <select
                id="state-id"
                className={`mt-2 ${INPUT_CLASS}`}
                value={stateId}
                onChange={(event) => setStateId(event.target.value)}
              >
                {STATE_TARIFFS.map((tariff) => (
                  <option key={tariff.id} value={tariff.id}>
                    {tariff.state}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="flat-rate">
                Rate per unit (INR / kWh)
              </label>
              <input
                id="flat-rate"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={flatRate}
                onChange={(event) => setFlatRate(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="billing-days">
              Days in the billing cycle
            </label>
            <input
              id="billing-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="62"
              step="1"
              value={billingDays}
              onChange={(event) => setBillingDays(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="include-tax"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id="include-tax"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={includeTax}
                onChange={(event) => setIncludeTax(event.target.checked)}
              />
              Add electricity duty / tax
            </label>
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated bill for the period
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${units(result.periodUnits)} over ${result.billingDays} days on the ${result.stateName} tariff`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy electricity bill estimate to clipboard"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Units per day", hasError ? DASH : units(result.dailyUnits)],
            ["Units in the billing period", hasError ? DASH : units(result.periodUnits)],
            ["Units per year", hasError ? DASH : units(result.yearlyUnits)],
            ["Energy charge", hasError ? DASH : money2(result.energyCharge)],
            ["Fixed / meter charge", hasError ? DASH : money2(result.fixedCharge)],
            [
              hasError ? "Electricity duty" : `Electricity duty (${result.taxPercent}%)`,
              hasError ? DASH : money2(result.taxAmount),
            ],
            ["Effective cost per unit", hasError ? DASH : money2(result.effectiveRate)],
            ["Cost per day", hasError ? DASH : money2(result.dailyCost)],
            ["Cost per year", hasError ? DASH : money(result.yearlyCost)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.breakdown.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where the units go</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Cost is apportioned at the effective rate, so fixed charge and duty are shared across
            appliances in proportion to the units they use.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Appliance
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Units
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Share
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((item, index) => (
                  <tr
                    key={`${item.name}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {item.name}
                      {item.quantity > 1 ? ` x${item.quantity}` : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(item.periodUnits)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(item.sharePercent)}%
                    </td>
                    <td className="py-2 text-right">{money(item.periodCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && result.slabRows.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Slab-by-slab energy charge</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Slab
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Rate
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Units
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Charge
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.slabRows.map((row) => (
                  <tr key={`${row.from}-${row.rate}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.to === null ? `Above ${row.from}` : `${row.from + 1}–${row.to}`} units
                    </td>
                    <td className="py-2 pr-3 text-right">{money2(row.rate)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(row.units)}
                    </td>
                    <td className="py-2 text-right">{money2(row.charge)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Slab rates, fixed charges and duty percentages are indicative domestic LT-1 figures and are
        revised by each state regulator every financial year. For an exact match, switch to flat
        rate and enter the cost per unit printed on your own bill.
      </p>
    </main>
  );
}
