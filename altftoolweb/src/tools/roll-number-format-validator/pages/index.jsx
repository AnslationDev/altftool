"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, RotateCcw, X } from "lucide-react";

import { CHARSETS, FORMAT_PRESETS, validateRollNumber } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  value: "240310123456",
  presetId: FORMAT_PRESETS[0].id,
  charset: FORMAT_PRESETS[0].charset,
  minLen: String(FORMAT_PRESETS[0].minLen),
  maxLen: String(FORMAT_PRESETS[0].maxLen),
  prefix: "",
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [charset, setCharset] = useState(DEFAULTS.charset);
  const [minLen, setMinLen] = useState(DEFAULTS.minLen);
  const [maxLen, setMaxLen] = useState(DEFAULTS.maxLen);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [copied, setCopied] = useState(false);

  const isCustom = presetId === "custom";

  const applyPreset = (id) => {
    setPresetId(id);
    const preset = FORMAT_PRESETS.find((p) => p.id === id);
    if (preset && id !== "custom") {
      setCharset(preset.charset);
      setMinLen(String(preset.minLen));
      setMaxLen(String(preset.maxLen));
      setPrefix(preset.prefix);
    }
  };

  const result = useMemo(
    () =>
      validateRollNumber({
        value,
        charset,
        minLen: Number(minLen),
        maxLen: Number(maxLen),
        prefix,
      }),
    [value, charset, minLen, maxLen, prefix],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Roll number format check",
      `Number: ${result.cleaned}`,
      `Verdict: ${result.valid ? "PASSES all format checks" : "FAILS one or more checks"}`,
      ...result.checks.map((c) => `${c.pass ? "PASS" : "FAIL"} — ${c.label}`),
      ...result.hints.map((h) => `Hint: ${h}`),
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
    setValue(DEFAULTS.value);
    setPresetId(DEFAULTS.presetId);
    setCharset(DEFAULTS.charset);
    setMinLen(DEFAULTS.minLen);
    setMaxLen(DEFAULTS.maxLen);
    setPrefix(DEFAULTS.prefix);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          Upload troubleshooting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Roll Number Format Validator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the roll or registration number you are about to submit and check it against the
          length, character-set and prefix rules of your exam before the portal rejects it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="rnv-value">
              Roll / registration number
            </label>
            <input
              id="rnv-value"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rnv-preset">
              Expected format
            </label>
            <select
              id="rnv-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {FORMAT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Presets follow formats these bodies have used in recent cycles — always confirm
              against your admit card.
            </p>
          </div>

          {isCustom ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="rnv-charset">
                  Allowed characters
                </label>
                <select
                  id="rnv-charset"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={charset}
                  onChange={(event) => setCharset(event.target.value)}
                >
                  {CHARSETS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="rnv-prefix">
                  Required prefix (optional)
                </label>
                <input
                  id="rnv-prefix"
                  className={`mt-2 ${INPUT_CLASS} font-mono`}
                  type="text"
                  autoComplete="off"
                  value={prefix}
                  onChange={(event) => setPrefix(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="rnv-min">
                  Minimum length
                </label>
                <input
                  id="rnv-min"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="40"
                  value={minLen}
                  onChange={(event) => setMinLen(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="rnv-max">
                  Maximum length
                </label>
                <input
                  id="rnv-max"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="40"
                  value={maxLen}
                  onChange={(event) => setMaxLen(event.target.value)}
                />
              </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Verdict
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.valid
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError ? DASH : result.valid ? "Looks valid" : "Fix needed"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to run the checks."
                : result.valid
                  ? "Every structural check passed. Paste the cleaned value below into the portal."
                  : "One or more checks failed — see the list below."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the format check report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
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
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Cleaned value to submit</dt>
            <dd className="text-right font-mono font-semibold break-all">
              {hasError ? DASH : result.cleaned}
            </dd>
          </div>
          {(hasError ? [] : result.checks).map((check) => (
            <div key={check.id} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">
                <span className="block">{check.label}</span>
                <span className="mt-0.5 block text-xs">{check.detail}</span>
              </dt>
              <dd
                className={`inline-flex items-center gap-1 font-semibold ${
                  check.pass ? "text-[var(--success)]" : "text-[var(--danger)]"
                }`}
              >
                {check.pass ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4" aria-hidden="true" />
                )}
                {check.pass ? "Pass" : "Fail"}
              </dd>
            </div>
          ))}
        </dl>

        {!hasError && result.hints.length > 0 ? (
          <ul className="mt-4 space-y-1 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            {result.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This tool checks structure only — it cannot confirm the number exists in the exam body's
        database. Your admit card or confirmation page is the final authority on the exact format.
      </p>
    </main>
  );
}
