"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";

import {
  APPLICATIONS,
  ELECTRODE_TYPES,
  checkGap,
  convertGap,
  gapConversionTable,
  recommendGap,
} from "../lib";

const MM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const THOU = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INCH = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const DEFAULTS = {
  measured: "1.05",
  unit: "mm",
  application: "modernNA",
  boostBar: "0",
  electrode: "iridium",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const TABLE = gapConversionTable();

export default function ToolHome() {
  const [measured, setMeasured] = useState(DEFAULTS.measured);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [application, setApplication] = useState(DEFAULTS.application);
  const [boostBar, setBoostBar] = useState(DEFAULTS.boostBar);
  const [electrode, setElectrode] = useState(DEFAULTS.electrode);
  const [copied, setCopied] = useState(false);

  const converted = useMemo(() => convertGap(toNumber(measured), unit), [measured, unit]);

  const target = useMemo(
    () => recommendGap({ application, boostBar: toNumber(boostBar) }),
    [application, boostBar],
  );

  const verdict = useMemo(() => {
    if (converted.error || target.error) return { error: converted.error || target.error };
    return checkGap({
      measuredMm: converted.mm,
      targetMinMm: target.minMm,
      targetMaxMm: target.maxMm,
    });
  }, [converted, target]);

  const electrodeInfo = useMemo(
    () => ELECTRODE_TYPES.find((type) => type.id === electrode) || ELECTRODE_TYPES[0],
    [electrode],
  );

  const error = converted.error || target.error || verdict.error || null;
  const ok = !error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Spark Plug Gap Tool",
      `Measured gap: ${MM.format(converted.mm)} mm = ${THOU.format(converted.thou)} thou = ${INCH.format(converted.inch)} in`,
      `Engine type: ${target.label}`,
      `Target range: ${target.minMm}-${target.maxMm} mm (${target.minThou}-${target.maxThou} thou)`,
      `Verdict: ${verdict.message}`,
      verdict.inRange ? "" : `Adjustment needed: ${MM.format(verdict.adjustmentMm)} mm`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, converted, target, verdict]);

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
    setMeasured(DEFAULTS.measured);
    setUnit(DEFAULTS.unit);
    setApplication(DEFAULTS.application);
    setBoostBar(DEFAULTS.boostBar);
    setElectrode(DEFAULTS.electrode);
    setCopied(false);
  };

  const outOfRange = ok && !verdict.inRange;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Spark Plug Gap Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a gap between millimetres, inches and thousandths, and check it against the range
          normally used for your kind of engine. One inch is exactly 25.4 mm, so one thou is
          0.0254 mm.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gap-measured">
              Measured or desired gap
            </label>
            <input
              id="gap-measured"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={measured}
              onChange={(event) => {
                setMeasured(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="gap-unit">
              Unit
            </label>
            <select
              id="gap-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => {
                setUnit(event.target.value);
                setCopied(false);
              }}
            >
              <option value="mm">Millimetres</option>
              <option value="in">Inches</option>
              <option value="thou">Thou (thousandths of an inch)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gap-application">
              Engine type
            </label>
            <select
              id="gap-application"
              className={`mt-2 ${INPUT_CLASS}`}
              value={application}
              onChange={(event) => {
                setApplication(event.target.value);
                setCopied(false);
              }}
            >
              {APPLICATIONS.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.label} ({app.minMm}-{app.maxMm} mm)
                </option>
              ))}
            </select>
            {!target.error ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{target.note}</p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="gap-boost">
              Peak boost pressure (bar, 0 if none)
            </label>
            <input
              id="gap-boost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="4"
              step="0.1"
              value={boostBar}
              onChange={(event) => {
                setBoostBar(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="gap-electrode">
              Electrode material
            </label>
            <select
              id="gap-electrode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={electrode}
              onChange={(event) => {
                setElectrode(event.target.value);
                setCopied(false);
              }}
            >
              {ELECTRODE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{electrodeInfo.regap}</p>
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your gap
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                outOfRange ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {ok ? `${MM.format(converted.mm)} mm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${THOU.format(converted.thou)} thou · ${INCH.format(converted.inch)} in`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy spark plug gap result"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Typical range for this engine",
              ok
                ? `${target.baseMinMm}-${target.baseMaxMm} mm`
                : DASH,
            ],
            [
              "Closed up for boost",
              ok ? (target.boostApplied ? `-${MM.format(target.reductionMm)} mm` : "Not applicable") : DASH,
            ],
            [
              "Target range to aim for",
              ok ? `${target.minMm}-${target.maxMm} mm (${target.minThou}-${target.maxThou} thou)` : DASH,
            ],
            ["Middle of the target range", ok ? `${target.midMm} mm` : DASH],
            ["Verdict", ok ? verdict.verdict.replace("-", " ") : DASH],
            [
              "Adjustment needed",
              ok
                ? verdict.inRange
                  ? "None"
                  : `${MM.format(verdict.adjustmentMm)} mm (${THOU.format(verdict.adjustmentThou)} thou)`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              verdict.inRange
                ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {verdict.message}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Millimetre to thou reference</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Millimetres
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Thou
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Inches
                </th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((row) => (
                <tr key={row.mm} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.mm}</td>
                  <td className="py-2 pr-3 text-right">{row.thou}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{row.inch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          {electrodeInfo.label}: {electrodeInfo.life}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational reference. The gap stamped on the underbonnet sticker or printed in your
        manual always overrides a general range, and iridium plugs are supplied pre-gapped for a
        reason.
      </p>
    </main>
  );
}
