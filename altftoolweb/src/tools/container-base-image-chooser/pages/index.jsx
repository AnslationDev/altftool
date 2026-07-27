"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import { BASE_IMAGES, BINARY_TYPES, rankBaseImages } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  binaryType: "static",
  needsShell: false,
  needsPackageManager: false,
  needsTlsCerts: true,
};

const DASH = "—";

export default function ToolHome() {
  const [binaryType, setBinaryType] = useState(DEFAULTS.binaryType);
  const [needsShell, setNeedsShell] = useState(DEFAULTS.needsShell);
  const [needsPackageManager, setNeedsPackageManager] = useState(DEFAULTS.needsPackageManager);
  const [needsTlsCerts, setNeedsTlsCerts] = useState(DEFAULTS.needsTlsCerts);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => rankBaseImages({ binaryType, needsShell, needsPackageManager, needsTlsCerts }),
    [binaryType, needsShell, needsPackageManager, needsTlsCerts],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Recommended base image: ${result.best.image.name}`,
      `Dockerfile: ${result.best.image.example}`,
      `Approx size: ${result.best.image.approxSizeMB} MB`,
      `libc: ${result.best.image.libc}`,
      ...result.caveats.map((c) => `Caveat: ${c}`),
    ];
    return lines.join("\n");
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

  const reset = () => {
    setBinaryType(DEFAULTS.binaryType);
    setNeedsShell(DEFAULTS.needsShell);
    setNeedsPackageManager(DEFAULTS.needsPackageManager);
    setNeedsTlsCerts(DEFAULTS.needsTlsCerts);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Containers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Container Base Image Chooser</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer three questions about your workload and get the smallest base image that still
          satisfies its libc, shell and package-manager needs — with the full ranking and every
          rejection reason shown.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="cbi-type">
            What are you shipping?
          </label>
          <select
            id="cbi-type"
            className={`mt-2 ${INPUT_CLASS}`}
            value={binaryType}
            onChange={(event) => setBinaryType(event.target.value)}
          >
            {BINARY_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 space-y-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cbi-shell">
            <input
              id="cbi-shell"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={needsShell}
              onChange={(event) => setNeedsShell(event.target.checked)}
            />
            I need a shell in the running container (docker exec debugging, entrypoint scripts)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cbi-pm">
            <input
              id="cbi-pm"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={needsPackageManager}
              onChange={(event) => setNeedsPackageManager(event.target.checked)}
            />
            I need to install OS packages in this image (apt / apk at build time)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="cbi-tls">
            <input
              id="cbi-tls"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={needsTlsCerts}
              onChange={(event) => setNeedsTlsCerts(event.target.checked)}
            />
            The app makes outbound HTTPS calls (needs CA certificates)
          </label>
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
              Recommended base image
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.best.image.name}
            </p>
            {!hasError ? (
              <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 font-mono text-xs">
                {result.best.image.example}
              </p>
            ) : (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Fix the input above to see a result.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the base image recommendation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Approx uncompressed size", DASH],
                ["libc", DASH],
                ["Shell / package manager", DASH],
                ["Debugging", DASH],
              ]
            : [
                ["Approx uncompressed size", `${result.best.image.approxSizeMB} MB`],
                ["libc", result.best.image.libc],
                [
                  "Shell / package manager",
                  `${result.best.image.hasShell ? "shell" : "no shell"} / ${result.best.image.hasPackageManager ? "package manager" : "none"}`,
                ],
                ["Debugging", result.best.image.debugTooling],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.caveats.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.caveats.map((caveat) => (
              <li key={caveat} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {caveat}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Full ranking for your workload</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Image</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Size</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">libc</th>
                  <th scope="col" className="py-2 font-semibold">Fit</th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map(({ image, fits, reasons }) => (
                  <tr key={image.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{image.name}</td>
                    <td className="py-2 pr-3">{image.approxSizeMB} MB</td>
                    <td className="py-2 pr-3">{image.libc}</td>
                    <td className="py-2">
                      {fits ? (
                        <span className="font-semibold text-[var(--success)]">Fits</span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">{reasons.join(" ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Reference: what each base ships</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {BASE_IMAGES.map((image) => (
            <li key={image.id} className="rounded-md bg-[var(--muted)] px-3 py-2">
              <span className="font-semibold text-[var(--foreground)]">{image.name}</span> — {image.notes}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes are approximate uncompressed sizes of current stable tags and drift a few MB between
        releases. For interpreted languages, prefer the official runtime image (for example
        python:3.12-slim) built on the recommended base.
      </p>
    </main>
  );
}
