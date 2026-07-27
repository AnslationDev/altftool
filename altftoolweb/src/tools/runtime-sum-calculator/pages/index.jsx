"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListPlus, RotateCcw } from "lucide-react";

import {
  DEFAULT_FPS,
  TARGET_PRESETS,
  formatClock,
  formatShort,
  sumRuntimes,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DASH = "—";

const DEFAULT_LIST = ["0:42", "1:30", "00:02:15", "90", "00:00:10:12", "1m 20s"].join("\n");
const DEFAULTS = { list: DEFAULT_LIST, fps: String(DEFAULT_FPS), gap: "0", target: "600" };

const FPS_OPTIONS = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60];

const CONTROL =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [list, setList] = useState(DEFAULTS.list);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [gap, setGap] = useState(DEFAULTS.gap);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      sumRuntimes(list.split("\n"), {
        fps: Number(fps),
        gapSeconds: Number(gap),
        targetSeconds: Number(target),
      }),
    [list, fps, gap, target],
  );

  const failed = Boolean(result.error);
  const empty = !failed && result.isEmpty;
  const ready = !failed && !empty;

  const rows = ready
    ? [
        ["Clips counted", `${result.validCount}`],
        ["Clip time only", `${formatClock(result.clipSeconds)} (${NUM2.format(result.clipSeconds)} s)`],
        [
          "Gaps added",
          result.gapTotal > 0
            ? `${result.gapCount} × ${NUM2.format(Number(gap))} s = ${formatShort(result.gapTotal)}`
            : "none",
        ],
        ["Total in seconds", `${NUM2.format(result.totalSeconds)} s`],
        ["Total in minutes", `${NUM2.format(result.totalMinutes)} min`],
        ["Total in frames", `${INT.format(result.totalFrames)} @ ${fps} fps`],
        ["Average clip", `${formatShort(result.averageSeconds)} (${NUM2.format(result.averageSeconds)} s)`],
        ["Median clip", formatShort(result.medianSeconds)],
        ["Longest clip", `${result.longest.input} → ${formatShort(result.longest.seconds)}`],
        ["Shortest clip", `${result.shortest.input} → ${formatShort(result.shortest.seconds)}`],
        ...(result.hasTarget
          ? [
              ["Target slot", formatShort(result.targetSeconds)],
              [
                "Against target",
                `${result.differenceSeconds >= 0 ? "+" : "-"}${formatShort(Math.abs(result.differenceSeconds))} (${NUM1.format(result.percentOfTarget)}% of slot)`,
              ],
            ]
          : []),
      ]
    : [
        ["Clips counted", DASH],
        ["Clip time only", DASH],
        ["Total in seconds", DASH],
        ["Average clip", DASH],
        ["Longest clip", DASH],
        ["Against target", DASH],
      ];

  const clipboardText = useMemo(() => {
    if (!ready) return "";
    return [
      "Runtime Sum",
      `Clips: ${result.validCount}`,
      `Clip time: ${formatClock(result.clipSeconds)}`,
      result.gapTotal > 0 ? `Gaps: ${formatShort(result.gapTotal)}` : "Gaps: none",
      `Total runtime: ${formatClock(result.totalSeconds)} (${result.totalSeconds.toFixed(2)} s)`,
      `Average clip: ${formatShort(result.averageSeconds)}`,
      result.hasTarget
        ? `Target ${formatShort(result.targetSeconds)} — ${result.verdict} by ${formatShort(Math.abs(result.differenceSeconds))}`
        : "No target set",
    ].join("\n");
  }, [ready, result]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setList(DEFAULTS.list);
    setFps(DEFAULTS.fps);
    setGap(DEFAULTS.gap);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const verdictClass =
    ready && result.hasTarget
      ? result.verdict === "over"
        ? "text-[var(--danger)]"
        : result.verdict === "under"
          ? "text-[var(--muted-foreground)]"
          : "text-[var(--success)]"
      : "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListPlus className="h-4 w-4" aria-hidden="true" />
          Edit planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Runtime Sum Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste one duration per line in any mix of formats — 1:30, 00:02:15, 90, 1m 20s or
          timecode with frames — and get the total programme runtime against your target slot.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL} htmlFor="rsc-list">
          Clip durations, one per line
        </label>
        <textarea
          id="rsc-list"
          rows={8}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={list}
          spellCheck="false"
          onChange={(event) => setList(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rsc-fps">
              Frame rate (for hh:mm:ss:ff entries)
            </label>
            <select
              id="rsc-fps"
              className={`mt-2 ${CONTROL}`}
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            >
              {FPS_OPTIONS.map((option) => (
                <option key={option} value={String(option)}>
                  {option} fps
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="rsc-gap">
              Gap between clips (seconds)
            </label>
            <input
              id="rsc-gap"
              className={`mt-2 ${CONTROL}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="600"
              step="0.5"
              value={gap}
              onChange={(event) => setGap(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="rsc-target">
              Target slot length (seconds, 0 for none)
            </label>
            <input
              id="rsc-target"
              className={`mt-2 ${CONTROL}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {TARGET_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTarget(String(preset.seconds))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total runtime
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">
              {ready ? formatClock(result.totalSeconds, false) : DASH}
            </p>
            <p className={`mt-1 text-sm ${verdictClass || "text-[var(--muted-foreground)]"}`}>
              {failed
                ? "Fix the list above to see the total."
                : empty
                  ? "Add at least one duration to the list."
                  : result.hasTarget
                    ? `${NUM2.format(result.totalSeconds)} s · ${result.verdict === "on target" ? "on target" : `${formatShort(Math.abs(result.differenceSeconds))} ${result.verdict}`}`
                    : `${NUM2.format(result.totalSeconds)} s across ${result.validCount} clips`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ready}
              aria-label="Copy runtime total"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the clip list" className={PRIMARY_BTN}>
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

        {ready && result.hasTarget && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Runtime is ${NUM1.format(result.percentOfTarget)} percent of the target slot`}
            >
              <span
                className={`block h-full ${result.verdict === "over" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${Math.max(0, Math.min(100, result.percentOfTarget))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {NUM1.format(result.percentOfTarget)}% of the {formatShort(result.targetSeconds)} slot
            </p>
          </div>
        )}
      </section>

      {!failed && result.invalidCount > 0 && (
        <section
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
          role="alert"
        >
          <p className="font-semibold">
            {result.invalidCount} line{result.invalidCount === 1 ? "" : "s"} skipped:
          </p>
          <ul className="mt-1 list-disc pl-5">
            {result.invalid.map((item, index) => (
              <li key={`${item.input}-${index}`}>
                <span className="font-mono">{item.input}</span> — {item.error}
              </li>
            ))}
          </ul>
        </section>
      )}

      {ready && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Running order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Entry
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Length
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Starts at
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.map((item, index) => (
                  <tr
                    key={`${item.input}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">{index + 1}</td>
                    <td className="py-2 pr-3 font-mono">{item.input}</td>
                    <td className="py-2 pr-3 text-right">{formatShort(item.seconds)}</td>
                    <td className="py-2 text-right font-mono text-[var(--muted-foreground)]">
                      {formatClock(item.start, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Slot presets are common industry conventions rather than fixed rules — always confirm the
        exact duration and tolerance in the delivery specification.
      </p>
    </main>
  );
}
