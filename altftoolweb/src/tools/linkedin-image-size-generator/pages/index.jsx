"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, LayoutTemplate, RotateCcw, Upload } from "lucide-react";

import {
  LINKEDIN_PRESETS,
  buildReport,
  computeContainBox,
  computeCoverCrop,
  formatBytes,
  ratioLabel,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SELECTION = ["square-post", "portrait-post", "landscape-post", "article-cover", "profile-background"];
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const VERDICT_STYLE = {
  sharp: "text-[var(--success)]",
  soft: "text-[var(--muted-foreground)]",
  poor: "text-[var(--danger)]",
};

const VERDICT_LABEL = { sharp: "Sharp", soft: "Slightly soft", poor: "Too small" };

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [image, setImage] = useState(null);
  const [manualW, setManualW] = useState("3000");
  const [manualH, setManualH] = useState("2000");
  const [fitMode, setFitMode] = useState("cover");
  const [format, setFormat] = useState("png");
  const [padColor, setPadColor] = useState("light");
  const [selected, setSelected] = useState(DEFAULT_SELECTION);
  const [previewId, setPreviewId] = useState("square-post");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const srcW = image ? image.width : toNumber(manualW);
  const srcH = image ? image.height : toNumber(manualH);

  const report = useMemo(() => {
    if (!Number.isFinite(srcW) || !Number.isFinite(srcH)) {
      return { error: "Enter the artwork width and height in pixels, or upload an image." };
    }
    return buildReport({ srcW, srcH, presetIds: selected, format });
  }, [srcW, srcH, selected, format]);

  const preset = useMemo(
    () => LINKEDIN_PRESETS.find((item) => item.id === previewId) || LINKEDIN_PRESETS[0],
    [previewId],
  );

  const previewRow = useMemo(
    () => (report.error ? null : report.rows.find((row) => row.id === preset.id) || report.rows[0]),
    [report, preset],
  );

  const drawToCanvas = useCallback(
    (canvas, target) => {
      if (!canvas || !target) return false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      canvas.width = target.width;
      canvas.height = target.height;
      ctx.clearRect(0, 0, target.width, target.height);

      let fill = padColor === "dark" ? "black" : "white";
      if (padColor === "auto" && typeof document !== "undefined") {
        const token = getComputedStyle(document.documentElement).getPropertyValue("--card").trim();
        if (token) fill = token;
      }
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, target.width, target.height);

      if (!image) return true;
      ctx.imageSmoothingQuality = "high";

      if (fitMode === "cover") {
        const crop = computeCoverCrop({
          srcW: image.width,
          srcH: image.height,
          targetW: target.width,
          targetH: target.height,
        });
        if (crop.error) return false;
        ctx.drawImage(image.element, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, target.width, target.height);
      } else {
        const box = computeContainBox({
          srcW: image.width,
          srcH: image.height,
          targetW: target.width,
          targetH: target.height,
        });
        if (box.error) return false;
        ctx.drawImage(image.element, box.dx, box.dy, box.dw, box.dh);
      }
      return true;
    },
    [image, fitMode, padColor],
  );

  useEffect(() => {
    drawToCanvas(canvasRef.current, preset);
  }, [drawToCanvas, preset]);

  const onFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      setImage({ element: el, width: el.naturalWidth, height: el.naturalHeight, name: file.name, url });
      setManualW(String(el.naturalWidth));
      setManualH(String(el.naturalHeight));
    };
    el.src = url;
  };

  const download = (target) => {
    const canvas = document.createElement("canvas");
    if (!drawToCanvas(canvas, target)) return;
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    const url = canvas.toDataURL(mime, 0.92);
    const link = document.createElement("a");
    link.href = url;
    link.download = `linkedin-${target.id}-${target.width}x${target.height}.${format === "jpeg" ? "jpg" : "png"}`;
    link.click();
  };

  const downloadAll = () => {
    if (report.error) return;
    report.rows.forEach((row, index) => {
      setTimeout(() => download(row), index * 220);
    });
  };

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (report.error) return "";
    return [
      "LinkedIn Image Size Generator",
      `Source artwork: ${srcW} x ${srcH} px (${ratioLabel(srcW, srcH)})`,
      `Fit: ${fitMode === "cover" ? "Cover (centre crop)" : "Contain (letterbox)"} · Export: ${format.toUpperCase()}`,
      "",
      ...report.rows.map(
        (row) =>
          `${row.label}: ${row.width} x ${row.height} (${ratioLabel(row.width, row.height)}) — ${
            VERDICT_LABEL[row.verdict]
          }, ${NUM.format(row.scale)}x scale, ${NUM.format(row.croppedPct)}% cropped`,
      ),
    ].join("\n");
  }, [report, srcW, srcH, fitMode, format]);

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
    setImage(null);
    setManualW("3000");
    setManualH("2000");
    setFitMode("cover");
    setFormat("png");
    setPadColor("light");
    setSelected(DEFAULT_SELECTION);
    setPreviewId("square-post");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
          LinkedIn sizes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">LinkedIn Image Size Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check one piece of artwork against every LinkedIn slot — feed posts, article covers, profile
          banners and Company Page assets — then export each one at the exact pixel size.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="li-file">
          Artwork (stays in your browser)
        </label>
        <input
          id="li-file"
          type="file"
          accept="image/*"
          onChange={onFile}
          className="mt-2 block w-full cursor-pointer rounded-md border border-dashed border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-4 file:text-sm file:font-semibold file:text-[var(--primary-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
        <p className="mt-2 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          {image ? `${image.name} — ${image.width} x ${image.height} px` : "No file yet — enter dimensions below to plan sizes."}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="li-w">
              Artwork width (px)
            </label>
            <input
              id="li-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={manualW}
              disabled={Boolean(image)}
              onChange={(event) => setManualW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="li-h">
              Artwork height (px)
            </label>
            <input
              id="li-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={manualH}
              disabled={Boolean(image)}
              onChange={(event) => setManualH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="li-fit">
              Fit
            </label>
            <select
              id="li-fit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fitMode}
              onChange={(event) => setFitMode(event.target.value)}
            >
              <option value="cover">Cover — fill and centre-crop</option>
              <option value="contain">Contain — fit whole image, pad edges</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="li-format">
              Export format
            </label>
            <select
              id="li-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              <option value="png">PNG — flat colour, logos, text</option>
              <option value="jpeg">JPEG — photos, smaller files</option>
            </select>
          </div>
          {fitMode === "contain" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="li-pad">
                Padding colour
              </label>
              <select
                id="li-pad"
                className={`mt-2 ${INPUT_CLASS}`}
                value={padColor}
                onChange={(event) => setPadColor(event.target.value)}
              >
                <option value="light">White</option>
                <option value="dark">Black</option>
                <option value="auto">Match current theme surface</option>
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Sizes to export</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {LINKEDIN_PRESETS.map((item) => {
            const on = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(item.id)}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  on
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Sizes ready to export
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{report.rows.length}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  from {srcW} x {srcH} px source ({ratioLabel(srcW, srcH)})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyResult} aria-label="Copy the LinkedIn size report" className={GHOST_BTN}>
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={downloadAll}
                  disabled={!image}
                  aria-label="Download every selected LinkedIn size"
                  className={`${PRIMARY_BTN} disabled:opacity-50`}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export all
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Source aspect ratio", ratioLabel(srcW, srcH)],
                ["Sizes needing a bigger source", String(report.poorCount)],
                ["Sizes that will soften slightly", String(report.softCount)],
                [
                  "Fit mode",
                  fitMode === "cover" ? "Cover — fills the frame, crops the overflow" : "Contain — whole image, padded edges",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Crop preview</h2>
              <select
                aria-label="Preset to preview"
                className={`${INPUT_CLASS} max-w-[15rem]`}
                value={preset.id}
                onChange={(event) => setPreviewId(event.target.value)}
              >
                {LINKEDIN_PRESETS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3">
              <canvas
                ref={canvasRef}
                className="mx-auto block h-auto w-full max-w-full rounded"
                aria-label={`Preview of ${preset.label} at ${preset.width} by ${preset.height} pixels`}
              />
            </div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              {preset.width} x {preset.height} px · {ratioLabel(preset.width, preset.height)} · {preset.display}
            </p>
            {previewRow && (
              <p className={`mt-1 text-sm font-semibold ${VERDICT_STYLE[previewRow.verdict]}`}>{previewRow.note}</p>
            )}
            {image && (
              <button type="button" onClick={() => download(preset)} className={`mt-4 ${PRIMARY_BTN}`}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download this size
              </button>
            )}
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Per-size report</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Size</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Pixels</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Scale</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Cropped</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Est. file</th>
                    <th scope="col" className="py-2 font-semibold">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                        {row.width} x {row.height}
                      </td>
                      <td className="py-2 pr-3 text-right">{NUM.format(row.scale)}x</td>
                      <td className="py-2 pr-3 text-right">{NUM.format(row.croppedPct)}%</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{formatBytes(row.estBytes)}</td>
                      <td className={`py-2 font-semibold ${VERDICT_STYLE[row.verdict]}`}>{VERDICT_LABEL[row.verdict]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        File-size figures are estimates for planning, not the exact bytes your browser writes. LinkedIn
        occasionally adjusts its display boxes — confirm critical campaign creative in LinkedIn Campaign
        Manager before you spend.
      </p>
    </main>
  );
}
