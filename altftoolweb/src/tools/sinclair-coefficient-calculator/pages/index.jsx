"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Weight } from "lucide-react";

import {
  DEFAULT_CYCLE_ID,
  SINCLAIR_CYCLES,
  computeSinclair,
  lbToKg,
  totalForSinclair,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sex: "male",
  unit: "kg",
  cycleId: DEFAULT_CYCLE_ID,
  bodyweight: "89",
  snatch: "150",
  cleanJerk: "185",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [cycleId, setCycleId] = useState(DEFAULTS.cycleId);
  const [bodyweight, setBodyweight] = useState(DEFAULTS.bodyweight);
  const [snatch, setSnatch] = useState(DEFAULTS.snatch);
  const [cleanJerk, setCleanJerk] = useState(DEFAULTS.cleanJerk);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const convert = (raw) => {
      const value = toNumber(raw);
      if (Number.isNaN(value)) return NaN;
      return unit === "lb" ? lbToKg(value) : value;
    };
    const bw = convert(bodyweight);
    const sn = convert(snatch);
    const cj = convert(cleanJerk);
    if (Number.isNaN(bw)) return { error: "Enter a bodyweight." };
    if (Number.isNaN(sn) || Number.isNaN(cj)) {
      return { error: "Enter both the snatch and the clean & jerk." };
    }
    return computeSinclair({ bodyweightKg: bw, sex, cycleId, snatchKg: sn, cleanJerkKg: cj });
  }, [bodyweight, snatch, cleanJerk, sex, unit, cycleId]);

  const hasError = Boolean(result.error);

  const targets = useMemo(() => {
    const raw = toNumber(bodyweight);
    if (Number.isNaN(raw)) return [];
    const bw = unit === "lb" ? lbToKg(raw) : raw;
    return [275, 350, 425].map((targetSinclair) => {
      const row = totalForSinclair({ bodyweightKg: bw, sex, cycleId, targetSinclair });
      return { targetSinclair, totalKg: row.error ? null : row.totalKg };
    });
  }, [bodyweight, sex, unit, cycleId]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sinclair Coefficient Calculator",
      `Cycle: ${result.cycle.label}`,
      `Bodyweight: ${NUM1.format(result.bodyweightKg)} kg`,
      `Total: ${NUM1.format(result.totalKg)} kg`,
      `Sinclair coefficient: ${NUM4.format(result.coefficient)}`,
      `Sinclair total: ${NUM2.format(result.sinclairTotal)}`,
    ].join("\n");
  }, [hasError, result]);

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
    setSex(DEFAULTS.sex);
    setUnit(DEFAULTS.unit);
    setCycleId(DEFAULTS.cycleId);
    setBodyweight(DEFAULTS.bodyweight);
    setSnatch(DEFAULTS.snatch);
    setCleanJerk(DEFAULTS.cleanJerk);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Competition total", DASH],
        ["Sinclair coefficient", DASH],
        ["Reference bodyweight b", DASH],
        ["Cycle constant A", DASH],
        ["Snatch / clean & jerk split", DASH],
        ["Total ÷ bodyweight", DASH],
        ["Band", DASH],
      ]
    : [
        [
          "Competition total",
          `${NUM1.format(result.totalKg)} kg · ${NUM1.format(result.totalLb)} lb`,
        ],
        ["Sinclair coefficient", NUM4.format(result.coefficient)],
        ["Reference bodyweight b", `${NUM2.format(result.b)} kg`],
        ["Cycle constant A", NUM4.format(result.a)],
        [
          "Snatch / clean & jerk split",
          result.liftShare
            ? `${NUM0.format(result.liftShare.snatch)}% / ${NUM0.format(result.liftShare.cleanJerk)}%`
            : DASH,
        ],
        ["Total ÷ bodyweight", `${NUM2.format(result.totalToBodyweightRatio)}×`],
        ["Band", `${result.band.label} — ${result.band.note}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Weight className="h-4 w-4" aria-hidden="true" />
          Olympic weightlifting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sinclair Coefficient Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The Sinclair coefficient scales a snatch and clean &amp; jerk total to what the same
          athlete would theoretically lift at the heaviest world-record bodyweight, so every weight
          category can be ranked together. Coefficient = 10^(A × log₁₀(bodyweight ÷ b)²).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sinclair-sex">
              Coefficient set
            </label>
            <select
              id="sinclair-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Men</option>
              <option value="female">Women</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sinclair-cycle">
              Olympic cycle
            </label>
            <select
              id="sinclair-cycle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cycleId}
              onChange={(event) => setCycleId(event.target.value)}
            >
              {SINCLAIR_CYCLES.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sinclair-unit">
              Units
            </label>
            <select
              id="sinclair-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="kg">Kilograms</option>
              <option value="lb">Pounds</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sinclair-bodyweight">
              Bodyweight ({unit})
            </label>
            <input
              id="sinclair-bodyweight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={bodyweight}
              onChange={(event) => setBodyweight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sinclair-snatch">
              Snatch ({unit})
            </label>
            <input
              id="sinclair-snatch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={snatch}
              onChange={(event) => setSnatch(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sinclair-cj">
              Clean &amp; jerk ({unit})
            </label>
            <input
              id="sinclair-cj"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={cleanJerk}
              onChange={(event) => setCleanJerk(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Sinclair total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM2.format(result.sinclairTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a Sinclair total."
                : `${NUM1.format(result.totalKg)} kg × ${NUM4.format(result.coefficient)} · ${result.cycle.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Sinclair total result"
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

        {!hasError && result.atOrAboveReference && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            At or above the reference bodyweight of {NUM2.format(result.b)} kg the coefficient is
            defined as exactly 1.00, so the Sinclair total equals the competition total.
          </p>
        )}

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
        <h2 className="text-base font-semibold">Totals behind each Sinclair target</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Sinclair target
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Competition total needed
                </th>
              </tr>
            </thead>
            <tbody>
              {targets.map((row) => (
                <tr
                  key={row.targetSinclair}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="py-2 pr-3 font-semibold">{row.targetSinclair}</td>
                  <td className="py-2 text-right">
                    {row.totalKg === null ? DASH : `${NUM1.format(row.totalKg)} kg`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {targets.length === 0 && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Enter a bodyweight to see the totals behind each Sinclair target.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The IWF refits A and b at the start of each Olympic cycle, so check the current published
        table before quoting a Sinclair total in an official context. Band labels here are informal
        reference points, not IWF classifications.
      </p>
    </main>
  );
}
