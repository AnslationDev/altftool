"use client";

import { useMemo, useState } from "react";
import { Beaker, Check, Copy, RotateCcw } from "lucide-react";

import {
  CABIN_BAG_LIMIT_ML,
  CABIN_CONTAINER_LIMIT_ML,
  TSA_STATED_FLOZ,
  VOLUME_UNITS,
  cabinLiquidCheck,
  convertVolume,
} from "../lib";

const DEFAULTS = { value: "100", unit: "ml", target: "usFlOz", count: "6" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const n0 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const n2 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const n3 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 3 });

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [count, setCount] = useState(DEFAULTS.count);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertVolume({ value: Number(String(value).replace(/,/g, "").trim()), unit }),
    [value, unit],
  );

  const ok = !result.error;

  const cabin = useMemo(() => {
    if (!ok) return { error: "" };
    return cabinLiquidCheck({ containerMl: result.ml, containerCount: Number(String(count).trim()) });
  }, [ok, result, count]);

  const cabinOk = ok && !cabin.error;
  const error = result.error || (cabin.error ? cabin.error : "");
  const targetUnit = VOLUME_UNITS.find((entry) => entry.key === target) ?? VOLUME_UNITS[0];

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = ["Liquid volume conversion", `${n2.format(Number(value))} ${unit} = ${n2.format(result.ml)} ml`];
    for (const entry of VOLUME_UNITS) {
      lines.push(`${entry.label}: ${n3.format(result.values[entry.key])}`);
    }
    if (cabinOk) lines.push(`Cabin liquids: ${cabin.verdict}`);
    return lines.join("\n");
  }, [ok, value, unit, result, cabin, cabinOk]);

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
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setTarget(DEFAULTS.target);
    setCount(DEFAULTS.count);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Beaker className="h-4 w-4" aria-hidden="true" />
          Liquids
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Liquid Volume Travel Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert millilitres, US and imperial fluid ounces, cups and spoons — and check a bottle
          against the {CABIN_CONTAINER_LIMIT_ML} ml per-container cabin limit and the{" "}
          {CABIN_BAG_LIMIT_ML / 1000} litre bag.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vol-value">
              Volume
            </label>
            <input
              id="vol-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vol-unit">
              Given in
            </label>
            <select
              id="vol-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {VOLUME_UNITS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vol-target">
              Show me this in
            </label>
            <select
              id="vol-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            >
              {VOLUME_UNITS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vol-count">
              How many identical containers
            </label>
            <input
              id="vol-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["100 ml bottle", "100", "ml"],
            ["3.4 US fl oz", "3.4", "usFlOz"],
            ["1 US cup", "1", "usCup"],
            ["1 imperial pint", "1", "impPint"],
          ].map(([caption, preset, presetUnit]) => (
            <button
              key={caption}
              type="button"
              onClick={() => {
                setValue(preset);
                setUnit(presetUnit);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {caption}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {targetUnit.label}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? n3.format(result.values[target]) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `That is ${n2.format(result.ml)} ml` : "Fix the input above to see the conversion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted volume" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {VOLUME_UNITS.map((entry) => (
            <div key={entry.key} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{entry.label}</dt>
              <dd className="text-right font-semibold">{ok ? n3.format(result.values[entry.key]) : DASH}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cabin liquids check</h2>
        <p
          className={`mt-2 text-lg font-semibold ${
            cabinOk
              ? cabin.containerOk && cabin.bagOk
                ? "text-[var(--success)]"
                : "text-[var(--danger)]"
              : "text-[var(--muted-foreground)]"
          }`}
        >
          {cabinOk ? cabin.verdict : DASH}
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Container size", cabinOk ? `${n2.format(cabin.containerMl)} ml` : DASH],
            [
              `Against the ${CABIN_CONTAINER_LIMIT_ML} ml limit`,
              cabinOk
                ? cabin.containerOk
                  ? `${n2.format(cabin.containerHeadroomMl)} ml to spare`
                  : `${n2.format(-cabin.containerHeadroomMl)} ml over`
                : DASH,
            ],
            ["Containers carried", cabinOk ? n0.format(cabin.containerCount) : DASH],
            ["Total liquid in the bag", cabinOk ? `${n2.format(cabin.totalMl)} ml` : DASH],
            [
              `Against the ${CABIN_BAG_LIMIT_ML} ml bag`,
              cabinOk
                ? cabin.bagOk
                  ? `${n2.format(cabin.bagHeadroomMl)} ml to spare`
                  : `${n2.format(-cabin.bagHeadroomMl)} ml over`
                : DASH,
            ],
            ["Containers this size that fit the bag", cabinOk ? n0.format(cabin.maxContainersInBag) : DASH],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The limit is on the container's stated capacity, not on how full it is — a half-empty 200 ml
          bottle is still refused. The US TSA quotes the same rule as {TSA_STATED_FLOZ} ounces, which
          is 100.55 ml, so a bottle sold as {TSA_STATED_FLOZ} oz is a hair over a strict 100 ml limit.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversions are exact; security rules are not universal. Several airports now operate scanners
        that lift the 100 ml restriction, and medicines, baby food and duty-free in a sealed tamper-evident
        bag are treated separately. Check your departure, transfer and arrival airports before you pack,
        and never rely on a converter for prescription dosing — follow the label or your pharmacist.
      </p>
    </main>
  );
}
