"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import { RATE_UNITS, REFERENCE_RATES, bitrateForTarget, convertDataRate, storageForDuration } from "../lib";

const DEFAULTS = { value: "25", unit: "Mbps", durationMinutes: "10", targetSizeMB: "500" };
const INPUT = "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const BTN = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const NUM = new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 6 });

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => convertDataRate({ value: Number(values.value), fromUnit: values.unit }), [values.unit, values.value]);
  const storage = useMemo(
    () => result.error ? result : storageForDuration({ bitsPerSecond: result.bitsPerSecond, seconds: Number(values.durationMinutes) * 60 }),
    [result, values.durationMinutes],
  );
  const target = useMemo(
    () => bitrateForTarget({ sizeMB: Number(values.targetSizeMB), seconds: Number(values.durationMinutes) * 60 }),
    [values.durationMinutes, values.targetSizeMB],
  );
  const hasError = Boolean(result.error);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const reset = () => { setValues(DEFAULTS); setCopied(false); };
  const conversions = hasError ? [] : result.conversions.filter((row) => ["kbps", "Mbps", "Gbps", "MBps", "GBph", "TBpd"].includes(row.id));
  const summary = hasError ? "" : [
    "Data Rate / Bitrate Converter",
    `${values.value} ${result.unit.short} = ${NUM.format(result.bitsPerSecond)} bit/s`,
    `= ${NUM.format(result.bytesPerSecond)} B/s`,
    `${values.durationMinutes} min at this rate = ${storage.error ? "—" : `${NUM.format(storage.gigabytes)} GB`}`,
    target.error ? "" : `${values.targetSizeMB} MB over ${values.durationMinutes} min needs ${NUM.format(target.mbps)} Mbps`,
  ].filter(Boolean).join("\n");
  const copy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => setCopied(false));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" /> Bitrate math
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Data Rate Bitrate Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Convert Mbps, kbps, MB/s and storage per hour/day, then work backwards from a target file size.</p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rate-value">Rate value</label>
            <input id="rate-value" className={`mt-2 ${INPUT}`} type="number" min="0" step="0.01" value={values.value} onChange={(event) => update("value", event.target.value)} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rate-unit">From unit</label>
            <select id="rate-unit" className={`mt-2 ${INPUT}`} value={values.unit} onChange={(event) => update("unit", event.target.value)}>
              {RATE_UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="rate-duration">Duration (minutes)</label>
            <input id="rate-duration" className={`mt-2 ${INPUT}`} type="number" min="0" step="1" value={values.durationMinutes} onChange={(event) => update("durationMinutes", event.target.value)} />
          </div>
          <div>
            <label className={LABEL} htmlFor="rate-size">Target file size (MB)</label>
            <input id="rate-size" className={`mt-2 ${INPUT}`} type="number" min="0" step="1" value={values.targetSizeMB} onChange={(event) => update("targetSizeMB", event.target.value)} />
          </div>
        </div>
      </section>

      {hasError && <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{result.error}</p>}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Megabits per second</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{hasError ? "—" : NUM.format(result.bitsPerSecond / 1e6)}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{storage.error ? "Enter a duration for file size." : `${NUM.format(storage.gigabytes)} GB over ${values.durationMinutes} minutes.`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} aria-label="Copy the converted data rates" disabled={hasError} className={`${BTN} border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] disabled:opacity-50`}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied!" : "Copy"}</button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={`${BTN} bg-[var(--primary)] text-[var(--primary-foreground)]`}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {conversions.map((row) => (
            <div key={row.id} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
              <dt className="text-xs text-[var(--muted-foreground)]">{row.name}</dt>
              <dd className="mt-1 text-sm font-semibold">{NUM.format(row.value)} {row.short}</dd>
            </div>
          ))}
        </dl>
        {!target.error && <p className="mt-5 rounded-lg bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted-foreground)]">{values.targetSizeMB} MB in {values.durationMinutes} min needs <span className="font-semibold text-[var(--foreground)]">{NUM.format(target.mbps)} Mbps</span>.</p>}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Reference rates</h2>
        <div className="mt-3 grid gap-2">
          {REFERENCE_RATES.slice(0, 6).map((rate) => <p key={rate.id} className="rounded-lg bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"><span className="font-semibold text-[var(--foreground)]">{rate.name}</span> — {rate.mbps} Mbps</p>)}
        </div>
      </section>
    </main>
  );
}
