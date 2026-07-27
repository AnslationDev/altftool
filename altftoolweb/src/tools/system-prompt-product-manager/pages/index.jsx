"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  buildPmPrompt,
  DEFAULT_TOKEN_BUDGET,
  DELIVERABLE_OPTIONS,
  PRIORITISATION_FRAMEWORKS,
  RIGOR_RULES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const DELIVERABLE_LABELS = {
  prd: "Product specs / PRDs",
  userStories: "User stories (INVEST + Gherkin)",
  tradeoffs: "Tradeoff analyses",
  prioritisation: "Backlog prioritisation",
  okrs: "OKRs",
  releaseNotes: "Release notes and updates",
};

const RULE_LABELS = {
  evidenceFirst: "Label every assumption",
  askDontInvent: "Never invent data or quotes",
  problemFirst: "Problem before solution",
  nonGoals: "Every spec has non-goals",
  measurableSuccess: "Success is a number with a date",
  smallestSlice: "Smallest slice first",
  oneRecommendation: "End with one recommendation",
};

const DEFAULTS = {
  product: "a B2B invoicing SaaS for freelancers and small agencies",
  users: "freelancers, studio owners and their bookkeepers",
  businessContext: "Seed stage, 1,400 paying workspaces, competing with spreadsheet workflows more than with rivals.",
  metricsNotes: "activation (first invoice sent within 7 days), weekly invoices per workspace, logo churn",
  styleNotes: "",
  deliverables: ["prd", "userStories", "tradeoffs", "prioritisation"],
  framework: "rice",
  rigorRules: ["askDontInvent", "evidenceFirst", "problemFirst", "nonGoals", "measurableSuccess"],
  tokenBudget: String(DEFAULT_TOKEN_BUDGET),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggle = (key, option) => () => {
    setForm((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(option) ? list.filter((item) => item !== option) : [...list, option],
      };
    });
  };

  const result = useMemo(
    () => buildPmPrompt({ ...form, tokenBudget: Number(form.tokenBudget) }),
    [form],
  );
  const failed = Boolean(result.error);

  const copyPrompt = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          System prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Product Manager System Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Configure a PM assistant that writes specs with non-goals, INVEST user stories with
          Given/When/Then criteria, honest tradeoff analyses and RICE-scored priorities — and never
          invents user data.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Product context</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pm-product">
              Product (required)
            </label>
            <input id="pm-product" className={`mt-2 ${INPUT_CLASS}`} value={form.product} onChange={set("product")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-users">
              Users
            </label>
            <input id="pm-users" className={`mt-2 ${INPUT_CLASS}`} value={form.users} onChange={set("users")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-metrics">
              Metrics that matter
            </label>
            <input id="pm-metrics" className={`mt-2 ${INPUT_CLASS}`} value={form.metricsNotes} onChange={set("metricsNotes")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pm-biz">
              Business context
            </label>
            <textarea
              id="pm-biz"
              rows={2}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.businessContext}
              onChange={set("businessContext")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Deliverables and rules</h2>

        <p className={`mt-3 ${LABEL_CLASS}`} id="pm-deliv-label">
          Deliverables
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="pm-deliv-label">
          {Object.keys(DELIVERABLE_OPTIONS).map((key) => (
            <label key={key} htmlFor={`pm-deliv-${key}`} className={CHECK_CLASS}>
              <input
                id={`pm-deliv-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.deliverables.includes(key)}
                onChange={toggle("deliverables", key)}
              />
              {DELIVERABLE_LABELS[key]}
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-framework">
              Prioritisation framework
            </label>
            <select id="pm-framework" className={`mt-2 ${INPUT_CLASS}`} value={form.framework} onChange={set("framework")}>
              {Object.entries(PRIORITISATION_FRAMEWORKS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Used when backlog prioritisation is enabled.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-budget">
              Token budget for the system prompt
            </label>
            <input
              id="pm-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={form.tokenBudget}
              onChange={set("tokenBudget")}
            />
          </div>
        </div>

        <p className={`mt-4 ${LABEL_CLASS}`} id="pm-rules-label">
          Working rules
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="pm-rules-label">
          {Object.keys(RIGOR_RULES).map((key) => (
            <label key={key} htmlFor={`pm-rule-${key}`} className={CHECK_CLASS}>
              <input
                id={`pm-rule-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.rigorRules.includes(key)}
                onChange={toggle("rigorRules", key)}
              />
              {RULE_LABELS[key]}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="pm-style">
            Extra writing rules (optional)
          </label>
          <textarea
            id="pm-style"
            rows={2}
            className={`mt-2 ${TEXTAREA_CLASS}`}
            value={form.styleNotes}
            onChange={set("styleNotes")}
            placeholder="e.g. Specs are one page max. British English."
          />
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated prompt size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `~${NUM.format(result.tokens.tokens)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a result."
                : `tokens · ${NUM.format(result.tokens.chars)} characters · ${result.completeness}% of recommended fields filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated PM assistant system prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sections in the prompt", failed ? DASH : NUM.format(result.sections.length)],
            ["Deliverables included", failed ? DASH : NUM.format(form.deliverables.length)],
            ["Working rules included", failed ? DASH : NUM.format(form.rigorRules.length)],
            [
              "Prioritisation framework",
              failed
                ? DASH
                : form.deliverables.includes("prioritisation")
                  ? PRIORITISATION_FRAMEWORKS[result.frameworkKey].label
                  : "not enabled",
            ],
            ["Warnings", failed ? DASH : NUM.format(result.warnings.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Gaps worth closing</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your system prompt</h2>
          <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {result.prompt}
          </pre>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token counts use the rough 4-characters-per-token rule; your provider&apos;s tokeniser is
        the authority. The prompt is assembled entirely in your browser.
      </p>
    </main>
  );
}
