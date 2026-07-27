"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Video } from "lucide-react";
import {
  EXPORT_PRESETS,
  FACE_SIDES,
  FRAMING_PROFILES,
  GALLERY_TILE_WIDTH_PX,
  PANEL_POSITIONS,
  THEMES,
  WCAG_LARGE_TEXT_RATIO,
  ZOOM_BACKGROUND_SPEC,
  buildBackgroundPlan,
  checkUpload,
  hslCss,
} from "../lib";

const FONT_STACK = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const DEFAULTS = {
  name: "Priya Raman",
  role: "Head of Design",
  handle: "priya.example.com",
  presetId: "hd",
  themeId: "slate",
  framing: "medium",
  side: "center",
  panelPosition: "bottom-left",
  nameScale: "1.4",
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
    .replace(/^-+|-+$/g, "") || "zoom";

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/** Rendering only. Every coordinate comes from the plan produced by lib.js. */
function paintBackground(canvas, plan, { showZone = false, scale = 1 } = {}) {
  if (!canvas || !plan || plan.error) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = Math.round(plan.width * scale);
  const h = Math.round(plan.height * scale);
  canvas.width = w;
  canvas.height = h;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, plan.width, plan.height);

  const gradient = ctx.createLinearGradient(0, 0, plan.width, plan.height);
  gradient.addColorStop(0, hslCss(plan.theme.from));
  gradient.addColorStop(1, hslCss(plan.theme.to));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, plan.width, plan.height);

  const glow = ctx.createRadialGradient(
    plan.width * 0.5,
    plan.height * 0.42,
    plan.height * 0.08,
    plan.width * 0.5,
    plan.height * 0.42,
    plan.height * 0.95,
  );
  glow.addColorStop(0, hslCss(plan.theme.ink, 0.1));
  glow.addColorStop(1, hslCss(plan.theme.ink, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, plan.width, plan.height);

  const { panel } = plan;
  ctx.fillStyle = hslCss(plan.theme.from, 0.55);
  roundedRect(ctx, panel.x, panel.y, panel.width, panel.height, panel.padding * 0.6);
  ctx.fill();
  ctx.strokeStyle = hslCss(plan.theme.ink, 0.22);
  ctx.lineWidth = Math.max(1, plan.width * 0.001);
  ctx.stroke();

  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  let cursorY = panel.y + panel.padding;
  plan.lines.forEach((line, index) => {
    ctx.font = `${line.weight} ${line.font}px ${FONT_STACK}`;
    ctx.fillStyle = hslCss(plan.theme.ink, line.alpha);
    ctx.fillText(line.text, panel.x + panel.padding, cursorY);
    cursorY += line.font + (index < plan.lines.length - 1 ? panel.lineGap : 0);
  });

  if (showZone) {
    const { zone } = plan;
    ctx.setLineDash([plan.width * 0.012, plan.width * 0.008]);
    ctx.strokeStyle = hslCss({ h: 4, s: 84, l: 62 }, 0.95);
    ctx.lineWidth = Math.max(2, plan.width * 0.0025);
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    ctx.setLineDash([]);
    ctx.font = `700 ${Math.round(plan.height * 0.03)}px ${FONT_STACK}`;
    ctx.fillStyle = hslCss({ h: 4, s: 84, l: 62 }, 0.95);
    ctx.fillText("you sit here", zone.x + plan.width * 0.01, zone.y + plan.height * 0.01);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [role, setRole] = useState(DEFAULTS.role);
  const [handle, setHandle] = useState(DEFAULTS.handle);
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [themeId, setThemeId] = useState(DEFAULTS.themeId);
  const [framing, setFraming] = useState(DEFAULTS.framing);
  const [side, setSide] = useState(DEFAULTS.side);
  const [panelPosition, setPanelPosition] = useState(DEFAULTS.panelPosition);
  const [nameScale, setNameScale] = useState(DEFAULTS.nameScale);
  const [showZone, setShowZone] = useState(true);
  const [mirrored, setMirrored] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportInfo, setExportInfo] = useState(null);
  const canvasRef = useRef(null);

  const preset = useMemo(
    () => EXPORT_PRESETS.find((entry) => entry.id === presetId) ?? EXPORT_PRESETS[0],
    [presetId],
  );

  const plan = useMemo(
    () =>
      buildBackgroundPlan({
        width: preset.width,
        height: preset.height,
        name,
        role,
        handle,
        themeId,
        framing,
        side,
        panelPosition,
        nameScale: Number(nameScale),
      }),
    [preset, name, role, handle, themeId, framing, side, panelPosition, nameScale],
  );

  useEffect(() => {
    if (plan.error) return;
    paintBackground(canvasRef.current, plan, { showZone, scale: 960 / plan.width });
  }, [plan, showZone]);

  const download = useCallback(() => {
    if (plan.error || typeof document === "undefined") return;
    const offscreen = document.createElement("canvas");
    paintBackground(offscreen, plan, { showZone: false, scale: 1 });
    const filename = `${slugify(name)}-zoom-background-${plan.width}x${plan.height}.png`;
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
  }, [plan, name]);

  const uploadCheck = useMemo(() => {
    if (!exportInfo) return null;
    return checkUpload({ width: exportInfo.width, height: exportInfo.height, bytes: exportInfo.bytes });
  }, [exportInfo]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "Zoom Virtual Background",
      `Export: ${plan.width} x ${plan.height} px (${plan.aspect})`,
      `Theme: ${plan.theme.name}`,
      `Framing: ${plan.zone.profile.name}, ${plan.zone.anchor.name}`,
      `Face-safe zone: ${Math.round(plan.zone.width)} x ${Math.round(plan.zone.height)} px starting at ${Math.round(plan.zone.x)}, ${Math.round(plan.zone.y)}`,
      `Brand panel: ${plan.panel.width} x ${plan.panel.height} px, ${Math.round(plan.overlapShare * 100)}% covered by you`,
      `Name size: ${plan.nameFont} px (gallery-legible floor ${Math.round(plan.minFont)} px)`,
      `Text contrast: ${plan.contrast.toFixed(2)}:1`,
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
    setName(DEFAULTS.name);
    setRole(DEFAULTS.role);
    setHandle(DEFAULTS.handle);
    setPresetId(DEFAULTS.presetId);
    setThemeId(DEFAULTS.themeId);
    setFraming(DEFAULTS.framing);
    setSide(DEFAULTS.side);
    setPanelPosition(DEFAULTS.panelPosition);
    setNameScale(DEFAULTS.nameScale);
    setShowZone(true);
    setMirrored(false);
    setExportInfo(null);
    setCopied(false);
  };

  const hasError = Boolean(plan.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Video className="h-4 w-4" aria-hidden="true" />
          Video calls
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Zoom Virtual Background Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a branded 16:9 background and see exactly where your head and shoulders will cover it.
          The layout is checked against Zoom&apos;s size limits, WCAG contrast and gallery-tile legibility.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="zoom-name">
              Name
            </label>
            <input
              id="zoom-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="zoom-role">
              Role or company
            </label>
            <input
              id="zoom-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={role}
              maxLength={48}
              onChange={(event) => setRole(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="zoom-handle">
              Handle or website
            </label>
            <input
              id="zoom-handle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={handle}
              maxLength={48}
              onChange={(event) => setHandle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="zoom-preset">
              Export size
            </label>
            <select
              id="zoom-preset"
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
            <label className={LABEL_CLASS} htmlFor="zoom-theme">
              Theme
            </label>
            <select
              id="zoom-theme"
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
            <label className={LABEL_CLASS} htmlFor="zoom-panel">
              Brand panel position
            </label>
            <select
              id="zoom-panel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={panelPosition}
              onChange={(event) => setPanelPosition(event.target.value)}
            >
              {PANEL_POSITIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="zoom-framing">
              Your camera framing
            </label>
            <select
              id="zoom-framing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={framing}
              onChange={(event) => setFraming(event.target.value)}
            >
              {FRAMING_PROFILES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="zoom-side">
              Where you sit
            </label>
            <select
              id="zoom-side"
              className={`mt-2 ${INPUT_CLASS}`}
              value={side}
              onChange={(event) => setSide(event.target.value)}
            >
              {FACE_SIDES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="zoom-scale">
              Text scale ({Number(nameScale).toFixed(1)}x)
            </label>
            <input
              id="zoom-scale"
              className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)]"
              type="range"
              min="0.6"
              max="2"
              step="0.1"
              value={nameScale}
              onChange={(event) => setNameScale(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowZone((value) => !value)}
            aria-pressed={showZone}
            className={GHOST_BTN}
          >
            {showZone ? "Hide face-safe zone" : "Show face-safe zone"}
          </button>
          <button
            type="button"
            onClick={() => setMirrored((value) => !value)}
            aria-pressed={mirrored}
            className={GHOST_BTN}
          >
            {mirrored ? "Unmirror preview" : "Mirror preview (self view)"}
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
            aria-label={`Zoom virtual background preview for ${name || "your background"}`}
            className={`mt-3 w-full rounded-lg ring-1 ring-[var(--border)] ${mirrored ? "-scale-x-100" : ""}`}
            style={{ aspectRatio: `${plan.width} / ${plan.height}` }}
          />
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Zoom mirrors your own self view by default — other participants always see the unmirrored
            version, so judge text placement with the mirror off.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Export size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${plan.width} × ${plan.height}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Zoom recommends {ZOOM_BACKGROUND_SPEC.recommended.width} × {ZOOM_BACKGROUND_SPEC.recommended.height} at 16:9
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy background layout summary" className={GHOST_BTN}>
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
            ["Aspect ratio", hasError ? "—" : plan.aspect],
            [
              "Face-safe zone",
              hasError
                ? "—"
                : `${Math.round(plan.zone.width)} × ${Math.round(plan.zone.height)} px (${Math.round(plan.zone.areaShare * 100)}% of frame)`,
            ],
            ["Brand panel covered by you", hasError ? "—" : `${Math.round(plan.overlapShare * 100)}%`],
            ["Name size", hasError ? "—" : `${plan.nameFont} px`],
            [
              `Gallery-legible floor (${GALLERY_TILE_WIDTH_PX} px tile)`,
              hasError ? "—" : `${Math.round(plan.minFont)} px`,
            ],
            [
              "Text contrast (WCAG 2.1)",
              hasError ? "—" : `${plan.contrast.toFixed(2)}:1 · ${plan.contrastPass ? "passes" : "below"} ${WCAG_LARGE_TEXT_RATIO}:1`,
            ],
            ["Edge safe margin", hasError ? "—" : `${plan.margin} px (5%)`],
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
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--danger)]">
            {plan.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        ) : null}

        {!hasError && plan.notes.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The image is drawn and saved entirely in your browser. Face-zone figures are typical webcam
        framings, not a measurement of your own camera — check the preview against your real video before
        an important call.
      </p>
    </main>
  );
}
