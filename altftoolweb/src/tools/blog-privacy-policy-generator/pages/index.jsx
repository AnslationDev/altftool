"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import {
  DEFAULT_ANALYTICS_MONTHS,
  PRACTICES,
  SECTIONS,
  buildBlogPrivacyPolicy,
  requiredSections,
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

const DEFAULT_PRACTICES = [
  "server-logs",
  "analytics-cookieless",
  "comments",
  "newsletter",
  "contact-form",
  "eu",
  "california",
];
const DEFAULT_INCLUDED = requiredSections(DEFAULT_PRACTICES).map((section) => section.id);

const DEFAULTS = {
  siteName: "Northwind Notes",
  ownerName: "Northwind Labs Ltd",
  contactEmail: "privacy@northwind.example",
  newsletterName: "the Northwind Notes weekly",
  processors: "our web host, our email provider and our analytics provider",
  effectiveDate: "2026-03-01",
  reviewMonths: 12,
  logMonths: 12,
  analyticsMonths: DEFAULT_ANALYTICS_MONTHS,
  commentMonths: 60,
  contactMonths: 24,
  suppressionMonths: 36,
  annualRevenueUsd: 0,
  consumersPerYear: 0,
  revenueShareFromSellingPercent: 0,
};

export default function ToolHome() {
  const [siteName, setSiteName] = useState(DEFAULTS.siteName);
  const [ownerName, setOwnerName] = useState(DEFAULTS.ownerName);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [newsletterName, setNewsletterName] = useState(DEFAULTS.newsletterName);
  const [processors, setProcessors] = useState(DEFAULTS.processors);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [reviewMonths, setReviewMonths] = useState(String(DEFAULTS.reviewMonths));
  const [logMonths, setLogMonths] = useState(String(DEFAULTS.logMonths));
  const [analyticsMonths, setAnalyticsMonths] = useState(String(DEFAULTS.analyticsMonths));
  const [commentMonths, setCommentMonths] = useState(String(DEFAULTS.commentMonths));
  const [contactMonths, setContactMonths] = useState(String(DEFAULTS.contactMonths));
  const [suppressionMonths, setSuppressionMonths] = useState(String(DEFAULTS.suppressionMonths));
  const [emailTracking, setEmailTracking] = useState(false);
  const [annualRevenueUsd, setAnnualRevenueUsd] = useState(String(DEFAULTS.annualRevenueUsd));
  const [consumersPerYear, setConsumersPerYear] = useState(String(DEFAULTS.consumersPerYear));
  const [revenueShare, setRevenueShare] = useState(String(DEFAULTS.revenueShareFromSellingPercent));
  const [practices, setPractices] = useState(DEFAULT_PRACTICES);
  const [includedIds, setIncludedIds] = useState(DEFAULT_INCLUDED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildBlogPrivacyPolicy({
        siteName,
        ownerName,
        contactEmail,
        newsletterName,
        processors,
        effectiveDate,
        reviewMonths: Number(reviewMonths),
        logMonths: Number(logMonths),
        analyticsMonths: Number(analyticsMonths),
        commentMonths: Number(commentMonths),
        contactMonths: Number(contactMonths),
        suppressionMonths: Number(suppressionMonths),
        emailTracking,
        annualRevenueUsd: Number(annualRevenueUsd),
        consumersPerYear: Number(consumersPerYear),
        revenueShareFromSellingPercent: Number(revenueShare),
        practices,
        includedIds,
      }),
    [
      siteName,
      ownerName,
      contactEmail,
      newsletterName,
      processors,
      effectiveDate,
      reviewMonths,
      logMonths,
      analyticsMonths,
      commentMonths,
      contactMonths,
      suppressionMonths,
      emailTracking,
      annualRevenueUsd,
      consumersPerYear,
      revenueShare,
      practices,
      includedIds,
    ],
  );

  const hasError = Boolean(result.error);
  const requiredIds = useMemo(
    () => new Set(requiredSections(practices).map((section) => section.id)),
    [practices],
  );

  const togglePractice = (id) => {
    const next = practices.includes(id)
      ? practices.filter((item) => item !== id)
      : [...practices, id];
    const nextRequired = requiredSections(next).map((section) => section.id);
    setPractices(next);
    setIncludedIds([...new Set([...includedIds, ...nextRequired])]);
  };

  const toggleSection = (id) => {
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
    setSiteName(DEFAULTS.siteName);
    setOwnerName(DEFAULTS.ownerName);
    setContactEmail(DEFAULTS.contactEmail);
    setNewsletterName(DEFAULTS.newsletterName);
    setProcessors(DEFAULTS.processors);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setReviewMonths(String(DEFAULTS.reviewMonths));
    setLogMonths(String(DEFAULTS.logMonths));
    setAnalyticsMonths(String(DEFAULTS.analyticsMonths));
    setCommentMonths(String(DEFAULTS.commentMonths));
    setContactMonths(String(DEFAULTS.contactMonths));
    setSuppressionMonths(String(DEFAULTS.suppressionMonths));
    setEmailTracking(false);
    setAnnualRevenueUsd(String(DEFAULTS.annualRevenueUsd));
    setConsumersPerYear(String(DEFAULTS.consumersPerYear));
    setRevenueShare(String(DEFAULTS.revenueShareFromSellingPercent));
    setPractices(DEFAULT_PRACTICES);
    setIncludedIds(DEFAULT_INCLUDED);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Policy generators
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Blog Privacy Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describes what your blog actually does — server logs, analytics, comments, a mailing list —
          then writes a policy with a lawful basis for each purpose, works out whether you need a
          cookie banner under the ePrivacy rule, and tests you against the three CCPA thresholds.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The blog</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-site">
              Blog name
            </label>
            <input
              id="bp-site"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-owner">
              Who runs it
            </label>
            <input
              id="bp-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-contact">
              Contact for privacy requests
            </label>
            <input
              id="bp-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-newsletter">
              Newsletter name
            </label>
            <input
              id="bp-newsletter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={newsletterName}
              onChange={(event) => setNewsletterName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bp-processors">
              Service providers you name in the policy
            </label>
            <input
              id="bp-processors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={processors}
              onChange={(event) => setProcessors(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-effective">
              Last updated
            </label>
            <input
              id="bp-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-review">
              Review every (months)
            </label>
            <input
              id="bp-review"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={reviewMonths}
              onChange={(event) => setReviewMonths(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>What the blog does</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Ticking a box adds the sections it makes necessary.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {PRACTICES.map((practice) => (
              <label
                key={practice.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`bp-practice-${practice.id}`}
              >
                <input
                  id={`bp-practice-${practice.id}`}
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

        {practices.includes("newsletter") ? (
          <label
            className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="bp-tracking"
          >
            <input
              id="bp-tracking"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={emailTracking}
              onChange={(event) => setEmailTracking(event.target.checked)}
            />
            Newsletter uses open and click tracking
          </label>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Retention periods (months)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-logs">
              Server logs
            </label>
            <input
              id="bp-logs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={logMonths}
              onChange={(event) => setLogMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-analytics">
              Analytics
            </label>
            <input
              id="bp-analytics"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={analyticsMonths}
              onChange={(event) => setAnalyticsMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-comments">
              Comments
            </label>
            <input
              id="bp-comments"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={commentMonths}
              onChange={(event) => setCommentMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-contactret">
              Contact form messages
            </label>
            <input
              id="bp-contactret"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={contactMonths}
              onChange={(event) => setContactMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-suppression">
              Suppression list after unsubscribe
            </label>
            <input
              id="bp-suppression"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={suppressionMonths}
              onChange={(event) => setSuppressionMonths(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">CCPA threshold check</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          The Act applies if you meet any one of these. Most independent blogs meet none.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-revenue">
              Annual gross revenue (USD)
            </label>
            <input
              id="bp-revenue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="1000"
              inputMode="decimal"
              value={annualRevenueUsd}
              onChange={(event) => setAnnualRevenueUsd(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-consumers">
              Consumers or households whose data you buy, sell or share per year
            </label>
            <input
              id="bp-consumers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              value={consumersPerYear}
              onChange={(event) => setConsumersPerYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-share">
              Share of revenue from selling or sharing data (%)
            </label>
            <input
              id="bp-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max="100"
              step="1"
              inputMode="decimal"
              value={revenueShare}
              onChange={(event) => setRevenueShare(event.target.value)}
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
              Policy completeness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.completenessPercent}%`}
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
              aria-label="Copy the assembled privacy policy"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Cookie consent banner needed</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.consent.required ? "Yes" : "No"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">CCPA applies to you</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.ccpa.applies ? "Yes" : "No"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Sections included</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.included.length} of ${SECTIONS.length}`}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.consent.why}
          </p>
        ) : null}

        {!hasError && result.missing.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
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
          <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Policy</h3>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
            {hasError ? DASH : result.policy}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Sections</h2>
        <ul className="mt-4 space-y-3">
          {SECTIONS.map((section) => (
            <li
              key={section.id}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <label
                className="flex min-h-11 cursor-pointer items-start gap-3"
                htmlFor={`bp-section-${section.id}`}
              >
                <input
                  id={`bp-section-${section.id}`}
                  type="checkbox"
                  className={`mt-0.5 ${CHECKBOX_CLASS}`}
                  checked={includedIds.includes(section.id)}
                  onChange={() => toggleSection(section.id)}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{section.title}</span>
                    {requiredIds.has(section.id) ? (
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                        Required
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {section.body.slice(0, 150)}
                    {section.body.length > 150 ? "…" : ""}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. The sections reference GDPR Articles 6, 7, 8, 13,
        15 to 22, 28, 33 and Chapter V, Article 5(3) of the ePrivacy Directive 2002/58/EC, the
        California Consumer Privacy Act at Cal. Civ. Code section 1798.100 and following, the CAN-SPAM
        Act at 15 U.S.C. section 7701, the COPPA Rule at 16 CFR Part 312 and India&rsquo;s Digital
        Personal Data Protection Act 2023. A policy has to match what your site really does — check
        it against your actual cookie list and ask a data protection lawyer if anything is unclear.
      </p>
    </main>
  );
}
