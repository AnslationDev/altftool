"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileStack, RotateCcw } from "lucide-react";
import { WORDS_PER_TOKEN, computeDocumentCost } from "../lib";

const CURRENCIES = [
  { code: "USD", locale: "en-US" },
  { code: "EUR", locale: "de-DE" },
  { code: "GBP", locale: "en-GB" },
  { code: "INR", locale: "en-IN" },
];

const DEFAULTS = {
  pages: "12",
  wordsPerPage: "500",
  chunkTokens: "2000",
  overlapTokens: "200",
  promptTokens: "300",
  outputTokens: "700",
  passes: "1",
  inputPricePerM: "3",
  outputPricePerM: "15",
  ocrPricePerPage: "0.0015",
  embedPricePerM: "0.13",
  documentsPerMonth: "5000",
  currency: "USD",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const DOC_FIELDS = [
  { key: "pages", label: "Pages per document", min: "1", step: "1" },
  { key: "wordsPerPage", label: "Words per page", min: "0", step: "25" },
  { key: "chunkTokens", label: "Chunk size in tokens (0 = whole document)", min: "0", step: "100" },
  { key: "overlapTokens", label: "Overlap between chunks (tokens)", min: "0", step: "50" },
  { key: "promptTokens", label: "Instruction tokens per chunk", min: "0", step: "50" },
  { key: "outputTokens", label: "Output tokens per pass", min: "0", step: "50" },
  { key: "passes", label: "Passes over the document", min: "1", max: "20", step: "1" },
  { key: "documentsPerMonth", label: "Documents per month", min: "0", step: "100" },
];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const currency = CURRENCIES.find((item) => item.code === values.currency) || CURRENCIES[0];
  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);
  const fine = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 5,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : "—");
  }, [currency]);

  const result = useMemo(
    () =>
      computeDocumentCost({
        pages: toNumber(values.pages),
        wordsPerPage: toNumber(values.wordsPerPage),
        chunkTokens: toNumber(values.chunkTokens),
        overlapTokens: toNumber(values.overlapTokens),
        promptTokens: toNumber(values.promptTokens),
        outputTokens: toNumber(values.outputTokens),
        passes: toNumber(values.passes),
        inputPricePerM: toNumber(values.inputPricePerM),
        outputPricePerM: toNumber(values.outputPricePerM),
        ocrPricePerPage: toNumber(values.ocrPricePerPage),
        embedPricePerM: toNumber(values.embedPricePerM),
        documentsPerMonth: toNumber(values.documentsPerMonth),
      }),
    [values],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = hasError
    ? ""
    : [
        "Cost Per Document Processed Calculator",
        `Cost per document: ${fine(result.totalPerDocument)}`,
        `Cost per page: ${fine(result.costPerPage)}`,
        `Cost per 1,000 documents: ${money(result.costPer1000)}`,
        `Monthly cost: ${money(result.monthlyCost)}`,
        `Tokens: ${NUM.format(result.documentTokens)} in the document, ${NUM.format(result.totalInputTokens)} billed as input`,
      ].join("\n");

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileStack className="h-4 w-4" aria-hidden="true" />
          Document pipelines
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cost Per Document Processed Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts pages and words into tokens at the standard {WORDS_PER_TOKEN}-words-per-token
          rule, then adds chunk overlap, per-chunk instructions, extra passes, OCR and embedding to
          give a per-document, per-page and per-thousand figure.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The document and the pipeline</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="doc-currency">
              Currency
            </label>
            <select
              id="doc-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.currency}
              onChange={set("currency")}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>
          </div>
          {DOC_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`doc-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`doc-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rates</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {[
            { key: "inputPricePerM", label: `Input price per 1M tokens (${currency.code})`, step: "0.1" },
            { key: "outputPricePerM", label: `Output price per 1M tokens (${currency.code})`, step: "0.1" },
            { key: "ocrPricePerPage", label: `OCR / parse cost per page (${currency.code})`, step: "0.0005" },
            { key: "embedPricePerM", label: `Embedding price per 1M tokens (${currency.code})`, step: "0.01" },
          ].map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`doc-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`doc-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={values[field.key]}
                onChange={set(field.key)}
              />
            </div>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost per document
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : fine(result.totalPerDocument)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${fine(result.costPerPage)} per page · ${money(result.costPer1000)} per 1,000 documents`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cost per document result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words in the document", hasError ? dash : NUM.format(result.words)],
            ["Tokens in the document", hasError ? dash : NUM.format(result.documentTokens)],
            ["Chunks", hasError ? dash : NUM.format(result.chunks)],
            ["Overlap tokens billed per pass", hasError ? dash : NUM.format(result.overlapBilled)],
            ["Instruction tokens per pass", hasError ? dash : NUM.format(result.promptOverhead)],
            ["Total input tokens billed", hasError ? dash : NUM.format(result.totalInputTokens)],
            ["Total output tokens billed", hasError ? dash : NUM.format(result.totalOutputTokens)],
            ["Monthly cost at this volume", hasError ? dash : money(result.monthlyCost)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per document</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{fine(row.amount)}</td>
                    <td className="py-2 text-right font-semibold">{row.sharePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Token counts vary with language, tables and code — non-English text and
        scanned tables typically use more tokens per word than the {WORDS_PER_TOKEN} rule. Measure a
        real sample with your tokeniser before committing to a per-document price.
      </p>
    </main>
  );
}
