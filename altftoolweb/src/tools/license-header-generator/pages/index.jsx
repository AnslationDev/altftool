"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, RotateCcw } from "lucide-react";

import { LANGUAGES, LICENSES, generateLicenseHeader } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  licenseId: "MIT",
  languageId: "js",
  year: "2026",
  holder: "Your Name or Organisation",
  includeSpdx: true,
};

const DASH = "—";

export default function ToolHome() {
  const [licenseId, setLicenseId] = useState(DEFAULTS.licenseId);
  const [languageId, setLanguageId] = useState(DEFAULTS.languageId);
  const [year, setYear] = useState(DEFAULTS.year);
  const [holder, setHolder] = useState(DEFAULTS.holder);
  const [includeSpdx, setIncludeSpdx] = useState(DEFAULTS.includeSpdx);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => generateLicenseHeader({ licenseId, languageId, year, holder, includeSpdx }),
    [licenseId, languageId, year, holder, includeSpdx],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.header);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLicenseId(DEFAULTS.licenseId);
    setLanguageId(DEFAULTS.languageId);
    setYear(DEFAULTS.year);
    setHolder(DEFAULTS.holder);
    setIncludeSpdx(DEFAULTS.includeSpdx);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["License", DASH],
        ["SPDX identifier", DASH],
        ["Header lines", DASH],
      ]
    : [
        ["License", result.licenseName],
        ["SPDX identifier", result.spdxId],
        ["Header lines", String(result.lineCount)],
        [
          "Header wording",
          result.hasOfficialHeader ? "Official per-file header text" : "REUSE-style copyright + SPDX line",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode2 className="h-4 w-4" aria-hidden="true" />
          Open source licensing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">License Header Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a license and a language to get a ready-to-paste file header comment with your year,
          copyright holder and an SPDX-License-Identifier line.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-license">
              License
            </label>
            <select
              id="lh-license"
              className={`mt-2 ${INPUT_CLASS}`}
              value={licenseId}
              onChange={(event) => setLicenseId(event.target.value)}
            >
              {LICENSES.map((license) => (
                <option key={license.id} value={license.id}>
                  {license.name} ({license.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-language">
              Language / comment style
            </label>
            <select
              id="lh-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={languageId}
              onChange={(event) => setLanguageId(event.target.value)}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-year">
              Copyright year or range
            </label>
            <input
              id="lh-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              placeholder="2026 or 2020-2026"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-holder">
              Copyright holder
            </label>
            <input
              id="lh-holder"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={holder}
              onChange={(event) => setHolder(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="lh-spdx"
        >
          <input
            id="lh-spdx"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={includeSpdx}
            onChange={(event) => setIncludeSpdx(event.target.checked)}
          />
          Include an SPDX-License-Identifier line (REUSE specification style)
        </label>
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
              Generated header
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.spdxId}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated license header"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy header"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
          <pre className="text-sm leading-6 whitespace-pre">
            <code>{hasError ? DASH : result.header}</code>
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
        Informational tool, not legal advice. Header wording follows each license&apos;s own
        &quot;how to apply&quot; appendix (Apache-2.0, GPL family, MPL-2.0 Exhibit A) or the REUSE
        specification for licenses without an official per-file header. Confirm licensing decisions
        with a lawyer where it matters.
      </p>
    </main>
  );
}
