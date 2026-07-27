/**
 * AI image generation cost model.
 *
 * Cost = images billed × price per image, where images billed includes a retry
 * allowance for regenerations you discard. Per-image preset prices are taken
 * from OpenAI's published image pricing (openai.com API pricing page):
 *   DALL·E 3 — standard 1024×1024 $0.040; standard 1024×1792 or 1792×1024
 *   $0.080; HD 1024×1024 $0.080; HD 1024×1792 or 1792×1024 $0.120.
 *   DALL·E 2 — 1024×1024 $0.020; 512×512 $0.018; 256×256 $0.016.
 *   GPT-image-1 — token-priced; OpenAI's published per-image approximations
 *   for 1024×1024 are ~$0.011 (low), ~$0.042 (medium), ~$0.167 (high).
 * Prices change — the custom option lets the user enter any current rate,
 * including credit-based services converted to a per-image dollar cost.
 */

/** Published per-image price presets (USD). "approx" marks token-priced models. */
export const PRICE_PRESETS = [
  { id: "dalle3-std-1024", label: "DALL·E 3 — standard, 1024×1024", price: 0.04, approx: false },
  { id: "dalle3-std-wide", label: "DALL·E 3 — standard, 1024×1792 / 1792×1024", price: 0.08, approx: false },
  { id: "dalle3-hd-1024", label: "DALL·E 3 — HD, 1024×1024", price: 0.08, approx: false },
  { id: "dalle3-hd-wide", label: "DALL·E 3 — HD, 1024×1792 / 1792×1024", price: 0.12, approx: false },
  { id: "dalle2-1024", label: "DALL·E 2 — 1024×1024", price: 0.02, approx: false },
  { id: "dalle2-512", label: "DALL·E 2 — 512×512", price: 0.018, approx: false },
  { id: "dalle2-256", label: "DALL·E 2 — 256×256", price: 0.016, approx: false },
  { id: "gptimage-low", label: "GPT-image-1 — low quality, 1024×1024 (approx.)", price: 0.011, approx: true },
  { id: "gptimage-med", label: "GPT-image-1 — medium quality, 1024×1024 (approx.)", price: 0.042, approx: true },
  { id: "gptimage-high", label: "GPT-image-1 — high quality, 1024×1024 (approx.)", price: 0.167, approx: true },
  { id: "custom", label: "Custom price per image", price: null, approx: false },
];

/** Sanity bounds. */
export const MAX_PRICE_PER_IMAGE = 100; // USD — beyond any per-image API rate
export const MAX_IMAGES = 1e7;
export const MAX_RETRY_PERCENT = 500; // generating 5 rejects per keeper is already extreme

/**
 * Compute total spend for an image generation plan.
 *
 * @param {object} input
 * @param {number} input.pricePerImage   USD per generated image.
 * @param {number} input.imagesPerPrompt Variants generated per prompt (batch size).
 * @param {number} input.promptCount     Number of prompts / generation runs.
 * @param {number} input.retryPercent    Extra regenerations as % of planned images.
 * @returns {object} results or { error }.
 */
export function computeImageCost({ pricePerImage, imagesPerPrompt, promptCount, retryPercent }) {
  const price = Number(pricePerImage);
  const perPrompt = Number(imagesPerPrompt);
  const prompts = Number(promptCount);
  const retry = Number(retryPercent);

  if (!Number.isFinite(price) || price < 0) {
    return { error: "Enter the price per image as a non-negative number." };
  }
  if (price > MAX_PRICE_PER_IMAGE) {
    return { error: "That per-image price is beyond any published API rate — check the number." };
  }
  if (!Number.isFinite(perPrompt) || !Number.isInteger(perPrompt) || perPrompt < 1) {
    return { error: "Images per prompt must be a whole number of at least 1." };
  }
  if (!Number.isFinite(prompts) || !Number.isInteger(prompts) || prompts < 1) {
    return { error: "The number of prompts must be a whole number of at least 1." };
  }
  if (!Number.isFinite(retry) || retry < 0 || retry > MAX_RETRY_PERCENT) {
    return { error: `The retry allowance must be between 0 and ${MAX_RETRY_PERCENT} percent.` };
  }

  const plannedImages = perPrompt * prompts;
  if (plannedImages > MAX_IMAGES) {
    return { error: "That plan exceeds ten million images — check the counts." };
  }

  const billedImages = Math.ceil(plannedImages * (1 + retry / 100));
  const totalCost = billedImages * price;
  const costPerKeptImage = totalCost / plannedImages; // plannedImages >= 1 guaranteed above

  return {
    plannedImages,
    retryImages: billedImages - plannedImages,
    billedImages,
    pricePerImage: price,
    totalCost,
    costPerKeptImage,
    costPer100Kept: costPerKeptImage * 100,
  };
}
