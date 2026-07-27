/**
 * Cost Per Blog Post AI Calculator — pure arithmetic.
 *
 * Word-to-token conversion uses the published English rule of thumb of about
 * 0.75 words per token (roughly four characters per token):
 *   draft tokens = words / 0.75
 *
 * The model bill has three parts:
 *   drafting   — brief and research sent on every attempt, full draft returned
 *                on each attempt (regenerations are the hidden cost)
 *   editing    — each pass resends the draft plus an instruction, and returns a
 *                revised fraction of it
 *   images     — a flat price per generated image
 * Human review time is priced at the editor's fully loaded hourly rate, and the
 * whole post is compared with commissioning it from a writer at a per-word rate.
 */

/** English rule of thumb: 1 token is about 0.75 words. */
export const WORDS_PER_TOKEN = 0.75;
/** Model APIs quote prices per million tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;
export const MINUTES_PER_HOUR = 60;

/**
 * @param {object} input
 * @param {number} input.words             finished word count
 * @param {number} input.draftAttempts     full drafts generated before one is kept
 * @param {number} input.briefTokens       brief + research context sent with each attempt
 * @param {number} input.editPasses        editing passes over the kept draft
 * @param {number} input.editInstructionTokens instruction tokens per editing pass
 * @param {number} input.editRewritePct    share of the draft the model rewrites per pass (0-100)
 * @param {number} input.inputPricePerM    price per million input tokens
 * @param {number} input.outputPricePerM   price per million output tokens
 * @param {number} input.images            generated images in the post
 * @param {number} input.imagePrice        price per generated image
 * @param {number} input.humanMinutes      editor minutes on the post
 * @param {number} input.editorHourlyCost  fully loaded editor cost per hour
 * @param {number} input.writerRatePerWord what a writer would charge per word
 * @param {number} input.postsPerMonth     volume for the monthly view
 */
export function computeBlogPostCost({
  words,
  draftAttempts = 1,
  briefTokens = 0,
  editPasses = 0,
  editInstructionTokens = 0,
  editRewritePct = 0,
  inputPricePerM,
  outputPricePerM,
  images = 0,
  imagePrice = 0,
  humanMinutes = 0,
  editorHourlyCost = 0,
  writerRatePerWord = 0,
  postsPerMonth = 0,
} = {}) {
  const values = {
    words,
    draftAttempts,
    briefTokens,
    editPasses,
    editInstructionTokens,
    editRewritePct,
    inputPricePerM,
    outputPricePerM,
    images,
    imagePrice,
    humanMinutes,
    editorHourlyCost,
    writerRatePerWord,
    postsPerMonth,
  };
  if (Object.values(values).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (words < 1) return { error: "A post needs at least one word." };
  if (words > 200000) return { error: "Keep the word count at 200,000 or below." };
  if (draftAttempts < 1) return { error: "At least one draft has to be generated." };
  if (draftAttempts > 50) return { error: "Keep draft attempts at 50 or below." };
  if (editPasses < 0 || editPasses > 50) return { error: "Editing passes must be between 0 and 50." };
  if (editRewritePct < 0 || editRewritePct > 100) {
    return { error: "The share rewritten per editing pass must be between 0% and 100%." };
  }
  if (Object.values(values).some((value) => value < 0)) {
    return { error: "Counts, prices and rates cannot be negative." };
  }

  const draftTokens = words / WORDS_PER_TOKEN;

  const attempts = Math.floor(draftAttempts);
  const passes = Math.floor(editPasses);

  const draftingInput = briefTokens * attempts;
  const draftingOutput = draftTokens * attempts;

  const editingInput = passes * (draftTokens + editInstructionTokens);
  const editingOutput = passes * draftTokens * (editRewritePct / 100);

  const totalInputTokens = draftingInput + editingInput;
  const totalOutputTokens = draftingOutput + editingOutput;

  const inputCost = (totalInputTokens * inputPricePerM) / TOKENS_PER_PRICE_UNIT;
  const outputCost = (totalOutputTokens * outputPricePerM) / TOKENS_PER_PRICE_UNIT;
  const modelCost = inputCost + outputCost;
  const imageCost = images * imagePrice;
  const humanCost = (humanMinutes / MINUTES_PER_HOUR) * editorHourlyCost;

  const totalPerPost = modelCost + imageCost + humanCost;
  const costPerWord = words > 0 ? totalPerPost / words : null;
  const costPer1000Words = costPerWord === null ? null : costPerWord * 1000;

  const writerCost = words * writerRatePerWord;
  const savingPerPost = writerCost - totalPerPost;
  const savingPct = writerCost > 0 ? (savingPerPost / writerCost) * 100 : null;

  const monthlyCost = totalPerPost * postsPerMonth;
  const monthlyWriterCost = writerCost * postsPerMonth;

  const breakdown = [
    { id: "model", label: "Model tokens", amount: modelCost },
    { id: "images", label: "Images", amount: imageCost },
    { id: "human", label: "Human editing time", amount: humanCost },
  ].map((row) => ({
    ...row,
    sharePct: totalPerPost > 0 ? Math.round((row.amount / totalPerPost) * 1000) / 10 : 0,
  }));

  const largest = breakdown.slice().sort((a, b) => b.amount - a.amount)[0];

  const notes = [];
  if (attempts > 1) {
    const wasted = draftTokens * (attempts - 1) * (outputPricePerM / TOKENS_PER_PRICE_UNIT);
    notes.push(
      `Discarded drafts cost ${wasted.toFixed(4)} — ${attempts - 1} of ${attempts} generations are thrown away.`,
    );
  }
  if (largest && totalPerPost > 0 && largest.id === "human") {
    notes.push(
      `Editing time is ${largest.sharePct}% of the cost. The lever here is the brief and the source material, not the model price.`,
    );
  }
  if (writerCost > 0) {
    notes.push(
      savingPerPost >= 0
        ? `A commissioned writer at this rate would cost ${writerCost.toFixed(2)} for the same length.`
        : `This is more expensive than commissioning the post at ${writerRatePerWord} per word.`,
    );
  }
  const humanMinutesPerThousand = words > 0 ? (humanMinutes / words) * 1000 : 0;
  if (humanMinutes > 0) {
    notes.push(
      `That is ${Math.round(humanMinutesPerThousand)} editor minutes per 1,000 words — track it, because it rises when the draft quality drops.`,
    );
  }

  return {
    draftTokens: Math.round(draftTokens),
    totalInputTokens: Math.round(totalInputTokens),
    totalOutputTokens: Math.round(totalOutputTokens),
    inputCost,
    outputCost,
    modelCost,
    imageCost,
    humanCost,
    totalPerPost,
    costPerWord,
    costPer1000Words,
    writerCost,
    savingPerPost,
    savingPct: savingPct === null ? null : Math.round(savingPct * 10) / 10,
    monthlyCost,
    monthlyWriterCost,
    monthlySaving: monthlyWriterCost - monthlyCost,
    humanMinutesPerThousand: Math.round(humanMinutesPerThousand),
    breakdown,
    notes,
  };
}
