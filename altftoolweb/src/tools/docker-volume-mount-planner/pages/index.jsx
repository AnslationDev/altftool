"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HardDrive, RotateCcw, TriangleAlert } from "lucide-react";

import {
  DEFAULT_PROPAGATION,
  GUIDANCE_ROWS,
  MOUNT_TYPES,
  PROPAGATION_MODES,
  planMount,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  type: "volume",
  source: "pgdata",
  target: "/var/lib/postgresql/data",
  readOnly: false,
  propagation: DEFAULT_PROPAGATION,
  selinux: "",
  tmpfsSize: "",
};

const SELINUX_OPTIONS = [
  ["", "None"],
  ["z", "z — shared label (multiple containers)"],
  ["Z", "Z — private label (this container only)"],
];

export default function ToolHome() {
  const [type, setType] = useState(DEFAULTS.type);
  const [source, setSource] = useState(DEFAULTS.source);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [readOnly, setReadOnly] = useState(DEFAULTS.readOnly);
  const [propagation, setPropagation] = useState(DEFAULTS.propagation);
  const [selinux, setSelinux] = useState(DEFAULTS.selinux);
  const [tmpfsSize, setTmpfsSize] = useState(DEFAULTS.tmpfsSize);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () => planMount({ type, source, target, readOnly, propagation, selinux, tmpfsSize }),
    [type, source, target, readOnly, propagation, selinux, tmpfsSize],
  );

  const hasError = Boolean(result.error);
  const isBind = type === "bind";
  const isTmpfs = type === "tmpfs";
  const activeType = MOUNT_TYPES.find((entry) => entry.id === type);

  const blocks = hasError
    ? []
    : [
        ["docker run — -v short flag", result.cliV],
        ["docker run — --mount (explicit)", result.cliMount],
        ["Compose — short syntax", result.composeShort],
        ["Compose — long syntax", result.composeLong],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return blocks.map(([label, code]) => `# ${label}\n${code}`).join("\n\n");
  }, [hasError, blocks]);

  const copyText = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setType(DEFAULTS.type);
    setSource(DEFAULTS.source);
    setTarget(DEFAULTS.target);
    setReadOnly(DEFAULTS.readOnly);
    setPropagation(DEFAULTS.propagation);
    setSelinux(DEFAULTS.selinux);
    setTmpfsSize(DEFAULTS.tmpfsSize);
    setCopied("");
  };

  const rows = hasError
    ? [
        ["Mount type", DASH],
        ["Source", DASH],
        ["Container path", DASH],
        ["Read-only", DASH],
        ["Bind propagation", DASH],
      ]
    : [
        ["Mount type", result.meta.type],
        ["Source", result.meta.source],
        ["Container path", result.meta.target],
        ["Read-only", result.meta.readOnly ? "Yes" : "No"],
        ["Bind propagation", result.meta.propagation],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HardDrive className="h-4 w-4" aria-hidden="true" />
          Developer
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Docker Volume Mount Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe one mount — bind, named volume or tmpfs — and get the matching{" "}
          <code>-v</code>, <code>--mount</code> and Compose short and long syntax, with read-only
          flags, bind propagation and SELinux options placed where each form actually accepts them.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mount-type">
              Mount type
            </label>
            <select
              id="mount-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {MOUNT_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            {activeType ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {activeType.summary}
              </p>
            ) : null}
          </div>

          {!isTmpfs ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="mount-source">
                {isBind ? "Host path (source)" : "Volume name (blank = anonymous)"}
              </label>
              <input
                id="mount-source"
                className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder={isBind ? "/srv/app/src" : "pgdata"}
                value={source}
                onChange={(event) => setSource(event.target.value)}
              />
            </div>
          ) : null}

          <div className={isTmpfs ? "sm:col-span-2" : undefined}>
            <label className={LABEL_CLASS} htmlFor="mount-target">
              Container path (target)
            </label>
            <input
              id="mount-target"
              className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="/var/lib/postgresql/data"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>

          {isBind ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="mount-propagation">
                Bind propagation
              </label>
              <select
                id="mount-propagation"
                className={`mt-2 ${INPUT_CLASS}`}
                value={propagation}
                onChange={(event) => setPropagation(event.target.value)}
              >
                {PROPAGATION_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                    {mode === DEFAULT_PROPAGATION ? " (default)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {isBind ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="mount-selinux">
                SELinux relabel
              </label>
              <select
                id="mount-selinux"
                className={`mt-2 ${INPUT_CLASS}`}
                value={selinux}
                onChange={(event) => setSelinux(event.target.value)}
              >
                {SELINUX_OPTIONS.map(([value, label]) => (
                  <option key={value || "none"} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {isTmpfs ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="mount-tmpfs-size">
                tmpfs size (blank = Docker default)
              </label>
              <input
                id="mount-tmpfs-size"
                className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="100m"
                value={tmpfsSize}
                onChange={(event) => setTmpfsSize(event.target.value)}
              />
            </div>
          ) : null}

          {!isTmpfs ? (
            <div className="sm:col-span-2">
              <label
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25"
                htmlFor="mount-readonly"
              >
                <input
                  id="mount-readonly"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)] focus:outline-none"
                  checked={readOnly}
                  onChange={(event) => setReadOnly(event.target.checked)}
                />
                <span>Mount read-only inside the container</span>
              </label>
            </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              docker run flag
            </p>
            <p className="mt-1 font-mono text-xl leading-8 font-semibold break-all text-[var(--primary)] sm:text-2xl">
              {hasError ? DASH : result.cliV}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(summary, "all")}
              disabled={hasError}
              aria-label="Copy every generated mount syntax"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "all" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "all" ? "Copied!" : "Copy all"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the mount planner to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-mono font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 grid gap-4">
          {blocks.map(([label, code]) => (
            <div key={label} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{label}</h2>
                <button
                  type="button"
                  onClick={() => copyText(code, label)}
                  aria-label={`Copy the ${label} snippet`}
                  className={GHOST_BTN}
                >
                  {copied === label ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === label ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3 text-xs leading-6">
                <code className="font-mono">{code}</code>
              </pre>
            </div>
          ))}
        </section>
      ) : null}

      {!hasError && result.warnings.length ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-sm font-semibold">Things to watch</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2 text-[var(--muted-foreground)]">
                <TriangleAlert
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold">Bind mount vs named volume</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Question
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Bind mount
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Named volume
                </th>
              </tr>
            </thead>
            <tbody>
              {GUIDANCE_ROWS.map(([question, bind, volume]) => (
                <tr key={question} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{question}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{bind}</td>
                  <td className="py-2.5 text-[var(--muted-foreground)]">{volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Syntax follows the Docker Engine storage documentation and the Compose file specification.
        tmpfs mounts are Linux-only; SELinux relabelling applies on hosts running SELinux in
        enforcing mode.
      </p>
    </main>
  );
}
