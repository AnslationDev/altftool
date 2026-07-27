"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Quote, RotateCcw } from "lucide-react";

import { PALETTES, SOCIAL_PRESETS, buildQuoteGraphic, findPalette, hslToHex } from "../lib";

const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  quote: "Design is not just what it looks like and feels like. Design is how it works.",
  author: "Steve Jobs",
  handle: "@nimbusanalytics",
  presetId: "ig-portrait",
  paletteId: "ink",
  align: "left",
  showQuoteMark: true,
  useCustom: false,
};

const initialPalette = findPalette(DEFAULTS.paletteId);

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [customBg, setCustomBg] = useState(hslToHex(initialPalette.bg));
  const [customFg, setCustomFg] = useState(hslToHex(initialPalette.fg));
  const [customAccent, setCustomAccent] = useState(hslToHex(initialPalette.accent));
  const [drawn, setDrawn] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const request = useMemo(
    () => ({
      quote: form.quote,
      author: form.author,
      handle: form.handle,
      presetId: form.presetId,
      paletteId: form.paletteId,
      align: form.align,
      showQuoteMark: form.showQuoteMark,
      background: form.useCustom ? customBg : undefined,
      foreground: form.useCustom ? customFg : undefined,
      accent: form.useCustom ? customAccent : undefined,
    }),
    [form, customBg, customFg, customAccent],
  );

  // Pure, DOM-free spec: drives the error state on the very first paint.
  const estimate = useMemo(() => buildQuoteGraphic(request), [request]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const measure = (chunk, fontSize) => {
      ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
      return ctx.measureText(chunk).width;
    };

    const spec = buildQuoteGraphic({ ...request, measure });
    if (spec.error) {
      setDrawn(null);
      return;
    }

    canvas.width = spec.width;
    canvas.height = spec.height;

    ctx.fillStyle = spec.background;
    ctx.fillRect(0, 0, spec.width, spec.height);

    ctx.textAlign = spec.align === "center" ? "center" : "left";
    ctx.textBaseline = "alphabetic";

    if (spec.showQuoteMark) {
      ctx.fillStyle = spec.accent;
      ctx.font = `700 ${spec.quoteMark.size}px Georgia, "Times New Roman", serif`;
      ctx.fillText("“", spec.quoteMark.x, spec.quoteMark.y);
    }

    ctx.fillStyle = spec.foreground;
    ctx.font = `600 ${spec.quote.fontSize}px ${FONT_STACK}`;
    spec.quote.lines.forEach((line, index) => {
      ctx.fillText(line, spec.quote.x, spec.quote.top + spec.quote.lineHeight * (index + 0.8));
    });

    if (spec.attribution.author || spec.attribution.handle) {
      ctx.fillStyle = spec.accent;
      ctx.fillRect(spec.rule.x, spec.rule.y, spec.rule.width, spec.rule.height);

      let y = spec.attribution.top + spec.attribution.fontSize;
      if (spec.attribution.author) {
        ctx.fillStyle = spec.foreground;
        ctx.font = `700 ${spec.attribution.fontSize}px ${FONT_STACK}`;
        ctx.fillText(spec.attribution.author, spec.attribution.x, y);
        y += spec.attribution.fontSize * 1.45;
      }
      if (spec.attribution.handle) {
        ctx.fillStyle = spec.accent;
        ctx.font = `500 ${Math.round(spec.attribution.fontSize * 0.85)}px ${FONT_STACK}`;
        ctx.fillText(spec.attribution.handle, spec.attribution.x, y);
      }
    }

    setDrawn(spec);
  }, [request]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !drawn) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quote-${drawn.preset.id}-${drawn.width}x${drawn.height}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const copySummary = async () => {
    if (!drawn) return;
    const text = [
      `Quote graphic — ${drawn.preset.label} ${drawn.width}x${drawn.height}`,
      `Quote: "${form.quote.trim()}"`,
      form.author ? `Attributed to: ${form.author}` : "",
      `Background ${drawn.background} · Text ${drawn.foreground} · Accent ${drawn.accent}`,
      `Contrast ${drawn.contrast.ratio}:1 — ${drawn.contrast.verdict.label}`,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCustomBg(hslToHex(initialPalette.bg));
    setCustomFg(hslToHex(initialPalette.fg));
    setCustomAccent(hslToHex(initialPalette.accent));
    setCopied(false);
  };

  const spec = drawn || (estimate.error ? null : estimate);
  const dash = "—";
  const verdictClass =
    spec && spec.contrast.verdict.level === "fail"
      ? "text-[var(--danger)]"
      : spec && spec.contrast.verdict.level === "aa-large"
        ? "text-[var(--muted-foreground)]"
        : "text-[var(--success)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Quote className="h-4 w-4" aria-hidden="true" />
          Social graphics
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Quote Graphic Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a quote at the exact pixel size each placement wants, with the type auto-fitted to the
          canvas and a WCAG contrast check on the colours you choose. Everything renders in your
          browser — nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="quote-text">
              Quote
            </label>
            <textarea id="quote-text" className={`mt-2 ${TEXTAREA_CLASS}`} rows={3} value={form.quote} onChange={(e) => setField("quote", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="quote-author">
                Attributed to
              </label>
              <input id="quote-author" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.author} onChange={(e) => setField("author", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="quote-handle">
                Handle or brand line
              </label>
              <input id="quote-handle" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.handle} onChange={(e) => setField("handle", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="quote-preset">
                Placement size
              </label>
              <select id="quote-preset" className={`mt-2 ${INPUT_CLASS}`} value={form.presetId} onChange={(e) => setField("presetId", e.target.value)}>
                {SOCIAL_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} — {preset.width}x{preset.height}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="quote-align">
                Alignment
              </label>
              <select id="quote-align" className={`mt-2 ${INPUT_CLASS}`} value={form.align} onChange={(e) => setField("align", e.target.value)}>
                <option value="left">Left</option>
                <option value="center">Centred</option>
              </select>
            </div>
          </div>

          <fieldset>
            <legend className={LABEL_CLASS}>Palette</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setField("paletteId", palette.id)}
                  aria-pressed={form.paletteId === palette.id}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    form.paletteId === palette.id
                      ? "border-[var(--primary)] text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: hslToHex(palette.bg) }} />
                  {palette.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="quote-mark">
              <input id="quote-mark" type="checkbox" className="h-4 w-4" checked={form.showQuoteMark} onChange={(e) => setField("showQuoteMark", e.target.checked)} />
              Show quote mark
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="quote-custom">
              <input id="quote-custom" type="checkbox" className="h-4 w-4" checked={form.useCustom} onChange={(e) => setField("useCustom", e.target.checked)} />
              Use my own colours
            </label>
          </div>

          {form.useCustom ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="quote-bg">
                  Background
                </label>
                <input id="quote-bg" className={`mt-2 ${INPUT_CLASS} p-1`} type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="quote-fg">
                  Text
                </label>
                <input id="quote-fg" className={`mt-2 ${INPUT_CLASS} p-1`} type="color" value={customFg} onChange={(e) => setCustomFg(e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="quote-accent">
                  Accent
                </label>
                <input id="quote-accent" className={`mt-2 ${INPUT_CLASS} p-1`} type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {estimate.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {estimate.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Export size</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{spec ? `${spec.width}×${spec.height}` : dash}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{spec ? `${spec.preset.label} — ${spec.preset.note}` : dash}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copySummary} aria-label="Copy the graphic settings" className={GHOST_BTN} disabled={!spec}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy details"}
            </button>
            <button type="button" onClick={download} aria-label="Download the quote graphic as PNG" className={PRIMARY_BTN} disabled={!spec}>
              <Download className="h-4 w-4" aria-hidden="true" />
              PNG
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <canvas
            ref={canvasRef}
            className="mx-auto block h-auto max-h-[70vh] w-auto max-w-full rounded-lg ring-1 ring-[var(--border)]"
            role="img"
            aria-label={spec ? `Preview of the quote graphic at ${spec.width} by ${spec.height} pixels` : "Quote graphic preview"}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Text contrast against background", spec ? `${spec.contrast.ratio}:1` : dash],
            ["Accessibility", spec ? spec.contrast.verdict.label : dash],
            ["Accent contrast", spec ? `${spec.contrast.accentRatio}:1` : dash],
            ["Quote type size", spec ? `${spec.quote.fontSize}px on a ${spec.width}px canvas` : dash],
            ["Lines of quote", spec ? String(spec.quote.lines.length) : dash],
            ["Characters / words", spec ? `${spec.stats.characters} / ${spec.stats.words}` : dash],
            ["Story safe area", spec ? (spec.safeArea ? `${spec.safeArea.top}px top, ${spec.safeArea.bottom}px bottom kept clear` : "Not applicable") : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className={`text-right font-semibold ${label === "Accessibility" && spec ? verdictClass : ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Contrast is calculated with the WCAG 2.1 relative-luminance formula against the flat
        background colour. Quoting someone publicly is your responsibility — check the wording and
        the attribution before you post.
      </p>
    </main>
  );
}
