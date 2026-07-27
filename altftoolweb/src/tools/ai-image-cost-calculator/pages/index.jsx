"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Image as ImageIcon, RotateCcw } from "lucide-react";

import { PRICE_PRESETS, computeImageCost } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const USD4 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  presetId: PRICE_PRESETS[0].id,
  customPrice: "0.04",
  imagesPerPrompt: "4",
  promptCount: "25",
  retryPercent: "20",
};

export default function ToolHome() {
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [customPrice, setCustomPrice] = useState(DEFAULTS.customPrice);
  const [imagesPerPrompt, setImagesPerPrompt] = useState(DEFAULTS.imagesPerPrompt);
  const [promptCount, setPromptCount] = useState(DEFAULTS.promptCount);
  const [retryPercent, setRetryPercent] = useState(DEFAULTS.retryPercent);
  const [copied, setCopied] = useState(false);

  const preset = PRICE_PRESETS.find((p) => p.id === presetId) ?? PRICE_PRESETS[0];
  const isCustom = preset.price === null;
  const price = isCustom
    ? customPrice.trim() === ""
      ? Number.NaN
      : Number(customPrice)
    : preset.price;

  const result = useMemo(
    () =>
      computeImageCost({
        pricePerImage: price,
        imagesPerPrompt: imagesPerPrompt.trim() === "" ? Number.NaN : Number(imagesPerPrompt),
        promptCount: promptCount.trim() === "" ? Number.NaN : Number(promptCount),
        retryPercent: retryPercent.trim() === "" ? Number.NaN : Number(retryPercent),
      }),
    [price, imagesPerPrompt, promptCount, retryPercent],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AI image cost estimate",
      `Pricing: ${preset.label} at ${USD4.format(result.pricePerImage)}/image`,
      `Planned images: ${NUM.format(result.plannedImages)} (${imagesPerPrompt} per prompt × ${promptCount} prompts)`,
      `Retry allowance: +${NUM.format(result.retryImages)} images`,
      `Billed images: ${NUM.format(result.billedImages)}`,
      `Total cost: ${USD.format(result.totalCost)}`,
      `Cost per kept image: ${USD4.format(result.costPerKeptImage)}`,
    ].join("\n");
  }, [hasError, result, preset, imagesPerPrompt, promptCount]);

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
    setPresetId(DEFAULTS.presetId);
    setCustomPrice(DEFAULTS.customPrice);
    setImagesPerPrompt(DEFAULTS.imagesPerPrompt);
    setPromptCount(DEFAULTS.promptCount);
    setRetryPercent(DEFAULTS.retryPercent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          AI cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Image Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate what a batch of AI-generated images will cost from published per-image API
          prices — across resolutions and quality tiers — including a retry allowance for the
          generations you throw away.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ic-preset">
              Model, quality and resolution
            </label>
            <select
              id="ic-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => setPresetId(event.target.value)}
            >
              {PRICE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.price !== null ? ` — ${USD4.format(p.price)}` : ""}
                </option>
              ))}
            </select>
            {preset.approx ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                GPT-image-1 bills by token; this is OpenAI's published per-image approximation.
              </p>
            ) : null}
          </div>
          {isCustom ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ic-custom">
                Custom price per image (USD)
              </label>
              <input
                id="ic-custom"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.001"
                value={customPrice}
                onChange={(event) => setCustomPrice(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                For credit-based services, divide the pack price by the images one pack yields.
              </p>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-per-prompt">
              Images per prompt (variants)
            </label>
            <input
              id="ic-per-prompt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={imagesPerPrompt}
              onChange={(event) => setImagesPerPrompt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-prompts">
              Number of prompts
            </label>
            <input
              id="ic-prompts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={promptCount}
              onChange={(event) => setPromptCount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ic-retry">
              Retry allowance (%)
            </label>
            <input
              id="ic-retry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="500"
              step="5"
              value={retryPercent}
              onChange={(event) => setRetryPercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Extra generations you expect to discard — 20% means one retry for every five planned
              images.
            </p>
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
              Estimated total cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : USD.format(result.totalCost)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${NUM.format(result.billedImages)} billed generations at ${USD4.format(result.pricePerImage)} each.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the image cost estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Planned images", DASH],
                ["Retry generations", DASH],
                ["Billed images", DASH],
                ["Cost per kept image", DASH],
              ]
            : [
                ["Planned images", NUM.format(result.plannedImages)],
                ["Retry generations", NUM.format(result.retryImages)],
                ["Billed images", NUM.format(result.billedImages)],
                ["Cost per kept image", USD4.format(result.costPerKeptImage)],
                ["Cost per 100 kept images", USD.format(result.costPer100Kept)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Preset prices reflect OpenAI's published image API pricing and change over time — verify
        current rates on the provider's pricing page before committing a budget. Subscription plans
        (Midjourney, and others) bill by time or credits rather than per image; use the custom
        price option with your own effective per-image cost.
      </p>
    </main>
  );
}
