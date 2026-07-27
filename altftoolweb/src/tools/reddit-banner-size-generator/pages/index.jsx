"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Frame, RotateCcw, Upload } from "lucide-react";

import {
  BANNER_PRESETS,
  ICON_UPLOAD_SIZE,
  OLD_HEADER_MAX_H,
  OLD_HEADER_MAX_W,
  buildRedditReport,
  formatBytes,
  ratioLabel,
  visibleBannerRect,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const VERDICT_STYLE = {
  sharp: "text-[var(--success)]",
  soft: "text-[var(--muted-foreground)]",
  poor: "text-[var(--danger)]",
};

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [presetId, setPresetId] = useState("banner-384");
  const [bannerH, setBannerH] = useState("384");
  const [image, setImage] = useState(null);
  const [manualW, setManualW] = useState("2400");
  const [manualH, setManualH] = useState("600");
  const [showSafe, setShowSafe] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const bannerW = 1920;
  const height = toNumber(bannerH);
  const srcW = image ? image.width : toNumber(manualW);
  const srcH = image ? image.height : toNumber(manualH);

  const report = useMemo(
    () => buildRedditReport({ bannerW, bannerH: height, srcW, srcH, iconUploadSize: ICON_UPLOAD_SIZE }),
    [height, srcW, srcH],
  );

  const drawBanner = useCallback(
    (canvas) => {
      if (!canvas || !Number.isFinite(height) || height <= 0) return false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      canvas.width = bannerW;
      canvas.height = height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (!image) return true;

      const crop = visibleBannerRect({
        bannerW: image.width,
        bannerH: image.height,
        viewW: bannerW,
        viewH: height,
      });
      if (crop.error) return false;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image.element, crop.x, crop.y, crop.w, crop.h, 0, 0, bannerW, height);
      return true;
    },
    [image, height],
  );

  useEffect(() => {
    drawBanner(canvasRef.current);
  }, [drawBanner]);

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

  const download = () => {
    const canvas = document.createElement("canvas");
    if (!drawBanner(canvas)) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `reddit-banner-${bannerW}x${Math.round(height)}.png`;
    link.click();
  };

  const applyPreset = (id) => {
    const preset = BANNER_PRESETS.find((item) => item.id === id);
    setPresetId(id);
    if (preset) setBannerH(String(preset.height));
  };

  const summary = useMemo(() => {
    if (report.error) return "";
    return [
      "Reddit Banner Size Generator",
      `Banner: ${bannerW} x ${NUM.format(report.bannerH)} px (${ratioLabel(bannerW, report.bannerH)})`,
      `Artwork supplied: ${srcW} x ${srcH} px — ${report.quality.note}`,
      `Safe zone: centre ${NUM.format(report.zone.w)} px wide (${NUM1.format(report.safePctW)}% of the banner)`,
      `Keep ${NUM.format(report.marginSide)} px clear on each side`,
      `Old Reddit header: ${report.oldHeader.width} x ${report.oldHeader.height} px (max ${OLD_HEADER_MAX_W} x ${OLD_HEADER_MAX_H})`,
      `Community icon: upload ${ICON_UPLOAD_SIZE} x ${ICON_UPLOAD_SIZE} px; thinnest usable stroke ${NUM1.format(
        report.icon.rows[report.icon.rows.length - 1].minSourceStroke,
      )} px in that file`,
    ].join("\n");
  }, [report, srcW, srcH]);

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
    setPresetId("banner-384");
    setBannerH("384");
    setImage(null);
    setManualW("2400");
    setManualH("600");
    setShowSafe(true);
    setCopied(false);
  };

  const safeStyle = report.error
    ? null
    : {
        left: `${(report.zone.x / bannerW) * 100}%`,
        width: `${(report.zone.w / bannerW) * 100}%`,
      };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Frame className="h-4 w-4" aria-hidden="true" />
          Subreddit assets
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Reddit Banner Size Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A subreddit banner is painted edge to edge, so a phone shows far less of it than a wide
          monitor. Work out the centre strip that survives every screen, fit the same artwork into the
          old Reddit 500 x 100 header, and check the community icon at the sizes Reddit actually draws it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rd-file">
              Banner artwork (stays in your browser)
            </label>
            <input
              id="rd-file"
              type="file"
              accept="image/*"
              onChange={onFile}
              className="mt-2 block w-full cursor-pointer rounded-md border border-dashed border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-4 file:text-sm file:font-semibold file:text-[var(--primary-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
            <p className="mt-2 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              {image
                ? `${image.name} — ${image.width} x ${image.height} px`
                : "No file yet — the measurements below still apply to your design."}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="rd-preset">
              Banner height preset
            </label>
            <select
              id="rd-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {BANNER_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.width} x {item.height}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-height">
              Banner height (px)
            </label>
            <input
              id="rd-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="2000"
              step="16"
              value={bannerH}
              onChange={(event) => setBannerH(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rd-w">
              Artwork width (px)
            </label>
            <input
              id="rd-w"
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
            <label className={LABEL_CLASS} htmlFor="rd-h">
              Artwork height (px)
            </label>
            <input
              id="rd-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={manualH}
              disabled={Boolean(image)}
              onChange={(event) => setManualH(event.target.value)}
            />
          </div>
        </div>
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Centre strip visible on every screen
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : `${NUM.format(report.zone.w)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error ? DASH : `of a ${bannerW} x ${NUM.format(report.bannerH)} px banner`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={Boolean(report.error)}
              aria-label="Copy the Reddit banner report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!image || Boolean(report.error)}
              aria-label="Download the banner at Reddit upload size"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export banner
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Banner aspect ratio", report.error ? DASH : ratioLabel(bannerW, report.bannerH)],
            ["Safe width", report.error ? DASH : `${NUM1.format(report.safePctW)}% of the banner`],
            ["Keep clear each side", report.error ? DASH : `${NUM.format(report.marginSide)} px`],
            ["Artwork quality", report.error ? DASH : report.quality.note],
            [
              "Old Reddit header fit",
              report.error
                ? DASH
                : `${report.oldHeader.width} x ${report.oldHeader.height} px · about ${formatBytes(report.oldHeader.estBytes)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd
                className={`text-right font-semibold ${
                  label === "Artwork quality" && !report.error ? VERDICT_STYLE[report.quality.verdict] : ""
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {!report.error && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Banner preview</h2>
              <button
                type="button"
                aria-pressed={showSafe}
                onClick={() => setShowSafe((value) => !value)}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  showSafe
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                Safe strip
              </button>
            </div>
            <div
              className="relative mt-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]"
              style={{ aspectRatio: `${bannerW} / ${Math.max(1, report.bannerH)}` }}
            >
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Subreddit banner preview" />
              {showSafe && safeStyle && (
                <div
                  className="absolute top-0 bottom-0 border-x-2 border-dashed border-[var(--primary)]"
                  style={safeStyle}
                  role="img"
                  aria-label={`Safe strip ${NUM.format(report.zone.w)} pixels wide`}
                />
              )}
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Keep the community name, mascot and any call to action inside the dashed strip. The
              overlay is a guide and is never drawn into the exported PNG.
            </p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">What each screen shows</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Screen</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Header box</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Visible banner</th>
                    <th scope="col" className="py-2 text-right font-semibold">Kept</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rects.map((rect) => (
                    <tr key={rect.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{rect.label}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                        {rect.viewW} x {rect.viewH}
                      </td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">
                        {NUM.format(rect.w)} x {NUM.format(rect.h)}
                      </td>
                      <td className="py-2 text-right">{NUM1.format(rect.keptPct)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Community icon legibility</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Draw the icon at {ICON_UPLOAD_SIZE} x {ICON_UPLOAD_SIZE} px. These are the sizes Reddit
              scales it down to, and the thinnest line in your {ICON_UPLOAD_SIZE} px file that still
              lands on a device pixel at each one.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Slot</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Rendered</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Scale</th>
                    <th scope="col" className="py-2 text-right font-semibold">Min stroke in source</th>
                  </tr>
                </thead>
                <tbody>
                  {report.icon.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right">{row.px} px</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {NUM1.format(row.shrink * 100)}%
                      </td>
                      <td className="py-2 text-right">{NUM1.format(row.minSourceStroke)} px</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reddit changes its community appearance settings from time to time and the header height is a
        moderator setting, not a fixed platform constant — confirm the current options under Mod Tools
        before finalising artwork.
      </p>
    </main>
  );
}
