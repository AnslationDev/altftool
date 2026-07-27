"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Heart, RotateCcw } from "lucide-react";

import {
  CARD_SIZES,
  PRINT_DPI_OPTIONS,
  WEDDING_PAIRINGS,
  X_HEIGHT_BENCHMARK_MM,
  buildCss,
  buildSummary,
  computeWeddingType,
  googleFontsHref,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const int = (value) => INT.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  pairingId: "allura-cinzel-libre",
  cardId: "a6",
  marginMm: "12",
  bodyPt: "10",
  namesPt: "44",
  accentPt: "11",
  dpi: "300",
  xHeightOverride: "",
  names: "Aarav & Meera",
  accent: "Save the date",
  details:
    "Saturday, the fourteenth of February, two thousand and twenty-seven at half past six in the evening, The Old Courtyard, Bengaluru. Dinner and dancing to follow.",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const levelClass = (level) =>
  level === "ok" ? "text-[var(--success)]" : "text-[var(--danger)]";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [loadFonts, setLoadFonts] = useState(false);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeWeddingType({
        pairingId: form.pairingId,
        cardId: form.cardId,
        marginMm: Number(form.marginMm),
        bodyPt: Number(form.bodyPt),
        namesPt: Number(form.namesPt),
        accentPt: Number(form.accentPt),
        dpi: Number(form.dpi),
        xHeightOverride: form.xHeightOverride === "" ? NaN : Number(form.xHeightOverride),
      }),
    [form],
  );

  const activePairing = useMemo(
    () => WEDDING_PAIRINGS.find((item) => item.id === form.pairingId) ?? WEDDING_PAIRINGS[0],
    [form.pairingId],
  );
  const fontsHref = useMemo(() => googleFontsHref(activePairing), [activePairing]);
  const css = useMemo(() => buildCss(result), [result]);
  const summary = useMemo(() => buildSummary(result), [result]);

  useEffect(() => {
    if (!loadFonts || !fontsHref) return undefined;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontsHref;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [loadFonts, fontsHref]);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const hasError = Boolean(result.error);
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Heart className="h-4 w-4" aria-hidden="true" />
          Invitation type
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Wedding Font Pairing</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight script, caps and text-serif combinations for stationery — with the one check most
          invitation templates skip: how tall the letters actually are on paper, in millimetres.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. Pick a pairing</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {WEDDING_PAIRINGS.map((item) => {
            const active = item.id === form.pairingId;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setForm((prev) => ({ ...prev, pairingId: item.id }))}
                className={`min-h-11 rounded-md border px-3 py-2 text-left transition active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none motion-reduce:transform-none ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  {item.script.family} · {item.accent.family} · {item.body.family}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{activePairing.note}</p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Card, margins and sizes</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-card">
              Card size
            </label>
            <select
              id="wed-card"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.cardId}
              onChange={setField("cardId")}
            >
              {CARD_SIZES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.widthMm} × {item.heightMm} mm
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-margin">
              Margin (mm)
            </label>
            <input
              id="wed-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.marginMm}
              onChange={setField("marginMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-names">
              Names size (pt)
            </label>
            <input
              id="wed-names"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="200"
              step="1"
              value={form.namesPt}
              onChange={setField("namesPt")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-accent">
              Accent line size (pt)
            </label>
            <input
              id="wed-accent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="120"
              step="0.5"
              value={form.accentPt}
              onChange={setField("accentPt")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-body">
              Details size (pt)
            </label>
            <input
              id="wed-body"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="4"
              max="40"
              step="0.5"
              value={form.bodyPt}
              onChange={setField("bodyPt")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-dpi">
              Print resolution (dpi)
            </label>
            <select
              id="wed-dpi"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.dpi}
              onChange={setField("dpi")}
            >
              {PRINT_DPI_OPTIONS.map((item) => (
                <option key={item} value={String(item)}>
                  {item} dpi
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wed-xheight">
              x-height ratio override (optional, em)
            </label>
            <input
              id="wed-xheight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.2"
              max="0.7"
              step="0.01"
              placeholder={`Leave blank to use the representative value for ${activePairing.body.family}`}
              value={form.xHeightOverride}
              onChange={setField("xHeightOverride")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Measure your own font if you need precision: divide the height of a lowercase x by the
              point size.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Printed x-height of the details text
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${num(result.bodyXHeightMm)} mm`}
            </p>
            <p className={`mt-1 text-sm ${hasError ? "" : levelClass(result.legibility.level)}`}>
              {hasError ? dash : result.legibility.text}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the invitation typography result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied === "summary" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={() => setForm(DEFAULTS)}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Names x-height",
              hasError
                ? dash
                : `${num(result.namesXHeightMm)} mm (${result.pairing.script.family}, ${result.namesPt}pt)`,
            ],
            [
              "Accent x-height",
              hasError
                ? dash
                : `${num(result.accentXHeightMm)} mm (${result.pairing.accent.family}, ${result.accentPt}pt)`,
            ],
            [
              `Point size to reach ${X_HEIGHT_BENCHMARK_MM} mm`,
              hasError ? dash : `${num(result.bodyPtForBenchmark)} pt`,
            ],
            [
              "Text block",
              hasError ? dash : `${num(result.textWidthMm)} × ${num(result.textHeightMm)} mm`,
            ],
            [
              "Characters per line",
              hasError ? dash : `${num(result.charsPerLine)} — ${result.measure.text}`,
            ],
            [
              "Artwork canvas",
              hasError
                ? dash
                : `${int(result.canvasWidthPx)} × ${int(result.canvasHeightPx)} px at ${result.dpi} dpi`,
            ],
            [
              "Details size in pixels at that resolution",
              hasError ? dash : `${num(result.bodyPx)} px`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Preview at actual size</h2>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={loadFonts}
              onChange={(event) => setLoadFonts(event.target.checked)}
            />
            Load the real fonts
          </label>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Sizes below are rendered at 96 CSS pixels to the inch, so on a display at its native
          resolution this is roughly print size. Ticking the box fetches the families from
          fonts.googleapis.com.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-name-text">
              Names
            </label>
            <input
              id="wed-name-text"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.names}
              onChange={setField("names")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-accent-text">
              Accent line
            </label>
            <input
              id="wed-accent-text"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.accent}
              onChange={setField("accent")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wed-details-text">
              Details
            </label>
            <textarea
              id="wed-details-text"
              rows={3}
              className={`mt-2 ${AREA_CLASS}`}
              value={form.details}
              onChange={setField("details")}
            />
          </div>
        </div>

        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {dash} Fix the values above to see the preview.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <div
              className="rounded-md bg-[var(--background)] p-4 text-center ring-1 ring-[var(--border)]"
              style={{ width: `${result.previewCardWidthPx}px`, maxWidth: "100%" }}
            >
              <p
                style={{
                  fontFamily: result.pairing.accent.stack,
                  fontWeight: result.pairing.accent.weight,
                  fontSize: `${result.previewAccentPx}px`,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {form.accent}
              </p>
              <p
                className="mt-3"
                style={{
                  fontFamily: result.pairing.script.stack,
                  fontWeight: result.pairing.script.weight,
                  fontSize: `${result.previewNamesPx}px`,
                  lineHeight: 1.1,
                }}
              >
                {form.names}
              </p>
              <p
                className="mx-auto mt-3"
                style={{
                  fontFamily: result.pairing.body.stack,
                  fontWeight: result.pairing.body.weight,
                  fontSize: `${result.previewBodyPx}px`,
                  lineHeight: 1.5,
                  maxWidth: `${result.previewWidthPx}px`,
                }}
              >
                {form.details}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">CSS</h2>
          <button
            type="button"
            onClick={() => copy(css, "css")}
            aria-label="Copy the generated CSS"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied === "css" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "css" ? "Copied!" : "Copy CSS"}
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
          <pre className="text-xs leading-5 whitespace-pre text-[var(--foreground)]">
            {hasError ? dash : css}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        x-height ratios are representative values per type classification, not measured metrics for
        every family — override the ratio if you need exact figures. The {X_HEIGHT_BENCHMARK_MM} mm
        benchmark comes from the European Commission&apos;s readability guideline for medicine
        labelling and is used here only as a reference for comfortable printed text. Confirm bleed,
        minimum stroke width and foil tolerances with your printer, and check each family&apos;s
        licence before commercial use.
      </p>
    </main>
  );
}
