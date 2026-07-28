"use client";

import { useMemo, useState } from "react";
import { Bug, Check, Copy, RotateCcw } from "lucide-react";

import {
  CLAUSES,
  DEFAULT_DELETION_DAYS,
  DEFAULT_DISCLOSURE_DAYS,
  DEFAULT_TAIL_MONTHS,
  PROFILE_TAGS,
  buildBetaNda,
  requiredClauses,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULT_PROFILE = ["us", "eu", "telemetry", "security"];
const DEFAULT_INCLUDED = requiredClauses(DEFAULT_PROFILE).map((clause) => clause.id);

const DEFAULTS = {
  companyName: "Northwind Labs",
  programName: "Kestrel 2.0",
  contactChannel: "beta@northwind.example",
  jurisdiction: "Delaware",
  startDate: "2026-04-01",
  endDate: "2026-07-15",
  tailMonths: DEFAULT_TAIL_MONTHS,
  disclosureDays: DEFAULT_DISCLOSURE_DAYS,
  deletionDays: DEFAULT_DELETION_DAYS,
};

export default function ToolHome() {
  const [companyName, setCompanyName] = useState(DEFAULTS.companyName);
  const [programName, setProgramName] = useState(DEFAULTS.programName);
  const [contactChannel, setContactChannel] = useState(DEFAULTS.contactChannel);
  const [jurisdiction, setJurisdiction] = useState(DEFAULTS.jurisdiction);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);
  const [tailMonths, setTailMonths] = useState(String(DEFAULTS.tailMonths));
  const [disclosureDays, setDisclosureDays] = useState(String(DEFAULTS.disclosureDays));
  const [deletionDays, setDeletionDays] = useState(String(DEFAULTS.deletionDays));
  const [profileTags, setProfileTags] = useState(DEFAULT_PROFILE);
  const [includedIds, setIncludedIds] = useState(DEFAULT_INCLUDED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildBetaNda({
        companyName,
        programName,
        contactChannel,
        jurisdiction,
        startDate,
        endDate,
        tailMonths: Number(tailMonths),
        disclosureDays: Number(disclosureDays),
        deletionDays: Number(deletionDays),
        profileTags,
        includedIds,
      }),
    [
      companyName,
      programName,
      contactChannel,
      jurisdiction,
      startDate,
      endDate,
      tailMonths,
      disclosureDays,
      deletionDays,
      profileTags,
      includedIds,
    ],
  );

  const hasError = Boolean(result.error);
  const requiredIds = useMemo(
    () => new Set(requiredClauses(profileTags).map((clause) => clause.id)),
    [profileTags],
  );

  const toggleProfile = (id) => {
    const nextProfile = profileTags.includes(id)
      ? profileTags.filter((tag) => tag !== id)
      : [...profileTags, id];
    const nextRequired = requiredClauses(nextProfile).map((clause) => clause.id);
    setProfileTags(nextProfile);
    setIncludedIds([...new Set([...includedIds, ...nextRequired])]);
  };

  const toggleClause = (id) => {
    setIncludedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyAgreement = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.agreement);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCompanyName(DEFAULTS.companyName);
    setProgramName(DEFAULTS.programName);
    setContactChannel(DEFAULTS.contactChannel);
    setJurisdiction(DEFAULTS.jurisdiction);
    setStartDate(DEFAULTS.startDate);
    setEndDate(DEFAULTS.endDate);
    setTailMonths(String(DEFAULTS.tailMonths));
    setDisclosureDays(String(DEFAULTS.disclosureDays));
    setDeletionDays(String(DEFAULTS.deletionDays));
    setProfileTags(DEFAULT_PROFILE);
    setIncludedIds(DEFAULT_INCLUDED);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Bug className="h-4 w-4" aria-hidden="true" />
          Beta programmes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Beta Tester NDA Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Assembles a pre-release testing agreement that settles screenshots, feedback ownership,
          crash telemetry and a good-faith security research safe harbour — then flags the gaps that
          would make the document unenforceable or incomplete.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-company">
              Company running the beta
            </label>
            <input
              id="beta-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-program">
              Programme or build name
            </label>
            <input
              id="beta-program"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={programName}
              onChange={(event) => setProgramName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-channel">
              Where bugs and questions go
            </label>
            <input
              id="beta-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contactChannel}
              onChange={(event) => setContactChannel(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-law">
              Governing law (state or country)
            </label>
            <input
              id="beta-law"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-start">
              Programme starts
            </label>
            <input
              id="beta-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-end">
              Programme ends
            </label>
            <input
              id="beta-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-tail">
              Confidentiality tail (months after end)
            </label>
            <input
              id="beta-tail"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={tailMonths}
              onChange={(event) => setTailMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-disclosure">
              Vulnerability disclosure window (days)
            </label>
            <input
              id="beta-disclosure"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="365"
              step="1"
              inputMode="numeric"
              value={disclosureDays}
              onChange={(event) => setDisclosureDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="beta-deletion">
              Uninstall and delete within (days)
            </label>
            <input
              id="beta-deletion"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="180"
              step="1"
              inputMode="numeric"
              value={deletionDays}
              onChange={(event) => setDeletionDays(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Programme profile</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Ticking a box adds the clauses it makes necessary.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {PROFILE_TAGS.map((tag) => (
              <label
                key={tag.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`beta-profile-${tag.id}`}
              >
                <input
                  id={`beta-profile-${tag.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={profileTags.includes(tag.id)}
                  onChange={() => toggleProfile(tag.id)}
                />
                {tag.label}
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
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Required coverage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.coveragePercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.betaDays}-day programme · ${result.wordCount} words`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyAgreement}
              disabled={hasError}
              aria-label="Copy the assembled beta NDA"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy NDA"}
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

        <dl className="mt-5 space-y-4 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[var(--muted-foreground)]">Confidentiality runs to</dt>
              <dd className="mt-1 font-semibold">{hasError ? DASH : result.tailEndLong}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--muted-foreground)]">Clauses included</dt>
              <dd className="mt-1 font-semibold">
                {hasError ? DASH : `${result.included.length} of ${CLAUSES.length}`}
              </dd>
            </div>
          </div>

          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Required clauses missing</dt>
            <dd className="mt-1">
              {hasError ? (
                DASH
              ) : result.missing.length === 0 ? (
                <span className="text-[var(--success)]">
                  None — every clause this programme requires is included.
                </span>
              ) : (
                <ul className="space-y-2">
                  {result.missing.map((gap) => (
                    <li
                      key={gap.id}
                      className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
                    >
                      <span className="font-semibold">{gap.title}</span> — {gap.why}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>

          {!hasError && result.warnings.length > 0 ? (
            <div>
              <dt className="font-semibold text-[var(--muted-foreground)]">Enforceability flags</dt>
              <dd className="mt-1">
                <ul className="space-y-2">
                  {result.warnings.map((warning) => (
                    <li
                      key={warning}
                      className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
                    >
                      {warning}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}

          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Agreement</dt>
            <dd className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6 whitespace-pre-wrap">
              {hasError ? DASH : result.agreement}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Clauses</h2>
        <ul className="mt-4 space-y-3">
          {CLAUSES.map((clause) => (
            <li
              key={clause.id}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <label
                className="flex min-h-11 cursor-pointer items-start gap-3"
                htmlFor={`beta-clause-${clause.id}`}
              >
                <input
                  id={`beta-clause-${clause.id}`}
                  type="checkbox"
                  className={`mt-0.5 ${CHECKBOX_CLASS}`}
                  checked={includedIds.includes(clause.id)}
                  onChange={() => toggleClause(clause.id)}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{clause.title}</span>
                    {requiredIds.has(clause.id) ? (
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                        Required for this programme
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {clause.body.slice(0, 150)}
                    {clause.body.length > 150 ? "…" : ""}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. The clauses reference the Computer Fraud and Abuse
        Act at 18 U.S.C. section 1030, the Defend Trade Secrets Act at 18 U.S.C. section 1833(b),
        ISO/IEC 29147 and 30111 on vulnerability disclosure, GDPR Articles 6 and 13, India&rsquo;s
        Digital Personal Data Protection Act 2023, the COPPA Rule at 16 CFR Part 312 and the Export
        Administration Regulations at 15 CFR Parts 730-774. Have counsel review before you run a
        programme on it.
      </p>
    </main>
  );
}
