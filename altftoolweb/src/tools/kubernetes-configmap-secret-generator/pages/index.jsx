"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import { SECRET_TYPES, buildManifests } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-40 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "app-config",
  namespace: "prod",
  secretType: "Opaque",
  envText: `# paste your .env here
DB_HOST=db.prod.svc.cluster.local
DB_PORT=5432
DB_PASSWORD=s3cret`,
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [namespace, setNamespace] = useState(DEFAULTS.namespace);
  const [secretType, setSecretType] = useState(DEFAULTS.secretType);
  const [envText, setEnvText] = useState(DEFAULTS.envText);
  const [copiedWhich, setCopiedWhich] = useState("");

  const result = useMemo(
    () => buildManifests({ name, namespace, envText, secretType }),
    [name, namespace, envText, secretType],
  );

  const hasError = Boolean(result.error);

  const copyText = async (text, which) => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWhich(which);
      setTimeout(() => setCopiedWhich(""), 1500);
    } catch {
      setCopiedWhich("");
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setNamespace(DEFAULTS.namespace);
    setSecretType(DEFAULTS.secretType);
    setEnvText(DEFAULTS.envText);
    setCopiedWhich("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Kubernetes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kubernetes ConfigMap and Secret Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste .env-style KEY=VALUE lines and get both a ConfigMap and a base64-encoded Secret
          manifest. Keys are validated against the API rule <code>[-._a-zA-Z0-9]+</code> and the
          1 MiB object size cap. Everything runs in your browser — nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kcs-name">
              Object name
            </label>
            <input
              id="kcs-name"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kcs-ns">
              Namespace (optional)
            </label>
            <input
              id="kcs-ns"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kcs-type">
              Secret type
            </label>
            <select
              id="kcs-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={secretType}
              onChange={(event) => setSecretType(event.target.value)}
            >
              {SECRET_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kcs-env">
              KEY=VALUE lines (.env format — # comments, quotes and export prefixes handled)
            </label>
            <textarea
              id="kcs-env"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={envText}
              onChange={(event) => setEnvText(event.target.value)}
            />
          </div>
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
              Keys encoded
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : result.entries.length}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.totalBytes.toLocaleString()} bytes of data (limit 1,048,576).`}
            </p>
          </div>
          <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">ConfigMap</h2>
          <button
            type="button"
            onClick={() => copyText(result.configMapYaml, "cm")}
            disabled={hasError}
            aria-label="Copy the ConfigMap YAML"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copiedWhich === "cm" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedWhich === "cm" ? "Copied!" : "Copy YAML"}
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-4">
          <pre className="font-mono text-sm leading-6">{hasError ? "—" : result.configMapYaml}</pre>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Secret (base64 data)</h2>
          <button
            type="button"
            onClick={() => copyText(result.secretYaml, "secret")}
            disabled={hasError}
            aria-label="Copy the Secret YAML"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copiedWhich === "secret" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedWhich === "secret" ? "Copied!" : "Copy YAML"}
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-4">
          <pre className="font-mono text-sm leading-6">{hasError ? "—" : result.secretYaml}</pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Secrets are base64-encoded, not encrypted — restrict them with RBAC and enable encryption at
        rest in etcd. Avoid committing generated Secret manifests to git; use sealed-secrets or an
        external secret store for that workflow.
      </p>
    </main>
  );
}
