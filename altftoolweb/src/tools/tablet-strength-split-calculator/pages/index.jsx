"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pill, RotateCcw } from "lucide-react";

import { SPLIT_OPTIONS, calculateTabletSplit } from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  targetDoseMg: "375",
  tabletStrengthMg: "500",
  splitId: "quarter",
  dosesPerDay: "2",
  packSize: "30",
};
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => calculateTabletSplit(form), [form]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Tablet split calculation",
      `Target dose: ${NUM2.format(result.targetMg)} mg`,
      `Tablet strength: ${NUM2.format(result.strengthMg)} mg (${result.split.label})`,
      `Closest match: ${result.nearest.label} tablet(s) = ${NUM2.format(result.nearest.doseMg)} mg`,
      result.exactMatch
        ? "That is an exact match for the target."
        : `Round down: ${result.roundDown.label} = ${NUM2.format(result.roundDown.doseMg)} mg; round up: ${result.roundUp.label} = ${NUM2.format(result.roundUp.doseMg)} mg`,
      result.tabletsPerDayLabel
        ? `Per day: ${result.tabletsPerDayLabel} tablet(s), ${NUM2.format(result.dailyDoseMg)} mg`
        : "",
      result.daysSupply !== null ? `A pack of ${result.packSize} lasts about ${result.daysSupply} days.` : "",
      "Informational only — never split a tablet without checking it is safe to do so.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
          <Pill className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tablet Strength Split Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how many tablets of the strength you have make the dose you need, limited to the
          halves or quarters the tablet can actually be broken into.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tab-target">
              Target dose (mg)
            </label>
            <input
              id="tab-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.targetDoseMg}
              onChange={setField("targetDoseMg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tab-strength">
              Tablet strength (mg)
            </label>
            <input
              id="tab-strength"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.tabletStrengthMg}
              onChange={setField("tabletStrengthMg")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tab-split">
              How the tablet can be divided
            </label>
            <select
              id="tab-split"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.splitId}
              onChange={setField("splitId")}
            >
              {SPLIT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tab-frequency">
              Doses per day (optional)
            </label>
            <input
              id="tab-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="24"
              step="1"
              placeholder="Optional"
              value={form.dosesPerDay}
              onChange={setField("dosesPerDay")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tab-pack">
              Tablets in the pack (optional)
            </label>
            <input
              id="tab-pack"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              placeholder="Optional"
              value={form.packSize}
              onChange={setField("packSize")}
            />
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Tablets per dose
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.nearest.label : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM2.format(result.nearest.doseMg)} mg from ${NUM2.format(result.strengthMg)} mg tablets`
                : "Fix the inputs above to see a result."}
            </p>
            {ok && (
              <span
                className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                  result.exactMatch
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--warning-soft)] text-[var(--warning)]"
                }`}
              >
                {result.exactMatch ? "Exact match" : "No exact match with these pieces"}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the tablet split result"
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
          {[
            ["Exact tablets the target needs", ok ? NUM2.format(result.exactTablets) : DASH],
            ["Smallest piece available", ok ? `${NUM2.format(result.smallestPieceMg)} mg` : DASH],
            [
              "Difference from target",
              ok
                ? `${result.nearest.differenceMg >= 0 ? "+" : "−"}${NUM2.format(
                    Math.abs(result.nearest.differenceMg),
                  )} mg (${NUM1.format(Math.abs(result.nearest.percentDifference))}%)`
                : DASH,
            ],
            [
              "Nearest below target",
              ok ? `${result.roundDown.label} = ${NUM2.format(result.roundDown.doseMg)} mg` : DASH,
            ],
            [
              "Nearest above target",
              ok ? `${result.roundUp.label} = ${NUM2.format(result.roundUp.doseMg)} mg` : DASH,
            ],
            [
              "Tablets per day",
              ok
                ? result.tabletsPerDayLabel
                  ? `${result.tabletsPerDayLabel} (${NUM2.format(result.dailyDoseMg)} mg)`
                  : "Add doses per day"
                : DASH,
            ],
            [
              "Days a pack lasts",
              ok ? (result.daysSupply !== null ? `${result.daysSupply} days` : "Add a pack size") : DASH,
            ],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok && result.targetBelowSmallestPiece && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            The target dose is smaller than the smallest piece this tablet can be divided into. A
            lower-strength product or a liquid formulation is needed.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational arithmetic only, not medical advice. Many tablets must never be split:
        modified-release, enteric-coated, film-coated and cytotoxic products lose their behaviour or
        become hazardous when broken. Check with a pharmacist before splitting anything, and use a
        proper tablet cutter rather than a knife.
      </p>
    </main>
  );
}
