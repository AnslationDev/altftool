"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode, Plus, RotateCcw, Trash2 } from "lucide-react";

import { PROTOCOLS, SERVICE_TYPES, buildServiceYaml } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PORT = { name: "http", port: "80", targetPort: "8080", nodePort: "", protocol: "TCP" };

const DEFAULTS = {
  name: "web",
  namespace: "prod",
  type: "ClusterIP",
  selectorText: "app=web\ntier=frontend",
  headless: false,
  ports: [{ ...DEFAULT_PORT }],
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [namespace, setNamespace] = useState(DEFAULTS.namespace);
  const [type, setType] = useState(DEFAULTS.type);
  const [selectorText, setSelectorText] = useState(DEFAULTS.selectorText);
  const [headless, setHeadless] = useState(DEFAULTS.headless);
  const [ports, setPorts] = useState(DEFAULTS.ports);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildServiceYaml({ name, namespace, type, selectorText, ports, headless }),
    [name, namespace, type, selectorText, ports, headless],
  );

  const hasError = Boolean(result.error);

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
    setName(DEFAULTS.name);
    setNamespace(DEFAULTS.namespace);
    setType(DEFAULTS.type);
    setSelectorText(DEFAULTS.selectorText);
    setHeadless(DEFAULTS.headless);
    setPorts([{ ...DEFAULT_PORT }]);
    setCopied(false);
  };

  const setPortField = (index, field, value) => {
    setPorts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPort = () => {
    setPorts((prev) => [...prev, { name: "", port: "", targetPort: "", nodePort: "", protocol: "TCP" }]);
  };

  const removePort = (index) => {
    setPorts((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode className="h-4 w-4" aria-hidden="true" />
          Kubernetes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kubernetes Service YAML Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a valid core/v1 Service manifest. Names are checked against RFC 1035, nodePorts
          against the default 30000-32767 range, and multi-port services are forced to name every
          port — exactly what the API server enforces.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ksy-name">
              Service name
            </label>
            <input
              id="ksy-name"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksy-ns">
              Namespace (optional)
            </label>
            <input
              id="ksy-ns"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksy-type">
              Service type
            </label>
            <select
              id="ksy-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksy-selector">
              Pod selector (key=value per line)
            </label>
            <textarea
              id="ksy-selector"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={selectorText}
              onChange={(event) => setSelectorText(event.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ksy-headless">
          <input
            id="ksy-headless"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={headless}
            onChange={(event) => setHeadless(event.target.checked)}
          />
          Headless service (clusterIP: None — per-pod DNS records, used with StatefulSets)
        </label>

        <h2 className="mt-6 text-sm font-semibold">Ports</h2>
        <div className="mt-3 space-y-4">
          {ports.map((p, index) => (
            <div key={index} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ksy-pname-${index}`}>
                    Port name {ports.length > 1 ? "(required)" : "(optional)"}
                  </label>
                  <input
                    id={`ksy-pname-${index}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono`}
                    type="text"
                    placeholder="http"
                    value={p.name}
                    onChange={(event) => setPortField(index, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ksy-proto-${index}`}>
                    Protocol
                  </label>
                  <select
                    id={`ksy-proto-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={p.protocol}
                    onChange={(event) => setPortField(index, "protocol", event.target.value)}
                  >
                    {PROTOCOLS.map((proto) => (
                      <option key={proto} value={proto}>
                        {proto}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ksy-port-${index}`}>
                    Service port
                  </label>
                  <input
                    id={`ksy-port-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="65535"
                    value={p.port}
                    onChange={(event) => setPortField(index, "port", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ksy-target-${index}`}>
                    targetPort (number or named port)
                  </label>
                  <input
                    id={`ksy-target-${index}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono`}
                    type="text"
                    placeholder="defaults to port"
                    value={p.targetPort}
                    onChange={(event) => setPortField(index, "targetPort", event.target.value)}
                  />
                </div>
                {type !== "ClusterIP" ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`ksy-node-${index}`}>
                      nodePort (30000-32767, blank = auto)
                    </label>
                    <input
                      id={`ksy-node-${index}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="30000"
                      max="32767"
                      value={p.nodePort}
                      onChange={(event) => setPortField(index, "nodePort", event.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              {ports.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removePort(index)}
                  aria-label={`Remove port ${index + 1}`}
                  className={`${GHOST_BTN} mt-3`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove port
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button type="button" onClick={addPort} className={`${GHOST_BTN} mt-3`} aria-label="Add another port mapping">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add port
        </button>
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
            Generated manifest
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated Service YAML"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy YAML"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-4">
          <pre className="font-mono text-sm leading-6">{hasError ? "—" : result.yaml}</pre>
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Validate against your cluster with <code>kubectl apply --dry-run=server -f service.yaml</code>.
        Clusters can change the NodePort range via the kube-apiserver
        --service-node-port-range flag; 30000-32767 is the default.
      </p>
    </main>
  );
}
