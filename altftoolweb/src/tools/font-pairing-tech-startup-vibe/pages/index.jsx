"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Rocket } from "lucide-react";

import {
  COMFORT_ARCMIN,
  MEASURE_MAX_CPL,
  MEASURE_MIN_CPL,
  TECH_PAIRINGS,
  TYPE_SCALE_RATIOS,
  buildCss,
  buildSummary,
  computeTechType,
  googleFontsHref,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  pairingId: "space-grotesk-inter",
  ratioId: "major-third",
  basePx: "16",
  gridPx: "4",
  contentWidthPx: "600",
  headingStep: "4",
  slideWidthPx: "1920",
  viewingDistanceM: "8",
  screenHeightM: "1.5",
  headline: "Ship your first workflow in under ten minutes",
  body:
    "Connect a source, pick a trigger and let the run history tell you what happened. Every step is logged, replayable and versioned, so an engineer can debug a Tuesday morning failure without waking anyone up.",
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
      computeTechType({
        pairingId: form.pairingId,
        ratioId: form.ratioId,
        basePx: Number(form.basePx),
        gridPx: Number(form.gridPx),
        contentWidthPx: Number(form.contentWidthPx),
        headingStep: Number(form.headingStep),
        slideWidthPx: Number(form.slideWidthPx),
        viewingDistanceM: Number(form.viewingDistanceM),
        screenHeightM: Number(form.screenHeightM),
      }),
    [form],
  );

  const activePairing = useMemo(
    () => TECH_PAIRINGS.find((item) => item.id === form.pairingId) ?? TECH_PAIRINGS[0],
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
          <Rocket className="h-4 w-4" aria-hidden="true" />
          Product type system
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Tech Startup Font Pairing
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight geometric and neo-grotesque Google Font trios — display, UI text and a monospace for
          numbers — sized on a modular scale, snapped to your baseline grid and checked against the
          room you present in.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. Pick a trio</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {TECH_PAIRINGS.map((item) => {
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
                  {item.heading.family} · {item.body.family} · {item.mono.family}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{activePairing.note}</p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Scale and grid</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tech-base">
              UI body size (px)
            </label>
            <input
              id="tech-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="32"
              step="1"
              value={form.basePx}
              onChange={setField("basePx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tech-ratio">
              Scale ratio
            </label>
            <select
              id="tech-ratio"
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
            <label className={LABEL_CLASS} htmlFor="tech-grid">
              Baseline grid (px)
            </label>
            <input
              id="tech-grid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="16"
              step="1"
              value={form.gridPx}
              onChange={setField("gridPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tech-step">
              Hero step on the scale
            </label>
            <input
              id="tech-step"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tech-width">
              Text container width (px)
            </label>
            <input
              id="tech-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="200"
              max="2400"
              step="10"
              value={form.contentWidthPx}
              onChange={setField("contentWidthPx")}
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
              Hero size on the grid
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${num(result.headingPx)}px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${result.headingRem}rem · line-height ${result.headingLineHeight} · ${num(result.headingLeadingPx)}px line box`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the type system result"
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
              "Display face",
              hasError ? dash : `${result.pairing.heading.family} ${result.pairing.heading.weight}`,
            ],
            [
              "UI text face",
              hasError ? dash : `${result.pairing.body.family} ${result.pairing.body.weight}`,
            ],
            ["Numbers / code face", hasError ? dash : result.pairing.mono.family],
            [
              "Body size and line box",
              hasError
                ? dash
                : `${num(result.basePx)}px / ${num(result.bodyLeadingPx)}px (line-height ${result.bodyLineHeight})`,
            ],
            [
              "Characters per line",
              hasError ? dash : `${num(result.charsPerLine)} — ${result.verdict.text}`,
            ],
            [
              "Container for a 66-character measure",
              hasError ? dash : `${num(result.idealContainerPx)}px`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.gridWarning ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.gridWarning}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">3. Will it read from the back of the room?</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          The same type reused on a slide is judged by angle, not pixels. A character has to subtend
          roughly {COMFORT_ARCMIN} minutes of arc at the viewer&apos;s eye to be comfortable to read.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="tech-slide">
              Slide width (px)
            </label>
            <input
              id="tech-slide"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="640"
              max="7680"
              step="10"
              value={form.slideWidthPx}
              onChange={setField("slideWidthPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tech-distance">
              Back row distance (m)
            </label>
            <input
              id="tech-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="60"
              step="0.5"
              value={form.viewingDistanceM}
              onChange={setField("viewingDistanceM")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tech-screen">
              Screen height (m)
            </label>
            <input
              id="tech-screen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.2"
              max="12"
              step="0.1"
              value={form.screenHeightM}
              onChange={setField("screenHeightM")}
            />
          </div>
        </div>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Slide artboard",
              hasError ? dash : `${num(result.slideWidthPx)} × ${num(result.slideHeightPx)} px (16:9)`,
            ],
            ["Body scaled to the slide", hasError ? dash : `${num(result.bodyOnSlidePx)}px`],
            ["Comfortable minimum for this room", hasError ? dash : `${num(result.minSlidePx)}px`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {hasError ? null : (
          <p
            className={`mt-3 text-sm font-medium ${
              result.slideOk ? "text-[var(--success)]" : "text-[var(--danger)]"
            }`}
          >
            {result.slideOk
              ? "Body copy clears the comfortable minimum at that distance."
              : "Body copy falls below the comfortable minimum — raise the slide type or move the back row closer."}
          </p>
        )}
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
          Off by default the preview falls back to a system face. Ticking the box fetches the three
          families from fonts.googleapis.com.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tech-headline">
              Sample headline
            </label>
            <input
              id="tech-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.headline}
              onChange={setField("headline")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tech-body">
              Sample UI copy
            </label>
            <textarea
              id="tech-body"
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
            <div style={{ maxWidth: `${result.contentWidthPx}px` }}>
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
              <p
                className="mt-4"
                style={{
                  fontFamily: result.pairing.mono.stack,
                  fontSize: `${result.basePx}px`,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                99.98% · 1,204 runs · 38 ms p50
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Grid-snapped scale</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Step
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Raw
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Snapped
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  rem
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Line box
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={6}>
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
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num(row.rawPx)}px
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{num(row.px)}px</td>
                    <td className="py-2 pr-3 text-right">{row.rem}</td>
                    <td className="py-2 text-right">
                      {num(row.leadingPx)}px / {row.lineHeight}
                    </td>
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
        Character counts use an average glyph advance per classification, so wide faces such as
        Poppins run a few characters shorter per line than the estimate. The {MEASURE_MIN_CPL}–
        {MEASURE_MAX_CPL} character band applies to continuous prose, not to labels, tables or
        buttons. Check each family&apos;s licence on Google Fonts before shipping.
      </p>
    </main>
  );
}
