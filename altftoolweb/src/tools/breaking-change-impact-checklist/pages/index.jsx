"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { AUDIENCES, CHANGE_TYPES, MITIGATIONS, SURFACES, buildChecklist } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  types: { removal: true },
  surfaces: { publicApi: true },
  audienceId: "public",
  mitigations: {},
};

const DASH = "—";
const PHASES = ["Before", "Release", "After"];

function CheckGroup({ legend, options, values, onToggle, idPrefix }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[var(--foreground)]">{legend}</legend>
      <div className="mt-2 space-y-1">
        {options.map((option) => (
          <label
            key={option.id}
            htmlFor={`${idPrefix}-${option.id}`}
            className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition hover:bg-[var(--muted)]"
          >
            <input
              id={`${idPrefix}-${option.id}`}
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={values[option.id] === true}
              onChange={() => onToggle(option.id)}
            />
            <span className="text-sm leading-6">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ToolHome() {
  const [types, setTypes] = useState(DEFAULTS.types);
  const [surfaces, setSurfaces] = useState(DEFAULTS.surfaces);
  const [audienceId, setAudienceId] = useState(DEFAULTS.audienceId);
  const [mitigations, setMitigations] = useState(DEFAULTS.mitigations);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildChecklist({ types, surfaces, audienceId, mitigations }),
    [types, surfaces, audienceId, mitigations],
  );

  const hasError = Boolean(result.error);

  const toggleIn = (setter) => (id) => setter((previous) => ({ ...previous, [id]: !previous[id] }));

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTypes(DEFAULTS.types);
    setSurfaces(DEFAULTS.surfaces);
    setAudienceId(DEFAULTS.audienceId);
    setMitigations(DEFAULTS.mitigations);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Risk score", DASH],
        ["Risk level", DASH],
        ["Required version bump", DASH],
      ]
    : [
        ["Risk score", `${result.riskScore} / 100`],
        ["Risk level", result.riskLevel],
        ["Required version bump", `${result.requiredBump} (SemVer item 8)`],
        ["Checklist items", String(result.items.length)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Versioning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Breaking Change Impact Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe the breaking change you plan to ship and get a phased consumer-impact checklist,
          a transparent risk score and the SemVer bump it requires.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-6 sm:grid-cols-2">
          <CheckGroup
            legend="What kind of change is it?"
            options={CHANGE_TYPES}
            values={types}
            onToggle={toggleIn(setTypes)}
            idPrefix="bc-type"
          />
          <div className="space-y-6">
            <CheckGroup
              legend="Which surfaces does it touch?"
              options={SURFACES}
              values={surfaces}
              onToggle={toggleIn(setSurfaces)}
              idPrefix="bc-surface"
            />
            <div>
              <label className={LABEL_CLASS} htmlFor="bc-audience">
                Who consumes this surface?
              </label>
              <select
                id="bc-audience"
                className={`mt-2 ${INPUT_CLASS}`}
                value={audienceId}
                onChange={(event) => setAudienceId(event.target.value)}
              >
                {AUDIENCES.map((audience) => (
                  <option key={audience.id} value={audience.id}>
                    {audience.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <CheckGroup
            legend="Mitigations already in place"
            options={MITIGATIONS}
            values={mitigations}
            onToggle={toggleIn(setMitigations)}
            idPrefix="bc-mitigation"
          />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Consumer impact risk
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.riskLevel} — ${result.riskScore}/100`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the checklist." : result.riskNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the checklist as Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError
          ? PHASES.map((phase) => {
              const phaseItems = result.items.filter((item) => item.phase === phase);
              if (phaseItems.length === 0) return null;
              return (
                <div key={phase} className="mt-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
                    {phase}
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {phaseItems.map((item) => (
                      <li key={item.text} className="flex items-start gap-2 text-sm leading-6">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]"
                        />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The version-bump rule comes from SemVer 2.0.0 (item 8: incompatible changes require a major
        release). The risk score is this tool&apos;s own transparent weighting of change type,
        surface count, audience and mitigations — use it to compare options, not as a guarantee.
      </p>
    </main>
  );
}
