"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  FILE_TYPES,
  SHARING_CONTEXTS,
  assessDocumentMetadata,
  defaultPresentFieldIds,
  fieldsForType,
  sanitisePlan,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const DEFAULT_TYPE = "office";
const DEFAULT_CONTEXT = "counterparty";

const BAND_TEXT = {
  severe: "text-[var(--danger)]",
  high: "text-[var(--danger)]",
  moderate: "text-[var(--warning)]",
  low: "text-[var(--primary)]",
  none: "text-[var(--success)]",
};

export default function ToolHome() {
  const [fileTypeId, setFileTypeId] = useState(DEFAULT_TYPE);
  const [contextId, setContextId] = useState(DEFAULT_CONTEXT);
  const [present, setPresent] = useState(() => defaultPresentFieldIds(DEFAULT_TYPE));
  const [copied, setCopied] = useState(false);

  const fields = useMemo(() => fieldsForType(fileTypeId), [fileTypeId]);
  const result = useMemo(
    () => assessDocumentMetadata({ presentIds: present, fileTypeId, contextId }),
    [present, fileTypeId, contextId]
  );
  const hasError = Boolean(result.error);
  const plan = useMemo(() => (hasError ? [] : sanitisePlan(result)), [hasError, result]);

  const toggleField = (id) => {
    setPresent((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const changeFileType = (nextId) => {
    setFileTypeId(nextId);
    setPresent(defaultPresentFieldIds(nextId));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Document metadata exposure check",
      `File type: ${result.fileType.label}`,
      `Recipient: ${result.context.label}`,
      `Exposure score: ${result.score}/100 (${result.band.label})`,
      `Fields present: ${result.fieldCount} of ${result.totalFields}`,
      `Highest-risk fields: ${result.topRisks.map((field) => field.label).join(", ") || "none"}`,
      result.combos.length
        ? `Dangerous combinations: ${result.combos.map((combo) => combo.label).join("; ")}`
        : "Dangerous combinations: none",
      `Advice: ${result.band.advice}`,
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

  const reset = () => {
    setFileTypeId(DEFAULT_TYPE);
    setContextId(DEFAULT_CONTEXT);
    setPresent(defaultPresentFieldIds(DEFAULT_TYPE));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Document metadata
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          What Your Document Metadata Reveals
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Word, Excel, PowerPoint and PDF files carry author names, employer names, local paths and
          the whole edit history. Tick what your file still holds and see what the recipient can
          read. No file is uploaded — this is a reference model.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="doc-type">
              File type
            </label>
            <select
              id="doc-type"
              className={`mt-2 ${SELECT_CLASS}`}
              value={fileTypeId}
              onChange={(event) => changeFileType(event.target.value)}
            >
              {FILE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doc-context">
              Who receives it?
            </label>
            <select
              id="doc-context"
              className={`mt-2 ${SELECT_CLASS}`}
              value={contextId}
              onChange={(event) => setContextId(event.target.value)}
            >
              {SHARING_CONTEXTS.map((context) => (
                <option key={context.id} value={context.id}>
                  {context.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={CHIP_BTN}
            onClick={() => setPresent(defaultPresentFieldIds(fileTypeId))}
          >
            Typical uncleaned file
          </button>
          <button
            type="button"
            className={CHIP_BTN}
            onClick={() => setPresent(fields.map((field) => field.id))}
          >
            Worst case
          </button>
          <button type="button" className={CHIP_BTN} onClick={() => setPresent([])}>
            Fully cleaned
          </button>
        </div>

        {!hasError && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.context.note}
          </p>
        )}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Exposure score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : BAND_TEXT[result.band.id]
              }`}
            >
              {hasError ? DASH : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.band.label} — ${result.band.advice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the document metadata exposure summary"
              className={GHOST_BTN}
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
              aria-label="Reset to a typical Office document"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasError ? "No score available" : `Exposure ${result.score} out of 100`}
        >
          <span
            className="block h-full bg-[var(--danger)]"
            style={{ width: hasError ? "0%" : `${result.score}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fields present", hasError ? DASH : `${result.fieldCount} of ${result.totalFields}`],
            ["Raw risk points", hasError ? DASH : `${result.rawPoints} of ${result.maxPoints}`],
            ["File type", hasError ? DASH : result.fileType.label],
            [
              "Highest-risk field",
              hasError || result.topRisks.length === 0 ? DASH : result.topRisks[0].label,
            ],
            ["Dangerous combinations", hasError ? DASH : String(result.combos.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.byCategory.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {result.byCategory.map((entry) => (
              <li
                key={entry.id}
                className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
              >
                {entry.label}: {entry.count}
              </li>
            ))}
          </ul>
        )}

        {!hasError && result.combos.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {result.combos.map((combo) => (
              <li
                key={combo.id}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
              >
                <strong className="font-semibold">{combo.label}:</strong> {combo.detail}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What is still in the file?</h2>
        <div className="mt-4 grid gap-5">
          {CATEGORIES.map((category) => {
            const groupFields = fields.filter((field) => field.category === category.id);
            if (groupFields.length === 0) return null;
            return (
              <div key={category.id}>
                <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  {category.label}
                </h3>
                <ul className="mt-2 grid gap-2">
                  {groupFields.map((field) => {
                    const checked = present.includes(field.id);
                    const inputId = `doc-field-${field.id}`;
                    return (
                      <li key={field.id}>
                        <label
                          htmlFor={inputId}
                          className={`flex min-h-11 cursor-pointer gap-3 rounded-md border p-3 transition ${
                            checked
                              ? "border-[var(--danger)]/40 bg-[var(--danger-soft)]"
                              : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                          }`}
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[var(--primary)]"
                            checked={checked}
                            onChange={() => toggleField(field.id)}
                          />
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                              {field.label}
                              <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                                risk {field.weight}/10
                              </span>
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                              {field.reveals}
                            </span>
                            <span className="mt-1 block text-xs break-words text-[var(--muted-foreground)]">
                              {field.tag} · e.g. {field.example}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {!hasError && plan.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Clean-up order</h2>
          <ol className="mt-3 grid gap-3">
            {plan.map((item, index) => (
              <li key={item.id} className="text-sm leading-6">
                <span className="font-semibold">
                  {index + 1}. {item.title}
                </span>
                <span className="mt-0.5 block text-[var(--muted-foreground)]">{item.detail}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational model, not a file analyser. Menu names differ between Office versions and
        platforms, and no checklist replaces opening the finished file and looking. For documents
        under a legal disclosure or regulatory obligation, follow your organisation&rsquo;s own
        review process.
      </p>
    </main>
  );
}
