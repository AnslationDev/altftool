"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DEFAULT_CYCLE_DAYS, LPG_CYLINDER_KG, analyseGasReadings } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const SIGNED = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);
const num3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : DASH);

const DEFAULT_READINGS = [
  { id: 1, date: "2026-01-01", value: "320" },
  { id: 2, date: "2026-03-01", value: "356.5" },
  { id: 3, date: "2026-05-01", value: "398" },
];

const DEFAULT_SLAB_ROWS = [
  { id: 1, upTo: "30", rate: "48" },
  { id: 2, upTo: "60", rate: "52" },
  { id: 3, upTo: "", rate: "56" },
];

const DEFAULT_SETTINGS = {
  fixed: "50",
  tax: "10",
  cycle: String(DEFAULT_CYCLE_DAYS),
  people: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_READINGS);
  const [slabRows, setSlabRows] = useState(DEFAULT_SLAB_ROWS);
  const [nextId, setNextId] = useState(100);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseGasReadings({
        readings: rows.map((row) => ({ date: row.date, value: toNum(row.value) })),
        slabs: slabRows.map((slab, index) => ({
          upTo: index === slabRows.length - 1 ? null : toNum(slab.upTo),
          rate: toNum(slab.rate),
        })),
        fixedChargePerCycle: toNum(settings.fixed),
        taxPercent: toNum(settings.tax),
        cycleDays: toNum(settings.cycle),
        peopleInHome: toNum(settings.people),
      }),
    [rows, slabRows, settings],
  );

  const hasError = Boolean(result.error);

  const updateRow = (id, key, value) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId, date: "", value: "" }]);
    setNextId((n) => n + 1);
  };

  const removeRow = (id) =>
    setRows((prev) => (prev.length <= 2 ? prev : prev.filter((row) => row.id !== id)));

  const updateSlab = (id, key, value) =>
    setSlabRows((prev) => prev.map((slab) => (slab.id === id ? { ...slab, [key]: value } : slab)));

  const addSlab = () => {
    setSlabRows((prev) => [
      ...prev.slice(0, -1),
      { id: nextId, upTo: "", rate: "" },
      ...prev.slice(-1),
    ]);
    setNextId((n) => n + 1);
  };

  const removeSlab = (id) =>
    setSlabRows((prev) => (prev.length <= 1 ? prev : prev.filter((slab) => slab.id !== id)));

  const rowsOut = hasError
    ? [
        ["Consumption logged", DASH],
        ["Days covered", DASH],
        ["Average use", DASH],
        ["Latest period", DASH],
        ["Change against your median", DASH],
        ["Trend", DASH],
        ["Projected consumption this cycle", DASH],
        ["Slab energy charge", DASH],
        ["Fixed charge", DASH],
        ["Tax", DASH],
        ["Effective cost per SCM", DASH],
        ["Cost per day", DASH],
        ["Same energy as LPG", DASH],
      ]
    : [
        ["Consumption logged", `${num2(result.totalScm)} SCM`],
        ["Days covered", `${num1(result.totalDays)} days`],
        ["Average use", `${num3(result.avgScmPerDay)} SCM per day`],
        ["Latest period", `${num3(result.latest.scmPerDay)} SCM per day`],
        [
          "Change against your median",
          result.changePct === null ? "not enough history" : `${SIGNED.format(result.changePct)}%`,
        ],
        ["Trend", result.trend],
        ["Projected consumption this cycle", `${num2(result.projectedScm)} SCM`],
        ["Slab energy charge", money2(result.energyCharge)],
        ["Fixed charge", money2(result.fixedChargePerCycle)],
        [`Tax at ${num1(result.taxPercent)}%`, money2(result.tax)],
        ["Effective cost per SCM", money2(result.costPerScm)],
        ["Cost per day", money2(result.costPerDay)],
        [
          "Same energy as LPG",
          `${num1(result.lpgKgEquivalent)} kg (${num2(result.cylinderEquivalent)} cylinders of ${LPG_CYLINDER_KG} kg)`,
        ],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Gas Meter Reading Tracker",
      `Estimated next bill: ${money2(result.billTotal)} for ${num2(result.projectedScm)} SCM over ${num1(result.cycleDays)} days`,
      ...rowsOut.map(([label, value]) => `${label}: ${value}`),
      "",
      ...result.slabRows.map(
        (slab) =>
          `Slab ${slab.from}${slab.to === null ? "+" : ` to ${slab.to}`} SCM at ${money2(slab.rate)}: ${num2(slab.units)} SCM = ${money2(slab.amount)}`,
      ),
      ...result.periods.map(
        (p) => `${p.from} to ${p.to}: ${num2(p.scm)} SCM over ${num1(p.days)} days`,
      ),
    ].join("\n");
  }, [hasError, result, rowsOut]);

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
    setRows(DEFAULT_READINGS);
    setSlabRows(DEFAULT_SLAB_ROWS);
    setSettings(DEFAULT_SETTINGS);
    setNextId(100);
    setCopied(false);
  };

  const settingFields = [
    ["gmt-cycle", "Billing cycle (days)", "cycle", "1"],
    ["gmt-fixed", "Fixed charge per cycle (₹)", "fixed", "5"],
    ["gmt-tax", "State VAT on the bill (%)", "tax", "0.5"],
    ["gmt-people", "People in the household", "people", "1"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Piped gas
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gas Meter Reading Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Read the meter, log the date, and know the bill before it arrives — priced on your own
          distributor's slabs rather than a national average.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
          Meter readings in SCM, oldest first
        </h2>
        <div className="mt-3 grid gap-4">
          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`gmt-date-${row.id}`}>
                  Reading {index + 1} date
                </label>
                <input
                  id={`gmt-date-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={row.date}
                  onChange={(e) => updateRow(row.id, "date", e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`gmt-value-${row.id}`}>
                  Meter value (SCM)
                </label>
                <input
                  id={`gmt-value-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={row.value}
                  onChange={(e) => updateRow(row.id, "value", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 2}
                aria-label={`Remove reading ${index + 1}`}
                className={`${GHOST_BTN} w-full sm:w-auto disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove reading</span>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className={`${GHOST_BTN} mt-4`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a reading
        </button>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Tariff slabs from your bill
          </h2>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Slabs are telescopic: each block is charged at its own rate. The last row covers
            everything above the previous limit.
          </p>
          <div className="mt-3 grid gap-4">
            {slabRows.map((slab, index) => {
              const isLast = index === slabRows.length - 1;
              return (
                <div key={slab.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`gmt-slabup-${slab.id}`}>
                      {isLast ? "Everything above the previous limit" : `Slab ${index + 1} up to (SCM)`}
                    </label>
                    <input
                      id={`gmt-slabup-${slab.id}`}
                      className={`mt-2 ${INPUT_CLASS} disabled:opacity-50`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={isLast ? "" : slab.upTo}
                      disabled={isLast}
                      placeholder={isLast ? "no upper limit" : ""}
                      onChange={(e) => updateSlab(slab.id, "upTo", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`gmt-slabrate-${slab.id}`}>
                      Rate (₹ per SCM)
                    </label>
                    <input
                      id={`gmt-slabrate-${slab.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.5"
                      value={slab.rate}
                      onChange={(e) => updateSlab(slab.id, "rate", e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlab(slab.id)}
                    disabled={slabRows.length <= 1}
                    aria-label={`Remove slab ${index + 1}`}
                    className={`${GHOST_BTN} w-full sm:w-auto disabled:opacity-40`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sm:hidden">Remove slab</span>
                  </button>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={addSlab} className={`${GHOST_BTN} mt-4`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a slab
          </button>
        </div>

        <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
          {settingFields.map(([id, label, key, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={settings[key]}
                onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated bill for the next cycle
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.billTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the log or the tariff above to see the estimate."
                : `${num2(result.projectedScm)} SCM over ${num1(result.cycleDays)} days at your latest run rate`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy gas meter analysis"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the log" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rowsOut.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            How the slabs price the cycle
          </h2>
          <table className="mt-3 w-full min-w-[28rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Slab (SCM)
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Units in slab
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rate
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {result.slabRows.map((slab) => (
                <tr key={`${slab.from}-${slab.to ?? "top"}`}>
                  <td className="py-2.5 pr-3">
                    {slab.to === null ? `Above ${num2(slab.from)}` : `${num2(slab.from)} to ${num2(slab.to)}`}
                  </td>
                  <td className="py-2.5 pr-3 text-right">{num2(slab.units)}</td>
                  <td className="py-2.5 pr-3 text-right">{money2(slab.rate)}</td>
                  <td className="py-2.5 text-right font-semibold">{money2(slab.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Readings stay in your browser. Default slab rates are starting points, not a published
        tariff — copy the limits, rates, fixed charge and VAT percentage from your own bill for an
        accurate estimate. If you ever smell gas, close the meter valve, avoid switches and flames,
        and call your distributor's emergency helpline.
      </p>
    </main>
  );
}
