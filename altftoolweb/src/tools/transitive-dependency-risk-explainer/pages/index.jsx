"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Network, RotateCcw } from "lucide-react";

import { ECOSYSTEM_PRESETS, modelDependencyRisk, recommendedControls } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  directDeps: "25",
  branchingFactor: "2.6",
  maxDepth: "4",
  sharingPercent: "55",
  advisoryRatePerYear: "0.05",
  installScriptPercent: "8",
  reviewMinutes: "20",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const model = useMemo(
    () =>
      modelDependencyRisk({
        directDeps: Number(form.directDeps),
        branchingFactor: Number(form.branchingFactor),
        maxDepth: Number(form.maxDepth),
        sharingPercent: Number(form.sharingPercent),
        advisoryRatePerYear: Number(form.advisoryRatePerYear),
        installScriptPercent: Number(form.installScriptPercent),
        reviewMinutes: Number(form.reviewMinutes),
        ...Object.fromEntries(
          Object.entries(form).map(([key, value]) => [key, value.trim() === "" ? "" : Number(value)]),
        ),
      }),
    [form],
  );
  const hasError = Boolean(model.error);
  const controls = useMemo(() => recommendedControls(model), [model]);

  const applyPreset = (preset) =>
    setForm((current) => ({
      ...current,
      directDeps: String(preset.direct),
      branchingFactor: String(preset.branching),
      sharingPercent: String(preset.sharing),
      installScriptPercent: String(preset.scriptShare),
    }));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Transitive dependency exposure",
      `Direct dependencies: ${NUM.format(Number(form.directDeps))}`,
      `Total packages installed (modelled): ${NUM.format(model.totalPackages)}`,
      `Transitive packages you never chose: ${NUM.format(model.transitivePackages)}`,
      `Expansion factor: ${DEC2.format(model.expansionFactor)}x`,
      `Share of the graph you selected yourself: ${DEC.format(model.vettedShare)}%`,
      `Expected advisories per year: ${DEC2.format(model.expectedAdvisories)}`,
      `Chance of at least one advisory in a year: ${DEC.format(model.advisoryProbability)}%`,
      `Packages that can run install scripts: ${NUM.format(model.scriptPackages)}`,
      `Hours to review every package once: ${DEC.format(model.auditHours)}`,
      `Band: ${model.band}`,
    ].join("\n");
  }, [hasError, model, form.directDeps]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const fields = [
    ["directDeps", "Direct dependencies in your manifest", { min: "1", step: "1" }],
    ["branchingFactor", "Average dependencies each package declares", { min: "0", step: "0.1" }],
    ["maxDepth", "Depth to expand (levels)", { min: "1", max: "15", step: "1" }],
    ["sharingPercent", "Already-installed share at each new level (%)", { min: "0", max: "99", step: "1" }],
    ["advisoryRatePerYear", "Advisories per package per year", { min: "0", max: "5", step: "0.01" }],
    ["installScriptPercent", "Packages that run install scripts (%)", { min: "0", max: "100", step: "1" }],
    ["reviewMinutes", "Minutes to review one package", { min: "0", step: "1" }],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Network className="h-4 w-4" aria-hidden="true" />
          Supply chain
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Transitive Dependency Risk Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Expand a handful of direct dependencies into the full installed graph, then see how many
          packages you never chose, how often an advisory should be expected, and how long a full
          review would take.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Start from a typical shape</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ECOSYSTEM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, attrs]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`td-${key}`}>
                {label}
              </label>
              <input
                id={`td-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                {...attrs}
                value={form[key]}
                onChange={(event) => set(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Packages actually installed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(model.totalPackages)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input to run the model"
                : `${NUM.format(model.transitivePackages)} of them arrived without you choosing them`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the dependency exposure summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {model.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Expansion factor", hasError ? DASH : `${DEC2.format(model.expansionFactor)}x`],
            ["Share of the graph you picked yourself", hasError ? DASH : `${DEC.format(model.vettedShare)}%`],
            ["Expected advisories per year", hasError ? DASH : DEC2.format(model.expectedAdvisories)],
            [
              "Chance of at least one advisory this year",
              hasError ? DASH : `${DEC.format(model.advisoryProbability)}%`,
            ],
            ["Packages that can run install scripts", hasError ? DASH : NUM.format(model.scriptPackages)],
            ["Hours to review every package once", hasError ? DASH : DEC.format(model.auditHours)],
            ["Exposure band", hasError ? DASH : model.band],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {model.bandNote}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the packages come from</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Depth</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Reachable</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">New packages</th>
                  <th scope="col" className="py-2 text-right font-semibold">Running total</th>
                </tr>
              </thead>
              <tbody>
                {model.levels.map((level) => (
                  <tr key={level.depth} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {level.depth === 1 ? "1 (direct)" : level.depth}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(level.raw)}
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(level.unique)}</td>
                    <td className="py-2 text-right font-semibold">{NUM.format(level.cumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            &quot;Reachable&quot; counts every edge in the tree; &quot;new packages&quot; applies the
            already-installed share, because in a real lock file the same library is pulled in from
            many places but installed once.
          </p>
        </section>
      )}

      {!hasError && controls.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Controls this graph justifies</h2>
          <ul className="mt-3 grid gap-3 text-sm">
            {controls.map((control) => (
              <li key={control.id} className="rounded-lg border border-[var(--border)] p-3">
                <p className="font-semibold">{control.title}</p>
                <p className="mt-1 text-[var(--muted-foreground)]">{control.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Every figure here comes from the assumptions you entered — it is a model, not a scan. Get the
        real shape of your graph from <code>npm ls --all</code>, <code>pip list</code>,{" "}
        <code>go mod graph</code> or <code>mvn dependency:tree</code>, and treat this as informational
        rather than a security assessment.
      </p>
    </main>
  );
}
