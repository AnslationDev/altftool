"use client";

import { useMemo, useState } from "react";
import { Camera, Check, Copy, RotateCcw } from "lucide-react";

import {
  ANGLES,
  LIGHTING,
  PLATFORMS,
  SHOT_TYPES,
  SURFACES,
  buildProductPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  product: "a matte ceramic pour-over coffee dripper",
  material: "stoneware",
  platformId: PLATFORMS[0].id,
  shotId: "packshot",
  surfaceId: "white-sweep",
  angleId: "high-45",
  lightingId: "softbox",
  props: "",
  coveragePct: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const result = useMemo(
    () =>
      buildProductPrompt({
        product: form.product,
        material: form.material,
        platformId: form.platformId,
        shotId: form.shotId,
        surfaceId: form.surfaceId,
        angleId: form.angleId,
        lightingId: form.lightingId,
        props: form.props,
        coveragePct: form.coveragePct,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyText = hasError
    ? ""
    : `${result.prompt}\n\nNegative prompt: ${result.negativePrompt}\n\nCanvas: ${result.framing.width} x ${result.framing.height} px (${result.framing.aspect}), product about ${result.framing.productPx} px with ${result.framing.marginPx} px margin per side.`;

  const copyResult = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const framingRows = hasError
    ? [
        ["Canvas size", DASH],
        ["Aspect ratio", DASH],
        ["Product size in frame", DASH],
        ["Margin per side", DASH],
        ["Marketplace zoom", DASH],
      ]
    : [
        ["Canvas size", `${NUM.format(result.framing.width)} x ${NUM.format(result.framing.height)} px`],
        ["Aspect ratio", result.framing.aspect],
        [
          "Product size in frame",
          `${NUM.format(result.framing.productPx)} px (${result.framing.coveragePct}% of the short side)`,
        ],
        ["Margin per side", `${NUM.format(result.framing.marginPx)} px`],
        [
          "Marketplace zoom",
          result.framing.zoomRecommended
            ? "Ready (1600 px+ longest side)"
            : result.framing.zoomReady
              ? "Activates (1000 px+), below the 1600 px recommendation"
              : "Too small for zoom",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Image prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Product Photo Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose an ecommerce product-shot prompt from surface, camera angle and lighting — with
          the canvas size, aspect ratio and product coverage computed for the marketplace you are
          shooting for, including Amazon&apos;s pure-white 85% main-image rule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pp-product">
              Product description
            </label>
            <input
              id="pp-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={220}
              value={form.product}
              onChange={set("product")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-material">
              Material (optional)
            </label>
            <input
              id="pp-material"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.material}
              onChange={set("material")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-platform">
              Platform / format
            </label>
            <select
              id="pp-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.platformId}
              onChange={set("platformId")}
            >
              {PLATFORMS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-shot">
              Shot type
            </label>
            <select id="pp-shot" className={`mt-2 ${INPUT_CLASS}`} value={form.shotId} onChange={set("shotId")}>
              {SHOT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-surface">
              Surface
            </label>
            <select
              id="pp-surface"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.surfaceId}
              onChange={set("surfaceId")}
            >
              {SURFACES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-angle">
              Camera angle
            </label>
            <select id="pp-angle" className={`mt-2 ${INPUT_CLASS}`} value={form.angleId} onChange={set("angleId")}>
              {ANGLES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-light">
              Lighting
            </label>
            <select
              id="pp-light"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lightingId}
              onChange={set("lightingId")}
            >
              {LIGHTING.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-props">
              Styling props (optional)
            </label>
            <input
              id="pp-props"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. scattered coffee beans"
              value={form.props}
              onChange={set("props")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pp-coverage">
              Product coverage (% of frame, optional)
            </label>
            <input
              id="pp-coverage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="50"
              max="100"
              step="1"
              placeholder="Platform default"
              value={form.coveragePct}
              onChange={set("coveragePct")}
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
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated prompt
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 text-sm leading-6">
              {hasError ? DASH : result.prompt}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Negative prompt
            </p>
            <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.negativePrompt}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the product photo prompt, negative prompt and framing numbers"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {framingRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.platform.label}: {result.platform.note}
          </p>
        ) : null}
      </section>

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Listing warnings</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Marketplace figures reflect published image guidelines (Amazon&apos;s pure-white 85%
        main-image rule and 1000 px zoom threshold, Etsy&apos;s 2000 px shortest-side
        recommendation, Instagram&apos;s 1080 px render sizes). Platforms revise these rules —
        check the current help pages before a large shoot.
      </p>
    </main>
  );
}
