import { THESAURUS } from "../constants";

export function searchWord(query) {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();

  // Exact match first
  const exact = THESAURUS.find((e) => e.word === q);
  if (exact) return [exact];

  // Partial match
  return THESAURUS.filter(
    (e) => e.word.includes(q) || e.syn.some((s) => s.includes(q))
  ).slice(0, 15);
}

export function getWordDetail(word) {
  return THESAURUS.find((e) => e.word === word.toLowerCase()) || null;
}
