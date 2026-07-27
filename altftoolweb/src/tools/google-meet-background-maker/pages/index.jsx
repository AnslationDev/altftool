"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, Copy, Download, RotateCcw } from "lucide-react";
import {
  EXPORT_PRESETS,
  KEYING_WEIGHTS,
  MEET_BACKGROUND_SPEC,
  SEGMENTATION_MASK,
  TEXTURES,
  THEMES,
  buildMeetPlan,
  checkUpload,
  computeMaskDetail,
  hslCss,
} from "../lib";

const FONT_STACK = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const DEFAULTS = {
  presetId: "hd",
  themeId: "office",
  textureId: "gradient",
  caption: "meet.example.com",
  captionSide: "right",
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

const TONE_CLASS = {
  success: "text-[var(--success)]",
  warn: "text-[var(--foreground)]",
  danger: "text-[var(--danger)]",
};

/** Rendering only — geometry, blur radius and colours all come from lib.js. */
function paintMeet(canvas, plan, { showBand = false, scale = 1 } = {}) {
  if (!canvas || !plan || plan.error) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = Math.round(plan.width * scale);
  canvas.height = Math.round(plan.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, plan.width, plan.height);

  const gradient = ctx.createLinearGradient(0, 0, plan.width, plan.height * 0.6);
  gradient.addColorStop(0, hslCss(plan.theme.from));
  gradient.addColorStop(1, hslCss(plan.theme.to));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, plan.width, plan.height);

  ctx.save();
  ctx.filter = `blur(${plan.blurPx}px)`;
  const unit = plan.width * 0.05;

  if (plan.texture.id === "orbs") {
    const spots = [
      [0.16, 0.28, 1.5],
      [0.78, 0.2, 1.1],
      [0.62, 0.78, 1.8],
      [0.32, 0.86, 0.9],
    ];
    spots.forEach(([cx, cy, spotSize], index) => {
      ctx.fillStyle = hslCss(plan.theme.ink, index % 2 === 0 ? 0.1 : 0.06);
      ctx.beginPath();
      ctx.arc(plan.width * cx, plan.height * cy, unit * spotSize * 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (plan.texture.id === "dots") {
    ctx.fillStyle = hslCss(plan.theme.ink, 0.14);
    for (let x = unit; x < plan.width; x += unit) {
      for (let y = unit; y < plan.height; y += unit) {
        ctx.beginPath();
        ctx.arc(x, y, unit * 0.11, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (plan.texture.id === "stripes") {
    ctx.strokeStyle = hslCss(plan.theme.ink, 0.14);
    ctx.lineWidth = unit * 0.3;
    for (let x = -plan.height; x < plan.width + plan.height; x += unit) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + plan.height, plan.height);
      ctx.stroke();
    }
  } else if (plan.texture.id === "gradient") {
    const soft = ctx.createRadialGradient(
      plan.width * 0.72,
      plan.height * 0.24,
      unit,
      plan.width * 0.72,
      plan.height * 0.24,
      plan.width * 0.7,
    );
    soft.addColorStop(0, hslCss(plan.theme.ink, 0.12));
    soft.addColorStop(1, hslCss(plan.theme.ink, 0));
    ctx.fillStyle = soft;
    ctx.fillRect(0, 0, plan.width, plan.height);
  }
  ctx.restore();

  if (plan.caption) {
    ctx.font = `700 ${plan.captionFont}px ${FONT_STACK}`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = plan.captionSide === "left" ? "left" : "right";
    ctx.fillStyle = hslCss(plan.theme.ink, 0.88);
    const x = plan.captionSide === "left" ? plan.margin : plan.width - plan.margin;
    ctx.fillText(plan.caption, x, plan.height - plan.margin);
  }

  if (showBand) {
    const bandX = plan.width * plan.bandStart;
    const bandW = plan.width * (plan.bandEnd - plan.bandStart);
    ctx.fillStyle = hslCss({ h: 4, s: 84, l: 62 }, 0.14);
    ctx.fillRect(bandX, 0, bandW, plan.height);
    ctx.strokeStyle = hslCss({ h: 4, s: 84, l: 62 }, 0.9);
    ctx.lineWidth = Math.max(2, plan.width * 0.002);
    ctx.setLineDash([plan.width * 0.012, plan.width * 0.008]);
    ctx.strokeRect(bandX, 0, bandW, plan.height);
    ctx.setLineDash([]);
    ctx.font = `700 ${Math.round(plan.height * 0.028)}px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = hslCss({ h: 4, s: 84, l: 42 }, 0.95);
    ctx.fillText("cut-out edge lands here", bandX + bandW / 2, plan.height * 0.04);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export default function ToolHome() {
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [themeId, setThemeId] = useState(DEFAULTS.themeId);
  const [textureId, setTextureId] = useState(DEFAULTS.textureId);
  const [caption, setCaption] = useState(DEFAULTS.caption);
  const [captionSide, setCaptionSide] = useState(DEFAULTS.captionSide);
  const [blurInput, setBlurInput] = useState("");
  const [showBand, setShowBand] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exportInfo, setExportInfo] = useState(null);
  const canvasRef = useRef(null);

  const preset = useMemo(
    () => EXPORT_PRESETS.find((entry) => entry.id === presetId) ?? EXPORT_PRESETS[0],
    [presetId],
  );

  const recommendedBlur = useMemo(() => {
    const detail = computeMaskDetail({ width: preset.width, height: preset.height });
    return detail.error ? 0 : detail.recommendedBlurPx;
  }, [preset]);

  const plan = useMemo(
    () =>
      buildMeetPlan({
        width: preset.width,
        height: preset.height,
        themeId,
        textureId,
        blurPx: blurInput === "" ? null : Number(blurInput),
        caption,
        captionSide,
      }),
    [preset, themeId, textureId, blurInput, caption, captionSide],
  );

  useEffect(() => {
    if (plan.error) return;
    paintMeet(canvasRef.current, plan, { showBand, scale: 960 / plan.width });
  }, [plan, showBand]);

  const download = useCallback(() => {
    if (plan.error || typeof document === "undefined") return;
    const offscreen = document.createElement("canvas");
    paintMeet(offscreen, plan, { showBand: false, scale: 1 });
    const filename = `google-meet-background-${plan.width}x${plan.height}.png`;
    offscreen.toBlob((blob) => {
      if (!blob) return;
      setExportInfo({ bytes: blob.size, width: plan.width, height: plan.height });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [plan]);

  const uploadCheck = useMemo(() => {
    if (!exportInfo) return null;
    return checkUpload({ width: exportInfo.width, height: exportInfo.height, bytes: exportInfo.bytes });
  }, [exportInfo]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "Google Meet Background",
      `Export: ${plan.width} x ${plan.height} px (${plan.aspect})`,
      `Theme: ${plan.theme.name} · Pattern: ${plan.texture.name}`,
      `Blur: ${plan.blurPx} px (mask-resolution target ${plan.detail.recommendedBlurPx} px)`,
      `Segmentation cell: ${plan.detail.featureWidthPx.toFixed(1)} x ${plan.detail.featureHeightPx.toFixed(1)} export px`,
      `Silhouette-band contrast: ${plan.bandContrast.toFixed(2)}:1`,
      `Edge-keying index: ${plan.keying.score}/100 (${plan.keying.band.label})`,
      exportInfo ? `Last export: ${bytesLabel(exportInfo.bytes)} PNG` : null,
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

  const reset = () => {
    setPresetId(DEFAULTS.presetId);
    setThemeId(DEFAULTS.themeId);
    setTextureId(DEFAULTS.textureId);
    setCaption(DEFAULTS.caption);
    setCaptionSide(DEFAULTS.captionSide);
    setBlurInput("");
    setShowBand(true);
    setExportInfo(null);
    setCopied(false);
  };

  const hasError = Boolean(plan.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Meeting backgrounds
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Google Meet Background Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a 16:9 background at Meet&apos;s specs and blur it past the point where the segmentation
          mask can resolve the detail — the reason a cut-out edge looks clean instead of shimmering.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="meet-preset">
              Export size
            </label>
            <select
              id="meet-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => setPresetId(event.target.value)}
            >
              {EXPORT_PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meet-theme">
              Colour theme
            </label>
            <select
              id="meet-theme"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="meet-texture">
              Pattern
            </label>
            <select
              id="meet-texture"
              className={`mt-2 ${INPUT_CLASS}`}
              value={textureId}
              onChange={(event) => setTextureId(event.target.value)}
            >
              {TEXTURES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meet-blur">
              Blur radius (px, blank uses {recommendedBlur})
            </label>
            <input
              id="meet-blur"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder={String(recommendedBlur)}
              value={blurInput}
              onChange={(event) => setBlurInput(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meet-caption">
              Caption (optional)
            </label>
            <input
              id="meet-caption"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={48}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meet-caption-side">
              Caption side
            </label>
            <select
              id="meet-caption-side"
              className={`mt-2 ${INPUT_CLASS}`}
              value={captionSide}
              onChange={(event) => setCaptionSide(event.target.value)}
            >
              <option value="right">Bottom right</option>
              <option value="left">Bottom left</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowBand((value) => !value)} aria-pressed={showBand} className={GHOST_BTN}>
            {showBand ? "Hide silhouette band" : "Show silhouette band"}
          </button>
          <button type="button" onClick={() => setBlurInput(String(recommendedBlur))} className={GHOST_BTN}>
            Use {recommendedBlur} px target blur
          </button>
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
          <h2 className="text-base font-semibold">Preview</h2>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Google Meet background preview with the silhouette band marked"
            className="mt-3 w-full rounded-lg ring-1 ring-[var(--border)]"
            style={{ aspectRatio: `${plan.width} / ${plan.height}` }}
          />
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Meet mirrors your self view, so text reads back to front to you and correctly to everyone else.
            The shaded band is where the cut-out edge falls on a normally framed webcam.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Edge-keying index
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${plan.keying.score}/100`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : TONE_CLASS[plan.keying.band.tone]
              }`}
            >
              {hasError ? "—" : plan.keying.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy background specification summary" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all background options" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Export size", hasError ? "—" : `${plan.width} × ${plan.height} px (${plan.aspect})`],
            ["Blur applied", hasError ? "—" : `${plan.blurPx} px`],
            ["Mask-resolution blur target", hasError ? "—" : `${plan.detail.recommendedBlurPx} px`],
            [
              `Segmentation cell (${SEGMENTATION_MASK.width}×${SEGMENTATION_MASK.height} mask)`,
              hasError ? "—" : `${plan.detail.featureWidthPx.toFixed(1)} × ${plan.detail.featureHeightPx.toFixed(1)} px`,
            ],
            ["Silhouette-band contrast", hasError ? "—" : `${plan.bandContrast.toFixed(2)}:1`],
            ["Caption contrast", hasError || !plan.caption ? "—" : `${plan.captionContrast.toFixed(2)}:1`],
            [`Blur component (weight ${KEYING_WEIGHTS.blur})`, hasError ? "—" : `${Math.round(plan.keying.blurAdequacy * 100)}%`],
            [
              `Contrast component (weight ${KEYING_WEIGHTS.contrast})`,
              hasError ? "—" : `${Math.round(plan.keying.contrastCalm * 100)}%`,
            ],
            [
              `Pattern component (weight ${KEYING_WEIGHTS.texture})`,
              hasError ? "—" : `${Math.round(plan.keying.textureCalm * 100)}%`,
            ],
            ["Last export size", exportInfo ? `${bytesLabel(exportInfo.bytes)} PNG` : "not exported yet"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <button type="button" onClick={download} className={PRIMARY_BTN} disabled={hasError}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download PNG
          </button>
        </div>

        {uploadCheck && !uploadCheck.error ? (
          <ul className="mt-4 space-y-1.5 text-sm">
            {uploadCheck.checks.map((check) => (
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

        {!hasError && plan.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {plan.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rendered and exported entirely in your browser. The keying index is a transparent weighted
        heuristic built from the blur target, band contrast and pattern busyness — it predicts edge
        quality, it does not measure Google&apos;s model. Meet can change its limits; the current upload cap
        used here is {Math.round(MEET_BACKGROUND_SPEC.maxUploadBytes / (1024 * 1024))} MB.
      </p>
    </main>
  );
}
