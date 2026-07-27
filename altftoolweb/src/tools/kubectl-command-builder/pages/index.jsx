"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Terminal } from "lucide-react";

import { DRY_RUN_VALUES, OUTPUT_FORMATS, RESOURCES, VERBS, buildKubectlCommand } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  verb: "get",
  resource: "pods",
  name: "",
  namespace: "prod",
  allNamespaces: false,
  selector: "app=web",
  output: "wide",
  dryRun: "none",
  file: "deploy.yaml",
  container: "",
  follow: false,
  previous: false,
  replicas: "3",
  localPort: "8080",
  remotePort: "80",
  command: "",
};

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const result = useMemo(() => buildKubectlCommand(state), [state]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(DEFAULTS);
    setCopied(false);
  };

  const verb = state.verb;
  const showResource = ["get", "describe", "delete", "scale", "rollout-restart"].includes(verb);
  const showName = verb !== "apply";
  const showSelector = ["get", "describe", "delete", "logs"].includes(verb);
  const showOutput = ["get", "apply", "delete", "scale"].includes(verb);
  const showDryRun = ["apply", "delete", "scale"].includes(verb);
  const showFile = verb === "apply";
  const showLogsFlags = verb === "logs";
  const showExecFlags = verb === "exec";
  const showScale = verb === "scale";
  const showPortForward = verb === "port-forward";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Terminal className="h-4 w-4" aria-hidden="true" />
          Kubernetes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kubectl Command Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a verb and fill in the blanks — the builder assembles the command, quotes arguments
          for the shell, and rejects flag combinations kubectl itself refuses (like -A with -n, or a
          name with a selector).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kcb-verb">
              Verb
            </label>
            <select id="kcb-verb" className={`mt-2 ${INPUT_CLASS}`} value={state.verb} onChange={set("verb")}>
              {VERBS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          {showResource ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-resource">
                Resource type
              </label>
              <select
                id="kcb-resource"
                className={`mt-2 ${INPUT_CLASS}`}
                value={state.resource}
                onChange={set("resource")}
              >
                {RESOURCES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {showName ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-name">
                Resource name (blank = all)
              </label>
              <input
                id="kcb-name"
                className={`mt-2 ${INPUT_CLASS} font-mono`}
                type="text"
                placeholder="web-6d4cf56db6-abcde"
                value={state.name}
                onChange={set("name")}
              />
            </div>
          ) : null}
          {showFile ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-file">
                Manifest file (-f)
              </label>
              <input
                id="kcb-file"
                className={`mt-2 ${INPUT_CLASS} font-mono`}
                type="text"
                value={state.file}
                onChange={set("file")}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="kcb-ns">
              Namespace (-n)
            </label>
            <input
              id="kcb-ns"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={state.namespace}
              onChange={set("namespace")}
            />
          </div>
          {showSelector ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-selector">
                Label selector (-l)
              </label>
              <input
                id="kcb-selector"
                className={`mt-2 ${INPUT_CLASS} font-mono`}
                type="text"
                placeholder="app=web,tier!=cache"
                value={state.selector}
                onChange={set("selector")}
              />
            </div>
          ) : null}
          {showOutput ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-output">
                Output format (-o)
              </label>
              <select id="kcb-output" className={`mt-2 ${INPUT_CLASS}`} value={state.output} onChange={set("output")}>
                {OUTPUT_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f === "" ? "(default table)" : f}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {showDryRun ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-dryrun">
                --dry-run
              </label>
              <select id="kcb-dryrun" className={`mt-2 ${INPUT_CLASS}`} value={state.dryRun} onChange={set("dryRun")}>
                {DRY_RUN_VALUES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {showScale ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-replicas">
                Replicas
              </label>
              <input
                id="kcb-replicas"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                value={state.replicas}
                onChange={set("replicas")}
              />
            </div>
          ) : null}
          {showPortForward ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="kcb-lport">
                  Local port
                </label>
                <input
                  id="kcb-lport"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="65535"
                  value={state.localPort}
                  onChange={set("localPort")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="kcb-rport">
                  Remote port
                </label>
                <input
                  id="kcb-rport"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="65535"
                  value={state.remotePort}
                  onChange={set("remotePort")}
                />
              </div>
            </>
          ) : null}
          {showLogsFlags || showExecFlags ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-container">
                Container (-c, blank = first)
              </label>
              <input
                id="kcb-container"
                className={`mt-2 ${INPUT_CLASS} font-mono`}
                type="text"
                value={state.container}
                onChange={set("container")}
              />
            </div>
          ) : null}
          {showExecFlags ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="kcb-cmd">
                Command to run (blank = /bin/sh)
              </label>
              <input
                id="kcb-cmd"
                className={`mt-2 ${INPUT_CLASS} font-mono`}
                type="text"
                value={state.command}
                onChange={set("command")}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="kcb-allns">
            <input
              id="kcb-allns"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={state.allNamespaces}
              onChange={set("allNamespaces")}
            />
            All namespaces (-A)
          </label>
          {showLogsFlags ? (
            <>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="kcb-follow">
                <input
                  id="kcb-follow"
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={state.follow}
                  onChange={set("follow")}
                />
                Follow log stream (-f)
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="kcb-previous">
                <input
                  id="kcb-previous"
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={state.previous}
                  onChange={set("previous")}
                />
                Previous container instance (--previous — for crash loops)
              </label>
            </>
          ) : null}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Assembled command
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the kubectl command"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy command"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-4">
          <pre className="font-mono text-sm leading-6 text-[var(--primary)]">
            {hasError ? "—" : result.command}
          </pre>
        </div>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Review commands before running them against a production cluster — especially delete and
        scale. --dry-run=server validates through admission control without persisting anything.
      </p>
    </main>
  );
}
