"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, MessageSquareCode, RotateCcw } from "lucide-react";

import {
  DETAIL_LEVELS,
  DOC_CONVENTIONS,
  FAMILY_LABELS,
  LIMITS,
  buildCommentPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const SAMPLE_CODE = `export async function fetchInvoice(invoiceId, { retries = 2 } = {}) {
  if (!invoiceId) throw new TypeError("invoiceId is required");
  const response = await fetch(\`/api/invoices/\${invoiceId}\`);
  if (!response.ok && retries > 0) {
    return fetchInvoice(invoiceId, { retries: retries - 1 });
  }
  return response.json();
}`;

const DEFAULTS = {
  conventionId: "jsdoc",
  detailId: "standard",
  params: true,
  returns: true,
  throws: true,
  examples: false,
  publicOnly: false,
  context: "Invoices are fetched from an internal billing API that 429s under load.",
  code: SAMPLE_CODE,
};

const DASH = "—";

export default function ToolHome() {
  const [conventionId, setConventionId] = useState(DEFAULTS.conventionId);
  const [detailId, setDetailId] = useState(DEFAULTS.detailId);
  const [params, setParams] = useState(DEFAULTS.params);
  const [returns, setReturns] = useState(DEFAULTS.returns);
  const [throws, setThrows] = useState(DEFAULTS.throws);
  const [examples, setExamples] = useState(DEFAULTS.examples);
  const [publicOnly, setPublicOnly] = useState(DEFAULTS.publicOnly);
  const [context, setContext] = useState(DEFAULTS.context);
  const [code, setCode] = useState(DEFAULTS.code);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCommentPrompt({
        conventionId,
        detailId,
        params,
        returns,
        throws,
        examples,
        publicOnly,
        context,
        code,
      }),
    [conventionId, detailId, params, returns, throws, examples, publicOnly, context, code],
  );

  const hasError = Boolean(result.error);
  const minimal = detailId === "minimal";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setConventionId(DEFAULTS.conventionId);
    setDetailId(DEFAULTS.detailId);
    setParams(DEFAULTS.params);
    setReturns(DEFAULTS.returns);
    setThrows(DEFAULTS.throws);
    setExamples(DEFAULTS.examples);
    setPublicOnly(DEFAULTS.publicOnly);
    setContext(DEFAULTS.context);
    setCode(DEFAULTS.code);
    setCopied(false);
  };

  const sectionsIncluded = minimal
    ? "Summary line only"
    : ["Summary", params && "Parameters", returns && "Returns", throws && "Errors", examples && "Example"]
        .filter(Boolean)
        .join(", ");

  const rows = hasError
    ? [
        ["Convention", DASH],
        ["Line limit", DASH],
        ["Sections in the skeleton", DASH],
        ["Language detected in snippet", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Convention", `${result.convention.spec} (${result.convention.language})`],
        [
          "Line limit",
          result.lineLimit
            ? `${result.lineLimit.columns} columns — ${result.lineLimit.source}`
            : "No published column limit",
        ],
        ["Sections in the skeleton", sectionsIncluded],
        [
          "Language detected in snippet",
          result.detectedFamily ? FAMILY_LABELS[result.detectedFamily] : "Not confident",
        ],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  const checkboxes = [
    ["ccp-params", "Document parameters", params, setParams],
    ["ccp-returns", "Document the return value", returns, setReturns],
    ["ccp-throws", "Document errors / exceptions", throws, setThrows],
    ["ccp-examples", "Include a usage example", examples, setExamples],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageSquareCode className="h-4 w-4" aria-hidden="true" />
          Developer
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Code Comment Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a documentation convention — JSDoc, TSDoc, Google or NumPy Python,
          Sphinx, Javadoc, Doxygen, C# XML, rustdoc or Go doc — and get a prompt
          carrying that convention&apos;s exact skeleton, tag spelling and column limit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ccp-convention">
              Documentation convention
            </label>
            <select
              id="ccp-convention"
              className={`mt-2 ${INPUT_CLASS}`}
              value={conventionId}
              onChange={(event) => setConventionId(event.target.value)}
            >
              {DOC_CONVENTIONS.map((convention) => (
                <option key={convention.id} value={convention.id}>
                  {convention.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccp-detail">
              Detail level
            </label>
            <select
              id="ccp-detail"
              className={`mt-2 ${INPUT_CLASS}`}
              value={detailId}
              onChange={(event) => setDetailId(event.target.value)}
            >
              {DETAIL_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ccp-code">
              Code to document ({LIMITS.codeChars.min}–
              {NUM.format(LIMITS.codeChars.max)} characters)
            </label>
            <textarea
              id="ccp-code"
              className={`mt-2 ${AREA_CLASS}`}
              rows={8}
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Paste one file, class or function…"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ccp-context">
              Domain context the code does not reveal (optional)
            </label>
            <input
              id="ccp-context"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={context}
              onChange={(event) => setContext(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4" disabled={minimal}>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Sections to request
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {checkboxes.map(([id, label, checked, setChecked]) => (
              <label
                key={id}
                htmlFor={id}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm ${
                  minimal ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={minimal ? false : checked}
                  onChange={(event) => setChecked(event.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
          {minimal ? (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Minimal detail writes the summary line only, so sections are switched off.
            </p>
          ) : null}
        </fieldset>

        <label
          htmlFor="ccp-public"
          className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
        >
          <input
            id="ccp-public"
            type="checkbox"
            className={CHECK_CLASS}
            checked={publicOnly}
            onChange={(event) => setPublicOnly(event.target.checked)}
          />
          Document only exported / public declarations
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
              Declarations to document
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.declarations)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.declarations === 0
                  ? `No ${result.convention.language} declaration matched — check the convention fits the snippet.`
                  : "Pattern-matched estimate of the doc blocks the model has to write."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated documentation comment prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Doc comment skeleton
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.skeleton}
            </pre>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Column limits come from the published style rules: PEP 8 caps docstrings at
        72 columns, Prettier defaults to 80, Google Java Style and rustfmt to 100.
        The declaration count is a pattern-match estimate, not a parse.
      </p>
    </main>
  );
}
