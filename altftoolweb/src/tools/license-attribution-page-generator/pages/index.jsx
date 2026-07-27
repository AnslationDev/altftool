"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Check, Copy, RotateCcw } from "lucide-react";

import { CATEGORY_LABELS, OUTPUT_FORMATS, generateAttributionPage, parseManifest } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");

const DEFAULTS = {
  projectName: "My Product",
  format: "markdown",
  manifest:
    "react@19.0.0 MIT\nnext@15.3.0 MIT\nsharp | 0.33.0 | Apache-2.0 | https://sharp.pixelplumbing.com\nlodash 4.17.21 MIT",
};

const DASH = "—";

export default function ToolHome() {
  const [projectName, setProjectName] = useState(DEFAULTS.projectName);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [manifest, setManifest] = useState(DEFAULTS.manifest);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseManifest(manifest), [manifest]);
  const result = useMemo(
    () => generateAttributionPage({ entries: parsed.entries, projectName, format }),
    [parsed.entries, projectName, format],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.page);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setProjectName(DEFAULTS.projectName);
    setFormat(DEFAULTS.format);
    setManifest(DEFAULTS.manifest);
    setCopied(false);
  };

  const categoryRows = hasError
    ? []
    : Object.entries(result.byCategory).map(([category, count]) => [
        CATEGORY_LABELS[category] ?? category,
        NUM.format(count),
      ]);

  const rows = hasError
    ? [
        ["Components", DASH],
        ["Distinct licenses", DASH],
        ["Copyleft components", DASH],
      ]
    : [
        ["Components", NUM.format(result.total)],
        ["Distinct licenses", NUM.format(result.licenseCount)],
        ["Copyleft components", NUM.format(result.copyleftCount)],
        ["Unrecognised licenses", NUM.format(result.unknownCount)],
        ...categoryRows,
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpenText className="h-4 w-4" aria-hidden="true" />
          Open source licensing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          License Attribution Page Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your dependency list and get a third-party licenses page grouped by license, with
          each license classified as permissive, weak copyleft or strong copyleft.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ap-project">
              Project / product name
            </label>
            <input
              id="ap-project"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ap-format">
              Output format
            </label>
            <select
              id="ap-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {OUTPUT_FORMATS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ap-manifest">
              Dependency manifest — one per line
            </label>
            <textarea
              id="ap-manifest"
              className={`mt-2 min-h-40 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={manifest}
              onChange={(event) => setManifest(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Accepted forms: name@version license · name version license · name | version |
              license | url. Lines starting with # are ignored.
            </p>
          </div>
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
              Generated page
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.total)} components`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated attribution page"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy page"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-96 overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
          <pre className="text-sm leading-6 whitespace-pre">
            <code>{hasError ? DASH : result.page}</code>
          </pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational tool, not legal advice. Notice pages satisfy the attribution part of MIT,
        BSD, ISC and Apache-2.0; copyleft licenses add source-availability duties this page alone
        does not discharge. Review flagged copyleft and unrecognised licenses with a lawyer.
      </p>
    </main>
  );
}
