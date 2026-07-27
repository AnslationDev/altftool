"use client";

import { useMemo, useState } from "react";
import { Check, Container, Copy, RotateCcw } from "lucide-react";

import { convertEnvToSecret } from "../lib";

const TEXTAREA_CLASS =
  "min-h-48 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ENV = `DATABASE_URL=postgres://app:s3cret@db:5432/app
REDIS_URL=redis://cache:6379
JWT_SECRET=change-me-in-prod`;

const DASH = "—";

export default function ToolHome() {
  const [source, setSource] = useState(DEFAULT_ENV);
  const [name, setName] = useState("app-secrets");
  const [namespace, setNamespace] = useState("");
  const [useStringData, setUseStringData] = useState(false);
  const [immutable, setImmutable] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertEnvToSecret(source, { name, namespace, useStringData, immutable }),
    [source, name, namespace, useStringData, immutable],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.manifest);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(DEFAULT_ENV);
    setName("app-secrets");
    setNamespace("");
    setUseStringData(false);
    setImmutable(false);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Keys converted", DASH],
        ["Encoding", DASH],
        ["Approx. value bytes", DASH],
      ]
    : [
        ["Keys converted", `${result.count} — ${result.keys.join(", ")}`],
        ["Encoding", useStringData ? "stringData (plain text)" : "data (base64)"],
        [
          "Approx. value bytes",
          `${result.approxBytes}${result.overSizeLimit ? " — exceeds the 1 MiB Secret limit!" : ""}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Container className="h-4 w-4" aria-hidden="true" />
          Kubernetes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Env to Kubernetes Secret Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a .env file and get a ready-to-apply Secret manifest — values base64-encoded into
          data, or kept readable in stringData. Names and keys are validated against the
          DNS-1123 and [-._a-zA-Z0-9]+ rules the API server enforces. Nothing leaves your
          browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="k8s-src">
          .env contents
        </label>
        <textarea
          id="k8s-src"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="k8s-name">
              Secret name
            </label>
            <input
              id="k8s-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="app-secrets"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="k8s-ns">
              Namespace (optional)
            </label>
            <input
              id="k8s-ns"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="default"
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
            />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="k8s-stringdata">
            <input
              id="k8s-stringdata"
              type="checkbox"
              className={CHECK_CLASS}
              checked={useStringData}
              onChange={(event) => setUseStringData(event.target.checked)}
            />
            Use stringData (plain values, encoded by the API server on write)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="k8s-immutable">
            <input
              id="k8s-immutable"
              type="checkbox"
              className={CHECK_CLASS}
              checked={immutable}
              onChange={(event) => setImmutable(event.target.checked)}
            />
            Mark immutable (cannot be updated, only replaced)
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
              Secret manifest
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.count} key${result.count === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Secret manifest YAML"
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
              aria-label="Reset input and options to the example"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
          <pre className="font-mono text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.manifest}
          </pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Remember: base64 is encoding, not encryption — anyone who can read the manifest can decode
        the values. Keep generated Secrets out of git, or use a sealed/external secrets tool for
        GitOps workflows.
      </p>
    </main>
  );
}
