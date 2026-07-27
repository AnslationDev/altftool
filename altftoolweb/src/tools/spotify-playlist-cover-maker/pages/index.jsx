"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Music, RotateCcw } from "lucide-react";
import {
  EXPORT_SIZES,
  LAYOUTS,
  PALETTES,
  SPOTIFY_COVER_SPEC,
  WCAG_LARGE_TEXT_RATIO,
  buildCoverPlan,
  checkExportSpec,
  fitTitle,
  hslCss,
} from "../lib";

const PREVIEW_PX = 512;
const FONT_STACK = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const DEFAULTS = {
  title: "Late Night Drive",
  subtitle: "48 tracks · updated weekly",
  paletteId: "midnight",
  layout: "stacked",
  accentHue: "268",
  size: String(SPOTIFY_COVER_SPEC.recommendedPx),
  texture: "waves",
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

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "playlist";

/** Paints a plan onto a canvas. Pure rendering — all geometry comes from lib. */
function paintCover(canvas, plan) {
  if (!canvas || !plan || plan.error) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { size } = plan;
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  const rad = (plan.background.angle * Math.PI) / 180;
  const half = size / 2;
  const dx = Math.cos(rad) * half;
  const dy = Math.sin(rad) * half;
  const gradient = ctx.createLinearGradient(half - dx, half - dy, half + dx, half + dy);
  gradient.addColorStop(0, hslCss(plan.background.from));
  gradient.addColorStop(1, hslCss(plan.background.to));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  if (plan.texture === "waves") {
    ctx.lineWidth = Math.max(1, size * 0.006);
    for (let i = 0; i < 7; i += 1) {
      ctx.strokeStyle = hslCss(plan.accent, 0.16 + i * 0.02);
      ctx.beginPath();
      const base = size * (0.18 + i * 0.055);
      for (let x = 0; x <= size; x += size / 48) {
        const y = base + Math.sin((x / size) * Math.PI * 2 + i * 0.7) * size * 0.045;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (plan.texture === "rings") {
    ctx.lineWidth = Math.max(1, size * 0.008);
    for (let i = 1; i <= 6; i += 1) {
      ctx.strokeStyle = hslCss(plan.accent, 0.24 - i * 0.025);
      ctx.beginPath();
      ctx.arc(size * 0.78, size * 0.24, size * 0.07 * i, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const measureAt = (text, fontSize) => {
    ctx.font = `800 ${fontSize}px ${FONT_STACK}`;
    return ctx.measureText(text).width;
  };
  const fitted = fitTitle({
    text: plan.titleText,
    maxWidth: plan.title.maxWidth,
    maxHeight: plan.title.maxHeight,
    startSize: plan.title.startSize,
    minSize: plan.title.minSize,
    lineHeightRatio: plan.title.lineHeightRatio,
    measureAt,
  });

  const lineHeight = fitted.fontSize * plan.title.lineHeightRatio;
  const blockHeight = fitted.lines.length * lineHeight;
  const top =
    plan.layout === "centered"
      ? size / 2 - blockHeight / 2 - fitted.fontSize * 0.1
      : size - plan.margin - blockHeight - (plan.subtitle.text ? plan.subtitle.fontSize * 1.9 : 0);

  if (plan.layout === "badge") {
    ctx.fillStyle = hslCss(plan.accent, 0.92);
    const stripHeight = Math.max(size * 0.012, 4);
    ctx.fillRect(plan.margin, Math.max(0, top - size * 0.05), size * 0.16, stripHeight);
  }

  ctx.textBaseline = "top";
  ctx.textAlign = plan.title.align;
  ctx.fillStyle = hslCss(plan.ink);
  ctx.font = `800 ${fitted.fontSize}px ${FONT_STACK}`;
  fitted.lines.forEach((line, index) => {
    ctx.fillText(line, plan.title.x, top + index * lineHeight);
  });

  if (plan.subtitle.text) {
    ctx.font = `600 ${plan.subtitle.fontSize}px ${FONT_STACK}`;
    ctx.fillStyle = hslCss(plan.ink, 0.78);
    ctx.fillText(plan.subtitle.text, plan.subtitle.x, top + blockHeight + plan.subtitle.fontSize * 0.6);
  }
}

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [subtitle, setSubtitle] = useState(DEFAULTS.subtitle);
  const [paletteId, setPaletteId] = useState(DEFAULTS.paletteId);
  const [layout, setLayout] = useState(DEFAULTS.layout);
  const [accentHue, setAccentHue] = useState(DEFAULTS.accentHue);
  const [size, setSize] = useState(DEFAULTS.size);
  const [texture, setTexture] = useState(DEFAULTS.texture);
  const [copied, setCopied] = useState(false);
  const [exportInfo, setExportInfo] = useState(null);
  const canvasRef = useRef(null);

  const previewPlan = useMemo(() => {
    const plan = buildCoverPlan({
      title,
      subtitle,
      paletteId,
      layout,
      accentHue: Number(accentHue),
      texture,
      size: PREVIEW_PX,
    });
    return plan.error ? plan : { ...plan, titleText: title };
  }, [title, subtitle, paletteId, layout, accentHue, texture]);

  const exportPlan = useMemo(() => {
    const plan = buildCoverPlan({
      title,
      subtitle,
      paletteId,
      layout,
      accentHue: Number(accentHue),
      texture,
      size: Number(size),
    });
    return plan.error ? plan : { ...plan, titleText: title };
  }, [title, subtitle, paletteId, layout, accentHue, texture, size]);

  useEffect(() => {
    if (previewPlan.error) return;
    paintCover(canvasRef.current, previewPlan);
  }, [previewPlan]);

  const download = useCallback(
    (mime, extension) => {
      if (exportPlan.error || typeof document === "undefined") return;
      const offscreen = document.createElement("canvas");
      paintCover(offscreen, exportPlan);
      const filename = `${slugify(title)}-cover-${exportPlan.size}.${extension}`;
      offscreen.toBlob(
        (blob) => {
          if (!blob) return;
          setExportInfo({ bytes: blob.size, type: extension.toUpperCase(), px: exportPlan.size });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        },
        mime,
        0.92,
      );
    },
    [exportPlan, title],
  );

  const specResult = useMemo(() => {
    if (exportPlan.error || !exportInfo) return null;
    return checkExportSpec({ width: exportInfo.px, height: exportInfo.px, bytes: exportInfo.bytes });
  }, [exportPlan, exportInfo]);

  const summary = useMemo(() => {
    if (exportPlan.error) return "";
    return [
      "Spotify Playlist Cover",
      `Title: ${title}`,
      `Export: ${exportPlan.size} x ${exportPlan.size} px (1:1)`,
      `Palette: ${exportPlan.palette.name}`,
      `Layout: ${layout}`,
      `Title contrast: ${exportPlan.contrast.toFixed(2)}:1 (${exportPlan.contrastPass ? "passes" : "fails"} WCAG ${WCAG_LARGE_TEXT_RATIO}:1 for large text)`,
      `Safe margin: ${exportPlan.margin} px on every edge`,
      exportInfo ? `Last export: ${bytesLabel(exportInfo.bytes)} ${exportInfo.type}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [exportPlan, title, layout, exportInfo]);

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
    setTitle(DEFAULTS.title);
    setSubtitle(DEFAULTS.subtitle);
    setPaletteId(DEFAULTS.paletteId);
    setLayout(DEFAULTS.layout);
    setAccentHue(DEFAULTS.accentHue);
    setSize(DEFAULTS.size);
    setTexture(DEFAULTS.texture);
    setExportInfo(null);
    setCopied(false);
  };

  const errorText = exportPlan.error || previewPlan.error || "";
  const hasError = Boolean(errorText);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Music className="h-4 w-4" aria-hidden="true" />
          Playlist art
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Spotify Playlist Cover Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Square covers at Spotify&apos;s specs, with the title auto-fitted inside a safe margin and the
          colour pairing scored against the WCAG contrast formula. Everything renders in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cover-title">
              Playlist title
            </label>
            <input
              id="cover-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              maxLength={60}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cover-subtitle">
              Subtitle (optional)
            </label>
            <input
              id="cover-subtitle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={subtitle}
              maxLength={60}
              onChange={(event) => setSubtitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cover-palette">
              Palette
            </label>
            <select
              id="cover-palette"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paletteId}
              onChange={(event) => setPaletteId(event.target.value)}
            >
              {PALETTES.map((palette) => (
                <option key={palette.id} value={palette.id}>
                  {palette.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cover-layout">
              Layout
            </label>
            <select
              id="cover-layout"
              className={`mt-2 ${INPUT_CLASS}`}
              value={layout}
              onChange={(event) => setLayout(event.target.value)}
            >
              {LAYOUTS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cover-texture">
              Background texture
            </label>
            <select
              id="cover-texture"
              className={`mt-2 ${INPUT_CLASS}`}
              value={texture}
              onChange={(event) => setTexture(event.target.value)}
            >
              <option value="waves">Waveform lines</option>
              <option value="rings">Concentric rings</option>
              <option value="none">Flat gradient</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cover-size">
              Export size (px, square)
            </label>
            <select
              id="cover-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={size}
              onChange={(event) => setSize(event.target.value)}
            >
              {EXPORT_SIZES.map((value) => (
                <option key={value} value={value}>
                  {value} x {value}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cover-hue">
              Accent hue ({accentHue}&deg;)
            </label>
            <input
              id="cover-hue"
              className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)]"
              type="range"
              min="0"
              max="359"
              step="1"
              value={accentHue}
              onChange={(event) => setAccentHue(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorText}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Preview</h2>
          <div className="mt-3 flex justify-center">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Playlist cover preview for ${title || "untitled playlist"}`}
              className="aspect-square w-full max-w-[360px] rounded-lg ring-1 ring-[var(--border)]"
            />
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Export dimensions
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${exportPlan.size} × ${exportPlan.size}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Square 1:1 · {SPOTIFY_COVER_SPEC.recommendedPx} px is Spotify&apos;s recommended size
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy cover specification summary" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all cover options" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Palette", hasError ? "—" : exportPlan.palette.name],
            [
              "Title contrast (WCAG 2.1)",
              hasError
                ? "—"
                : `${exportPlan.contrast.toFixed(2)}:1 · ${exportPlan.contrastPass ? "passes" : "below"} ${WCAG_LARGE_TEXT_RATIO}:1`,
            ],
            ["Safe margin each edge", hasError ? "—" : `${exportPlan.margin} px (8%)`],
            ["Text column width", hasError ? "—" : `${exportPlan.column} px`],
            ["Last export size", exportInfo ? `${bytesLabel(exportInfo.bytes)} ${exportInfo.type}` : "not exported yet"],
            ["Base64 payload (Web API)", specResult && !specResult.error ? bytesLabel(specResult.base64Bytes) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => download("image/png", "png")} className={PRIMARY_BTN} disabled={hasError}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PNG
          </button>
          <button type="button" onClick={() => download("image/jpeg", "jpg")} className={GHOST_BTN} disabled={hasError}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download JPEG
          </button>
        </div>

        {specResult && !specResult.error ? (
          <ul className="mt-4 space-y-1.5 text-sm">
            {specResult.checks.map((check) => (
              <li key={check.label} className="flex items-center gap-2">
                <span className={check.pass ? "text-[var(--success)]" : "text-[var(--danger)]"} aria-hidden="true">
                  {check.pass ? "✓" : "✕"}
                </span>
                <span className="text-[var(--muted-foreground)]">
                  {check.label} — {check.pass ? "pass" : "fail"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && exportPlan.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {exportPlan.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Artwork is generated and exported locally — nothing is uploaded. Spotify can change its artwork
        limits, so check the current guidance before a bulk re-upload, and only publish artwork you have
        the rights to use.
      </p>
    </main>
  );
}
