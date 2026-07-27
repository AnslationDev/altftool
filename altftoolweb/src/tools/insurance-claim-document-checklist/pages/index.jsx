"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  CLAIM_SCENARIOS,
  CONDITION_LABELS,
  SECTION_45_YEARS,
  buildChecklist,
  conditionsFor,
  settlementDeadline,
} from "../lib";

const DASH = "—";
const DEFAULT_SCENARIO = "health-reimbursement";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO);
  const [conditions, setConditions] = useState({ prePost: true });
  const [submitted, setSubmitted] = useState("");
  const [investigated, setInvestigated] = useState(false);
  const [ticked, setTicked] = useState({});
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(() => buildChecklist(scenarioId, conditions), [scenarioId, conditions]);
  const conditionKeys = useMemo(() => conditionsFor(scenarioId), [scenarioId]);

  const deadline = useMemo(() => {
    if (!submitted) return null;
    return settlementDeadline(submitted, scenarioId, investigated);
  }, [submitted, scenarioId, investigated]);

  const ok = !checklist.error;
  const items = ok ? checklist.items : [];

  const doneCount = useMemo(
    () => items.filter((item) => ticked[`${scenarioId}::${item.label}`]).length,
    [items, ticked, scenarioId],
  );
  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      `Claim document checklist — ${checklist.label}`,
      `Documents to collect: ${checklist.total}`,
      "",
      ...items.map(
        (item, index) =>
          `${index + 1}. [${ticked[`${scenarioId}::${item.label}`] ? "x" : " "}] ${item.label}${item.note ? ` — ${item.note}` : ""}`,
      ),
      "",
      `Intimation: ${checklist.intimation}`,
    ];
    if (deadline && !deadline.error) {
      lines.push(`Last document submitted ${deadline.submitted} — settlement due by ${deadline.deadline} (${deadline.basis}).`);
    }
    return lines.join("\n");
  }, [ok, checklist, items, ticked, scenarioId, deadline]);

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
    setScenarioId(DEFAULT_SCENARIO);
    setConditions({ prePost: true });
    setSubmitted("");
    setInvestigated(false);
    setTicked({});
    setCopied(false);
  };

  const toggleCondition = (key) =>
    setConditions((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleItem = (label) =>
    setTicked((prev) => {
      const key = `${scenarioId}::${label}`;
      return { ...prev, [key]: !prev[key] };
    });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Insurance claims
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Claim Settlement Document Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your claim type, answer a few yes-or-no questions, and get the exact paperwork the
          insurer will ask for — plus the date by which the claim must be settled or rejected.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="claim-type">
              Claim type
            </label>
            <select
              id="claim-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scenarioId}
              onChange={(event) => {
                setScenarioId(event.target.value);
                setConditions({});
              }}
            >
              {Object.entries(CLAIM_SCENARIOS).map(([id, scenario]) => (
                <option key={id} value={id}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="claim-submitted">
              Date the last document was submitted
            </label>
            <input
              id="claim-submitted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={submitted}
              onChange={(event) => setSubmitted(event.target.value)}
            />
          </div>
        </div>

        {conditionKeys.length > 0 ? (
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Does any of this apply?</legend>
            <div className="mt-2 grid gap-1">
              {conditionKeys.map((key) => (
                <label
                  key={key}
                  htmlFor={`cond-${key}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    id={`cond-${key}`}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={Boolean(conditions[key])}
                    onChange={() => toggleCondition(key)}
                  />
                  <span>{CONDITION_LABELS[key]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {ok && checklist.category === "life" ? (
          <label
            htmlFor="claim-investigated"
            className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              id="claim-investigated"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={investigated}
              onChange={(event) => setInvestigated(event.target.checked)}
            />
            <span>The insurer has ordered an investigation into this claim</span>
          </label>
        ) : null}
      </section>

      {checklist.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {checklist.error}
        </p>
      ) : null}

      {deadline && deadline.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {deadline.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Documents to collect
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? checklist.total : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${checklist.baseCount} always needed · ${checklist.extraCount} extra for your situation · ${doneCount} ticked off`
                : "Choose a claim type to build the list."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy claim document checklist"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={`${doneCount} of ${items.length} documents ready`}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["When to intimate the claim", ok ? checklist.intimation : DASH],
            [
              "Settlement deadline for the insurer",
              deadline && !deadline.error
                ? `${deadline.deadline} (${deadline.basis})`
                : ok
                  ? `${checklist.settlementDays} days from the last document — add a date above for the exact day`
                  : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:max-w-[60%] sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your checklist</h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {items.map((item) => {
              const id = `doc-${item.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
              const isTicked = Boolean(ticked[`${scenarioId}::${item.label}`]);
              return (
                <li key={item.label} className="py-2">
                  <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
                    <input
                      id={id}
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                      checked={isTicked}
                      onChange={() => toggleItem(item.label)}
                    />
                    <span>
                      <span
                        className={`font-medium ${isTicked ? "text-[var(--muted-foreground)] line-through" : ""}`}
                      >
                        {item.label}
                      </span>
                      {item.note ? (
                        <span className="block text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.note}
                        </span>
                      ) : null}
                      {item.source !== "base" ? (
                        <span className="mt-1 inline-block rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                          Because: {CONDITION_LABELS[item.source]}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational checklist, not legal advice. Individual insurers add their own forms, and a
        life policy cannot be questioned after {SECTION_45_YEARS} years under section 45 of the
        Insurance Act 1938. Always confirm the list with your insurer or TPA, keep photocopies of
        everything you hand over, and get a dated acknowledgement.
      </p>
    </main>
  );
}
