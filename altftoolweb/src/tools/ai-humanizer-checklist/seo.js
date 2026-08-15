const seo = {
  title: "AI Humanizer Checklist: Sentence Variation & Phrases",
  metaDescription:
    "Counts filler connectors, hedges, em dashes and -ly adverbs per 1,000 words plus sentence-length std dev, then ranks 15 edits. Not an AI detector.",
  steps: [
    "Paste the text into 'Your draft' — it is analysed in your browser and never uploaded.",
    "Work down 'The edits, most urgent first', where any item whose signal fired in the scan carries a 'signal raised' badge and is pinned to the top.",
    "Read 'Checklist completed' with the sentence-length std dev and the phrase, hedge, dash and -ly adverb rates per 1,000 words, then press 'Copy report'.",
  ],
  intro:
    "This checklist measures the surface habits that make an AI draft read mechanically — over-used connectors such as 'moreover' and 'in conclusion', hedge words, em-dash density, -ly adverb rate, repeated sentence openers and low sentence-length variation — then orders fifteen concrete edits so the ones your draft actually needs come first. Sentence-length variation is reported as a standard deviation in words, because uniform sentence length is the loudest single tell in generated prose. It is an editing workflow for writers and editors, not an AI detector, and it makes no claim about who wrote the text.",
  useCases: [
    "Rewrite a model-drafted blog post into your own voice before publishing it under your byline.",
    "Show a junior writer exactly which phrases and rhythms to cut, with counts rather than opinions.",
    "Check a client-facing email for hedging and filler connectors before it goes out.",
  ],
  benefits: [
    ["Counts, not vibes", "Every finding is a number: phrases per 1,000 words, dashes per 1,000, sentence-length standard deviation."],
    ["Edits ranked by your draft", "Checklist items whose signal fired in the scan are pinned to the top; the rest sort by impact weight."],
    ["Runs in the browser", "The draft is analysed locally in your browser and never uploaded to a server."],
  ],
  faqs: [
    [
      "How do I make AI writing sound human?",
      "Vary sentence length, cut generic connectors, and add one specific detail only you could know. Uniform sentence length is the biggest giveaway — human non-fiction usually shows a sentence-length standard deviation well above five words, while generated prose often sits below it.",
    ],
    [
      "Which words give away AI writing?",
      "The recurring offenders are connector and inflation phrases: moreover, furthermore, additionally, in conclusion, delve into, a testament to, unlock the potential, ever-evolving landscape and in today's fast-paced world. This tool counts more than forty of them and reports the rate per 1,000 words.",
    ],
    [
      "Is this an AI detector?",
      "No. It measures writing style, not authorship, and it deliberately produces no probability that a text was machine-written. Commercial AI detectors are unreliable and misclassify non-native English writing in particular, so no score of that kind should be used to accuse anyone.",
    ],
    [
      "Does rewriting AI text help with search rankings?",
      "Google's guidance rewards helpful, original content regardless of how it was produced, and penalises mass-produced pages made primarily to rank. The edits here — real numbers, first-hand examples, verified claims — are the ones that add the originality automated drafts lack.",
    ],
  ],
};

export default seo;
