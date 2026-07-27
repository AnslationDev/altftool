"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListTree, RotateCcw } from "lucide-react";

import { DEFAULT_INI, convertIniToYaml } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const TEXTAREA_CLASS =
  "min-h-[16rem] w-full resize-y rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

export default function ToolHome() {
  const [iniText, setIniText] = useState(DEFAULT_INI);
  const [nestSections, setNestSections] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertIniToYaml({ iniText, nestSections, inferTypes }),
    [iniText, nestSections, inferTypes],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setIniText(DEFAULT_INI);
    setNestSections(true);
    setInferTypes(true);
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Sections", DASH],
        ["Keys converted", DASH],
        ["Output size", DASH],
      ]
    : [
        ["Sections", NUM.format(result.sections)],
        ["Keys converted", NUM.format(result.keys)],
        ["Output size", `${NUM.format(result.outputChars)} chars`],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListTree className="h-4 w-4" aria-hidden="true" />
          Data formats
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">INI to YAML Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste an INI file and get structured YAML. Dotted sections like [database.primary] nest
          into a hierarchy, and booleans and numbers become real YAML types — all in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="i2y-input">
            INI input
          </label>
          <textarea
            id="i2y-input"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            spellCheck="false"
            value={iniText}
            onChange={(event) => setIniText(event.target.value)}
          />
        </div>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          <label htmlFor="i2y-nest" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              id="i2y-nest"
              type="checkbox"
              className={CHECK_CLASS}
              checked={nestSections}
              onChange={(event) => setNestSections(event.target.checked)}
            />
            Nest dotted section names ([a.b] becomes a: b:)
          </label>
          <label htmlFor="i2y-types" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              id="i2y-types"
              type="checkbox"
              className={CHECK_CLASS}
              checked={inferTypes}
              onChange={(event) => setInferTypes(event.target.checked)}
            />
            Infer types (true/false, numbers, empty = null)
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
              YAML output
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.keys)} keys`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the YAML output"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy YAML"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset to the example INI"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="p-4 text-xs leading-5">
            <code>{hasError ? DASH : result.yaml}</code>
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        INI has no formal specification, so this converter follows the conventions of Python&apos;s
        configparser and git config: = and : both delimit keys, ; and # start comments, and when a
        key repeats the last value wins (each override is reported). Quoted values always stay
        strings.
      </p>
    </main>
  );
}
