"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { UNITS, convertPressure, unitById } from "../lib";

const DASH = "—";
const fmt = (value, dp) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: dp,
      }).format(value)
    : DASH;

const N1 = (v) => fmt(v, 1);
const N2 = (v) => fmt(v, 2);
const N3 = (v) => fmt(v, 3);

const DEFAULTS = { value: "32", unit: "psi", fromC: "25", toC: "45" };

const HIGHLIGHT = ["psi", "bar", "kpa", "kgf"];

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
      convertPressure({
        value: toNum(form.value),
        fromUnit: form.unit,
        fromC: toNum(form.fromC),
        toC: toNum(form.toC),
      }),
    [form],
  );

  const ok = !result.error;
  const from = unitById(form.unit);
  const projected = ok ? result.projected : null;

  const summary = ok
    ? [
        "PSI to Bar Converter",
        `Reading: ${form.value} ${from?.short ?? ""}`,
        `psi: ${N2(result.byUnit.psi)}`,
        `bar: ${N3(result.byUnit.bar)}`,
        `kPa: ${N1(result.byUnit.kpa)}`,
        `kgf/cm2: ${N3(result.byUnit.kgf)}`,
        `atm: ${N3(result.byUnit.atm)}`,
        projected
          ? `At ${form.toC} C instead of ${form.fromC} C: ${N2(projected.psi)} psi (${N3(projected.bar)} bar), a change of ${N2(projected.deltaPsi)} psi`
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
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Pressure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">PSI to Bar Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a tyre or system pressure between psi, bar, kPa, kgf/cm2 and atm — and see what
          the same tyre would read once it warms up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="p-value">
              Pressure reading
            </label>
            <input
              id="p-value"
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
            <label className={LABEL} htmlFor="p-unit">
              Unit
            </label>
            <select id="p-unit" className={INPUT} value={form.unit} onChange={set("unit")}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="p-fromc">
              Temperature when measured (°C)
            </label>
            <input
              id="p-fromc"
              className={INPUT}
              type="number"
              inputMode="decimal"
              step="1"
              value={form.fromC}
              onChange={set("fromC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="p-toc">
              Temperature to project to (°C)
            </label>
            <input
              id="p-toc"
              className={INPUT}
              type="number"
              inputMode="decimal"
              step="1"
              value={form.toC}
              onChange={set("toC")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["28", "30", "32", "35", "40"].map((psi) => (
            <button
              key={psi}
              type="button"
              className={CHIP}
              onClick={() => setForm((prev) => ({ ...prev, value: psi, unit: "psi" }))}
            >
              {psi} psi
            </button>
          ))}
          <button
            type="button"
            className={CHIP}
            onClick={() => setForm((prev) => ({ ...prev, value: "2.2", unit: "bar" }))}
          >
            2.2 bar
          </button>
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
              In bar
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${N3(result.byUnit.bar)} bar` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Same pressure is ${N2(result.byUnit.psi)} psi, ${N1(result.byUnit.kpa)} kPa or ${N3(result.byUnit.kgf)} kgf/cm2`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the pressure conversion result"
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
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Absolute pressure (gauge + 1 atm)</dt>
            <dd className="text-right font-semibold">
              {ok ? `${N2(result.absoluteKpa)} kPa abs` : DASH}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cold to hot tyre correction</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Gay-Lussac&apos;s law applied to absolute pressure and absolute temperature — the honest
          version of the &ldquo;1 psi per 10 °F&rdquo; rule.
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              `Reading at ${ok ? form.fromC : "?"} °C`,
              ok ? `${N2(result.byUnit.psi)} psi / ${N3(result.byUnit.bar)} bar` : DASH,
            ],
            [
              `Reading at ${ok ? form.toC : "?"} °C`,
              projected ? `${N2(projected.psi)} psi / ${N3(projected.bar)} bar` : DASH,
            ],
            ["Change", projected ? `${N2(projected.deltaPsi)} psi (${N3(projected.deltaBar)} bar)` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">psi to bar quick table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  psi
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  bar
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  kPa
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  kgf/cm2
                </th>
              </tr>
            </thead>
            <tbody>
              {[26, 28, 30, 32, 35, 38, 40, 44].map((psi) => {
                const row = convertPressure({ value: psi, fromUnit: "psi" });
                return (
                  <tr key={psi} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{psi}</td>
                    <td className="py-2 pr-3 text-right">{N3(row.byUnit.bar)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {N1(row.byUnit.kpa)}
                    </td>
                    <td className="py-2 text-right">{N3(row.byUnit.kgf)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Set tyre pressure to the figure on your vehicle&apos;s placard — usually on the driver door
        sill, fuel flap or in the manual — not to the maximum moulded on the tyre sidewall. Check it
        cold, before driving more than a couple of kilometres.
      </p>
    </main>
  );
}
