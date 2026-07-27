"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCompare, RotateCcw } from "lucide-react";

import { DOC_TYPES, checkFileAgainstSpecs, compareSpecs, specsForDoc } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_DOC = "photo";

export default function ToolHome() {
  const [docType, setDocType] = useState(DEFAULT_DOC);
  const [selected, setSelected] = useState(() => specsForDoc(DEFAULT_DOC).map((spec) => spec.id));
  const [fileKB, setFileKB] = useState("45");
  const [copied, setCopied] = useState(false);

  const docSpecs = useMemo(() => specsForDoc(docType), [docType]);
  const activeIds = useMemo(
    () => selected.filter((id) => docSpecs.some((spec) => spec.id === id)),
    [selected, docSpecs],
  );

  const result = useMemo(() => compareSpecs({ specIds: activeIds }), [activeIds]);
  const hasError = Boolean(result.error);

  const fileCheck = useMemo(
    () =>
      checkFileAgainstSpecs({
        sizeKB: fileKB.trim() === "" ? Number.NaN : Number(fileKB),
        specIds: activeIds,
      }),
    [fileKB, activeIds],
  );

  const switchDoc = (nextDoc) => {
    setDocType(nextDoc);
    setSelected(specsForDoc(nextDoc).map((spec) => spec.id));
  };

  const toggle = (id) => {
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const docLabel = DOC_TYPES.find((doc) => doc.id === result.doc)?.label ?? result.doc;
    return [
      `Common ${docLabel.toLowerCase()} upload window across ${result.specs.length} portal(s)`,
      result.compatible
        ? `One file works: JPG/JPEG, ${NUM.format(result.minKB)}-${NUM.format(result.maxKB)} KB`
        : "No single file satisfies every selected portal.",
      ...result.specs.map((spec) => `${spec.portal}: ${spec.minKB}-${spec.maxKB} KB${spec.note ? ` (${spec.note})` : ""}`),
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
    switchDoc(DEFAULT_DOC);
    setFileKB("45");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitCompare className="h-4 w-4" aria-hidden="true" />
          Upload troubleshooting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Portal Upload Spec Comparer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Select the portals you are applying to and see the one size window and format that
          satisfies all of them — so a single photo or signature file works everywhere.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Document type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DOC_TYPES.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => switchDoc(doc.id)}
                aria-pressed={docType === doc.id}
                className={`min-h-11 rounded-md border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  docType === doc.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {doc.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Portals to compare</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {docSpecs.map((spec) => (
              <label
                key={spec.id}
                htmlFor={`psc-${spec.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`psc-${spec.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={activeIds.includes(spec.id)}
                  onChange={() => toggle(spec.id)}
                />
                <span>
                  <span className="font-semibold">{spec.portal}</span>{" "}
                  <span className="text-[var(--muted-foreground)]">
                    {spec.minKB}–{spec.maxKB} KB
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="psc-filekb">
            Check a file you already have (size in KB)
          </label>
          <input
            id="psc-filekb"
            className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            value={fileKB}
            onChange={(event) => setFileKB(event.target.value)}
          />
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
              Common size window
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : result.compatible
                  ? `${NUM.format(result.minKB)}–${NUM.format(result.maxKB)} KB`
                  : "None"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Select portals above to compare their rules."
                : result.compatible
                  ? `A single ${result.commonFormats.join("/").toUpperCase()} file in this window passes every selected portal's size check.`
                  : !result.sizeCompatible
                    ? "The size limits do not overlap — one portal's minimum exceeds another's maximum."
                    : !result.pxCompatible
                      ? "Portals demand different fixed pixel dimensions, so one file cannot fit all."
                      : "No common accepted format."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the comparison result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the comparison" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Portal</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Size rule</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Notes</th>
                  <th scope="col" className="py-2 text-right font-semibold">Your file</th>
                </tr>
              </thead>
              <tbody>
                {result.specs.map((spec) => {
                  const verdict = fileCheck.error
                    ? null
                    : fileCheck.results.find((entry) => entry.portal === spec.portal);
                  return (
                    <tr key={spec.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{spec.portal}</td>
                      <td className="py-2 pr-3">
                        {spec.minKB}–{spec.maxKB} KB {spec.formats.join("/").toUpperCase()}
                      </td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{spec.note || DASH}</td>
                      <td className="py-2 text-right">
                        {verdict ? (
                          <span className={`font-semibold ${verdict.pass ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                            {verdict.pass ? "Fits" : verdict.reason}
                          </span>
                        ) : (
                          DASH
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Accepted format everywhere</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.commonFormats.length > 0 ? result.commonFormats.join(" / ").toUpperCase() : "None"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Tightest portal</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.tightest.portal} (${result.tightest.minKB}–${result.tightest.maxKB} KB)`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Fixed pixel dimensions demanded</dt>
            <dd className="text-right font-semibold">
              {hasError
                ? DASH
                : result.pxRequirements.length === 0
                  ? "None"
                  : result.pxRequirements.map((px) => `${px.portal}: ${px.width}×${px.height}px`).join("; ")}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rules as published in each portal's application instructions (values commonly in force up to
        2025). Portals revise specs between cycles — always confirm against the current
        notification before uploading.
      </p>
    </main>
  );
}
