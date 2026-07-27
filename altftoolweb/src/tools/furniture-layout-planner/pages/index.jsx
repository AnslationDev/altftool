"use client";

import { useMemo, useState } from "react";
import { Armchair, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CLEARANCES,
  DEFAULT_PIECES,
  FURNITURE_CATALOGUE,
  MAX_FURNITURE_DENSITY,
  MAX_PIECES,
  analyseLayout,
  formatLength,
  tvSeatingDistance,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  lengthCm: "427",
  widthCm: "366",
  doorways: "1",
  tvInches: "55",
};

const GROUPS = [...new Set(Object.values(FURNITURE_CATALOGUE).map((meta) => meta.group))];

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

let rowCounter = 0;
const nextKey = (type) => {
  rowCounter += 1;
  return `${type}-${rowCounter}`;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [rows, setRows] = useState(() => DEFAULT_PIECES.map((piece) => ({ ...piece, key: nextKey(piece.type) })));
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const updateRow = (key, patch) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    setCopied(false);
  };

  const addRow = () => {
    setRows((prev) => (prev.length >= MAX_PIECES ? prev : [...prev, { key: nextKey("armchair"), type: "armchair", quantity: 1 }]));
    setCopied(false);
  };

  const removeRow = (key) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
    setCopied(false);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setRows(DEFAULT_PIECES.map((piece) => ({ ...piece, key: nextKey(piece.type) })));
    setCopied(false);
  };

  const lengthCm = toNumber(form.lengthCm);
  const widthCm = toNumber(form.widthCm);

  const result = useMemo(
    () =>
      analyseLayout({
        lengthCm,
        widthCm,
        doorways: toNumber(form.doorways),
        pieces: rows.map((row) => ({ key: row.key, type: row.type, quantity: toNumber(row.quantity) })),
      }),
    [lengthCm, widthCm, form.doorways, rows],
  );

  const tv = useMemo(() => tvSeatingDistance(toNumber(form.tvInches)), [form.tvInches]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Furniture Layout Plan",
      `Room: ${formatLength(result.room.widthCm)} x ${formatLength(result.room.lengthCm)} = ${result.room.areaSqM} sq m (${result.room.areaSqFt} sq ft)`,
      `Furniture footprint: ${result.footprintSqM} sq m across ${result.totalUnits} pieces`,
      `Floor covered: ${result.densityPercent}% (guideline: under ${Math.round(MAX_FURNITURE_DENSITY * 100)}%)`,
      `Free floor: ${result.freeSqM} sq m (${result.freePercent}%)`,
      `Wall length used: ${result.layout.usedWallCm} cm of ${result.room.perimeterCm} cm`,
      ...result.warnings.map((warning) => `Warning: ${warning}`),
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

  const plan = hasError ? null : result.layout;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Armchair className="h-4 w-4" aria-hidden="true" />
          Room planner
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Furniture Layout Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the room size and the furniture you own. The planner adds up the real footprints,
          checks them against standard clearance rules, and draws a to-scale floor plan you can
          print.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Room</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="widthCm">
              Room width (cm)
            </label>
            <input
              id="widthCm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="3000"
              step="1"
              value={form.widthCm}
              onChange={setField("widthCm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lengthCm">
              Room length (cm)
            </label>
            <input
              id="lengthCm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="3000"
              step="1"
              value={form.lengthCm}
              onChange={setField("lengthCm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doorways">
              Doorways into the room
            </label>
            <input
              id="doorways"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="8"
              step="1"
              value={form.doorways}
              onChange={setField("doorways")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tvInches">
              TV screen diagonal (inches, optional)
            </label>
            <input
              id="tvInches"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={form.tvInches}
              onChange={setField("tvInches")}
            />
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Furniture</h2>
          <button type="button" onClick={addRow} className={GHOST_BTN} aria-label="Add another furniture row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add piece
          </button>
        </div>

        <ul className="mt-3 space-y-3">
          {rows.map((row, index) => (
            <li key={row.key} className="grid gap-3 sm:grid-cols-[1fr_7rem_auto]">
              <div>
                <label className="sr-only" htmlFor={`type-${row.key}`}>
                  Furniture type for row {index + 1}
                </label>
                <select
                  id={`type-${row.key}`}
                  className={INPUT_CLASS}
                  value={row.type}
                  onChange={(event) => updateRow(row.key, { type: event.target.value })}
                >
                  {GROUPS.map((group) => (
                    <optgroup key={group} label={group}>
                      {Object.entries(FURNITURE_CATALOGUE)
                        .filter(([, meta]) => meta.group === group)
                        .map(([key, meta]) => (
                          <option key={key} value={key}>
                            {meta.label} — {meta.width} x {meta.depth} cm
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="sr-only" htmlFor={`qty-${row.key}`}>
                  Quantity for row {index + 1}
                </label>
                <input
                  id={`qty-${row.key}`}
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="20"
                  step="1"
                  value={row.quantity}
                  onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                aria-label={`Remove ${FURNITURE_CATALOGUE[row.type]?.label ?? "piece"}`}
                className={`${GHOST_BTN} sm:w-11 sm:px-0`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Floor covered by furniture
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.densityPercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the room or furniture input to see the plan."
                : `${result.footprintSqM} sq m of ${result.room.areaSqM} sq m — keep it under ${Math.round(MAX_FURNITURE_DENSITY * 100)}%`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the layout summary to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Room area", hasError ? DASH : `${result.room.areaSqM} sq m (${result.room.areaSqFt} sq ft)`],
            ["Room size", hasError ? DASH : `${formatLength(widthCm)} x ${formatLength(lengthCm)}`],
            ["Pieces placed", hasError ? DASH : `${num(result.totalUnits)} (${result.layout.unplaced.length} not fitting a wall)`],
            ["Furniture footprint", hasError ? DASH : `${result.footprintSqM} sq m (${result.footprintSqFt} sq ft)`],
            ["Free floor left", hasError ? DASH : `${result.freeSqM} sq m (${result.freePercent}%)`],
            ["Room still has capacity for", hasError ? DASH : `${result.spareCapacitySqM} sq m of furniture`],
            ["Wall length used", hasError ? DASH : `${num(result.layout.usedWallCm)} cm of ${num(result.room.perimeterCm)} cm`],
            ["Clear gap down the middle", hasError ? DASH : `${num(result.layout.centreGap.lengthCm)} cm (needs ${CLEARANCES.mainWalkway} cm)`],
            ["Space doorways need", hasError ? DASH : `${result.doorwayZoneSqM} sq m`],
            [
              "TV seating distance",
              tv.error ? DASH : `${num(tv.minCm)}–${num(tv.maxCm)} cm from a ${tv.diagonalInches}" screen`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
        {!hasError && result.comfortable && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-semibold text-[var(--success)]">
            Every clearance rule is met — this layout has room to move.
          </p>
        )}
      </section>

      {plan && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Floor plan, drawn to scale</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Wall-hugging pieces are placed clockwise from the top-left corner. Use it as a starting
            arrangement, then move pieces to suit windows and doors.
          </p>
          <div className="mt-3 overflow-x-auto">
            <svg
              role="img"
              aria-label={`Floor plan of a ${widthCm} by ${lengthCm} centimetre room with ${result.totalUnits} pieces of furniture`}
              viewBox={`-10 -10 ${widthCm + 20} ${lengthCm + 20}`}
              className="h-auto w-full min-w-[280px] max-w-[520px]"
            >
              <rect
                x="0"
                y="0"
                width={widthCm}
                height={lengthCm}
                fill="var(--muted)"
                stroke="var(--foreground)"
                strokeWidth="4"
              />
              {plan.placed.map((piece) => (
                <g key={piece.key}>
                  <rect
                    x={piece.x}
                    y={piece.y}
                    width={piece.w}
                    height={piece.h}
                    fill="var(--primary)"
                    fillOpacity="0.25"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    rx="4"
                  />
                  <text
                    x={piece.x + piece.w / 2}
                    y={piece.y + piece.h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    fill="var(--foreground)"
                  >
                    {piece.label.split(" ")[0]}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Scale: the whole drawing is {num(widthCm)} cm wide by {num(lengthCm)} cm deep.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Clearances follow standard residential space planning: {CLEARANCES.mainWalkway} cm for a main
        walkway, {CLEARANCES.minorWalkway} cm beside a bed, {CLEARANCES.sofaToCoffeeTable} cm between
        a sofa and a coffee table, and {CLEARANCES.diningChairPullout} cm to pull a dining chair out.
        Measure your own room before buying — alcoves, radiators and door swings change what fits.
      </p>
    </main>
  );
}
