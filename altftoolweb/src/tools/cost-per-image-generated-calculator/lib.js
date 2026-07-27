/**
 * Cost per usable AI-generated image.
 *
 * The headline price an image model advertises is a price per *rendered* image,
 * not per *usable* image. If only one render in four is good enough to ship, the
 * real unit cost is four times the sticker price, before any retouch pass or the
 * human minutes spent culling the rejects.
 *
 * All maths here is pure arithmetic on user-supplied figures; no live pricing is
 * fetched or assumed.
 */

/** Seconds in one hour — used to convert review seconds into an hourly-rate cost. */
export const SECONDS_PER_HOUR = 3600;

/** Percent values are bounded 0-100 by definition. */
export const MIN_ACCEPT_RATE = 0;
export const MAX_ACCEPT_RATE = 100;

/**
 * Upper guard on batch size. Purely defensive so a pasted number cannot produce
 * a result too large to read; it is not a limit of any provider.
 */
export const MAX_RENDERS = 10_000_000;

/** Reference points for the "how many renders per keeper" reading. */
export const ACCEPT_RATE_BANDS = [
  { maxAcceptRate: 10, label: "Very low", note: "10 or more renders per keeper — tighten the prompt or switch model before scaling." },
  { maxAcceptRate: 25, label: "Low", note: "4 to 10 renders per keeper. Typical for a new prompt that has not been iterated yet." },
  { maxAcceptRate: 50, label: "Workable", note: "2 to 4 renders per keeper. Common once a prompt and seed style are settled." },
  { maxAcceptRate: 80, label: "Good", note: "About 1.2 to 2 renders per keeper. A well-tuned pipeline." },
  { maxAcceptRate: 100, label: "Excellent", note: "Under 1.25 renders per keeper — most output ships as-is." },
];

/** Pick the descriptive band for an acceptance rate expressed in percent. */
export function acceptRateBand(acceptRatePercent) {
  if (!Number.isFinite(acceptRatePercent)) return null;
  return (
    ACCEPT_RATE_BANDS.find((band) => acceptRatePercent <= band.maxAcceptRate) ||
    ACCEPT_RATE_BANDS[ACCEPT_RATE_BANDS.length - 1]
  );
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.renders            Images actually generated (billed renders).
 * @param {number} input.pricePerRender     Cost of one render, in your currency.
 * @param {number} input.acceptRatePercent  Share of renders good enough to use, 0-100.
 * @param {number} [input.retouchPassesPerKeeper] Extra billed renders (upscale, inpaint,
 *                                          variation) spent on each keeper.
 * @param {number} [input.reviewSecondsPerRender]  Human seconds spent looking at each render.
 * @param {number} [input.reviewerHourlyRate]      Fully loaded hourly cost of that human.
 * @param {number} [input.fixedCost]        Plan fee or other fixed cost charged to this batch.
 * @returns {object} Either { error } or the full cost breakdown.
 */
export function computeImageCost({
  renders,
  pricePerRender,
  acceptRatePercent,
  retouchPassesPerKeeper = 0,
  reviewSecondsPerRender = 0,
  reviewerHourlyRate = 0,
  fixedCost = 0,
} = {}) {
  const fields = {
    renders,
    pricePerRender,
    acceptRatePercent,
    retouchPassesPerKeeper,
    reviewSecondsPerRender,
    reviewerHourlyRate,
    fixedCost,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (!isNum(value)) return { error: `Enter a number for every field (${key} is missing or not a number).` };
  }

  if (renders <= 0) return { error: "Enter at least one generated image." };
  if (renders > MAX_RENDERS) return { error: `Keep the number of generated images under ${MAX_RENDERS.toLocaleString("en-US")}.` };
  if (pricePerRender < 0) return { error: "Price per generated image cannot be negative." };
  if (acceptRatePercent <= MIN_ACCEPT_RATE) {
    return { error: "Acceptance rate must be above 0% — with no usable images there is no cost per usable image." };
  }
  if (acceptRatePercent > MAX_ACCEPT_RATE) return { error: "Acceptance rate cannot be above 100%." };
  if (retouchPassesPerKeeper < 0) return { error: "Retouch passes per keeper cannot be negative." };
  if (reviewSecondsPerRender < 0) return { error: "Review time per image cannot be negative." };
  if (reviewerHourlyRate < 0) return { error: "Reviewer hourly rate cannot be negative." };
  if (fixedCost < 0) return { error: "Fixed cost cannot be negative." };

  const keepers = (renders * acceptRatePercent) / 100;
  const rejects = renders - keepers;

  const generationCost = renders * pricePerRender;
  const retouchRenders = keepers * retouchPassesPerKeeper;
  const retouchCost = retouchRenders * pricePerRender;
  const reviewHours = (renders * reviewSecondsPerRender) / SECONDS_PER_HOUR;
  const reviewCost = reviewHours * reviewerHourlyRate;

  const totalCost = generationCost + retouchCost + reviewCost + fixedCost;
  const costPerUsable = totalCost / keepers;
  const costPerRenderAllIn = totalCost / renders;

  // Money spent on renders that were thrown away (generation only — rejects get no retouch).
  const wastedGenerationCost = rejects * pricePerRender;
  const wastedShare = totalCost > 0 ? (wastedGenerationCost / totalCost) * 100 : 0;

  // Renders consumed per shipped image, including retouch passes.
  const rendersPerKeeper = renders / keepers;
  const billedRendersPerKeeper = (renders + retouchRenders) / keepers;

  // How much the sticker price understates reality.
  const stickerMultiple = pricePerRender > 0 ? costPerUsable / pricePerRender : null;

  return {
    renders,
    acceptRatePercent,
    keepers,
    rejects,
    generationCost,
    retouchRenders,
    retouchCost,
    reviewHours,
    reviewCost,
    fixedCost,
    totalCost,
    costPerUsable,
    costPerRenderAllIn,
    wastedGenerationCost,
    wastedShare,
    rendersPerKeeper,
    billedRendersPerKeeper,
    stickerMultiple,
    band: acceptRateBand(acceptRatePercent),
  };
}

/**
 * Cost of a target number of shipped images, using the same per-keeper economics.
 * Renders needed is rounded up because you cannot buy a fraction of a render.
 */
export function projectToTarget(result, targetKeepers) {
  if (!result || result.error) return { error: "Fix the inputs above first." };
  if (!isNum(targetKeepers) || targetKeepers <= 0) return { error: "Enter how many finished images you need." };
  if (targetKeepers > MAX_RENDERS) return { error: "That target is too large to project." };

  const rendersNeeded = Math.ceil(targetKeepers * result.rendersPerKeeper);
  const budget = targetKeepers * result.costPerUsable;
  return { targetKeepers, rendersNeeded, budget };
}
