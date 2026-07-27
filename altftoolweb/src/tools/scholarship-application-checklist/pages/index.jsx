"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Info, RotateCcw, TriangleAlert } from "lucide-react";

import {
  COMMUNITIES,
  SCHEMES,
  buildScholarshipChecklist,
  computeReadiness,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

const FLAG_OPTIONS = [
  { key: "renewal", label: "This is a renewal, not a fresh application" },
  { key: "studyingOutsideState", label: "Studying outside my home state" },
  { key: "hasDisability", label: "Claiming under a disability component" },
  { key: "holdsAnotherScholarship", label: "I already draw another scholarship" },
];

const DEFAULT_FLAGS = {
  renewal: false,
  studyingOutsideState: false,
  hasDisability: false,
  holdsAnotherScholarship: false,
};

const DEFAULTS = { schemeId: "csss", communityId: "general", familyIncome: "300000" };

export default function ToolHome() {
  const [schemeId, setSchemeId] = useState(DEFAULTS.schemeId);
  const [communityId, setCommunityId] = useState(DEFAULTS.communityId);
  const [familyIncome, setFamilyIncome] = useState(DEFAULTS.familyIncome);
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [haveIds, setHaveIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const toggleFlag = (key) => setFlags((current) => ({ ...current, [key]: !current[key] }));
  const toggleHave = (id) =>
    setHaveIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildScholarshipChecklist({
        schemeId,
        communityId,
        familyIncome: familyIncome === "" ? 0 : Number(familyIncome),
        ...flags,
      }),
    [schemeId, communityId, familyIncome, flags],
  );

  const hasError = Boolean(result.error);

  const readiness = useMemo(
    () => computeReadiness(hasError ? [] : result.documents, haveIds),
    [hasError, result, haveIds],
  );

  const groups = useMemo(() => {
    if (hasError) return [];
    const map = new Map();
    result.documents.forEach((doc) => {
      const key = doc.group || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(doc);
    });
    return Array.from(map, ([name, items]) => ({ name, items }));
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Scholarship Application Checklist — ${result.scheme.label}`,
      `Income ceiling: ${result.incomeTest.ceiling} | Declared income: ${result.incomeTest.income}`,
      result.incomeTest.within
        ? `Headroom: ${result.incomeTest.headroom}`
        : `Over the ceiling by ${result.incomeTest.over}`,
      `Verdict: ${result.verdict}`,
      "",
      "Documents:",
    ];
    groups.forEach((group) => {
      lines.push(`-- ${group.name} --`);
      group.items.forEach((doc) =>
        lines.push(`[${haveIds.includes(doc.id) ? "x" : " "}] ${doc.label}`),
      );
    });
    return lines.join("\n");
  }, [hasError, result, groups, haveIds]);

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
    setSchemeId(DEFAULTS.schemeId);
    setCommunityId(DEFAULTS.communityId);
    setFamilyIncome(DEFAULTS.familyIncome);
    setFlags(DEFAULT_FLAGS);
    setHaveIds([]);
    setCopied(false);
  };

  const withinCeiling = !hasError && result.incomeTest.within;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          NSP &amp; state portals
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Scholarship Application Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Income ceilings vary from ₹2.5 lakh to ₹8 lakh depending on the scheme, so the test comes
          first. Clear it and the exact document list for that scheme follows.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-scheme">
              Scheme
            </label>
            <select
              id="sch-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={schemeId}
              onChange={(event) => setSchemeId(event.target.value)}
            >
              {SCHEMES.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.label}
                </option>
              ))}
            </select>
            {!hasError && (
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                {result.scheme.level}
              </p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-community">
              Community on your certificate
            </label>
            <select
              id="sch-community"
              className={`mt-2 ${INPUT_CLASS}`}
              value={communityId}
              onChange={(event) => setCommunityId(event.target.value)}
            >
              {COMMUNITIES.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-income">
              Annual family income (INR)
            </label>
            <input
              id="sch-income"
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              className={`mt-2 ${INPUT_CLASS}`}
              value={familyIncome}
              onChange={(event) => setFamilyIncome(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Both parents together, from all sources, as the revenue authority will certify it.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which of these apply?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FLAG_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`sch-f-${option.key}`}>
                <input
                  id={`sch-f-${option.key}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={flags[option.key]}
                  onChange={() => toggleFlag(option.key)}
                />
                <span>{option.label}</span>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError || withinCeiling ? "Headroom under the income ceiling" : "Over the income ceiling by"}
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError || withinCeiling ? "text-[var(--primary)]" : "text-[var(--danger)]"
              }`}
            >
              {hasError
                ? DASH
                : withinCeiling
                  ? money(result.incomeTest.headroom)
                  : money(result.incomeTest.over)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.eligible
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError ? "Fix the income figure to see the test." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the scholarship document checklist"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Income ceiling for this scheme", hasError ? DASH : money(result.incomeTest.ceiling)],
            ["Income declared", hasError ? DASH : money(result.incomeTest.income)],
            ["What the scheme pays", hasError ? DASH : result.scheme.benefit],
            ["Documents needed", hasError ? DASH : String(readiness.total)],
            ["In hand", hasError ? DASH : String(readiness.have)],
            ["Still missing", hasError ? DASH : String(readiness.missing.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${readiness.percent} percent of the documents are ready`}
            >
              <span
                className={`block h-full ${readiness.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${readiness.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{readiness.percent}% ready</p>
          </div>
        )}
      </section>

      {!hasError && result.blockers.length > 0 && (
        <section className="mt-6 grid gap-3">
          {result.blockers.map((blocker) => (
            <div
              key={blocker.id}
              role="alert"
              className="flex items-start gap-3 rounded-xl bg-[var(--danger-soft)] p-4"
            >
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--danger)]">{blocker.title}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--danger)]">{blocker.detail}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you submit</h2>
          <ul className="mt-3 grid gap-3">
            {result.notes.map((note) => (
              <li
                key={note}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <p className="min-w-0 text-sm leading-6">{note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError &&
        groups.map((group) => (
          <section
            key={group.name}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{group.name}</h2>
            <ul className="mt-3 grid gap-3">
              {group.items.map((doc) => (
                <li key={doc.id}>
                  <label className={CHECK_ROW} htmlFor={`sch-d-${doc.id}`}>
                    <input
                      id={`sch-d-${doc.id}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={haveIds.includes(doc.id)}
                      onChange={() => toggleHave(doc.id)}
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold">{doc.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {doc.detail}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Scheme guidelines, income ceilings and rates are revised from time to
        time and states run their own variants — read the current guideline for the scheme and year
        you are applying under before relying on any figure here.
      </p>
    </main>
  );
}
