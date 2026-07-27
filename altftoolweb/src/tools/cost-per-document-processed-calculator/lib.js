/**
 * Cost Per Document Processed Calculator — pure token and cost arithmetic.
 *
 * Token estimate uses the widely published English rule of thumb: one token is
 * roughly four characters, or about 0.75 of a word, so
 *   tokens = words / 0.75
 * Chunking adds the overlap that RAG pipelines repeat between neighbouring
 * chunks:
 *   chunks    = ceil(tokens / chunk size)
 *   billed    = tokens + (chunks - 1) * overlap
 * Every chunk also carries the instruction prompt, and the whole document may be
 * read more than once (extraction pass, verification pass).
 * Prices are per million tokens, as the model APIs publish them.
 */

/** English rule of thumb: 1 token is about 0.75 words (about 4 characters). */
export const WORDS_PER_TOKEN = 0.75;
/** Model APIs quote prices per million tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;

const ceilSafe = (value) => (value > 0 ? Math.ceil(value) : 0);

/**
 * @param {object} input
 * @param {number} input.pages             pages per document
 * @param {number} input.wordsPerPage      average words on a page
 * @param {number} input.chunkTokens       chunk size in tokens (0 = send whole document)
 * @param {number} input.overlapTokens     tokens repeated between neighbouring chunks
 * @param {number} input.promptTokens      instruction tokens sent with every chunk
 * @param {number} input.outputTokens      tokens the model returns per document per pass
 * @param {number} input.passes            how many times the document is read
 * @param {number} input.inputPricePerM    price per million input tokens
 * @param {number} input.outputPricePerM   price per million output tokens
 * @param {number} input.ocrPricePerPage   OCR or document-parse cost per page
 * @param {number} input.embedPricePerM    embedding price per million tokens (0 = no indexing)
 * @param {number} input.documentsPerMonth volume for the monthly view
 */
export function computeDocumentCost({
  pages,
  wordsPerPage,
  chunkTokens = 0,
  overlapTokens = 0,
  promptTokens = 0,
  outputTokens = 0,
  passes = 1,
  inputPricePerM,
  outputPricePerM,
  ocrPricePerPage = 0,
  embedPricePerM = 0,
  documentsPerMonth = 0,
} = {}) {
  const values = {
    pages,
    wordsPerPage,
    chunkTokens,
    overlapTokens,
    promptTokens,
    outputTokens,
    passes,
    inputPricePerM,
    outputPricePerM,
    ocrPricePerPage,
    embedPricePerM,
    documentsPerMonth,
  };
  if (Object.values(values).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (pages < 1) return { error: "A document needs at least one page." };
  if (pages > 100000) return { error: "Keep pages per document at 100,000 or below." };
  if (wordsPerPage < 0) return { error: "Words per page cannot be negative." };
  if (Object.values(values).some((value) => value < 0)) {
    return { error: "Tokens, prices and volumes cannot be negative." };
  }
  if (passes < 1) return { error: "The document is read at least once, so passes must be 1 or more." };
  if (passes > 20) return { error: "Keep passes at 20 or below." };
  if (chunkTokens > 0 && overlapTokens >= chunkTokens) {
    return { error: "Overlap must be smaller than the chunk size, or chunking never advances." };
  }

  const words = pages * wordsPerPage;
  const documentTokens = words / WORDS_PER_TOKEN;

  const chunks = chunkTokens > 0 ? Math.max(1, ceilSafe(documentTokens / chunkTokens)) : 1;
  const overlapBilled = chunkTokens > 0 ? (chunks - 1) * overlapTokens : 0;
  const promptOverhead = promptTokens * chunks;

  const inputTokensPerPass = documentTokens + overlapBilled + promptOverhead;
  const totalInputTokens = inputTokensPerPass * passes;
  const totalOutputTokens = outputTokens * passes;

  const inputCost = (totalInputTokens * inputPricePerM) / TOKENS_PER_PRICE_UNIT;
  const outputCost = (totalOutputTokens * outputPricePerM) / TOKENS_PER_PRICE_UNIT;
  const ocrCost = pages * ocrPricePerPage;
  const embedTokens = documentTokens + overlapBilled;
  const embedCost = (embedTokens * embedPricePerM) / TOKENS_PER_PRICE_UNIT;

  const totalPerDocument = inputCost + outputCost + ocrCost + embedCost;
  const costPerPage = pages > 0 ? totalPerDocument / pages : null;
  const costPer1000 = totalPerDocument * 1000;
  const monthlyCost = totalPerDocument * documentsPerMonth;

  const breakdown = [
    { id: "input", label: "Model input", amount: inputCost },
    { id: "output", label: "Model output", amount: outputCost },
    { id: "ocr", label: "OCR / document parsing", amount: ocrCost },
    { id: "embed", label: "Embedding for search", amount: embedCost },
  ].map((row) => ({
    ...row,
    sharePct: totalPerDocument > 0 ? Math.round((row.amount / totalPerDocument) * 1000) / 10 : 0,
  }));

  const largest = breakdown.slice().sort((a, b) => b.amount - a.amount)[0];

  const notes = [];
  if (overlapBilled > 0) {
    notes.push(
      `Chunk overlap adds ${Math.round(overlapBilled).toLocaleString("en-US")} tokens per pass — ${Math.round((overlapBilled / inputTokensPerPass) * 100)}% of the input on top of the document itself.`,
    );
  }
  if (passes > 1) {
    notes.push(
      `${passes} passes multiply the input cost by ${passes}. A cheaper model on the verification pass usually costs less than a second full-price read.`,
    );
  }
  if (largest && totalPerDocument > 0) {
    notes.push(`${largest.label} is the largest line at ${largest.sharePct}% of the per-document cost.`);
  }

  return {
    words,
    documentTokens: Math.round(documentTokens),
    chunks,
    overlapBilled: Math.round(overlapBilled),
    promptOverhead: Math.round(promptOverhead),
    inputTokensPerPass: Math.round(inputTokensPerPass),
    totalInputTokens: Math.round(totalInputTokens),
    totalOutputTokens: Math.round(totalOutputTokens),
    inputCost,
    outputCost,
    ocrCost,
    embedCost,
    totalPerDocument,
    costPerPage,
    costPer1000,
    monthlyCost,
    breakdown,
    notes,
  };
}
