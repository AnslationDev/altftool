"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Split } from "lucide-react";

import { RUBRIC, SURFACES, TITLE_MAX_CHARS, compareTitles } from "../lib";

const DEFAULTS = {
  keyword: "pricing",
  titles: `5 pricing mistakes that cost me 40k
How I fixed my pricing in 30 days
PRICING!!! The truth nobody tells you about pricing your product
The complete guide to pricing a software product for solo founders in 2026`,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [keyword, setKeyword] = useState(DEFAULTS.keyword);
  const [titles, setTitles] = useState(DEFAULTS.titles);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compareTitles(titles, { keyword }), [titles, keyword]);

  const ok = !result.error;
  const dash = "—";

  const copyResult = async () => {
    if (!ok) return;
    const lines = result.ranked.map(
      (variant) => `${variant.score}/100  ${variant.characters} chars  ${variant.title}`,
    );
    try {
      await navigator.clipboard.writeText(["Title comparison", ...lines].join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setKeyword(DEFAULTS.keyword);
    setTitles(DEFAULTS.titles);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Split className="h-4 w-4" aria-hidden="true" />
          Title comparison
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">YouTube Title A B Tester</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put your title variants side by side and see where each one clips, whether the keyword
          survives the cut, and how it scores against a fixed rubric — before you publish.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="title-keyword">
            Focus keyword
          </label>
          <input
            id="title-keyword"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="title-variants">
            Title variants, one per line (up to 12)
          </label>
          <textarea
            id="title-variants"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={6}
            value={titles}
            onChange={(event) => setTitles(event.target.value)}
          />
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best variant score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.best.score}/100` : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.best.title : "Add a title to compare"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the title comparison"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy ranking"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the title tester" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Variants compared", ok ? String(result.count) : dash],
            ["Average score", ok ? String(result.averageScore) : dash],
            ["Spread between best and worst", ok ? String(result.spread) : dash],
            ["Clear winner", ok ? (result.tie ? "No — top two are level" : "Yes") : dash],
            ["Character limit", `${TITLE_MAX_CHARS}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 space-y-4">
          {result.ranked.map((variant, index) => (
            <article
              key={variant.label}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Rank {index + 1} · Variant {variant.label}
                  </p>
                  <p className="mt-1 break-words text-base font-medium leading-6">{variant.title}</p>
                </div>
                <p
                  className={`text-2xl font-semibold ${
                    variant.score >= 80
                      ? "text-[var(--success)]"
                      : variant.score >= 50
                        ? "text-[var(--primary)]"
                        : "text-[var(--danger)]"
                  }`}
                >
                  {variant.score}
                </p>
              </div>

              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Characters", `${variant.characters} of ${TITLE_MAX_CHARS}`],
                  ["Words", String(variant.words)],
                  [
                    "Keyword position",
                    variant.keywordIndex >= 0 ? `character ${variant.keywordIndex + 1}` : "not present",
                  ],
                  ["Words in capitals", String(variant.shouted)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-4 text-sm font-semibold">How it appears</h3>
              <ul className="mt-2 space-y-2">
                {variant.previews.map((surface) => (
                  <li
                    key={surface.id}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      {surface.label} · about {surface.visible} characters
                    </p>
                    <p className="mt-1 break-words text-sm">
                      {surface.text}
                      {surface.clipped ? (
                        <span className="text-[var(--danger)]">…</span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>

              <h3 className="mt-4 text-sm font-semibold">Score breakdown</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Criterion
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Earned
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant.breakdown.map((item) => (
                      <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.label}</td>
                        <td className="py-2 text-right font-semibold">
                          {item.earned} / {item.weight}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {variant.notes.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                  {variant.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm font-medium text-[var(--success)]">
                  Nothing flagged on this variant.
                </p>
              )}
            </article>
          ))}
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the score measures</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {RUBRIC.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4">
              <span>{item.label}</span>
              <span className="shrink-0 font-semibold text-[var(--foreground)]">{item.weight}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Visible-character figures are approximations —{" "}
          {SURFACES.map((surface) => `${surface.label} around ${surface.visible}`).join(", ")} —
          because the real cut-off depends on device width, font and language.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        No tool can predict click-through rate. This measures readability and structure only; run a
        real test in YouTube Studio to learn what your audience actually clicks.
      </p>
    </main>
  );
}
