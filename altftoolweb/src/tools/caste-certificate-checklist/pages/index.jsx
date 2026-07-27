"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Info, RotateCcw, ScrollText, TriangleAlert } from "lucide-react";

import {
  CATEGORIES,
  CREAMY_LAYER_TEST_YEARS,
  RELIGIONS,
  buildCasteCertificateChecklist,
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

const PROFILE_OPTIONS = [
  { key: "marriedWoman", label: "The applicant is a married woman" },
  { key: "claimingHusbandsCaste", label: "She wants the certificate on her husband's caste" },
  { key: "interCasteParents", label: "The parents married across categories" },
  { key: "migratedFromAnotherState", label: "The family migrated from another state" },
  { key: "casteNotInStateList", label: "The caste is not in this state's notified list" },
  { key: "isMinor", label: "The applicant is a minor" },
];

const DEFAULT_PROFILE = {
  marriedWoman: false,
  claimingHusbandsCaste: false,
  interCasteParents: false,
  migratedFromAnotherState: false,
  casteNotInStateList: false,
  isMinor: false,
};

const DEFAULTS = {
  categoryId: "obcCentral",
  religionId: "hindu",
  countedIncome: "350000",
};

export default function ToolHome() {
  const [categoryId, setCategoryId] = useState(DEFAULTS.categoryId);
  const [religionId, setReligionId] = useState(DEFAULTS.religionId);
  const [countedIncome, setCountedIncome] = useState(DEFAULTS.countedIncome);
  const [sustainedThreeYears, setSustainedThreeYears] = useState(true);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [haveIds, setHaveIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const toggleProfile = (key) => setProfile((current) => ({ ...current, [key]: !current[key] }));
  const toggleHave = (id) =>
    setHaveIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildCasteCertificateChecklist({
        categoryId,
        religionId,
        profile,
        countedIncome: countedIncome === "" ? 0 : Number(countedIncome),
        sustainedThreeYears,
      }),
    [categoryId, religionId, profile, countedIncome, sustainedThreeYears],
  );

  const hasError = Boolean(result.error);

  const readiness = useMemo(
    () => computeReadiness(hasError ? [] : result.documents, haveIds),
    [hasError, result, haveIds],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Caste Certificate Document Checklist",
      `Category: ${result.category.label}`,
      `List: ${result.category.list}`,
      `Religion: ${result.religion.label}`,
      `Verdict: ${result.verdict}`,
    ];
    if (result.creamyLayer) {
      lines.push(`Creamy layer test: ${result.creamyLayer.note}`);
    }
    if (result.blockers.length > 0) {
      lines.push("", "Bars that apply:");
      result.blockers.forEach((bar) => lines.push(`• ${bar.title}`));
    }
    lines.push("", "Required documents:");
    result.requiredDocuments.forEach((doc) =>
      lines.push(`[${haveIds.includes(doc.id) ? "x" : " "}] ${doc.label}`),
    );
    return lines.join("\n");
  }, [hasError, result, haveIds]);

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
    setCategoryId(DEFAULTS.categoryId);
    setReligionId(DEFAULTS.religionId);
    setCountedIncome(DEFAULTS.countedIncome);
    setSustainedThreeYears(true);
    setProfile(DEFAULT_PROFILE);
    setHaveIds([]);
    setCopied(false);
  };

  const showIncome = !hasError && result.category.incomeTest;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Certificates India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Caste Certificate Document Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Some bars no amount of paperwork will clear — the religion condition in the Scheduled
          Castes Order, the rule that status does not travel between states, and the creamy layer
          income test. This checks those first, then builds the document list.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-category">
              Category applied for
            </label>
            <select
              id="ccc-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {CATEGORIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {!hasError && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{result.category.list}</p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-religion">
              Religion the applicant professes
            </label>
            <select
              id="ccc-religion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={religionId}
              onChange={(event) => setReligionId(event.target.value)}
            >
              {RELIGIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showIncome && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ccc-income">
                Parents&apos; annual income, excluding salary and agriculture (INR)
              </label>
              <input
                id="ccc-income"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10000"
                value={countedIncome}
                onChange={(event) => setCountedIncome(event.target.value)}
              />
            </div>
            <label
              className="flex min-h-11 items-center gap-3 self-end rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor="ccc-three"
            >
              <input
                id="ccc-three"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={sustainedThreeYears}
                onChange={(event) => setSustainedThreeYears(event.target.checked)}
              />
              <span>That level held for {CREAMY_LAYER_TEST_YEARS} consecutive years</span>
            </label>
          </div>
        )}

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which of these apply?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PROFILE_OPTIONS.map((option) => (
              <label
                key={option.key}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                htmlFor={`ccc-p-${option.key}`}
              >
                <input
                  id={`ccc-p-${option.key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={profile[option.key]}
                  onChange={() => toggleProfile(option.key)}
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
              File readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${readiness.percent}%`}
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
              {hasError ? "Fix the input above to see the checklist." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the caste certificate checklist"
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
            ["Category", hasError ? DASH : result.category.label],
            ["Bars that apply", hasError ? DASH : String(result.blockers.length)],
            ["Required documents", hasError ? DASH : String(result.requiredDocuments.length)],
            ["In hand", hasError ? DASH : String(readiness.have)],
            ["Still missing", hasError ? DASH : String(readiness.missing.length)],
            [
              "Creamy layer ceiling",
              hasError || !result.creamyLayer ? "Not applicable" : money(result.creamyLayer.limit),
            ],
            [
              "Headroom on counted income",
              hasError || !result.creamyLayer
                ? "Not applicable"
                : result.creamyLayer.overLimit
                  ? "None — at or above the ceiling"
                  : money(result.creamyLayer.headroom),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.blockers.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Bars to clear first</h2>
          <ul className="mt-3 grid gap-3">
            {result.blockers.map((bar) => (
              <li
                key={bar.id}
                className="flex items-start gap-3 rounded-lg bg-[var(--danger-soft)] p-3"
                role="alert"
              >
                <TriangleAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--danger)]">{bar.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--danger)]">{bar.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.notes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 grid gap-3">
            {result.notes.map((note) => (
              <li
                key={note.id}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{note.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    {note.detail}
                  </p>
                </div>
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
                  htmlFor={`ccc-d-${doc.id}`}
                >
                  <input
                    id={`ccc-d-${doc.id}`}
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
        Informational only, not legal advice. Only Parliament can add to or remove from the
        Presidential Lists under Articles 341(2) and 342(2). Forms, fees and scrutiny procedures are
        set by each state and change — check your own e-district portal, and consult a lawyer where a
        claim is disputed or a certificate has been cancelled.
      </p>
    </main>
  );
}
