"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Terminal } from "lucide-react";

import {
  DEFAULT_INPUT,
  MANAGERS,
  OPERATING_SYSTEMS,
  buildVenvSetup,
  shellsFor,
} from "../lib";

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Evaluated once per page load; the library itself never reads the clock. */
const TODAY = new Date().toISOString().slice(0, 10);

const VERSIONS = ["3.14", "3.13", "3.12", "3.11", "3.10", "3.9", "3.8"];
const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULT_INPUT);
  const [copied, setCopied] = useState("");

  const shells = useMemo(() => shellsFor(form.os), [form.os]);
  const result = useMemo(() => buildVenvSetup(form, TODAY), [form]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const setOs = (osId) => {
    const options = shellsFor(osId);
    const os = OPERATING_SYSTEMS.find((entry) => entry.id === osId);
    const keep = options.some((shell) => shell.id === form.shell);
    setForm((prev) => ({
      ...prev,
      os: osId,
      shell: keep ? prev.shell : os?.defaultShell ?? options[0]?.id,
    }));
    setCopied("");
  };

  const copy = async (key, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULT_INPUT);
    setCopied("");
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Terminal className="h-4 w-4" aria-hidden="true" />
          Python environments
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Python Venv Setup Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The activation script filename depends on your shell, not your operating system. Pick both
          and get the exact create, activate, install and clean-up commands for your project.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="venv-os">
              Operating system
            </label>
            <select
              id="venv-os"
              className={`mt-2 ${FIELD}`}
              value={form.os}
              onChange={(event) => setOs(event.target.value)}
            >
              {OPERATING_SYSTEMS.map((os) => (
                <option key={os.id} value={os.id}>
                  {os.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="venv-shell">
              Shell
            </label>
            <select
              id="venv-shell"
              className={`mt-2 ${FIELD}`}
              value={form.shell}
              onChange={(event) => setField("shell", event.target.value)}
            >
              {shells.map((shell) => (
                <option key={shell.id} value={shell.id}>
                  {shell.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="venv-version">
              Python version
            </label>
            <select
              id="venv-version"
              className={`mt-2 ${FIELD}`}
              value={form.pythonVersion}
              onChange={(event) => setField("pythonVersion", event.target.value)}
            >
              {VERSIONS.map((version) => (
                <option key={version} value={version}>
                  Python {version}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="venv-manager">
              Package manager
            </label>
            <select
              id="venv-manager"
              className={`mt-2 ${FIELD}`}
              value={form.manager}
              onChange={(event) => setField("manager", event.target.value)}
            >
              {MANAGERS.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {MANAGERS.find((manager) => manager.id === form.manager)?.note}
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="venv-dir">
              Environment directory
            </label>
            <input
              id="venv-dir"
              className={`mt-2 ${FIELD}`}
              type="text"
              spellCheck={false}
              value={form.venvDir}
              onChange={(event) => setField("venvDir", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="venv-requirements">
              Requirements file
            </label>
            <input
              id="venv-requirements"
              className={`mt-2 ${FIELD}`}
              type="text"
              spellCheck={false}
              value={form.requirementsFile}
              onChange={(event) => setField("requirementsFile", event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Options</legend>
          <div className="mt-2 grid gap-2">
            {[
              ["upgradeDeps", "Pass --upgrade-deps so pip is current inside the new environment"],
              ["systemSitePackages", "Pass --system-site-packages (see global packages)"],
              ["addGitignore", "Add the environment directory to .gitignore"],
            ].map(([key, label]) => (
              <label
                key={key}
                htmlFor={`venv-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`venv-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={form[key]}
                  onChange={(event) => setField(key, event.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Activation command
            </p>
            <p className="mt-1 break-all font-mono text-lg font-semibold leading-7 text-[var(--primary)] sm:text-2xl">
              {ok ? result.activate : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("script", ok ? result.script : "")}
              aria-label="Copy the whole setup script"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied === "script" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "script" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all choices" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Scripts directory</dt>
            <dd className="text-right font-mono font-semibold">{ok ? result.scriptsDir : DASH}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Activation script</dt>
            <dd className="max-w-[60%] break-all text-right font-mono font-semibold">
              {ok ? result.activatePath : DASH}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Deactivate with</dt>
            <dd className="text-right font-mono font-semibold">{ok ? result.deactivate : DASH}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Interpreter support</dt>
            <dd className="max-w-[60%] text-right font-semibold">{ok ? result.support.message : DASH}</dd>
          </div>
        </dl>

        {ok && result.warnings.length ? (
          <div className="mt-4 grid gap-2">
            {result.warnings.map((warning) => (
              <p
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
              >
                {warning}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Step by step</h2>
          <ol className="mt-4 grid gap-4">
            {result.steps.map((step, index) => (
              <li key={step.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                      {index + 1}
                    </span>
                    {step.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(step.id, step.commands.join("\n"))}
                    aria-label={`Copy commands for ${step.title}`}
                    className="min-h-11 rounded-md px-2 text-xs font-semibold text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    {copied === step.id ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mt-2 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
                  <pre className="min-w-max font-mono text-xs leading-6">{step.commands.join("\n")}</pre>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{step.note}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A virtual environment is a directory of absolute paths and platform-specific binaries. Commit
        the requirements or lock file, never the environment itself, and rebuild it on each machine.
      </p>
    </main>
  );
}
