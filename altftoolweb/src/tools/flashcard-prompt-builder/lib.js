/**
 * Flashcard Prompt Builder — assembles a prompt that makes an AI assistant
 * output a clean, importable flashcard set.
 *
 * Card-writing rules encoded in the prompt follow the "minimum information
 * principle" from SuperMemo's Twenty Rules of Formulating Knowledge
 * (Wozniak, 1999): one fact per card, short answers, no yes/no cards.
 * The export format is tab-separated front/back lines, the most robust
 * plain-text import format accepted by Anki and similar SRS apps; cloze cards
 * use Anki's {{c1::...}} cloze deletion syntax.
 */

/** Card formats the prompt can request. */
export const CARD_FORMATS = [
  {
    id: "basic",
    label: "Basic question → answer",
    rule: "front is a single specific question, back is the shortest complete answer",
  },
  {
    id: "term-definition",
    label: "Term → definition",
    rule: "front is one term or name, back is a one-sentence definition in plain words",
  },
  {
    id: "cloze",
    label: "Cloze deletion",
    rule: "a single sentence with the key fact wrapped in Anki cloze syntax {{c1::like this}}; one deletion per card",
  },
];

/** Practical bounds. */
export const MIN_CARDS = 1;
export const MAX_CARDS = 500;
/**
 * Cards requested per AI response. Beyond roughly 40 cards a single response
 * starts truncating or drifting from the format, so bigger decks are split
 * into numbered batches the user requests one at a time.
 */
export const CARDS_PER_BATCH = 40;

/**
 * Split `total` cards into ceil(total / batchSize) batches whose sizes differ
 * by at most one card (earlier batches take the remainder).
 */
export function splitIntoBatches(total, batchSize) {
  const batches = Math.ceil(total / batchSize);
  const base = Math.floor(total / batches);
  const remainder = total - base * batches;
  return Array.from({ length: batches }, (_, index) => base + (index < remainder ? 1 : 0));
}

/**
 * Build the flashcard-generation prompt.
 *
 * @param {object} input
 * @param {string} input.topic          Subject of the deck.
 * @param {string} [input.source]       Optional pasted notes to make cards from.
 * @param {number} input.cardCount      Whole number of cards wanted.
 * @param {string} input.formatId       Id from CARD_FORMATS.
 * @param {boolean} [input.tsvOutput]   Ask for tab-separated output for SRS import.
 * @param {boolean} [input.addTags]     Ask for a topic tag as a third column.
 * @returns {object} { prompt, cardCount, batchSizes, format } or { error }.
 */
export function buildFlashcardPrompt({
  topic,
  source = "",
  cardCount,
  formatId,
  tsvOutput = true,
  addTags = false,
}) {
  const cleanTopic = typeof topic === "string" ? topic.trim() : "";
  if (!cleanTopic) return { error: "Enter the topic the flashcards should cover." };

  const format = CARD_FORMATS.find((option) => option.id === formatId);
  if (!format) return { error: "Choose a card format." };

  const total = Number(cardCount);
  if (!Number.isInteger(total) || total < MIN_CARDS || total > MAX_CARDS) {
    return { error: `Number of cards must be a whole number between ${MIN_CARDS} and ${MAX_CARDS}.` };
  }

  const batchSizes = splitIntoBatches(total, CARDS_PER_BATCH);
  const batches = batchSizes.length;
  const cleanSource = typeof source === "string" ? source.trim() : "";

  const lines = [];
  lines.push("You are an expert flashcard author who follows the minimum information principle.");
  lines.push("");
  lines.push(`Create ${total} flashcard${total === 1 ? "" : "s"} on: ${cleanTopic}.`);
  if (cleanSource) {
    lines.push("");
    lines.push("Base every card only on this source material (do not invent facts beyond it):");
    lines.push('"""');
    lines.push(cleanSource);
    lines.push('"""');
  }
  lines.push("");
  lines.push(`Card format — ${format.label}: ${format.rule}.`);
  lines.push("");
  lines.push("Card-writing rules (minimum information principle):");
  lines.push("- Exactly one fact per card; split compound facts into separate cards.");
  lines.push("- Answers must be as short as possible while still complete — a word, a name, a number or one short sentence.");
  lines.push("- No yes/no questions and no \"all of the above\" style cards.");
  lines.push("- Wording must be unambiguous: the front must have exactly one correct answer.");
  lines.push("- Do not repeat the same fact in two cards, even reworded.");
  if (tsvOutput) {
    lines.push("");
    lines.push("Output format (for direct import into Anki or another SRS app):");
    lines.push(
      addTags
        ? "- One card per line: front, a TAB character, back, a TAB character, then one lowercase topic tag."
        : "- One card per line: front, a TAB character, then back.",
    );
    lines.push("- No numbering, no bullet points, no blank lines, no commentary before or after the cards.");
  } else {
    lines.push("");
    lines.push("Output format:");
    lines.push("- Number the cards 1 to " + total + ", each as \"Q:\" on one line and \"A:\" on the next.");
  }
  if (batches > 1) {
    lines.push("");
    lines.push(
      `Deliver the deck in ${batches} batches of about ${Math.round(total / batches)} cards so nothing is truncated: output batch 1 of ${batches} (${batchSizes[0]} cards) now, then wait for me to say "next" before each following batch. Batch sizes: ${batchSizes.join(", ")}.`,
    );
  }

  return {
    prompt: lines.join("\n"),
    cardCount: total,
    batchSizes,
    batches,
    format: format.label,
  };
}
