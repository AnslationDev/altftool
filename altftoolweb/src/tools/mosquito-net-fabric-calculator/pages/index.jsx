"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grid2x2, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_ALLOWANCE_INCHES,
  MESH_GRADES,
  ROLL_WIDTHS,
  estimateMosquitoNet,
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

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULT_OPENINGS = [
  { id: 1, width: "4", height: "3", quantity: "2" },
  { id: 2, width: "3", height: "7", quantity: "1" },
];

const DEFAULTS = {
  roll: "4",
  grade: "16",
  allowance: String(DEFAULT_ALLOWANCE_INCHES),
  meshRate: "45",
  frameRate: "65",
  tapeRate: "25",
  stiffeners: "0",
  hardware: "120",
  labour: "150",
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

  const rollWidthFt =
    (ROLL_WIDTHS.find((r) => r.value === values.roll) ?? ROLL_WIDTHS[1]).widthFt;

  const result = useMemo(
    () =>
      estimateMosquitoNet({
        openings: openings.map((o) => ({
          widthFt: toNum(o.width),
          heightFt: toNum(o.height),
          quantity: toNum(o.quantity),
        })),
        allowanceInches: toNum(values.allowance),
        rollWidthFt,
        meshGrade: values.grade,
        meshRatePerFoot: toNum(values.meshRate),
        frameRatePerFoot: toNum(values.frameRate),
        tapeRatePerFoot: toNum(values.tapeRate),
        stiffenersPerOpening: toNum(values.stiffeners),
        hardwarePerOpening: toNum(values.hardware),
        labourPerOpening: toNum(values.labour),
      }),
    [openings, values, rollWidthFt],
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
        ["Mesh to buy", DASH],
        ["Mesh in metres", DASH],
        ["Frame section", DASH],
        ["Fixing tape or magnetic strip", DASH],
        ["Openings covered", DASH],
        ["Total opening area", DASH],
        ["Joints needed", DASH],
        ["Mesh actually over an opening", DASH],
        ["Mesh", DASH],
        ["Frame section cost", DASH],
        ["Fixing tape cost", DASH],
        ["Hardware", DASH],
        ["Fitting labour", DASH],
        ["Cost per square foot", DASH],
        ["Cost per opening", DASH],
      ]
    : [
        ["Mesh to buy", `${num2(result.totalMeshFeet)} running ft`],
        ["Mesh in metres", `${num2(result.totalMeshMetres)} m`],
        ["Frame section", `${num2(result.totalFrameFeet)} ft`],
        ["Fixing tape or magnetic strip", `${num2(result.totalTapeFeet)} ft`],
        ["Openings covered", `${result.totalUnits}`],
        ["Total opening area", `${num1(result.totalAreaSqft)} sq ft`],
        ["Joints needed", `${result.totalSeams}`],
        ["Mesh actually over an opening", `${num1(result.meshUtilisationPct)}%`],
        ...result.items.map(([label, value]) => [label, money(value)]),
        ["Cost per square foot", money2(result.costPerSqft)],
        ["Cost per opening", money2(result.costPerOpening)],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Mosquito Net Fabric Calculator",
      `Buy ${num2(result.totalMeshFeet)} running feet (${num2(result.totalMeshMetres)} m) of mesh — total ${money(result.total)}`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      "",
      ...result.detail.map(
        (d) =>
          `Opening ${d.index}: ${d.widthFt} x ${d.heightFt} ft x ${d.quantity} — cut ${d.orientation}, ${d.panels} panel(s), ${num2(d.meshFeetEach)} ft each`,
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

  const materialFields = [
    ["mnf-allowance", "Hem allowance added to each side (inches)", "allowance", "0.5"],
    ["mnf-stiffeners", "Stiffener bars per opening", "stiffeners", "1"],
    ["mnf-meshrate", "Mesh rate (₹ per running ft)", "meshRate", "5"],
    ["mnf-framerate", "Frame section (₹ per ft)", "frameRate", "5"],
    ["mnf-taperate", "Fixing tape or magnetic strip (₹ per ft)", "tapeRate", "5"],
    ["mnf-hardware", "Hardware per opening (₹)", "hardware", "10"],
    ["mnf-labour", "Fitting labour per opening (₹)", "labour", "10"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Grid2x2 className="h-4 w-4" aria-hidden="true" />
          Insect screening
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mosquito Net Fabric Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Mesh comes off a roll of fixed width, so what you need is a cutting plan. Turning a
          panel sideways often saves a joint — and a joint is where the mosquitoes get in.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
          Windows and doors to cover
        </h2>
        <div className="mt-3 grid gap-4">
          {openings.map((opening, index) => (
            <div
              key={opening.id}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`mnf-w-${opening.id}`}>
                  Opening {index + 1} width (ft)
                </label>
                <input
                  id={`mnf-w-${opening.id}`}
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
                <label className={LABEL_CLASS} htmlFor={`mnf-h-${opening.id}`}>
                  Height (ft)
                </label>
                <input
                  id={`mnf-h-${opening.id}`}
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
                <label className={LABEL_CLASS} htmlFor={`mnf-q-${opening.id}`}>
                  How many
                </label>
                <input
                  id={`mnf-q-${opening.id}`}
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
            Mesh and materials
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="mnf-roll">
                Roll width
              </label>
              <select
                id="mnf-roll"
                className={`mt-2 ${INPUT_CLASS}`}
                value={values.roll}
                onChange={set("roll")}
              >
                {ROLL_WIDTHS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="mnf-grade">
                Mesh grade
              </label>
              <select
                id="mnf-grade"
                className={`mt-2 ${INPUT_CLASS}`}
                value={values.grade}
                onChange={set("grade")}
              >
                {MESH_GRADES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {materialFields.map(([id, label, key, step]) => (
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
              Mesh to buy off the roll
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${num2(result.totalMeshFeet)} ft`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the cutting plan."
                : `${num2(result.totalMeshMetres)} m of ${num2(result.rollWidthFt)} ft roll — ${money(result.total)} for the whole job`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy mosquito net material list"
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
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
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
            Cutting plan
          </h2>
          <table className="mt-3 w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Size (ft)
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Qty
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Cut
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Panels
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Mesh each
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Frame each
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
                  <td className="py-2.5 pr-3">{d.orientation}</td>
                  <td
                    className={`py-2.5 pr-3 text-right ${
                      d.panels > 1 ? "font-semibold text-[var(--danger)]" : ""
                    }`}
                  >
                    {d.panels}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold">
                    {num2(d.meshFeetEach)} ft
                  </td>
                  <td className="py-2.5 text-right">{num2(d.frameFtEach)} ft</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Measure the opening the net will cover, not the glass — velcro and magnetic nets fix to
        the frame or the reveal, so the fixing surface sets the size. Rates for mesh, aluminium
        section and tape vary by grade and city; replace the defaults with the shop's figures
        before treating the total as a budget.
      </p>
    </main>
  );
}
