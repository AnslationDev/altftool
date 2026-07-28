"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { BLOG_FEATURES, evaluateGdprChecklist } from "../lib";

const DEFAULT_FEATURES = BLOG_FEATURES.filter((feature) => feature.defaultOn).map(
  (feature) => feature.id,
);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";
const CHECKBOX =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const SEVERITY_LABEL = {
  critical: "Critical",
  important: "Important",
  "good-practice": "Good practice",
};

const SEVERITY_CLASS = {
  critical: "text-[var(--danger)]",
  important: "text-[var(--foreground)]",
  "good-practice": "text-[var(--muted-foreground)]",
};

const RISK_LABEL = { high: "High", medium: "Medium", low: "Low" };
const RISK_CLASS = {
  high: "text-[var(--danger)]",
  medium: "text-[var(--foreground)]",
  low: "text-[var(--success)]",
};

export default function ToolHome() {
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [doneIds, setDoneIds] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [copied, setCopied] = useState(false);

  const toggleFeature = (id) => {
    setFeatures((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
    setCopied(false);
  };

  const toggleDone = (id) => {
    setDoneIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
    setCopied(false);
  };

  const assessment = useMemo(() => evaluateGdprChecklist({ features, doneIds }), [features, doneIds]);

  const hasError = Boolean(assessment.error);

  const rows = hasError
    ? [
        ["Items that apply to your blog", DASH],
        ["Completed", DASH],
        ["Still outstanding", DASH],
        ["Critical items open", DASH],
        ["Important items open", DASH],
        ["Plain item count", DASH],
        ["Risk level", DASH],
      ]
    : [
        ["Items that apply to your blog", String(assessment.totalItems)],
        ["Completed", String(assessment.doneCount)],
        ["Still outstanding", String(assessment.outstandingCount)],
        ["Critical items open", String(assessment.criticalOutstanding.length)],
        ["Important items open", String(assessment.importantOutstanding.length)],
        ["Plain item count", `${assessment.plainPercent}% done`],
        ["Risk level", RISK_LABEL[assessment.risk]],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GDPR Compliance Checklist for Blogs",
      `Weighted score: ${assessment.weightedScore}% · Risk: ${RISK_LABEL[assessment.risk]}`,
      `${assessment.doneCount} of ${assessment.totalItems} applicable items complete`,
      "",
      "Outstanding:",
      ...assessment.applicable
        .filter((item) => !item.done)
        .map((item) => `[${SEVERITY_LABEL[item.severity]}] ${item.title} (${item.reference})`),
    ].join("\n");
  }, [hasError, assessment]);

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
    setFeatures(DEFAULT_FEATURES);
    setDoneIds([]);
    setSeverityFilter("all");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Compliance checklists
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GDPR Compliance Checklist for Blogs
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what your blog actually does and get only the obligations that follow from it, each with
          the GDPR or ePrivacy provision it comes from.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What does your blog use?</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {BLOG_FEATURES.map((feature) => (
            <label key={feature.id} className={CHECK_ROW} htmlFor={`gdpr-feat-${feature.id}`}>
              <input
                id={`gdpr-feat-${feature.id}`}
                type="checkbox"
                className={CHECKBOX}
                checked={features.includes(feature.id)}
                onChange={() => toggleFeature(feature.id)}
              />
              <span>{feature.label}</span>
            </label>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {assessment.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Weighted compliance score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${assessment.weightedScore}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? (
                "Select at least one feature to see the checklist."
              ) : (
                <>
                  Risk level:{" "}
                  <span className={`font-semibold ${RISK_CLASS[assessment.risk]}`}>
                    {RISK_LABEL[assessment.risk]}
                  </span>{" "}
                  · critical items count triple, good practice counts once
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the outstanding checklist items"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy to-do list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${assessment.weightedScore} percent of the weighted checklist is complete`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${assessment.weightedScore}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-base font-semibold">Your checklist</h2>
            <div className="w-full sm:w-64">
              <label className="block text-sm font-semibold text-[var(--foreground)]" htmlFor="gdpr-filter">
                Show
              </label>
              <select
                id="gdpr-filter"
                className={`mt-2 ${INPUT_CLASS}`}
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
              >
                <option value="all">Everything</option>
                <option value="critical">Critical only</option>
                <option value="important">Important only</option>
                <option value="outstanding">Outstanding only</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-6">
            {assessment.groups.map((group) => {
              const visible = group.items.filter((item) => {
                if (severityFilter === "all") return true;
                if (severityFilter === "outstanding") return !item.done;
                return item.severity === severityFilter;
              });
              if (visible.length === 0) return null;
              return (
                <div key={group.id}>
                  <h3 className="text-sm font-semibold">
                    {group.label}{" "}
                    <span className="font-normal text-[var(--muted-foreground)]">
                      ({group.done}/{group.total})
                    </span>
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {visible.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            id={`gdpr-item-${item.id}`}
                            type="checkbox"
                            className={`mt-1 ${CHECKBOX}`}
                            checked={item.done}
                            onChange={() => toggleDone(item.id)}
                          />
                          <div className="min-w-0">
                            <label htmlFor={`gdpr-item-${item.id}`} className="block text-sm font-semibold">
                              {item.title}
                            </label>
                            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                              {item.detail}
                            </p>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                              <span className={`font-semibold ${SEVERITY_CLASS[item.severity]}`}>
                                {SEVERITY_LABEL[item.severity]}
                              </span>{" "}
                              · {item.reference}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {assessment.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational self-assessment, not legal advice or a certification. National rules layer on top
        of the GDPR — the age of consent for children and cookie enforcement both vary by member state —
        and the UK GDPR applies separately. Take professional advice before relying on this for a
        business.
      </p>
    </main>
  );
}
