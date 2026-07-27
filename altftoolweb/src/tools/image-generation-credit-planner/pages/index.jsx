"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Copy, RotateCcw } from "lucide-react";

import { computeCreditPlan } from "../lib";

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
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  packCredits: "1000",
  packPrice: "10",
  creditsPerImage: "4",
  imagesPerWeek: "50",
};

export default function ToolHome() {
  const [packCredits, setPackCredits] = useState(DEFAULTS.packCredits);
  const [packPrice, setPackPrice] = useState(DEFAULTS.packPrice);
  const [creditsPerImage, setCreditsPerImage] = useState(DEFAULTS.creditsPerImage);
  const [imagesPerWeek, setImagesPerWeek] = useState(DEFAULTS.imagesPerWeek);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCreditPlan({
        packCredits: packCredits.trim() === "" ? Number.NaN : Number(packCredits),
        packPrice: packPrice.trim() === "" ? Number.NaN : Number(packPrice),
        creditsPerImage: creditsPerImage.trim() === "" ? Number.NaN : Number(creditsPerImage),
        imagesPerWeek: imagesPerWeek.trim() === "" ? Number.NaN : Number(imagesPerWeek),
      }),
    [packCredits, packPrice, creditsPerImage, imagesPerWeek],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Image generation credit plan",
      `Pack: ${packCredits} credits at ${USD.format(Number(packPrice))}`,
      `Credits per image: ${creditsPerImage}`,
      `Images per pack: ${NUM.format(result.imagesPerPack)}`,
      `Effective cost per image: ${USD4.format(result.costPerImage)}`,
      `Weekly burn at ${imagesPerWeek} images/week: ${NUM.format(result.weeklyCreditBurn)} credits`,
      `One pack lasts: ${DEC.format(result.weeksPackLasts)} weeks (${DEC.format(result.daysPackLasts)} days)`,
      `Monthly need: ${DEC.format(result.monthlyImages)} images ≈ ${DEC.format(result.packsPerMonth)} packs (${USD.format(result.monthlyCost)}/month)`,
    ].join("\n");
  }, [hasError, result, packCredits, packPrice, creditsPerImage, imagesPerWeek]);

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
    setPackCredits(DEFAULTS.packCredits);
    setPackPrice(DEFAULTS.packPrice);
    setCreditsPerImage(DEFAULTS.creditsPerImage);
    setImagesPerWeek(DEFAULTS.imagesPerWeek);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coins className="h-4 w-4" aria-hidden="true" />
          AI cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Image Generation Credit Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your credit pack's size and price, the credits one image consumes at your
          settings, and your weekly volume — get images per pack, the true cost per image, how
          long a pack lasts and your monthly pack budget.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-credits">
              Credits in one pack
            </label>
            <input
              id="cp-credits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={packCredits}
              onChange={(event) => setPackCredits(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-price">
              Pack price (USD)
            </label>
            <input
              id="cp-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={packPrice}
              onChange={(event) => setPackPrice(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Enter 0 for credits included with a subscription.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-per-image">
              Credits consumed per image
            </label>
            <input
              id="cp-per-image"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={creditsPerImage}
              onChange={(event) => setCreditsPerImage(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Read this from your service's generation screen — it varies with resolution, steps
              and model.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-weekly">
              Planned images per week
            </label>
            <input
              id="cp-weekly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={imagesPerWeek}
              onChange={(event) => setImagesPerWeek(event.target.value)}
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
              Images per pack
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.imagesPerPack)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `One pack lasts about ${DEC.format(result.weeksPackLasts)} weeks at your volume.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the credit plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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
                ["Effective cost per image", DASH],
                ["Weekly credit burn", DASH],
                ["Pack lasts", DASH],
                ["Monthly cost", DASH],
              ]
            : [
                ["Effective cost per image", USD4.format(result.costPerImage)],
                ["Cost per credit", USD4.format(result.costPerCredit)],
                ["Weekly credit burn", `${NUM.format(result.weeklyCreditBurn)} credits`],
                [
                  "Pack lasts",
                  `${DEC.format(result.weeksPackLasts)} weeks (${DEC.format(result.daysPackLasts)} days)`,
                ],
                ["Monthly images (avg 4.33 weeks)", DEC.format(result.monthlyImages)],
                ["Monthly credits needed", DEC.format(result.monthlyCredits)],
                [
                  "Packs per month",
                  `${DEC.format(result.packsPerMonth)} (buy ${NUM.format(result.wholePacksPerMonth)} whole)`,
                ],
                ["Monthly cost", USD.format(result.monthlyCost)],
                ["Credits stranded per pack", NUM.format(result.leftoverCredits)],
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
        Planning estimate based on the pack terms you enter. Credit consumption per image varies
        with resolution, steps, model and features like upscaling — check your service's own rate
        card, and note whether unused credits expire at the end of a billing cycle.
      </p>
    </main>
  );
}
