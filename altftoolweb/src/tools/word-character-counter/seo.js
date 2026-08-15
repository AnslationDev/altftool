const seo = {
  title: "Word & Character Counter with Reading & Speaking Time",
  metaDescription:
    "Count words, characters with and without spaces, sentences, paragraphs and lines as you type, plus reading time at 225 wpm and speaking time at 150 wpm.",
  steps: [
    "Type or paste into the Text input box — every figure updates as you type, and a Sample button loads demo text.",
    "Read the ten tiles — Words, Characters, No spaces, Sentences, Paragraphs, Lines, Read time, Speak time, Avg word, Longest — plus the Top terms chips.",
    "Click Copy summary for all figures, or Download report to save altftool-text-report.txt with the source text attached.",
  ],
  intro:
    "This counter measures a block of text ten ways at once — words, characters with and without spaces, sentences, paragraphs, lines, average word length, longest word, and reading and speaking time at 225 and 150 words per minute. Paste a draft and every figure updates as you type, alongside the eight most repeated meaningful terms with their counts. The whole set can be copied as a summary or downloaded as a text report with the source text attached.",
  useCases: [
    "You are filling a field with a hard cap — a 160-character meta description, a 2,200-character Instagram caption, a 300-word bio — and need the character count with and without spaces before you paste",
    "You are timing a talk or a video script and want to know whether the draft runs closer to five minutes or fifteen when read aloud",
    "You are checking a piece for repetition before publishing and want to see which words you leaned on most without reading it through again",
  ],
  benefits: [
    ["Separate read and speak timings", "Reading time uses 225 words per minute and speaking time uses 150, so a script and an article get different, realistic estimates."],
    ["Structure, not just totals", "Sentence, paragraph, line, average word length and longest word are shown together, which is what tells you a paragraph has run long."],
    ["A repeated-terms list that ignores filler", "Top terms skip words under three letters and a stoplist of 22 common words like the, and, with and your, so only real repetition surfaces."],
  ],
  faqs: [
    [
      "How is reading time calculated?",
      "Word count divided by 225 words per minute, rounded up, with a floor of 1 minute. Speaking time uses 150 words per minute on the same rule — 225 wpm is a common silent-reading average for adult prose, and 150 wpm reflects a comfortable presentation pace.",
    ],
    [
      "What exactly counts as a word?",
      "Anything matching a run of letters, digits, apostrophes or hyphens between word boundaries, so \"self-driving\" and \"don't\" each count as one word. Characters, by contrast, count every keystroke including spaces and line breaks, and the no-spaces figure strips all whitespace.",
    ],
    [
      "Why is my sentence count different from what I expected?",
      "Sentences are split on periods, exclamation marks and question marks, so an abbreviation like \"e.g.\" or a decimal such as 3.5 will inflate the count, while a sentence ending in a semicolon or a dash will not be counted separately. Treat the number as a close estimate for pacing rather than a strict grammatical parse.",
    ],
    [
      "Does my text get uploaded anywhere?",
      "No. Counting runs in the page as you type, and the downloaded report is generated from a local blob, so the draft never leaves the browser — which makes it safe for unpublished or confidential copy.",
    ],
  ],
};

export default seo;
