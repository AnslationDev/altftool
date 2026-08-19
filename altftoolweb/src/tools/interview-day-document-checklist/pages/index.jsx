"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck, Info, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  INTERVIEW_TYPES,
  buildInterviewDocuments,
  computeCopyPlan,
  computeDocumentReadiness,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]";

const PROFILE_OPTIONS = [
  { key: "inGovtService", label: "Already in government service" },
  { key: "pwbd", label: "Applied under the PwBD category" },
  { key: "exServiceman", label: "Ex-serviceman" },
  { key: "nameChanged", label: "My name differs from the Class 10 certificate" },
  { key: "gapYears", label: "There is a gap between two qualifications" },
  { key: "experience", label: "Work experience is being claimed" },
];

const DEFAULT_PROFILE = {
  inGovtService: false,
  pwbd: false,
  exServiceman: false,
  nameChanged: false,
  gapYears: false,
  experience: false,
};

const DEFAULT_TYPE = "upsc";

export default function ToolHome() {
  const [typeId, setTypeId] = useState(DEFAULT_TYPE);
  const [categoryId, setCategoryId] = useState("obc");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [sets, setSets] = useState("2");
  const [costPerPage, setCostPerPage] = useState("2");
  const [photographs, setPhotographs] = useState("6");
  const [selfAttested, setSelfAttested] = useState(true);
  const [readyIds, setReadyIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const build = useMemo(
    () => buildInterviewDocuments({ typeId, categoryId, profile }),
    [typeId, categoryId, profile],
  );

  const buildError = Boolean(build.error);
  const documents = buildError ? [] : build.documents;

  const plan = useMemo(
    () =>
      computeCopyPlan({
        documents,
        sets: sets === "" ? 0 : Number(sets),
        costPerPage: costPerPage === "" ? 0 : Number(costPerPage),
        photographs: photographs === "" ? 0 : Number(photographs),
        selfAttested,
      }),
    [documents, sets, costPerPage, photographs, selfAttested],
  );

  const planError = Boolean(plan.error);
  const hasError = buildError || planError;
  const errorMessage = build.error || plan.error || "";

  const readiness = useMemo(() => computeDocumentReadiness(documents, readyIds), [documents, readyIds]);

  const chooseType = (nextId) => {
    setTypeId(nextId);
    const next = INTERVIEW_TYPES.find((entry) => entry.id === nextId);
    if (next) {
      setSets(String(next.defaultSets));
      setPhotographs(String(next.defaultPhotos));
    }
  };

  const toggleProfile = (key) => setProfile((current) => ({ ...current, [key]: !current[key] }));
  const toggleReady = (id) =>
    setReadyIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Interview Day Document Checklist",
      `${build.type.label} — ${build.category.label}`,
      `${plan.pagesPerSet} pages per set × ${plan.sets} sets = ${plan.totalPages} photocopies`,
      `Photocopy cost about ${plan.cost} rupees; carry ${plan.photographsToCarry} photographs`,
      "",
      "Documents:",
      ...documents.map((doc) => `[${readyIds.includes(doc.id) ? "x" : " "}] ${doc.label}`),
      "",
      plan.attestationNote,
    ];
    return lines.join("\n");
  }, [hasError, build, plan, documents, readyIds]);

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
    chooseType(DEFAULT_TYPE);
    setCategoryId("obc");
    setProfile(DEFAULT_PROFILE);
    setCostPerPage("2");
    setSelfAttested(true);
    setReadyIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCheck className="h-4 w-4" aria-hidden="true" />
          Interview day
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Interview Day Document Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Not just the list — the arithmetic behind it. How many pages a set runs to, how many
          signatures self-attestation actually means, and which certificates have to be in the central
          format rather than your state&apos;s.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="idc-type">
              Interview or verification
            </label>
            <select
              id="idc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={typeId}
              onChange={(event) => chooseType(event.target.value)}
            >
              {INTERVIEW_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idc-category">
              Category applied under
            </label>
            <select
              id="idc-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {CATEGORIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idc-sets">
              Photocopy sets the call letter asks for
            </label>
            <input
              id="idc-sets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idc-rate">
              Photocopy rate per page (INR)
            </label>
            <input
              id="idc-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={costPerPage}
              onChange={(event) => setCostPerPage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idc-photos">
              Photographs the call letter asks for
            </label>
            <input
              id="idc-photos"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={photographs}
              onChange={(event) => setPhotographs(event.target.value)}
            />
          </div>
          <label className={`${CHECK_ROW} self-end`} htmlFor="idc-attest">
            <input
              id="idc-attest"
              type="checkbox"
              className={CHECKBOX}
              checked={selfAttested}
              onChange={(event) => setSelfAttested(event.target.checked)}
            />
            <span className="text-sm">Self-attestation is accepted</span>
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Which of these apply?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PROFILE_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`idc-p-${option.key}`}>
                <input
                  id={`idc-p-${option.key}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={profile[option.key]}
                  onChange={() => toggleProfile(option.key)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Photocopies to make
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : plan.totalPages}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : `${plan.pagesPerSet} pages a set, ${plan.sets} ${plan.sets === 1 ? "set" : "sets"}, about ${money(plan.cost)} at the shop.`}
            </p>
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {hasError
                ? errorMessage
                : `${plan.totalPages} photocopies to make, about ${money(plan.cost)}, ${readiness.percent} percent of documents ready.`}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the interview document checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Documents on the list", hasError ? DASH : String(plan.documentCount)],
            ["Originals to carry", hasError ? DASH : String(plan.originals)],
            ["Pages in one set", hasError ? DASH : String(plan.pagesPerSet)],
            ["Photocopy cost", hasError ? DASH : money(plan.cost)],
            [
              "Signatures needed",
              hasError ? DASH : plan.selfAttested ? `${plan.signatures} (about ${plan.signingMinutes} min)` : "Gazetted attestation",
            ],
            ["Photographs to carry", hasError ? DASH : String(plan.photographsToCarry)],
            ["Documents ready", hasError ? DASH : `${readiness.ready} of ${readiness.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div className="mt-4">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${readiness.percent} percent of the documents are ready`}
              >
                <span
                  className={`block h-full ${readiness.complete ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                  style={{ width: `${readiness.percent}%` }}
                />
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <span>{plan.attestationNote}</span>
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{build.type.note}</p>
          </>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The folder, document by document</h2>
          <ul className="mt-3 grid gap-3">
            {documents.map((doc) => (
              <li key={doc.id}>
                <label className={CHECK_ROW} htmlFor={`idc-d-${doc.id}`}>
                  <input
                    id={`idc-d-${doc.id}`}
                    type="checkbox"
                    className={CHECKBOX}
                    checked={readyIds.includes(doc.id)}
                    onChange={() => toggleReady(doc.id)}
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold">{doc.label}</span>
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        {doc.original ? "original" : "copy only"}
                        {doc.copy && doc.pages > 0 ? ` · ${doc.pages} pg` : ""}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The number of sets, the photograph count, the
        certificate formats and their validity dates are fixed by the notice and the call letter for
        your own recruitment, and differ between central and state posts — read those before
        photocopying anything.
      </p>
    </main>
  );
}
