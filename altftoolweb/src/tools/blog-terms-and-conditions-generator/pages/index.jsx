"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";

import {
  CLAUSES,
  CONTENT_LICENCES,
  PRACTICES,
  buildBlogTerms,
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

const DEFAULT_PRACTICES = ["comments", "us", "eu", "affiliate", "ai-training"];
const DEFAULT_INCLUDED = requiredClauses(DEFAULT_PRACTICES).map((clause) => clause.id);

const DEFAULTS = {
  siteName: "Northwind Notes",
  ownerName: "Northwind Labs Ltd",
  contactEmail: "hello@northwind.example",
  jurisdiction: "England and Wales",
  licenceId: "all-rights",
  moderationMethod: "a person, with an automatic spam filter running first",
  dmcaAgent: "dmca@northwind.example",
  grievanceOfficer: "A. Rao",
  effectiveDate: "2026-03-01",
  publicationDate: "2026-01-15",
  counterNoticeDate: "2026-03-05",
  complaintDate: "2026-03-05",
};

export default function ToolHome() {
  const [siteName, setSiteName] = useState(DEFAULTS.siteName);
  const [ownerName, setOwnerName] = useState(DEFAULTS.ownerName);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [jurisdiction, setJurisdiction] = useState(DEFAULTS.jurisdiction);
  const [licenceId, setLicenceId] = useState(DEFAULTS.licenceId);
  const [moderationMethod, setModerationMethod] = useState(DEFAULTS.moderationMethod);
  const [dmcaAgent, setDmcaAgent] = useState(DEFAULTS.dmcaAgent);
  const [grievanceOfficer, setGrievanceOfficer] = useState(DEFAULTS.grievanceOfficer);
  const [aiTrainingAllowed, setAiTrainingAllowed] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [publicationDate, setPublicationDate] = useState(DEFAULTS.publicationDate);
  const [counterNoticeDate, setCounterNoticeDate] = useState(DEFAULTS.counterNoticeDate);
  const [complaintDate, setComplaintDate] = useState(DEFAULTS.complaintDate);
  const [practices, setPractices] = useState(DEFAULT_PRACTICES);
  const [includedIds, setIncludedIds] = useState(DEFAULT_INCLUDED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildBlogTerms({
        siteName,
        ownerName,
        contactEmail,
        jurisdiction,
        licenceId,
        moderationMethod,
        dmcaAgent,
        grievanceOfficer,
        aiTrainingAllowed,
        effectiveDate,
        publicationDate,
        counterNoticeDate,
        complaintDate,
        practices,
        includedIds,
      }),
    [
      siteName,
      ownerName,
      contactEmail,
      jurisdiction,
      licenceId,
      moderationMethod,
      dmcaAgent,
      grievanceOfficer,
      aiTrainingAllowed,
      effectiveDate,
      publicationDate,
      counterNoticeDate,
      complaintDate,
      practices,
      includedIds,
    ],
  );

  const hasError = Boolean(result.error);
  const requiredIds = useMemo(
    () => new Set(requiredClauses(practices).map((clause) => clause.id)),
    [practices],
  );

  const togglePractice = (id) => {
    const next = practices.includes(id)
      ? practices.filter((item) => item !== id)
      : [...practices, id];
    const nextRequired = requiredClauses(next).map((clause) => clause.id);
    setPractices(next);
    setIncludedIds([...new Set([...includedIds, ...nextRequired])]);
  };

  const toggleClause = (id) => {
    setIncludedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyTerms = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.terms);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSiteName(DEFAULTS.siteName);
    setOwnerName(DEFAULTS.ownerName);
    setContactEmail(DEFAULTS.contactEmail);
    setJurisdiction(DEFAULTS.jurisdiction);
    setLicenceId(DEFAULTS.licenceId);
    setModerationMethod(DEFAULTS.moderationMethod);
    setDmcaAgent(DEFAULTS.dmcaAgent);
    setGrievanceOfficer(DEFAULTS.grievanceOfficer);
    setAiTrainingAllowed(false);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setPublicationDate(DEFAULTS.publicationDate);
    setCounterNoticeDate(DEFAULTS.counterNoticeDate);
    setComplaintDate(DEFAULTS.complaintDate);
    setPractices(DEFAULT_PRACTICES);
    setIncludedIds(DEFAULT_INCLUDED);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Terms generators
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Blog Terms and Conditions Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sets out what readers may do with your writing and how comments are moderated, and works
          out the procedural deadlines the liability shields depend on — the DMCA restoration window,
          the statutory damages cut-off and the Indian grievance timelines.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The site</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-site">
              Site name
            </label>
            <input
              id="bt-site"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-owner">
              Run by
            </label>
            <input
              id="bt-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-contact">
              Contact for reports and appeals
            </label>
            <input
              id="bt-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-law">
              Governing law
            </label>
            <input
              id="bt-law"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bt-licence">
              Licence on your own posts
            </label>
            <select
              id="bt-licence"
              className={`mt-2 ${INPUT_CLASS}`}
              value={licenceId}
              onChange={(event) => setLicenceId(event.target.value)}
            >
              {CONTENT_LICENCES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bt-moderation">
              How comments are moderated
            </label>
            <input
              id="bt-moderation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={moderationMethod}
              onChange={(event) => setModerationMethod(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-dmca">
              Designated DMCA agent contact
            </label>
            <input
              id="bt-dmca"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={dmcaAgent}
              onChange={(event) => setDmcaAgent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-grievance">
              Grievance officer (India)
            </label>
            <input
              id="bt-grievance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={grievanceOfficer}
              onChange={(event) => setGrievanceOfficer(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="bt-ai"
        >
          <input
            id="bt-ai"
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={aiTrainingAllowed}
            onChange={(event) => setAiTrainingAllowed(event.target.checked)}
          />
          Allow text and data mining, including AI training, on the same terms as the licence
        </label>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>What the site does</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Ticking a box adds the clauses it makes necessary.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {PRACTICES.map((practice) => (
              <label
                key={practice.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`bt-practice-${practice.id}`}
              >
                <input
                  id={`bt-practice-${practice.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={practices.includes(practice.id)}
                  onChange={() => togglePractice(practice.id)}
                />
                {practice.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Dates used in the worked examples</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-effective">
              Terms last updated
            </label>
            <input
              id="bt-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-publication">
              First publication of the post
            </label>
            <input
              id="bt-publication"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={publicationDate}
              onChange={(event) => setPublicationDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-counter">
              Counter-notice received
            </label>
            <input
              id="bt-counter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={counterNoticeDate}
              onChange={(event) => setCounterNoticeDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bt-complaint">
              Grievance complaint received
            </label>
            <input
              id="bt-complaint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={complaintDate}
              onChange={(event) => setComplaintDate(event.target.value)}
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
              {hasError
                ? DASH
                : `${result.included.length} of ${CLAUSES.length} clauses · ${result.wordCount} words`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyTerms}
              disabled={hasError}
              aria-label="Copy the assembled terms and conditions"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy terms"}
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
          {[
            [
              "Statutory damages window closes",
              hasError ? DASH : result.deadlines.statutoryDeadlineLong,
            ],
            [
              "Restore removed material between",
              hasError
                ? DASH
                : `${result.deadlines.restoreEarliestLong} and ${result.deadlines.restoreLatestLong}`,
            ],
            ["Acknowledge a grievance by", hasError ? DASH : result.deadlines.ackByLong],
            ["Act on a court order by", hasError ? DASH : result.deadlines.courtOrderByLong],
            ["Dispose of the grievance by", hasError ? DASH : result.deadlines.resolveByLong],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.missing.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {result.missing.map((gap) => (
              <li
                key={gap.id}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
              >
                <span className="font-semibold">{gap.title}</span> — {gap.why}
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Terms</h3>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
            {hasError ? DASH : result.terms}
          </div>
        </div>
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
                htmlFor={`bt-clause-${clause.id}`}
              >
                <input
                  id={`bt-clause-${clause.id}`}
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
                        Required
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
        Informational template, not legal advice. The clauses reference 17 U.S.C. sections 106, 411,
        412 and 512, 47 U.S.C. section 230, Articles 14, 16 and 17 of the EU Digital Services Act
        (Regulation (EU) 2022/2065), Article 4(3) of Directive 2019/790, section 79 of India&rsquo;s
        Information Technology Act 2000 with the Intermediary Guidelines Rules 2021, the FTC
        Endorsement Guides at 16 CFR Part 255 and the UK Consumer Rights Act 2015. Business-day
        deadlines ignore public holidays, so treat them as the earliest date.
      </p>
    </main>
  );
}
