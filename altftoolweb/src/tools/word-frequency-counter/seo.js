const seo = {
  title: "Word Frequency Counter: Spreadsheet-Ready Output",
  metaDescription:
    "Paste text and get every word ranked by how often it appears, as tab-separated count-and-word lines that drop straight into Excel or Sheets.",
  steps: [
    "Paste text into the Input panel — it is lowercased and split into words on anything that is not a letter, digit or apostrophe — or click Load sample for a short example.",
    "The Result pane recounts on every keystroke, listing each word as count, tab, word — most frequent first, ties broken alphabetically.",
    "Click Copy to grab the ranked list; pasted into Excel or Google Sheets it lands as two clean columns of count and word.",
  ],
  intro:
    "A word frequency counter takes a block of text, lowercases it, splits it into words on anything that is not a letter, digit or apostrophe, and returns every distinct word with the number of times it appears, ordered from most to least frequent. Paste text on the left and the ranked list appears on the right as tab-separated count-and-word lines, updating on every keystroke. Ties are broken alphabetically, so the same input always produces the same order.",
  useCases: [
    "You are editing an article and suspect you keep reaching for the same verb — the ranked list shows exactly how many times it appears before an editor points it out",
    "You are checking whether a page actually covers its target term, and want the raw count for that keyword next to everything else you used more often",
    "You have a column of survey answers or support tickets and want a quick read on which words dominate before doing any real analysis",
  ],
  benefits: [
    ["Output built for a spreadsheet", "Each line is the count, a tab, then the word, so pasting into Excel, Sheets or Numbers lands in two clean columns."],
    ["Deterministic ordering", "Words with equal counts sort alphabetically, so re-running the same text gives byte-identical output you can diff."],
    ["Live recount as you edit", "The list recalculates on every change to the input, so you can delete a repeated word and watch the count drop immediately."],
  ],
  faqs: [
    [
      "Does it treat \"The\" and \"the\" as the same word?",
      "Yes — the whole input is lowercased before counting, so The, the and THE all fold into one entry. It does not stem, so \"run\" and \"running\" stay separate entries.",
    ],
    [
      "How are hyphens, punctuation and apostrophes handled?",
      "Words are matched as runs of letters, digits and apostrophes, which means \"don't\" stays one word while \"self-driving\" splits into \"self\" and \"driving\". All other punctuation acts purely as a separator and never appears in the output.",
    ],
    [
      "Can I exclude common words like \"the\" and \"and\"?",
      "There is no stopword filter here — every word is counted, so filler words normally take the top few rows. If you need them gone, paste the two-column output into a spreadsheet and delete the top rows, or use the Word & Character Counter, whose top-terms panel already skips 22 common words and anything under three letters.",
    ],
    [
      "Is there a size limit on the text I can paste?",
      "There is no hard cap — counting runs in the browser in a single pass, so the practical limit is your device's memory and how long you are willing to wait. Book-length text of a few hundred thousand words will process, but expect the live recount to lag as you type.",
    ],
  ],
};

export default seo;
