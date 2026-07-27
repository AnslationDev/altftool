"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  FINISH_OPTIONS,
  LIGHTING_OPTIONS,
  MATERIAL_PRESETS,
  SCALE_OPTIONS,
  TARGET_OPTIONS,
  WEAR_OPTIONS,
  buildTexturePrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  material: "weathered oak wood",
  finishId: "matte",
  scaleId: "close",
  lightingId: "raking",
  wearId: "weathered",
  targetId: "seamless",
  colors: "",
  details: "",
};

const DASH = "—";

export default function ToolHome() {
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [finishId, setFinishId] = useState(DEFAULTS.finishId);
  const [scaleId, setScaleId] = useState(DEFAULTS.scaleId);
  const [lightingId, setLightingId] = useState(DEFAULTS.lightingId);
  const [wearId, setWearId] = useState(DEFAULTS.wearId);
  const [targetId, setTargetId] = useState(DEFAULTS.targetId);
  const [colors, setColors] = useState(DEFAULTS.colors);
  const [details, setDetails] = useState(DEFAULTS.details);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildTexturePrompt({
        material,
        finishId,
        scaleId,
        lightingId,
        wearId,
        targetId,
        colors,
        details,
      }),
    [material, finishId, scaleId, lightingId, wearId, targetId, colors, details],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(
        `${result.prompt}\n\nNegative prompt: ${result.negativePrompt}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMaterial(DEFAULTS.material);
    setFinishId(DEFAULTS.finishId);
    setScaleId(DEFAULTS.scaleId);
    setLightingId(DEFAULTS.lightingId);
    setWearId(DEFAULTS.wearId);
    setTargetId(DEFAULTS.targetId);
    setColors(DEFAULTS.colors);
    setDetails(DEFAULTS.details);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Image Prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Texture Prompt Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe a surface precisely — material, finish, physical scale, lighting and wear — and
          get a structured prompt plus a matching negative prompt for any AI image or PBR-texture
          generator.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tex-material">
              Base material
            </label>
            <input
              id="tex-material"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
              placeholder="e.g. brushed stainless steel"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {MATERIAL_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMaterial(preset)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tex-finish">
              Surface finish
            </label>
            <select
              id="tex-finish"
              className={`mt-2 ${INPUT_CLASS}`}
              value={finishId}
              onChange={(event) => setFinishId(event.target.value)}
            >
              {FINISH_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tex-scale">
              Physical scale
            </label>
            <select
              id="tex-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scaleId}
              onChange={(event) => setScaleId(event.target.value)}
            >
              {SCALE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tex-lighting">
              Lighting
            </label>
            <select
              id="tex-lighting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lightingId}
              onChange={(event) => setLightingId(event.target.value)}
            >
              {LIGHTING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tex-wear">
              Wear and age
            </label>
            <select
              id="tex-wear"
              className={`mt-2 ${INPUT_CLASS}`}
              value={wearId}
              onChange={(event) => setWearId(event.target.value)}
            >
              {WEAR_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tex-target">
              Output target
            </label>
            <select
              id="tex-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
            >
              {TARGET_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tex-colors">
              Colour palette (optional)
            </label>
            <input
              id="tex-colors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={colors}
              onChange={(event) => setColors(event.target.value)}
              placeholder="e.g. warm greys with rust-orange accents"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tex-details">
              Extra surface details (optional)
            </label>
            <input
              id="tex-details"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="e.g. fine saw marks, occasional knots, tight straight grain"
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated prompt
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.wordCount} words`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the texture prompt and negative prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Prompt</dt>
            <dd className="mt-1 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6">
              {hasError ? DASH : result.prompt}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Negative prompt</dt>
            <dd className="mt-1 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6">
              {hasError ? DASH : result.negativePrompt}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Works with Midjourney, Stable Diffusion, DALL-E, Firefly and PBR material generators. The
        negative prompt field applies to models that support one (for example Stable Diffusion);
        others can simply ignore it.
      </p>
    </main>
  );
}
