const seo = {
  intro:
    "The Em Dash AI Tell Checker counts the punctuation and structure habits that stand out in unedited language-model prose — em dashes (U+2014), curly quotes, the ellipsis glyph, semicolons, sentence-initial connectives such as Moreover and Ultimately, rule-of-three lists, and \"not only... but also\" framing — and reports each as a rate per 1,000 words. It also measures sentence- and paragraph-length variation using the coefficient of variation, since evenly sized sentences are one of the clearest signs a draft has not been read aloud. Every flag threshold is shown and adjustable, so you can see why a passage was marked.",
  useCases: [
    "Editing a ghostwritten or AI-assisted article before publishing, to find the passages that still read like a first draft",
    "Enforcing a house style that limits em dashes and semicolons in web copy",
    "Checking a student essay or newsletter for evenly sized sentences that need rhythm variation",
  ],
  benefits: [
    ["Shows the evidence", "Each flag comes with the surrounding sentence, so you can jump straight to the fix."],
    ["Rates, not raw counts", "Per-1,000-word rates let you compare a 400-word post with a 4,000-word feature."],
    ["One-click de-tell", "Replace every em dash with a comma, full stop or bracket and copy the cleaned draft."],
  ],
  faqs: [
    [
      "How many em dashes are too many?",
      "This tool flags a draft above 3 em dashes per 1,000 words by default, and you can change that number. There is no official limit — the em dash is correct punctuation — but because it is not on a standard phone or laptop keyboard, several of them in short web copy is worth a second look.",
    ],
    [
      "What is the difference between an em dash, an en dash and a hyphen?",
      "An em dash (—, U+2014) marks a break in a sentence; an en dash (–, U+2013) joins ranges such as 10–15; a hyphen (-) joins words such as well-known. Mixing a spaced en dash and an em dash in the same document usually means the text was assembled from two sources, which is why this tool flags that combination.",
    ],
    [
      "Does a high score mean AI wrote my text?",
      "No. The score counts style conventions, and there is no reliable way to detect authorship from text alone — published AI-detection classifiers produce both false positives and false negatives, especially for non-native English writers. Use the result to improve the draft, never to accuse anyone.",
    ],
    [
      "What does sentence-length variation measure?",
      "It is the coefficient of variation: the standard deviation of words per sentence divided by the mean. A value under 0.4 means nearly every sentence is the same length, which is what makes a passage feel flat; mixing a five-word sentence with a thirty-word one raises the number and the readability.",
    ],
  ],
};

export default seo;
