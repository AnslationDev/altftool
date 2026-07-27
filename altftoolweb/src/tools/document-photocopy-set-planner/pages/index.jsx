"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";

import { MAX_STAGES, STAGE_PRESETS, planPhotocopySets } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  stages: STAGE_PRESETS.map((stage) => ({
    name: stage.name,
    sets: String(stage.setsPerApplication),
    applications: String(stage.applications),
    attested: stage.attested,
  })),
  pagesPerSet: "12",
  spareSets: "2",
  perPageCost: "2",
};

const DASH = "—";

export default function ToolHome() {
  const [stages, setStages] = useState(DEFAULTS.stages);
  const [pagesPerSet, setPagesPerSet] = useState(DEFAULTS.pagesPerSet);
  const [spareSets, setSpareSets] = useState(DEFAULTS.spareSets);
  const [perPageCost, setPerPageCost] = useState(DEFAULTS.perPageCost);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planPhotocopySets({
        stages: stages.map((stage) => ({
          name: stage.name,
          setsPerApplication: stage.sets.trim() === "" ? Number.NaN : Number(stage.sets),
          applications: stage.applications.trim() === "" ? Number.NaN : Number(stage.applications),
          attested: stage.attested,
        })),
        pagesPerSet: pagesPerSet.trim() === "" ? Number.NaN : Number(pagesPerSet),
        spareSets: spareSets.trim() === "" ? Number.NaN : Number(spareSets),
        perPageCost: perPageCost.trim() === "" ? 0 : Number(perPageCost),
      }),
    [stages, pagesPerSet, spareSets, perPageCost],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Photocopy set plan",
      `Total sets to prepare: ${NUM.format(result.totalSets)} (${NUM.format(result.requiredSets)} required + ${NUM.format(result.spareSets)} spare)`,
      `Sets needing attestation: ${NUM.format(result.attestedSets)}`,
      `Total pages: ${NUM.format(result.totalPages)} (${NUM.format(result.pagesPerSet)} pages per set)`,
      `Estimated copying cost: ${INR.format(result.totalCost)}`,
      "",
      ...result.stageBreakdown.map(
        (stage) =>
          `${stage.name}: ${stage.setsPerApplication} set(s) x ${stage.applications} application(s) = ${stage.sets} sets${stage.attested ? " (attested)" : ""}`,
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
    setStages(DEFAULTS.stages);
    setPagesPerSet(DEFAULTS.pagesPerSet);
    setSpareSets(DEFAULTS.spareSets);
    setPerPageCost(DEFAULTS.perPageCost);
    setCopied(false);
  };

  const updateStage = (index, patch) => {
    setStages((prev) => prev.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)));
  };

  const rows = hasError
    ? [
        ["Required sets (all stages)", DASH],
        ["Spare sets", DASH],
        ["Sets needing attestation", DASH],
        ["Total pages to copy", DASH],
        ["Estimated cost", DASH],
      ]
    : [
        ["Required sets (all stages)", NUM.format(result.requiredSets)],
        ["Spare sets", NUM.format(result.spareSets)],
        ["Sets needing attestation", NUM.format(result.attestedSets)],
        ["Total pages to copy", NUM.format(result.totalPages)],
        ["Estimated cost", INR.format(result.totalCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Document vault
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Photocopy Set Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List each stage of your admission or recruitment process, how many document sets it asks
          for, and how many applications you are filing — get total sets, pages, attestation count
          and copying cost in one shot.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className={LABEL_CLASS}>Stages</p>
        <div className="mt-2 space-y-4">
          {stages.map((stage, index) => (
            <div
              key={index}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`pcp-name-${index}`}>
                  Stage {index + 1} name
                </label>
                <input
                  id={`pcp-name-${index}`}
                  className={INPUT_CLASS}
                  type="text"
                  value={stage.name}
                  placeholder="Stage name"
                  onChange={(event) => updateStage(index, { name: event.target.value })}
                />
                {stages.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStages((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove stage ${index + 1}`}
                    className={`${GHOST_BTN} shrink-0 px-3`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`pcp-sets-${index}`}>
                    Sets per application
                  </label>
                  <input
                    id={`pcp-sets-${index}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="10"
                    step="1"
                    value={stage.sets}
                    onChange={(event) => updateStage(index, { sets: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`pcp-apps-${index}`}>
                    Applications / rounds
                  </label>
                  <input
                    id={`pcp-apps-${index}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="50"
                    step="1"
                    value={stage.applications}
                    onChange={(event) => updateStage(index, { applications: event.target.value })}
                  />
                </div>
                <label
                  className="flex min-h-11 cursor-pointer items-end gap-2 pb-2 text-sm text-[var(--foreground)] sm:items-center sm:pb-0"
                  htmlFor={`pcp-att-${index}`}
                >
                  <input
                    id={`pcp-att-${index}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={stage.attested}
                    onChange={(event) => updateStage(index, { attested: event.target.checked })}
                  />
                  Needs attestation
                </label>
              </div>
            </div>
          ))}
        </div>
        {stages.length < MAX_STAGES ? (
          <button
            type="button"
            onClick={() =>
              setStages((prev) => [
                ...prev,
                { name: "", sets: "1", applications: "1", attested: false },
              ])
            }
            className={`${GHOST_BTN} mt-3`}
            aria-label="Add another stage"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add stage
          </button>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="pcp-pages">
              Pages in one set
            </label>
            <input
              id="pcp-pages"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={pagesPerSet}
              onChange={(event) => setPagesPerSet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcp-spare">
              Spare sets
            </label>
            <input
              id="pcp-spare"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={spareSets}
              onChange={(event) => setSpareSets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcp-cost">
              Cost per page (INR)
            </label>
            <input
              id="pcp-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={perPageCost}
              onChange={(event) => setPerPageCost(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Sets to prepare
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.totalSets)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : `${NUM.format(result.requiredSets)} required by the stages plus ${NUM.format(result.spareSets)} spare — ${NUM.format(result.totalPages)} pages of copying in all.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the photocopy plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Per-stage breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Stage</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Sets</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Pages</th>
                  <th scope="col" className="py-2 text-right font-semibold">Attested?</th>
                </tr>
              </thead>
              <tbody>
                {result.stageBreakdown.map((stage) => (
                  <tr key={stage.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{stage.name}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{NUM.format(stage.sets)}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(stage.pages)}</td>
                    <td className="py-2 text-right">{stage.attested ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Set counts per stage come from your notification or prospectus — this planner does the
        arithmetic and adds the customary spare sets. Carry originals separately; most Indian
        processes accept self-attested copies and ask to see originals only for verification.
      </p>
    </main>
  );
}
