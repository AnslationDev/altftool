"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw } from "lucide-react";

import { CHECK_STATUS, PLACEMENTS, compareSpecs, formatSeconds } from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SHAPE_PRESETS = [
  { label: "Vertical 1080x1920", width: "1080", height: "1920" },
  { label: "Square 1080x1080", width: "1080", height: "1080" },
  { label: "Portrait 1080x1350", width: "1080", height: "1350" },
  { label: "Landscape 1920x1080", width: "1920", height: "1080" },
];

const FORMATS = ["mp4", "mov", "m4v", "webm", "avi", "mpeg"];

const DEFAULTS = {
  duration: "30",
  width: "1080",
  height: "1920",
  fileSizeMB: "120",
  format: "mp4",
  placementIds: PLACEMENTS.map((placement) => placement.id),
};

const DASH = "—";

const STATUS_CLASS = {
  [CHECK_STATUS.PASS]: "bg-[var(--success)]/12 text-[var(--success)]",
  [CHECK_STATUS.WARN]: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  [CHECK_STATUS.FAIL]: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const STATUS_LABEL = {
  [CHECK_STATUS.PASS]: "OK",
  [CHECK_STATUS.WARN]: "Allowed",
  [CHECK_STATUS.FAIL]: "Blocked",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [fileSizeMB, setFileSizeMB] = useState(DEFAULTS.fileSizeMB);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [placementIds, setPlacementIds] = useState(DEFAULTS.placementIds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareSpecs({
        durationSeconds: toNumber(duration),
        width: toNumber(width),
        height: toNumber(height),
        fileSizeMB: toNumber(fileSizeMB),
        format,
        placementIds,
      }),
    [duration, width, height, fileSizeMB, format, placementIds],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Video Ad Specs Comparator",
      `Asset: ${width}x${height}, ${duration}s, ${fileSizeMB} MB, .${format}`,
      `Passes ${result.acceptedCount} of ${result.totalCount} placements`,
      "",
    ];
    result.results.forEach((placement) => {
      lines.push(
        `${placement.platform} — ${placement.name}: ${placement.accepted ? "OK" : "BLOCKED"}`,
      );
      placement.checks
        .filter((check) => check.status !== CHECK_STATUS.PASS)
        .forEach((check) => lines.push(`    ${check.label}: ${check.detail}`));
    });
    return lines.join("\n");
  }, [result, width, height, duration, fileSizeMB, format]);

  const togglePlacement = (id) => {
    setPlacementIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

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
    setDuration(DEFAULTS.duration);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setFileSizeMB(DEFAULTS.fileSizeMB);
    setFormat(DEFAULTS.format);
    setPlacementIds(DEFAULTS.placementIds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Platform specs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Ad Specs Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe the cut you have and see which ad placements will take it, which will reject it,
          and exactly which rule each one breaks.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-duration">
              Length (seconds)
            </label>
            <input
              id="ad-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-size">
              File size (MB)
            </label>
            <input
              id="ad-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={fileSizeMB}
              onChange={(event) => setFileSizeMB(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-width">
              Frame width (px)
            </label>
            <input
              id="ad-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="2"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-height">
              Frame height (px)
            </label>
            <input
              id="ad-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="2"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ad-format">
              Container
            </label>
            <select
              id="ad-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {FORMATS.map((item) => (
                <option key={item} value={item}>
                  .{item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SHAPE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => {
                setWidth(preset.width);
                setHeight(preset.height);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Placements to check
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PLACEMENTS.map((placement) => {
              const id = `ad-placement-${placement.id}`;
              const checked = placementIds.includes(placement.id);
              return (
                <label
                  key={placement.id}
                  htmlFor={id}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--primary)]/8"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={id}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => togglePlacement(placement.id)}
                  />
                  <span>
                    <span className="block font-semibold">{placement.name}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {placement.platform}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Placements this cut can run in
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : `${result.acceptedCount} of ${result.totalCount}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the asset details above to run the check."
                : `${width}×${height} · ${result.asset.aspect.nearest.label} · ${formatSeconds(result.asset.durationSeconds)} · ${NUM2.format(result.asset.fileSizeMB)} MB`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the placement compliance report"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
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
              aria-label="Reset the specs comparator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Aspect ratio",
              result.error
                ? DASH
                : `${result.asset.aspect.nearest.label}${result.asset.aspect.exact ? "" : " (approximate)"}`,
            ],
            ["Length", result.error ? DASH : formatSeconds(result.asset.durationSeconds)],
            ["File size", result.error ? DASH : `${NUM2.format(result.asset.fileSizeMB)} MB`],
            ["Container", result.error ? DASH : `.${format}`],
            [
              "Placements blocked",
              result.error ? DASH : `${result.totalCount - result.acceptedCount}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Placement by placement</h2>
          <ul className="mt-3 space-y-3">
            {result.results.map((placement) => (
              <li
                key={placement.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {placement.platform} — {placement.name}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      placement.accepted
                        ? STATUS_CLASS[CHECK_STATUS.PASS]
                        : STATUS_CLASS[CHECK_STATUS.FAIL]
                    }`}
                  >
                    {placement.accepted ? "Will upload" : `${placement.failCount} blocker(s)`}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {placement.checks.map((check) => (
                    <li key={check.id} className="flex flex-wrap items-start gap-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_CLASS[check.status]}`}
                      >
                        {STATUS_LABEL[check.status]}
                      </span>
                      <span className="font-semibold">{check.label}</span>
                      <span className="w-full text-[var(--muted-foreground)] sm:w-auto sm:flex-1">
                        {check.detail}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  Recommended {placement.recommended.width}×{placement.recommended.height} ·{" "}
                  {formatSeconds(placement.minSeconds)}–{formatSeconds(placement.maxSeconds)} ·{" "}
                  {placement.maxFileSizeMB} MB max ·{" "}
                  {placement.formats.map((f) => `.${f}`).join(", ")}
                </p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  {placement.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Source: {placement.source}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ad platforms revise their specification sheets without notice, and some limits differ by
        country, objective and buying type. Treat this as a first-pass check and confirm the numbers
        in the platform&apos;s own current spec document before a campaign ships.
      </p>
    </main>
  );
}
