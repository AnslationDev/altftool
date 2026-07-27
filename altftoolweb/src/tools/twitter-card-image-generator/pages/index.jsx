"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, LayoutTemplate, RotateCcw } from "lucide-react";

import {
  CARD_TYPES,
  MAX_IMAGE_BYTES,
  SUPPORTED_FORMATS,
  TEXT_LIMITS,
  buildMetaTags,
  cardLayout,
  checkTextField,
  findCardType,
  formatBytes,
  rgbToHex,
  validateCardImage,
  wrapText,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const DEFAULTS = {
  typeId: "summary_large_image",
  title: "How to size an X card image so the preview never gets cropped",
  description:
    "The large card wants a 2:1 image of at least 300x157 px and under 5 MB. Here is the setup that works.",
  site: "@altftool",
  creator: "",
  imageUrl: "https://example.com/card.png",
  imageAlt: "Diagram of a 1200 by 600 pixel X card image",
  checkWidth: "1200",
  checkHeight: "600",
  checkKb: "320",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Resolve a theme token to a hex colour so the canvas and the colour inputs
 * never need a hardcoded value. The browser parses the token (whatever colour
 * space it is written in) and a 1x1 canvas reports the resulting RGB bytes.
 */
const readTokenHex = (name, fallbackToken) => {
  if (typeof window === "undefined" || typeof document === "undefined") return "";
  const styles = window.getComputedStyle(document.documentElement);
  const raw =
    styles.getPropertyValue(name).trim() ||
    (fallbackToken ? styles.getPropertyValue(fallbackToken).trim() : "");
  if (!raw) return "";
  try {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const ctx = probe.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "";
    ctx.fillStyle = raw;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return rgbToHex(r, g, b);
  } catch {
    return "";
  }
};

export default function ToolHome() {
  const [typeId, setTypeId] = useState(DEFAULTS.typeId);
  const [title, setTitle] = useState(DEFAULTS.title);
  const [description, setDescription] = useState(DEFAULTS.description);
  const [site, setSite] = useState(DEFAULTS.site);
  const [creator, setCreator] = useState(DEFAULTS.creator);
  const [imageUrl, setImageUrl] = useState(DEFAULTS.imageUrl);
  const [imageAlt, setImageAlt] = useState(DEFAULTS.imageAlt);
  const [checkWidth, setCheckWidth] = useState(DEFAULTS.checkWidth);
  const [checkHeight, setCheckHeight] = useState(DEFAULTS.checkHeight);
  const [checkKb, setCheckKb] = useState(DEFAULTS.checkKb);
  const [bgColor, setBgColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setBgColor((current) => current || readTokenHex("--card", "--background"));
    setTextColor((current) => current || readTokenHex("--foreground"));
    setAccentColor((current) => current || readTokenHex("--primary"));
  }, []);

  const cardType = findCardType(typeId) || CARD_TYPES[0];
  const canvasSize = cardType.recommended;
  const layout = useMemo(
    () => cardLayout(canvasSize.w, canvasSize.h),
    [canvasSize.w, canvasSize.h],
  );

  const meta = useMemo(
    () =>
      buildMetaTags({
        typeId,
        title,
        description,
        imageUrl: imageUrl.trim(),
        imageAlt,
        site,
        creator,
      }),
    [typeId, title, description, imageUrl, imageAlt, site, creator],
  );

  const titleField = checkTextField(title, TEXT_LIMITS.title);
  const descField = checkTextField(description, TEXT_LIMITS.description);
  const altField = checkTextField(imageAlt, TEXT_LIMITS.imageAlt);

  const check = useMemo(() => {
    const kb = toNumber(checkKb);
    return validateCardImage({
      width: toNumber(checkWidth),
      height: toNumber(checkHeight),
      bytes: Number.isFinite(kb) ? kb * 1024 : NaN,
      typeId,
    });
  }, [checkWidth, checkHeight, checkKb, typeId]);

  const checkError = Boolean(check.error);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || layout.error || !bgColor) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = layout.width;
    canvas.height = layout.height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, layout.width, layout.height);

    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, layout.width, layout.accentBarHeight);

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = textColor;
    ctx.font = `700 ${layout.titleSize}px ${FONT_STACK}`;
    const titleLines = wrapText(
      title,
      layout.contentWidth,
      (line) => ctx.measureText(line).width,
      layout.maxTitleLines,
    );
    let y = layout.titleTop;
    for (const line of titleLines) {
      ctx.fillText(line, layout.pad, y);
      y += layout.titleLine;
    }

    ctx.font = `400 ${layout.bodySize}px ${FONT_STACK}`;
    const bodyLines = wrapText(
      description,
      layout.contentWidth,
      (line) => ctx.measureText(line).width,
      layout.maxBodyLines,
    );
    y += layout.bodyLine * 0.4;
    for (const line of bodyLines) {
      ctx.fillText(line, layout.pad, y);
      y += layout.bodyLine;
    }

    const handle = meta.error ? "" : (site || creator || "").trim();
    if (handle) {
      ctx.font = `600 ${layout.handleSize}px ${FONT_STACK}`;
      ctx.fillStyle = accentColor;
      ctx.fillText(handle, layout.pad, layout.handleBaseline);
    }
  }, [layout, bgColor, textColor, accentColor, title, description, site, creator, meta.error]);

  useEffect(() => {
    draw();
  }, [draw]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `x-card-${cardType.metaValue}-${layout.width}x${layout.height}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const copyTags = async () => {
    if (meta.error) return;
    try {
      await navigator.clipboard.writeText(meta.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTypeId(DEFAULTS.typeId);
    setTitle(DEFAULTS.title);
    setDescription(DEFAULTS.description);
    setSite(DEFAULTS.site);
    setCreator(DEFAULTS.creator);
    setImageUrl(DEFAULTS.imageUrl);
    setImageAlt(DEFAULTS.imageAlt);
    setCheckWidth(DEFAULTS.checkWidth);
    setCheckHeight(DEFAULTS.checkHeight);
    setCheckKb(DEFAULTS.checkKb);
    setBgColor(readTokenHex("--card", "--background"));
    setTextColor(readTokenHex("--foreground"));
    setAccentColor(readTokenHex("--primary"));
    setCopied(false);
  };

  const counter = (field) => (
    <span
      className={
        field.isOver ? "text-[var(--danger)] font-semibold" : "text-[var(--muted-foreground)]"
      }
    >
      {field.length} / {field.limit}
      {field.isOver ? ` — X will cut ${field.overBy} characters` : ""}
    </span>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
          Link previews
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Twitter Card Image Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draw a card image at exactly the size X expects, download it as a PNG, and copy the
          twitter:card meta tags with the title and description already trimmed to the limits X
          enforces. Everything runs in your browser — nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-type">
              Card type
            </label>
            <select
              id="tc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={typeId}
              onChange={(event) => setTypeId(event.target.value)}
            >
              {CARD_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} — {type.ratioLabel}, {type.recommended.w}x{type.recommended.h}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{cardType.note}</p>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-title">
              Title
            </label>
            <input
              id="tc-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <p className="mt-1 text-xs">{counter(titleField)}</p>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-desc">
              Description
            </label>
            <textarea
              id="tc-desc"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <p className="mt-1 text-xs">{counter(descField)}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tc-site">
              Site handle
            </label>
            <input
              id="tc-site"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="@yourbrand"
              value={site}
              onChange={(event) => setSite(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-creator">
              Author handle (optional)
            </label>
            <input
              id="tc-creator"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="@author"
              value={creator}
              onChange={(event) => setCreator(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-url">
              Image URL that will go in twitter:image
            </label>
            <input
              id="tc-url"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-alt">
              Image alt text
            </label>
            <input
              id="tc-alt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
            />
            <p className="mt-1 text-xs">{counter(altField)}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tc-bg">
              Background colour
            </label>
            <input
              id="tc-bg"
              className={`mt-2 ${INPUT_CLASS} p-1`}
              type="color"
              value={bgColor}
              onChange={(event) => setBgColor(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-text">
              Text colour
            </label>
            <input
              id="tc-text"
              className={`mt-2 ${INPUT_CLASS} p-1`}
              type="color"
              value={textColor}
              onChange={(event) => setTextColor(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-accent">
              Accent colour
            </label>
            <input
              id="tc-accent"
              className={`mt-2 ${INPUT_CLASS} p-1`}
              type="color"
              value={accentColor}
              onChange={(event) => setAccentColor(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Card image to export
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {layout.error ? DASH : `${INT.format(layout.width)} x ${INT.format(layout.height)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {cardType.ratioLabel} · minimum {cardType.min.w}x{cardType.min.h} px · under{" "}
              {formatBytes(MAX_IMAGE_BYTES)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadPng}
              aria-label="Download the card image as PNG"
              className={GHOST_BTN}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
          <canvas
            ref={canvasRef}
            className="block h-auto w-full"
            role="img"
            aria-label={`Preview of the ${cardType.name} at ${layout.width} by ${layout.height} pixels`}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Meta tags</h2>
          <button
            type="button"
            onClick={copyTags}
            aria-label="Copy the generated meta tags"
            className={GHOST_BTN}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>
        {meta.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {meta.error}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="text-xs leading-6 whitespace-pre">
              <code>{meta.html}</code>
            </pre>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Check an image you already have</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-cw">
              Image width (px)
            </label>
            <input
              id="tc-cw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={checkWidth}
              onChange={(event) => setCheckWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tc-ch">
              Image height (px)
            </label>
            <input
              id="tc-ch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={checkHeight}
              onChange={(event) => setCheckHeight(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tc-kb">
              File size (KB)
            </label>
            <input
              id="tc-kb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={checkKb}
              onChange={(event) => setCheckKb(event.target.value)}
            />
          </div>
        </div>

        {checkError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {check.error}
          </p>
        )}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Aspect ratio",
              checkError ? DASH : `${NUM3.format(check.ratio)} : 1 (target ${cardType.ratioLabel})`,
            ],
            ["Megapixels", checkError ? DASH : NUM3.format(check.megapixels)],
            ["File size", checkError ? DASH : formatBytes(check.bytes)],
            [
              "Verdict",
              checkError
                ? DASH
                : check.ok
                  ? "Passes the card spec"
                  : `${check.problems.length} issue${check.problems.length > 1 ? "s" : ""} found`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!checkError && check.problems.length > 0 && (
          <ul className="mt-3 space-y-2" role="alert">
            {check.problems.map((problem) => (
              <li
                key={problem}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {problem}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Accepted formats: {SUPPORTED_FORMATS.join(", ")}. Animated GIFs render as a single still
          frame.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        X caches card data, so a change to your meta tags may take a while to appear on links that
        were already shared. Limits and rendering behaviour are set by the platform and can change —
        check the current developer documentation before a large campaign.
      </p>
    </main>
  );
}
