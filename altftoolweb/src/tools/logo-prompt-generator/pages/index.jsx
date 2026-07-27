"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shapes } from "lucide-react";

import {
  CONSTRUCTIONS,
  MARK_TYPES,
  PALETTE_STRATEGIES,
  SHAPE_LANGUAGES,
  STYLE_ERAS,
  buildLogoPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  brand: "Northwind",
  industry: "weather analytics",
  markTypeId: "combination",
  shapeId: "geometric",
  paletteId: "accent",
  styleId: "techmin",
  constructionId: "grid8",
  motif: "",
  negativeSpaceTrick: false,
  smallestPx: "32",
  printHeightMm: "10",
  dpi: "300",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      buildLogoPrompt({
        brand: form.brand,
        industry: form.industry,
        markTypeId: form.markTypeId,
        shapeId: form.shapeId,
        paletteId: form.paletteId,
        styleId: form.styleId,
        constructionId: form.constructionId,
        motif: form.motif,
        negativeSpaceTrick: form.negativeSpaceTrick,
        smallestPx: form.smallestPx.trim() === "" ? Number.NaN : Number(form.smallestPx),
        printHeightMm: form.printHeightMm.trim() === "" ? Number.NaN : Number(form.printHeightMm),
        dpi: form.dpi.trim() === "" ? Number.NaN : Number(form.dpi),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyText = hasError
    ? ""
    : `${result.prompt}\n\nNegative prompt: ${result.negativePrompt}\n\nTechnical brief:\n${result.technicalBrief.map((line) => `- ${line}`).join("\n")}`;

  const copyResult = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
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

  const specRows = hasError
    ? [
        ["Minimum stroke weight", DASH],
        ["Element budget", DASH],
        ["Clear space", DASH],
        ["Print raster height", DASH],
      ]
    : [
        [
          "Minimum stroke weight",
          `${NUM.format(result.specs.minStrokePct)}% of height (${NUM.format(result.specs.minStrokePxAtDisplay)} px at ${result.specs.displayPx} px)`,
        ],
        [
          "Element budget",
          `${result.specs.maxElements} shapes${result.specs.elementBudgetCapped ? " (capped)" : ""}`,
        ],
        ["Clear space", `${NUM.format(result.specs.clearSpacePx)} px per side at ${result.specs.displayPx} px`],
        [
          "Print raster height",
          `${NUM.format(result.specs.printPx)} px for ${NUM.format(result.specs.printHeightMm)} mm at ${result.specs.dpi} dpi`,
        ],
        ["Favicon test sizes", result.specs.faviconSizes.map((s) => `${s} px`).join(", ")],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Shapes className="h-4 w-4" aria-hidden="true" />
          Image prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Logo Prompt Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose an AI logo prompt from mark type, shape language and palette strategy — and get
          the stroke-weight, element-budget and clear-space limits your mark must survive, computed
          from the smallest size it will be reproduced at.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-brand">
              Brand name
            </label>
            <input
              id="lp-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={80}
              value={form.brand}
              onChange={set("brand")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-industry">
              Industry (optional)
            </label>
            <input
              id="lp-industry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.industry}
              onChange={set("industry")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-mark">
              Mark type
            </label>
            <select id="lp-mark" className={`mt-2 ${INPUT_CLASS}`} value={form.markTypeId} onChange={set("markTypeId")}>
              {MARK_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-shape">
              Shape language
            </label>
            <select id="lp-shape" className={`mt-2 ${INPUT_CLASS}`} value={form.shapeId} onChange={set("shapeId")}>
              {SHAPE_LANGUAGES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-palette">
              Palette strategy
            </label>
            <select id="lp-palette" className={`mt-2 ${INPUT_CLASS}`} value={form.paletteId} onChange={set("paletteId")}>
              {PALETTE_STRATEGIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-style">
              Style era
            </label>
            <select id="lp-style" className={`mt-2 ${INPUT_CLASS}`} value={form.styleId} onChange={set("styleId")}>
              {STYLE_ERAS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-construction">
              Construction grid
            </label>
            <select
              id="lp-construction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.constructionId}
              onChange={set("constructionId")}
            >
              {CONSTRUCTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-motif">
              Motif to build around (optional)
            </label>
            <input
              id="lp-motif"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. a paper plane"
              value={form.motif}
              onChange={set("motif")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-smallest">
              Smallest reproduction size (px)
            </label>
            <input
              id="lp-smallest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.smallestPx}
              onChange={set("smallestPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-print">
              Smallest print height (mm)
            </label>
            <input
              id="lp-print"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={form.printHeightMm}
              onChange={set("printHeightMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-dpi">
              Print resolution (dpi)
            </label>
            <input
              id="lp-dpi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="72"
              step="1"
              value={form.dpi}
              onChange={set("dpi")}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="lp-negspace"
        >
          <input
            id="lp-negspace"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={form.negativeSpaceTrick}
            onChange={set("negativeSpaceTrick")}
          />
          Hide a second form in the negative space (FedEx-arrow style)
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated prompt
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 text-sm leading-6">
              {hasError ? DASH : result.prompt}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Negative prompt
            </p>
            <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.negativePrompt}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the logo prompt, negative prompt and technical brief"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {specRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Design warnings</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            {result.mark.label}: when it works and what it risks
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">When to use it</dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{result.mark.whenToUse}</dd>
            </div>
            <div>
              <dt className="font-semibold">The trade-off</dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{result.mark.risk}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The reproduction limits are derived from raster physics — a feature narrower than one
        device pixel disappears — plus common brand-guide conventions. Always test the finished
        mark at real sizes before adopting it.
      </p>
    </main>
  );
}
