"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Flag, RotateCcw } from "lucide-react";

import { CASE_STYLES, FLAG_TYPES, MAX_RECOMMENDED_LENGTH, generateFlagName } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  description: "guest checkout flow",
  team: "payments",
  typeId: "release",
  caseStyle: "kebab",
  expiry: "",
  includeTeam: true,
  includePrefix: true,
};

export default function ToolHome() {
  const [description, setDescription] = useState(DEFAULTS.description);
  const [team, setTeam] = useState(DEFAULTS.team);
  const [typeId, setTypeId] = useState(DEFAULTS.typeId);
  const [caseStyle, setCaseStyle] = useState(DEFAULTS.caseStyle);
  const [expiry, setExpiry] = useState(DEFAULTS.expiry);
  const [includeTeam, setIncludeTeam] = useState(DEFAULTS.includeTeam);
  const [includePrefix, setIncludePrefix] = useState(DEFAULTS.includePrefix);
  const [copied, setCopied] = useState("");
  const copyTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
  }, []);

  const result = useMemo(
    () =>
      generateFlagName({
        description,
        team,
        typeId,
        caseStyle,
        expiry,
        includeTeam,
        includePrefix,
      }),
    [description, team, typeId, caseStyle, expiry, includeTeam, includePrefix],
  );

  const hasError = Boolean(result.error);
  const typeNote = FLAG_TYPES.find((t) => t.id === typeId)?.note ?? "";

  const copy = async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      setCopied(key);
      copyTimeoutRef.current = setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setDescription(DEFAULTS.description);
    setTeam(DEFAULTS.team);
    setTypeId(DEFAULTS.typeId);
    setCaseStyle(DEFAULTS.caseStyle);
    setExpiry(DEFAULTS.expiry);
    setIncludeTeam(DEFAULTS.includeTeam);
    setIncludePrefix(DEFAULTS.includePrefix);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flag className="h-4 w-4" aria-hidden="true" />
          Engineering Process
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Feature Flag Naming Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a flag key from type prefix, owning team, what it gates and a planned removal
          date — with lint warnings for negative names, vague words and keys longer than{" "}
          {MAX_RECOMMENDED_LENGTH} characters.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ffn-desc">
              What the flag gates
            </label>
            <input
              id="ffn-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="e.g. guest checkout flow"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ffn-team">
              Owning team
            </label>
            <input
              id="ffn-team"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="e.g. payments"
              value={team}
              onChange={(event) => setTeam(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ffn-type">
              Flag type
            </label>
            <select
              id="ffn-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={typeId}
              onChange={(event) => setTypeId(event.target.value)}
            >
              {FLAG_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{typeNote}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ffn-case">
              Case convention
            </label>
            <select
              id="ffn-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={caseStyle}
              onChange={(event) => setCaseStyle(event.target.value)}
            >
              {CASE_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ffn-expiry">
              Planned removal date (optional)
            </label>
            <input
              id="ffn-expiry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={expiry}
              onChange={(event) => setExpiry(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end gap-1">
            {[
              ["ffn-prefix", "Include type prefix segment", includePrefix, setIncludePrefix],
              ["ffn-team-seg", "Include team segment", includeTeam, setIncludeTeam],
            ].map(([id, label, value, setter]) => (
              <label
                key={id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
                htmlFor={id}
              >
                <input
                  id={id}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                />
                {label}
              </label>
            ))}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Flag key
            </p>
            <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.length} characters`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(result.name, "main")}
              disabled={hasError}
              aria-label="Copy the generated flag key"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "main" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "main" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-xs leading-5">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [["Segments", DASH]]
            : result.segments.map((s) => [s.label, s.text])
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-mono font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every case convention</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Style
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Key
                </th>
                <th scope="col" className="py-2 font-semibold">
                  <span className="sr-only">Copy</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.variants).map((variant) => (
                <tr key={variant.id} className="border-b border-[var(--border)] align-middle last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{variant.label}</td>
                  <td className="py-2 pr-3 break-all font-mono font-semibold">{variant.name}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => copy(variant.name, variant.id)}
                      aria-label={`Copy the ${variant.label} key`}
                      className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--primary)] transition hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {copied === variant.id ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {copied === variant.id ? "Copied!" : "Copy"}
                    </button>
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td colSpan={3} className="py-2 text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Categories follow Pete Hodgson's feature-toggle taxonomy: release and experiment flags are
        temporary and should carry a removal date; operational kill switches and permission gates
        are long-lived. There is no universal standard — the value of a convention is that your
        whole codebase uses the same one.
      </p>
    </main>
  );
}
