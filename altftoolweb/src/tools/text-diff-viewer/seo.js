const seo = {
  title: "Text Diff Viewer with Word-Level Change Highlights",
  metaDescription:
    "Compare two drafts side by side with changed words highlighted inside edited lines - similarity and churn percentages, version history, markdown export.",
  steps: [
    "Paste the two drafts into the Before and After boxes — up to 1,500 lines each — and toggle Ignore case, Ignore whitespace or 'Show unchanged lines'.",
    "Read the side-by-side table where changed words are highlighted inside edited lines, with similarity and churn percentages above it.",
    "Press 'Copy export' for a markdown table of the comparison, or 'Save version' to snapshot the After text and reload it later as Before or After.",
  ],
  intro:
    "The Text Diff Viewer aligns two versions of a document side by side and highlights the individual words that changed inside each edited line, rather than repainting the whole line. It runs a line-level longest common subsequence to pair the versions up, then a second word-level pass on any line that was replaced, and reports similarity and churn as Dice coefficients over words. It is for writers, editors and reviewers who need to see what moved between two drafts.",
  useCases: [
    "Review an edited policy page and see that only 'within 14 days' became 'within 30 days' on line 2",
    "Track a document across several drafts by saving each version and re-comparing any two of them",
    "Export a side-by-side markdown table into a pull request or a review ticket as evidence of what changed",
  ],
  benefits: [
    ["Word-level highlighting", "Edited lines show the changed words, so a one-word fix does not look like a rewrite."],
    ["Version history", "Snapshot any draft, then load it back into either side to compare against a later one."],
    ["Churn as a number", "Words added plus removed over total words, so you can say how much of a document really moved."],
  ],
  faqs: [
    [
      "What is the difference between similarity and churn?",
      "Similarity is twice the shared word count divided by the total word count of both versions — identical drafts score 100%. Churn is the words added plus the words removed over the same total. They sum to 100%: a comparison at 81.5% similarity has 18.5% churn.",
    ],
    [
      "Why does a rewritten line show as fully changed rather than word by word?",
      "When two paired lines share less than 30% of their words, the tool stops trying to align them and marks the whole line as replaced. Below that threshold, word-level highlighting picks out coincidental matches like 'the' and 'and', which is harder to read than a clean replacement.",
    ],
    [
      "Does the version history survive a page reload?",
      "No. Saved versions live in the browser tab's memory only, so a reload clears them. That keeps the tool free of any storage of your text — nothing is written to disk, and nothing is sent to a server.",
    ],
    [
      "How large a document can it compare?",
      "Up to 1,500 lines per version. The alignment builds an LCS table of (m+1)×(n+1) integers, so 1,500 by 1,500 is about 2.25 million cells — the largest that stays instant in a browser tab. For bigger files, compare a section at a time.",
    ],
  ],
};

export default seo;
