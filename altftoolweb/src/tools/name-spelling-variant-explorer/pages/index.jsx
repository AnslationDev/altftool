"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SpellCheck } from "lucide-react";

import { MAX_DEPTH, MAX_NAME_LETTERS, MIN_DEPTH, exploreVariants, sameName } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { name: "Meera", depth: "2", compareA: "Meera", compareB: "Mira" };
const DASH = "—";

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [compareA, setCompareA] = useState(DEFAULTS.compareA);
  const [compareB, setCompareB] = useState(DEFAULTS.compareB);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => exploreVariants({ name, maxDepth: Number(depth) }), [name, depth]);
  const comparison = useMemo(() => sameName(compareA, compareB), [compareA, compareB]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Roman spelling variants of ${result.original}`,
      `Canonical key: ${result.canonical}`,
      `${result.total} variants found (${result.oneStep} differ by a single substitution)`,
      "",
      ...result.variants.map((v) => `${v.display} — ${v.steps.join(", ")}`),
    ].join("\n");
  }, [result]);

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
    setName(DEFAULTS.name);
    setDepth(DEFAULTS.depth);
    setCompareA(DEFAULTS.compareA);
    setCompareB(DEFAULTS.compareB);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SpellCheck className="h-4 w-4" aria-hidden="true" />
          Spelling variants
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Name Spelling Variant Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Indian names have no single official romanisation, so the same name lands on a passport, a
          degree certificate and a bank record in three different spellings. This tool applies the
          real alternations — aa and a, ee and i, ksh and x, sh and s, dropped aspirates, the final
          short a — one substitution at a time and shows which rule produced each result.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="var-name">
              Name to explore
            </label>
            <input
              id="var-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_LETTERS}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="var-depth">
              How many substitutions deep
            </label>
            <select
              id="var-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              value={depth}
              onChange={(event) => setDepth(event.target.value)}
            >
              {Array.from({ length: MAX_DEPTH - MIN_DEPTH + 1 }, (_, index) => MIN_DEPTH + index).map(
                (value) => (
                  <option key={value} value={String(value)}>
                    {value} substitution{value === 1 ? "" : "s"}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
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
              Spelling variants found
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : NUM.format(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? DASH : `for ${result.original}, ${result.oneStep} of them a single swap away`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the list of spelling variants"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy variants"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the explorer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Canonical key", result.error ? DASH : result.canonical],
            ["One substitution away", result.error ? DASH : NUM.format(result.oneStep)],
            ["Rules that applied", result.error ? DASH : NUM.format(result.rulesApplied.length)],
            ["List complete", result.error ? DASH : result.truncated ? "No — capped" : "Yes"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && result.truncated ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            The list was capped. Reduce the substitution depth to see only the closest spellings.
          </p>
        ) : null}
      </section>

      {!result.error && result.total > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 font-semibold">Spelling</th>
                <th scope="col" className="px-4 py-3 font-semibold">Changes from your spelling</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Steps</th>
              </tr>
            </thead>
            <tbody>
              {result.variants.map((variant) => (
                <tr key={variant.spelling} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 align-top font-semibold">{variant.display}</td>
                  <td className="px-4 py-3 align-top text-[var(--muted-foreground)]">
                    {variant.steps.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right align-top">{variant.depth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!result.error && result.rulesApplied.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Why these spellings exist</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.rulesApplied.map((rule) => (
              <li key={rule.id}>{rule.note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Are two spellings the same name?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="var-cmp-a">
              First spelling
            </label>
            <input
              id="var-cmp-a"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_LETTERS}
              value={compareA}
              onChange={(event) => setCompareA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="var-cmp-b">
              Second spelling
            </label>
            <input
              id="var-cmp-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_LETTERS}
              value={compareB}
              onChange={(event) => setCompareB(event.target.value)}
            />
          </div>
        </div>

        {comparison.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {comparison.error}
          </p>
        ) : (
          <div className="mt-3">
            <p
              className={`text-2xl font-semibold ${
                comparison.same ? "text-[var(--success)]" : "text-[var(--foreground)]"
              }`}
            >
              {comparison.same ? "Same name" : "Different names"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {comparison.first} reduces to &quot;{comparison.keyA}&quot;, {comparison.second} reduces to
              &quot;{comparison.keyB}&quot;.
            </p>
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The comparison is deliberately conservative. It collapses long vowels, aspirates, ksh and x,
          sh and s, y and i, w and v, doubled letters and the final short a — but not the v/b or z/j
          alternations, because those can merge names that really are different.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Generated spellings are rule-derived possibilities, not a record of which forms are actually
        in use. For legal purposes what matters is the spelling on your identity documents — keep it
        identical across passport, bank, PAN and school records.
      </p>
    </main>
  );
}
