"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HardDrive, RotateCcw } from "lucide-react";

import {
  DEFAULT_HEADROOM_PCT,
  OFFSITE_MODES,
  RULE_TOTAL_COPIES,
  formatHours,
  planBackup,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  currentTB: "8",
  monthlyGrowthGB: "500",
  horizonMonths: "24",
  headroomPct: String(DEFAULT_HEADROOM_PCT),
  driveSizeTB: "18",
  drivePrice: "28000",
  cloudPricePerTBMonth: "500",
  copies: String(RULE_TOTAL_COPIES),
  localTransferMBs: "180",
  internetMbps: "100",
};

const FIELDS = [
  ["currentTB", "Library size today (TB)", "0.5"],
  ["monthlyGrowthGB", "New footage per month (GB)", "50"],
  ["horizonMonths", "Planning horizon (months)", "1"],
  ["headroomPct", "Free space to keep on each drive (%)", "5"],
  ["driveSizeTB", "Capacity of one drive (TB)", "1"],
  ["drivePrice", "Price of one drive (INR)", "500"],
  ["cloudPricePerTBMonth", "Cloud archive per TB per month (INR)", "50"],
  ["copies", "Total copies of the data", "1"],
  ["localTransferMBs", "Local copy speed (MB/s)", "10"],
  ["internetMbps", "Download speed (Mbps)", "10"],
];

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return Number.NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : Number.NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [offsiteMode, setOffsiteMode] = useState("cloud");
  const [copied, setCopied] = useState(false);

  const setField = (key, next) => setValues((prev) => ({ ...prev, [key]: next }));

  const result = useMemo(() => {
    const numeric = {};
    for (const key of Object.keys(DEFAULTS)) numeric[key] = toNumber(values[key]);
    return planBackup({ ...numeric, offsiteMode });
  }, [values, offsiteMode]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "3-2-1 Backup Plan",
      `Library in ${values.horizonMonths} months: ${num(result.projectedTB)} TB`,
      `Capacity to buy per copy: ${num(result.requiredPerCopyTB)} TB (${result.drivesPerCopy} drives)`,
      `Total drives: ${result.totalDrives}`,
      `Drive spend: ${money(result.hardwareCost)}`,
      `Cloud spend over the horizon: ${money(result.cloudCost)}`,
      `Total: ${money(result.totalCost)} (${money(result.costPerMonth)} per month)`,
      `Full local restore: ${formatHours(result.localRestoreHours)}`,
    ];
    if (result.cloudRestoreHours !== null) {
      lines.push(`Full cloud restore: ${formatHours(result.cloudRestoreHours)}`);
    }
    lines.push("", ...result.plan.map((copy) => `${copy.label}: ${copy.medium} — ${copy.location}`));
    return lines.join("\n");
  }, [failed, result, values]);

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
    setValues(DEFAULTS);
    setOffsiteMode("cloud");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HardDrive className="h-4 w-4" aria-hidden="true" />
          3 copies · 2 media · 1 off site
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Creator Backup 3 2 1 Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Size a real 3-2-1 plan against a growing footage library: how many drives to buy, what the
          cloud copy costs over time, and how long a full restore would actually take.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`bkp-${key}`}>
                {label}
              </label>
              <input
                id={`bkp-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={values[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bkp-offsite">
              Off-site copy
            </label>
            <select
              id="bkp-offsite"
              className={`mt-2 ${INPUT_CLASS}`}
              value={offsiteMode}
              onChange={(event) => setOffsiteMode(event.target.value)}
            >
              {OFFSITE_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {failed && (
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
              Total cost of the plan
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : money(result.totalCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to size the plan."
                : `${money(result.costPerMonth)} a month over ${values.horizonMonths} months`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the backup plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              `Library after ${values.horizonMonths} months`,
              failed ? "—" : `${num(result.projectedTB)} TB (${num(result.projectedTiB)} TiB in Windows)`,
            ],
            ["Capacity to buy per copy", failed ? "—" : `${num(result.requiredPerCopyTB)} TB`],
            ["Drives per copy", failed ? "—" : result.drivesPerCopy],
            ["Drives in total", failed ? "—" : result.totalDrives],
            ["Drive spend", failed ? "—" : money(result.hardwareCost)],
            ["Cloud spend over the horizon", failed ? "—" : money(result.cloudCost)],
            ["Cost per TB protected", failed ? "—" : money(result.costPerTB)],
            ["Full restore from a local drive", failed ? "—" : formatHours(result.localRestoreHours)],
            [
              "Full restore from the cloud",
              failed || result.cloudRestoreHours === null ? "—" : formatHours(result.cloudRestoreHours),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && !result.meetsRule && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Fewer than {RULE_TOTAL_COPIES} copies — this plan does not satisfy the 3-2-1 rule.
          </p>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your three copies</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Copy</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Medium</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Where</th>
                  <th scope="col" className="py-2 text-right font-semibold">Drives</th>
                </tr>
              </thead>
              <tbody>
                {result.plan.map((copy) => (
                  <tr key={copy.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{copy.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{copy.medium}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{copy.location}</td>
                    <td className="py-2 text-right">{copy.drives === 0 ? "—" : copy.drives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Drive capacity is counted in decimal TB the way manufacturers sell it, so Windows will show
        roughly 9% less. RAID is redundancy, not a backup — a deleted file or a failed controller
        takes every mirror with it, which is why the second and third copies still matter.
      </p>
    </main>
  );
}
