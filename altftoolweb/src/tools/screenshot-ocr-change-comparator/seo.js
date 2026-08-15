const seo = {
  title: "Screenshot OCR Change Comparator: Line + Word",
  metaDescription:
    "Diff two screenshots' OCR text you paste and confirm you reviewed: line and word additions, removals, replacements and a similarity percentage.",
  steps: [
    "Use 'Choose screenshot' on the 'Before screenshot' and 'After screenshot' panels — PNG, JPEG or WebP up to 20 MB — to load local previews.",
    "Paste each transcript into 'Before transcript' and 'After transcript' from your own OCR, correct it against the preview, and tick 'I reviewed this transcript' on both.",
    "Press 'Compare reviewed text' for the line and word change counts and similarity percentage, then 'Download counts' to save screenshot-ocr-change-counts-only.json.",
  ],
  intro:
    "This tool diffs the text of two screenshots by comparing OCR transcripts you paste and confirm you have reviewed, running a longest-common-subsequence diff at both line and word level and reporting additions, removals, replacements, unchanged counts and a similarity percentage. It deliberately does not perform OCR itself — you use the recognition already built into your operating system or device, then correct it — because an unreviewed transcript turns recognition errors into fake changes. Screenshot previews and transcripts stay in the tab, and the exportable report contains counts only, never the text itself.",
  useCases: [
    "You are checking that a copy revision actually shipped and need to show which lines of on-screen text differ between the old build and the new one",
    "A vendor sends screenshots of a policy or pricing screen a month apart and you need a defensible, countable answer to whether the wording changed",
    "You are reviewing localisation or accessibility text in a UI where the strings are baked into images, so a source diff is impossible and the screen text is all you have",
  ],
  benefits: [
    ["Line and word diffs side by side", "A single re-wrapped paragraph shows as many line changes but few word changes, which tells you whether the wording or just the layout moved."],
    ["Normalisation you control", "Case, blank lines, edge whitespace, repeated spaces and punctuation each have their own switch, so you decide what counts as a real difference before the diff runs."],
    ["A report with no content in it", "The exportable JSON carries counts, options and truncation flags under the altftool.screenshot-ocr-change-counts.v1 schema — no transcript text, no filenames, no image data."],
  ],
  faqs: [
    [
      "Does it run OCR on my screenshots?",
      "No, and that is by design. You paste text produced by your own device's OCR and tick a box confirming you reviewed it, because a raw recognition pass routinely misreads characters and those errors would be reported as content changes. The screenshot previews exist so you can proofread the transcript against the image.",
    ],
    [
      "How much text can it compare?",
      "Up to 100,000 characters per transcript, 800 lines and 2,000 words, with the first 200 individual line changes listed in detail. Anything beyond those bounds is truncated and the result flags it explicitly, so split large captures into focused sections rather than trusting a truncated comparison.",
    ],
    [
      "Does 'no change found' mean the screenshots are identical?",
      "No. It means the reviewed transcripts match under the options you selected. Layout, spacing, colour, icons, cropping, images and any text that OCR missed or that is visually obscured are all outside this comparison — use a pixel-level diff if you need to catch visual changes.",
    ],
    [
      "How is the similarity percentage calculated?",
      "Unchanged items divided by the larger of the two counts, at one decimal place — so if the before transcript has 40 lines, the after has 44, and 38 lines match, similarity is 38/44, or 86.4%. Line and word similarity are reported separately because they can diverge sharply on reflowed text.",
    ],
  ],
};

export default seo;
