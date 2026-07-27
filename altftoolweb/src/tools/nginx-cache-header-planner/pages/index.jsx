"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";

import {
  CACHEABILITY_OPTIONS,
  DEFAULT_ASSET_CLASSES,
  DURATION_UNITS,
  buildCacheHeaderConfig,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

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

const cloneDefaults = () =>
  DEFAULT_ASSET_CLASSES.map((assetClass) => ({
    ...assetClass,
    duration: String(assetClass.duration),
  }));

export default function ToolHome() {
  const [classes, setClasses] = useState(cloneDefaults);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCacheHeaderConfig({
        classes: classes.map((assetClass) => ({
          ...assetClass,
          duration: assetClass.duration.trim() === "" ? Number.NaN : Number(assetClass.duration),
        })),
      }),
    [classes],
  );

  const hasError = Boolean(result.error);

  const update = (index, field, value) => {
    setClasses((prev) =>
      prev.map((assetClass, i) => (i === index ? { ...assetClass, [field]: value } : assetClass)),
    );
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
    setClasses(cloneDefaults());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Web server configs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Nginx Cache Header Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a caching policy per asset type — HTML revalidated, hashed bundles immutable
          for a year, images for 30 days — and copy the matching nginx location blocks.
          Policies follow the Cache-Control directives of RFC 9111 and RFC 8246.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {classes.map((assetClass, index) => {
            const needsAge =
              assetClass.cacheability === "public" || assetClass.cacheability === "private";
            return (
              <div
                key={assetClass.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
                  htmlFor={`chp-on-${assetClass.id}`}
                >
                  <input
                    id={`chp-on-${assetClass.id}`}
                    type="checkbox"
                    className={CHECK_CLASS}
                    checked={assetClass.enabled}
                    onChange={(event) => update(index, "enabled", event.target.checked)}
                  />
                  {assetClass.label}
                </label>
                {assetClass.enabled ? (
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`chp-ext-${assetClass.id}`}>
                        File extensions
                      </label>
                      <input
                        id={`chp-ext-${assetClass.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        type="text"
                        value={assetClass.extensions}
                        onChange={(event) => update(index, "extensions", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`chp-pol-${assetClass.id}`}>
                        Cacheability
                      </label>
                      <select
                        id={`chp-pol-${assetClass.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        value={assetClass.cacheability}
                        onChange={(event) => update(index, "cacheability", event.target.value)}
                      >
                        {CACHEABILITY_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {needsAge ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={LABEL_CLASS} htmlFor={`chp-dur-${assetClass.id}`}>
                              Max age
                            </label>
                            <input
                              id={`chp-dur-${assetClass.id}`}
                              className={`mt-2 ${INPUT_CLASS}`}
                              type="number"
                              inputMode="numeric"
                              min="0"
                              step="1"
                              value={assetClass.duration}
                              onChange={(event) => update(index, "duration", event.target.value)}
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLASS} htmlFor={`chp-unit-${assetClass.id}`}>
                              Unit
                            </label>
                            <select
                              id={`chp-unit-${assetClass.id}`}
                              className={`mt-2 ${INPUT_CLASS}`}
                              value={assetClass.unit}
                              onChange={(event) => update(index, "unit", event.target.value)}
                            >
                              {DURATION_UNITS.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-col justify-end">
                          <label
                            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                            htmlFor={`chp-imm-${assetClass.id}`}
                          >
                            <input
                              id={`chp-imm-${assetClass.id}`}
                              type="checkbox"
                              className={CHECK_CLASS}
                              checked={assetClass.immutable}
                              onChange={(event) => update(index, "immutable", event.target.checked)}
                            />
                            immutable — file content never changes (hashed names)
                          </label>
                          <label
                            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                            htmlFor={`chp-mrv-${assetClass.id}`}
                          >
                            <input
                              id={`chp-mrv-${assetClass.id}`}
                              type="checkbox"
                              className={CHECK_CLASS}
                              checked={assetClass.mustRevalidate}
                              onChange={(event) =>
                                update(index, "mustRevalidate", event.target.checked)
                              }
                            />
                            must-revalidate once stale
                          </label>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
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
              Asset classes in snippet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.enabledCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the nginx cache header snippet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy snippet"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all asset classes to the recommended plan"
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

        {!hasError ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Asset class
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Cache-Control sent
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Max age (s)
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.headerValue}</td>
                    <td className="py-2 text-right font-semibold">
                      {row.nginxTime === null ? DASH : NUM.format(row.maxAgeSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Regex location blocks take priority over prefix locations in nginx — place these
        inside your server block and test with nginx -t. Only mark files immutable when their
        names change on every deploy (content hashes).
      </p>
    </main>
  );
}
