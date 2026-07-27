"use client";

import { useMemo, useState } from "react";
import { Check, Container, Copy, RotateCcw } from "lucide-react";

import {
  OPTIONAL_REQUIREMENTS,
  RUNTIME_PRESETS,
  buildDockerfilePrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  runtimeId: "node",
  framework: "Express",
  appDescription: "a REST API with a PostgreSQL database",
  port: "3000",
  installCommand: "",
  buildCommand: "",
  startCommand: "",
  envVars: "DATABASE_URL, PORT",
  systemDeps: "",
  requirements: ["multiStage", "nonRoot", "layerCache", "dockerignore"],
};

const DASH = "—";

export default function ToolHome() {
  const [runtimeId, setRuntimeId] = useState(DEFAULTS.runtimeId);
  const [framework, setFramework] = useState(DEFAULTS.framework);
  const [appDescription, setAppDescription] = useState(DEFAULTS.appDescription);
  const [port, setPort] = useState(DEFAULTS.port);
  const [installCommand, setInstallCommand] = useState(DEFAULTS.installCommand);
  const [buildCommand, setBuildCommand] = useState(DEFAULTS.buildCommand);
  const [startCommand, setStartCommand] = useState(DEFAULTS.startCommand);
  const [envVars, setEnvVars] = useState(DEFAULTS.envVars);
  const [systemDeps, setSystemDeps] = useState(DEFAULTS.systemDeps);
  const [requirements, setRequirements] = useState(DEFAULTS.requirements);
  const [copied, setCopied] = useState(false);

  const preset = RUNTIME_PRESETS.find((r) => r.id === runtimeId) ?? RUNTIME_PRESETS[0];

  const result = useMemo(
    () =>
      buildDockerfilePrompt({
        runtimeId,
        framework,
        appDescription,
        port: port.trim() === "" ? Number.NaN : Number(port),
        installCommand,
        buildCommand,
        startCommand,
        envVars,
        systemDeps,
        requirements,
      }),
    [
      runtimeId,
      framework,
      appDescription,
      port,
      installCommand,
      buildCommand,
      startCommand,
      envVars,
      systemDeps,
      requirements,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleRequirement = (id) => {
    setRequirements((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRuntimeId(DEFAULTS.runtimeId);
    setFramework(DEFAULTS.framework);
    setAppDescription(DEFAULTS.appDescription);
    setPort(DEFAULTS.port);
    setInstallCommand(DEFAULTS.installCommand);
    setBuildCommand(DEFAULTS.buildCommand);
    setStartCommand(DEFAULTS.startCommand);
    setEnvVars(DEFAULTS.envVars);
    setSystemDeps(DEFAULTS.systemDeps);
    setRequirements(DEFAULTS.requirements);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Runtime", DASH],
        ["Base image", DASH],
        ["Exposed port", DASH],
        ["Hard requirements", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Runtime", result.runtimeLabel],
        ["Base image", result.baseImage],
        ["Exposed port", String(result.port)],
        ["Hard requirements", String(result.requirementCount)],
        ["Env vars listed", String(result.envCount)],
        ["Prompt length", `${result.wordCount} words`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Container className="h-4 w-4" aria-hidden="true" />
          AI Coding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dockerfile Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe your runtime, dependencies and start command; get a precise prompt that tells an
          AI assistant exactly which base image, layers and hardening steps your Dockerfile needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dpb-runtime">
              Runtime
            </label>
            <select
              id="dpb-runtime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={runtimeId}
              onChange={(e) => {
                setRuntimeId(e.target.value);
                const next = RUNTIME_PRESETS.find((r) => r.id === e.target.value);
                if (next) setPort(String(next.defaultPort));
              }}
            >
              {RUNTIME_PRESETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpb-framework">
              Framework (optional)
            </label>
            <input
              id="dpb-framework"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              placeholder="Express, Django, Spring Boot…"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dpb-desc">
              What the app does (one line, optional)
            </label>
            <input
              id="dpb-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpb-port">
              Service port
            </label>
            <input
              id="dpb-port"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="65535"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpb-start">
              Start command (blank = preset)
            </label>
            <input
              id="dpb-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={startCommand}
              onChange={(e) => setStartCommand(e.target.value)}
              placeholder={preset.startCommand}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpb-install">
              Install command (blank = preset)
            </label>
            <input
              id="dpb-install"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={installCommand}
              onChange={(e) => setInstallCommand(e.target.value)}
              placeholder={preset.installCommand}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpb-build">
              Build command (blank = preset)
            </label>
            <input
              id="dpb-build"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              placeholder={preset.buildCommand || "none"}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpb-env">
              Runtime env vars (comma separated)
            </label>
            <input
              id="dpb-env"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              placeholder="DATABASE_URL, REDIS_URL"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dpb-sys">
              System packages (comma separated)
            </label>
            <input
              id="dpb-sys"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={systemDeps}
              onChange={(e) => setSystemDeps(e.target.value)}
              placeholder="libpq-dev, ffmpeg"
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Hard requirements</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {OPTIONAL_REQUIREMENTS.map((opt) => (
              <label
                key={opt.id}
                htmlFor={`dpb-req-${opt.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`dpb-req-${opt.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={requirements.includes(opt.id)}
                  onChange={() => toggleRequirement(opt.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
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
              Your Dockerfile prompt
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.wordCount} words`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated Dockerfile prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
          {hasError ? DASH : result.prompt}
        </pre>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt encodes Docker&apos;s published best practices (pinned tags, layer caching,
        multi-stage builds, non-root user). Review any generated Dockerfile before using it in
        production.
      </p>
    </main>
  );
}
