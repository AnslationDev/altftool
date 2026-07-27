"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheck, Copy, Package, RotateCcw, TriangleAlert, X } from "lucide-react";

import {
  ALLOWED_FORMATS,
  IMAGE_ROLES,
  MAX_FILE_SIZE_MB,
  MIN_LONGEST_SIDE_PX,
  MIN_PRODUCT_FILL_PCT,
  RECOMMENDED_LONGEST_SIDE_PX,
  ZOOM_LONGEST_SIDE_PX,
  checkAmazonImage,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECKBOX_ROW =
  "flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--foreground)]";
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
  width: "2000",
  height: "2000",
  fileSizeMB: "1.5",
  format: "jpg",
  role: "main",
  colorMode: "srgb",
  productFillPct: "90",
  whiteBackground: true,
  hasTextOrLogo: false,
};

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
      checkAmazonImage({
        width: toNumber(values.width),
        height: toNumber(values.height),
        fileSizeMB: toNumber(values.fileSizeMB),
        format: values.format,
        role: values.role,
        whiteBackground: values.whiteBackground,
        productFillPct: toNumber(values.productFillPct),
        hasTextOrLogo: values.hasTextOrLogo,
        colorMode: values.colorMode,
      }),
    [values]
  );

  const failed = Boolean(result.error);

  const verdictText = failed
    ? "—"
    : result.verdict === "pass"
      ? "Meets Amazon's rules"
      : result.verdict === "warn"
        ? "Accepted, but weaker than it should be"
        : "Will be rejected or suppressed";

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Amazon Listing Image Check",
      `${values.width} x ${values.height} px · longest side ${result.longest} px · ${num(result.megapixels)} MP`,
      `Zoom: ${result.zoomEnabled ? "enabled" : "not enabled"}`,
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
          <Package className="h-4 w-4" aria-hidden="true" />
          Seller Central rules
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Amazon Listing Image Spec Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Test a product photo against Amazon&apos;s published image requirements — the {MIN_LONGEST_SIDE_PX} px
          minimum, the {ZOOM_LONGEST_SIDE_PX} px zoom threshold, pure white background and {MIN_PRODUCT_FILL_PCT}% frame fill.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="amz-width">
              Width (px)
            </label>
            <input
              id="amz-width"
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
            <label className={LABEL_CLASS} htmlFor="amz-height">
              Height (px)
            </label>
            <input
              id="amz-height"
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
            <label className={LABEL_CLASS} htmlFor="amz-size">
              File size (MB)
            </label>
            <input
              id="amz-size"
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
            <label className={LABEL_CLASS} htmlFor="amz-format">
              File format
            </label>
            <select
              id="amz-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.format}
              onChange={(event) => setField("format", event.target.value)}
            >
              {["jpg", "png", "tif", "gif", "webp", "heic"].map((ext) => (
                <option key={ext} value={ext}>
                  {ext.toUpperCase()}
                  {ALLOWED_FORMATS.includes(ext) ? "" : " (not accepted)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amz-role">
              Image slot
            </label>
            <select
              id="amz-role"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.role}
              onChange={(event) => setField("role", event.target.value)}
            >
              {IMAGE_ROLES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amz-colour">
              Colour mode
            </label>
            <select
              id="amz-colour"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.colorMode}
              onChange={(event) => setField("colorMode", event.target.value)}
            >
              <option value="srgb">sRGB</option>
              <option value="cmyk">CMYK</option>
              <option value="adobergb">Adobe RGB</option>
              <option value="prophoto">ProPhoto RGB</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="amz-fill">
              Product fills this share of the frame (%)
            </label>
            <input
              id="amz-fill"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={values.productFillPct}
              onChange={(event) => setField("productFillPct", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label className={CHECKBOX_ROW} htmlFor="amz-white">
            <input
              id="amz-white"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={values.whiteBackground}
              onChange={(event) => setField("whiteBackground", event.target.checked)}
            />
            Background is pure white (RGB 255, 255, 255)
          </label>
          <label className={CHECKBOX_ROW} htmlFor="amz-overlay">
            <input
              id="amz-overlay"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={values.hasTextOrLogo}
              onChange={(event) => setField("hasTextOrLogo", event.target.checked)}
            />
            Image contains text, a logo, a watermark, a border or an inset image
          </label>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Verdict
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">{verdictText}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to run the check."
                : `Longest side ${result.longest} px · ${num(result.megapixels)} MP · zoom ${
                    result.zoomEnabled ? "on" : "off"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the Amazon image check report"
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
          <table className="w-full min-w-[360px] text-left text-sm">
            <tbody>
              {[
                ["Minimum longest side", `${MIN_LONGEST_SIDE_PX} px`],
                ["Zoom enabled at", `${ZOOM_LONGEST_SIDE_PX} px`],
                ["Recommended longest side", `${RECOMMENDED_LONGEST_SIDE_PX} px`],
                ["Minimum frame fill (main image)", `${MIN_PRODUCT_FILL_PCT}%`],
                ["Maximum file size", `${MAX_FILE_SIZE_MB} MB`],
                ["Accepted formats", ALLOWED_FORMATS.join(", ").toUpperCase()],
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
        Some categories — apparel, jewellery, books and media — carry extra image rules of their own,
        and Amazon changes style guides by marketplace. Use this as a pre-upload check and confirm
        your category style guide in Seller Central.
      </p>
    </main>
  );
}
