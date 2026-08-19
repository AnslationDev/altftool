"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Image as ImageIcon, RotateCcw } from "lucide-react";

import {
  PEOPLE_OPTIONS,
  PROPERTY_OPTIONS,
  SOURCES,
  USES,
  assessImageUse,
  formatAssessment,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const STATUS_STYLES = {
  blocker: "bg-[var(--danger-soft)] text-[var(--danger)]",
  required: "bg-[var(--warning-soft)] text-[var(--warning)]",
  recommended: "bg-[var(--info-soft)] text-[var(--info)]",
  ok: "bg-[var(--success-soft)] text-[var(--success)]",
  na: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULTS = {
  sourceId: "stockRoyaltyFree",
  useId: "organicSocial",
  people: "recognisable",
  property: "none",
  willModify: false,
  hasWrittenPermission: false,
};

export default function ToolHome() {
  const [sourceId, setSourceId] = useState(DEFAULTS.sourceId);
  const [useId, setUseId] = useState(DEFAULTS.useId);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [property, setProperty] = useState(DEFAULTS.property);
  const [willModify, setWillModify] = useState(DEFAULTS.willModify);
  const [hasWrittenPermission, setHasWrittenPermission] = useState(DEFAULTS.hasWrittenPermission);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessImageUse({ sourceId, useId, people, property, willModify, hasWrittenPermission }),
    [sourceId, useId, people, property, willModify, hasWrittenPermission],
  );

  const hasError = Boolean(result.error);
  const plainText = useMemo(() => (hasError ? "" : formatAssessment(result)), [result, hasError]);

  const copy = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSourceId(DEFAULTS.sourceId);
    setUseId(DEFAULTS.useId);
    setPeople(DEFAULTS.people);
    setProperty(DEFAULTS.property);
    setWillModify(DEFAULTS.willModify);
    setHasWrittenPermission(DEFAULTS.hasWrittenPermission);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          Creator rights
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Image Usage Rights Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six questions about a picture, and a ranked checklist of the copyright, licence, model
          release and trademark clearances your planned use actually needs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="img-source">
              Where did the image come from?
            </label>
            <select
              id="img-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sourceId}
              onChange={(event) => {
                setSourceId(event.target.value);
                setCopied(false);
              }}
            >
              {Object.values(SOURCES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="img-use">
              What will you use it for?
            </label>
            <select
              id="img-use"
              className={`mt-2 ${INPUT_CLASS}`}
              value={useId}
              onChange={(event) => {
                setUseId(event.target.value);
                setCopied(false);
              }}
            >
              {Object.values(USES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="img-people">
              Who appears in it?
            </label>
            <select
              id="img-people"
              className={`mt-2 ${INPUT_CLASS}`}
              value={people}
              onChange={(event) => {
                setPeople(event.target.value);
                setCopied(false);
              }}
            >
              {Object.values(PEOPLE_OPTIONS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="img-property">
              What else is in the frame?
            </label>
            <select
              id="img-property"
              className={`mt-2 ${INPUT_CLASS}`}
              value={property}
              onChange={(event) => {
                setProperty(event.target.value);
                setCopied(false);
              }}
            >
              {Object.values(PROPERTY_OPTIONS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-start gap-3">
            <input
              id="img-modify"
              type="checkbox"
              className={`mt-0.5 ${CHECKBOX_CLASS}`}
              checked={willModify}
              onChange={(event) => {
                setWillModify(event.target.checked);
                setCopied(false);
              }}
            />
            <label className="text-sm leading-6 text-[var(--foreground)]" htmlFor="img-modify">
              I will crop, edit or composite the image
            </label>
          </div>
          <div className="flex items-start gap-3">
            <input
              id="img-permission"
              type="checkbox"
              className={`mt-0.5 ${CHECKBOX_CLASS}`}
              checked={hasWrittenPermission}
              onChange={(event) => {
                setHasWrittenPermission(event.target.checked);
                setCopied(false);
              }}
            />
            <label className="text-sm leading-6 text-[var(--foreground)]" htmlFor="img-permission">
              I hold written permission from the rights holder
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={reset} aria-label="Reset the questions" className={GHOST_BTN}>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Verdict
            </p>
            <p
              className={
                hasError
                  ? "mt-1 text-3xl font-semibold text-[var(--muted-foreground)]"
                  : result.blockerCount > 0
                    ? "mt-1 text-3xl font-semibold text-[var(--danger)]"
                    : result.requiredCount > 0
                      ? "mt-1 text-3xl font-semibold text-[var(--warning)]"
                      : "mt-1 text-3xl font-semibold text-[var(--success)]"
              }
            >
              {hasError ? DASH : result.verdict}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the answers above" : result.verdictDetail}
            </p>
          </div>
          <button
            type="button"
            onClick={copy}
            disabled={hasError}
            aria-label="Copy the clearance checklist as text"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>
        {hasError ? null : (
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Blockers
              </dt>
              <dd className="mt-1 text-sm font-semibold">{result.blockerCount}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Must clear in writing
              </dt>
              <dd className="mt-1 text-sm font-semibold">{result.requiredCount}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Use is treated as
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                {result.commercial ? "Commercial" : "Non-commercial"}
                {result.resale ? " · resale" : ""}
              </dd>
            </div>
          </dl>
        )}
        {hasError ? null : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.sourceNote}
          </p>
        )}
      </section>

      {hasError ? null : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" role="status">
          <h2 className="text-base font-semibold">Clearance checklist</h2>
          <ul className="mt-4 grid gap-3">
            {result.items.map((item) => (
              <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[item.status]}`}
                  >
                    {result.statusLabels[item.status]}
                  </span>
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasError ? null : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Why the four rights are separate</h2>
          <dl className="mt-3 grid gap-3 text-sm leading-6">
            <div>
              <dt className="font-semibold">Copyright</dt>
              <dd className="text-[var(--muted-foreground)]">
                Belongs to whoever created the photograph. Clearing it lets you copy and publish the
                file; it says nothing about what is depicted.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Licence scope</dt>
              <dd className="text-[var(--muted-foreground)]">
                Even with a licence you are limited to the uses, media, territories and periods it
                names. Merchandise and AI training are almost always outside the default grant.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Personality and privacy</dt>
              <dd className="text-[var(--muted-foreground)]">
                A recognisable person controls commercial use of their likeness regardless of who owns
                the photograph.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Trademark</dt>
              <dd className="text-[var(--muted-foreground)]">
                A visible logo is governed by trademark law, which is concerned with implied
                endorsement rather than with copying.
              </dd>
            </div>
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — this is general guidance, not legal advice, and it does not create a
        lawyer-client relationship. Rules differ substantially between countries and the exact wording
        of your licence governs. For anything commercially significant, take advice from a qualified
        lawyer in the relevant jurisdiction.
      </p>
    </main>
  );
}
