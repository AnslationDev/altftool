"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, IdCard, RotateCcw, Upload } from "lucide-react";

import {
  BACKGROUNDS,
  COMPLIANCE_RULES,
  DEFAULT_DPI,
  DEFAULT_GAP_MM,
  DEFAULT_MARGIN_MM,
  MAX_PRINT_DPI,
  MIN_PRINT_DPI,
  PHOTO_SPECS,
  PRINT_SHEETS,
  buildSheetCells,
  checkResolution,
  computeCropBox,
  computeGeometry,
  getBackground,
  planPrintSheet,
  toCssColor,
} from "../lib";

const DEFAULTS = {
  specId: "india-passport",
  sheetId: "4x6",
  backgroundId: "white",
  dpi: String(DEFAULT_DPI),
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  gapMm: String(DEFAULT_GAP_MM),
  marginMm: String(DEFAULT_MARGIN_MM),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DPI_CHOICES = [String(MIN_PRINT_DPI), "400", String(MAX_PRINT_DPI)];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Paint one spec-sized photo onto a canvas context. Drawing only — all of the
 * geometry comes from lib. */
function paintPhoto(ctx, { image, imageSize, geometry, background, zoom, offsetX, offsetY, x, y, width, height }) {
  ctx.fillStyle = toCssColor(background);
  ctx.fillRect(x, y, width, height);
  if (!image || !imageSize) return;
  const crop = computeCropBox({
    sourceWidthPx: imageSize.width,
    sourceHeightPx: imageSize.height,
    aspectRatio: geometry.aspectRatio,
    zoom,
    offsetX,
    offsetY,
  });
  if (crop.error) return;
  ctx.drawImage(image, crop.sx, crop.sy, crop.sWidth, crop.sHeight, x, y, width, height);
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export default function ToolHome() {
  const [specId, setSpecId] = useState(DEFAULTS.specId);
  const [sheetId, setSheetId] = useState(DEFAULTS.sheetId);
  const [backgroundId, setBackgroundId] = useState(DEFAULTS.backgroundId);
  const [dpi, setDpi] = useState(DEFAULTS.dpi);
  const [zoom, setZoom] = useState(DEFAULTS.zoom);
  const [offsetX, setOffsetX] = useState(DEFAULTS.offsetX);
  const [offsetY, setOffsetY] = useState(DEFAULTS.offsetY);
  const [gapMm, setGapMm] = useState(DEFAULTS.gapMm);
  const [marginMm, setMarginMm] = useState(DEFAULTS.marginMm);
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState(false);

  const previewRef = useRef(null);
  const objectUrlRef = useRef("");

  const dpiValue = toNumber(dpi);
  const geometry = useMemo(() => computeGeometry(specId, dpiValue), [specId, dpiValue]);
  const background = useMemo(() => getBackground(backgroundId), [backgroundId]);

  const layout = useMemo(
    () =>
      planPrintSheet({
        specId,
        sheetId,
        gapMm: toNumber(gapMm),
        marginMm: toNumber(marginMm),
      }),
    [specId, sheetId, gapMm, marginMm],
  );

  const resolution = useMemo(() => {
    if (!imageSize) return null;
    return checkResolution({
      sourceWidthPx: imageSize.width,
      sourceHeightPx: imageSize.height,
      specId,
    });
  }, [imageSize, specId]);

  const hasError = Boolean(geometry.error);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || hasError) return;
    canvas.width = geometry.widthPx;
    canvas.height = geometry.heightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paintPhoto(ctx, {
      image,
      imageSize,
      geometry,
      background,
      zoom,
      offsetX,
      offsetY,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });
  }, [geometry, hasError, image, imageSize, background, zoom, offsetX, offsetY]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const onFile = useCallback((event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLoadError("That file is not an image. Choose a JPG, PNG or WebP photo.");
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setFileName(file.name);
      setLoadError("");
      // A new photo has a different size and face position, so the previous
      // zoom/pan would frame the wrong part of it — start each upload centred.
      setZoom(DEFAULTS.zoom);
      setOffsetX(DEFAULTS.offsetX);
      setOffsetY(DEFAULTS.offsetY);
    };
    img.onerror = () => {
      setLoadError("That image could not be read. Try a different file.");
      setImage(null);
      setImageSize(null);
    };
    img.src = url;
  }, []);

  const downloadSingle = () => {
    if (hasError) return;
    const canvas = document.createElement("canvas");
    canvas.width = geometry.widthPx;
    canvas.height = geometry.heightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    paintPhoto(ctx, {
      image,
      imageSize,
      geometry,
      background,
      zoom,
      offsetX,
      offsetY,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });
    downloadCanvas(canvas, `passport-photo-${geometry.spec.id}-${geometry.dpi}dpi.png`);
  };

  const downloadSheet = () => {
    if (hasError || layout.error) return;
    const cells = buildSheetCells(layout, geometry.dpi);
    if (cells.error) return;
    const canvas = document.createElement("canvas");
    canvas.width = cells.widthPx;
    canvas.height = cells.heightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = toCssColor(BACKGROUNDS[0]);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const cell of cells.cells) {
      paintPhoto(ctx, {
        image,
        imageSize,
        geometry,
        background,
        zoom,
        offsetX,
        offsetY,
        x: cell.x,
        y: cell.y,
        width: cells.cellWidthPx,
        height: cells.cellHeightPx,
      });
    }
    downloadCanvas(canvas, `passport-photo-sheet-${layout.sheet.id}-${layout.total}up.png`);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Passport photo spec: ${geometry.spec.label}`,
      `Print size: ${geometry.spec.widthMm} x ${geometry.spec.heightMm} mm`,
      `Pixel size at ${geometry.dpi} dpi: ${geometry.widthPx} x ${geometry.heightPx} px`,
      `Head height (chin to crown): ${geometry.spec.headMinMm}-${geometry.spec.headMaxMm} mm, aim for ${num(geometry.headTargetMm)} mm`,
      `Background: ${geometry.spec.background}`,
      `Source: ${geometry.spec.source}`,
    ];
    if (!layout.error) {
      lines.push(
        `Print sheet: ${layout.total} copies on ${layout.sheet.label} (${layout.cols} x ${layout.rows}, ${layout.orientation})`,
      );
    }
    if (resolution && !resolution.error) lines.push(`Uploaded photo: ${resolution.message}`);
    return lines.join("\n");
  }, [geometry, hasError, layout, resolution]);

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
    setSpecId(DEFAULTS.specId);
    setSheetId(DEFAULTS.sheetId);
    setBackgroundId(DEFAULTS.backgroundId);
    setDpi(DEFAULTS.dpi);
    setZoom(DEFAULTS.zoom);
    setOffsetX(DEFAULTS.offsetX);
    setOffsetY(DEFAULTS.offsetY);
    setGapMm(DEFAULTS.gapMm);
    setMarginMm(DEFAULTS.marginMm);
    setCopied(false);
  };

  const headTopPercent = hasError ? 0 : geometry.crownGapFraction * 100;
  const headHeightPercent = hasError ? 0 : geometry.headTargetFraction * 100;
  const eyePercent = hasError ? 0 : geometry.eyeFromTopFraction * 100;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          Passport &amp; visa photos
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">AI Passport Photo Maker</h1>
        <h2 className="mt-1 text-lg font-semibold text-[var(--muted-foreground)]">
          Passport Photo Maker
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Crop a photo to an official size, line the head up against the published chin-to-crown
          band, and lay out a print sheet. Your photo is processed in the browser and never
          uploaded.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="photo-file">
              Your photo
            </label>
            <input
              id="photo-file"
              type="file"
              accept="image/*"
              onChange={onFile}
              className="mt-2 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              {fileName || "No photo yet — the preview shows the crop guides only."}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="spec-id">
              Photo standard
            </label>
            <select
              id="spec-id"
              className={`mt-2 ${INPUT_CLASS}`}
              value={specId}
              onChange={(event) => setSpecId(event.target.value)}
            >
              {PHOTO_SPECS.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.label} · {spec.widthMm}×{spec.heightMm} mm
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="dpi">
              Print resolution (dpi)
            </label>
            <select
              id="dpi"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dpi}
              onChange={(event) => setDpi(event.target.value)}
            >
              {DPI_CHOICES.map((value) => (
                <option key={value} value={value}>
                  {value} dpi
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="background-id">
              Background colour
            </label>
            <select
              id="background-id"
              className={`mt-2 ${INPUT_CLASS}`}
              value={backgroundId}
              onChange={(event) => setBackgroundId(event.target.value)}
            >
              {BACKGROUNDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sheet-id">
              Print sheet paper
            </label>
            <select
              id="sheet-id"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sheetId}
              onChange={(event) => setSheetId(event.target.value)}
            >
              {PRINT_SHEETS.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="zoom">
              Zoom ({num(zoom)}×)
            </label>
            <input
              id="zoom"
              type="range"
              min="1"
              max="4"
              step="0.01"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer accent-[var(--primary)]"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="offset-x">
              Move left / right
            </label>
            <input
              id="offset-x"
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={offsetX}
              onChange={(event) => setOffsetX(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer accent-[var(--primary)]"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="offset-y">
              Move up / down
            </label>
            <input
              id="offset-y"
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={offsetY}
              onChange={(event) => setOffsetY(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer accent-[var(--primary)]"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gap-mm">
              Gap between photos (mm)
            </label>
            <input
              id="gap-mm"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gapMm}
              onChange={(event) => setGapMm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="margin-mm">
              Sheet margin (mm)
            </label>
            <input
              id="margin-mm"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={marginMm}
              onChange={(event) => setMarginMm(event.target.value)}
            />
          </div>
        </div>
      </section>

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {loadError}
        </p>
      )}
      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {geometry.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Output size at {hasError ? DASH : `${geometry.dpi} dpi`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${geometry.widthPx} × ${geometry.heightPx} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Choose a valid size and resolution."
                : `${geometry.spec.widthMm} × ${geometry.spec.heightMm} mm · ${geometry.spec.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the photo specification to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all photo settings"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <div
              className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-md ring-1 ring-[var(--border)]"
              style={{ aspectRatio: hasError ? "1" : `${geometry.spec.widthMm} / ${geometry.spec.heightMm}` }}
            >
              <canvas ref={previewRef} className="block h-full w-full" aria-label="Passport photo preview" />
              {!hasError && (
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  <div
                    className="absolute inset-x-0 border-y-2 border-dashed border-[var(--primary)]/70"
                    style={{ top: `${headTopPercent}%`, height: `${headHeightPercent}%` }}
                  />
                  <div
                    className="absolute inset-x-0 border-t border-[var(--success)]"
                    style={{ top: `${eyePercent}%` }}
                  />
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Dashed band = head, chin to crown. Solid line = eye level.
            </p>
          </div>

          <dl className="divide-y divide-[var(--border)] text-sm">
            {[
              [
                "Head height (chin to crown)",
                hasError
                  ? DASH
                  : `${geometry.spec.headMinMm}–${geometry.spec.headMaxMm} mm (aim ${num(geometry.headTargetMm)} mm)`,
              ],
              [
                "Eye line from the bottom edge",
                hasError
                  ? DASH
                  : geometry.spec.eyeMinMm !== null
                    ? `${geometry.spec.eyeMinMm}–${geometry.spec.eyeMaxMm} mm`
                    : `${num(geometry.eyeFromBottomMm)} mm (guide)`,
              ],
              ["Required background", hasError ? DASH : geometry.spec.background],
              ["Megapixels in the output", hasError ? DASH : `${num(geometry.megapixels)} MP`],
              [
                "Print sheet",
                layout.error
                  ? DASH
                  : `${layout.total} copies · ${layout.cols} × ${layout.rows} ${layout.orientation}`,
              ],
              [
                "Paper wasted",
                layout.error ? DASH : `${num(layout.wastePercent)}%`,
              ],
              [
                "Uploaded photo",
                imageSize ? `${imageSize.width} × ${imageSize.height} px` : DASH,
              ],
              [
                "Effective print quality",
                resolution && !resolution.error ? `${Math.round(resolution.effectiveDpi)} dpi` : DASH,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {layout.error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {layout.error}
          </p>
        )}
        {resolution && !resolution.error && !resolution.ok && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {resolution.message}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadSingle}
            className={PRIMARY_BTN}
            disabled={hasError || !image}
            aria-label="Download the single passport photo as a PNG"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download photo
          </button>
          <button
            type="button"
            onClick={downloadSheet}
            className={GHOST_BTN}
            disabled={hasError || Boolean(layout.error) || !image}
            aria-label="Download the print sheet as a PNG"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download {layout.error ? "sheet" : `${layout.total}-up sheet`}
          </button>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Before you print</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {COMPLIANCE_RULES.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
              {rule}
            </li>
          ))}
        </ul>
        {!hasError && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">Standard used: {geometry.spec.source}.</p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Every supported size</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Standard
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Size (mm)
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Head (mm)
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  At 300 dpi
                </th>
              </tr>
            </thead>
            <tbody>
              {PHOTO_SPECS.map((spec) => {
                const geo = computeGeometry(spec.id, MIN_PRINT_DPI);
                return (
                  <tr key={spec.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{spec.label}</td>
                    <td className="py-2 pr-3 text-right">
                      {spec.widthMm} × {spec.heightMm}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {spec.headMinMm}–{spec.headMaxMm}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {geo.error ? DASH : `${geo.widthPx} × ${geo.heightPx} px`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Head alignment is guided, not automatic — line your chin and crown up with the dashed band
        yourself. Requirements change; check the current rules from the issuing authority before you
        submit. This tool does not replace an official acceptance check.
      </p>
    </main>
  );
}
