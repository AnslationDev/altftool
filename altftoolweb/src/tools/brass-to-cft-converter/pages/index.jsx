"use client";

import { useMemo, useState } from "react";
import { Boxes, Check, Copy, RotateCcw } from "lucide-react";

import {
  MATERIALS,
  TRUCK_PRESETS,
  UNITS,
  convertBrass,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const N3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? N2.format(v) : DASH);
const n3 = (v) => (Number.isFinite(v) ? N3.format(v) : DASH);

const DEFAULTS = {
  value: "1",
  unit: "brass",
  material: "river-sand",
  density: "1600",
  truck: "3",
  rate: "",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const pickMaterial = (event) => {
    const id = event.target.value;
    const match = MATERIALS.find((m) => m.id === id);
    setForm((prev) => ({
      ...prev,
      material: id,
      density: match ? String(match.density) : prev.density,
    }));
  };

  const result = useMemo(
    () =>
      convertBrass({
        value: toNum(form.value),
        unit: form.unit,
        densityKgPerM3: toNum(form.density),
        truckBrass: toNum(form.truck),
        ratePerBrass: form.rate.trim() === "" ? 0 : toNum(form.rate),
      }),
    [form],
  );

  const ok = !result.error;
  const unitLabel = UNITS.find((u) => u.id === form.unit)?.label ?? "";
  const materialLabel = MATERIALS.find((m) => m.id === form.material)?.label ?? "Custom material";

  const summary = ok
    ? [
        "Brass to CFT Converter",
        `Input: ${form.value} ${unitLabel} of ${materialLabel}`,
        `Bulk density: ${N0.format(result.density)} kg/m3`,
        `Brass: ${n3(result.brass)}`,
        `Cubic feet: ${n2(result.cft)} cft`,
        `Cubic metres: ${n3(result.cubicMetres)} m3`,
        `Weight: ${n2(result.tonnes)} tonnes (${N0.format(result.kg)} kg)`,
        `Truckloads at ${form.truck} brass a trip: ${n2(result.truckloads)} (order ${result.trucksToOrder})`,
        result.cost > 0 ? `Material cost: ${money(result.cost)}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = ok
    ? [
        ["Brass", n3(result.brass)],
        ["Cubic feet (cft)", `${n2(result.cft)} cft`],
        ["Cubic metres", `${n3(result.cubicMetres)} m3`],
        ["Weight", `${n2(result.tonnes)} t`],
        ["Weight in kg", `${N0.format(result.kg)} kg`],
        ["Tonnes in one brass", `${n2(result.tonnesPerBrass)} t`],
        ["Truckloads needed", `${n2(result.truckloads)} trips`],
        ["Trips to order (rounded up)", `${N0.format(result.trucksToOrder)}`],
        ["Material cost", result.cost > 0 ? money(result.cost) : DASH],
      ]
    : [
        ["Brass", DASH],
        ["Cubic feet (cft)", DASH],
        ["Cubic metres", DASH],
        ["Weight", DASH],
        ["Truckloads needed", DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Boxes className="h-4 w-4" aria-hidden="true" />
          Site measurement
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Brass to CFT Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One brass is 100 cubic feet of loose material. Enter a quantity in brass, cft, cubic
          metres or tonnes and see the other three, plus how many truck trips it takes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="brass-value">
              Quantity
            </label>
            <input
              id="brass-value"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.value}
              onChange={set("value")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="brass-unit">
              Unit of that quantity
            </label>
            <select id="brass-unit" className={INPUT} value={form.unit} onChange={set("unit")}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="brass-material">
              Material
            </label>
            <select
              id="brass-material"
              className={INPUT}
              value={form.material}
              onChange={pickMaterial}
            >
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="brass-density">
              Loose bulk density (kg/m3)
            </label>
            <input
              id="brass-density"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="500"
              max="3000"
              step="10"
              value={form.density}
              onChange={set("density")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="brass-truck">
              Truck capacity (brass per trip)
            </label>
            <input
              id="brass-truck"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="20"
              step="0.5"
              value={form.truck}
              onChange={set("truck")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="brass-rate">
              Delivered rate per brass (optional)
            </label>
            <input
              id="brass-rate"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              placeholder="e.g. 5000"
              value={form.rate}
              onChange={set("rate")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TRUCK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={String(preset.brass) === form.truck ? CHIP_ON : CHIP}
              onClick={() => setForm((prev) => ({ ...prev, truck: String(preset.brass) }))}
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
              In cubic feet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n2(result.cft)} cft` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n3(result.brass)} brass of ${materialLabel.toLowerCase()} — about ${n2(result.tonnes)} tonnes`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the brass conversion result"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Brass conversion table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Brass
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  cft
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  m3
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Tonnes
                </th>
              </tr>
            </thead>
            <tbody>
              {[0.5, 1, 2, 3, 5, 10].map((b) => {
                const row = convertBrass({
                  value: b,
                  unit: "brass",
                  densityKgPerM3: toNum(form.density),
                  truckBrass: 1,
                });
                return (
                  <tr key={b} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{n2(b)}</td>
                    <td className="py-2 pr-3 text-right">{row.error ? DASH : n2(row.cft)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.error ? DASH : n3(row.cubicMetres)}
                    </td>
                    <td className="py-2 text-right">{row.error ? DASH : n2(row.tonnes)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Volume conversions are exact; weights depend on the bulk density you enter. Damp sand bulks
        up and can measure 15-25% more volume for the same weight, so agree in writing whether a
        load is billed by brass, by cft or by weighbridge slip.
      </p>
    </main>
  );
}
