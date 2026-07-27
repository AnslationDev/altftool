"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Facebook, RotateCcw } from "lucide-react";
import {
  DESKTOP_DISPLAY,
  MOBILE_DISPLAY,
  PROFILE_PHOTO,
  UPLOAD_PRESETS,
  formatReport,
  planCover,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  width: "1640",
  height: "624",
  padding: "24",
  showProfilePhoto: true,
  avatarCenterXShare: "0.1",
  headlineSize: "72",
  renderWidth: "820",
  fileSizeMb: "1.2",
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

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      planCover({
        width: Number(form.width),
        height: Number(form.height),
        padding: Number(form.padding),
        showProfilePhoto: form.showProfilePhoto,
        avatarCenterXShare: Number(form.avatarCenterXShare),
        headlineSize: Number(form.headlineSize),
        renderWidth: Number(form.renderWidth),
        fileSizeMb: Number(form.fileSizeMb),
      }),
    [form],
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
          <Facebook className="h-4 w-4" aria-hidden="true" />
          Page cover
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Facebook Page Cover Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One file, two crops: Facebook shows a page cover at {DESKTOP_DISPLAY.width} ×{" "}
          {DESKTOP_DISPLAY.height} on desktop and {MOBILE_DISPLAY.width} × {MOBILE_DISPLAY.height} on
          a phone. This works out the region that survives both, maps the profile photo overlap, and
          gives you the exact rectangle to design inside.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("fb-width", "Canvas width (px)", "width", "10", "100", "6000")}
          {numberField("fb-height", "Canvas height (px)", "height", "10", "100", "6000")}
          {numberField("fb-padding", "Padding around text (px)", "padding", "2", "0")}
          {numberField("fb-avatar-x", "Profile photo centre (× width)", "avatarCenterXShare", "0.005", "0", "1")}
          {numberField("fb-headline", "Headline size in the artwork (px)", "headlineSize", "2", "1", "600")}
          {numberField("fb-render", "Rendered width on screen (px)", "renderWidth", "10", "100", "4000")}
          {numberField("fb-file", "Exported file size (MB)", "fileSizeMb", "0.1", "0", "200")}
          <div className="flex items-end">
            <label
              className="flex min-h-11 items-center gap-3 text-sm font-semibold"
              htmlFor="fb-photo"
            >
              <input
                id="fb-photo"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={form.showProfilePhoto}
                onChange={(event) => setField("showProfilePhoto", event.target.checked)}
              />
              Account for the profile photo
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {UPLOAD_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={CHIP_BTN}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  width: String(preset.width),
                  height: String(preset.height),
                }))
              }
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
              Visible on desktop and mobile
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(result.safeBox.width)} × ${NUM.format(result.safeBox.height)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to lay the cover out."
                : `${PCT.format(result.safeShare)} of the canvas survives both crops`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the cover layout report"
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
              aria-label="Cover layout showing the desktop crop, the mobile crop, their overlap and the profile photo"
            >
              <rect x="0" y="0" width={result.width} height={result.height} fill="var(--muted)" />
              <rect
                x={result.safeBox.x}
                y={result.safeBox.y}
                width={result.safeBox.width}
                height={result.safeBox.height}
                fill="var(--success)"
                fillOpacity="0.12"
              />
              <rect
                x={result.desktopCrop.x}
                y={result.desktopCrop.y}
                width={result.desktopCrop.width}
                height={result.desktopCrop.height}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="4"
                strokeDasharray="6 8"
              />
              <rect
                x={result.mobileCrop.x}
                y={result.mobileCrop.y}
                width={result.mobileCrop.width}
                height={result.mobileCrop.height}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="4"
                strokeDasharray="18 10"
              />
              <rect
                x={result.recommended.x}
                y={result.recommended.y}
                width={result.recommended.width}
                height={result.recommended.height}
                fill="var(--primary)"
                fillOpacity="0.15"
                stroke="var(--primary)"
                strokeWidth="5"
              />
              {result.avatar.r > 0 && (
                <circle
                  cx={result.avatar.cx}
                  cy={result.avatar.cy}
                  r={result.avatar.r}
                  fill="var(--card)"
                  stroke="var(--danger)"
                  strokeWidth="5"
                  strokeDasharray="12 10"
                />
              )}
            </svg>
          )}
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Short dashes: the desktop crop. Long dashes: the mobile crop. Green tint: seen on both.
          Solid: where your text should live.
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Canvas", failed ? DASH : `${result.width} × ${result.height} px (${result.ratio}:1)`],
            [
              "Desktop crop",
              failed ? DASH : `${NUM.format(result.desktopCrop.width)} × ${NUM.format(result.desktopCrop.height)} px`,
            ],
            [
              "Mobile crop",
              failed ? DASH : `${NUM.format(result.mobileCrop.width)} × ${NUM.format(result.mobileCrop.height)} px`,
            ],
            ["Lost on mobile, each side", failed ? DASH : `${NUM.format(result.croppedEachSideOnMobile)} px`],
            [
              "Lost on desktop, top and bottom",
              failed ? DASH : `${NUM.format(result.croppedTopBottomOnDesktop)} px`,
            ],
            [
              "Safe text zone",
              failed
                ? DASH
                : `${NUM.format(result.recommended.width)} × ${NUM.format(result.recommended.height)} px at ${NUM.format(result.recommended.x)}, ${NUM.format(result.recommended.y)}`,
            ],
            [
              "Headline size on screen",
              failed ? DASH : `${NUM.format(result.renderedHeadlinePx)} px at ${result.renderWidth} px wide`,
            ],
            ["Profile photo upload size", `${PROFILE_PHOTO.upload} × ${PROFILE_PHOTO.upload} px`],
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
        Display sizes are Facebook's published figures for page covers. The profile photo overlap is
        modelled from the 170 px desktop rendering and can be switched off; layouts change over time,
        so check the live page after uploading.
      </p>
    </main>
  );
}
