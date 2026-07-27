"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSignature, RotateCcw } from "lucide-react";

import { LOCATIONS, RECOGNISABILITY, REGIONS, USAGES, checkReleaseNeed } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX =
  "h-5 w-5 shrink-0 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  usage: "advertising",
  recognisable: "clear",
  location: "public",
  region: "us",
  minor: false,
  sensitiveContext: false,
  propertyFeatured: false,
  artworkFeatured: false,
  petFeatured: false,
};

const DASH = "—";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

const SELECTS = [
  ["usage", "How will the images be used?", USAGES],
  ["recognisable", "Is anyone identifiable in the frame?", RECOGNISABILITY],
  ["location", "Where was it shot?", LOCATIONS],
  ["region", "Where will it be published?", REGIONS],
];

const TOGGLES = [
  ["minor", "The subject is under 18"],
  ["sensitiveContext", "The context is sensitive (health, religion, politics, sexuality, wrongdoing)"],
  ["propertyFeatured", "Recognisable private property is the subject of the shot"],
  ["artworkFeatured", "Artwork, a mural or a designed object features prominently"],
  ["petFeatured", "Someone's pet is recognisable in the shot"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setSelect = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const setToggle = (key) => (event) => {
    const { checked } = event.target;
    setForm((prev) => ({ ...prev, [key]: checked }));
    setCopied(false);
  };

  const result = useMemo(() => checkReleaseNeed(form), [form]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Model release check: ${result.verdict.headline}`,
      "",
      "Why:",
      ...result.reasons.map((line) => `- ${line}`),
      "",
      result.documents.length ? "Documents to collect:" : "No release documents flagged.",
      ...result.documents.map((line) => `- ${line}`),
      "",
      "Informational only — not legal advice.",
    ].join("\n");
  }, [result]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileSignature className="h-4 w-4" aria-hidden="true" />
          Shoot paperwork
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Model Release Need Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer four questions about the shoot and see whether a model or property release is
          normally needed, which documents to collect, and why each one applies.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {SELECTS.map(([key, labelText, options]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`rel-${key}`}>
                {labelText}
              </label>
              <select
                id={`rel-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={form[key]}
                onChange={setSelect(key)}
              >
                {Object.entries(options).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Anything else in the frame?</legend>
          <div className="mt-2 grid gap-1">
            {TOGGLES.map(([key, text]) => (
              <label key={key} className={CHECK_ROW} htmlFor={`rel-${key}`}>
                <input
                  id={`rel-${key}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={form[key]}
                  onChange={setToggle(key)}
                />
                <span>{text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Verdict</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Use type", "Subject identifiable", "Documents flagged"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Verdict</p>
                <p className={`mt-1 text-2xl font-semibold leading-8 sm:text-3xl ${TONE_TEXT[result.verdict.tone]}`}>
                  {result.verdict.headline}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the release check result"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Use type", result.commercial ? "Commercial" : "Editorial / non-commercial"],
                ["Subject identifiable", result.identifiable ? "Yes" : "No"],
                ["Documents flagged", result.documents.length ? String(result.documents.length) : "None"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Why</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.reasons.map((item) => (
                <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {result.documents.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Documents to collect</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {result.documents.map((item) => (
                  <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2 font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Good practice on any shoot</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.checklist.map((item) => (
                <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {item}
                </li>
              ))}
              {result.notes.map((item) => (
                <li key={item} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not legal advice. Publicity, privacy and data-protection rules
        differ by country and by state, and a client contract can impose stricter requirements —
        ask a lawyer before relying on this for a commercial shoot.
      </p>
    </main>
  );
}
