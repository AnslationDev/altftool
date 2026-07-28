"use client";

import { useMemo, useState } from "react";
import { Activity, RotateCcw } from "lucide-react";

import { INPUT_UNITS, convertA1c, referenceTable } from "../lib";

const DEFAULTS = { value: "7", unit: "percent" };
const INPUT = "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const ONE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const ZERO = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const result = useMemo(() => convertA1c({ value: values.value, unit: values.unit }), [values]);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]"><Activity className="h-4 w-4" />Lab converter</div><h1 className="text-3xl font-semibold leading-tight sm:text-4xl">HbA1c to Average Glucose Converter</h1><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Convert HbA1c %, IFCC mmol/mol and estimated average glucose using the ADAG equation.</p></header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="grid gap-4 sm:grid-cols-2"><div><label className={LABEL} htmlFor="a1c-value">Value</label><input id="a1c-value" className={`mt-2 ${INPUT}`} type="number" step="0.1" value={values.value} onChange={(event) => update("value", event.target.value)} /></div><div><label className={LABEL} htmlFor="a1c-unit">Input format</label><select id="a1c-unit" className={`mt-2 ${INPUT}`} value={values.unit} onChange={(event) => update("unit", event.target.value)}>{INPUT_UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}</select></div></div></section>
      {result.error ? <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{result.error}</p> : <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">HbA1c</p><p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{ONE.format(result.percent)}%</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">{result.band.label}: {result.band.note}</p></div><button type="button" onClick={() => setValues(DEFAULTS)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"><RotateCcw className="h-4 w-4" />Reset</button></div><dl className="mt-5 grid gap-3 sm:grid-cols-2">{[["IFCC", `${ZERO.format(result.ifcc)} mmol/mol`], ["eAG", `${ZERO.format(result.eagMgdl)} mg/dL`], ["eAG mmol/L", `${ONE.format(result.eagMmoll)} mmol/L`], ["Equation range", result.extrapolated ? "Outside ADAG derivation" : "Within ADAG range"]].map(([label, value]) => <div key={label} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]"><dt className="text-xs text-[var(--muted-foreground)]">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl><div className="mt-5 overflow-hidden rounded-lg ring-1 ring-[var(--border)]"><table className="w-full text-left text-sm"><tbody className="divide-y divide-[var(--border)]">{referenceTable().slice(2, 8).map((row) => <tr key={row.percent}><td className="px-3 py-2 font-semibold">{row.percent}%</td><td className="px-3 py-2">{ZERO.format(row.ifcc)} mmol/mol</td><td className="px-3 py-2 text-[var(--muted-foreground)]">{ZERO.format(row.eagMgdl)} mg/dL</td></tr>)}</tbody></table></div></section>}
    </main>
  );
}
