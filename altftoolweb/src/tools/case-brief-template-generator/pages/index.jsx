"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gavel, RotateCcw } from "lucide-react";

import {
  BRIEF_LENGTH_TARGET,
  BRIEF_SECTIONS,
  CITATION_STYLES,
  DISPOSITION_OPTIONS,
  FORMAT_STYLES,
  buildCaseBrief,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  formatStyle: "firac",
  citationStyle: "bluebook",
  caseName: "Brown v. Board of Education",
  volume: "347",
  reporter: "U.S.",
  page: "483",
  court: "U.S.",
  year: "1954",
  judges: "Warren, C.J., for a unanimous Court",
  procedural:
    "Four consolidated cases from Kansas, South Carolina, Virginia and Delaware. In each, Black schoolchildren sued for admission to schools their districts reserved for white children. Three-judge district courts denied relief on the authority of Plessy v. Ferguson; the Delaware court ordered admission. The cases came up on direct appeal and were argued twice.",
  facts:
    "State laws either required or permitted racial segregation in public schools. The plaintiffs were denied admission to the schools attended by white children in their own neighbourhoods. The district courts found the segregated schools substantially equal, or being equalised, in buildings, curricula, teacher qualifications and salaries, so the case turned on segregation itself rather than on unequal resources.",
  issue:
    "Does segregation of children in public schools solely on the basis of race, where the physical facilities and other tangible factors are equal, deprive the children of the minority group of the equal protection of the laws?",
  rule:
    "Fourteenth Amendment, Equal Protection Clause. Education is a state function that must be made available to all on equal terms, and equality is measured by the effect of the state's classification, not only by tangible resources.",
  holding:
    "Yes. In the field of public education the doctrine of separate but equal has no place; separate educational facilities are inherently unequal, so segregation by law deprives the plaintiffs of equal protection.",
  reasoning:
    "The Court found the history of the Fourteenth Amendment inconclusive on public schools and refused to decide the question by reference to 1868 conditions. Education is now the most important function of state and local government and the foundation of citizenship. Segregating children by race generates a feeling of inferiority as to their standing in the community that may affect their motivation to learn, an effect the Kansas court itself had found. Any language in Plessy v. Ferguson contrary to this finding is rejected.",
  disposition: "reversed",
  dispositionCustom: "",
  separate:
    "None. The opinion was unanimous, and the remedy was reserved for reargument, decided the following year in Brown II.",
  analysis:
    "The holding is confined on its face to public education, but later per curiam orders extended it to other public facilities. Note that the Court decided on the effect of the classification rather than on legislative intent — the analytical move that carries the case.",
  briefedBy: "",
  includeOptional: true,
};

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const brief = useMemo(() => buildCaseBrief(state), [state]);

  const copyResult = async () => {
    if (brief.error) return;
    try {
      await navigator.clipboard.writeText(brief.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(DEFAULTS);
    setCopied(false);
  };

  const activeFormat = FORMAT_STYLES.find((item) => item.id === state.formatStyle);
  const needsReporter = state.citationStyle === "bluebook" || state.citationStyle === "scc";
  const needsCourtCode = state.citationStyle === "neutral";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gavel className="h-4 w-4" aria-hidden="true" />
          Legal writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Case Brief Template Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the sections once and get a clean, consistently ordered case brief with a
          formatted citation, a completeness check and a one-page length check.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Format and citation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="cbtg-format">
              Analytical framework
            </label>
            <select id="cbtg-format" className={`mt-2 ${INPUT}`} value={state.formatStyle} onChange={set("formatStyle")}>
              {FORMAT_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activeFormat ? (
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{activeFormat.note}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL} htmlFor="cbtg-citestyle">
              Citation style
            </label>
            <select
              id="cbtg-citestyle"
              className={`mt-2 ${INPUT}`}
              value={state.citationStyle}
              onChange={set("citationStyle")}
            >
              {CITATION_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="cbtg-name">
            Case name
          </label>
          <input id="cbtg-name" className={`mt-2 ${INPUT}`} type="text" value={state.caseName} onChange={set("caseName")} />
        </div>

        {state.citationStyle !== "none" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="cbtg-year">
                Year
              </label>
              <input id="cbtg-year" className={`mt-2 ${INPUT}`} type="text" inputMode="numeric" value={state.year} onChange={set("year")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="cbtg-court">
                {needsCourtCode ? "Court code (e.g. UKSC, DelHC)" : "Court (e.g. 5th Cir., SC)"}
              </label>
              <input id="cbtg-court" className={`mt-2 ${INPUT}`} type="text" value={state.court} onChange={set("court")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="cbtg-volume">
                {needsCourtCode ? "Volume (unused for neutral citations)" : "Volume"}
              </label>
              <input id="cbtg-volume" className={`mt-2 ${INPUT}`} type="text" inputMode="numeric" value={state.volume} onChange={set("volume")} />
            </div>
            {needsReporter ? (
              <div>
                <label className={LABEL} htmlFor="cbtg-reporter">
                  Reporter (U.S., F.3d, SCC, AIR)
                </label>
                <input id="cbtg-reporter" className={`mt-2 ${INPUT}`} type="text" value={state.reporter} onChange={set("reporter")} />
              </div>
            ) : null}
            <div>
              <label className={LABEL} htmlFor="cbtg-page">
                {needsCourtCode ? "Judgment number" : "First page"}
              </label>
              <input id="cbtg-page" className={`mt-2 ${INPUT}`} type="text" inputMode="numeric" value={state.page} onChange={set("page")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="cbtg-judges">
                Bench / judges (optional)
              </label>
              <input id="cbtg-judges" className={`mt-2 ${INPUT}`} type="text" value={state.judges} onChange={set("judges")} />
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The brief</h2>

        <div className="mt-4">
          <label className={LABEL} htmlFor="cbtg-procedural">
            Procedural history
          </label>
          <textarea id="cbtg-procedural" rows={3} className={`mt-2 ${TEXTAREA}`} value={state.procedural} onChange={set("procedural")} />
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="cbtg-facts">
            Material facts
          </label>
          <textarea id="cbtg-facts" rows={4} className={`mt-2 ${TEXTAREA}`} value={state.facts} onChange={set("facts")} />
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="cbtg-issue">
            Issue presented (phrase it as a question)
          </label>
          <textarea id="cbtg-issue" rows={3} className={`mt-2 ${TEXTAREA}`} value={state.issue} onChange={set("issue")} />
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="cbtg-rule">
            Rule of law
          </label>
          <textarea id="cbtg-rule" rows={3} className={`mt-2 ${TEXTAREA}`} value={state.rule} onChange={set("rule")} />
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="cbtg-holding">
            Holding
          </label>
          <textarea id="cbtg-holding" rows={3} className={`mt-2 ${TEXTAREA}`} value={state.holding} onChange={set("holding")} />
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="cbtg-reasoning">
            Reasoning / application
          </label>
          <textarea id="cbtg-reasoning" rows={5} className={`mt-2 ${TEXTAREA}`} value={state.reasoning} onChange={set("reasoning")} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="cbtg-disposition">
              Disposition
            </label>
            <select id="cbtg-disposition" className={`mt-2 ${INPUT}`} value={state.disposition} onChange={set("disposition")}>
              {DISPOSITION_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {state.disposition === "custom" ? (
            <div>
              <label className={LABEL} htmlFor="cbtg-disposition-custom">
                What the court ordered
              </label>
              <input
                id="cbtg-disposition-custom"
                className={`mt-2 ${INPUT}`}
                type="text"
                value={state.dispositionCustom}
                onChange={set("dispositionCustom")}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL} htmlFor="cbtg-briefed-by">
              Briefed by (optional)
            </label>
            <input id="cbtg-briefed-by" className={`mt-2 ${INPUT}`} type="text" value={state.briefedBy} onChange={set("briefedBy")} />
          </div>
        </div>

        <label className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm" htmlFor="cbtg-optional">
          <input
            id="cbtg-optional"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={state.includeOptional}
            onChange={set("includeOptional")}
          />
          Include separate opinions and notes sections
        </label>

        {state.includeOptional ? (
          <>
            <div className="mt-4">
              <label className={LABEL} htmlFor="cbtg-separate">
                Concurring and dissenting opinions
              </label>
              <textarea id="cbtg-separate" rows={3} className={`mt-2 ${TEXTAREA}`} value={state.separate} onChange={set("separate")} />
            </div>
            <div className="mt-4">
              <label className={LABEL} htmlFor="cbtg-analysis">
                Notes and significance
              </label>
              <textarea id="cbtg-analysis" rows={3} className={`mt-2 ${TEXTAREA}`} value={state.analysis} onChange={set("analysis")} />
            </div>
          </>
        ) : null}
      </section>

      {brief.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {brief.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Required sections complete
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {brief.error ? DASH : `${NUM.format(brief.completeness)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {brief.error
                ? "Fix the inputs above to build the brief."
                : `${brief.filledRequired} of ${brief.requiredCount} required sections filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the case brief"
              className={GHOST_BTN}
              disabled={Boolean(brief.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy brief"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Citation", brief.error ? DASH : brief.citation],
            ["Framework", brief.error ? DASH : brief.formatLabel],
            ["Word count", brief.error ? DASH : NUM.format(brief.wordCount)],
            [
              "One-page range",
              brief.error ? DASH : `${BRIEF_LENGTH_TARGET.min}-${BRIEF_LENGTH_TARGET.max} words`,
            ],
            [
              "Issue phrased as a question",
              brief.error ? DASH : brief.issueIsQuestion ? "Yes" : "No — end it with a question mark",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        {!brief.error ? (
          <p
            className={`mt-4 text-xs leading-5 ${
              brief.lengthVerdict.status === "ok" ? "text-[var(--success)]" : "text-[var(--danger)]"
            }`}
          >
            {brief.lengthVerdict.message}
          </p>
        ) : null}

        {!brief.error && brief.missingRequired.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-[var(--danger)]">
            {brief.missingRequired.map((section) => (
              <li key={section.id}>Still empty: {section.label} — {section.purpose}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {!brief.error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your brief</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {brief.text}
            </pre>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What each section is for</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {BRIEF_SECTIONS.map((section) => (
            <li key={section.id} className="flex flex-col gap-0.5">
              <span className="font-semibold">
                {section.label}
                {section.required ? "" : " (optional)"}
              </span>
              <span className="text-[var(--muted-foreground)]">{section.purpose}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A study aid, not legal advice. Citation conventions differ by jurisdiction and by course —
        check your faculty style guide, and read the judgment itself before relying on any brief.
      </p>
    </main>
  );
}
