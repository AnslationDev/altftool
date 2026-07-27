"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MapPinHouse, RotateCcw } from "lucide-react";

import { STATES, buildDomicileChecklist, computeReadiness } from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PROFILE_OPTIONS = [
  { key: "bornInState", label: "I was born in this state" },
  { key: "ownsPropertyInState", label: "My family owns property here" },
  { key: "isMinor", label: "The applicant is a minor" },
  { key: "studentApplicant", label: "This is for a school or college admission" },
  { key: "marriedWomanViaHusband", label: "Applying as a married woman on my husband's domicile" },
  { key: "governmentTransfer", label: "I am here on a government posting or transfer" },
];

const DEFAULT_PROFILE = {
  bornInState: false,
  ownsPropertyInState: false,
  isMinor: false,
  studentApplicant: false,
  marriedWomanViaHusband: false,
  governmentTransfer: false,
  studiedSevenYearsAndSatBoardExam: false,
};

const DEFAULT_STATE = "maharashtra";
const DEFAULT_YEARS_RESIDED = "12";

const initialPeriodFor = (stateId) => {
  const found = STATES.find((entry) => entry.id === stateId);
  return found && found.residenceYears !== null ? String(found.residenceYears) : "";
};

export default function ToolHome() {
  const [stateId, setStateId] = useState(DEFAULT_STATE);
  const [residenceYears, setResidenceYears] = useState(initialPeriodFor(DEFAULT_STATE));
  const [yearsResided, setYearsResided] = useState(DEFAULT_YEARS_RESIDED);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [haveIds, setHaveIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const chosenState = STATES.find((entry) => entry.id === stateId);

  const changeState = (nextId) => {
    setStateId(nextId);
    setResidenceYears(initialPeriodFor(nextId));
    setHaveIds([]);
  };

  const toggleProfile = (key) =>
    setProfile((current) => ({ ...current, [key]: !current[key] }));

  const toggleHave = (id) =>
    setHaveIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildDomicileChecklist({
        stateId,
        residenceYears: residenceYears === "" ? null : Number(residenceYears),
        yearsResided: yearsResided === "" ? 0 : Number(yearsResided),
        profile,
      }),
    [stateId, residenceYears, yearsResided, profile],
  );

  const hasError = Boolean(result.error);

  const readiness = useMemo(
    () => computeReadiness(hasError ? [] : result.documents, haveIds),
    [hasError, result, haveIds],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Domicile and Residence Proof Checklist",
      `State: ${result.state.label}`,
      `Qualifying period: ${result.requiredYears === null ? "not set — check the state portal" : `${result.requiredYears} years`}`,
      `You have resided: ${result.yearsResided} years`,
      `Residence test: ${result.residenceNote}`,
      `File readiness: ${readiness.have} of ${readiness.total} required documents (${readiness.percent}%)`,
      "",
      "Required documents:",
      ...result.requiredDocuments.map((doc) => `[${haveIds.includes(doc.id) ? "x" : " "}] ${doc.label}`),
      "",
      "Useful to add:",
      ...result.optionalDocuments.map((doc) => `[ ] ${doc.label}`),
    ].join("\n");
  }, [hasError, result, readiness, haveIds]);

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
    setStateId(DEFAULT_STATE);
    setResidenceYears(initialPeriodFor(DEFAULT_STATE));
    setYearsResided(DEFAULT_YEARS_RESIDED);
    setProfile(DEFAULT_PROFILE);
    setHaveIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MapPinHouse className="h-4 w-4" aria-hidden="true" />
          Certificates India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Domicile and Residence Proof Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Domicile is issued by the state, so the qualifying period changes but the shape of the file
          does not: identity, current address, proof the address has held for the period, parentage
          and a sworn declaration. Tick what you already have and see what is still missing.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dpc-state">
              State or union territory
            </label>
            <select
              id="dpc-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stateId}
              onChange={(event) => changeState(event.target.value)}
            >
              {STATES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {chosenState && chosenState.basis ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{chosenState.basis}</p>
            ) : (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                No period is pre-filled for this state. Take it from the e-district portal and enter
                it below — every other part of the checklist still applies.
              </p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpc-period">
              Qualifying period the state asks for (years)
            </label>
            <input
              id="dpc-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="60"
              step="1"
              placeholder="Leave blank if unknown"
              value={residenceYears}
              onChange={(event) => setResidenceYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpc-resided">
              Years you have actually lived there
            </label>
            <input
              id="dpc-resided"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="120"
              step="0.5"
              value={yearsResided}
              onChange={(event) => setYearsResided(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which of these apply to you?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PROFILE_OPTIONS.map((option) => (
              <label
                key={option.key}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                htmlFor={`dpc-p-${option.key}`}
              >
                <input
                  id={`dpc-p-${option.key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={profile[option.key]}
                  onChange={() => toggleProfile(option.key)}
                />
                <span>{option.label}</span>
              </label>
            ))}
            {chosenState && chosenState.hasEducationRoute && (
              <label
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm sm:col-span-2"
                htmlFor="dpc-p-education"
              >
                <input
                  id="dpc-p-education"
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={profile.studiedSevenYearsAndSatBoardExam}
                  onChange={() => toggleProfile("studiedSevenYearsAndSatBoardExam")}
                />
                <span>
                  I studied here for seven years and took my Class 10 or 12 board examination here
                </span>
              </label>
            )}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              File readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${readiness.percent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the checklist."
                : `${readiness.have} of ${readiness.total} required documents in hand`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the domicile document checklist"
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

        {!hasError && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${readiness.percent} percent of the required documents are ready`}
            >
              <span
                className={`block h-full ${readiness.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${readiness.percent}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["State", hasError ? DASH : result.state.label],
            [
              "Qualifying period",
              hasError
                ? DASH
                : result.requiredYears === null
                  ? "Not set — check the state portal"
                  : `${result.requiredYears} years`,
            ],
            ["Years you have resided", hasError ? DASH : `${result.yearsResided}`],
            [
              "Residence test",
              hasError
                ? DASH
                : result.meetsResidence === true
                  ? "Met"
                  : result.meetsResidence === false
                    ? `Short by ${result.shortfallYears} year(s)`
                    : "Cannot be tested yet",
            ],
            ["Required documents", hasError ? DASH : String(result.requiredDocuments.length)],
            ["Still missing", hasError ? DASH : String(readiness.missing.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.residenceNote}
          </p>
        )}
      </section>

      {!hasError && result.alternateRoutes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Other ways to qualify in this territory</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.alternateRoutes.map((route) => (
              <li key={route} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span className="text-[var(--muted-foreground)]">{route}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Required documents</h2>
          <ul className="mt-3 grid gap-3">
            {result.requiredDocuments.map((doc) => (
              <li key={doc.id}>
                <label
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  htmlFor={`dpc-d-${doc.id}`}
                >
                  <input
                    id={`dpc-d-${doc.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={haveIds.includes(doc.id)}
                    onChange={() => toggleHave(doc.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{doc.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {result.optionalDocuments.length > 0 && (
            <>
              <h2 className="mt-6 text-base font-semibold">Worth adding</h2>
              <ul className="mt-3 grid gap-3">
                {result.optionalDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-sm font-semibold">{doc.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Qualifying periods and forms are set by each state and
        change — take the current figure from your own e-district portal. Most states run a Right to
        Public Services Act that puts a notified deadline on issue and gives you an appeal if it is
        missed. No certificate issues without the revenue authority&apos;s own local enquiry.
      </p>
    </main>
  );
}
