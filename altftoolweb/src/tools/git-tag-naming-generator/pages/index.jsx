"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tag } from "lucide-react";

import { ENV_STYLES, PRERELEASE_CHANNELS, buildTagStandard } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CODE_BLOCK =
  "overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]";

const DASH = "—";

const DEFAULTS = {
  vPrefix: true,
  customPrefix: "",
  major: "1",
  minor: "4",
  patch: "0",
  prerelease: false,
  channel: "rc",
  prereleaseNum: "1",
  envStyle: "none",
  envName: "staging",
};

export default function ToolHome() {
  const [vPrefix, setVPrefix] = useState(DEFAULTS.vPrefix);
  const [customPrefix, setCustomPrefix] = useState(DEFAULTS.customPrefix);
  const [major, setMajor] = useState(DEFAULTS.major);
  const [minor, setMinor] = useState(DEFAULTS.minor);
  const [patch, setPatch] = useState(DEFAULTS.patch);
  const [prerelease, setPrerelease] = useState(DEFAULTS.prerelease);
  const [channel, setChannel] = useState(DEFAULTS.channel);
  const [prereleaseNum, setPrereleaseNum] = useState(DEFAULTS.prereleaseNum);
  const [envStyle, setEnvStyle] = useState(DEFAULTS.envStyle);
  const [envName, setEnvName] = useState(DEFAULTS.envName);
  const [copied, setCopied] = useState(false);

  const num = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      buildTagStandard({
        vPrefix,
        customPrefix,
        major: num(major),
        minor: num(minor),
        patch: num(patch),
        prerelease,
        channel,
        prereleaseNum: num(prereleaseNum),
        envStyle,
        envName,
      }),
    [vPrefix, customPrefix, major, minor, patch, prerelease, channel, prereleaseNum, envStyle, envName],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Tag format: ${result.format}`,
      `Example: ${result.example}`,
      `Regex: ${result.regexSource}`,
      "",
      ...result.commands,
      "",
      ...result.notes.map((n) => `- ${n}`),
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setVPrefix(DEFAULTS.vPrefix);
    setCustomPrefix(DEFAULTS.customPrefix);
    setMajor(DEFAULTS.major);
    setMinor(DEFAULTS.minor);
    setPatch(DEFAULTS.patch);
    setPrerelease(DEFAULTS.prerelease);
    setChannel(DEFAULTS.channel);
    setPrereleaseNum(DEFAULTS.prereleaseNum);
    setEnvStyle(DEFAULTS.envStyle);
    setEnvName(DEFAULTS.envName);
    setCopied(false);
  };

  const versionFields = [
    { id: "tag-major", label: "MAJOR", value: major, set: setMajor },
    { id: "tag-minor", label: "MINOR", value: minor, set: setMinor },
    { id: "tag-patch", label: "PATCH", value: patch, set: setPatch },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tag className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Git Tag Naming Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Design a consistent release tag format — v-prefix, SemVer 2.0.0 core, prerelease
          channels and environment labels — with a validation regex and the git commands to cut a
          release.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid grid-cols-3 gap-4">
          {versionFields.map((f) => (
            <div key={f.id}>
              <label className={LABEL_CLASS} htmlFor={f.id}>
                {f.label}
              </label>
              <input
                id={f.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={f.value}
                onChange={(event) => f.set(event.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tag-prefix">
              Custom prefix (optional, e.g. app@)
            </label>
            <input
              id="tag-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={customPrefix}
              placeholder=""
              onChange={(event) => setCustomPrefix(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tag-env-style">
              Environment suffix
            </label>
            <select
              id="tag-env-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={envStyle}
              onChange={(event) => setEnvStyle(event.target.value)}
            >
              {ENV_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {envStyle !== "none" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="tag-env-name">
                Environment name
              </label>
              <input
                id="tag-env-name"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={envName}
                onChange={(event) => setEnvName(event.target.value)}
              />
            </div>
          ) : null}
          {prerelease ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="tag-channel">
                  Prerelease channel
                </label>
                <select
                  id="tag-channel"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                >
                  {PRERELEASE_CHANNELS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="tag-pre-num">
                  Prerelease iteration
                </label>
                <input
                  id="tag-pre-num"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={prereleaseNum}
                  onChange={(event) => setPrereleaseNum(event.target.value)}
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="tag-v"
          >
            <input
              id="tag-v"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={vPrefix}
              onChange={(event) => setVPrefix(event.target.checked)}
            />
            Use the conventional &quot;v&quot; prefix (v1.2.3)
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="tag-pre"
          >
            <input
              id="tag-pre"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={prerelease}
              onChange={(event) => setPrerelease(event.target.checked)}
            />
            Include a prerelease segment (-alpha/-beta/-rc)
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next release tag
            </p>
            <p className="mt-1 break-all font-mono text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.example}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the tag standard and commands"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy standard"}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[var(--muted-foreground)]">Format template</dt>
            <dd className="break-all font-mono text-xs font-semibold sm:text-right">
              {hasError ? DASH : result.format}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[var(--muted-foreground)]">Validation regex</dt>
            <dd className="break-all font-mono text-xs font-semibold sm:text-right">
              {hasError ? DASH : result.regexSource}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <>
            <h2 className="mt-5 text-sm font-semibold">Cut the release</h2>
            <pre className={`mt-2 ${CODE_BLOCK}`}>
              <code>{result.commands.join("\n")}</code>
            </pre>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </main>
  );
}
