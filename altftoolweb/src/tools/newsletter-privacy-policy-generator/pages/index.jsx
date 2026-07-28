"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailCheck, RotateCcw } from "lucide-react";

import {
  CONSENT_TYPES,
  PRACTICES,
  SECTIONS,
  buildNewsletterPolicy,
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

const DEFAULT_PRACTICES = ["eu", "us", "canada", "pixel", "click-tracking", "segmentation"];
const DEFAULT_INCLUDED = [
  ...requiredSections(DEFAULT_PRACTICES).map((section) => section.id),
  "double-optin",
];

const DEFAULTS = {
  listName: "Northwind Weekly",
  publisher: "Northwind Labs Ltd",
  postalAddress: "12 Harbour Road, Dublin 2, Ireland",
  contactEmail: "privacy@northwind.example",
  provider: "our email service provider",
  frequency: "one issue a week, on Thursday",
  consentType: "express-double",
  signupDate: "2026-03-05",
  requestDate: "2026-03-05",
  sendDate: "2026-03-01",
  effectiveDate: "2026-03-01",
  reviewMonths: 12,
  suppressionMonths: 36,
  sunsetMonths: 12,
  unconfirmedDays: 7,
};

export default function ToolHome() {
  const [listName, setListName] = useState(DEFAULTS.listName);
  const [publisher, setPublisher] = useState(DEFAULTS.publisher);
  const [postalAddress, setPostalAddress] = useState(DEFAULTS.postalAddress);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [provider, setProvider] = useState(DEFAULTS.provider);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [consentType, setConsentType] = useState(DEFAULTS.consentType);
  const [signupDate, setSignupDate] = useState(DEFAULTS.signupDate);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [sendDate, setSendDate] = useState(DEFAULTS.sendDate);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [reviewMonths, setReviewMonths] = useState(String(DEFAULTS.reviewMonths));
  const [suppressionMonths, setSuppressionMonths] = useState(String(DEFAULTS.suppressionMonths));
  const [sunsetMonths, setSunsetMonths] = useState(String(DEFAULTS.sunsetMonths));
  const [unconfirmedDays, setUnconfirmedDays] = useState(String(DEFAULTS.unconfirmedDays));
  const [practices, setPractices] = useState(DEFAULT_PRACTICES);
  const [includedIds, setIncludedIds] = useState(DEFAULT_INCLUDED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildNewsletterPolicy({
        listName,
        publisher,
        postalAddress,
        contactEmail,
        provider,
        frequency,
        consentType,
        signupDate,
        requestDate,
        sendDate,
        effectiveDate,
        reviewMonths: Number(reviewMonths),
        suppressionMonths: Number(suppressionMonths),
        sunsetMonths: Number(sunsetMonths),
        unconfirmedDays: Number(unconfirmedDays),
        practices,
        includedIds,
      }),
    [
      listName,
      publisher,
      postalAddress,
      contactEmail,
      provider,
      frequency,
      consentType,
      signupDate,
      requestDate,
      sendDate,
      effectiveDate,
      reviewMonths,
      suppressionMonths,
      sunsetMonths,
      unconfirmedDays,
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
    setListName(DEFAULTS.listName);
    setPublisher(DEFAULTS.publisher);
    setPostalAddress(DEFAULTS.postalAddress);
    setContactEmail(DEFAULTS.contactEmail);
    setProvider(DEFAULTS.provider);
    setFrequency(DEFAULTS.frequency);
    setConsentType(DEFAULTS.consentType);
    setSignupDate(DEFAULTS.signupDate);
    setRequestDate(DEFAULTS.requestDate);
    setSendDate(DEFAULTS.sendDate);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setReviewMonths(String(DEFAULTS.reviewMonths));
    setSuppressionMonths(String(DEFAULTS.suppressionMonths));
    setSunsetMonths(String(DEFAULTS.sunsetMonths));
    setUnconfirmedDays(String(DEFAULTS.unconfirmedDays));
    setPractices(DEFAULT_PRACTICES);
    setIncludedIds(DEFAULT_INCLUDED);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <MailCheck className="h-4 w-4" aria-hidden="true" />
          Policy generators
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Newsletter Privacy Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Writes the privacy notice a mailing list needs — how consent was obtained and proved, what
          the tracking pixel sees, and what happens after an unsubscribe — and works out the CAN-SPAM
          and CASL deadlines from your own dates.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The list</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="np-list">
              Newsletter name
            </label>
            <input
              id="np-list"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={listName}
              onChange={(event) => setListName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-publisher">
              Published by
            </label>
            <input
              id="np-publisher"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={publisher}
              onChange={(event) => setPublisher(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="np-postal">
              Physical postal address (required in every commercial email)
            </label>
            <input
              id="np-postal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={postalAddress}
              onChange={(event) => setPostalAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-contact">
              Contact for privacy requests
            </label>
            <input
              id="np-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-provider">
              Email service provider
            </label>
            <input
              id="np-provider"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-frequency">
              How often you send
            </label>
            <input
              id="np-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-consent">
              How subscribers join
            </label>
            <select
              id="np-consent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={consentType}
              onChange={(event) => setConsentType(event.target.value)}
            >
              {CONSENT_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>What the list does</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Ticking a box adds the sections it makes necessary.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {PRACTICES.map((practice) => (
              <label
                key={practice.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`np-practice-${practice.id}`}
              >
                <input
                  id={`np-practice-${practice.id}`}
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
        <h2 className="text-base font-semibold">Dates and retention</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="np-signup">
              Subscription date (for the consent clock)
            </label>
            <input
              id="np-signup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={signupDate}
              onChange={(event) => setSignupDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-request">
              Unsubscribe request received
            </label>
            <input
              id="np-request"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-send">
              Last issue sent
            </label>
            <input
              id="np-send"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={sendDate}
              onChange={(event) => setSendDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-effective">
              Policy last updated
            </label>
            <input
              id="np-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-review">
              Review every (months)
            </label>
            <input
              id="np-review"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="np-suppression">
              Suppression list kept (months)
            </label>
            <input
              id="np-suppression"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="np-sunset">
              Remove inactive subscribers after (months)
            </label>
            <input
              id="np-sunset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="120"
              step="1"
              inputMode="numeric"
              value={sunsetMonths}
              onChange={(event) => setSunsetMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-unconfirmed">
              Delete unconfirmed addresses after (days)
            </label>
            <input
              id="np-unconfirmed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="90"
              step="1"
              inputMode="numeric"
              value={unconfirmedDays}
              onChange={(event) => setUnconfirmedDays(event.target.value)}
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
              Notice completeness
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
              aria-label="Copy the assembled newsletter privacy notice"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy notice"}
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
              "Opt-out must be actioned by",
              hasError ? DASH : result.deadlines.optOutDeadlineLong,
            ],
            [
              "Unsubscribe link must work until (CASL, 60 days)",
              hasError ? DASH : result.deadlines.caslMechanismUntilLong,
            ],
            [
              "Opt-out mechanism must work until (CAN-SPAM, 30 days)",
              hasError ? DASH : result.deadlines.canSpamMechanismUntilLong,
            ],
            [
              "Implied consent expires",
              hasError
                ? DASH
                : result.deadlines.impliedExpiryLong
                  ? `${result.deadlines.impliedExpiryLong} (${result.deadlines.impliedMonths} months)`
                  : "Not applicable — consent is express",
            ],
            [
              "Sections included",
              hasError ? DASH : `${result.included.length} of ${SECTIONS.length}`,
            ],
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
          <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Notice</h3>
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
                htmlFor={`np-section-${section.id}`}
              >
                <input
                  id={`np-section-${section.id}`}
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
        Informational template, not legal advice. The sections reference the CAN-SPAM Act at 15
        U.S.C. section 7704 and 16 CFR Part 316, Canada&rsquo;s Anti-Spam Legislation S.C. 2010 c.
        23, GDPR Articles 5, 6, 7, 21, 28 and 33, Articles 5(3) and 13 of the ePrivacy Directive
        2002/58/EC, regulation 22 of the UK PECR 2003 and India&rsquo;s Digital Personal Data
        Protection Act 2023. Business-day deadlines ignore public holidays, so treat them as the
        earliest date rather than the latest.
      </p>
    </main>
  );
}
