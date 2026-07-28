"use client";

import { useMemo, useState } from "react";
import { Backpack, Check, Copy, RotateCcw } from "lucide-react";
import { CLASS_LIMITS, PERCENT_CAUTION, PERCENT_LIMIT, checkSchoolBag } from "../lib";

const KG = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = { body: "30", bag: "4.5", classKey: "6-7" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BAND_TONE = {
  ok: "text-[var(--success)]",
  "over-policy": "text-[var(--foreground)]",
  "over-percent": "text-[var(--danger)]",
  excessive: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [body, setBody] = useState(DEFAULTS.body);
  const [bag, setBag] = useState(DEFAULTS.bag);
  const [classKey, setClassKey] = useState(DEFAULTS.classKey);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkSchoolBag({
        bodyWeightKg: body === "" ? NaN : Number(body),
        bagWeightKg: bag === "" ? NaN : Number(bag),
        classKey,
      }),
    [body, bag, classKey],
  );

  const hasError = Boolean(result.error);
  const barWidth = hasError ? 0 : result.gaugePercent;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "School Bag Weight Checker",
      `Child weight: ${KG.format(result.bodyWeightKg)} kg`,
      `Bag weight: ${KG.format(result.bagWeightKg)} kg`,
      `Class group: ${result.classRow.label}`,
      "",
      `Bag is ${PCT.format(result.percent)}% of body weight — ${result.band.label}`,
      result.band.note,
      "",
      `${PERCENT_LIMIT}% of body weight: ${KG.format(result.percentSafeKg)} kg`,
      `School Bag Policy 2020 limit for ${result.classRow.label}: ${KG.format(result.policyMinKg)}-${KG.format(result.policyMaxKg)} kg`,
      `Binding limit (stricter of the two): ${KG.format(result.effectiveLimitKg)} kg`,
      result.excessKg > 0
        ? `Overweight by ${KG.format(result.excessKg)} kg`
        : `Headroom left: ${KG.format(result.headroomKg)} kg`,
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
    setBody(DEFAULTS.body);
    setBag(DEFAULTS.bag);
    setClassKey(DEFAULTS.classKey);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Backpack className="h-4 w-4" aria-hidden="true" />
          Child health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">School Bag Weight Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weigh the loaded bag, enter the child's weight and class, and see it checked against both
          the 10% of body weight rule and the class-wise kilogram ceilings in India's School Bag
          Policy 2020.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sbw-body">
              Child's weight (kg)
            </label>
            <input
              id="sbw-body"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="150"
              step="0.5"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sbw-bag">
              Loaded bag weight (kg)
            </label>
            <input
              id="sbw-bag"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.1"
              value={bag}
              onChange={(event) => setBag(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sbw-class">
              Class group
            </label>
            <select
              id="sbw-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={classKey}
              onChange={(event) => setClassKey(event.target.value)}
            >
              {CLASS_LIMITS.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Weigh yourself on a bathroom scale, then again holding the packed bag, and use the
          difference. Include the water bottle, lunch box and any device.
        </p>
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
              Bag as a share of body weight
            </p>
            <p className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : BAND_TONE[result.band.code]}`}>
              {hasError ? DASH : `${PCT.format(result.percent)}%`}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.band.label} — ${result.band.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the school bag weight result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={hasError ? "Result unavailable" : `Bag is ${PCT.format(result.percent)} percent of body weight`}
          >
            <span
              className={`block h-full ${hasError || result.band.code === "ok" ? "bg-[var(--primary)]" : "bg-[var(--danger)]"}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Scale ends at {PERCENT_CAUTION}% of body weight; {PERCENT_LIMIT}% is the recommended ceiling.
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [`${PERCENT_LIMIT}% of body weight`, hasError ? DASH : `${KG.format(result.percentSafeKg)} kg`],
            [
              "School Bag Policy 2020 limit",
              hasError ? DASH : `${KG.format(result.policyMinKg)}–${KG.format(result.policyMaxKg)} kg for ${result.classRow.label}`,
            ],
            ["Binding limit (stricter rule)", hasError ? DASH : `${KG.format(result.effectiveLimitKg)} kg`],
            [
              result.excessKg > 0 ? "Overweight by" : "Headroom left",
              hasError ? DASH : `${KG.format(result.excessKg > 0 ? result.excessKg : result.headroomKg)} kg`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.classRow.note && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            {result.classRow.note}
          </p>
        )}
      </section>

      {!hasError && result.excessKg > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to take out</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Any one of these gets the bag back to {KG.format(result.effectiveLimitKg)} kg.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Typical weight</th>
                  <th scope="col" className="py-2 text-right font-semibold">Remove</th>
                </tr>
              </thead>
              <tbody>
                {result.removals.map((item) => (
                  <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{item.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{KG.format(item.kg)} kg</td>
                    <td className="py-2 text-right font-semibold">
                      {item.countToRemove} {item.countToRemove === 1 ? "item" : "items"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Class-wise limits, School Bag Policy 2020</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Class</th>
                <th scope="col" className="py-2 text-right font-semibold">Bag weight</th>
              </tr>
            </thead>
            <tbody>
              {CLASS_LIMITS.map((row) => (
                <tr
                  key={row.key}
                  className={`border-b border-[var(--border)] last:border-0 ${row.key === classKey ? "text-[var(--primary)] font-semibold" : ""}`}
                >
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 text-right">
                    {row.maxKg === 0 ? "No bag" : `${KG.format(row.minKg)}–${KG.format(row.maxKg)} kg`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational check, not medical advice. How the bag is worn matters as much as the number:
        both shoulder straps, the bag sitting above the hips, heaviest items closest to the back. See
        a doctor or physiotherapist about persistent back, neck or shoulder pain in a child.
      </p>
    </main>
  );
}
