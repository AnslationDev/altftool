"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, RotateCcw } from "lucide-react";

import {
  CLIENT_NOTES,
  PIXEL_RATIOS,
  TEMPLATE_WIDTHS,
  buildImgMarkup,
  computeEmailHeader,
  formatBytes,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-IN", {
  style: "percent",
  maximumFractionDigits: 0,
});

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  width: "600",
  height: "200",
  ratio: "2",
  fileKb: "120",
  src: "https://cdn.example.com/email/header@2x.png",
  alt: "Spring collection now live",
  linkUrl: "https://example.com/spring",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [ratio, setRatio] = useState(DEFAULTS.ratio);
  const [fileKb, setFileKb] = useState(DEFAULTS.fileKb);
  const [src, setSrc] = useState(DEFAULTS.src);
  const [alt, setAlt] = useState(DEFAULTS.alt);
  const [linkUrl, setLinkUrl] = useState(DEFAULTS.linkUrl);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const result = useMemo(
    () =>
      computeEmailHeader({
        cssWidth: toNumber(width),
        cssHeight: toNumber(height),
        pixelRatio: toNumber(ratio),
        fileKb: toNumber(fileKb),
      }),
    [width, height, ratio, fileKb],
  );

  const markup = useMemo(
    () =>
      buildImgMarkup({
        src: src.trim(),
        alt,
        cssWidth: toNumber(width),
        cssHeight: toNumber(height),
        linkUrl: linkUrl.trim(),
      }),
    [src, alt, width, height, linkUrl],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Email Header Image Size",
      `Display size in the template: ${INT.format(result.cssWidth)} x ${INT.format(result.cssHeight)} px`,
      `Export at ${NUM1.format(result.pixelRatio)}x: ${INT.format(result.exportWidth)} x ${INT.format(result.exportHeight)} px`,
      `Aspect ratio: ${NUM2.format(result.aspectRatio)} : 1`,
      `Set on the img tag: width="${INT.format(result.cssWidth)}" height="${INT.format(result.cssHeight)}"`,
      `File size: ${formatBytes(result.bytes)} of a ${formatBytes(result.budgetBytes)} budget`,
      ...result.mobileRenders.map(
        (row) =>
          `At ${INT.format(row.viewportWidth)} px viewport: renders ${INT.format(row.renderedWidth)} x ${INT.format(row.renderedHeight)} px (${NUM2.format(row.effectiveRatio)}x density)`,
      ),
      ...result.warnings,
    ].join("\n");
  }, [hasError, result]);

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

  const copyMarkup = async () => {
    if (markup.error) return;
    try {
      await navigator.clipboard.writeText(markup.html);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      setCopiedCode(false);
    }
  };

  const reset = () => {
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setRatio(DEFAULTS.ratio);
    setFileKb(DEFAULTS.fileKb);
    setSrc(DEFAULTS.src);
    setAlt(DEFAULTS.alt);
    setLinkUrl(DEFAULTS.linkUrl);
    setCopied(false);
    setCopiedCode(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Email design
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Email Header Image Size Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the size your header occupies in the template and get the pixel dimensions to export
          at, the width and height attributes Outlook needs, how it renders on phones, and where the
          file-size budget stands.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_WIDTHS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setWidth(String(preset.width))}
              className={CHIP_BTN}
            >
              {preset.width} px
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="eh-width">
              Display width in the template (px)
            </label>
            <input
              id="eh-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eh-height">
              Display height (px)
            </label>
            <input
              id="eh-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eh-ratio">
              Export multiplier
            </label>
            <select
              id="eh-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratio}
              onChange={(event) => setRatio(event.target.value)}
            >
              {PIXEL_RATIOS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eh-size">
              Current file size (KB)
            </label>
            <input
              id="eh-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={fileKb}
              onChange={(event) => setFileKb(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="eh-src">
              Hosted image URL
            </label>
            <input
              id="eh-src"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={src}
              onChange={(event) => setSrc(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eh-alt">
              Alt text
            </label>
            <input
              id="eh-alt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="eh-link">
              Click-through URL (optional)
            </label>
            <input
              id="eh-link"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Export the header at
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError
                ? DASH
                : `${INT.format(result.exportWidth)} x ${INT.format(result.exportHeight)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the export size."
                : `Displayed at ${INT.format(result.cssWidth)} x ${INT.format(result.cssHeight)} px, exported at ${NUM1.format(result.pixelRatio)}x`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the email header sizing result"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Aspect ratio", hasError ? DASH : `${NUM2.format(result.aspectRatio)} : 1`],
            ["Megapixels exported", hasError ? DASH : NUM2.format(result.megapixels)],
            [
              "Attributes to put on the img tag",
              hasError
                ? DASH
                : `width="${INT.format(result.cssWidth)}" height="${INT.format(result.cssHeight)}"`,
            ],
            ["Current file size", hasError ? DASH : formatBytes(result.bytes)],
            [
              "Share of the hero budget used",
              hasError
                ? DASH
                : `${PCT.format(result.budgetUsedShare)} of ${formatBytes(result.budgetBytes)}`,
            ],
            [
              "Gmail clipping threshold",
              hasError ? DASH : `${formatBytes(result.gmailClipBytes)} of HTML`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2" role="alert">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How it renders on phones</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Viewport
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rendered size
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Effective density
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">{DASH}</td>
                  <td className="py-2 pr-3 text-right">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : (
                result.mobileRenders.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">
                      {INT.format(row.renderedWidth)} x {INT.format(row.renderedHeight)} px
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM2.format(row.effectiveRatio)}x
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Markup to paste into the template</h2>
          <button
            type="button"
            onClick={copyMarkup}
            aria-label="Copy the img markup"
            className={GHOST_BTN}
            disabled={Boolean(markup.error)}
          >
            {copiedCode ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedCode ? "Copied!" : "Copy markup"}
          </button>
        </div>
        {markup.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {markup.error}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="text-xs leading-6 whitespace-pre">
              <code>{markup.html}</code>
            </pre>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What each client does with the header</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {CLIENT_NOTES.map((row) => (
            <div key={row.client} className="py-3">
              <dt className="font-semibold">{row.client}</dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{row.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Always give the header meaningful alt text — many recipients have images blocked by default,
        so the alt text is the header they actually see. Test the final build in the clients your
        list actually uses before sending.
      </p>
    </main>
  );
}
