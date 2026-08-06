"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Plus, Radio, RotateCcw, Trash2 } from "lucide-react";

import {
  AD_LOAD_WARNING,
  DEFAULT_SEGMENTS,
  DEFAULT_WPM,
  MAX_EPISODE_MINUTES,
  MAX_WPM,
  MIN_WPM,
  planEpisode,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_TARGET = "35";

const makeDefaultRows = () =>
  DEFAULT_SEGMENTS.map((segment, index) => ({
    id: index + 1,
    name: segment.name,
    mode: segment.mode,
    minutes: String(segment.minutes),
    weight: String(segment.weight),
    isAd: segment.isAd,
  }));

export default function ToolHome() {
  const [targetMinutes, setTargetMinutes] = useState(DEFAULT_TARGET);
  const [speakingRate, setSpeakingRate] = useState(String(DEFAULT_WPM));
  const [rows, setRows] = useState(makeDefaultRows);
  const [copied, setCopied] = useState(false);
  const nextIdRef = useRef(DEFAULT_SEGMENTS.length + 1);

  const result = useMemo(
    () =>
      planEpisode({
        targetMinutes: targetMinutes.trim() === "" ? NaN : Number(targetMinutes),
        speakingRate: speakingRate.trim() === "" ? NaN : Number(speakingRate),
        segments: rows.map((row) => ({
          name: row.name,
          mode: row.mode,
          minutes: row.minutes.trim() === "" ? NaN : Number(row.minutes),
          weight: row.weight.trim() === "" ? NaN : Number(row.weight),
          isAd: row.isAd,
        })),
      }),
    [targetMinutes, speakingRate, rows],
  );

  const error = result.error || "";

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    setCopied(false);
  };

  const addRow = () => {
    setRows((current) => {
      if (current.length >= 16) return current;
      const id = nextIdRef.current;
      nextIdRef.current += 1;
      return [
        ...current,
        { id, name: `Segment ${current.length + 1}`, mode: "flex", minutes: "0", weight: "1", isAd: false },
      ];
    });
    setCopied(false);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
    setCopied(false);
  };

  const reset = () => {
    setTargetMinutes(DEFAULT_TARGET);
    setSpeakingRate(String(DEFAULT_WPM));
    setRows(makeDefaultRows());
    nextIdRef.current = DEFAULT_SEGMENTS.length + 1;
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (error) return "";
    const lines = [
      "Podcast episode length plan",
      `Target runtime: ${result.runtime} (${NUM.format(result.target)} minutes) at ${NUM.format(result.rate)} wpm`,
      `Advertising: ${NUM1.format(result.adMinutes)} min (${PCT.format(result.adShare * 100)}% of runtime)${
        result.adLoadHigh ? " — above the 15% listener drop-off guideline" : ""
      }`,
      `Total script: about ${NUM.format(result.totalWords)} words`,
      "",
    ];
    for (const row of result.rows) {
      lines.push(
        `${row.start}–${row.end} ${row.name}${row.isAd ? " (ad)" : ""}: ${NUM1.format(row.minutes)} min, ~${NUM.format(row.words)} words`,
      );
    }
    return lines.join("\n");
  }, [error, result]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Radio className="h-4 w-4" aria-hidden="true" />
          Show planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Podcast Episode Length Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a target runtime, hold your fixed segments (intro, ads, outro) at the durations you
          give them, and split whatever time is left between the flexible segments in proportion
          to their weight. Every block comes back with a start/end timestamp, a share of the
          episode and a word budget.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-target">
              Target length (minutes)
            </label>
            <input
              id="pod-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max={MAX_EPISODE_MINUTES}
              step="0.5"
              value={targetMinutes}
              onChange={(event) => {
                setTargetMinutes(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pod-rate">
              Speaking rate (words per minute)
            </label>
            <input
              id="pod-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WPM}
              max={MAX_WPM}
              step="1"
              value={speakingRate}
              onChange={(event) => {
                setSpeakingRate(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">Running order</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Fixed segments keep the duration you set. Flexible segments share whatever time is left,
          in proportion to their weight — a weight of 2 gets twice the airtime of a weight of 1.
        </p>

        <ul className="mt-3 space-y-3">
          {rows.map((row, index) => (
            <li key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pod-name-${row.id}`}>
                    Segment {index + 1} name
                  </label>
                  <input
                    id={`pod-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    placeholder={`Segment ${index + 1}`}
                    onChange={(event) => updateRow(row.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pod-mode-${row.id}`}>
                    Type
                  </label>
                  <select
                    id={`pod-mode-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.mode}
                    onChange={(event) => updateRow(row.id, { mode: event.target.value })}
                  >
                    <option value="fixed">Fixed duration</option>
                    <option value="flex">Flexible (shares leftover time)</option>
                  </select>
                </div>
                {row.mode === "fixed" ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`pod-minutes-${row.id}`}>
                      Minutes
                    </label>
                    <input
                      id={`pod-minutes-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.25"
                      value={row.minutes}
                      onChange={(event) => updateRow(row.id, { minutes: event.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`pod-weight-${row.id}`}>
                      Weight
                    </label>
                    <input
                      id={`pod-weight-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0.1"
                      step="0.5"
                      value={row.weight}
                      onChange={(event) => updateRow(row.id, { weight: event.target.value })}
                    />
                  </div>
                )}
                <div className="flex items-end justify-between gap-2 sm:flex-col sm:items-stretch sm:justify-start">
                  <label
                    className="flex min-h-11 items-center gap-2 text-sm"
                    htmlFor={`pod-ad-${row.id}`}
                  >
                    <input
                      id={`pod-ad-${row.id}`}
                      type="checkbox"
                      className={CHECK_CLASS}
                      checked={row.isAd}
                      onChange={(event) => updateRow(row.id, { isAd: event.target.checked })}
                    />
                    <span>Ad/sponsor</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove segment ${index + 1}`}
                    disabled={rows.length <= 1}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add segment
        </button>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Episode runtime
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : result.runtime}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the running order above to see the plan."
                : `${NUM.format(result.rows.length)} segments, ~${NUM.format(result.totalWords)} words total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!summary}
              aria-label="Copy the episode plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!error && result.adLoadHigh ? (
          <p className="mt-4 rounded-md border border-[var(--warning)] bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
            Advertising is {PCT.format(result.adShare * 100)}% of runtime, above the{" "}
            {PCT.format(AD_LOAD_WARNING * 100)}% level where listener drop-off complaints
            typically start.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fixed segments total", error ? DASH : `${NUM1.format(result.fixedMinutes)} min`],
            [
              "Flexible time to share",
              error ? DASH : `${NUM1.format(result.flexPool)} min across weight ${NUM1.format(result.flexWeight)}`,
            ],
            [
              "Advertising",
              error ? DASH : `${NUM1.format(result.adMinutes)} min (${PCT.format(result.adShare * 100)}%)`,
            ],
            ["Content minutes (non-ad)", error ? DASH : `${NUM1.format(result.contentMinutes)} min`],
            [
              "Total script",
              error ? DASH : `${NUM.format(result.totalWords)} words at ${NUM.format(result.rate)} wpm`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Segment by segment</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Segment
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Start
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    End
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Duration
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Share
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Words
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, index) => (
                  <tr key={`${row.name}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.name}
                      {row.isAd ? (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                          Ad
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.start}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.end}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{row.duration}</td>
                    <td className="py-2 pr-3 text-right">{PCT.format(row.share * 100)}%</td>
                    <td className="py-2 text-right">{row.isAd ? DASH : NUM.format(row.words)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Speaking rate defaults to 150 words per minute, in the 140-160 wpm band measured for
        unhurried conversational English; audiobook narration is standardised near the same
        figure. Standard IAB ad spot lengths are 15, 30 and 60 seconds — enter those as fixed
        segments and tick &ldquo;Ad/sponsor&rdquo; to keep the ad-load figure honest.
      </p>
    </main>
  );
}
