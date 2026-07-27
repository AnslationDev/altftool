"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSignature, RotateCcw } from "lucide-react";

import {
  ATTRIBUTION_OPTIONS,
  PLAIN_LANGUAGE_TARGET,
  REQUIRED_ELEMENTS,
  TERRITORY_OPTIONS,
  USAGE_OPTIONS,
  buildConsentForm,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  organisation: "Northline Media",
  interviewer: "",
  projectName: "Harbour Voices podcast",
  purpose: "We are making a documentary series about the port and the people who work there.",
  usageIds: ["quotes", "audio", "archive"],
  attribution: "named",
  territory: "worldwide",
  territoryName: "",
  retentionYears: "5",
  keepIndefinitely: false,
  withdrawalDays: "14",
  contactEmail: "privacy@example.com",
  interviewDate: "",
  paid: false,
  allowEdits: true,
};

export default function ToolHome() {
  const [organisation, setOrganisation] = useState(DEFAULTS.organisation);
  const [interviewer, setInterviewer] = useState(DEFAULTS.interviewer);
  const [projectName, setProjectName] = useState(DEFAULTS.projectName);
  const [purpose, setPurpose] = useState(DEFAULTS.purpose);
  const [usageIds, setUsageIds] = useState(DEFAULTS.usageIds);
  const [attribution, setAttribution] = useState(DEFAULTS.attribution);
  const [territory, setTerritory] = useState(DEFAULTS.territory);
  const [territoryName, setTerritoryName] = useState(DEFAULTS.territoryName);
  const [retentionYears, setRetentionYears] = useState(DEFAULTS.retentionYears);
  const [keepIndefinitely, setKeepIndefinitely] = useState(DEFAULTS.keepIndefinitely);
  const [withdrawalDays, setWithdrawalDays] = useState(DEFAULTS.withdrawalDays);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [interviewDate, setInterviewDate] = useState(DEFAULTS.interviewDate);
  const [paid, setPaid] = useState(DEFAULTS.paid);
  const [allowEdits, setAllowEdits] = useState(DEFAULTS.allowEdits);
  const [copied, setCopied] = useState(false);

  const form = useMemo(
    () =>
      buildConsentForm({
        organisation,
        interviewer,
        projectName,
        purpose,
        usageIds,
        attribution,
        territory,
        territoryName,
        retentionYears: retentionYears === "" ? NaN : Number(retentionYears),
        keepIndefinitely,
        withdrawalDays: withdrawalDays === "" ? NaN : Number(withdrawalDays),
        contactEmail,
        interviewDate,
        paid,
        allowEdits,
      }),
    [
      organisation,
      interviewer,
      projectName,
      purpose,
      usageIds,
      attribution,
      territory,
      territoryName,
      retentionYears,
      keepIndefinitely,
      withdrawalDays,
      contactEmail,
      interviewDate,
      paid,
      allowEdits,
    ],
  );

  const toggleUsage = (id) => {
    setUsageIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const copyResult = async () => {
    if (form.error) return;
    try {
      await navigator.clipboard.writeText(form.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOrganisation(DEFAULTS.organisation);
    setInterviewer(DEFAULTS.interviewer);
    setProjectName(DEFAULTS.projectName);
    setPurpose(DEFAULTS.purpose);
    setUsageIds(DEFAULTS.usageIds);
    setAttribution(DEFAULTS.attribution);
    setTerritory(DEFAULTS.territory);
    setTerritoryName(DEFAULTS.territoryName);
    setRetentionYears(DEFAULTS.retentionYears);
    setKeepIndefinitely(DEFAULTS.keepIndefinitely);
    setWithdrawalDays(DEFAULTS.withdrawalDays);
    setContactEmail(DEFAULTS.contactEmail);
    setInterviewDate(DEFAULTS.interviewDate);
    setPaid(DEFAULTS.paid);
    setAllowEdits(DEFAULTS.allowEdits);
    setCopied(false);
  };

  const grade = form.error || !form.readability ? null : form.readability.gradeLevel;
  const ease = form.error || !form.readability ? null : form.readability.readingEase;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileSignature className="h-4 w-4" aria-hidden="true" />
          Media privacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Interview Consent Form Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer a few questions and get a short recording consent form written in plain English —
          purpose, permitted uses, attribution, retention and the right to withdraw, all on one page.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Who and what</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-org">
              Organisation or person recording
            </label>
            <input
              id="icf-org"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-interviewer">
              Interviewer name (optional)
            </label>
            <input
              id="icf-interviewer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={interviewer}
              onChange={(event) => setInterviewer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-project">
              Project name
            </label>
            <input
              id="icf-project"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-date">
              Date of interview (optional)
            </label>
            <input
              id="icf-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={interviewDate}
              onChange={(event) => setInterviewDate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="icf-purpose">
            Why you are recording (one or two plain sentences)
          </label>
          <textarea
            id="icf-purpose"
            rows={3}
            className={`mt-2 ${TEXTAREA_CLASS}`}
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Permitted uses</h2>
        <fieldset className="mt-3">
          <legend className="sr-only">Ways the recording may be used</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {USAGE_OPTIONS.map((option) => (
              <label
                key={option.id}
                htmlFor={`icf-usage-${option.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                <input
                  id={`icf-usage-${option.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={usageIds.includes(option.id)}
                  onChange={() => toggleUsage(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-attribution">
              Attribution
            </label>
            <select
              id="icf-attribution"
              className={`mt-2 ${INPUT_CLASS}`}
              value={attribution}
              onChange={(event) => setAttribution(event.target.value)}
            >
              {ATTRIBUTION_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-territory">
              Territory of use
            </label>
            <select
              id="icf-territory"
              className={`mt-2 ${INPUT_CLASS}`}
              value={territory}
              onChange={(event) => setTerritory(event.target.value)}
            >
              {TERRITORY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {territory !== "worldwide" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="icf-territory-name">
                Name the country or region
              </label>
              <input
                id="icf-territory-name"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={territoryName}
                onChange={(event) => setTerritoryName(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-retention">
              Keep the recording for (years)
            </label>
            <input
              id="icf-retention"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              disabled={keepIndefinitely}
              value={retentionYears}
              onChange={(event) => setRetentionYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-withdrawal">
              Withdrawal window (days after interview)
            </label>
            <input
              id="icf-withdrawal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={withdrawalDays}
              onChange={(event) => setWithdrawalDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icf-contact">
              Contact email for questions
            </label>
            <input
              id="icf-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="inline-flex min-h-11 items-center gap-2 text-sm" htmlFor="icf-indefinite">
            <input
              id="icf-indefinite"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={keepIndefinitely}
              onChange={(event) => setKeepIndefinitely(event.target.checked)}
            />
            Keep indefinitely (archive)
          </label>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm" htmlFor="icf-paid">
            <input
              id="icf-paid"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={paid}
              onChange={(event) => setPaid(event.target.checked)}
            />
            Interviewee is being paid
          </label>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm" htmlFor="icf-edits">
            <input
              id="icf-edits"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={allowEdits}
              onChange={(event) => setAllowEdits(event.target.checked)}
            />
            We may edit for length and clarity
          </label>
        </div>
      </section>

      {form.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {form.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Required elements covered
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {form.error ? DASH : `${NUM.format(form.completeness)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {form.error
                ? "Fix the inputs above to generate the form."
                : `${form.coveredCount} of ${form.totalElements} elements present`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the consent form text"
              className={GHOST_BTN}
              disabled={Boolean(form.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy form"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Reading ease (Flesch)", ease === null ? DASH : `${NUM1.format(ease)} / 100`],
            ["Reading grade (Flesch-Kincaid)", grade === null ? DASH : NUM1.format(grade)],
            ["Word count", form.error ? DASH : NUM.format(form.wordCount)],
            ["Permitted uses listed", form.error ? DASH : NUM.format(form.usageCount)],
            ["Retention", form.error ? DASH : form.retentionLabel],
            ["Withdrawal window", form.error ? DASH : form.withdrawalLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!form.error && grade !== null ? (
          <p
            className={`mt-4 text-xs leading-5 ${grade <= PLAIN_LANGUAGE_TARGET.gradeLevel ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
          >
            {grade <= PLAIN_LANGUAGE_TARGET.gradeLevel
              ? `Reads at grade ${NUM1.format(grade)} — inside the plain-English target of grade ${PLAIN_LANGUAGE_TARGET.gradeLevel} or below.`
              : `Reads at grade ${NUM1.format(grade)}. Shorten the purpose text to get to grade ${PLAIN_LANGUAGE_TARGET.gradeLevel} or below.`}
          </p>
        ) : null}

        {!form.error && form.missing.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs text-[var(--danger)]">
            {form.missing.map((element) => (
              <li key={element.id}>
                Missing: {element.label} — {element.basis}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!form.error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your consent form</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {form.text}
            </pre>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Why each element is here</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {REQUIRED_ELEMENTS.map((element) => (
            <li key={element.id} className="flex flex-col gap-0.5">
              <span className="font-semibold">{element.label}</span>
              <span className="text-[var(--muted-foreground)]">{element.basis}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Recording law, publicity rights and data-protection
        duties differ by country and by sector — have a qualified adviser review the wording before
        you use it, especially with children, patients or vulnerable interviewees.
      </p>
    </main>
  );
}
