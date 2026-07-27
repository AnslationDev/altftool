"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheck, Copy, Gift, RotateCcw, TriangleAlert, X } from "lucide-react";

import {
  ALLOWED_FORMATS,
  MAX_PHOTOS_PER_LISTING,
  RECOMMENDED_SHORT_SIDE_PX,
  THUMBNAIL_RATIO_LABEL,
  checkEtsyImage,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECKBOX_ROW = "flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--foreground)]";
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
  width: "3000",
  height: "2250",
  fileSizeMB: "2",
  format: "jpg",
  photoCount: "6",
  isPrimary: true,
};

const PRESETS = [
  ["4:3 landscape", "3000", "2250"],
  ["Square", "2000", "2000"],
  ["3:2 camera", "3000", "2000"],
  ["Portrait", "2000", "3000"],
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
      checkEtsyImage({
        width: toNumber(values.width),
        height: toNumber(values.height),
        fileSizeMB: toNumber(values.fileSizeMB),
        format: values.format,
        photoCount: toNumber(values.photoCount),
        isPrimary: values.isPrimary,
      }),
    [values]
  );

  const failed = Boolean(result.error);

  const verdictText = failed
    ? "—"
    : result.verdict === "pass"
      ? "Listing-ready"
      : result.verdict === "warn"
        ? "Usable, but the thumbnail suffers"
        : "Fix before you list";

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Etsy Listing Image Check",
      `${values.width} x ${values.height} px · ${result.orientation} · ${num(result.megapixels)} MP`,
      `${THUMBNAIL_RATIO_LABEL} search thumbnail trims about ${num(result.thumbnailCropLossPct)}%`,
      `Photo slots left: ${result.slotsLeft}`,
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
          <Gift className="h-4 w-4" aria-hidden="true" />
          Shop photos
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Etsy Listing Image Spec Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check a listing photo against Etsy&apos;s guidance — {RECOMMENDED_SHORT_SIDE_PX} px on the shortest
          side, accepted file types, the {MAX_PHOTOS_PER_LISTING}-photo limit, and how much the{" "}
          {THUMBNAIL_RATIO_LABEL} search thumbnail crops away.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="etsy-width">
              Width (px)
            </label>
            <input
              id="etsy-width"
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
            <label className={LABEL_CLASS} htmlFor="etsy-height">
              Height (px)
            </label>
            <input
              id="etsy-height"
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
            <label className={LABEL_CLASS} htmlFor="etsy-size">
              File size (MB)
            </label>
            <input
              id="etsy-size"
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
            <label className={LABEL_CLASS} htmlFor="etsy-format">
              File type
            </label>
            <select
              id="etsy-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.format}
              onChange={(event) => setField("format", event.target.value)}
            >
              {["jpg", "png", "gif", "webp", "heic", "tiff"].map((ext) => (
                <option key={ext} value={ext}>
                  {ext.toUpperCase()}
                  {ALLOWED_FORMATS.includes(ext) ? "" : " (not accepted)"}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="etsy-count">
              Photos on this listing (including this one)
            </label>
            <input
              id="etsy-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={values.photoCount}
              onChange={(event) => setField("photoCount", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={CHECKBOX_ROW} htmlFor="etsy-primary">
            <input
              id="etsy-primary"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={values.isPrimary}
              onChange={(event) => setField("isPrimary", event.target.checked)}
            />
            This is the first photo (the one cropped for search results)
          </label>
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
                : `${result.orientation} · thumbnail trims about ${num(result.thumbnailCropLossPct)}% · ${result.slotsLeft} photo slots left`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the Etsy image check report"
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
                ["Recommended shortest side", `${RECOMMENDED_SHORT_SIDE_PX} px`],
                ["Search thumbnail shape", THUMBNAIL_RATIO_LABEL],
                ["Photos per listing", `up to ${MAX_PHOTOS_PER_LISTING}`],
                ["Accepted file types", ALLOWED_FORMATS.join(", ").toUpperCase()],
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
        Etsy publishes its current per-file upload ceiling in its own help centre, and the file-size
        note here is practical advice rather than a platform rule. Everything else follows Etsy&apos;s
        listing-photo guidance, which is worth re-checking before a large shop update.
      </p>
    </main>
  );
}
