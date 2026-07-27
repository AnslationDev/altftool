"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, TableProperties, Trash2 } from "lucide-react";

import {
  DEFAULT_CRITERIA,
  SCORE_MAX,
  SCORE_MIN,
  computeVendorMatrix,
} from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const MAX_VENDORS = 6;

const SCORE_OPTIONS = Array.from(
  { length: SCORE_MAX - SCORE_MIN + 1 },
  (_, i) => SCORE_MIN + i,
);

const DEFAULT_VENDORS = [
  { name: "Vendor A", scores: { cost: "4", control: "3", support: "4", compliance: "5" } },
  { name: "Vendor B", scores: { cost: "3", control: "5", support: "3", compliance: "4" } },
];

const cloneDefaults = () => ({
  weights: Object.fromEntries(DEFAULT_CRITERIA.map((c) => [c.id, String(c.weight)])),
  vendors: DEFAULT_VENDORS.map((v) => ({ name: v.name, scores: { ...v.scores } })),
});

export default function ToolHome() {
  const initial = useMemo(() => cloneDefaults(), []);
  const [weights, setWeights] = useState(initial.weights);
  const [vendors, setVendors] = useState(initial.vendors);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeVendorMatrix({
        criteria: DEFAULT_CRITERIA.map((c) => ({
          id: c.id,
          label: c.label,
          weight: weights[c.id]?.trim() === "" ? Number.NaN : Number(weights[c.id]),
        })),
        vendors: vendors.map((v) => ({
          name: v.name,
          scores: Object.fromEntries(
            DEFAULT_CRITERIA.map((c) => [c.id, Number(v.scores[c.id])]),
          ),
        })),
      }),
    [weights, vendors],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["AI vendor comparison matrix (weighted scores out of 100)"];
    for (const r of result.ranking) {
      lines.push(
        `${r.rank}. ${r.name}: ${PCT.format(r.normalizedScore)}/100 (${r.band}) — ` +
          r.perCriterion.map((p) => `${p.label} ${p.score}/5`).join(", "),
      );
    }
    lines.push(
      `Weights: ${DEFAULT_CRITERIA.map((c) => `${c.label} ${weights[c.id]}`).join(", ")}`,
    );
    return lines.join("\n");
  }, [hasError, result, weights]);

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
    const next = cloneDefaults();
    setWeights(next.weights);
    setVendors(next.vendors);
    setCopied(false);
  };

  const setWeight = (id, value) => setWeights((prev) => ({ ...prev, [id]: value }));

  const setVendorName = (index, value) =>
    setVendors((prev) => prev.map((v, i) => (i === index ? { ...v, name: value } : v)));

  const setVendorScore = (index, critId, value) =>
    setVendors((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, scores: { ...v.scores, [critId]: value } } : v,
      ),
    );

  const addVendor = () =>
    setVendors((prev) => {
      if (prev.length >= MAX_VENDORS) return prev;
      return [
        ...prev,
        {
          name: `Vendor ${String.fromCharCode(65 + prev.length)}`,
          scores: Object.fromEntries(DEFAULT_CRITERIA.map((c) => [c.id, "3"])),
        },
      ];
    });

  const removeVendor = (index) =>
    setVendors((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TableProperties className="h-4 w-4" aria-hidden="true" />
          AI procurement
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Vendor Comparison Matrix
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Score each vendor from 1 to 5 on cost, control, support and compliance, set how much
          each criterion matters, and get a weighted 0–100 ranking using the standard
          weighted-sum decision method.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Criterion weights</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Any positive numbers work — scores are normalised by the total weight.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {DEFAULT_CRITERIA.map((c) => (
            <div key={c.id}>
              <label className={LABEL_CLASS} htmlFor={`vm-weight-${c.id}`}>
                {c.label} weight
              </label>
              <input
                id={`vm-weight-${c.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="100"
                step="5"
                value={weights[c.id]}
                onChange={(event) => setWeight(c.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{c.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Vendor scores (1 = poor, 5 = excellent)</h2>
          <button
            type="button"
            onClick={addVendor}
            disabled={vendors.length >= MAX_VENDORS}
            aria-label="Add another vendor row"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add vendor
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {vendors.map((vendor, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-end gap-3">
                <div className="grow">
                  <label className={LABEL_CLASS} htmlFor={`vm-name-${index}`}>
                    Vendor name
                  </label>
                  <input
                    id={`vm-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={vendor.name}
                    onChange={(event) => setVendorName(index, event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVendor(index)}
                  disabled={vendors.length <= 1}
                  aria-label={`Remove ${vendor.name || "this vendor"}`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {DEFAULT_CRITERIA.map((c) => (
                  <div key={c.id}>
                    <label className={LABEL_CLASS} htmlFor={`vm-score-${index}-${c.id}`}>
                      {c.label} score
                    </label>
                    <select
                      id={`vm-score-${index}-${c.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={vendor.scores[c.id]}
                      onChange={(event) => setVendorScore(index, c.id, event.target.value)}
                    >
                      {SCORE_OPTIONS.map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
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
              Top-ranked vendor
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.bestName}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.isTie
                  ? `Tied at ${PCT.format(result.bestScore)}/100 — adjust weights to break the tie.`
                  : `${PCT.format(result.bestScore)}/100 weighted score, ${PCT.format(result.marginOverRunnerUp)} points ahead of the runner-up.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the vendor comparison result"
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
              aria-label="Reset the matrix to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rank
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Vendor
                </th>
                {DEFAULT_CRITERIA.map((c) => (
                  <th key={c.id} scope="col" className="py-2 pr-3 text-right font-semibold">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="py-2 text-right font-semibold">
                  Score /100
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td colSpan={DEFAULT_CRITERIA.length + 3} className="py-3 text-center">
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.ranking.map((r) => (
                  <tr key={r.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{r.rank}</td>
                    <td className="py-2 pr-3 font-semibold">{r.name}</td>
                    {r.perCriterion.map((p) => (
                      <td key={p.id} className="py-2 pr-3 text-right">
                        {p.score}/5
                      </td>
                    ))}
                    <td className="py-2 text-right font-semibold text-[var(--primary)]">
                      {PCT.format(r.normalizedScore)}
                      <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                        {r.band}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational aid only. A weighted matrix structures a decision but does not replace
        security review, legal review of the vendor's data processing agreement, or a paid
        proof-of-concept.
      </p>
    </main>
  );
}
