"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ImageDown, RotateCcw } from "lucide-react";
import {
  CONTENT_TYPES,
  FORMATS,
  LAYOUTS,
  PLACEMENTS,
  formatBytes,
  formatReport,
  planAmpImage,
} from "../lib";

const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  contentWidth: "600",
  placementId: "hero",
  aspectW: "16",
  aspectH: "9",
  dpr: "2",
  formatId: "jpeg75",
  contentTypeId: "photo",
  layout: "responsive",
  imageCount: "4",
  inlineAsDataUri: false,
  htmlKb: "24",
  cssKb: "12",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** The library works in bytes; the form collects kilobytes. */
const KB = 1024;

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      planAmpImage({
        contentWidth: Number(form.contentWidth),
        placementId: form.placementId,
        aspectW: Number(form.aspectW),
        aspectH: Number(form.aspectH),
        dpr: Number(form.dpr),
        formatId: form.formatId,
        contentTypeId: form.contentTypeId,
        layout: form.layout,
        imageCount: Number(form.imageCount),
        inlineAsDataUri: form.inlineAsDataUri,
        htmlBytes: Number(form.htmlKb) * KB,
        cssBytes: Number(form.cssKb) * KB,
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const report = useMemo(() => formatReport(result), [result]);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const applyPlacement = (id) => {
    const placement = PLACEMENTS.find((item) => item.id === id) || PLACEMENTS[0];
    setForm((prev) => ({
      ...prev,
      placementId: id,
      aspectW: String(placement.aspectW),
      aspectH: String(placement.aspectH),
      layout: placement.layout,
    }));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ImageDown className="h-4 w-4" aria-hidden="true" />
          AMP for Email
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AMP Email Image Size Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a placement and get the display size, the retina export size, a ready
          <code> amp-img </code> tag with the right layout, and an estimated weight measured
          against the 200 KB limit Gmail puts on the AMP part of a message.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-placement">
              Placement
            </label>
            <select
              id="amp-placement"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.placementId}
              onChange={(event) => applyPlacement(event.target.value)}
            >
              {PLACEMENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-layout">
              amp-img layout
            </label>
            <select
              id="amp-layout"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.layout}
              onChange={(event) => setField("layout", event.target.value)}
            >
              {LAYOUTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-width">
              Email content width (px)
            </label>
            <input
              id="amp-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="200"
              max="1200"
              step="10"
              value={form.contentWidth}
              onChange={(event) => setField("contentWidth", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-dpr">
              Pixel density to export for
            </label>
            <input
              id="amp-dpr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="4"
              step="0.5"
              value={form.dpr}
              onChange={(event) => setField("dpr", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-aspect-w">
              Aspect ratio width
            </label>
            <input
              id="amp-aspect-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.aspectW}
              onChange={(event) => setField("aspectW", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-aspect-h">
              Aspect ratio height
            </label>
            <input
              id="amp-aspect-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.aspectH}
              onChange={(event) => setField("aspectH", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-format">
              Export format
            </label>
            <select
              id="amp-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.formatId}
              onChange={(event) => setField("formatId", event.target.value)}
            >
              {FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-content-type">
              What the image contains
            </label>
            <select
              id="amp-content-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.contentTypeId}
              onChange={(event) => setField("contentTypeId", event.target.value)}
            >
              {CONTENT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-count">
              Images of this size in the email
            </label>
            <input
              id="amp-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              value={form.imageCount}
              onChange={(event) => setField("imageCount", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-html">
              AMP markup size (KB)
            </label>
            <input
              id="amp-html"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.htmlKb}
              onChange={(event) => setField("htmlKb", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amp-css">
              Inline amp-custom CSS (KB)
            </label>
            <input
              id="amp-css"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.cssKb}
              onChange={(event) => setField("cssKb", event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 items-center gap-3 text-sm font-semibold"
              htmlFor="amp-inline"
            >
              <input
                id="amp-inline"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.inlineAsDataUri}
                onChange={(event) => setField("inlineAsDataUri", event.target.checked)}
              />
              Inline images as data URIs
            </label>
          </div>
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
              Export the source at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.sourceWidth} × ${result.sourceHeight}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to size the image."
                : `Displayed at ${result.displayWidth} × ${result.displayHeight} CSS px · ${result.dpr}× density`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the image size report"
              onClick={() => copy(report, "report")}
              disabled={failed}
            >
              {copied === "report" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "report" ? "Copied!" : "Copy report"}
            </button>
            <button type="button" className={PRIMARY_BTN} aria-label="Reset all inputs" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Estimated weight, one image", failed ? DASH : formatBytes(result.imageBytes)],
            [
              "All images of this size",
              failed
                ? DASH
                : `${result.imageCount} × ${formatBytes(result.imageBytes)} = ${formatBytes(result.totalImageBytes)}`,
            ],
            [
              "AMP part used",
              failed
                ? DASH
                : `${formatBytes(result.ampPartBytes)} of ${formatBytes(result.ampPartLimit)} (${PCT.format(result.ampPartShare)})`,
            ],
            ["Headroom left in the AMP part", failed ? DASH : formatBytes(result.ampPartRemaining)],
            ["Aspect ratio", failed ? DASH : `${result.aspect} (${result.aspectDecimal})`],
            ["Layout behaviour", failed ? DASH : result.layoutNote],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`AMP part budget used: ${PCT.format(result.ampPartShare)}`}
            >
              <span
                className={`block h-full ${result.withinBudget ? "bg-[var(--primary)]" : "bg-[var(--danger)]"}`}
                style={{ width: `${Math.min(100, result.ampPartShare * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {result.withinBudget
                ? "Within the 200 KB AMP part limit."
                : "Over the 200 KB AMP part limit — Gmail will show the plain HTML part instead."}
            </p>
          </div>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Ready-to-paste markup</h2>
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the amp-img tag"
              onClick={() => copy(result.markup, "markup")}
            >
              {copied === "markup" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "markup" ? "Copied!" : "Copy tag"}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre rounded-md bg-[var(--background)] p-3 text-xs leading-5">
              {result.markup}
            </pre>
          </div>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Same image, every format</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">File</th>
                  <th scope="col" className="py-2 text-right font-semibold">Base64</th>
                </tr>
              </thead>
              <tbody>
                {result.perFormat.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      item.chosen ? "font-semibold text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">
                      {item.label}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {item.note}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{formatBytes(item.bytes)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {formatBytes(item.base64Bytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.warnings.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold">Watch out for</h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.warnings.map((warning) => (
                  <li key={warning} className="border-l-2 border-[var(--primary)] pl-3">
                    {warning}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        File sizes are estimates from typical bytes-per-pixel rates at each quality setting; real
        encoder output depends on the picture. The 200 KB AMP part limit and the 75 KB amp-custom
        CSS limit are hard requirements — check the exported message against them.
      </p>
    </main>
  );
}
