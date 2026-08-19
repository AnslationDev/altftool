"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, LayoutTemplate, RotateCcw, XCircle } from "lucide-react";

import {
  CARD_TYPES,
  DESCRIPTION_MAX_CHARS,
  TITLE_MAX_CHARS,
  buildMetaMarkup,
  parseMetaTags,
  resolveCardFields,
  safeImageCssUrl,
  validateCard,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  card: "summary_large_image",
  title: "How to trim a video without uploading it anywhere",
  description:
    "A browser-only workflow that cuts a clip out of any video using FFmpeg compiled to WebAssembly, with no server and no watermark.",
  imageUrl: "https://example.com/social/trim-video-card.jpg",
  imageWidth: "1200",
  imageHeight: "600",
  imageBytes: "",
  site: "@example",
  creator: "",
  imageAlt: "A video timeline with a section highlighted",
  url: "https://example.com/blog/trim-video",
};

export default function ToolHome() {
  const [inputMode, setInputMode] = useState("fields");
  const [html, setHtml] = useState("");
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const parsed = useMemo(() => (inputMode === "html" ? parseMetaTags(html) : null), [inputMode, html]);
  const resolved = useMemo(() => (parsed ? resolveCardFields(parsed) : null), [parsed]);

  const fields = useMemo(() => {
    if (resolved) {
      return {
        card: resolved.card.value,
        title: resolved.title.value,
        description: resolved.description.value,
        imageUrl: resolved.image.value,
        imageAlt: resolved.imageAlt.value,
        site: resolved.site.value,
        creator: resolved.creator.value,
        url: resolved.url.value,
        imageWidth: 0,
        imageHeight: 0,
        imageBytes: 0,
      };
    }
    return {
      card: form.card,
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      imageAlt: form.imageAlt,
      site: form.site,
      creator: form.creator,
      url: form.url,
      imageWidth: Number(form.imageWidth) || 0,
      imageHeight: Number(form.imageHeight) || 0,
      imageBytes: Number(form.imageBytes) || 0,
    };
  }, [resolved, form]);

  const result = useMemo(() => validateCard(fields), [fields]);
  const hasError = Boolean(result.error);

  // Which fields fell back to an Open Graph (or <title>/description) tag
  // instead of their own twitter:* tag, so the UI can say so instead of
  // silently using the fallback value with no indication of its source.
  const fallbackNotes = useMemo(() => {
    if (!resolved) return [];
    const checks = [
      ["Title", "title"],
      ["Description", "description"],
      ["Image", "image"],
      ["Image alt text", "imageAlt"],
    ];
    return checks
      .filter(([, key]) => {
        const source = resolved[key]?.source;
        return source && !source.startsWith("twitter:");
      })
      .map(([label, key]) => `${label} from ${resolved[key].source}`);
  }, [resolved]);

  const cssImage = safeImageCssUrl(fields.imageUrl);
  const isLarge = result.cardType === "summary_large_image" || result.cardType === "";

  const markup = useMemo(
    () =>
      hasError
        ? ""
        : buildMetaMarkup({
            card: fields.card,
            title: fields.title,
            description: fields.description,
            imageUrl: fields.imageUrl,
            site: fields.site,
            creator: fields.creator,
            imageAlt: fields.imageAlt,
            url: fields.url,
          }),
    [hasError, fields],
  );

  const copyResult = async () => {
    if (!markup) return;
    try {
      await navigator.clipboard.writeText(markup);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setInputMode("fields");
    setHtml("");
    setForm(DEFAULTS);
    setCopied(false);
  };

  const host = useMemo(() => {
    const match = String(fields.url || fields.imageUrl || "").match(/^https?:\/\/([^/]+)/i);
    return match ? match[1].replace(/^www\./, "") : "example.com";
  }, [fields.url, fields.imageUrl]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
          Social preview
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Twitter Card Preview
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See how a link renders as an X (Twitter) card and check the tags against the card
          spec — 70-character titles, 200-character descriptions and the image size rules.
          Paste a page&apos;s HTML head, or fill the fields in directly.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["fields", "Fill in fields"],
            ["html", "Paste HTML head"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setInputMode(value)}
              aria-pressed={inputMode === value}
              className={
                inputMode === value
                  ? `${PRIMARY_BTN} flex-1 sm:flex-none`
                  : `${GHOST_BTN} flex-1 sm:flex-none`
              }
            >
              {label}
            </button>
          ))}
        </div>

        {inputMode === "html" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="tcp-html">
              Page source (view-source, then paste the &lt;head&gt;)
            </label>
            <textarea
              id="tcp-html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={8}
              placeholder={'<meta name="twitter:card" content="summary_large_image">'}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Browsers cannot fetch another site&apos;s HTML directly, so paste it here. Image
              dimensions are not read from markup — switch to the field mode to check them.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="tcp-card">
                Card type (twitter:card)
              </label>
              <select
                id="tcp-card"
                value={form.card}
                onChange={setField("card")}
                className={`${INPUT_CLASS} mt-1`}
              >
                {Object.entries(CARD_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tcp-site">
                Site handle (twitter:site)
              </label>
              <input
                id="tcp-site"
                type="text"
                value={form.site}
                onChange={setField("site")}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tcp-creator">
                Creator handle (twitter:creator)
              </label>
              <input
                id="tcp-creator"
                type="text"
                value={form.creator}
                onChange={setField("creator")}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="tcp-title">
                Title ({form.title.length}/{TITLE_MAX_CHARS})
              </label>
              <input
                id="tcp-title"
                type="text"
                value={form.title}
                onChange={setField("title")}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="tcp-description">
                Description ({form.description.length}/{DESCRIPTION_MAX_CHARS})
              </label>
              <textarea
                id="tcp-description"
                value={form.description}
                onChange={setField("description")}
                rows={3}
                className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="tcp-image">
                Image URL (twitter:image)
              </label>
              <input
                id="tcp-image"
                type="url"
                value={form.imageUrl}
                onChange={setField("imageUrl")}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tcp-width">
                Image width (px)
              </label>
              <input
                id="tcp-width"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.imageWidth}
                onChange={setField("imageWidth")}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tcp-height">
                Image height (px)
              </label>
              <input
                id="tcp-height"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.imageHeight}
                onChange={setField("imageHeight")}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tcp-bytes">
                Image size (bytes, optional)
              </label>
              <input
                id="tcp-bytes"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.imageBytes}
                onChange={setField("imageBytes")}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tcp-url">
                Page URL (og:url)
              </label>
              <input
                id="tcp-url"
                type="url"
                value={form.url}
                onChange={setField("url")}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
          </div>
        )}
      </section>

      <section
        className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        {hasError && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <p className="text-sm text-[var(--muted-foreground)]">Card status</p>
        <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {hasError ? DASH : result.valid ? "Valid" : `${result.errorCount} blocking`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${result.cardTypeLabel} · ${result.warningCount} warning${result.warningCount === 1 ? "" : "s"}`}
        </p>
        {!hasError && fallbackNotes.length > 0 && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Using Open Graph fallback — {fallbackNotes.join(", ")}.
          </p>
        )}

        {!hasError && (
          <div className="mt-5 max-w-md overflow-hidden rounded-xl border border-[var(--border)]">
            {isLarge ? (
              <div
                className="aspect-[2/1] w-full bg-[var(--muted)] bg-cover bg-center"
                style={cssImage ? { backgroundImage: `url("${cssImage}")` } : undefined}
                role="img"
                aria-label={fields.imageAlt || "Card image preview"}
              />
            ) : null}
            <div className={isLarge ? "p-3" : "flex gap-3 p-3"}>
              {!isLarge && (
                <div
                  className="h-20 w-20 shrink-0 rounded-md bg-[var(--muted)] bg-cover bg-center"
                  style={cssImage ? { backgroundImage: `url("${cssImage}")` } : undefined}
                  role="img"
                  aria-label={fields.imageAlt || "Card image preview"}
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-xs text-[var(--muted-foreground)]">{host}</p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold">
                  {result.displayTitle || "Untitled page"}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                  {result.displayDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Title length</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.titleLength} / ${TITLE_MAX_CHARS}`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Description length</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.descriptionLength} / ${DESCRIPTION_MAX_CHARS}`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Image aspect</dt>
            <dd className="text-sm font-semibold">
              {hasError || !result.imageAspect ? DASH : `${result.imageAspect}:1`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Blocking issues</dt>
            <dd className="text-sm font-semibold">{hasError ? DASH : result.errorCount}</dd>
          </div>
        </dl>

        {!hasError && result.issues.length > 0 && (
          <ul className="mt-4 space-y-2">
            {result.issues.map((issue) => (
              <li
                key={`${issue.field}-${issue.message}`}
                className={
                  issue.level === "error"
                    ? "flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                    : "flex gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
                }
              >
                {issue.level === "error" ? (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span>
                  <strong className="font-semibold">{issue.field}:</strong> {issue.message}
                </span>
              </li>
            ))}
          </ul>
        )}
        {!hasError && result.issues.length === 0 && (
          <p className="mt-4 text-sm font-medium text-[var(--success)]">
            Every tag matches the card spec.
          </p>
        )}

        {!hasError && markup && (
          <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            <pre className="text-xs whitespace-pre">{markup}</pre>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyResult}
            disabled={hasError}
            className={PRIMARY_BTN}
            aria-label="Copy the generated card meta tags"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy meta tags"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset the preview">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
