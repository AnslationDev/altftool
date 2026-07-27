"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wrench } from "lucide-react";

import { UNITS, convertTorque, unitById } from "../lib";

const DASH = "—";
const fmt = (value, dp) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: dp }).format(
        value,
      )
    : DASH;
const N1 = (v) => fmt(v, 1);
const N2 = (v) => fmt(v, 2);
const N3 = (v) => fmt(v, 3);

const DEFAULTS = { value: "100", unit: "nm", wrench: "450", extension: "0" };

const HIGHLIGHT = ["nm", "lbfft", "lbfin", "kgfm"];

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
      convertTorque({
        value: toNum(form.value),
        fromUnit: form.unit,
        wrenchLengthMm: toNum(form.wrench),
        extensionMm: form.extension.trim() === "" ? 0 : toNum(form.extension),
      }),
    [form],
  );

  const ok = !result.error;
  const from = unitById(form.unit);
  const ext = ok ? result.extension : null;

  const summary = ok
    ? [
        "Nm to Ftlb Converter",
        `Input: ${form.value} ${from?.short ?? ""}`,
        `Newton metres: ${N2(result.byUnit.nm)} N-m`,
        `Foot-pounds: ${N2(result.byUnit.lbfft)} lbf-ft`,
        `Inch-pounds: ${N1(result.byUnit.lbfin)} lbf-in`,
        `Kilogram-force metres: ${N3(result.byUnit.kgfm)} kgf-m`,
        ext && ext.applies
          ? `With a ${form.extension} mm in-line extension on a ${form.wrench} mm wrench, set the wrench to ${N2(ext.settingNm)} N-m (${N2(ext.settingLbfFt)} lbf-ft)`
          : null,
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Torque
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Nm to Ftlb Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a torque spec between newton metres, foot-pounds, inch-pounds and kgf-m — and
          correct the wrench setting when an in-line extension is fitted.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="t-value">
              Torque figure
            </label>
            <input
              id="t-value"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.value}
              onChange={set("value")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="t-unit">
              Unit
            </label>
            <select id="t-unit" className={INPUT} value={form.unit} onChange={set("unit")}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="t-wrench">
              Wrench effective length (mm)
            </label>
            <input
              id="t-wrench"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="3000"
              step="10"
              value={form.wrench}
              onChange={set("wrench")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="t-ext">
              In-line extension / crowfoot (mm)
            </label>
            <input
              id="t-ext"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="1000"
              step="5"
              value={form.extension}
              onChange={set("extension")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "Wheel nut 110 N-m", value: "110", unit: "nm" },
            { label: "Spark plug 25 N-m", value: "25", unit: "nm" },
            { label: "80 lbf-ft", value: "80", unit: "lbfft" },
            { label: "10 kgf-m", value: "10", unit: "kgfm" },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP}
              onClick={() => setForm((prev) => ({ ...prev, value: preset.value, unit: preset.unit }))}
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
              In foot-pounds
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${N2(result.byUnit.lbfft)} lbf-ft` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Same torque is ${N2(result.byUnit.nm)} N-m, ${N1(result.byUnit.lbfin)} lbf-in or ${N3(result.byUnit.kgfm)} kgf-m`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the torque conversion result"
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
        <h2 className="text-base font-semibold">Extension correction</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          An adapter that moves the socket further from the handle multiplies the torque you apply.
          Dial the wrench down to the setting below. A plain extension bar at 90° to the handle
          needs no correction.
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Target torque at the fastener", ok ? `${N2(result.nm)} N-m` : DASH],
            [
              "Set the wrench to",
              ext ? `${N2(ext.settingNm)} N-m (${N2(ext.settingLbfFt)} lbf-ft)` : DASH,
            ],
            [
              "Reduction from the target",
              ext ? `${N2(ext.reductionNm)} N-m (${N1(ext.reductionPct)}%)` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {ext && !ext.applies ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            No extension entered, so the setting equals the target.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">N-m to lbf-ft quick table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  N-m
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  lbf-ft
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  lbf-in
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  kgf-m
                </th>
              </tr>
            </thead>
            <tbody>
              {[5, 10, 25, 50, 80, 110, 150, 200].map((value) => {
                const row = convertTorque({ value, fromUnit: "nm" });
                return (
                  <tr key={value} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{value}</td>
                    <td className="py-2 pr-3 text-right">{N2(row.byUnit.lbfft)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {N1(row.byUnit.lbfin)}
                    </td>
                    <td className="py-2 text-right">{N3(row.byUnit.kgfm)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Always tighten to the figure in the vehicle or equipment manual, in the sequence and
        condition it specifies — dry, oiled and thread-locked fasteners take different torques for
        the same clamp load.
      </p>
    </main>
  );
}
