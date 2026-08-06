"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw } from "lucide-react";

import {
  CLAUSES,
  DEFAULT_REVIEW_MONTHS,
  PROFILE_TAGS,
  buildSocialMediaPolicy,
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

const DEFAULT_PROFILE = ["us", "advocacy"];
const DEFAULT_INCLUDED = requiredClauses(DEFAULT_PROFILE).map((clause) => clause.id);

const DEFAULTS = {
  companyName: "Northwind Labs",
  spokesperson: "the Communications team",
  effectiveDate: "2026-02-01",
  reviewMonths: DEFAULT_REVIEW_MONTHS,
};

export default function ToolHome() {
  const [companyName, setCompanyName] = useState(DEFAULTS.companyName);
  const [spokesperson, setSpokesperson] = useState(DEFAULTS.spokesperson);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [reviewMonths, setReviewMonths] = useState(String(DEFAULTS.reviewMonths));
  const [profileTags, setProfileTags] = useState(DEFAULT_PROFILE);
  const [includedIds, setIncludedIds] = useState(DEFAULT_INCLUDED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSocialMediaPolicy({
        companyName,
        spokesperson,
        effectiveDate,
        reviewMonths: Number(reviewMonths),
        profileTags,
        includedIds,
      }),
    [companyName, spokesperson, effectiveDate, reviewMonths, profileTags, includedIds],
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
    const merged = [...new Set([...includedIds, ...nextRequired])];
    setProfileTags(nextProfile);
    setIncludedIds(merged);
  };

  const toggleClause = (id) => {
    setIncludedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyPolicy = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.policy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset the company name, escalation owner, effective date and your clause selections back to the demo example values? This cannot be undone.",
      )
    ) {
      return;
    }
    setCompanyName(DEFAULTS.companyName);
    setSpokesperson(DEFAULTS.spokesperson);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setReviewMonths(String(DEFAULTS.reviewMonths));
    setProfileTags(DEFAULT_PROFILE);
    setIncludedIds(DEFAULT_INCLUDED);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          AI and Tech Policy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Company Social Media Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Assembles an employee social media policy from clauses tied to real rules — FTC disclosure
          of employment, confidentiality, data protection, and a savings clause so the policy does
          not overreach into protected speech — then scores what your profile still leaves uncovered.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-company">
              Company name
            </label>
            <input
              id="sp-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-owner">
              Who owns escalations (team or role)
            </label>
            <input
              id="sp-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={spokesperson}
              onChange={(event) => setSpokesperson(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-date">
              Effective date
            </label>
            <input
              id="sp-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-review">
              Review every (months)
            </label>
            <input
              id="sp-review"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="60"
              step="1"
              inputMode="numeric"
              value={reviewMonths}
              onChange={(event) => setReviewMonths(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Company profile</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Ticking a box adds the clauses it makes necessary.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {PROFILE_TAGS.map((tag) => (
              <label
                key={tag.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`sp-profile-${tag.id}`}
              >
                <input
                  id={`sp-profile-${tag.id}`}
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
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Required coverage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.coveragePercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.wordCount} words · next review ${result.reviewByLong}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPolicy}
              disabled={hasError}
              aria-label="Copy the assembled policy"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy policy"}
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

        <dl className="mt-5 space-y-4 text-sm" aria-live="polite" role="status">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Required clauses missing</dt>
            <dd className="mt-1">
              {hasError ? (
                DASH
              ) : result.missing.length === 0 ? (
                <span className="text-[var(--success-text)]">
                  None — every clause your profile requires is included.
                </span>
              ) : (
                <ul className="space-y-2">
                  {result.missing.map((gap) => (
                    <li
                      key={gap.id}
                      className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning-text)]"
                    >
                      <span className="font-semibold">{gap.title}</span> — {gap.why}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Policy</dt>
            <dd className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6 whitespace-pre-wrap">
              {hasError ? DASH : result.policy}
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
                htmlFor={`sp-clause-${clause.id}`}
              >
                <input
                  id={`sp-clause-${clause.id}`}
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
                        Required for your profile
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
        Informational template, not legal advice. The clauses reference Section 7 of the National
        Labor Relations Act and the NLRB&rsquo;s Stericycle standard for work rules, the FTC
        Endorsement Guides at 16 CFR Part 255, Regulation FD, the GDPR, India&rsquo;s Digital
        Personal Data Protection Act 2023 and the Information Technology Act 2000. A policy relied on
        in a disciplinary process should be reviewed by employment counsel in every jurisdiction
        where you employ people.
      </p>
    </main>
  );
}
