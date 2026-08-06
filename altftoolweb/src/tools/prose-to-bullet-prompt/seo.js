const seo = {
  intro:
    "Prose to Bullet Prompt measures the text you paste — words, sentences, paragraphs, Flesch Reading Ease and Flesch-Kincaid grade level, all computed from their published formulas — then turns a compression percentage into a concrete bullet budget: target word count, number of bullets and words per bullet. The prompt it produces tells the model exactly how many bullets to write, in which style, and forbids dropping any fact, number or date from the source. For anyone converting a dense document into something a reader will actually scan.",
  useCases: [
    "Compress a four-paragraph project update into three claim-and-number bullets for a leadership channel.",
    "Turn a policy page into a briefing note without losing a single date or threshold.",
    "Check the Flesch score of a draft before deciding how hard the bullet version needs to work.",
    "Convert meeting minutes into verb-first action bullets that read consistently.",
  ],
  benefits: [
    ["A real compression target", "40% of 64 words is 26 words, which at 12 words a bullet is 3 bullets — no guessing."],
    ["Readability measured, not asserted", "Flesch Reading Ease and Flesch-Kincaid grade are calculated from the source text itself."],
    ["Facts protected", "The prompt makes losing any number, name or date an explicit failure condition."],
  ],
  faqs: [
    [
      "What is a good Flesch Reading Ease score?",
      "A score of 60 to 70 is considered plain English and is roughly an eighth-to-ninth grade reading level; below 30 the text is difficult and best suited to a specialist audience. The score falls as sentences get longer and words get more syllables, so shortening sentences is usually the fastest way to raise it.",
    ],
    [
      "How many words should a bullet point be?",
      "Around 8 to 14 words works for most lists — long enough to carry a complete idea, short enough to scan in one fixation. If a bullet needs a semicolon or a second clause, it is really two bullets.",
    ],
    [
      "How many bullets should a list have?",
      "Keep a flat list at or under about seven items; beyond that, group them under two to four short headings — unless you chose to keep the original order, in which case the prompt leaves the list flat rather than re-clustering it out of sequence. The seven-item guideline comes from Miller's 1956 paper on short-term memory span, and while the original claim is often over-applied, the practical effect on scannability is real.",
    ],
    [
      "Will converting prose to bullets lose information?",
      "It will if you compress hard — that is the point of setting an explicit target. The generated prompt requires the model to state, on a final line, anything it had to drop to hit the length, so you can decide whether to raise the compression percentage.",
    ],
  ],
};

export default seo;
