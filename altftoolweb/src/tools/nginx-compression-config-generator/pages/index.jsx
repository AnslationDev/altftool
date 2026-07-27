"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileArchive, RotateCcw } from "lucide-react";

import {
  BROTLI_LEVEL_MAX,
  BROTLI_LEVEL_MIN,
  BROTLI_LEVEL_RECOMMENDED,
  GZIP_LEVEL_MAX,
  GZIP_LEVEL_MIN,
  GZIP_LEVEL_RECOMMENDED,
  MIME_GROUPS,
  MIN_LENGTH_RECOMMENDED,
  buildCompressionConfig,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULTS = {
  gzipEnabled: true,
  gzipLevel: String(GZIP_LEVEL_RECOMMENDED),
  gzipStatic: false,
  brotliEnabled: true,
  brotliLevel: String(BROTLI_LEVEL_RECOMMENDED),
  brotliStatic: false,
  minLength: String(MIN_LENGTH_RECOMMENDED),
  groupIds: ["text", "js", "json", "xml", "svg"],
  vary: true,
  proxied: true,
};

export default function ToolHome() {
  const [gzipEnabled, setGzipEnabled] = useState(DEFAULTS.gzipEnabled);
  const [gzipLevel, setGzipLevel] = useState(DEFAULTS.gzipLevel);
  const [gzipStatic, setGzipStatic] = useState(DEFAULTS.gzipStatic);
  const [brotliEnabled, setBrotliEnabled] = useState(DEFAULTS.brotliEnabled);
  const [brotliLevel, setBrotliLevel] = useState(DEFAULTS.brotliLevel);
  const [brotliStatic, setBrotliStatic] = useState(DEFAULTS.brotliStatic);
  const [minLength, setMinLength] = useState(DEFAULTS.minLength);
  const [groupIds, setGroupIds] = useState(DEFAULTS.groupIds);
  const [vary, setVary] = useState(DEFAULTS.vary);
  const [proxied, setProxied] = useState(DEFAULTS.proxied);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCompressionConfig({
        gzipEnabled,
        gzipLevel: gzipLevel.trim() === "" ? Number.NaN : Number(gzipLevel),
        gzipStatic,
        brotliEnabled,
        brotliLevel: brotliLevel.trim() === "" ? Number.NaN : Number(brotliLevel),
        brotliStatic,
        minLength: minLength.trim() === "" ? Number.NaN : Number(minLength),
        groupIds,
        vary,
        proxied,
      }),
    [
      gzipEnabled,
      gzipLevel,
      gzipStatic,
      brotliEnabled,
      brotliLevel,
      brotliStatic,
      minLength,
      groupIds,
      vary,
      proxied,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleGroup = (id) => {
    setGroupIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.config);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setGzipEnabled(DEFAULTS.gzipEnabled);
    setGzipLevel(DEFAULTS.gzipLevel);
    setGzipStatic(DEFAULTS.gzipStatic);
    setBrotliEnabled(DEFAULTS.brotliEnabled);
    setBrotliLevel(DEFAULTS.brotliLevel);
    setBrotliStatic(DEFAULTS.brotliStatic);
    setMinLength(DEFAULTS.minLength);
    setGroupIds(DEFAULTS.groupIds);
    setVary(DEFAULTS.vary);
    setProxied(DEFAULTS.proxied);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileArchive className="h-4 w-4" aria-hidden="true" />
          Web server configs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Nginx Compression Config Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build gzip and brotli directives for your nginx http or server block — compression
          levels, MIME type lists and gzip_min_length tuned with the module defaults and
          recommended values labelled.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="rounded-lg border border-[var(--border)] p-3">
            <legend className="px-1 text-sm font-semibold">gzip</legend>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cc-gzip">
              <input
                id="cc-gzip"
                type="checkbox"
                className={CHECK_CLASS}
                checked={gzipEnabled}
                onChange={(event) => setGzipEnabled(event.target.checked)}
              />
              Enable gzip
            </label>
            <label className={`mt-2 ${LABEL_CLASS}`} htmlFor="cc-gzip-level">
              gzip_comp_level ({GZIP_LEVEL_MIN}-{GZIP_LEVEL_MAX}, default 1, recommended {GZIP_LEVEL_RECOMMENDED})
            </label>
            <input
              id="cc-gzip-level"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={GZIP_LEVEL_MIN}
              max={GZIP_LEVEL_MAX}
              step="1"
              value={gzipLevel}
              disabled={!gzipEnabled}
              onChange={(event) => setGzipLevel(event.target.value)}
            />
            <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cc-gzip-static">
              <input
                id="cc-gzip-static"
                type="checkbox"
                className={CHECK_CLASS}
                checked={gzipStatic}
                disabled={!gzipEnabled}
                onChange={(event) => setGzipStatic(event.target.checked)}
              />
              gzip_static — serve pre-built .gz files
            </label>
          </fieldset>

          <fieldset className="rounded-lg border border-[var(--border)] p-3">
            <legend className="px-1 text-sm font-semibold">brotli (ngx_brotli)</legend>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cc-brotli">
              <input
                id="cc-brotli"
                type="checkbox"
                className={CHECK_CLASS}
                checked={brotliEnabled}
                onChange={(event) => setBrotliEnabled(event.target.checked)}
              />
              Enable brotli
            </label>
            <label className={`mt-2 ${LABEL_CLASS}`} htmlFor="cc-brotli-level">
              brotli_comp_level ({BROTLI_LEVEL_MIN}-{BROTLI_LEVEL_MAX}, default 6, recommended {BROTLI_LEVEL_RECOMMENDED})
            </label>
            <input
              id="cc-brotli-level"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={BROTLI_LEVEL_MIN}
              max={BROTLI_LEVEL_MAX}
              step="1"
              value={brotliLevel}
              disabled={!brotliEnabled}
              onChange={(event) => setBrotliLevel(event.target.value)}
            />
            <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cc-brotli-static">
              <input
                id="cc-brotli-static"
                type="checkbox"
                className={CHECK_CLASS}
                checked={brotliStatic}
                disabled={!brotliEnabled}
                onChange={(event) => setBrotliStatic(event.target.checked)}
              />
              brotli_static — serve pre-built .br files
            </label>
          </fieldset>

          <div>
            <label className={LABEL_CLASS} htmlFor="cc-minlen">
              Minimum response size to compress (bytes)
            </label>
            <input
              id="cc-minlen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="16"
              value={minLength}
              onChange={(event) => setMinLength(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              nginx default is 20; {MIN_LENGTH_RECOMMENDED}+ avoids wasting CPU on tiny responses.
            </p>
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cc-vary">
              <input
                id="cc-vary"
                type="checkbox"
                className={CHECK_CLASS}
                checked={vary}
                onChange={(event) => setVary(event.target.checked)}
              />
              gzip_vary on — send Vary: Accept-Encoding
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cc-proxied">
              <input
                id="cc-proxied"
                type="checkbox"
                className={CHECK_CLASS}
                checked={proxied}
                onChange={(event) => setProxied(event.target.checked)}
              />
              gzip_proxied any — compress proxied requests
            </label>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">MIME type groups (text/html is always compressed)</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {MIME_GROUPS.map((group) => (
              <label
                key={group.id}
                htmlFor={`cc-group-${group.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]"
              >
                <input
                  id={`cc-group-${group.id}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={groupIds.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                />
                <span>
                  {group.label}
                  <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                    ({group.types.length})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              MIME types beyond text/html
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.typeCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the nginx compression config"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy config"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all options to recommended defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg bg-[var(--muted)] p-4">
          <pre className="whitespace-pre text-xs leading-5 text-[var(--foreground)]">
            <code>{hasError ? DASH : result.config}</code>
          </pre>
        </div>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--primary)]" />
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Place the snippet in your http or server block, run nginx -t to validate, then reload.
        Already-compressed formats (JPEG, PNG, WOFF2, MP4, ZIP) should not be recompressed.
      </p>
    </main>
  );
}
