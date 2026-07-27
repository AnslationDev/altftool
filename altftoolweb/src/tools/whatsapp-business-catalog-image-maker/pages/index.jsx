"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, ShoppingBag } from "lucide-react";
import {
  BADGE_POSITIONS,
  EXPORT_SIZES,
  MIN_READABLE_PT,
  THEMES,
  WHATSAPP_CATALOG_SPEC,
  buildCatalogPlan,
  checkCatalogImage,
  hslCss,
} from "../lib";

const FONT_STACK = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const DEFAULTS = {
  size: String(WHATSAPP_CATALOG_SPEC.recommendedPx),
  themeId: "paper",
  productName: "Handwoven Cotton Tote",
  price: "₹1,499",
  badgeText: "FREE DELIVERY",
  badgePosition: "bottom-left",
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
    .replace(/^-+|-+$/g, "") || "product";

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

/** Greedy wrap using the live canvas metrics; the character budget itself is computed in lib. */
function wrapOnCanvas(ctx, text, maxWidth) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) current = candidate;
    else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

/** Rendering only — all geometry comes from lib.js. */
function paintTile(canvas, plan, scale = 1) {
  if (!canvas || !plan || plan.error) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { size } = plan;
  canvas.width = Math.round(size * scale);
  canvas.height = Math.round(size * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = hslCss(plan.theme.bg);
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = hslCss(plan.theme.accent, 0.12);
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.42, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = hslCss(plan.theme.accent, 0.5);
  ctx.lineWidth = Math.max(2, size * 0.006);
  ctx.setLineDash([size * 0.02, size * 0.02]);
  ctx.strokeRect(plan.margin, plan.margin, plan.column, plan.column * 0.58);
  ctx.setLineDash([]);
  ctx.font = `600 ${Math.round(size * 0.03)}px ${FONT_STACK}`;
  ctx.fillStyle = hslCss(plan.theme.ink, 0.5);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("drop your product photo here", size / 2, plan.margin + plan.column * 0.29);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `800 ${plan.name.fontSize}px ${FONT_STACK}`;
  const lines = wrapOnCanvas(ctx, plan.name.text, plan.column);
  const lineHeight = plan.name.fontSize * plan.name.lineHeightRatio;
  const priceHeight = plan.price.text ? plan.price.fontSize * 1.4 : 0;
  const badgeSpace = plan.badge && plan.badge.y > size * 0.5 ? plan.badge.height + plan.margin * 0.4 : 0;
  const blockTop = size - plan.margin - badgeSpace - priceHeight - lines.length * lineHeight;

  ctx.fillStyle = hslCss(plan.theme.ink);
  lines.forEach((line, index) => {
    ctx.fillText(line, plan.margin, blockTop + index * lineHeight);
  });

  if (plan.price.text) {
    ctx.font = `800 ${plan.price.fontSize}px ${FONT_STACK}`;
    ctx.fillStyle = hslCss(plan.theme.accent);
    ctx.fillText(plan.price.text, plan.margin, blockTop + lines.length * lineHeight + plan.price.fontSize * 0.16);
  }

  if (plan.badge) {
    ctx.fillStyle = hslCss(plan.theme.accent);
    roundedRect(ctx, plan.badge.x, plan.badge.y, plan.badge.width, plan.badge.height, plan.badge.height / 2);
    ctx.fill();
    ctx.font = `700 ${plan.badge.fontSize}px ${FONT_STACK}`;
    ctx.fillStyle = hslCss(plan.theme.bg);
    ctx.textBaseline = "middle";
    ctx.fillText(plan.badge.text, plan.badge.x + plan.badge.padding, plan.badge.y + plan.badge.height / 2);
    ctx.textBaseline = "top";
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export default function ToolHome() {
  const [size, setSize] = useState(DEFAULTS.size);
  const [themeId, setThemeId] = useState(DEFAULTS.themeId);
  const [productName, setProductName] = useState(DEFAULTS.productName);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [badgeText, setBadgeText] = useState(DEFAULTS.badgeText);
  const [badgePosition, setBadgePosition] = useState(DEFAULTS.badgePosition);
  const [copied, setCopied] = useState(false);
  const [exportInfo, setExportInfo] = useState(null);
  const previewRef = useRef(null);
  const tileRef = useRef(null);

  const plan = useMemo(
    () => buildCatalogPlan({ size: Number(size), themeId, productName, price, badgeText, badgePosition }),
    [size, themeId, productName, price, badgeText, badgePosition],
  );

  useEffect(() => {
    if (plan.error) return;
    paintTile(previewRef.current, plan, 640 / plan.size);
    paintTile(tileRef.current, plan, Math.round(plan.tile.tilePt) / plan.size);
  }, [plan]);

  const download = useCallback(() => {
    if (plan.error || typeof document === "undefined") return;
    const offscreen = document.createElement("canvas");
    paintTile(offscreen, plan, 1);
    const filename = `${slugify(productName)}-catalog-${plan.size}.png`;
    offscreen.toBlob((blob) => {
      if (!blob) return;
      setExportInfo({ bytes: blob.size, px: plan.size });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [plan, productName]);

  const uploadCheck = useMemo(() => {
    if (!exportInfo) return null;
    return checkCatalogImage({ width: exportInfo.px, height: exportInfo.px, bytes: exportInfo.bytes });
  }, [exportInfo]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "WhatsApp Business catalogue image",
      `Export: ${plan.size} x ${plan.size} px (1:1)`,
      `Theme: ${plan.theme.name}`,
      `Product name: ${plan.name.text} (${plan.name.text.length} of about ${plan.name.budget} characters per line)`,
      `Name size: ${plan.name.fontSize} px · grid-legible floor ${Math.round(plan.minFont)} px`,
      `Catalogue tile: ${Math.round(plan.tile.tilePt)} pt wide on a ${plan.tile.phoneWidthPt} pt phone`,
      `Corner-safe inset: ${plan.corner.inset.toFixed(1)} px`,
      `Name contrast: ${plan.nameContrast.toFixed(2)}:1`,
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
    setSize(DEFAULTS.size);
    setThemeId(DEFAULTS.themeId);
    setProductName(DEFAULTS.productName);
    setPrice(DEFAULTS.price);
    setBadgeText(DEFAULTS.badgeText);
    setBadgePosition(DEFAULTS.badgePosition);
    setExportInfo(null);
    setCopied(false);
  };

  const hasError = Boolean(plan.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Catalogue images
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">WhatsApp Business Catalog Image Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build square product tiles that meet WhatsApp&apos;s catalogue rules — 500 px minimum, under 5 MB —
          with type sized so it still reads once the grid shrinks the image to a thumbnail.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wa-name">
              Product name
            </label>
            <input
              id="wa-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={80}
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-price">
              Price label (optional)
            </label>
            <input
              id="wa-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={20}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-badge">
              Badge text (optional)
            </label>
            <input
              id="wa-badge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={24}
              value={badgeText}
              onChange={(event) => setBadgeText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-badge-pos">
              Badge position
            </label>
            <select
              id="wa-badge-pos"
              className={`mt-2 ${INPUT_CLASS}`}
              value={badgePosition}
              onChange={(event) => setBadgePosition(event.target.value)}
            >
              {BADGE_POSITIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-theme">
              Theme
            </label>
            <select
              id="wa-theme"
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
            <label className={LABEL_CLASS} htmlFor="wa-size">
              Export size (square)
            </label>
            <select
              id="wa-size"
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
          <div className="mt-3 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
            <canvas
              ref={previewRef}
              role="img"
              aria-label={`Catalogue tile preview for ${productName || "your product"}`}
              className="aspect-square w-full max-w-[360px] rounded-xl ring-1 ring-[var(--border)]"
            />
            <div className="text-center">
              <canvas
                ref={tileRef}
                role="img"
                aria-label="How the tile looks at catalogue grid size"
                className="mx-auto aspect-square rounded-lg ring-1 ring-[var(--border)]"
                style={{ width: `${Math.round(plan.tile.tilePt)}px` }}
              />
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Actual grid size: {Math.round(plan.tile.tilePt)} pt
              </p>
            </div>
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
              {hasError ? "—" : `${plan.size} × ${plan.size}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Square 1:1 · {WHATSAPP_CATALOG_SPEC.minPx} px minimum, under{" "}
              {Math.round(WHATSAPP_CATALOG_SPEC.maxUploadBytes / (1024 * 1024))} MB
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy catalogue image summary" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all catalogue options" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Product name size", hasError ? "—" : `${plan.name.fontSize} px`],
            [
              `Grid-legible floor (${MIN_READABLE_PT} pt in the tile)`,
              hasError ? "—" : `${Math.round(plan.minFont)} px`,
            ],
            [
              "Characters per line",
              hasError ? "—" : `${plan.name.text.length} used of about ${plan.name.budget}`,
            ],
            ["Catalogue tile width", hasError ? "—" : `${Math.round(plan.tile.tilePt)} pt (2 per row)`],
            ["Corner-safe inset", hasError ? "—" : `${plan.corner.inset.toFixed(1)} px`],
            ["Outer margin", hasError ? "—" : `${plan.margin} px`],
            ["Name contrast (WCAG 2.1)", hasError ? "—" : `${plan.nameContrast.toFixed(2)}:1`],
            ["Badge contrast", hasError || !plan.badge ? "—" : `${plan.badgeContrast.toFixed(2)}:1`],
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
        Tiles are drawn and exported in your browser. The dashed area marks where to composite your own
        product photo before uploading. WhatsApp reviews catalogue items against its commerce policy, and
        its limits can change — check the current requirements before a bulk upload.
      </p>
    </main>
  );
}
