"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fence, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BAR_SHAPES,
  DEFAULT_FRAME_KG_PER_M,
  MATERIALS,
  MAX_SAFE_GAP_MM,
  estimateGrillCost,
} from "../lib";

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

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);
const num3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : DASH);

const DEFAULT_OPENINGS = [
  { id: 1, width: "4", height: "3", quantity: "2" },
  { id: 2, width: "6", height: "4", quantity: "1" },
];

const DEFAULTS = {
  material: "ms",
  shape: "square",
  barSize: "12",
  spacing: "100",
  horizontals: "2",
  frameKg: String(DEFAULT_FRAME_KG_PER_M),
  mode: "weight",
  ratePerKg: "110",
  ratePerSqft: "250",
  paintRate: "35",
  install: "300",
  panels: "0",
  panelRate: "1500",
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
  const [openings, setOpenings] = useState(DEFAULT_OPENINGS);
  const [nextId, setNextId] = useState(DEFAULT_OPENINGS.length + 1);
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      estimateGrillCost({
        openings: openings.map((o) => ({
          widthFt: toNum(o.width),
          heightFt: toNum(o.height),
          quantity: toNum(o.quantity),
        })),
        materialKey: values.material,
        barShape: values.shape,
        barSizeMm: toNum(values.barSize),
        barSpacingMm: toNum(values.spacing),
        horizontalMembers: toNum(values.horizontals),
        frameKgPerM: toNum(values.frameKg),
        pricingMode: values.mode,
        ratePerKg: toNum(values.ratePerKg),
        ratePerSqft: toNum(values.ratePerSqft),
        paintRatePerSqft: toNum(values.paintRate),
        installPerOpening: toNum(values.install),
        openablePanels: toNum(values.panels),
        openablePanelRate: toNum(values.panelRate),
      }),
    [openings, values],
  );

  const hasError = Boolean(result.error);

  const updateOpening = (id, key, value) =>
    setOpenings((prev) => prev.map((o) => (o.id === id ? { ...o, [key]: value } : o)));

  const addOpening = () => {
    setOpenings((prev) => [...prev, { id: nextId, width: "", height: "", quantity: "1" }]);
    setNextId((n) => n + 1);
  };

  const removeOpening = (id) =>
    setOpenings((prev) => (prev.length <= 1 ? prev : prev.filter((o) => o.id !== id)));

  const rows = hasError
    ? [
        ["Total grill area", DASH],
        ["Openings", DASH],
        ["Bar weight per metre", DASH],
        ["Total fabricated weight", DASH],
        ["Steel per square foot", DASH],
        ["Narrowest clear gap", DASH],
        ["Widest clear gap", DASH],
        ["Grill", DASH],
        ["Primer and paint", DASH],
        ["Openable panels", DASH],
        ["Installation", DASH],
        ["Cost per square foot", DASH],
        ["Cost per kilogram", DASH],
      ]
    : [
        ["Total grill area", `${num1(result.totalAreaSqft)} sq ft`],
        ["Openings", `${result.totalUnits}`],
        ["Bar weight per metre", `${num3(result.barKgPerM)} kg/m`],
        ["Total fabricated weight", `${num2(result.totalWeightKg)} kg`],
        ["Steel per square foot", `${num2(result.kgPerSqft)} kg`],
        ["Narrowest clear gap", `${num1(result.minClearGapMm)} mm`],
        ["Widest clear gap", `${num1(result.maxGapMm)} mm`],
        ...result.items.map(([label, value]) => [label, money(value)]),
        ["Cost per square foot", money2(result.costPerSqft)],
        ["Cost per kilogram", money2(result.costPerKg)],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Balcony Grill Cost Calculator",
      `Total: ${money(result.total)} for ${num1(result.totalAreaSqft)} sq ft of grill`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      "",
      ...result.detail.map(
        (d) =>
          `Opening ${d.index}: ${d.widthFt} x ${d.heightFt} ft x ${d.quantity} — ${d.barCount} bars, ${num1(d.clearGapMm)} mm clear gap, ${num2(d.weightPerUnit)} kg each`,
      ),
      ...result.notes.map((note) => `Note: ${note}`),
    ].join("\n");
  }, [hasError, result, rows]);

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
    setOpenings(DEFAULT_OPENINGS);
    setNextId(DEFAULT_OPENINGS.length + 1);
    setValues(DEFAULTS);
    setCopied(false);
  };

  const sectionFields = [
    ["bgc-barsize", "Bar size (mm)", "barSize", "1"],
    ["bgc-spacing", "Bar spacing, centre to centre (mm)", "spacing", "5"],
    ["bgc-horizontals", "Horizontal members per opening", "horizontals", "1"],
    ["bgc-framekg", "Frame section weight (kg per m)", "frameKg", "0.05"],
  ];

  const priceFields = [
    ["bgc-ratekg", "Fabricated rate (₹ per kg)", "ratePerKg", "5"],
    ["bgc-ratesqft", "Rate by area (₹ per sq ft)", "ratePerSqft", "10"],
    ["bgc-paint", "Primer and paint (₹ per sq ft)", "paintRate", "5"],
    ["bgc-install", "Installation (₹ per opening)", "install", "50"],
    ["bgc-panels", "Openable panels", "panels", "1"],
    ["bgc-panelrate", "Openable panel charge (₹ each)", "panelRate", "100"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fence className="h-4 w-4" aria-hidden="true" />
          Grill work
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Balcony Grill Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Quoted by the kilo or by the square foot, the same grill should cost about the same. This
          works out the steel weight from the section so you can check that it does.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
          Openings to be covered
        </h2>
        <div className="mt-3 grid gap-4">
          {openings.map((opening, index) => (
            <div
              key={opening.id}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`bgc-w-${opening.id}`}>
                  Opening {index + 1} width (ft)
                </label>
                <input
                  id={`bgc-w-${opening.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.25"
                  value={opening.width}
                  onChange={(e) => updateOpening(opening.id, "width", e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`bgc-h-${opening.id}`}>
                  Height (ft)
                </label>
                <input
                  id={`bgc-h-${opening.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.25"
                  value={opening.height}
                  onChange={(e) => updateOpening(opening.id, "height", e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`bgc-q-${opening.id}`}>
                  How many
                </label>
                <input
                  id={`bgc-q-${opening.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={opening.quantity}
                  onChange={(e) => updateOpening(opening.id, "quantity", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeOpening(opening.id)}
                disabled={openings.length <= 1}
                aria-label={`Remove opening ${index + 1}`}
                className={`${GHOST_BTN} w-full sm:w-auto disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove opening</span>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addOpening} className={`${GHOST_BTN} mt-4`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add an opening
        </button>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Section and spacing
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="bgc-material">
                Material
              </label>
              <select
                id="bgc-material"
                className={`mt-2 ${INPUT_CLASS}`}
                value={values.material}
                onChange={set("material")}
              >
                {MATERIALS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="bgc-shape">
                Bar shape
              </label>
              <select
                id="bgc-shape"
                className={`mt-2 ${INPUT_CLASS}`}
                value={values.shape}
                onChange={set("shape")}
              >
                {BAR_SHAPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {sectionFields.map(([id, label, key, step]) => (
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
                  value={values[key]}
                  onChange={set(key)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            How it is quoted
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="bgc-mode">
                Pricing method
              </label>
              <select
                id="bgc-mode"
                className={`mt-2 ${INPUT_CLASS}`}
                value={values.mode}
                onChange={set("mode")}
              >
                <option value="weight">By fabricated weight (₹ per kg)</option>
                <option value="area">By grill area (₹ per sq ft)</option>
              </select>
            </div>
            {priceFields.map(([id, label, key, step]) => (
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
                  value={values[key]}
                  onChange={set(key)}
                />
              </div>
            ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total grill cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `${num1(result.totalAreaSqft)} sq ft, about ${num2(result.totalWeightKg)} kg of metal, ${money2(result.costPerSqft)} per sq ft`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy grill cost estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className={`mt-4 rounded-md px-3 py-2 text-sm ${
                note.includes(`above the ${MAX_SAFE_GAP_MM} mm`)
                  ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {note}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </dd>
          </div>
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            Opening by opening
          </h2>
          <table className="mt-3 w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Size (ft)
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Qty
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Area
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Bars
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Clear gap
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Weight each
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {result.detail.map((d) => (
                <tr key={d.index}>
                  <td className="py-2.5 pr-3">
                    {num2(d.widthFt)} x {num2(d.heightFt)}
                  </td>
                  <td className="py-2.5 pr-3 text-right">{d.quantity}</td>
                  <td className="py-2.5 pr-3 text-right">{num1(d.areaTotalSqft)} sq ft</td>
                  <td className="py-2.5 pr-3 text-right">{d.barCount}</td>
                  <td
                    className={`py-2.5 pr-3 text-right font-semibold ${
                      d.clearGapMm > MAX_SAFE_GAP_MM ? "text-[var(--danger)]" : ""
                    }`}
                  >
                    {num1(d.clearGapMm)} mm
                  </td>
                  <td className="py-2.5 text-right">{num2(d.weightPerUnit)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Weights are calculated from the nominal section and standard densities; a fabricator's
        weighbridge figure will differ slightly with mill tolerance and weld metal. The clear-gap
        check is a general safety guideline for balcony infill — for a new build or a structural
        guard, follow the building code and the approved drawing rather than this estimate.
      </p>
    </main>
  );
}
