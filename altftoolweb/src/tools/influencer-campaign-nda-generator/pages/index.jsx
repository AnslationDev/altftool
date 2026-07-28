"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileLock, RotateCcw } from "lucide-react";

import {
  CLAUSES,
  DEFAULT_CONFIDENTIALITY_YEARS,
  MAX_CONFIDENTIALITY_YEARS,
  PROFILE_TAGS,
  buildCampaignNda,
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

const DEFAULT_PROFILE = ["us", "gifted", "agency"];
const DEFAULT_INCLUDED = requiredClauses(DEFAULT_PROFILE).map((clause) => clause.id);

const DEFAULTS = {
  brandName: "Northwind Labs",
  creatorName: "@rheatests",
  productName: "Project Kestrel",
  jurisdiction: "California",
  effectiveDate: "2026-03-01",
  launchDate: "2026-09-15",
  confidentialityYears: DEFAULT_CONFIDENTIALITY_YEARS,
  returnDays: 14,
};

export default function ToolHome() {
  const [brandName, setBrandName] = useState(DEFAULTS.brandName);
  const [creatorName, setCreatorName] = useState(DEFAULTS.creatorName);
  const [productName, setProductName] = useState(DEFAULTS.productName);
  const [jurisdiction, setJurisdiction] = useState(DEFAULTS.jurisdiction);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [launchDate, setLaunchDate] = useState(DEFAULTS.launchDate);
  const [confidentialityYears, setConfidentialityYears] = useState(
    String(DEFAULTS.confidentialityYears),
  );
  const [returnDays, setReturnDays] = useState(String(DEFAULTS.returnDays));
  const [profileTags, setProfileTags] = useState(DEFAULT_PROFILE);
  const [includedIds, setIncludedIds] = useState(DEFAULT_INCLUDED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCampaignNda({
        brandName,
        creatorName,
        productName,
        jurisdiction,
        effectiveDate,
        launchDate,
        confidentialityYears: Number(confidentialityYears),
        returnDays: Number(returnDays),
        profileTags,
        includedIds,
      }),
    [
      brandName,
      creatorName,
      productName,
      jurisdiction,
      effectiveDate,
      launchDate,
      confidentialityYears,
      returnDays,
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
    setBrandName(DEFAULTS.brandName);
    setCreatorName(DEFAULTS.creatorName);
    setProductName(DEFAULTS.productName);
    setJurisdiction(DEFAULTS.jurisdiction);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setLaunchDate(DEFAULTS.launchDate);
    setConfidentialityYears(String(DEFAULTS.confidentialityYears));
    setReturnDays(String(DEFAULTS.returnDays));
    setProfileTags(DEFAULT_PROFILE);
    setIncludedIds(DEFAULT_INCLUDED);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileLock className="h-4 w-4" aria-hidden="true" />
          Creator agreements
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Influencer Campaign NDA Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Builds an embargo NDA for an unreleased product from clauses tied to real rules — the
          Defend Trade Secrets Act immunity notice, the FTC disclosure carve-out and the Consumer
          Review Fairness Act — then flags the gaps your campaign profile leaves open.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-brand">
              Brand or company name
            </label>
            <input
              id="nda-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-creator">
              Creator name or handle
            </label>
            <input
              id="nda-creator"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={creatorName}
              onChange={(event) => setCreatorName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-product">
              Product or campaign codename
            </label>
            <input
              id="nda-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-law">
              Governing law (state or country)
            </label>
            <input
              id="nda-law"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-effective">
              Effective date
            </label>
            <input
              id="nda-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-launch">
              Embargo lifts (launch date)
            </label>
            <input
              id="nda-launch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={launchDate}
              onChange={(event) => setLaunchDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-years">
              Confidentiality term (years)
            </label>
            <input
              id="nda-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max={MAX_CONFIDENTIALITY_YEARS}
              step="1"
              inputMode="numeric"
              value={confidentialityYears}
              onChange={(event) => setConfidentialityYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-return">
              Return or delete within (days)
            </label>
            <input
              id="nda-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="180"
              step="1"
              inputMode="numeric"
              value={returnDays}
              onChange={(event) => setReturnDays(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Campaign profile</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Ticking a box adds the clauses it makes necessary.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {PROFILE_TAGS.map((tag) => (
              <label
                key={tag.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`nda-profile-${tag.id}`}
              >
                <input
                  id={`nda-profile-${tag.id}`}
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
              {hasError
                ? DASH
                : `${result.embargoDays}-day embargo window · ${result.wordCount} words`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyAgreement}
              disabled={hasError}
              aria-label="Copy the assembled NDA"
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
              <dt className="font-semibold text-[var(--muted-foreground)]">Embargo lifts</dt>
              <dd className="mt-1 font-semibold">{hasError ? DASH : result.launchLong}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--muted-foreground)]">
                Confidentiality runs to
              </dt>
              <dd className="mt-1 font-semibold">
                {hasError ? DASH : result.confidentialityEndLong}
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
                  None — every clause this campaign profile requires is included.
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
                htmlFor={`nda-clause-${clause.id}`}
              >
                <input
                  id={`nda-clause-${clause.id}`}
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
                        Required for this campaign
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
        Informational template, not legal advice. The clauses reference the Defend Trade Secrets Act
        at 18 U.S.C. sections 1833(b) and 1836, the FTC Endorsement Guides at 16 CFR Part 255, the
        Consumer Review Fairness Act at 15 U.S.C. section 45b, EU Directive 2005/29/EC, the GDPR and
        India&rsquo;s Digital Personal Data Protection Act 2023. Have counsel in the creator&rsquo;s
        jurisdiction review anything you intend to enforce.
      </p>
    </main>
  );
}
