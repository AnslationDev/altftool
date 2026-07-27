"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import {
  BOOK_TYPES,
  END_GAP_CM,
  SAG_LIMIT_RATIO,
  SHELF_MATERIALS,
  computeShelfCapacity,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";
const cm = (value) => (Number.isFinite(value) ? `${NUM.format(value)} cm` : DASH);
const kg = (value) => (Number.isFinite(value) ? `${NUM.format(value)} kg` : DASH);

const DEFAULTS = {
  span: "90",
  depth: "25",
  shelfCount: "5",
  thickness: "19",
  material: "plywood",
  bookType: "mixed",
  sagLimit: String(SAG_LIMIT_RATIO),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VERDICT_COPY = {
  "within-limit": "Within the sag limit for this material, thickness and load.",
  marginal: "Marginal — within about 15% of the maximum span, so expect a visible bow over time.",
  "over-span": "Over-spanned — this shelf will bow. Shorten the span, thicken the board or add a support.",
  unknown: "Not enough information to check sag.",
};

export default function ToolHome() {
  const [span, setSpan] = useState(DEFAULTS.span);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [shelfCount, setShelfCount] = useState(DEFAULTS.shelfCount);
  const [thickness, setThickness] = useState(DEFAULTS.thickness);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [bookType, setBookType] = useState(DEFAULTS.bookType);
  const [sagLimit, setSagLimit] = useState(DEFAULTS.sagLimit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeShelfCapacity({
        spanCm: span.trim() === "" ? NaN : Number(span),
        shelfDepthCm: depth.trim() === "" ? NaN : Number(depth),
        shelfCount: shelfCount.trim() === "" ? NaN : Number(shelfCount),
        thicknessMm: thickness.trim() === "" ? NaN : Number(thickness),
        materialId: material,
        bookTypeId: bookType,
        sagLimit: sagLimit.trim() === "" ? NaN : Number(sagLimit),
      }),
    [span, depth, shelfCount, thickness, material, bookType, sagLimit],
  );

  const error = result.error || null;

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Bookshelf Capacity",
      `Shelf: ${span} cm span × ${depth} cm deep, ${thickness} mm ${result.materialLabel}`,
      `Books: ${result.bookLabel}, ${NUM.format(result.spineCm)} cm spine, ${NUM.format(result.bookWeightKg)} kg each`,
      `Books per shelf: ${result.booksPerShelf}`,
      `Total across ${result.shelfCount} shelves: ${result.totalBooks} books`,
      `Load per shelf: ${NUM.format(result.loadPerShelfKg)} kg (${NUM.format(result.linearDensityKgPerM)} kg per metre of shelf)`,
      `Total load on the unit: ${NUM.format(result.totalLoadKg)} kg`,
      `Predicted sag: ${NUM.format(result.sagMm)} mm (span/${result.sagRatio})`,
      `Maximum span at the span/${sagLimit} limit: ${NUM.format(result.maxSpanCm)} cm`,
    ].join("\n");
  }, [error, result, span, depth, thickness, sagLimit]);

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
    setSpan(DEFAULTS.span);
    setDepth(DEFAULTS.depth);
    setShelfCount(DEFAULTS.shelfCount);
    setThickness(DEFAULTS.thickness);
    setMaterial(DEFAULTS.material);
    setBookType(DEFAULTS.bookType);
    setSagLimit(DEFAULTS.sagLimit);
    setCopied(false);
  };

  const verdictTone =
    error || result.verdict === "within-limit" ? "text-[var(--success)]" : "text-[var(--danger)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Shelving
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Bookshelf Capacity Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Counts the books a shelf holds from average spine thickness, converts that to a load in
          kilograms, and checks the span against the beam-deflection sag limit for your board.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-span">
              Clear span between supports (cm)
            </label>
            <input
              id="bs-span"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="400"
              step="1"
              value={span}
              onChange={(event) => setSpan(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-depth">
              Shelf depth (cm)
            </label>
            <input
              id="bs-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={depth}
              onChange={(event) => setDepth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-thickness">
              Board thickness (mm)
            </label>
            <input
              id="bs-thickness"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="3"
              max="100"
              step="1"
              value={thickness}
              onChange={(event) => setThickness(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-count">
              Number of shelves
            </label>
            <input
              id="bs-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={shelfCount}
              onChange={(event) => setShelfCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-material">
              Shelf material
            </label>
            <select
              id="bs-material"
              className={`mt-2 ${INPUT_CLASS}`}
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
            >
              {SHELF_MATERIALS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-books">
              What is going on it
            </label>
            <select
              id="bs-books"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bookType}
              onChange={(event) => setBookType(event.target.value)}
            >
              {BOOK_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bs-sag">
              Allowable sag: span divided by
            </label>
            <input
              id="bs-sag"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="60"
              max="1000"
              step="10"
              value={sagLimit}
              onChange={(event) => setSagLimit(event.target.value)}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              180 is the accepted shelving limit; use 360 if you want no visible bow at all.
            </p>
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Books per shelf
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : NUM0.format(result.booksPerShelf)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? DASH
                : `${NUM0.format(result.totalBooks)} books across ${result.shelfCount} shelves`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy bookshelf capacity result"
              className={GHOST_BTN}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Usable span after end gap", error ? DASH : cm(result.usableSpanCm)],
            ["Load on one shelf", error ? DASH : kg(result.loadPerShelfKg)],
            ["Total load on the unit", error ? DASH : kg(result.totalLoadKg)],
            [
              "Book density",
              error ? DASH : `${NUM.format(result.linearDensityKgPerM)} kg per metre of shelf`,
            ],
            ["Recommended shelf depth", error ? DASH : cm(result.recommendedDepthCm)],
            ["Clear height between shelves", error ? DASH : cm(result.recommendedClearHeightCm)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Will it sag?</h2>
        <p className={`mt-3 text-sm font-semibold ${verdictTone}`}>
          {error ? DASH : VERDICT_COPY[result.verdict]}
        </p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Predicted sag at mid-span", error ? DASH : `${NUM.format(result.sagMm)} mm`],
            ["Sag as a fraction of span", error || !result.sagRatio ? DASH : `span / ${NUM0.format(result.sagRatio)}`],
            ["Maximum span for this board", error ? DASH : cm(result.maxSpanCm)],
            ["Uniform load on the board", error ? DASH : `${NUM.format(result.loadNm2)} N/m²`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && result.notes.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sag is calculated for a simply supported board carrying a uniform load, using long-term
        (creep-adjusted) stiffness values — real shelves also depend on how the ends are fixed, on a
        back panel or edge lipping, and on humidity. An {END_GAP_CM} cm gap is left at the end of each
        shelf so books can be pulled out. Treat the numbers as a design check, not a structural
        certificate.
      </p>
    </main>
  );
}
