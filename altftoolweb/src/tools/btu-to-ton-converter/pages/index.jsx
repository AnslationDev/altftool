"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Snowflake } from "lucide-react";

import { AC_SIZES, UNITS, convertCooling, unitById } from "../lib";

const DASH = "—";
const fmt = (value, dp) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: dp }).format(
        value,
      )
    : DASH;
const N0 = (v) => fmt(v, 0);
const N2 = (v) => fmt(v, 2);
const N3 = (v) => fmt(v, 3);

const DEFAULTS = { value: "18000", unit: "btuh", cop: "3.5" };

const HIGHLIGHT = ["ton", "btuh", "kw"];

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      convertCooling({
        value: toNum(form.value),
        fromUnit: form.unit,
        cop: toNum(form.cop),
      }),
    [form],
  );

  const ok = !result.error;
  const from = unitById(form.unit);

  const summary = ok
    ? [
        "BTU to Ton Converter",
        `Input: ${form.value} ${from?.short ?? ""}`,
        `Tons of refrigeration: ${N3(result.byUnit.ton)} TR`,
        `BTU per hour: ${N0(result.byUnit.btuh)} BTU/h`,
        `Kilowatts of cooling: ${N3(result.byUnit.kw)} kW`,
        `Kilocalories per hour: ${N0(result.byUnit.kcalh)} kcal/h`,
        `At COP ${form.cop} (EER ${N2(result.eer)}): about ${N0(result.inputWatts)} W drawn from the socket`,
      ].join("\n")
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Snowflake className="h-4 w-4" aria-hidden="true" />
          Cooling capacity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">BTU to Ton Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One ton of refrigeration is 12,000 BTU/h, or 3,516.85 W. Convert a datasheet capacity into
          any of the units used for air conditioners and chillers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="c-value">
              Cooling capacity
            </label>
            <input
              id="c-value"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.value}
              onChange={set("value")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="c-unit">
              Unit
            </label>
            <select id="c-unit" className={INPUT} value={form.unit} onChange={set("unit")}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="c-cop">
              COP (cooling watts per watt of input)
            </label>
            <input
              id="c-cop"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.1"
              value={form.cop}
              onChange={set("cop")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {AC_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={CHIP}
              onClick={() => setForm((prev) => ({ ...prev, value: String(size), unit: "ton" }))}
            >
              {size} TR
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
              In tons of refrigeration
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${N3(result.byUnit.ton)} TR` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${N0(result.byUnit.btuh)} BTU/h — closest standard split AC size is ${result.nearestAcSize} TR`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the cooling capacity conversion result"
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
          {UNITS.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt
                className={
                  HIGHLIGHT.includes(u.id)
                    ? "font-semibold text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]"
                }
              >
                {u.label}
              </dt>
              <dd className="text-right font-semibold">
                {ok ? `${fmt(result.byUnit[u.id], u.dp)} ${u.short}` : DASH}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Electrical input at this COP</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Cooling capacity is heat moved, not electricity used. Input power is capacity divided by
          COP.
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["COP entered", ok ? N2(result.cop) : DASH],
            ["Equivalent EER (BTU/h per W)", ok ? N2(result.eer) : DASH],
            ["Electrical input", ok ? `${N0(result.inputWatts)} W (${N3(result.inputKw)} kW)` : DASH],
            ["Units used per hour of running", ok ? `${N3(result.unitsPerHour)} kWh` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Standard AC sizes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tons
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  BTU/h
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  kW
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  kcal/h
                </th>
              </tr>
            </thead>
            <tbody>
              {AC_SIZES.map((size) => {
                const row = convertCooling({ value: size, fromUnit: "ton" });
                return (
                  <tr key={size} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{size}</td>
                    <td className="py-2 pr-3 text-right">{N0(row.byUnit.btuh)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {N3(row.byUnit.kw)}
                    </td>
                    <td className="py-2 text-right">{N0(row.byUnit.kcalh)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nominal ratings are measured at standard test conditions. Real capacity falls as the outdoor
        temperature rises, so size a system from a proper heat-load calculation rather than from the
        nameplate alone.
      </p>
    </main>
  );
}
