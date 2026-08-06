"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import {
  FEATURE_FLAGS,
  PLATFORMS,
  buildChecklist,
  scoreChecklist,
  toMarkdown,
} from "../lib";

const PLATFORM_LABELS = {
  web: "Web app / website",
  ios: "iOS app",
  android: "Android app",
  cross: "Cross-platform (web + mobile)",
};

const FLAG_LABELS = {
  hasDesignSystem: "Uses a design system / token library",
  hasMotion: "Includes animation or gestures",
  hasForms: "Includes forms or input validation",
  hasDarkMode: "Ships a dark theme",
  isLocalized: "Localised into more than one language",
  hasDataViews: "Has lists, tables or charts",
  hasA11yTarget: "Has an accessibility target (WCAG AA)",
};

const DEFAULT_FLAGS = {
  hasDesignSystem: true,
  hasMotion: false,
  hasForms: true,
  hasDarkMode: true,
  isLocalized: false,
  hasDataViews: true,
  hasA11yTarget: true,
};

const SEVERITY_LABEL = { blocker: "Blocker", standard: "Expected", nice: "Nice to have" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [platform, setPlatform] = useState("web");
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [checked, setChecked] = useState([]);
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(
    () => buildChecklist({ platform, ...flags }),
    [platform, flags],
  );

  const score = useMemo(() => {
    if (checklist.error) return { error: checklist.error };
    return scoreChecklist(checklist.items, checked);
  }, [checklist, checked]);

  const markdown = useMemo(() => {
    if (checklist.error) return "";
    return toMarkdown(checklist.sections, checked, "Design handoff checklist");
  }, [checklist, checked]);

  const error = checklist.error || score.error;
  const hasResult = !error;

  const toggleFlag = (flag) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
    setCopied(false);
  };

  const toggleItem = (id) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
    setCopied(false);
  };

  const checkAll = () => {
    if (checklist.error) return;
    setChecked(checklist.items.map((item) => item.id));
    setCopied(false);
  };

  const copyResult = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the checklist? This clears your project configuration and all ticks and cannot be undone.",
      )
    ) {
      return;
    }
    setPlatform("web");
    setFlags(DEFAULT_FLAGS);
    setChecked([]);
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Design handoff
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Design Handoff Checklist Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your platform and what the project actually contains. You get only the checks that
          apply, weighted so blockers count more than nice-to-haves.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="handoff-platform">
              Platform
            </label>
            <select
              id="handoff-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platform}
              onChange={(event) => {
                setPlatform(event.target.value);
                setCopied(false);
              }}
            >
              {PLATFORMS.map((value) => (
                <option key={value} value={value}>
                  {PLATFORM_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What does this handoff include?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FEATURE_FLAGS.map((flag) => (
              <label
                key={flag}
                htmlFor={`flag-${flag}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`flag-${flag}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={flags[flag]}
                  onChange={() => toggleFlag(flag)}
                />
                <span>{FLAG_LABELS[flag]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section aria-live="polite" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Handoff readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? `${PCT.format(score.percent)}%` : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasResult
                ? `${score.readiness} · ${score.done} of ${score.total} items ticked`
                : "Fix the input above to see a score"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the handoff checklist as markdown"
              className={GHOST_BTN}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Checklist items generated", hasResult ? String(score.total) : dash],
            ["Ticked", hasResult ? String(score.done) : dash],
            ["Still open", hasResult ? String(score.remaining) : dash],
            [
              "Blockers cleared",
              hasResult ? `${score.blockersDone} of ${score.blockersTotal}` : dash,
            ],
            ["Unweighted completion", hasResult ? `${PCT.format(score.simplePercent)}%` : dash],
            ["Sections in scope", hasResult ? String(checklist.sections.length) : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasResult ? (
          <>
            <div className="mt-5">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Weighted readiness ${PCT.format(score.percent)} percent`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, score.percent))}%` }}
                />
              </div>
            </div>
            {score.openBlockers.length > 0 ? (
              <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {score.openBlockers.length} blocker
                {score.openBlockers.length === 1 ? "" : "s"} still open — development will stall on
                these first.
              </p>
            ) : (
              <p className="mt-4 text-sm font-medium text-[var(--success)]">
                All blockers cleared.
              </p>
            )}
          </>
        ) : null}
      </section>

      {hasResult ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Your checklist</h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={checkAll} className={GHOST_BTN}>
                Tick everything
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm("Clear all ticks? This will untick every checklist item and cannot be undone.")) {
                    return;
                  }
                  setChecked([]);
                  setCopied(false);
                }}
                className={GHOST_BTN}
              >
                Clear ticks
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-6">
            {checklist.sections.map((section) => (
              <div key={section.id}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {section.title}
                </h3>
                <ul className="mt-2 space-y-2">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <label
                        htmlFor={`item-${item.id}`}
                        className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                      >
                        <input
                          id={`item-${item.id}`}
                          type="checkbox"
                          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                          checked={checked.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                        />
                        <span className="min-w-0">
                          <span className="block leading-6">{item.text}</span>
                          <span
                            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                              item.severity === "blocker"
                                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                            }`}
                          >
                            {SEVERITY_LABEL[item.severity]}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The generated list is a starting point drawn from common handoff practice — add the items
        your team's own definition of done requires.
      </p>
    </main>
  );
}
