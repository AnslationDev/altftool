const seo = {
  intro:
    "Jaccard Similarity Calculator measures how much two texts overlap by turning each into a set of tokens and dividing the shared tokens by the combined tokens — the Jaccard index defined by Paul Jaccard in 1901. It also reports the Jaccard distance, the Dice–Sørensen coefficient, the Szymkiewicz–Simpson overlap coefficient and the Otsuka–Ochiai set cosine, and lets you tokenise by word, character, line or character n-gram shingles for near-duplicate detection.",
  useCases: [
    "Check whether two product descriptions are near-duplicates before publishing both, using 3-character shingles rather than whole words.",
    "Compare two keyword lists and see exactly which terms are shared, which are unique to each, and what share of the combined list overlaps.",
    "Score a model's extracted-entity output against a gold set, where order does not matter but membership does.",
    "Deduplicate two config or CSV column exports by tokenising per line and reading the only-in-A and only-in-B lists.",
  ],
  benefits: [
    [
      "Four coefficients, one calculation",
      "Jaccard, Dice, overlap and cosine all read the same intersection but normalise it differently, and seeing them together stops the wrong one being quoted.",
    ],
    [
      "Shingles for near-duplicate text",
      "Character n-grams catch reworded copy that word-level comparison scores as unrelated.",
    ],
    [
      "The tokens themselves are shown",
      "Shared, only-in-A and only-in-B lists make the number checkable instead of a black box.",
    ],
  ],
  faqs: [
    [
      "How do you calculate Jaccard similarity?",
      "Divide the number of tokens the two sets share by the number of distinct tokens across both. If set A has 4 words and set B has 4 words with 3 in common, the union is 4 + 4 − 3 = 5, so the Jaccard index is 3/5 = 0.6. Jaccard distance is simply 1 minus that, or 0.4.",
    ],
    [
      "What is the difference between Jaccard and Dice similarity?",
      "Dice divides twice the intersection by the sum of the two set sizes, so it weights the shared elements more heavily and always returns a value at or above Jaccard. The two are exact transforms of each other: Dice = 2J/(1+J). A Jaccard of 0.6 is always a Dice of 0.75.",
    ],
    [
      "What is a good Jaccard similarity score?",
      "It depends entirely on the tokenisation, so there is no universal threshold. Near-duplicate detection on 3-character shingles typically flags documents above roughly 0.8, while topical similarity on word sets is often meaningful from 0.3 upward. Fix your tokenisation first, then calibrate a threshold on examples you have already judged.",
    ],
    [
      "Does Jaccard similarity account for how often a word appears?",
      "No. Jaccard operates on sets, so a word appearing once and a word appearing fifty times contribute identically. If repetition matters, use cosine similarity over term-frequency or TF-IDF vectors, which is a different measure from the set cosine shown here.",
    ],
  ],
};

export default seo;
