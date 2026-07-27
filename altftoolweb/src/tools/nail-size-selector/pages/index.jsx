"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hammer, RotateCcw } from "lucide-react";

import {
  COMMON_NAILS,
  FULL_PENETRATION_DIAMETERS,
  IRC_SCHEDULE,
  MM_PER_INCH,
  SHEATHING_FIELD_SPACING_MM,
  TASKS,
  TRIM_NAILS,
  selectNail,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const mm0 = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} mm` : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const inches = (v) => (Number.isFinite(v) ? `${String(Number(v.toFixed(2)))} in` : DASH);

const DEFAULTS = {
  task: "framing",
  top: "19",
  base: "38",
  spacing: "150",
  run: "2.4",
  rows: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [task, setTask] = useState(DEFAULTS.task);
  const [top, setTop] = useState(DEFAULTS.top);
  const [base, setBase] = useState(DEFAULTS.base);
  const [spacing, setSpacing] = useState(DEFAULTS.spacing);
  const [run, setRun] = useState(DEFAULTS.run);
  const [rows, setRows] = useState(DEFAULTS.rows);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      selectNail({
        task,
        topThicknessMm: toNumber(top),
        baseThicknessMm: toNumber(base),
        spacingMm: toNumber(spacing),
        runLengthM: toNumber(run),
        rows: toNumber(rows),
      }),
    [task, top, base, spacing, run, rows],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const head = result.trim
      ? `Nail: ${result.gaugeChoice.gauge}, ${inches(result.lengthIn)} (${mm0(result.lengthMm)})`
      : `Nail: ${result.nail.penny} common, ${inches(result.lengthIn)} (${mm0(result.lengthMm)}), ${result.nail.gauge} gauge`;
    return [
      "Nail Size Selector",
      `Task: ${TASKS.find((entry) => entry.id === task).label}`,
      `Fastening ${top} mm into ${base} mm`,
      head,
      `Penetration into the base: ${mm0(result.penetrationMm)} = ${num1(result.penetrationDiameters)} shank diameters`,
      `Spacing ${result.spacingMm} mm, ${result.nailsPerRow} per row, ${result.totalNails} nails total`,
      result.verdict,
    ].join("\n");
  }, [failed, result, task, top, base]);

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
    setTask(DEFAULTS.task);
    setTop(DEFAULTS.top);
    setBase(DEFAULTS.base);
    setSpacing(DEFAULTS.spacing);
    setRun(DEFAULTS.run);
    setRows(DEFAULTS.rows);
    setCopied(false);
  };

  const rowsOut = failed
    ? []
    : [
        ["Nail length", `${inches(result.lengthIn)} (${mm0(result.lengthMm)})`],
        [
          "Shank diameter",
          result.trim
            ? `${result.gaugeChoice.diaIn} in`
            : `${result.nail.diaIn} in (${result.nail.gauge} gauge)`,
        ],
        ["Penetration into the base", mm0(result.penetrationMm)],
        ["That is, in shank diameters", `${num1(result.penetrationDiameters)}×`],
        [
          "Full lateral value needs",
          `${FULL_PENETRATION_DIAMETERS}× — ${result.trim || result.meetsFullValue ? "met" : "not met"}`,
        ],
        ["Rule-of-thumb length (3× the board)", result.trim ? DASH : mm0(result.ruleOfThumbMm)],
        ["Spacing used", mm0(result.spacingMm)],
        ["Nails per row", NUM0.format(result.nailsPerRow)],
        ["Total nails", NUM0.format(result.totalNails)],
        [
          "Field spacing (sheathing)",
          result.fieldSpacingMm ? mm0(result.fieldSpacingMm) : DASH,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hammer className="h-4 w-4" aria-hidden="true" />
          Fasteners
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Nail Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A nail is sized by how far it reaches into the piece underneath. The wood design code puts
          a number on that: {FULL_PENETRATION_DIAMETERS} shank diameters into the main member for
          the full lateral value, 6 for anything at all.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ns-task">
              What are you nailing?
            </label>
            <select
              id="ns-task"
              className={`mt-2 ${INPUT_CLASS}`}
              value={task}
              onChange={(event) => setTask(event.target.value)}
            >
              {TASKS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{TASKS.find((entry) => entry.id === task).note}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ns-top">
              Thickness being fastened (mm)
            </label>
            <input
              id="ns-top"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={top}
              onChange={(event) => setTop(event.target.value)}
            />
            <p className={HINT_CLASS}>
              A nominal 2× is 38 mm actual; 19 mm is nominal 1× board; sheathing is 12 or 18 mm.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ns-base">
              Thickness receiving the nail (mm)
            </label>
            <input
              id="ns-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={base}
              onChange={(event) => setBase(event.target.value)}
            />
            <p className={HINT_CLASS}>Used to check the point does not come out the far side.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ns-spacing">
              Nail spacing (mm)
            </label>
            <input
              id="ns-spacing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={spacing}
              onChange={(event) => setSpacing(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Sheathing edges are capped at 150 mm; the field is {SHEATHING_FIELD_SPACING_MM} mm.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ns-run">
              Run length (m)
            </label>
            <input
              id="ns-run"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={run}
              onChange={(event) => setRun(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ns-rows">
              Rows or lines of nails
            </label>
            <input
              id="ns-rows"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={rows}
              onChange={(event) => setRows(event.target.value)}
            />
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
              Use this nail
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the thicknesses above."
                : `${mm0(result.lengthMm)} long, reaching ${mm0(result.penetrationMm)} into the base`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the nail specification"
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

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.protrudes || (!result.trim && !result.meetsFullValue)
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : "bg-[var(--success-soft)] text-[var(--success)]"
            }`}
          >
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed ? [["Result", DASH]] : rowsOut).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Common nail sizes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          From 2d to 10d the length in inches is (d + 2) ÷ 4. Above that the series stops following
          the formula. Box nails share these lengths but use thinner wire, so they split dry stock
          less and hold less.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Size
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Length
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  mm
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Gauge
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Shank
                </th>
              </tr>
            </thead>
            <tbody>
              {COMMON_NAILS.filter((nail) => nail.stocked).map((nail) => (
                <tr key={nail.penny} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{nail.penny}</td>
                  <td className="py-2 pr-3">{nail.lengthIn} in</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {Math.round(nail.lengthIn * MM_PER_INCH)}
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{nail.gauge}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{nail.diaIn} in</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Trim nail gauges</h2>
        <ul className="mt-3 space-y-3">
          {TRIM_NAILS.map((entry) => (
            <li key={entry.gauge} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">{entry.gauge}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{entry.diaIn} in shank</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{entry.use}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Prescriptive framing schedule</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A working subset of IRC Table R602.3(1). Where a code schedule covers the connection, it
          governs over any rule of thumb.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Connection
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Nailing
                </th>
              </tr>
            </thead>
            <tbody>
              {IRC_SCHEDULE.map(([connection, nailing]) => (
                <tr key={connection} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 align-top font-semibold">{connection}</td>
                  <td className="py-2 align-top text-[var(--muted-foreground)]">{nailing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Penetration rules come from the National Design Specification for Wood Construction and the
        prescriptive schedule from the International Residential Code; both are US documents, and
        your local building code governs where it differs. Anything carrying structural load —
        shear walls, hold-downs, beam connections — should be specified by an engineer rather than
        by a rule of thumb.
      </p>
    </main>
  );
}
