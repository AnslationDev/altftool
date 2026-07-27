/**
 * Credit-pack planning arithmetic for AI image services.
 *
 * Credit-based services (Leonardo, Ideogram, Stability's credit system, Canva
 * credits, etc.) sell packs of N credits; each generation consumes a number of
 * credits that depends on resolution, steps and model. The planner is pure
 * arithmetic on the user's own pack terms:
 *   images per pack   = floor(packCredits / creditsPerImage)
 *   cost per image    = packPrice / imagesPerPack
 *   weeks a pack lasts = imagesPerPack / imagesPerWeek
 * No provider-specific rates are assumed — the user reads credits-per-image
 * from their service's own generation screen.
 */

/** Average weeks per month for monthly projections: 52 weeks / 12 months. */
export const WEEKS_PER_MONTH = 52 / 12;

/** Sanity bounds. */
export const MAX_PACK_CREDITS = 1e9;
export const MAX_PACK_PRICE = 1e6; // USD
export const MAX_IMAGES_PER_WEEK = 1e6;

/**
 * Compute how far a credit pack goes.
 *
 * @param {object} input
 * @param {number} input.packCredits     Credits in one pack.
 * @param {number} input.packPrice       Price of one pack (any currency; 0 allowed for included packs).
 * @param {number} input.creditsPerImage Credits consumed per image at the user's settings.
 * @param {number} input.imagesPerWeek   Planned image volume per week.
 * @returns {object} plan or { error }.
 */
export function computeCreditPlan({ packCredits, packPrice, creditsPerImage, imagesPerWeek }) {
  const credits = Number(packCredits);
  const price = Number(packPrice);
  const perImage = Number(creditsPerImage);
  const weekly = Number(imagesPerWeek);

  if (!Number.isFinite(credits) || credits <= 0) {
    return { error: "Enter the number of credits in the pack (a positive number)." };
  }
  if (credits > MAX_PACK_CREDITS) {
    return { error: "That credit count is unrealistically large — check the number." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Enter the pack price as zero or a positive number." };
  }
  if (price > MAX_PACK_PRICE) {
    return { error: "That pack price is unrealistically large — check the number." };
  }
  if (!Number.isFinite(perImage) || perImage <= 0) {
    return { error: "Enter the credits one image consumes (a positive number)." };
  }
  if (perImage > credits) {
    return { error: "One image costs more credits than the whole pack — check the two numbers." };
  }
  if (!Number.isFinite(weekly) || weekly <= 0) {
    return { error: "Enter your planned images per week (a positive number)." };
  }
  if (weekly > MAX_IMAGES_PER_WEEK) {
    return { error: "That weekly volume is unrealistically large — check the number." };
  }

  const imagesPerPack = Math.floor(credits / perImage);
  // perImage <= credits guarantees imagesPerPack >= 1.
  const costPerImage = price / imagesPerPack;
  const costPerCredit = price / credits;
  const weeklyCreditBurn = weekly * perImage;
  const weeksPackLasts = imagesPerPack / weekly;
  const daysPackLasts = weeksPackLasts * 7;
  const monthlyImages = weekly * WEEKS_PER_MONTH;
  const monthlyCredits = monthlyImages * perImage;
  const packsPerMonth = monthlyCredits / credits;
  const wholePacksPerMonth = Math.ceil(packsPerMonth);
  const monthlyCost = packsPerMonth * price;
  const leftoverCredits = credits - imagesPerPack * perImage;

  return {
    imagesPerPack,
    leftoverCredits,
    costPerImage,
    costPerCredit,
    weeklyCreditBurn,
    weeksPackLasts,
    daysPackLasts,
    monthlyImages,
    monthlyCredits,
    packsPerMonth,
    wholePacksPerMonth,
    monthlyCost,
  };
}
