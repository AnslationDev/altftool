const seo = {
  title: "Text Diff Tool — Compare & Export Unified Diff",
  metaDescription:
    "Line-by-line diff with the LCS algorithm: added and removed lines, similarity %, and a unified diff you can copy. Handles up to 2,000 lines per side.",
  steps: [
    "Paste the two versions into the Original and Changed boxes — up to 2,000 lines per side.",
    "Tick Ignore letter case or Ignore whitespace changes if needed, and set Context lines in the unified diff (0–20, default 3).",
    "Read the similarity score with lines added and removed, check the colour-coded Line by line table, and click Copy diff for the ---/+++/@@ unified diff.",
  ],
  intro:
    "A text diff tool compares two versions of a document line by line and reports exactly which lines were added, removed or left alone. This one computes the longest common subsequence with the Hunt-McIlroy dynamic program — the same idea behind diff(1) — so the edit script it produces is minimal, and it can export the result as a unified diff that `git apply` and `patch` both understand. It handles up to 2,000 lines per side and runs entirely in your browser.",
  useCases: [
    "Check what actually changed between two drafts of a policy, contract or product description before publishing",
    "Compare two config files or environment variable dumps to find the single line causing a deployment difference",
    "Produce a unified diff from two pasted snippets when you cannot get both versions into version control",
  ],
  benefits: [
    ["Minimal edit script", "The LCS algorithm reports the smallest set of changes, not a naive line-for-line mismatch."],
    ["Unified diff export", "Standard `--- / +++ / @@` output with a configurable number of context lines."],
    ["Noise filters", "Optionally ignore letter case or collapse whitespace so real changes are not buried in reformatting."],
  ],
  faqs: [
    [
      "How is the similarity percentage calculated?",
      "It is the Dice coefficient over lines: twice the number of common lines divided by the total line count of both sides. Five lines against six with four in common scores 2×4 ÷ 11 = 72.7%. Two identical files score 100%, and two files sharing no lines score 0%.",
    ],
    [
      "What is a unified diff?",
      "The standard patch format: two header lines starting `---` and `+++`, then one or more hunks introduced by `@@ -start,count +start,count @@`. Removed lines are prefixed with `-`, added lines with `+`, and unchanged context with a space. Three context lines either side of each change is the conventional default, which is what this tool uses.",
    ],
    [
      "Why does it show a line as both removed and added when I only edited a word?",
      "Line-level diffing treats a line as an indivisible unit, so any change inside it appears as one deletion plus one insertion. That is exactly how `diff -u` and `git diff` behave. Turn on 'ignore whitespace' if the only difference is indentation or spacing.",
    ],
    [
      "Is there a size limit?",
      "Yes — 2,000 lines per side. The LCS dynamic program allocates a table of (m+1)×(n+1) cells, so 2,000 by 2,000 is four million cells, roughly 16 MB. Beyond that a browser tab starts to stall, so the tool refuses rather than freezing.",
    ],
  ],
};

export default seo;
