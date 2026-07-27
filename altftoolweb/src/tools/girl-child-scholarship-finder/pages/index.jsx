"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { COMMUNITIES, LEVELS, STATES, filterSchemes } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  level: "secondary",
  income: "150000",
  community: "general",
  singleGirl: false,
  state: "any",
};

const DASH = "—";

export default function ToolHome() {
  const [level, setLevel] = useState(DEFAULTS.level);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [community, setCommunity] = useState(DEFAULTS.community);
  const [singleGirl, setSingleGirl] = useState(DEFAULTS.singleGirl);
  const [stateId, setStateId] = useState(DEFAULTS.state);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      filterSchemes({
        level,
        annualIncome: income.trim() === "" ? null : Number(income),
        community,
        singleGirlChild: singleGirl,
        state: stateId,
      }),
    [level, income, community, singleGirl, stateId],
  );

  const hasError = Boolean(result.error);
  const eligible = hasError ? [] : result.eligible;
  const ineligible = hasError ? [] : result.ineligible;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Girl child scholarship matches",
      `Level: ${LEVELS.find((l) => l.id === level)?.label ?? level}`,
      `Matches: ${eligible.length}`,
      "",
    ];
    for (const scheme of eligible) {
      lines.push(`- ${scheme.name} (${scheme.provider}): ${scheme.amount}`);
    }
    return lines.join("\n");
  }, [hasError, eligible, level]);

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
    setLevel(DEFAULTS.level);
    setIncome(DEFAULTS.income);
    setCommunity(DEFAULTS.community);
    setSingleGirl(DEFAULTS.singleGirl);
    setStateId(DEFAULTS.state);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Scholarship Tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Girl Child Scholarship Finder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the study level, family income and category to see which central and state
          scholarship schemes for girl students match, and why the others do not.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gcs-level">
              Study level
            </label>
            <select
              id="gcs-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              {LEVELS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcs-income">
              Annual family income (INR, optional)
            </label>
            <input
              id="gcs-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcs-community">
              Community category
            </label>
            <select
              id="gcs-community"
              className={`mt-2 ${INPUT_CLASS}`}
              value={community}
              onChange={(event) => setCommunity(event.target.value)}
            >
              {COMMUNITIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcs-state">
              State
            </label>
            <select
              id="gcs-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stateId}
              onChange={(event) => setStateId(event.target.value)}
            >
              {STATES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="gcs-single"
        >
          <input
            id="gcs-single"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={singleGirl}
            onChange={(event) => setSingleGirl(event.target.checked)}
          />
          She is a single girl child (no brothers; twin sisters count)
        </label>
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
              Matching schemes
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : eligible.length}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see matches."
                : "Schemes whose published rules fit this profile."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError || eligible.length === 0}
              aria-label="Copy the list of matching scholarships"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all filters to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && eligible.length === 0 ? (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">
            No scheme in this table matches the current filters. Try another level or clear the
            income field, and check the ineligible list below to see what blocked each scheme.
          </p>
        ) : null}

        <ul className="mt-5 space-y-3">
          {eligible.map((scheme) => (
            <li
              key={scheme.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <p className="font-semibold">{scheme.name}</p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{scheme.provider}</p>
              <dl className="mt-2 text-sm">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-[var(--muted-foreground)]">Benefit:</dt>
                  <dd className="text-[var(--success)]">{scheme.amount}</dd>
                </div>
              </dl>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{scheme.notes}</p>
            </li>
          ))}
        </ul>
      </section>

      {!hasError && ineligible.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Not matching, and why</h2>
          <ul className="mt-3 space-y-3">
            {ineligible.map(({ scheme, reasons }) => (
              <li
                key={scheme.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  {scheme.name}
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm text-[var(--muted-foreground)]">
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Scheme amounts, ceilings and windows are revised by notification —
        always verify the current year&apos;s guidelines on the National Scholarship Portal
        (scholarships.gov.in) or the scheme&apos;s own portal before applying.
      </p>
    </main>
  );
}
