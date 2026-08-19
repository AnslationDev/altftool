"use client";

import { useMemo, useState } from "react";
import { BookA, Check, Copy, RotateCcw } from "lucide-react";

import {
  AUDIENCES,
  DEFINITION_STYLES,
  ENTRY_PARTS,
  LIMITS,
  buildGlossaryPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  domain: "our marketplace analytics reporting",
  sourceText:
    "Gross Merchandise Value (GMV) is the headline metric on the seller dashboard. GMV excludes returns and cancellations. Take rate is the share we keep on each completed order, quoted before tax. The Net Promoter Score survey goes out monthly, and the NPS result is reported next to GMV in the weekly review. Settlement Window is the period between order completion and payout.",
  manualText: "chargeback\nsettlement window",
  maxTerms: "20",
  styleId: "intensional",
  audienceId: "internal",
  partIds: ["example", "notThis"],
  notes: "",
};

export default function ToolHome() {
  const [domain, setDomain] = useState(DEFAULTS.domain);
  const [sourceText, setSourceText] = useState(DEFAULTS.sourceText);
  const [manualText, setManualText] = useState(DEFAULTS.manualText);
  const [maxTerms, setMaxTerms] = useState(DEFAULTS.maxTerms);
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [audienceId, setAudienceId] = useState(DEFAULTS.audienceId);
  const [partIds, setPartIds] = useState(DEFAULTS.partIds);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildGlossaryPrompt({
        domain,
        sourceText,
        manualText,
        maxTerms: Number(maxTerms),
        styleId,
        audienceId,
        partIds,
        notes,
      }),
    [domain, sourceText, manualText, maxTerms, styleId, audienceId, partIds, notes],
  );

  const hasError = Boolean(result.error);

  const togglePart = (id) => {
    setPartIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

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
    setDomain(DEFAULTS.domain);
    setSourceText(DEFAULTS.sourceText);
    setManualText(DEFAULTS.manualText);
    setMaxTerms(DEFAULTS.maxTerms);
    setStyleId(DEFAULTS.styleId);
    setAudienceId(DEFAULTS.audienceId);
    setPartIds(DEFAULTS.partIds);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Acronyms found", DASH],
        ["Named phrases found", DASH],
        ["Repeated terms found", DASH],
        ["Source length", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Acronyms found", NUM.format(result.found.acronyms)],
        ["Named phrases found", NUM.format(result.found.phrases)],
        ["Repeated terms found", NUM.format(result.found.repeated)],
        ["Source length", `${NUM.format(result.sourceWords)} words`],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookA className="h-4 w-4" aria-hidden="true" />
          Terminology
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Glossary Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your docs and the builder pulls out acronyms, named phrases and
          repeated terms, then writes a prompt that defines each one under ISO
          704 rules — genus plus differentia, substitutable, never circular.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gl-domain">
              Domain or product the glossary covers
            </label>
            <input
              id="gl-domain"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gl-source">
              Source text — docs, specs or help articles to scan
            </label>
            <textarea
              id="gl-source"
              className={`mt-2 ${AREA_CLASS}`}
              rows={7}
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-manual">
              Terms you already know you need — one per line
            </label>
            <textarea
              id="gl-manual"
              className={`mt-2 ${AREA_CLASS}`}
              rows={4}
              value={manualText}
              onChange={(event) => setManualText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-max">
              Maximum terms (1–{LIMITS.terms.max})
            </label>
            <input
              id="gl-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={LIMITS.terms.max}
              step="1"
              value={maxTerms}
              onChange={(event) => setMaxTerms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-style">
              Definition style
            </label>
            <select
              id="gl-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {DEFINITION_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gl-audience">
              Audience
            </label>
            <select
              id="gl-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audienceId}
              onChange={(event) => setAudienceId(event.target.value)}
            >
              {AUDIENCES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold text-[var(--foreground)]">
              Extra fields per entry
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {ENTRY_PARTS.map((part) => (
                <label
                  key={part.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  htmlFor={`gl-part-${part.id}`}
                >
                  <input
                    id={`gl-part-${part.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={partIds.includes(part.id)}
                    onChange={() => togglePart(part.id)}
                  />
                  <span>{part.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gl-notes">
              Extra instruction (optional)
            </label>
            <input
              id="gl-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. output as a CSV with term, definition, owner"
            />
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
              Terms to define
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.termCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.termCount < result.totalFound
                  ? `${NUM.format(result.totalFound)} candidates found, capped at your limit.`
                  : `${NUM.format(result.totalFound)} candidates found.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated glossary prompt"
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

        {!hasError && result.terms.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Candidate term
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Where it came from
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.terms.map((item) => (
                  <tr key={item.term} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.term}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {item.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

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
        Candidate extraction is pattern-based — acronyms of two to six capitals,
        capitalised multi-word phrases and words repeated three or more times —
        so review the list before generating. A domain expert still has to
        approve every definition.
      </p>
    </main>
  );
}
