"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Linkedin, RotateCcw } from "lucide-react";
import { ACCEPTED_FORMATS, MAX_FILE_MB, SURFACES, formatReport, planBanner } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  surfaceId: "personal",
  width: "1584",
  height: "396",
  avatarDiameterShare: "0.55",
  avatarCenterXShare: "0.1",
  edgeTrimShare: "0.02",
  padding: "24",
  headlineSize: "64",
  renderWidth: "1128",
  fileSizeMb: "1.5",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      planBanner({
        surfaceId: form.surfaceId,
        width: Number(form.width),
        height: Number(form.height),
        avatarDiameterShare: Number(form.avatarDiameterShare),
        avatarCenterXShare: Number(form.avatarCenterXShare),
        edgeTrimShare: Number(form.edgeTrimShare),
        padding: Number(form.padding),
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

  const applySurface = (id) => {
    const surface = SURFACES.find((item) => item.id === id) || SURFACES[0];
    setForm((prev) => ({
      ...prev,
      surfaceId: id,
      width: String(surface.width),
      height: String(surface.height),
      avatarDiameterShare: String(surface.avatarDiameterShare),
      avatarCenterXShare: String(surface.avatarCenterXShare),
    }));
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
          <Linkedin className="h-4 w-4" aria-hidden="true" />
          Profile artwork
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">LinkedIn Banner Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay out a LinkedIn background image at the sizes LinkedIn recommends — 1584 × 396 for a
          personal profile, 1128 × 191 for a company page — with the circular avatar mapped as an
          exclusion zone. The largest usable text rectangle is measured for you and exported as an
          SVG guide you can drop into any design tool.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="li-surface">
              Surface
            </label>
            <select
              id="li-surface"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.surfaceId}
              onChange={(event) => applySurface(event.target.value)}
            >
              {SURFACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.width} × {item.height}
                </option>
              ))}
            </select>
          </div>
          {numberField("li-width", "Canvas width (px)", "width", "1", "100", "6000")}
          {numberField("li-height", "Canvas height (px)", "height", "1", "100", "6000")}
          {numberField("li-avatar", "Avatar diameter (× banner height)", "avatarDiameterShare", "0.01", "0", "2")}
          {numberField("li-avatar-x", "Avatar centre (× banner width)", "avatarCenterXShare", "0.01", "0", "1")}
          {numberField("li-trim", "Edge safety trim (× each side)", "edgeTrimShare", "0.005", "0", "0.4")}
          {numberField("li-padding", "Padding around text (px)", "padding", "2", "0")}
          {numberField("li-headline", "Headline size in the artwork (px)", "headlineSize", "2", "1", "600")}
          {numberField("li-render", "Rendered width on screen (px)", "renderWidth", "8", "100", "4000")}
          {numberField("li-file", "Exported file size (MB)", "fileSizeMb", "0.1", "0", "200")}
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
              Safe text zone
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed
                ? DASH
                : `${NUM.format(result.recommended.width)} × ${NUM.format(result.recommended.height)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to lay the banner out."
                : `${result.recommendedSide === "right" ? "Right of" : "Above"} the avatar · ${PCT.format(result.safeAreaShare)} of the canvas`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the banner layout report"
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
              aria-label="Banner layout with the avatar exclusion circle and the safe text rectangle marked"
            >
              <rect x="0" y="0" width={result.width} height={result.height} fill="var(--muted)" />
              <rect
                x={result.inner.x}
                y={result.inner.y}
                width={result.inner.width}
                height={result.inner.height}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="3"
                strokeDasharray="14 10"
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
          Dashed grey: edge safety trim. Red circle: the avatar overlap. Solid: the largest text
          rectangle that clears both.
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Canvas",
              failed
                ? DASH
                : `${result.width} × ${result.height} px (${result.ratio}:1, LinkedIn suggests ${result.recommendedRatio})`,
            ],
            [
              "Safe zone position",
              failed ? DASH : `x ${NUM.format(result.recommended.x)}, y ${NUM.format(result.recommended.y)}`,
            ],
            [
              "Alternative zone",
              failed
                ? DASH
                : result.recommendedSide === "right"
                  ? `Above the avatar: ${NUM.format(result.topRect.width)} × ${NUM.format(result.topRect.height)}`
                  : `Right of the avatar: ${NUM.format(result.rightRect.width)} × ${NUM.format(result.rightRect.height)}`,
            ],
            ["Avatar exclusion diameter", failed ? DASH : `${NUM.format(result.avatar.diameter)} px`],
            [
              "Headline size on screen",
              failed ? DASH : `${NUM.format(result.renderedHeadlinePx)} px at ${result.renderWidth} px wide`,
            ],
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
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{result.surfaceNote}</p>
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
        Canvas sizes follow LinkedIn's published recommendations. The avatar overlap and edge trim
        are approximations of the current layout rather than published numbers — adjust the fields
        if LinkedIn changes the design.
      </p>
    </main>
  );
}
