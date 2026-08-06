"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheck, Copy, RotateCcw, Store, TriangleAlert, X } from "lucide-react";

import {
  ALLOWED_FORMATS,
  MAX_FILE_SIZE_MB,
  MAX_MEGAPIXELS,
  MAX_SIDE_PX,
  RECOMMENDED_SIDE_PX,
  STORE_RATIOS,
  ZOOM_MIN_SIDE_PX,
  checkShopifyImage,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  pass: "text-[var(--success)]",
  warn: "text-[var(--warning)]",
  fail: "text-[var(--danger)]",
};

const DEFAULTS = {
  width: "2048",
  height: "2048",
  fileSizeMB: "2.4",
  format: "jpg",
  storeRatio: "square",
};

const PRESETS = [
  ["Shopify square", "2048", "2048"],
  ["4:5 portrait", "1600", "2000"],
  ["3:2 landscape", "2400", "1600"],
];

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return Number.NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : Number.NaN;
};

function StatusIcon({ status }) {
  if (status === "pass") return <CircleCheck className={`h-4 w-4 ${STATUS_STYLE.pass}`} aria-hidden="true" />;
  if (status === "warn") return <TriangleAlert className={`h-4 w-4 ${STATUS_STYLE.warn}`} aria-hidden="true" />;
  return <X className={`h-4 w-4 ${STATUS_STYLE.fail}`} aria-hidden="true" />;
}

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, next) => setValues((prev) => ({ ...prev, [key]: next }));

  const result = useMemo(
    () =>
      checkShopifyImage({
        width: toNumber(values.width),
        height: toNumber(values.height),
        fileSizeMB: toNumber(values.fileSizeMB),
        format: values.format,
        storeRatio: values.storeRatio,
      }),
    [values]
  );

  const failed = Boolean(result.error);

  const verdictText = failed
    ? "—"
    : result.verdict === "pass"
      ? "Upload-ready"
      : result.verdict === "warn"
        ? "Uploads, but not ideal"
        : "Shopify will reject this file";

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Shopify Product Image Check",
      `${values.width} x ${values.height} px · ${num(result.megapixels)} MP · ${result.ratio.toFixed(2)}:1`,
      `Store standard: ${result.targetRatio.label}`,
      `Verdict: ${verdictText}`,
      "",
      ...result.checks.map((check) => `[${check.status.toUpperCase()}] ${check.label}: ${check.detail}`),
    ].join("\n");
  }, [failed, result, values, verdictText]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Store className="h-4 w-4" aria-hidden="true" />
          Storefront images
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Shopify Product Image Spec Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check a product photo against Shopify&apos;s {MAX_MEGAPIXELS} megapixel and {MAX_FILE_SIZE_MB} MB
          limits, the {ZOOM_MIN_SIDE_PX} px zoom threshold and the single aspect ratio your collection
          grid depends on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shp-width">
              Width (px)
            </label>
            <input
              id="shp-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={values.width}
              onChange={(event) => setField("width", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shp-height">
              Height (px)
            </label>
            <input
              id="shp-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={values.height}
              onChange={(event) => setField("height", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shp-size">
              File size (MB)
            </label>
            <input
              id="shp-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={values.fileSizeMB}
              onChange={(event) => setField("fileSizeMB", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shp-format">
              File type
            </label>
            <select
              id="shp-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.format}
              onChange={(event) => setField("format", event.target.value)}
            >
              {["jpg", "png", "webp", "heic", "gif", "tiff", "svg", "psd", "bmp"].map((ext) => (
                <option key={ext} value={ext}>
                  {ext.toUpperCase()}
                  {ALLOWED_FORMATS.includes(ext) ? "" : " (not supported)"}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="shp-ratio">
              Your store&apos;s standard aspect ratio
            </label>
            <select
              id="shp-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.storeRatio}
              onChange={(event) => setField("storeRatio", event.target.value)}
            >
              {STORE_RATIOS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Shopify recommends one ratio across every product image so collection grids line up.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map(([label, width, height]) => (
            <button
              key={label}
              type="button"
              onClick={() => setValues((prev) => ({ ...prev, width, height }))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Verdict
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">{verdictText}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to run the check."
                : `${num(result.megapixels)} MP · shortest side ${result.shortest} px · zoom ${
                    result.zoomReady ? "on" : "off"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the Shopify image check report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed ? [] : result.checks).map((check) => (
            <div key={check.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="flex shrink-0 items-center gap-2 font-semibold">
                <StatusIcon status={check.status} />
                {check.label}
              </dt>
              <dd className="text-[var(--muted-foreground)] sm:text-right">{check.detail}</dd>
            </div>
          ))}
          {failed && (
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-[var(--muted-foreground)]">Checks</dt>
              <dd className="text-right font-semibold">—</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The rules being applied</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <tbody>
              {[
                ["Maximum resolution", `${MAX_MEGAPIXELS} megapixels`],
                ["Maximum dimension", `${MAX_SIDE_PX} px per side`],
                ["Maximum file size", `${MAX_FILE_SIZE_MB} MB`],
                ["Zoom threshold", `${ZOOM_MIN_SIDE_PX} px on the shortest side`],
                ["Recommended square", `${RECOMMENDED_SIDE_PX} x ${RECOMMENDED_SIDE_PX} px`],
                ["Supported types", ALLOWED_FORMATS.join(", ").toUpperCase()],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="py-2 pr-3 text-left font-medium text-[var(--muted-foreground)]">
                    {label}
                  </th>
                  <td className="py-2 text-right font-semibold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Themes crop product images differently, so a photo that passes here can still be cropped by
        your collection grid. Upload the largest file within the limits and let Shopify generate the
        smaller variants rather than resizing by hand.
      </p>
    </main>
  );
}
