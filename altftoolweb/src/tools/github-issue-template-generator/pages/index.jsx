"use client";

import { useMemo, useState } from "react";
import { Check, CircleDot, Copy, RotateCcw } from "lucide-react";

import { TEMPLATE_PRESETS, buildIssueForm } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const presetDefaults = (id) => {
  const p = TEMPLATE_PRESETS.find((t) => t.id === id) ?? TEMPLATE_PRESETS[0];
  return {
    name: p.defaults.name,
    description: p.defaults.description,
    titlePrefix: p.defaults.titlePrefix,
    labels: p.defaults.labels,
  };
};

const DEFAULT_OPTIONS = {
  includeVersion: true,
  includeEnvironment: true,
  includeLogs: true,
  requireSearch: true,
};

export default function ToolHome() {
  const [preset, setPreset] = useState("bug");
  const [fields, setFields] = useState(presetDefaults("bug"));
  const [assignees, setAssignees] = useState("");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildIssueForm({
        preset,
        name: fields.name,
        description: fields.description,
        titlePrefix: fields.titlePrefix,
        labels: fields.labels,
        assignees,
        options,
      }),
    [preset, fields, assignees, options],
  );

  const hasError = Boolean(result.error);

  const switchPreset = (id) => {
    setPreset(id);
    setFields(presetDefaults(id));
  };

  const setField = (key) => (event) =>
    setFields((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleOption = (key) => () =>
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPreset("bug");
    setFields(presetDefaults("bug"));
    setAssignees("");
    setOptions(DEFAULT_OPTIONS);
    setCopied(false);
  };

  const bugToggles = [
    ["requireSearch", "Require a duplicate-search checkbox"],
    ["includeVersion", "Ask for the affected version"],
    ["includeEnvironment", "Ask for operating system (dropdown)"],
    ["includeLogs", "Ask for log output (shell-rendered)"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CircleDot className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GitHub Issue Template Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build issue form YAML for bug reports, feature requests and support
          questions — structured fields, required validation and labels, ready for
          .github/ISSUE_TEMPLATE/.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">Template type</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {TEMPLATE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => switchPreset(p.id)}
                aria-pressed={preset === p.id}
                className={
                  preset === p.id
                    ? PRIMARY_BTN
                    : GHOST_BTN
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ift-name">
              Template name
            </label>
            <input
              id="ift-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fields.name}
              onChange={setField("name")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ift-title">
              Default title prefix
            </label>
            <input
              id="ift-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fields.titlePrefix}
              onChange={setField("titlePrefix")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ift-desc">
              Template description (shown in the issue chooser)
            </label>
            <input
              id="ift-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fields.description}
              onChange={setField("description")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ift-labels">
              Labels (comma-separated)
            </label>
            <input
              id="ift-labels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fields.labels}
              onChange={setField("labels")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ift-assignees">
              Assignees (comma-separated usernames)
            </label>
            <input
              id="ift-assignees"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="octocat"
              value={assignees}
              onChange={(event) => setAssignees(event.target.value)}
            />
          </div>
        </div>

        {preset === "bug" ? (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">Bug report fields</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {bugToggles.map(([key, label]) => (
                <label
                  key={key}
                  htmlFor={`ift-${key}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    id={`ift-${key}`}
                    type="checkbox"
                    className={CHECK_CLASS}
                    checked={Boolean(options[key])}
                    onChange={toggleOption(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        {preset === "feature" ? (
          <label
            htmlFor="ift-requireSearch"
            className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              id="ift-requireSearch"
              type="checkbox"
              className={CHECK_CLASS}
              checked={Boolean(options.requireSearch)}
              onChange={toggleOption("requireSearch")}
            />
            Require a duplicate-search checkbox
          </label>
        ) : null}
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
              Save as
            </p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.path}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated issue form YAML"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy YAML"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all options to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Interactive fields</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.fieldCount}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Required fields</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.requiredCount}
            </dd>
          </div>
        </dl>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? DASH : result.yaml}</code>
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Commit the file to your default branch. Issue forms only work on public
        repositories or repos with GitHub Enterprise; classic Markdown templates
        remain supported everywhere.
      </p>
    </main>
  );
}
