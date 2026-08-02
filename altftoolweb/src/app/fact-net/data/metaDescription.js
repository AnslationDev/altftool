/**
 * Fact Hub article descriptions are 229–286 characters of authored prose, so
 * they have to be shortened before they can serve as a meta description.
 *
 * `description.slice(0, 155)` cut mid-word on all eight live articles, and
 * because the result was under the 160-character cap with no closing
 * punctuation, trimMetaDescription() bolted a period onto the fragment:
 * "…give residents a ca.", "…the household uses or sto.", "…This orig."
 *
 * This helper cuts on the prose instead: whole sentences first, and when the
 * opening sentence is longer than the budget on its own, the clause boundary
 * closest to it.
 */
const MAX_LENGTH = 158;
const MIN_LENGTH = 70;

export function toMetaDescription(value = "", maxLength = MAX_LENGTH, minLength = MIN_LENGTH) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text || text.length <= maxLength) return text;

  // Prefer a whole number of sentences.
  let sentences = "";
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const next = sentences ? `${sentences} ${sentence}` : sentence;
    if (next.length > maxLength) break;
    sentences = next;
  }
  if (sentences.length >= minLength) return sentences;

  // The opening sentence alone overruns the budget: cut it at the last clause
  // boundary, and fall back to a word boundary only if there is none.
  const window = text.slice(0, maxLength + 1);
  const clause = Math.max(
    window.lastIndexOf(", "),
    window.lastIndexOf("; "),
    window.lastIndexOf(": "),
    window.lastIndexOf(" — "),
    window.lastIndexOf(" – "),
  );
  let clipped = clause >= minLength ? window.slice(0, clause) : "";

  if (!clipped) {
    const space = window.lastIndexOf(" ");
    clipped = space > minLength ? window.slice(0, space) : window.slice(0, maxLength);
  }

  clipped = clipped.replace(/[\s,;:—–-]+$/g, "").trim();
  return /[.!?]$/.test(clipped) ? clipped : `${clipped}.`;
}
