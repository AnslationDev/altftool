"use client";

import { useEffect, useMemo, useState } from "react";
import { Blocks, Check, Copy, RotateCcw } from "lucide-react";

import {
  BRUTALIST_PAIRINGS,
  buildCss,
  buildSummary,
  computeBrutalistLayout,
  googleFontsHref,
  headlineLength,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  pairingId: "concrete-slab",
  containerPx: "1200",
  monoPx: "16",
  monoAdvanceEm: "0.6",
  displayAdvanceEm: "0.66",
  headline: "Raw Concrete, Honest Type",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
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

  const selectPairing = (item) =>
    setForm((prev) => ({
      ...prev,
      pairingId: item.id,
      monoAdvanceEm: String(item.mono.advanceEm),
      displayAdvanceEm: String(item.display.advanceEm),
    }));

  const result = useMemo(
    () =>
      computeBrutalistLayout({
        pairingId: form.pairingId,
        containerPx: Number(form.containerPx),
        monoPx: Number(form.monoPx),
        monoAdvanceEm: Number(form.monoAdvanceEm),
        displayAdvanceEm: Number(form.displayAdvanceEm),
        headline: form.headline,
      }),
    [form],
  );

  const activePairing = useMemo(
    () => BRUTALIST_PAIRINGS.find((item) => item.id === form.pairingId) ?? BRUTALIST_PAIRINGS[0],
    [form.pairingId],
  );
  const fontsHref = useMemo(() => googleFontsHref(activePairing), [activePairing]);
  const css = useMemo(() => buildCss(result), [result]);
  const summary = useMemo(() => buildSummary(result), [result]);
  const characters = useMemo(() => headlineLength(form.headline), [form.headline]);

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
          <Blocks className="h-4 w-4" aria-hidden="true" />
          Grotesk + monospace grid
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Brutalist Font Pairing
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight heavy-grotesk-and-monospace pairs. Pick one, then solve the font size that spans
          your container edge to edge and the whole-column monospace grid underneath it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. Pick a pairing</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {BRUTALIST_PAIRINGS.map((item) => {
            const active = item.id === form.pairingId;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectPairing(item)}
                className={`min-h-11 rounded-md border px-3 py-2 text-left transition active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none motion-reduce:transform-none ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  {item.display.family} + {item.mono.family}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{activePairing.note}</p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Container, grid and headline</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="brut-container">
              Container width (px)
            </label>
            <input
              id="brut-container"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="240"
              max="3840"
              step="10"
              value={form.containerPx}
              onChange={setField("containerPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="brut-mono-size">
              Monospace size (px)
            </label>
            <input
              id="brut-mono-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="40"
              step="1"
              value={form.monoPx}
              onChange={setField("monoPx")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="brut-mono-advance">
              Monospace advance (em)
            </label>
            <input
              id="brut-mono-advance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.3"
              max="1.2"
              step="0.01"
              value={form.monoAdvanceEm}
              onChange={setField("monoAdvanceEm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="brut-display-advance">
              Display advance (em)
            </label>
            <input
              id="brut-display-advance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.3"
              max="1.2"
              step="0.01"
              value={form.displayAdvanceEm}
              onChange={setField("displayAdvanceEm")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="brut-headline">
              Headline ({characters} / 200 characters)
            </label>
            <input
              id="brut-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={200}
              value={form.headline}
              onChange={setField("headline")}
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Selecting a pairing loads its own display and monospace advance values — both fields stay
          editable if you want to test a different face.
        </p>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Edge-to-edge headline size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${num(result.correctedFillPx)}px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${num(result.trackingEm)}em tracking · ${result.columns} monospace column${result.columns === 1 ? "" : "s"} fit`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the brutalist layout result"
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
            ["Fill size before tracking", hasError ? dash : `${num(result.fillPx)}px`],
            [
              "Fill size after tracking",
              hasError ? dash : `${num(result.correctedFillPx)}px at ${num(result.trackingEm)}em`,
            ],
            [
              "Monospace column width",
              hasError ? dash : `${num(result.columnPx)}px (${num(result.monoAdvanceEm)}em at ${num(result.monoPx)}px)`,
            ],
            [
              "Character grid",
              hasError
                ? dash
                : `${result.columns} columns (${num(result.gridWidthPx)}px), ${num(result.leftoverPx)}px left over`,
            ],
            ["Display size classification", hasError ? dash : result.isDisplay ? "Display type" : "Text size"],
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
          Off by default the preview falls back to a system face. Ticking the box fetches both
          families from fonts.googleapis.com.
        </p>
        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {dash} Fix the values above to see the preview.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-5">
            <p
              className="uppercase"
              style={{
                fontFamily: result.pairing.display.stack,
                fontWeight: result.pairing.display.weight,
                fontSize: `${result.correctedFillPx}px`,
                letterSpacing: `${result.trackingEm}em`,
                lineHeight: 0.95,
              }}
            >
              {result.headline}
            </p>
            <p
              className="mt-4"
              style={{
                fontFamily: result.pairing.mono.stack,
                fontWeight: result.pairing.mono.weight,
                fontSize: `${result.monoPx}px`,
                lineHeight: 1.5,
                maxWidth: `${result.columns}ch`,
              }}
            >
              {"0123456789".repeat(Math.ceil(result.columns / 10)).slice(0, result.columns)}
            </p>
            <hr
              className="mt-3 border-t-2 border-[var(--foreground)]"
              style={{ width: `${result.columns}ch` }}
            />
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
        Sizing uses an average glyph advance per face, not a measured metric, so treat the edge-to-edge
        size as a strong starting point and check the rendered line. Check each family&apos;s licence
        on Google Fonts before shipping.
      </p>
    </main>
  );
}
