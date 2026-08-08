const seo = {
  title: "AI Writing Tell Scanner: Delve, Tapestry, Realm",
  metaDescription:
    "Highlight 80+ AI giveaway words and stock phrases in your draft with a plainer replacement each, scored as weighted hits per 1,000 words.",
  steps: [
    "Paste your text into the Draft box; the whole scan happens in the browser as you type, with no upload.",
    "Tick the Categories to scan, choosing inflated verbs, grand nouns, filler adjectives, stock phrases or hedges to narrow which of the 80-plus markers are flagged.",
    "Read the Filler score out of 100 and the weighted hits per 1,000 words, check each highlight's plainer replacement, then press Copy report.",
  ],
  intro:
    "The AI Writing Tell Scanner matches your draft against a bank of 80-plus words and phrases that appear far more often in unedited language-model prose than in ordinary writing — delve, tapestry, testament, realm, seamless, meticulous, plethora, \"it is important to note\", \"in today's fast-paced world\" — and highlights each one in place with a plainer replacement. Hits are weighted (strong markers count double) and reported as a density per 1,000 words, so a short email and a long report can be compared on the same scale. The whole scan runs in your browser.",
  useCases: [
    "Editing an AI-assisted blog post so it stops opening with \"in today's fast-paced world\"",
    "Giving a content team a shared vocabulary blocklist and a fast way to check drafts against it",
    "Tightening a cover letter or bio where inflated verbs like harness and leverage have crept in",
  ],
  benefits: [
    ["Replacement, not just a flag", "Each hit comes with a concrete plainer alternative you can drop straight in."],
    ["Filter by category", "Scan only inflated verbs, grand nouns, filler adjectives, stock phrases or hedges."],
    ["Whole-word matching", "\"Vitality\" is never flagged as \"vital\", so the highlights stay trustworthy."],
  ],
  faqs: [
    [
      "Why is the word delve considered an AI tell?",
      "Delve is a normal English verb, but it appears far more often in language-model output than in ordinary published prose, which made it one of the first widely noticed markers. In most sentences \"look at\", \"dig into\" or \"study\" says the same thing more plainly, so replacing it costs nothing.",
    ],
    [
      "Does removing these words make my text undetectable as AI?",
      "No, and that is not the goal. Detection classifiers do not work by word lists, and none of them are reliable enough to be used as evidence. Cutting stock phrasing makes writing clearer and more specific — that is the benefit, regardless of who or what produced the first draft.",
    ],
    [
      "Should I remove every highlighted word?",
      "No. Each entry is real English used correctly in some contexts — a robust test suite really is robust. Treat a highlight as a prompt to check whether the word is carrying meaning; if a shorter, more concrete word says the same thing, use it.",
    ],
    [
      "How is the filler score calculated?",
      "Every match scores 2 points for a strong marker or 1 for a milder one; the total is divided by the word count and scaled so 25 weighted hits per 1,000 words equals 100. That is roughly one stock phrase every 40 words, or about one every second sentence.",
    ],
  ],
};

export default seo;
