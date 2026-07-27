"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  ADAPTATION_OPTIONS,
  COMMERCIAL_OPTIONS,
  WORK_TYPES,
  buildLicenceGuidance,
  formatGuidance,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULTS = {
  commercial: "yes",
  adaptations: "yes",
  publicDomain: false,
  workType: "image",
  title: "Rain over Fort Kochi",
  creator: "A. Menon",
  sourceUrl: "https://example.org/photo",
  modified: false,
  modificationNote: "",
};

export default function ToolHome() {
  const [commercial, setCommercial] = useState(DEFAULTS.commercial);
  const [adaptations, setAdaptations] = useState(DEFAULTS.adaptations);
  const [publicDomain, setPublicDomain] = useState(DEFAULTS.publicDomain);
  const [workType, setWorkType] = useState(DEFAULTS.workType);
  const [title, setTitle] = useState(DEFAULTS.title);
  const [creator, setCreator] = useState(DEFAULTS.creator);
  const [sourceUrl, setSourceUrl] = useState(DEFAULTS.sourceUrl);
  const [modified, setModified] = useState(DEFAULTS.modified);
  const [modificationNote, setModificationNote] = useState(DEFAULTS.modificationNote);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () =>
      buildLicenceGuidance({
        commercial,
        adaptations,
        publicDomain,
        workType,
        title,
        creator,
        sourceUrl,
        modified,
        modificationNote,
      }),
    [commercial, adaptations, publicDomain, workType, title, creator, sourceUrl, modified, modificationNote],
  );

  const hasError = Boolean(result.error);
  const plainText = useMemo(() => (hasError ? "" : formatGuidance(result)), [result, hasError]);

  const copy = async (kind, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setCommercial(DEFAULTS.commercial);
    setAdaptations(DEFAULTS.adaptations);
    setPublicDomain(DEFAULTS.publicDomain);
    setWorkType(DEFAULTS.workType);
    setTitle(DEFAULTS.title);
    setCreator(DEFAULTS.creator);
    setSourceUrl(DEFAULTS.sourceUrl);
    setModified(DEFAULTS.modified);
    setModificationNote(DEFAULTS.modificationNote);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Creator rights
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Creative Commons Licence Picker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two questions decide the licence. You also get exactly what it permits, the traps to know
          about, and attribution text ready to paste.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-start gap-3">
          <input
            id="cc-public-domain"
            type="checkbox"
            className={`mt-0.5 ${CHECKBOX_CLASS}`}
            checked={publicDomain}
            onChange={(event) => {
              setPublicDomain(event.target.checked);
              setCopied("");
            }}
          />
          <label className="text-sm leading-6 text-[var(--foreground)]" htmlFor="cc-public-domain">
            Give up all rights and place the work in the public domain (CC0) — this overrides the two
            questions below
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-commercial">
              May others use the work commercially?
            </label>
            <select
              id="cc-commercial"
              className={`mt-2 ${INPUT_CLASS}`}
              value={commercial}
              disabled={publicDomain}
              onChange={(event) => {
                setCommercial(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(COMMERCIAL_OPTIONS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-adaptations">
              May others share adaptations of the work?
            </label>
            <select
              id="cc-adaptations"
              className={`mt-2 ${INPUT_CLASS}`}
              value={adaptations}
              disabled={publicDomain}
              onChange={(event) => {
                setAdaptations(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(ADAPTATION_OPTIONS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-worktype">
              What kind of work is it?
            </label>
            <select
              id="cc-worktype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={workType}
              onChange={(event) => {
                setWorkType(event.target.value);
                setCopied("");
              }}
            >
              {Object.values(WORK_TYPES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Details for the attribution line</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-title">
              Title of the work
            </label>
            <input
              id="cc-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-creator">
              Creator name
            </label>
            <input
              id="cc-creator"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={creator}
              onChange={(event) => {
                setCreator(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-source">
              Link to the original (http or https)
            </label>
            <input
              id="cc-source"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              inputMode="url"
              value={sourceUrl}
              onChange={(event) => {
                setSourceUrl(event.target.value);
                setCopied("");
              }}
            />
          </div>
          <div className="flex items-start gap-3">
            <input
              id="cc-modified"
              type="checkbox"
              className={`mt-0.5 ${CHECKBOX_CLASS}`}
              checked={modified}
              onChange={(event) => {
                setModified(event.target.checked);
                setCopied("");
              }}
            />
            <label className="text-sm leading-6 text-[var(--foreground)]" htmlFor="cc-modified">
              This version has been changed from the original
            </label>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-modnote">
              What changed (optional)
            </label>
            <input
              id="cc-modnote"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={modificationNote}
              disabled={!modified}
              onChange={(event) => {
                setModificationNote(event.target.value);
                setCopied("");
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={reset} aria-label="Reset all answers" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Recommended licence
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.licence.code}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the answers above" : result.licence.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy("all", plainText)}
            disabled={hasError}
            aria-label="Copy the licence guidance and attribution as text"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied === "all" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "all" ? "Copied!" : "Copy result"}
          </button>
        </div>
        {hasError ? null : (
          <>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.licence.summary}
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Licence deed
                </dt>
                <dd className="mt-1 text-sm break-all">
                  <a
                    className="font-medium text-[var(--primary)] underline"
                    href={result.licence.url}
                    rel="license noopener noreferrer"
                    target="_blank"
                  >
                    {result.licence.url}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Permissions granted
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {result.allowedCount} / {result.totalPermissions}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Free cultural work
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {result.licence.freeCulturalWork ? "Approved" : "Not approved"}
                </dd>
              </div>
            </dl>
          </>
        )}
      </section>

      {hasError ? null : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">What others may do</h2>
            <ul className="mt-3 grid gap-3">
              {result.permissions.map((permission) => (
                <li
                  key={permission.id}
                  className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3"
                >
                  <span
                    className={
                      permission.allowed
                        ? "mt-0.5 inline-flex shrink-0 items-center rounded-md bg-[var(--success-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]"
                        : "mt-0.5 inline-flex shrink-0 items-center rounded-md bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]"
                    }
                  >
                    {permission.allowed ? "Yes" : "No"}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{permission.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                      {permission.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Attribution to give reusers</h2>
            {result.missingAttributionFields.length > 0 ? (
              <p className="mt-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
                Still missing: {result.missingAttributionFields.join(", ")}. Attribution is mandatory
                under this licence, so fill these in.
              </p>
            ) : null}
            <p className="mt-3 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Plain text
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 whitespace-pre-wrap">
              {result.attributionText}
            </pre>
            <button
              type="button"
              onClick={() => copy("text", result.attributionText)}
              aria-label="Copy the plain-text attribution line"
              className={`mt-2 ${GHOST_BTN}`}
            >
              {copied === "text" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "text" ? "Copied!" : "Copy attribution"}
            </button>

            <p className="mt-4 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              HTML
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 whitespace-pre-wrap">
              {result.attributionHtml}
            </pre>
            <button
              type="button"
              onClick={() => copy("html", result.attributionHtml)}
              aria-label="Copy the HTML attribution snippet"
              className={`mt-2 ${GHOST_BTN}`}
            >
              {copied === "html" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "html" ? "Copied!" : "Copy HTML"}
            </button>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Before you commit</h2>
            <ul className="mt-3 grid gap-3">
              {result.warnings.map((warning) => (
                <li
                  key={warning.id}
                  className={
                    warning.severity === "warning"
                      ? "rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
                      : "rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm leading-6 text-[var(--info)]"
                  }
                >
                  {warning.text}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — this is general guidance, not legal advice. Licence texts on
        creativecommons.org are what actually bind you and your reusers. Take advice if the work is
        commercially significant or if you are not certain you hold the rights you are granting.
      </p>
    </main>
  );
}
