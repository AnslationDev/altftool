"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileUser, RotateCcw } from "lucide-react";

import { ROUTES, SEVERITY_LABEL, assessResumeRisk, groupedCatalogue } from "../lib";

const DEFAULT_SELECTED = [
  "author-field",
  "creation-date",
  "filename-target-company",
  "graduation-dates-age",
];
const DEFAULT_ROUTE = "pdf-email";

const GROUPS = groupedCatalogue();

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const severityTone = (severity) => {
  if (severity === "high") return "text-[var(--danger)]";
  if (severity === "medium") return "text-[var(--warning)]";
  return "text-[var(--muted-foreground)]";
};

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [routeId, setRouteId] = useState(DEFAULT_ROUTE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessResumeRisk({ selectedIds: selected, routeId }),
    [selected, routeId],
  );
  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "CV metadata check",
      `Submission route: ${result.route.label}`,
      `Exposure to the reviewer: ${result.score}/100 (${result.band.label})`,
      `${result.surviving.length} of ${result.selectedCount} ticked signals reach them`,
      "",
      "Clean up before applying:",
      ...(result.actions.length
        ? result.actions.map(
            (action) => `- [${SEVERITY_LABEL[action.severity]}] ${action.label} — ${action.fix}`,
          )
        : ["- nothing"]),
    ].join("\n");
  }, [hasError, result]);

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
    setSelected(DEFAULT_SELECTED);
    setRouteId(DEFAULT_ROUTE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileUser className="h-4 w-4" aria-hidden="true" />
          Metadata literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Resume Metadata Risk Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Recruiters open Properties too. Tick what is true of your CV file, choose how you are
          submitting it, and see what a reviewer or application system can read beyond your words.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className="block text-sm font-semibold" htmlFor="cv-route">
          How are you sending it?
        </label>
        <select
          id="cv-route"
          className={`mt-2 ${SELECT_CLASS}`}
          value={routeId}
          onChange={(event) => {
            setRouteId(event.target.value);
            setCopied(false);
          }}
        >
          {ROUTES.map((route) => (
            <option key={route.id} value={route.id}>
              {route.label}
            </option>
          ))}
        </select>
        {!hasError && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.route.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Which of these describe your CV?</h2>
        <div className="mt-4 grid gap-5">
          {GROUPS.map((group) => (
            <fieldset key={group.name} className="border-0 p-0">
              <legend className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {group.name}
              </legend>
              <div className="mt-2 grid gap-2">
                {group.items.map((item) => {
                  const inputId = `cv-item-${item.id}`;
                  return (
                    <div
                      key={item.id}
                      className="flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        className="mt-1 h-5 w-5 flex-none accent-[var(--primary)]"
                        checked={selected.includes(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      <div className="min-w-0">
                        <label className="block text-sm font-semibold leading-6" htmlFor={inputId}>
                          {item.label}{" "}
                          <span className={`text-xs font-medium ${severityTone(item.severity)}`}>
                            · {SEVERITY_LABEL[item.severity]}
                          </span>
                        </label>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.reveals}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
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
              Visible to the reviewer
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "—" : `${result.band.label} · ${result.band.advice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy CV metadata summary"
              className={GHOST_BTN}
              disabled={hasError}
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
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Signals ticked", hasError ? "—" : String(result.selectedCount)],
            [
              "Reaching the reviewer",
              hasError ? "—" : `${result.surviving.length} of ${result.selectedCount}`,
            ],
            [
              "Removed by this route",
              hasError ? "—" : `${result.removed.length} (${result.removedShare}% of the risk weight)`,
            ],
            ["High-severity items left", hasError ? "—" : String(result.bySeverity.high)],
            [
              "Weight reaching them",
              hasError ? "—" : `${result.survivingWeight} of ${result.maxWeight} catalogue points`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={hasError ? "No score available" : `Exposure ${result.score} of 100`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: hasError ? "0%" : `${result.score}%` }}
            />
          </div>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fix these before your next application</h2>
          {result.actions.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--success)]">
              Nothing you ticked reaches the reviewer through this route.
            </p>
          ) : (
            <ol className="mt-3 grid gap-3">
              {result.actions.map((action) => (
                <li key={action.label} className="text-sm leading-6">
                  <span className={`font-semibold ${severityTone(action.severity)}`}>
                    {SEVERITY_LABEL[action.severity]}
                  </span>{" "}
                  <span className="font-semibold">{action.label}</span>
                  <span className="block text-[var(--muted-foreground)]">{action.fix}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational guidance only — no file is read or uploaded. Hiring rules on age, retention and
        candidate data differ by country; consult a qualified adviser about your specific situation.
      </p>
    </main>
  );
}
