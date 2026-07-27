"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Mail, RotateCcw } from "lucide-react";
import {
  BANNER_RATIOS,
  DARK_CLIENT_BG,
  EMAIL_CONTENT_WIDTHS,
  GMAIL_CLIP_BYTES,
  LIGHT_CLIENT_BG,
  RETINA_SCALES,
  THEMES,
  buildBannerPlan,
  checkWeight,
  fitHeadline,
  hslCss,
} from "../lib";

const FONT_STACK = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const DEFAULTS = {
  widthId: "w600",
  ratioId: "r3",
  scale: "2",
  themeId: "ink",
  headline: "The Weekly Brief",
  kicker: "ISSUE 42",
  cta: "Read online",
  alt: "The Weekly Brief, issue 42",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const bytesLabel = (bytes) => {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/** Rendering only — every coordinate and colour comes from lib.js. */
function paintBanner(canvas, plan, scale = 1) {
  if (!canvas || !plan || plan.error) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { exportWidth, exportHeight } = plan.retina;
  canvas.width = Math.round(exportWidth * scale);
  canvas.height = Math.round(exportHeight * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, exportWidth, exportHeight);

  ctx.fillStyle = hslCss(plan.theme.bg);
  ctx.fillRect(0, 0, exportWidth, exportHeight);

  ctx.fillStyle = hslCss(plan.theme.accent, 0.16);
  ctx.beginPath();
  ctx.arc(exportWidth * 0.92, exportHeight * 0.1, exportHeight * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hslCss(plan.theme.accent, 0.95);
  ctx.fillRect(0, 0, exportWidth, Math.max(2, exportHeight * 0.018));

  const measureAt = (text, fontSize) => {
    ctx.font = `800 ${fontSize}px ${FONT_STACK}`;
    return ctx.measureText(text).width;
  };
  const fitted = fitHeadline({
    text: plan.headline.text,
    maxWidth: plan.headline.maxWidth,
    maxHeight: plan.headline.maxHeight,
    startSize: plan.headline.startSize,
    minSize: plan.headline.minSize,
    lineHeightRatio: plan.headline.lineHeightRatio,
    measureAt,
  });

  const lineHeight = fitted.fontSize * plan.headline.lineHeightRatio;
  const blockHeight = fitted.lines.length * lineHeight;
  const kickerHeight = plan.kicker.text ? plan.kicker.fontSize * 1.9 : 0;
  const ctaHeight = plan.cta.text ? plan.cta.fontSize * 1.9 : 0;
  let cursorY = Math.max(plan.padding * 0.4, (exportHeight - (blockHeight + kickerHeight + ctaHeight)) / 2);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  if (plan.kicker.text) {
    ctx.font = `700 ${plan.kicker.fontSize}px ${FONT_STACK}`;
    ctx.fillStyle = hslCss(plan.theme.accent, 0.95);
    ctx.fillText(plan.kicker.text.toUpperCase(), plan.padding, cursorY);
    cursorY += kickerHeight;
  }

  ctx.font = `800 ${fitted.fontSize}px ${FONT_STACK}`;
  ctx.fillStyle = hslCss(plan.theme.ink);
  fitted.lines.forEach((line, index) => {
    ctx.fillText(line, plan.padding, cursorY + index * lineHeight);
  });
  cursorY += blockHeight;

  if (plan.cta.text) {
    ctx.font = `600 ${plan.cta.fontSize}px ${FONT_STACK}`;
    ctx.fillStyle = hslCss(plan.theme.ink, 0.78);
    ctx.fillText(plan.cta.text, plan.padding, cursorY + plan.cta.fontSize * 0.4);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export default function ToolHome() {
  const [widthId, setWidthId] = useState(DEFAULTS.widthId);
  const [ratioId, setRatioId] = useState(DEFAULTS.ratioId);
  const [scale, setScale] = useState(DEFAULTS.scale);
  const [themeId, setThemeId] = useState(DEFAULTS.themeId);
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [kicker, setKicker] = useState(DEFAULTS.kicker);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [alt, setAlt] = useState(DEFAULTS.alt);
  const [clientMode, setClientMode] = useState("light");
  const [copied, setCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [exportInfo, setExportInfo] = useState(null);
  const canvasRef = useRef(null);

  const plan = useMemo(
    () => buildBannerPlan({ widthId, ratioId, scale: Number(scale), themeId, headline, kicker, cta, alt }),
    [widthId, ratioId, scale, themeId, headline, kicker, cta, alt],
  );

  useEffect(() => {
    if (plan.error) return;
    paintBanner(canvasRef.current, plan, 1200 / plan.retina.exportWidth);
  }, [plan]);

  const download = useCallback(() => {
    if (plan.error || typeof document === "undefined") return;
    const offscreen = document.createElement("canvas");
    paintBanner(offscreen, plan, 1);
    const filename = `newsletter-banner-${plan.retina.exportWidth}x${plan.retina.exportHeight}.png`;
    offscreen.toBlob((blob) => {
      if (!blob) return;
      setExportInfo({ bytes: blob.size });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [plan]);

  const weight = useMemo(() => {
    if (plan.error || !exportInfo) return null;
    return checkWeight({ bytes: exportInfo.bytes, htmlBytes: plan.imgTag.bytes });
  }, [plan, exportInfo]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "Email Newsletter Banner",
      `CSS size: ${plan.cssWidth} x ${plan.cssHeight} px (${plan.ratioPreset.name})`,
      `Export size: ${plan.retina.exportWidth} x ${plan.retina.exportHeight} px at ${plan.retina.scale}x`,
      `Theme: ${plan.theme.name}`,
      `Headline contrast: ${plan.textContrast.toFixed(2)}:1`,
      `Light-client seam: ${plan.darkMode.lightSeam.toFixed(2)}:1 · dark-client seam: ${plan.darkMode.darkSeam.toFixed(2)}:1`,
      `Dark mode: ${plan.darkMode.verdict}`,
      exportInfo ? `Exported PNG: ${bytesLabel(exportInfo.bytes)}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [plan, exportInfo]);

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

  const copySnippet = async () => {
    if (plan.error) return;
    try {
      await navigator.clipboard.writeText(plan.imgTag.html);
      setSnippetCopied(true);
      setTimeout(() => setSnippetCopied(false), 1500);
    } catch {
      setSnippetCopied(false);
    }
  };

  const reset = () => {
    setWidthId(DEFAULTS.widthId);
    setRatioId(DEFAULTS.ratioId);
    setScale(DEFAULTS.scale);
    setThemeId(DEFAULTS.themeId);
    setHeadline(DEFAULTS.headline);
    setKicker(DEFAULTS.kicker);
    setCta(DEFAULTS.cta);
    setAlt(DEFAULTS.alt);
    setClientMode("light");
    setExportInfo(null);
    setCopied(false);
    setSnippetCopied(false);
  };

  const hasError = Boolean(plan.error);
  const canvasBg = clientMode === "dark" ? hslCss(DARK_CLIENT_BG) : hslCss(LIGHT_CLIENT_BG);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Email design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Email Newsletter Banner Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Design a header at a real email content width, export it at 2x for retina, and see how it sits on
          both a light and a dark client canvas — with the matching image markup ready to paste.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="banner-headline">
              Headline
            </label>
            <input
              id="banner-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={70}
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-kicker">
              Kicker (optional)
            </label>
            <input
              id="banner-kicker"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={30}
              value={kicker}
              onChange={(event) => setKicker(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-cta">
              Sub-line (optional)
            </label>
            <input
              id="banner-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={40}
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-width">
              Email content width
            </label>
            <select
              id="banner-width"
              className={`mt-2 ${INPUT_CLASS}`}
              value={widthId}
              onChange={(event) => setWidthId(event.target.value)}
            >
              {EMAIL_CONTENT_WIDTHS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-ratio">
              Banner proportion
            </label>
            <select
              id="banner-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratioId}
              onChange={(event) => setRatioId(event.target.value)}
            >
              {BANNER_RATIOS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-scale">
              Pixel density
            </label>
            <select
              id="banner-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scale}
              onChange={(event) => setScale(event.target.value)}
            >
              {RETINA_SCALES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}x export
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="banner-theme">
              Theme
            </label>
            <select
              id="banner-theme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={themeId}
              onChange={(event) => setThemeId(event.target.value)}
            >
              {THEMES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="banner-alt">
              Alt text (shown when images are blocked)
            </label>
            <input
              id="banner-alt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={120}
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Preview on a {clientMode} client</h2>
            <button
              type="button"
              onClick={() => setClientMode((mode) => (mode === "light" ? "dark" : "light"))}
              className={GHOST_BTN}
            >
              Switch to {clientMode === "light" ? "dark" : "light"} client
            </button>
          </div>
          <div className="mt-3 rounded-lg p-4 ring-1 ring-[var(--border)]" style={{ background: canvasBg }}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={alt || "Newsletter banner preview"}
              className="mx-auto block w-full"
              style={{ maxWidth: `${plan.cssWidth}px`, aspectRatio: `${plan.cssWidth} / ${plan.cssHeight}` }}
            />
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Export at {hasError ? "—" : `${plan.retina.scale}x`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${plan.retina.exportWidth} × ${plan.retina.exportHeight}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "—"
                : `Declare width ${plan.cssWidth} and height ${plan.cssHeight} in the markup so the client downsamples`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy banner specification summary" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all banner options" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["CSS size in the email", hasError ? "—" : `${plan.cssWidth} × ${plan.cssHeight} px`],
            ["Headline contrast (WCAG 2.1)", hasError ? "—" : `${plan.textContrast.toFixed(2)}:1`],
            ["Accent contrast", hasError ? "—" : `${plan.accentContrast.toFixed(2)}:1`],
            ["Seam against a light client", hasError ? "—" : `${plan.darkMode.lightSeam.toFixed(2)}:1`],
            ["Seam against a dark client", hasError ? "—" : `${plan.darkMode.darkSeam.toFixed(2)}:1`],
            ["Safe padding", hasError ? "—" : `${plan.padding} export px (6%)`],
            ["Exported PNG weight", exportInfo ? bytesLabel(exportInfo.bytes) : "not exported yet"],
            ["Header weight budget", weight ? `${bytesLabel(weight.budget)} · ${weight.withinBudget ? "within" : "over"}` : "—"],
            [
              "Gmail clipping headroom",
              weight ? `${bytesLabel(Math.max(0, weight.gmailHeadroomBytes))} of ${bytesLabel(GMAIL_CLIP_BYTES)} HTML` : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={download} className={PRIMARY_BTN} disabled={hasError}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PNG
          </button>
          <button
            type="button"
            onClick={copySnippet}
            aria-label="Copy the banner image markup"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {snippetCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {snippetCopied ? "Copied!" : "Copy image markup"}
          </button>
        </div>

        {!hasError ? (
          <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="text-xs leading-5 text-[var(--foreground)]">{plan.imgTag.html}</pre>
          </div>
        ) : null}

        {!hasError && plan.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {plan.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything renders locally; upload the exported PNG to your own CDN and swap the placeholder source.
        Client behaviour varies — always send a seed test to Gmail, Outlook and Apple Mail in both light and
        dark mode before a full send.
      </p>
    </main>
  );
}
