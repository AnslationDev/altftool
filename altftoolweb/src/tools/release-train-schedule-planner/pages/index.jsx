"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrainFront } from "lucide-react";

import {
  MAX_CADENCE_WEEKS,
  MAX_LEAD_DAYS,
  MAX_RELEASES,
  MIN_CADENCE_WEEKS,
  MIN_RELEASES,
  planReleaseTrain,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const num = (value) => (value.trim() === "" ? Number.NaN : Number(value));

const DEFAULTS = {
  firstGaDate: "2026-08-14",
  cadenceWeeks: "4",
  releaseCount: "6",
  codeFreezeLeadDays: "14",
  rcLeadDays: "7",
  avoidWeekends: true,
  versionPrefix: "",
};

export default function ToolHome() {
  const [firstGaDate, setFirstGaDate] = useState(DEFAULTS.firstGaDate);
  const [cadenceWeeks, setCadenceWeeks] = useState(DEFAULTS.cadenceWeeks);
  const [releaseCount, setReleaseCount] = useState(DEFAULTS.releaseCount);
  const [codeFreezeLeadDays, setCodeFreezeLeadDays] = useState(DEFAULTS.codeFreezeLeadDays);
  const [rcLeadDays, setRcLeadDays] = useState(DEFAULTS.rcLeadDays);
  const [avoidWeekends, setAvoidWeekends] = useState(DEFAULTS.avoidWeekends);
  const [versionPrefix, setVersionPrefix] = useState(DEFAULTS.versionPrefix);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planReleaseTrain({
        firstGaDate,
        cadenceWeeks: num(cadenceWeeks),
        releaseCount: num(releaseCount),
        codeFreezeLeadDays: num(codeFreezeLeadDays),
        rcLeadDays: num(rcLeadDays),
        avoidWeekends,
        versionPrefix: versionPrefix.trim(),
      }),
    [firstGaDate, cadenceWeeks, releaseCount, codeFreezeLeadDays, rcLeadDays, avoidWeekends, versionPrefix],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Release train — every ${cadenceWeeks} week(s), freeze ${codeFreezeLeadDays} d and RC ${rcLeadDays} d before GA`,
      "",
      "| Release | Code freeze | RC cut | GA |",
      "| --- | --- | --- | --- |",
      ...result.releases.map(
        (release) =>
          `| ${release.version} | ${release.codeFreeze} (${release.codeFreezeDay}) | ${release.rcCut} (${release.rcCutDay}) | ${release.ga} (${release.gaDay}) |`,
      ),
    ];
    return lines.join("\n");
  }, [hasError, result, cadenceWeeks, codeFreezeLeadDays, rcLeadDays]);

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
    setFirstGaDate(DEFAULTS.firstGaDate);
    setCadenceWeeks(DEFAULTS.cadenceWeeks);
    setReleaseCount(DEFAULTS.releaseCount);
    setCodeFreezeLeadDays(DEFAULTS.codeFreezeLeadDays);
    setRcLeadDays(DEFAULTS.rcLeadDays);
    setAvoidWeekends(DEFAULTS.avoidWeekends);
    setVersionPrefix(DEFAULTS.versionPrefix);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrainFront className="h-4 w-4" aria-hidden="true" />
          Release management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Release Train Schedule Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Releases leave on a fixed cadence and features catch the next train — the model used
          by Chromium&apos;s 4-week cycle and SAFe&apos;s Agile Release Train. Set the cadence
          and lead times to generate every code freeze, RC and GA date.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-first-ga">
              First GA date
            </label>
            <input
              id="rt-first-ga"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={firstGaDate}
              onChange={(event) => setFirstGaDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-cadence">
              Cadence (weeks between GAs, {MIN_CADENCE_WEEKS}–{MAX_CADENCE_WEEKS})
            </label>
            <input
              id="rt-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_CADENCE_WEEKS}
              max={MAX_CADENCE_WEEKS}
              value={cadenceWeeks}
              onChange={(event) => setCadenceWeeks(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-count">
              Releases to plan ({MIN_RELEASES}–{MAX_RELEASES})
            </label>
            <input
              id="rt-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_RELEASES}
              max={MAX_RELEASES}
              value={releaseCount}
              onChange={(event) => setReleaseCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-prefix">
              Version prefix (optional, e.g. &quot;v7.&quot;)
            </label>
            <input
              id="rt-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Release 1, 2, 3…"
              value={versionPrefix}
              onChange={(event) => setVersionPrefix(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-freeze">
              Code freeze lead (days before GA, 0–{MAX_LEAD_DAYS})
            </label>
            <input
              id="rt-freeze"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_LEAD_DAYS}
              value={codeFreezeLeadDays}
              onChange={(event) => setCodeFreezeLeadDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rt-rc">
              RC cut lead (days before GA)
            </label>
            <input
              id="rt-rc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_LEAD_DAYS}
              value={rcLeadDays}
              onChange={(event) => setRcLeadDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The RC comes from the frozen branch, so this cannot exceed the freeze lead.
            </p>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="rt-weekends"
        >
          <input
            id="rt-weekends"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={avoidWeekends}
            onChange={(event) => setAvoidWeekends(event.target.checked)}
          />
          Shift weekend milestones back to Friday (never ship on a Saturday or Sunday)
        </label>
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
              Next GA
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.releases[0].ga}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the schedule."
                : `${result.releases.length} release${result.releases.length === 1 ? "" : "s"} planned, ${result.cadenceDays} days apart, with a ${result.stabilisationDays}-day stabilisation window from freeze to GA.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the release train schedule as Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Release</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Code freeze</th>
                <th scope="col" className="py-2 pr-3 font-semibold">RC cut</th>
                <th scope="col" className="py-2 font-semibold">GA</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2">{DASH}</td>
                </tr>
              ) : (
                result.releases.map((release) => (
                  <tr key={release.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{release.version}</td>
                    <td className="py-2 pr-3">
                      {release.codeFreeze}
                      <span className="ml-1 text-xs text-[var(--muted-foreground)]">{release.codeFreezeDay}</span>
                    </td>
                    <td className="py-2 pr-3">
                      {release.rcCut}
                      <span className="ml-1 text-xs text-[var(--muted-foreground)]">{release.rcCutDay}</span>
                    </td>
                    <td className="py-2">
                      {release.ga}
                      <span className="ml-1 text-xs text-[var(--muted-foreground)]">{release.gaDay}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Lead times are measured from the nominal cadence date so trains stay evenly spaced;
        the weekend shift only moves ship days earlier, never later. Layer your own holiday
        calendar on top before publishing the schedule.
      </p>
    </main>
  );
}
