"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Twitch } from "lucide-react";
import {
  ACCEPTED_FORMATS,
  MAX_FILE_MB,
  PRESETS,
  RELATED_ASSETS,
  formatReport,
  planOfflineScreen,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const BLOCK_LABELS = [
  "Stream schedule",
  "Socials",
  "Next stream",
  "Sponsors",
  "Discord",
  "Rules",
  "Sub perks",
  "Merch",
  "Setup",
  "Charity",
  "Clips",
  "Contact",
];

const DEFAULTS = {
  width: "1920",
  height: "1080",
  controlBarShare: "0.09",
  edgeTrimShare: "0.03",
  padding: "40",
  blocks: "3",
  columns: "3",
  gutter: "32",
  headingSize: "64",
  bodySize: "34",
  renderWidth: "940",
  fileSizeMb: "2.4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");
  // Only the "offline" preset (1920x1080) renders inside the Twitch video
  // player; the banner and panel presets are plain image uploads with no
  // control bar and no 16:9 requirement, so the engine is told to skip
  // those player-specific checks for them.
  const [presetId, setPresetId] = useState("offline");

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      planOfflineScreen({
        width: Number(form.width),
        height: Number(form.height),
        controlBarShare: Number(form.controlBarShare),
        edgeTrimShare: Number(form.edgeTrimShare),
        padding: Number(form.padding),
        blocks: Number(form.blocks),
        columns: Number(form.columns),
        gutter: Number(form.gutter),
        headingSize: Number(form.headingSize),
        bodySize: Number(form.bodySize),
        renderWidth: Number(form.renderWidth),
        fileSizeMb: Number(form.fileSizeMb),
        isPlayerCanvas: presetId === "offline",
      }),
    [form, presetId],
  );

  const failed = Boolean(result.error);
  const report = useMemo(() => formatReport(result), [result]);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setPresetId("offline");
    setCopied("");
  };

  const numberField = (id, label, key, step, min, max) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={form[key]}
        onChange={(event) => setField(key, event.target.value)}
      />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Twitch className="h-4 w-4" aria-hidden="true" />
          Channel artwork
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Twitch Offline Banner Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plan the 1920 × 1080 screen viewers see when your channel is offline. The player's control
          bar and letterbox margin are mapped out, then the remaining area is divided into an even
          grid for schedule, socials and whatever else you want on screen — with a check that the
          type still reads once the player scales it down.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("tw-width", "Canvas width (px)", "width", "10", "100", "6000")}
          {numberField("tw-height", "Canvas height (px)", "height", "10", "100", "6000")}
          {numberField("tw-bar", "Control bar (× canvas height)", "controlBarShare", "0.005", "0", "0.5")}
          {numberField("tw-trim", "Edge safety trim (× each side)", "edgeTrimShare", "0.005", "0", "0.4")}
          {numberField("tw-padding", "Padding inside the trim (px)", "padding", "4", "0")}
          {numberField("tw-gutter", "Gutter between blocks (px)", "gutter", "4", "0")}
          {numberField("tw-blocks", "Information blocks", "blocks", "1", "1", "12")}
          {numberField("tw-columns", "Columns", "columns", "1", "1", "12")}
          {numberField("tw-heading", "Heading size in the artwork (px)", "headingSize", "2", "1", "600")}
          {numberField("tw-body", "Body size in the artwork (px)", "bodySize", "1", "1", "600")}
          {numberField("tw-render", "Player width on screen (px)", "renderWidth", "10", "100", "4000")}
          {numberField("tw-file", "Exported file size (MB)", "fileSizeMb", "0.1", "0", "200")}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={CHIP_BTN}
              aria-pressed={presetId === preset.id}
              onClick={() => {
                const isOffline = preset.id === "offline";
                setForm((prev) => ({
                  ...prev,
                  width: String(preset.width),
                  height: String(preset.height),
                  // Only the offline screen sits inside the video player —
                  // the banner and panel presets have no control bar and no
                  // 16:9 requirement, so their reserved allowances are zero.
                  controlBarShare: isOffline ? DEFAULTS.controlBarShare : "0",
                  edgeTrimShare: isOffline ? DEFAULTS.edgeTrimShare : "0",
                }));
                setPresetId(preset.id);
              }}
            >
              {preset.label}
            </button>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Each information block
            </p>
            <p
              className="mt-1 text-4xl font-semibold text-[var(--primary)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {failed ? DASH : `${NUM.format(result.cellWidth)} × ${NUM.format(result.cellHeight)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to lay the screen out."
                : `${result.blocks} blocks in ${result.columns} × ${result.rows} · ${PCT.format(result.safeShare)} of the canvas is usable`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the offline screen layout report"
              onClick={() => copy(report, "report")}
              disabled={failed}
            >
              {copied === "report" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "report" ? "Copied!" : "Copy report"}
            </button>
            <button type="button" className={PRIMARY_BTN} aria-label="Reset all inputs" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
          {failed ? (
            <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">{DASH}</p>
          ) : (
            <svg
              viewBox={`0 0 ${result.width} ${result.height}`}
              className="block h-auto w-full"
              role="img"
              aria-label={`Offline screen layout with ${result.blocks} blocks and the player control bar marked`}
            >
              <rect x="0" y="0" width={result.width} height={result.height} fill="var(--muted)" />
              <rect
                x={result.safe.x}
                y={result.safe.y}
                width={result.safe.width}
                height={result.safe.height}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="4"
                strokeDasharray="20 12"
              />
              {result.cells.map((cell) => (
                <g key={cell.index}>
                  <rect
                    x={cell.x}
                    y={cell.y}
                    width={cell.width}
                    height={cell.height}
                    fill="var(--primary)"
                    fillOpacity="0.12"
                    stroke="var(--primary)"
                    strokeWidth="5"
                  />
                  <text
                    x={cell.x + 24}
                    y={cell.y + Math.min(Number(form.headingSize), cell.height / 2) + 24}
                    fontSize={Math.min(cell.height / 3, 72)}
                    fontFamily="Helvetica, Arial, sans-serif"
                    fontWeight="700"
                    fill="var(--foreground)"
                  >
                    {BLOCK_LABELS[cell.index - 1]}
                  </text>
                </g>
              ))}
              {result.controlBar.height > 0 && (
                <rect
                  x="0"
                  y={result.controlBar.y}
                  width={result.controlBar.width}
                  height={result.controlBar.height}
                  fill="var(--foreground)"
                  fillOpacity="0.18"
                />
              )}
            </svg>
          )}
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Shaded strip at the bottom: the player control bar. Dashed box: the usable area. Solid
          boxes: your information blocks.
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Canvas", failed ? DASH : `${result.width} × ${result.height} px (${result.ratio}:1)`],
            [
              "Usable area",
              failed
                ? DASH
                : `${NUM.format(result.safe.width)} × ${NUM.format(result.safe.height)} px at ${NUM.format(result.safe.x)}, ${NUM.format(result.safe.y)}`,
            ],
            ["Control bar allowance", failed ? DASH : `${NUM.format(result.controlBar.height)} px`],
            ["Grid", failed ? DASH : `${result.columns} columns × ${result.rows} rows, ${result.gutter} px gutter`],
            [
              "Heading size on screen",
              failed ? DASH : `${NUM.format(result.renderedHeadingPx)} px at ${result.renderWidth} px wide`,
            ],
            ["Body size on screen", failed ? DASH : `${NUM.format(result.renderedBodyPx)} px`],
            [
              "File size",
              failed ? DASH : `${NUM.format(result.fileSizeMb)} MB of ${MAX_FILE_MB} MB allowed`,
            ],
            ["Accepted formats", ACCEPTED_FORMATS.join(", ")],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">SVG guide layer</h2>
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the SVG guide layer"
              onClick={() => copy(result.guideSvg, "svg")}
            >
              {copied === "svg" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "svg" ? "Copied!" : "Copy guide"}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre rounded-md bg-[var(--background)] p-3 text-xs leading-5">
              {result.guideSvg}
            </pre>
          </div>

          <h3 className="mt-5 text-sm font-semibold">Other channel artwork</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Asset</th>
                  <th scope="col" className="py-2 text-right font-semibold">Size</th>
                </tr>
              </thead>
              <tbody>
                {RELATED_ASSETS.map((asset) => (
                  <tr key={asset.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{asset.label}</td>
                    <td className="py-2 text-right font-semibold">
                      {asset.width} × {asset.height} px
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!failed && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you upload</h2>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="border-l-2 border-[var(--primary)] pl-3">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 1920 × 1080 canvas and the {MAX_FILE_MB} MB file limit are Twitch's published figures.
        The control bar height and edge trim approximate the current player and are adjustable —
        check the live channel page after uploading.
      </p>
    </main>
  );
}
