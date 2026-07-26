"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, Plus, RotateCcw, Trash2, Zap } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULT_APPLIANCES = [
  { id: "a1", name: "Air conditioner (1.5 ton)", watts: 1500, hours: 6, qty: 1 },
  { id: "a2", name: "Refrigerator (double door)", watts: 250, hours: 12, qty: 1 },
  { id: "a3", name: "Ceiling fan", watts: 75, hours: 10, qty: 3 },
  { id: "a4", name: "LED lights", watts: 12, hours: 6, qty: 8 },
  { id: "a5", name: "Television (LED 43\")", watts: 90, hours: 5, qty: 1 },
];

const PRESETS = [
  { label: "1 BHK basic", tariff: 7, fixed: 90, days: 30 },
  { label: "2 BHK family", tariff: 8, fixed: 130, days: 30 },
  { label: "Small office", tariff: 9.5, fixed: 250, days: 26 },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const inr2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

let nextId = 100;
const makeId = () => `a${(nextId += 1)}`;

export default function ToolHome() {
  const [appliances, setAppliances] = useState(DEFAULT_APPLIANCES);
  const [tariff, setTariff] = useState("8");
  const [fixedCharge, setFixedCharge] = useState("120");
  const [taxPercent, setTaxPercent] = useState("5");
  const [days, setDays] = useState("30");
  const [copied, setCopied] = useState(false);

  const errors = useMemo(() => {
    const list = [];
    const tariffValue = Number.parseFloat(tariff);
    const daysValue = Number.parseFloat(days);
    const taxValue = Number.parseFloat(taxPercent);
    const fixedValue = Number.parseFloat(fixedCharge);

    if (!Number.isFinite(tariffValue) || tariffValue <= 0) {
      list.push("Enter a per-unit tariff greater than 0.");
    }
    if (!Number.isFinite(daysValue) || daysValue < 1 || daysValue > 31) {
      list.push("Billing days must be between 1 and 31.");
    }
    if (!Number.isFinite(taxValue) || taxValue < 0 || taxValue > 100) {
      list.push("Tax percentage must be between 0 and 100.");
    }
    if (!Number.isFinite(fixedValue) || fixedValue < 0) {
      list.push("Fixed charges cannot be negative.");
    }
    if (appliances.some((item) => toNumber(item.hours) > 24)) {
      list.push("Daily usage hours cannot exceed 24 for any appliance.");
    }
    if (appliances.some((item) => toNumber(item.watts) < 0 || toNumber(item.qty) < 0 || toNumber(item.hours) < 0)) {
      list.push("Wattage, hours and quantity must be zero or more.");
    }
    return list;
  }, [appliances, days, fixedCharge, tariff, taxPercent]);

  const result = useMemo(() => {
    const daysValue = Math.min(Math.max(toNumber(days) || 30, 1), 31);
    const tariffValue = Math.max(toNumber(tariff), 0);
    const fixedValue = Math.max(toNumber(fixedCharge), 0);
    const taxValue = Math.min(Math.max(toNumber(taxPercent), 0), 100);

    const rows = appliances.map((item) => {
      const watts = Math.max(toNumber(item.watts), 0);
      const hours = Math.min(Math.max(toNumber(item.hours), 0), 24);
      const qty = Math.max(toNumber(item.qty), 0);
      const dailyUnits = (watts * qty * hours) / 1000;
      const monthlyUnits = dailyUnits * daysValue;
      return {
        id: item.id,
        name: item.name || "Appliance",
        dailyUnits,
        monthlyUnits,
        cost: monthlyUnits * tariffValue,
      };
    });

    const totalUnits = rows.reduce((sum, row) => sum + row.monthlyUnits, 0);
    const energyCost = totalUnits * tariffValue;
    const subtotal = energyCost + fixedValue;
    const tax = (subtotal * taxValue) / 100;
    const total = subtotal + tax;

    const ranked = [...rows].sort((a, b) => b.monthlyUnits - a.monthlyUnits);

    return {
      rows,
      ranked,
      daysValue,
      totalUnits,
      dailyUnits: totalUnits / daysValue,
      energyCost,
      fixedValue,
      tax,
      total,
      // The billing period is user-set, so ×12 only holds for a 30-day cycle.
      // Annualise energy over 365 days and the fixed charge over 12 cycles.
      yearly:
        ((totalUnits / daysValue) * 365 * tariffValue + fixedValue * 12) *
        (1 + taxValue / 100),
      perDay: total / daysValue,
    };
  }, [appliances, days, fixedCharge, tariff, taxPercent]);

  const updateAppliance = useCallback((id, field, value) => {
    setAppliances((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }, []);

  const removeAppliance = useCallback((id) => {
    setAppliances((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  }, []);

  const addAppliance = useCallback(() => {
    setAppliances((prev) => [
      ...prev,
      { id: makeId(), name: "New appliance", watts: 100, hours: 2, qty: 1 },
    ]);
  }, []);

  const reset = useCallback(() => {
    setAppliances(DEFAULT_APPLIANCES);
    setTariff("8");
    setFixedCharge("120");
    setTaxPercent("5");
    setDays("30");
  }, []);

  const report = useMemo(() => {
    const lines = [
      "Electricity Bill Estimate",
      `Billing period: ${result.daysValue} days`,
      `Tariff: ${inr2.format(toNumber(tariff))} per unit (kWh)`,
      "",
      "Appliance breakdown:",
      ...result.ranked.map(
        (row) =>
          `- ${row.name}: ${num.format(row.monthlyUnits)} units - ${inr.format(row.cost)}`
      ),
      "",
      `Total units: ${num.format(result.totalUnits)} kWh`,
      `Energy charges: ${inr.format(result.energyCost)}`,
      `Fixed charges: ${inr.format(result.fixedValue)}`,
      `Tax/duty: ${inr.format(result.tax)}`,
      `Estimated monthly bill: ${inr.format(result.total)}`,
      `Estimated yearly cost: ${inr.format(result.yearly)}`,
    ];
    return lines.join("\n");
  }, [result, tariff]);

  const copyReport = async () => {
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const primaryButton =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
  const ghostButton =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Home energy
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Electricity Bill Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Add each appliance with its wattage and daily running hours, set your per-unit tariff,
            and see the monthly units and rupee cost — plus which appliance eats the most power.
          </p>
        </header>

        {errors.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Appliances</h2>
              <button type="button" onClick={addAppliance} className={ghostButton}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add appliance
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {appliances.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`name-${item.id}`}
                        className="block text-xs font-semibold text-[var(--muted-foreground)]"
                      >
                        Appliance {index + 1}
                      </label>
                      <input
                        id={`name-${item.id}`}
                        type="text"
                        value={item.name}
                        onChange={(event) => updateAppliance(item.id, "name", event.target.value)}
                        className={`mt-1 ${inputClass}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAppliance(item.id)}
                      disabled={appliances.length <= 1}
                      aria-label={`Remove ${item.name || "appliance"}`}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor={`watts-${item.id}`}
                        className="block text-xs font-semibold text-[var(--muted-foreground)]"
                      >
                        Power (watts)
                      </label>
                      <input
                        id={`watts-${item.id}`}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="decimal"
                        value={item.watts}
                        onChange={(event) => updateAppliance(item.id, "watts", event.target.value)}
                        className={`mt-1 ${inputClass}`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`hours-${item.id}`}
                        className="block text-xs font-semibold text-[var(--muted-foreground)]"
                      >
                        Hours / day
                      </label>
                      <input
                        id={`hours-${item.id}`}
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        inputMode="decimal"
                        value={item.hours}
                        onChange={(event) => updateAppliance(item.id, "hours", event.target.value)}
                        className={`mt-1 ${inputClass}`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`qty-${item.id}`}
                        className="block text-xs font-semibold text-[var(--muted-foreground)]"
                      >
                        Quantity
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={item.qty}
                        onChange={(event) => updateAppliance(item.id, "qty", event.target.value)}
                        className={`mt-1 ${inputClass}`}
                      />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    {num.format(result.rows[index]?.monthlyUnits || 0)} units/month ·{" "}
                    {inr.format(result.rows[index]?.cost || 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Tariff & charges</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="tariff" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    Rate per unit (₹/kWh)
                  </label>
                  <input
                    id="tariff"
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    value={tariff}
                    onChange={(event) => setTariff(event.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="days" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    Billing days
                  </label>
                  <input
                    id="days"
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    inputMode="numeric"
                    value={days}
                    onChange={(event) => setDays(event.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="fixed" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    Fixed charges (₹)
                  </label>
                  <input
                    id="fixed"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={fixedCharge}
                    onChange={(event) => setFixedCharge(event.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="tax" className="block text-xs font-semibold text-[var(--muted-foreground)]">
                    Tax / duty (%)
                  </label>
                  <input
                    id="tax"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    inputMode="decimal"
                    value={taxPercent}
                    onChange={(event) => setTaxPercent(event.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTariff(String(preset.tariff));
                      setFixedCharge(String(preset.fixed));
                      setDays(String(preset.days));
                    }}
                    className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Estimated monthly bill
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {inr.format(result.total)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {num.format(result.totalUnits)} units over {result.daysValue} days
              </p>

              <dl className="mt-4 grid gap-2 text-sm">
                {[
                  ["Energy charges", inr.format(result.energyCost)],
                  ["Fixed charges", inr.format(result.fixedValue)],
                  [`Tax / duty (${num.format(toNumber(taxPercent))}%)`, inr.format(result.tax)],
                  ["Average per day", inr.format(result.perDay)],
                  ["Units per day", `${num.format(result.dailyUnits)} kWh`],
                  ["Estimated per year", inr.format(result.yearly)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-0 last:pb-0"
                  >
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy electricity bill estimate"
                  className={primaryButton}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset calculator" className={ghostButton}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Biggest power users</h2>
              <ul className="mt-3 grid gap-3">
                {result.ranked.slice(0, 5).map((row) => {
                  const share = result.totalUnits > 0 ? (row.monthlyUnits / result.totalUnits) * 100 : 0;
                  return (
                    <li key={row.id}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">{row.name}</span>
                        <span className="shrink-0 font-semibold">{num.format(share)}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className="h-full rounded-full bg-[var(--primary)]"
                          style={{ width: `${Math.min(share, 100)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Units (kWh) = watts × quantity × hours per day × days ÷ 1000. Slab-based tariffs vary
                by state, so use your latest bill&rsquo;s average rate for the closest estimate.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
