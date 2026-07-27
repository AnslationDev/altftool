"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HardHat, RotateCcw } from "lucide-react";

import {
  BRAND_SIZING,
  CM_PER_INCH,
  HELMET_SIZES,
  REPLACE_YEARS_FROM_FIRST_USE,
  REPLACE_YEARS_FROM_MANUFACTURE,
  findHelmetSize,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const DEFAULTS = {
  unit: "cm",
  circumference: "57",
  brand: "true",
  length: "19.5",
  breadth: "15.5",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [circumference, setCircumference] = useState(DEFAULTS.circumference);
  const [brand, setBrand] = useState(DEFAULTS.brand);
  const [length, setLength] = useState(DEFAULTS.length);
  const [breadth, setBreadth] = useState(DEFAULTS.breadth);
  const [copied, setCopied] = useState(false);

  const toCm = (raw) => {
    const value = toNumber(raw);
    if (!Number.isFinite(value)) return value;
    return unit === "in" ? value * CM_PER_INCH : value;
  };

  const result = useMemo(
    () =>
      findHelmetSize({
        circumferenceCm: toCm(circumference),
        brandSizing: brand,
        headLengthCm: toCm(length) || 0,
        headBreadthCm: toCm(breadth) || 0,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit, circumference, brand, length, breadth],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Helmet Size",
      `Head circumference: ${NUM1.format(result.circumferenceCm)} cm (${NUM.format(result.circumferenceMm)} mm)`,
      `Chart size: ${result.baseSize.label} (${result.baseSize.minCm}–${result.baseSize.maxCm} cm)`,
      `Recommended for this brand: ${result.recommended.label}`,
      result.borderline ? `Borderline — also try ${result.borderline.size.label}` : "Comfortably inside the band",
      result.shape
        ? `Head shape: ${result.shape.band.label} (cephalic index ${result.shape.index.toFixed(1)})`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    setUnit(DEFAULTS.unit);
    setCircumference(DEFAULTS.circumference);
    setBrand(DEFAULTS.brand);
    setLength(DEFAULTS.length);
    setBreadth(DEFAULTS.breadth);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Circumference used", DASH],
        ["Chart size", DASH],
        ["Size band", DASH],
        ["Position inside the band", DASH],
        ["Brand adjustment", DASH],
        ["Also worth trying", DASH],
        ["Head shape", DASH],
        ["Cross-check from length × breadth", DASH],
      ]
    : [
        [
          "Circumference used",
          `${NUM1.format(result.circumferenceCm)} cm · ${NUM.format(result.circumferenceMm)} mm`,
        ],
        ["Chart size", result.baseSize.label],
        ["Size band", `${result.baseSize.minCm}–${result.baseSize.maxCm} cm`],
        ["Position inside the band", `${NUM.format(result.positionInBandPct)}% of the way up`],
        [
          "Brand adjustment",
          result.shiftApplied ? `${result.sizing.label} → ${result.recommended.label}` : "none applied",
        ],
        [
          "Also worth trying",
          result.borderline
            ? `${result.borderline.size.label} (you are near the ${result.borderline.direction === "up" ? "top" : "bottom"} edge)`
            : "nothing — you are well inside the band",
        ],
        [
          "Head shape",
          result.shape
            ? `${result.shape.band.label} · index ${result.shape.index.toFixed(1)}`
            : "add length and breadth",
        ],
        [
          "Cross-check from length × breadth",
          result.estimatedCircumference !== null
            ? `${NUM1.format(result.estimatedCircumference)} cm (${result.estimateGap >= 0 ? "+" : ""}${NUM1.format(result.estimateGap)} cm)`
            : DASH,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HardHat className="h-4 w-4" aria-hidden="true" />
          Riding gear
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Helmet Size Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Size comes from one measurement, but fit comes from two. Enter your circumference for the
          size, and your head length and breadth to find the internal shape that will suit you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className={LABEL_CLASS}>Measurement unit</span>
            <div className="mt-2 flex gap-2">
              {[
                { id: "cm", label: "Centimetres" },
                { id: "in", label: "Inches" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={unit === option.id}
                  onClick={() => setUnit(option.id)}
                  className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    unit === option.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="helmet-circumference">
              Head circumference ({unit})
            </label>
            <input
              id="helmet-circumference"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step={unit === "cm" ? "0.1" : "0.05"}
              value={circumference}
              onChange={(event) => setCircumference(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Widest point, about 2.5 cm above the eyebrows.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="helmet-length">
              Head length, front to back ({unit})
            </label>
            <input
              id="helmet-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="helmet-breadth">
              Head breadth, side to side ({unit})
            </label>
            <input
              id="helmet-breadth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={breadth}
              onChange={(event) => setBreadth(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="helmet-brand">
              How this brand sizes
            </label>
            <select
              id="helmet-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
              {BRAND_SIZING.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Check the maker&apos;s own chart and owner reviews — sizing differs by up to a centimetre
              between brands.
            </p>
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
              Your helmet size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.recommended.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the measurement above to see a size."
                : `${result.recommended.minCm}–${result.recommended.maxCm} cm band${result.borderline ? ` · also try ${result.borderline.size.label}` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy helmet size result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Size chart
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Size
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Centimetres
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Inches
                </th>
              </tr>
            </thead>
            <tbody>
              {HELMET_SIZES.map((size) => {
                const isMatch = !hasError && size.id === result.recommended.id;
                return (
                  <tr
                    key={size.id}
                    className={`border-b border-[var(--border)] ${isMatch ? "bg-[var(--muted)] font-semibold" : ""}`}
                  >
                    <td className="py-2 pr-3">{size.label}</td>
                    <td className="py-2 pr-3 text-right">
                      {size.minCm}–{size.maxCm}
                    </td>
                    <td className="py-2 text-right">
                      {(size.minCm / CM_PER_INCH).toFixed(1)}–{(size.maxCm / CM_PER_INCH).toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance — buy a helmet you have tried on. In India a two-wheeler helmet must
        carry the ISI mark to IS 4151; replace it after any impact, and otherwise about{" "}
        {REPLACE_YEARS_FROM_FIRST_USE} years from first use or {REPLACE_YEARS_FROM_MANUFACTURE} years
        from the manufacturing date moulded into the shell, whichever comes first.
      </p>
    </main>
  );
}
