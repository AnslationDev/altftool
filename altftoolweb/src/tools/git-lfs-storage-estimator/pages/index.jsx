"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, RotateCcw } from "lucide-react";

import {
  FREE_BANDWIDTH_GIB,
  FREE_STORAGE_GIB,
  PACK_BANDWIDTH_GIB,
  PACK_PRICE_USD,
  PACK_STORAGE_GIB,
  estimateLfs,
} from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const GIB = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  trackedFiles: "200",
  avgFileSizeMB: "25",
  newVersionsPerFilePerMonth: "2",
  months: "12",
  clonesPerMonth: "30",
};

export default function ToolHome() {
  const [trackedFiles, setTrackedFiles] = useState(DEFAULTS.trackedFiles);
  const [avgFileSizeMB, setAvgFileSizeMB] = useState(DEFAULTS.avgFileSizeMB);
  const [newVersionsPerFilePerMonth, setNewVersionsPerFilePerMonth] = useState(
    DEFAULTS.newVersionsPerFilePerMonth,
  );
  const [months, setMonths] = useState(DEFAULTS.months);
  const [clonesPerMonth, setClonesPerMonth] = useState(DEFAULTS.clonesPerMonth);
  const [copied, setCopied] = useState(false);

  const num = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      estimateLfs({
        trackedFiles: num(trackedFiles),
        avgFileSizeMB: num(avgFileSizeMB),
        newVersionsPerFilePerMonth: num(newVersionsPerFilePerMonth),
        months: num(months),
        clonesPerMonth: num(clonesPerMonth),
      }),
    [trackedFiles, avgFileSizeMB, newVersionsPerFilePerMonth, months, clonesPerMonth],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Git LFS estimate",
      `Working set at HEAD: ${GIB.format(result.currentSetGiB)} GiB`,
      `Server storage after ${result.horizonMonths} months: ${GIB.format(result.storageAtEndGiB)} GiB`,
      `Monthly clone bandwidth: ${GIB.format(result.monthlyBandwidthGiB)} GiB`,
      `GitHub data packs needed: ${result.packsNeeded} (bound by ${result.boundBy})`,
      `Estimated cost: ${USD.format(result.monthlyCostUsd)}/month`,
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
    setTrackedFiles(DEFAULTS.trackedFiles);
    setAvgFileSizeMB(DEFAULTS.avgFileSizeMB);
    setNewVersionsPerFilePerMonth(DEFAULTS.newVersionsPerFilePerMonth);
    setMonths(DEFAULTS.months);
    setClonesPerMonth(DEFAULTS.clonesPerMonth);
    setCopied(false);
  };

  const fields = [
    {
      id: "lfs-files",
      label: "LFS-tracked files at HEAD",
      value: trackedFiles,
      set: setTrackedFiles,
      min: "1",
      step: "1",
    },
    {
      id: "lfs-size",
      label: "Average file size (MiB)",
      value: avgFileSizeMB,
      set: setAvgFileSizeMB,
      min: "0",
      step: "1",
    },
    {
      id: "lfs-versions",
      label: "New versions per file per month",
      value: newVersionsPerFilePerMonth,
      set: setNewVersionsPerFilePerMonth,
      min: "0",
      step: "0.5",
    },
    {
      id: "lfs-months",
      label: "Projection horizon (months)",
      value: months,
      set: setMonths,
      min: "1",
      step: "1",
    },
    {
      id: "lfs-clones",
      label: "Fresh clones per month (incl. CI)",
      value: clonesPerMonth,
      set: setClonesPerMonth,
      min: "0",
      step: "1",
    },
  ];

  const rows = hasError
    ? [
        ["Working set at HEAD", DASH],
        ["Storage on server at horizon", DASH],
        ["Monthly clone bandwidth", DASH],
        ["Data packs needed", DASH],
      ]
    : [
        ["Working set at HEAD (one clone downloads this)", `${GIB.format(result.currentSetGiB)} GiB`],
        [
          `Storage on server after ${result.horizonMonths} months`,
          `${GIB.format(result.storageAtEndGiB)} GiB`,
        ],
        ["…of which new versions pushed", `${GIB.format(result.newVersionsGiB)} GiB`],
        ["Monthly clone bandwidth", `${GIB.format(result.monthlyBandwidthGiB)} GiB`],
        [
          `Data packs needed (${PACK_STORAGE_GIB} GiB storage + ${PACK_BANDWIDTH_GIB} GiB bandwidth each)`,
          `${result.packsNeeded} — bound by ${result.boundBy}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Git LFS Storage Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Project how much Git LFS storage your repository will accumulate, the bandwidth clones
          will burn each month, and what that means in GitHub data packs
          ({USD.format(PACK_PRICE_USD)}/month for {PACK_STORAGE_GIB} GiB storage +{" "}
          {PACK_BANDWIDTH_GIB} GiB bandwidth).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
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
              Estimated GitHub LFS cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${USD.format(result.monthlyCostUsd)}/mo`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.packsNeeded === 0
                  ? `Fits in the free tier (${FREE_STORAGE_GIB} GiB storage, ${FREE_BANDWIDTH_GIB} GiB/month bandwidth).`
                  : `${result.packsNeeded} data pack${result.packsNeeded === 1 ? "" : "s"} — the binding constraint is ${result.boundBy}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the LFS storage estimate"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
          Model: LFS keeps every pushed version (nothing is purged by default), while a fresh
          clone downloads only the current version of each file. Incremental pulls by existing
          checkouts are not counted — treat bandwidth as a lower bound. Pricing uses GitHub's
          published data-pack scheme ({USD.format(PACK_PRICE_USD)}/pack); other hosts and newer
          metered plans differ, so confirm current rates with your provider.
        </p>
      </section>
    </main>
  );
}
