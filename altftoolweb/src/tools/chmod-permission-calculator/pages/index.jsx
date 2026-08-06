"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileLock, RotateCcw } from "lucide-react";

import {
  CLASSES,
  CLASS_LABELS,
  COMMON_MODES,
  bitsToOctal,
  bitsToSymbolic,
  convertPermissions,
} from "../lib";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_OCTAL = "755";
const DASH = "—";
const PERMS = [
  ["r", "Read"],
  ["w", "Write"],
  ["x", "Execute"],
];
const SPECIALS = [
  ["setuid", "Setuid (4)"],
  ["setgid", "Setgid (2)"],
  ["sticky", "Sticky (1)"],
];

export default function ToolHome() {
  const [source, setSource] = useState("octal");
  const [octalText, setOctalText] = useState(DEFAULT_OCTAL);
  const [symbolicText, setSymbolicText] = useState("rwxr-xr-x");
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(
    () => convertPermissions({ source, octalText, symbolicText }),
    [source, octalText, symbolicText],
  );
  const hasError = Boolean(result.error);

  const applyBits = (bits) => {
    setOctalText(bitsToOctal(bits));
    setSymbolicText(bitsToSymbolic(bits));
    setSource("octal");
  };

  const toggleClassBit = (cls, perm) => {
    if (hasError) return;
    const bits = {
      user: { ...result.bits.user },
      group: { ...result.bits.group },
      other: { ...result.bits.other },
      special: { ...result.bits.special },
    };
    bits[cls][perm] = !bits[cls][perm];
    applyBits(bits);
  };

  const toggleSpecialBit = (key) => {
    if (hasError) return;
    const bits = {
      user: { ...result.bits.user },
      group: { ...result.bits.group },
      other: { ...result.bits.other },
      special: { ...result.bits.special },
    };
    bits.special[key] = !bits.special[key];
    applyBits(bits);
  };

  const onOctalChange = (event) => {
    setOctalText(event.target.value);
    setSource("octal");
    const parsed = convertPermissions({ source: "octal", octalText: event.target.value });
    if (!parsed.error) setSymbolicText(parsed.symbolic);
  };

  const onSymbolicChange = (event) => {
    setSymbolicText(event.target.value);
    setSource("symbolic");
    const parsed = convertPermissions({ source: "symbolic", symbolicText: event.target.value });
    if (!parsed.error) setOctalText(parsed.octal);
  };

  const copyResult = () => {
    if (hasError) return;
    const text = [`Octal: ${result.octal}`, `Symbolic: ${result.symbolic}`, result.chmodCommand].join(
      "\n",
    );
    copyToClipboard("result", text, { label: "the permission conversion result" });
  };

  const reset = () => {
    setSource("octal");
    setOctalText(DEFAULT_OCTAL);
    setSymbolicText("rwxr-xr-x");
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileLock className="h-4 w-4" aria-hidden="true" />
          Linux admin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Chmod Permission Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert between numeric and symbolic Unix file permissions. Tick the grid or type either
          form — read=4, write=2, execute=1 per class, plus setuid, setgid and sticky bits.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="chmod-octal">
              Numeric (octal) mode
            </label>
            <input
              id="chmod-octal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={octalText}
              onChange={onOctalChange}
              autoComplete="off"
              spellCheck={false}
              maxLength={4}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chmod-symbolic">
              Symbolic mode
            </label>
            <input
              id="chmod-symbolic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={symbolicText}
              onChange={onSymbolicChange}
              autoComplete="off"
              spellCheck={false}
              maxLength={10}
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Class
                </th>
                {PERMS.map(([perm, label]) => (
                  <th key={perm} scope="col" className="py-2 pr-3 text-center font-semibold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASSES.map((cls) => (
                <tr key={cls} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {CLASS_LABELS[cls]}
                  </th>
                  {PERMS.map(([perm, label]) => (
                    <td key={perm} className="py-1 pr-3 text-center">
                      <label
                        htmlFor={`chmod-${cls}-${perm}`}
                        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center"
                      >
                        <input
                          id={`chmod-${cls}-${perm}`}
                          type="checkbox"
                          className={CHECK_CLASS}
                          aria-label={`${CLASS_LABELS[cls]} ${label}`}
                          checked={hasError ? false : result.bits[cls][perm]}
                          disabled={hasError}
                          onChange={() => toggleClassBit(cls, perm)}
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap gap-4">
          {SPECIALS.map(([key, label]) => (
            <label key={key} htmlFor={`chmod-${key}`} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                id={`chmod-${key}`}
                type="checkbox"
                className={CHECK_CLASS}
                checked={hasError ? false : result.bits.special[key]}
                disabled={hasError}
                onChange={() => toggleSpecialBit(key)}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {COMMON_MODES.map((mode) => (
            <button
              key={mode.octal}
              type="button"
              title={mode.note}
              onClick={() => {
                setSource("octal");
                setOctalText(mode.octal);
                const parsed = convertPermissions({ source: "octal", octalText: mode.octal });
                if (!parsed.error) setSymbolicText(parsed.symbolic);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {mode.octal}
            </button>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              chmod mode
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.octal}
            </p>
            <p className="mt-1 font-mono text-lg text-[var(--muted-foreground)]">
              {hasError ? DASH : result.symbolic}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={
                isCopied("result")
                  ? "Copied the permission conversion result to clipboard"
                  : "Copy the permission conversion result"
              }
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button type="button" onClick={reset} aria-label="Reset to default permissions" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Command</dt>
            <dd className="text-right font-mono font-semibold">{hasError ? DASH : result.chmodCommand}</dd>
          </div>
          {(hasError ? [] : result.description).map((line) => (
            <div key={line} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{line.split(":")[0]}</dt>
              <dd className="text-right font-semibold">{line.split(":").slice(1).join(":").trim()}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--danger)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Permission semantics follow POSIX and chmod(1). On directories, execute means the right to
        enter and traverse; read lists names; write creates and deletes entries.
      </p>
    </main>
  );
}
