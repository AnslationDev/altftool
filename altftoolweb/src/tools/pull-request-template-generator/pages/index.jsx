"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitPullRequest, RotateCcw } from "lucide-react";

import {
  CHECKLIST_PRESETS,
  SECTION_ORDER,
  buildPrTemplate,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const defaultSections = () =>
  Object.fromEntries(SECTION_ORDER.map((s) => [s.id, s.defaultOn]));

const DEFAULTS = {
  checklistPreset: CHECKLIST_PRESETS[0].id,
  extraChecklist: "",
  useComments: true,
  multiTemplate: false,
  templateName: "default",
};

export default function ToolHome() {
  const [sections, setSections] = useState(defaultSections);
  const [checklistPreset, setChecklistPreset] = useState(DEFAULTS.checklistPreset);
  const [extraChecklist, setExtraChecklist] = useState(DEFAULTS.extraChecklist);
  const [useComments, setUseComments] = useState(DEFAULTS.useComments);
  const [multiTemplate, setMultiTemplate] = useState(DEFAULTS.multiTemplate);
  const [templateName, setTemplateName] = useState(DEFAULTS.templateName);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildPrTemplate({
        sections,
        checklistPreset,
        extraChecklist,
        useComments,
        multiTemplate,
        templateName,
      }),
    [sections, checklistPreset, extraChecklist, useComments, multiTemplate, templateName],
  );

  const hasError = Boolean(result.error);

  const toggleSection = (id) =>
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));

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
    setSections(defaultSections());
    setChecklistPreset(DEFAULTS.checklistPreset);
    setExtraChecklist(DEFAULTS.extraChecklist);
    setUseComments(DEFAULTS.useComments);
    setMultiTemplate(DEFAULTS.multiTemplate);
    setTemplateName(DEFAULTS.templateName);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitPullRequest className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pull Request Template Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the sections your team needs and get a ready-to-commit
          pull_request_template.md that GitHub loads automatically for every new PR.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">Sections to include</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SECTION_ORDER.map((section) => (
              <label
                key={section.id}
                htmlFor={`prt-${section.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`prt-${section.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={Boolean(sections[section.id])}
                  onChange={() => toggleSection(section.id)}
                />
                {section.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="prt-preset">
              Checklist preset
            </label>
            <select
              id="prt-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={checklistPreset}
              onChange={(event) => setChecklistPreset(event.target.value)}
            >
              {CHECKLIST_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prt-name">
              Template filename (multi-template mode)
            </label>
            <input
              id="prt-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={templateName}
              disabled={!multiTemplate}
              onChange={(event) => setTemplateName(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="prt-extra">
            Extra checklist items (one per line)
          </label>
          <textarea
            id="prt-extra"
            rows={3}
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            placeholder={"Ran accessibility audit\nProduct sign-off received"}
            value={extraChecklist}
            onChange={(event) => setExtraChecklist(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            htmlFor="prt-comments"
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              id="prt-comments"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={useComments}
              onChange={(event) => setUseComments(event.target.checked)}
            />
            Include HTML comment hints for authors
          </label>
          <label
            htmlFor="prt-multi"
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              id="prt-multi"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={multiTemplate}
              onChange={(event) => setMultiTemplate(event.target.checked)}
            />
            Named template in PULL_REQUEST_TEMPLATE/
          </label>
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
              aria-label="Copy the generated pull request template"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy template"}
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
            <dt className="text-[var(--muted-foreground)]">Sections included</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.sectionCount}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Template length</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.lineCount} lines`}
            </dd>
          </div>
        </dl>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? DASH : result.markdown}</code>
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Commit the file to your default branch. GitHub also accepts the template at the
        repository root or in docs/, but .github/ keeps meta files out of the way.
      </p>
    </main>
  );
}
