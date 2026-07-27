"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Newspaper, RotateCcw } from "lucide-react";

import {
  EDITORIAL_PAIRINGS,
  MEASURE_IDEAL_CPL,
  MEASURE_MAX_CPL,
  MEASURE_MIN_CPL,
  TYPE_SCALE_RATIOS,
  buildCss,
  buildSummary,
  computeEditorialType,
  googleFontsHref,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  pairingId: "spectral-inter",
  ratioId: "major-third",
  basePx: "18",
  containerPx: "640",
  columns: "1",
  gutterPx: "32",
  headingStep: "4",
  headline: "The quiet economics of a small print run",
  body:
    "Typography is the craft of endowing human language with a durable visual form. A magazine spread earns its authority in the details: a measure that lets the eye return without effort, leading that keeps the column even in colour, and a headline scale that signals importance before a single word is read.",
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

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [loadFonts, setLoadFonts] = useState(false);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeEditorialType({
        pairingId: form.pairingId,
        ratioId: form.ratioId,
        basePx: Number(form.basePx),
        containerPx: Number(form.containerPx),
        columns: Number(form.columns),
        gutterPx: Number(form.gutterPx),
        headingStep: Number(form.headingStep),
      }),
    [form],
  );

  const activePairing = useMemo(
    () => EDITORIAL_PAIRINGS.find((item) => item.id === form.pairingId) ?? EDITORIAL_PAIRINGS[0],
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
  const verdictClass = hasError
    ? ""
    : result.verdict.level === "ok"
      ? "text-[var(--success)]"
      : "text-[var(--danger)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Newspaper className="h-4 w-4" aria-hidden="true" />
          Editorial type
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Editorial Vibe Font Pairing
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight magazine-style Google Font pairings, each sized with a modular scale and checked
          against the 45–75 character measure guideline. Copy the CSS when the column reads right.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. Pick a pairing</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EDITORIAL_PAIRINGS.map((item) => {
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
                  {item.heading.family} + {item.body.family}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{activePairing.note}</p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Set the page</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-base">
              Body size (px)
            </label>
            <input
              id="ed-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="36"
              step="0.5"
              value={form.basePx}
              onChange={setField("basePx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-ratio">
              Scale ratio
            </label>
            <select
              id="ed-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.ratioId}
              onChange={setField("ratioId")}
            >
              {TYPE_SCALE_RATIOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.ratio}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-container">
              Content width (px)
            </label>
            <input
              id="ed-container"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="240"
              max="2400"
              step="10"
              value={form.containerPx}
              onChange={setField("containerPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-columns">
              Columns
            </label>
            <input
              id="ed-columns"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={form.columns}
              onChange={setField("columns")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-gutter">
              Gutter between columns (px)
            </label>
            <input
              id="ed-gutter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="240"
              step="4"
              value={form.gutterPx}
              onChange={setField("gutterPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-step">
              Headline step on the scale
            </label>
            <input
              id="ed-step"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={form.headingStep}
              onChange={setField("headingStep")}
            />
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
              Measure (characters per line)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : num(result.charsPerLine)}
            </p>
            <p className={`mt-1 text-sm ${verdictClass}`}>
              {hasError ? dash : result.verdict.text}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the pairing and layout result"
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
              "Heading face",
              hasError ? dash : `${result.pairing.heading.family} ${result.pairing.heading.weight}`,
            ],
            [
              "Body face",
              hasError ? dash : `${result.pairing.body.family} ${result.pairing.body.weight}`,
            ],
            [
              "Headline size",
              hasError ? dash : `${num(result.headingPx)}px / ${result.headingRem}rem`,
            ],
            ["Headline line-height", hasError ? dash : `${result.headingLineHeight}`],
            [
              "Body line-height",
              hasError ? dash : `${result.bodyLineHeight} (${num(result.bodyLeadingPx)}px)`,
            ],
            ["Column width", hasError ? dash : `${num(result.columnPx)}px`],
            [
              `Column for a ${MEASURE_IDEAL_CPL}-character measure`,
              hasError ? dash : `${num(result.idealColumnPx)}px / ${result.idealColumnRem}rem`,
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
          <h2 className="text-base font-semibold">Live preview</h2>
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
          Off by default the preview uses whatever is installed on your device and falls back to a
          system face. Ticking the box fetches the two families from fonts.googleapis.com.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-headline">
              Sample headline
            </label>
            <input
              id="ed-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.headline}
              onChange={setField("headline")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ed-body">
              Sample body copy
            </label>
            <textarea
              id="ed-body"
              rows={3}
              className={`mt-2 ${AREA_CLASS}`}
              value={form.body}
              onChange={setField("body")}
            />
          </div>
        </div>

        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {dash} Fix the values above to see the preview.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <div style={{ maxWidth: `${result.columnPx}px` }}>
              <p
                style={{
                  fontFamily: result.pairing.heading.stack,
                  fontWeight: result.pairing.heading.weight,
                  fontSize: `${result.headingPx}px`,
                  lineHeight: result.headingLineHeight,
                }}
              >
                {form.headline}
              </p>
              <p
                className="mt-4"
                style={{
                  fontFamily: result.pairing.body.stack,
                  fontWeight: result.pairing.body.weight,
                  fontSize: `${result.basePx}px`,
                  lineHeight: result.bodyLineHeight,
                }}
              >
                {form.body}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Type scale</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Step
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  px
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  rem
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Line-height
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={5}>
                    {dash}
                  </td>
                </tr>
              ) : (
                result.steps.map((row) => (
                  <tr key={row.step} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.step > 0 ? `+${row.step}` : row.step}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.role}</td>
                    <td className="py-2 pr-3 text-right">{num(row.px)}</td>
                    <td className="py-2 pr-3 text-right">{row.rem}</td>
                    <td className="py-2 text-right">{row.lineHeight}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
        Character counts are estimated from an average glyph advance per type classification, so a
        very narrow or very wide face will differ by a few characters. The {MEASURE_MIN_CPL}–
        {MEASURE_MAX_CPL} character band is a readability guideline for continuous text, not a rule
        for captions, tables or headlines. Check the licence of each family before shipping.
      </p>
    </main>
  );
}
