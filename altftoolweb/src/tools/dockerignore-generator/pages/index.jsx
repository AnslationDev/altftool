"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileX, RotateCcw } from "lucide-react";

import { COMMON_GROUPS, STACK_PRESETS, buildDockerignore } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULTS = {
  stackIds: ["node"],
  groupIds: ["vcs", "docker", "env", "editor", "logs"],
  custom: "",
};

export default function ToolHome() {
  const [stackIds, setStackIds] = useState(DEFAULTS.stackIds);
  const [groupIds, setGroupIds] = useState(DEFAULTS.groupIds);
  const [custom, setCustom] = useState(DEFAULTS.custom);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildDockerignore({ stackIds, groupIds, custom }),
    [stackIds, groupIds, custom],
  );

  const hasError = Boolean(result.error);

  const toggleIn = (setter) => (id) => {
    setter((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };
  const toggleStack = toggleIn(setStackIds);
  const toggleGroup = toggleIn(setGroupIds);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStackIds(DEFAULTS.stackIds);
    setGroupIds(DEFAULTS.groupIds);
    setCustom(DEFAULTS.custom);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileX className="h-4 w-4" aria-hidden="true" />
          Containers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dockerignore Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your toolchain and the file groups to exclude, and get a sectioned
          .dockerignore that keeps caches, secrets and clutter out of the build context —
          smaller uploads, faster builds, no leaked .env files.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">Stacks</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {STACK_PRESETS.map((stack) => (
              <label
                key={stack.id}
                htmlFor={`di-stack-${stack.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]"
              >
                <input
                  id={`di-stack-${stack.id}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={stackIds.includes(stack.id)}
                  onChange={() => toggleStack(stack.id)}
                />
                <span>
                  {stack.label}
                  <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                    ({stack.patterns.length} patterns)
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Common file groups</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {COMMON_GROUPS.map((group) => (
              <label
                key={group.id}
                htmlFor={`di-group-${group.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-[var(--muted)]"
              >
                <input
                  id={`di-group-${group.id}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={groupIds.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                />
                <span>
                  {group.label}
                  <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                    ({group.patterns.length})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="di-custom">
            Custom patterns (one per line)
          </label>
          <textarea
            id="di-custom"
            rows={3}
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            placeholder={"tmp/**\n!important.txt"}
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
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
              Patterns in .dockerignore
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.patternCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated .dockerignore"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy .dockerignore"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset selection to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg bg-[var(--muted)] p-4">
          <pre className="whitespace-pre text-xs leading-5 text-[var(--foreground)]">
            <code>{hasError ? DASH : result.content}</code>
          </pre>
        </div>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--primary)]" />
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Save the file as .dockerignore next to your Dockerfile (the build-context root). If
        your Dockerfile COPYs a prebuilt artifact — a dist/ folder or vendored deps — make
        sure it is not listed here, or the COPY will fail.
      </p>
    </main>
  );
}
