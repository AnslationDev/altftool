"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Route, TriangleAlert } from "lucide-react";

import {
  DEFAULT_INPUT,
  EXPRESS_VERSIONS,
  MODULE_SYSTEMS,
  OPERATIONS,
  VALIDATORS,
  buildRouteScaffold,
} from "../lib";

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

export default function ToolHome() {
  const [resource, setResource] = useState(DEFAULT_INPUT.resource);
  const [basePath, setBasePath] = useState(DEFAULT_INPUT.basePath);
  const [moduleSystem, setModuleSystem] = useState(DEFAULT_INPUT.moduleSystem);
  const [expressVersion, setExpressVersion] = useState(DEFAULT_INPUT.expressVersion);
  const [validator, setValidator] = useState(DEFAULT_INPUT.validator);
  const [operations, setOperations] = useState(DEFAULT_INPUT.operations);
  const [requireAuth, setRequireAuth] = useState(DEFAULT_INPUT.requireAuth);
  const [pagination, setPagination] = useState(DEFAULT_INPUT.pagination);
  const [copiedFile, setCopiedFile] = useState("");

  const result = useMemo(
    () =>
      buildRouteScaffold({
        resource,
        basePath,
        moduleSystem,
        expressVersion,
        validator,
        operations,
        requireAuth,
        pagination,
      }),
    [resource, basePath, moduleSystem, expressVersion, validator, operations, requireAuth, pagination],
  );

  const hasError = Boolean(result.error);

  const toggleOperation = (id) => {
    setOperations((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  const copyText = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFile(key);
      setTimeout(() => setCopiedFile(""), 1500);
    } catch {
      setCopiedFile("");
    }
  };

  const copyAll = () => {
    if (hasError) return;
    const bundle = result.files
      .map((file) => `// ===== ${file.name} =====\n${file.code}`)
      .join("\n\n");
    copyText("__all__", bundle);
  };

  const reset = () => {
    setResource(DEFAULT_INPUT.resource);
    setBasePath(DEFAULT_INPUT.basePath);
    setModuleSystem(DEFAULT_INPUT.moduleSystem);
    setExpressVersion(DEFAULT_INPUT.expressVersion);
    setValidator(DEFAULT_INPUT.validator);
    setOperations(DEFAULT_INPUT.operations);
    setRequireAuth(DEFAULT_INPUT.requireAuth);
    setPagination(DEFAULT_INPUT.pagination);
    setCopiedFile("");
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Route className="h-4 w-4" aria-hidden="true" />
          Express scaffold
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Express Route Scaffold Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate a complete Express router — validation, four-argument error middleware, an async
          wrapper on Express 4, and RFC 9110 status codes — from a resource name.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ers-resource">
              Resource name (singular)
            </label>
            <input
              id="ers-resource"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              placeholder="invoice"
              value={resource}
              onChange={(event) => setResource(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ers-base">
              Base path
            </label>
            <input
              id="ers-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              placeholder="/api/v1"
              value={basePath}
              onChange={(event) => setBasePath(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ers-express">
              Express version
            </label>
            <select
              id="ers-express"
              className={`mt-2 ${INPUT_CLASS}`}
              value={expressVersion}
              onChange={(event) => setExpressVersion(event.target.value)}
            >
              {EXPRESS_VERSIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ers-modules">
              Module system
            </label>
            <select
              id="ers-modules"
              className={`mt-2 ${INPUT_CLASS}`}
              value={moduleSystem}
              onChange={(event) => setModuleSystem(event.target.value)}
            >
              {MODULE_SYSTEMS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ers-validator">
              Validation layer
            </label>
            <select
              id="ers-validator"
              className={`mt-2 ${INPUT_CLASS}`}
              value={validator}
              onChange={(event) => setValidator(event.target.value)}
            >
              {VALIDATORS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Routes to generate</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {OPERATIONS.map((operation) => (
              <label
                key={operation.id}
                htmlFor={`ers-op-${operation.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`ers-op-${operation.id}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={operations.includes(operation.id)}
                  onChange={() => toggleOperation(operation.id)}
                />
                {operation.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          <label htmlFor="ers-auth" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              id="ers-auth"
              type="checkbox"
              className={CHECK_CLASS}
              checked={requireAuth}
              onChange={(event) => setRequireAuth(event.target.checked)}
            />
            Add requireAuth middleware to every route
          </label>
          <label htmlFor="ers-page" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              id="ers-page"
              type="checkbox"
              className={CHECK_CLASS}
              checked={pagination}
              onChange={(event) => setPagination(event.target.checked)}
            />
            Paginate the list route (limit / offset)
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

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Mounted at
            </p>
            <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.names.mountPath}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyAll}
              disabled={hasError}
              aria-label="Copy every generated file"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copiedFile === "__all__" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedFile === "__all__" ? "Copied!" : "Copy all files"}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Routes generated</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.routes.length}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Files</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.files.length}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Install</dt>
            <dd className="break-all text-right font-mono font-semibold">
              {hasError ? DASH : result.install}
            </dd>
          </div>
        </dl>

        {!hasError && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Method
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Path
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Success status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.routes.map((route) => (
                  <tr
                    key={`${route.method}-${route.path}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-mono font-semibold text-[var(--primary)]">
                      {route.method}
                    </td>
                    <td className="py-2 pr-3 font-mono">{route.path}</td>
                    <td className="py-2 text-right font-semibold">{route.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section
          aria-live="polite"
          aria-atomic="true"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Things the scaffold accounts for
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      {!hasError &&
        result.files.map((file) => (
          <section
            key={file.name}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="break-all font-mono text-sm font-semibold">{file.name}</h2>
              <button
                type="button"
                onClick={() => copyText(file.name, file.code)}
                aria-label={`Copy ${file.name}`}
                className={GHOST_BTN}
              >
                {copiedFile === file.name ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copiedFile === file.name ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
              <pre className="p-4 text-xs leading-5">
                <code>{file.code}</code>
              </pre>
            </div>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The generated code runs entirely from this page — nothing is uploaded. Review the validation
        schemas and swap the example fields for your own before shipping.
      </p>
    </main>
  );
}
