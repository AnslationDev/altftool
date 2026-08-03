"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { COMMAND_MAP, CRITERIA, MANAGERS, recommendManager } from "../lib";

const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FACT_ROWS = [
  ["Lockfile", "lockfile"],
  ["Install strategy", "installStrategy"],
  ["Disk usage", "diskStrategy"],
  ["Workspaces", "workspaces"],
  ["Strictness", "strictness"],
  ["Monorepo tooling", "monorepoTooling"],
  ["Patching", "patching"],
  ["Getting it", "distribution"],
];

export default function ToolHome() {
  const [selected, setSelected] = useState(["diskUsage", "monorepo"]);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const result = useMemo(() => recommendManager({ selectedCriteria: selected }), [selected]);
  const winner = result.ranking?.[0];

  const copyResult = () => {
    if (!result.ranking) return;
    copy("ranking", result.ranking.map((r) => `${r.name}: ${r.score}/${r.maxScore}`).join("\n"), {
      label: "the ranking",
    });
  };

  const reset = () => {
    setSelected(["diskUsage", "monorepo"]);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Package management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">npm vs pnpm vs Yarn</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Side-by-side facts from each manager&apos;s own docs — install strategy, disk usage,
          lockfiles, strictness, workspaces — plus a recommendation weighted by what your project
          actually needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">What matters for your project?</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {CRITERIA.map((criterion) => (
              <label
                key={criterion.id}
                htmlFor={`cmp-${criterion.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`cmp-${criterion.id}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={selected.includes(criterion.id)}
                  onChange={() => toggle(criterion.id)}
                />
                {criterion.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Nothing ticked = all six criteria count equally.
          </p>
        </fieldset>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best fit for your criteria
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{winner ? winner.name : "—"}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {winner ? `${winner.score} of ${winner.maxScore} points on the selected criteria` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("ranking") ? "Copied the ranking result to the clipboard" : "Copy the ranking result"}
              className={GHOST_BTN}
            >
              {isCopied("ranking") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("ranking") ? "Copied!" : "Copy ranking"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset criteria to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {(result.ranking ?? []).map((entry, index) => (
            <div key={entry.id} className="py-2.5">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold">
                  {index + 1}. {entry.name}
                </dt>
                <dd className="text-right font-mono font-semibold">
                  {entry.score}/{entry.maxScore}
                </dd>
              </div>
              <ul className="mt-1 space-y-0.5 text-xs text-[var(--muted-foreground)]">
                {entry.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Feature comparison</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Aspect
                </th>
                {MANAGERS.map((manager) => (
                  <th key={manager.id} scope="col" className="py-2 pr-3 font-semibold">
                    {manager.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACT_ROWS.map(([label, key]) => (
                <tr key={key} className="border-b border-[var(--border)] align-top last:border-0">
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {label}
                  </th>
                  {MANAGERS.map((manager) => (
                    <td key={manager.id} className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {manager[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Command cheat sheet</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Action
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  npm
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  pnpm
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  yarn
                </th>
              </tr>
            </thead>
            <tbody>
              {COMMAND_MAP.map((row) => (
                <tr key={row.action} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.action}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.npm}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.pnpm}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.yarn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Scores are qualitative rankings derived from each manager&apos;s documented mechanism (hard
        links vs copies, PnP vs hoisting) — real install times depend on your project and cache
        state. All three managers are production-quality; switching costs are usually low.
      </p>
    </main>
  );
}
