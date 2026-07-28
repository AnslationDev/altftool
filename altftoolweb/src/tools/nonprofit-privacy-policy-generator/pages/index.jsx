"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HandHeart, RotateCcw } from "lucide-react";

import { PRACTICES, SECTIONS, buildNonprofitPolicy, requiredSections } from "../lib";

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
  "donors",
  "us-tax",
  "volunteers",
  "beneficiaries",
  "special-category",
  "grants",
  "case-studies",
];
const DEFAULT_INCLUDED = requiredSections(DEFAULT_PRACTICES).map((section) => section.id);

const DEFAULTS = {
  orgName: "Riverbank Trust",
  orgType: "a registered charity",
  regNumber: "1123456",
  contactEmail: "privacy@riverbank.example",
  processors: "our CRM provider, our payment provider and our email provider",
  channels: "email, post and, occasionally, the telephone",
  effectiveDate: "2026-03-01",
  reviewMonths: 12,
  donorRecordMonths: 84,
  volunteerMonths: 36,
  beneficiaryMonths: 84,
  donationAmount: 1000,
  benefitValue: 120,
  totalContributions: 400000,
};

export default function ToolHome() {
  const [orgName, setOrgName] = useState(DEFAULTS.orgName);
  const [orgType, setOrgType] = useState(DEFAULTS.orgType);
  const [regNumber, setRegNumber] = useState(DEFAULTS.regNumber);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [processors, setProcessors] = useState(DEFAULTS.processors);
  const [channels, setChannels] = useState(DEFAULTS.channels);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [reviewMonths, setReviewMonths] = useState(String(DEFAULTS.reviewMonths));
  const [donorRecordMonths, setDonorRecordMonths] = useState(String(DEFAULTS.donorRecordMonths));
  const [volunteerMonths, setVolunteerMonths] = useState(String(DEFAULTS.volunteerMonths));
  const [beneficiaryMonths, setBeneficiaryMonths] = useState(String(DEFAULTS.beneficiaryMonths));
  const [giftAid, setGiftAid] = useState(false);
  const [donationAmount, setDonationAmount] = useState(String(DEFAULTS.donationAmount));
  const [benefitValue, setBenefitValue] = useState(String(DEFAULTS.benefitValue));
  const [totalContributions, setTotalContributions] = useState(
    String(DEFAULTS.totalContributions),
  );
  const [practices, setPractices] = useState(DEFAULT_PRACTICES);
  const [includedIds, setIncludedIds] = useState(DEFAULT_INCLUDED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildNonprofitPolicy({
        orgName,
        orgType,
        regNumber,
        contactEmail,
        processors,
        channels,
        effectiveDate,
        reviewMonths: Number(reviewMonths),
        donorRecordMonths: Number(donorRecordMonths),
        volunteerMonths: Number(volunteerMonths),
        beneficiaryMonths: Number(beneficiaryMonths),
        giftAid,
        donationAmount: Number(donationAmount),
        benefitValue: Number(benefitValue),
        totalContributions: Number(totalContributions),
        practices,
        includedIds,
      }),
    [
      orgName,
      orgType,
      regNumber,
      contactEmail,
      processors,
      channels,
      effectiveDate,
      reviewMonths,
      donorRecordMonths,
      volunteerMonths,
      beneficiaryMonths,
      giftAid,
      donationAmount,
      benefitValue,
      totalContributions,
      practices,
      includedIds,
    ],
  );

  const hasError = Boolean(result.error);
  const usd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    [],
  );
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
    setOrgName(DEFAULTS.orgName);
    setOrgType(DEFAULTS.orgType);
    setRegNumber(DEFAULTS.regNumber);
    setContactEmail(DEFAULTS.contactEmail);
    setProcessors(DEFAULTS.processors);
    setChannels(DEFAULTS.channels);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setReviewMonths(String(DEFAULTS.reviewMonths));
    setDonorRecordMonths(String(DEFAULTS.donorRecordMonths));
    setVolunteerMonths(String(DEFAULTS.volunteerMonths));
    setBeneficiaryMonths(String(DEFAULTS.beneficiaryMonths));
    setGiftAid(false);
    setDonationAmount(String(DEFAULTS.donationAmount));
    setBenefitValue(String(DEFAULTS.benefitValue));
    setTotalContributions(String(DEFAULTS.totalContributions));
    setPractices(DEFAULT_PRACTICES);
    setIncludedIds(DEFAULT_INCLUDED);
    setCopied(false);
  };

  const showUsTax = practices.includes("us-tax");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HandHeart className="h-4 w-4" aria-hidden="true" />
          Policy generators
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Nonprofit Privacy Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Writes a charity privacy notice that separates donors, volunteers and the people you help,
          names an Article 9 condition for sensitive records, and works out the IRS receipting
          thresholds and the retention periods grant and FCRA rules impose.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The organisation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-name">
              Organisation name
            </label>
            <input
              id="ng-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-type">
              Legal form
            </label>
            <input
              id="ng-type"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={orgType}
              onChange={(event) => setOrgType(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-reg">
              Registration number
            </label>
            <input
              id="ng-reg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={regNumber}
              onChange={(event) => setRegNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-contact">
              Contact for data and grievances
            </label>
            <input
              id="ng-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ng-processors">
              Service providers you name
            </label>
            <input
              id="ng-processors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={processors}
              onChange={(event) => setProcessors(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ng-channels">
              How you contact supporters
            </label>
            <input
              id="ng-channels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={channels}
              onChange={(event) => setChannels(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-effective">
              Last updated
            </label>
            <input
              id="ng-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-review">
              Review every (months)
            </label>
            <input
              id="ng-review"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="240"
              step="1"
              inputMode="numeric"
              value={reviewMonths}
              onChange={(event) => setReviewMonths(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>What the organisation does</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Ticking a box adds the sections it makes necessary.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {PRACTICES.map((practice) => (
              <label
                key={practice.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`ng-practice-${practice.id}`}
              >
                <input
                  id={`ng-practice-${practice.id}`}
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

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="ng-giftaid"
        >
          <input
            id="ng-giftaid"
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={giftAid}
            onChange={(event) => setGiftAid(event.target.checked)}
          />
          We operate a tax-reclaim declaration scheme such as Gift Aid
        </label>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Retention (months)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-donorret">
              Donation and receipt records
            </label>
            <input
              id="ng-donorret"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="240"
              step="1"
              inputMode="numeric"
              value={donorRecordMonths}
              onChange={(event) => setDonorRecordMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-volret">
              Volunteer records after last shift
            </label>
            <input
              id="ng-volret"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="240"
              step="1"
              inputMode="numeric"
              value={volunteerMonths}
              onChange={(event) => setVolunteerMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ng-benret">
              Case records after the case closes
            </label>
            <input
              id="ng-benret"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="240"
              step="1"
              inputMode="numeric"
              value={beneficiaryMonths}
              onChange={(event) => setBeneficiaryMonths(event.target.value)}
            />
          </div>
        </div>

        {showUsTax ? (
          <>
            <h2 className="mt-6 text-base font-semibold">Donor disclosure check (USD)</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Used to show a worked example in the receipting section.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="ng-donation">
                  Example gift amount
                </label>
                <input
                  id="ng-donation"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="0"
                  step="10"
                  inputMode="decimal"
                  value={donationAmount}
                  onChange={(event) => setDonationAmount(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ng-benefit">
                  Value of goods or services given back
                </label>
                <input
                  id="ng-benefit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="0"
                  step="5"
                  inputMode="decimal"
                  value={benefitValue}
                  onChange={(event) => setBenefitValue(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ng-total">
                  Total contributions for the year
                </label>
                <input
                  id="ng-total"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="0"
                  step="1000"
                  inputMode="decimal"
                  value={totalContributions}
                  onChange={(event) => setTotalContributions(event.target.value)}
                />
              </div>
            </div>
          </>
        ) : null}
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
              aria-label="Copy the assembled nonprofit privacy notice"
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
              "Deductible amount on the example gift",
              hasError ? DASH : usd.format(result.donor.deductibleAmount),
            ],
            [
              "Written acknowledgment required",
              hasError ? DASH : result.donor.needsWrittenAck ? "Yes" : "No",
            ],
            [
              "Quid pro quo disclosure required",
              hasError ? DASH : result.donor.needsQuidProQuo ? "Yes" : "No",
            ],
            [
              "Schedule B contributor threshold",
              hasError ? DASH : usd.format(result.donor.scheduleBThreshold),
            ],
            [
              "Example gift reaches that threshold",
              hasError ? DASH : result.donor.isScheduleBContributor ? "Yes" : "No",
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

        {!hasError ? (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.donor.notes.map((note) => (
              <li
                key={note}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}

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
                htmlFor={`ng-section-${section.id}`}
              >
                <input
                  id={`ng-section-${section.id}`}
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
        Informational template, not legal, tax or accounting advice. The sections reference GDPR
        Articles 9(1), 9(2)(d), 10, 28 and 33 and Recital 47, 26 U.S.C. sections 170(f)(8) and 6115,
        Form 990 Schedule B, 2 CFR 200.334, India&rsquo;s Foreign Contribution (Regulation) Act 2010
        and Digital Personal Data Protection Act 2023. Charity regulators add their own fundraising
        rules — check yours, and take advice before publishing.
      </p>
    </main>
  );
}
