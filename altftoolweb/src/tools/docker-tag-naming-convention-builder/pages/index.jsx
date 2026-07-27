"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tags } from "lucide-react";

import { SEPARATORS, TAG_COMPONENT_DEFS, buildImageReference } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  registry: "ghcr.io",
  namespace: "acme",
  repository: "checkout-api",
  separator: "-",
  enabled: { semver: true, branch: false, sha: true, date: false, env: false },
  values: {
    semver: "1.4.2",
    branch: "feature/login",
    sha: "9fceb02",
    date: "2026-07-26",
    env: "staging",
  },
};

const DASH = "—";

export default function ToolHome() {
  const [registry, setRegistry] = useState(DEFAULTS.registry);
  const [namespace, setNamespace] = useState(DEFAULTS.namespace);
  const [repository, setRepository] = useState(DEFAULTS.repository);
  const [separator, setSeparator] = useState(DEFAULTS.separator);
  const [enabled, setEnabled] = useState(DEFAULTS.enabled);
  const [values, setValues] = useState(DEFAULTS.values);
  const [copied, setCopied] = useState(false);

  const order = TAG_COMPONENT_DEFS.filter((d) => enabled[d.id]).map((d) => d.id);

  const result = useMemo(
    () => buildImageReference({ registry, namespace, repository, order: order, values, separator }),
    // order is derived from `enabled`, which is in the deps below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registry, namespace, repository, enabled, values, separator],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRegistry(DEFAULTS.registry);
    setNamespace(DEFAULTS.namespace);
    setRepository(DEFAULTS.repository);
    setSeparator(DEFAULTS.separator);
    setEnabled(DEFAULTS.enabled);
    setValues(DEFAULTS.values);
    setCopied(false);
  };

  const toggleComponent = (id) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setValue = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tags className="h-4 w-4" aria-hidden="true" />
          Containers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Docker Tag Naming Convention Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose a tagging scheme from semver, branch, git SHA, date and environment parts. Every
          part is validated against the OCI reference grammar (max 128 characters, no leading
          &quot;.&quot; or &quot;-&quot;), and branch names are sanitised automatically.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dtn-registry">
              Registry host (blank for Docker Hub)
            </label>
            <input
              id="dtn-registry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={registry}
              onChange={(event) => setRegistry(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dtn-namespace">
              Namespace / organisation (optional)
            </label>
            <input
              id="dtn-namespace"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dtn-repo">
              Repository name
            </label>
            <input
              id="dtn-repo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={repository}
              onChange={(event) => setRepository(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dtn-separator">
              Separator between tag parts
            </label>
            <select
              id="dtn-separator"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
            >
              {SEPARATORS.map((s) => (
                <option key={s} value={s}>
                  {s === "-" ? "- (hyphen)" : s === "." ? ". (dot)" : "_ (underscore)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">Tag components (ticked parts join in this order)</h2>
        <div className="mt-3 space-y-3">
          {TAG_COMPONENT_DEFS.map((def) => (
            <div key={def.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
              <label
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`dtn-on-${def.id}`}
              >
                <input
                  id={`dtn-on-${def.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={Boolean(enabled[def.id])}
                  onChange={() => toggleComponent(def.id)}
                />
                {def.label}
              </label>
              <div>
                <label className="sr-only" htmlFor={`dtn-val-${def.id}`}>
                  Value for {def.label}
                </label>
                <input
                  id={`dtn-val-${def.id}`}
                  className={INPUT_CLASS}
                  type="text"
                  placeholder={def.placeholder}
                  value={values[def.id] ?? ""}
                  disabled={!enabled[def.id]}
                  onChange={(event) => setValue(def.id, event.target.value)}
                />
              </div>
            </div>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Full image reference
            </p>
            <p className="mt-1 break-all font-mono text-xl font-semibold text-[var(--primary)] sm:text-2xl">
              {hasError ? DASH : result.reference}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the full image reference"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Tag only</dt>
            <dd className="break-all text-right font-mono font-semibold">{hasError ? DASH : result.tag}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Tag length</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : `${result.tag.length} / 128 characters`}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Traceable to a commit</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : enabled.sha || enabled.semver ? "Yes" : "No"}
            </dd>
          </div>
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Tag grammar rules applied</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
          <li>Tags: letters, digits, &quot;_&quot;, &quot;.&quot;, &quot;-&quot; only; max 128 characters; must not start with &quot;.&quot; or &quot;-&quot;.</li>
          <li>Repository names: lowercase letters and digits, separated by &quot;.&quot;, &quot;_&quot;, &quot;__&quot; or &quot;-&quot;; max 255 characters including namespace.</li>
          <li>SemVer parts follow semver.org: MAJOR.MINOR.PATCH with no leading zeros.</li>
          <li>Branch names are sanitised — &quot;/&quot; and other illegal characters become &quot;-&quot;.</li>
        </ul>
      </section>
    </main>
  );
}
