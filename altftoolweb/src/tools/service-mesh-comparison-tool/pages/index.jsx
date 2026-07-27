"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCompare, RotateCcw } from "lucide-react";

import { CRITERIA, MESHES, WEIGHT_MAX, WEIGHT_MIN, scoreMeshes } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  featureBreadth: 3,
  operationalSimplicity: 4,
  resourceEfficiency: 3,
  heterogeneousSupport: 1,
};

const DASH = "—";

export default function ToolHome() {
  const [weights, setWeights] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreMeshes(weights), [weights]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Service mesh ranking for my priorities:",
      ...result.ranking.map(
        (r, i) => `${i + 1}. ${r.mesh.name} — ${r.score}/100 (${r.mesh.dataPlane})`,
      ),
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
    setWeights(DEFAULTS);
    setCopied(false);
  };

  const setWeight = (id, value) => {
    setWeights((prev) => ({ ...prev, [id]: Number(value) }));
  };

  const top = hasError ? null : result.ranking[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitCompare className="h-4 w-4" aria-hidden="true" />
          Kubernetes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Service Mesh Comparison Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weight what matters to you — feature breadth, operational simplicity, resource efficiency,
          VM/multi-cluster support — and get a transparent weighted ranking of Istio, Linkerd,
          Consul Connect and Cilium.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">Your priorities (0 = ignore, 5 = critical)</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {CRITERIA.map((criterion) => (
            <div key={criterion.id}>
              <label className={LABEL_CLASS} htmlFor={`smc-${criterion.id}`}>
                {criterion.label}: <span className="text-[var(--primary)]">{weights[criterion.id]}</span>
              </label>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{criterion.blurb}</p>
              <input
                id={`smc-${criterion.id}`}
                className="mt-2 h-11 w-full accent-[var(--primary)] focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                type="range"
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                step="1"
                value={weights[criterion.id]}
                onChange={(event) => setWeight(criterion.id, event.target.value)}
              />
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
              Best match for your weights
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : top.mesh.name}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : top.mesh.bestFor}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the service mesh ranking"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all weights to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {result.ranking.map((entry, index) => (
              <div key={entry.mesh.id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold">
                    {index + 1}. {entry.mesh.name}
                  </dt>
                  <dd className="font-semibold text-[var(--primary)]">{entry.score}/100</dd>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${entry.mesh.name} scores ${entry.score} out of 100`}
                >
                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${entry.score}%` }} />
                </div>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Fact sheet</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Mesh</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Data plane</th>
                <th scope="col" className="py-2 pr-3 font-semibold">mTLS</th>
                <th scope="col" className="py-2 font-semibold">Governance</th>
              </tr>
            </thead>
            <tbody>
              {MESHES.map((mesh) => (
                <tr key={mesh.id} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2 pr-3 font-semibold">{mesh.name}</td>
                  <td className="py-2 pr-3">{mesh.dataPlane}</td>
                  <td className="py-2 pr-3">{mesh.mtls}</td>
                  <td className="py-2">{mesh.apex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ratings are 1-5 editorial scores derived from each project&apos;s documentation as of
        mid-2025; capabilities evolve quickly (Istio ambient, Cilium mutual auth). Run your own
        proof of concept before committing a platform to any mesh.
      </p>
    </main>
  );
}
