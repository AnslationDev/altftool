"use client";

import { useMemo, useState } from "react";
import { Check, Copy, DownloadCloud, RotateCcw } from "lucide-react";
import {
  ACCOUNT_WEIGHTS,
  DOWNLOAD_LINK_VALID_DAYS,
  EXPORT_CATEGORIES,
  REQUEST_STEPS,
  SCHEDULED_EXPORT_COUNT,
  SPLIT_OPTIONS_GB,
  estimateExport,
  formatSize,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SELECTED = ["mail", "photos", "activity", "timeline"];
const DEFAULT_YEARS = "10";
const DEFAULT_WEIGHT = "typical";
const DEFAULT_SPLIT = 10;

const DASH = "—";

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [weightId, setWeightId] = useState(DEFAULT_WEIGHT);
  const [splitGb, setSplitGb] = useState(DEFAULT_SPLIT);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState([]);

  const result = useMemo(
    () =>
      estimateExport({
        selectedIds: selected,
        accountAgeYears: years.trim() === "" ? Number.NaN : Number(years),
        weightId,
        splitGb,
      }),
    [selected, years, weightId, splitGb],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const toggleStep = (index) => {
    setDone((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Google Takeout export plan",
      `Products selected: ${result.count}`,
      `Estimated archive: ${result.totalLabel}`,
      `Split at ${result.partSizeGb} GB: about ${result.parts} file(s)`,
      `Largest product: ${result.largestLabel} (${Math.round(result.largestShare)}% of the archive)`,
      `Sensitivity: ${result.sensitivityScore}/100 (${result.band})`,
      `Allow up to ${result.waitDays} day(s) for Google to build it`,
      `Download link valid about ${DOWNLOAD_LINK_VALID_DAYS} days`,
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
    setSelected(DEFAULT_SELECTED);
    setYears(DEFAULT_YEARS);
    setWeightId(DEFAULT_WEIGHT);
    setSplitGb(DEFAULT_SPLIT);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <DownloadCloud className="h-4 w-4" aria-hidden="true" />
          Data access
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Google Data Download Request Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose what to pull out of Google Takeout, see roughly how large the archive will be and
          how many part files you will get, and understand what each product actually exposes before
          the download lands on your disk.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Pick the products to export</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {EXPORT_CATEGORIES.map((category) => {
            const checked = selected.includes(category.id);
            return (
              <label
                key={category.id}
                htmlFor={`gtk-${category.id}`}
                className={`flex min-h-11 cursor-pointer gap-3 rounded-md border p-3 transition ${
                  checked
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`gtk-${category.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(category.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{category.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {category.what}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelected(EXPORT_CATEGORIES.map((category) => category.id))}
            className={GHOST_BTN}
          >
            Select all
          </button>
          <button type="button" onClick={() => setSelected([])} className={GHOST_BTN}>
            Deselect all
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. Describe the account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gtk-years">
              Account age (years)
            </label>
            <input
              id="gtk-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="25"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gtk-weight">
              How much media is stored
            </label>
            <select
              id="gtk-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weightId}
              onChange={(event) => setWeightId(event.target.value)}
            >
              {ACCOUNT_WEIGHTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gtk-split">
              Maximum part size Takeout should use
            </label>
            <select
              id="gtk-split"
              className={`mt-2 ${INPUT_CLASS}`}
              value={splitGb}
              onChange={(event) => setSplitGb(Number(event.target.value))}
            >
              {SPLIT_OPTIONS_GB.map((option) => (
                <option key={option} value={option}>
                  {option} GB per file
                </option>
              ))}
            </select>
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
              Estimated archive size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.totalLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `About ${NUM.format(result.parts)} file${result.parts === 1 ? "" : "s"} at ${result.partSizeGb} GB each`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Google Takeout export plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the export planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Products selected", hasError ? DASH : NUM.format(result.count)],
            ["Largest single product", hasError ? DASH : result.largestLabel],
            [
              "Share taken by photos, video and files",
              hasError ? DASH : `${Math.round(result.mediaShare)}%`,
            ],
            [
              "Sensitivity of this selection",
              hasError ? DASH : `${result.sensitivityScore}/100 — ${result.band}`,
            ],
            [
              "Allow for preparation",
              hasError ? DASH : `up to ${result.waitDays} day${result.waitDays === 1 ? "" : "s"}`,
            ],
            ["Download link stays valid", `about ${DOWNLOAD_LINK_VALID_DAYS} days`],
            [
              "If you pick the recurring schedule",
              hasError
                ? DASH
                : `${SCHEDULED_EXPORT_COUNT} exports, roughly ${formatSize(result.scheduledTotalMb)} in total`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.criticalCategories.length > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Highest-risk items in this selection: {result.criticalCategories.join(", ")}. Treat the
            archive as if it were your password vault.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Size and risk by product</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Product
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Estimated size
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Sensitivity
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {row.note}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right align-top">{formatSize(row.sizeMb)}</td>
                    <td className="py-2 text-right align-top">{row.sensitivity}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">How to make the request</h2>
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            {done.length}/{REQUEST_STEPS.length} done
          </span>
        </div>
        <ol className="mt-4 space-y-3">
          {REQUEST_STEPS.map(([title, detail], index) => {
            const checked = done.includes(index);
            return (
              <li key={title}>
                <label
                  htmlFor={`gtk-step-${index}`}
                  className="flex min-h-11 cursor-pointer gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <input
                    id={`gtk-step-${index}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStep(index)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${checked ? "text-[var(--success)]" : ""}`}
                    >
                      {index + 1}. {title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {detail}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes are planning estimates for a typical consumer account, not a measurement of yours —
        Takeout shows the real total once the export finishes. This page is informational and is not
        legal advice; consult a qualified professional about your data-protection rights.
      </p>
    </main>
  );
}
