const seo = {
  intro:
    "This bionic reading converter emboldens the opening letters of every word to create artificial fixation points, bolding the first ceil(word length × fixation ratio) letters — 50 percent of each word at the standard level 3 — while always leaving at least one letter plain so the contrast survives. It reports exactly what share of the text ends up in bold and outputs both HTML and Markdown. It is for readers who find heavy paragraphs hard to track, and for writers preparing accessible reading copy.",
  useCases: [
    "Convert a long article into fixation-point form before reading it on a phone.",
    "Prepare study notes in Markdown with the first half of each word bolded.",
    "Test how a reading aid looks at different fixation strengths before rolling it out to a class.",
  ],
  benefits: [
    ["Adjustable fixation", "Five strengths from 30 to 70 percent of each word, plus a contrast control for the remainder."],
    ["Counts what it changed", "Shows words, letters, letters bolded and the exact percentage, so the effect is measurable, not vague."],
    ["Safe, escaped output", "Angle brackets and ampersands in your text are escaped, so the HTML you copy is safe to paste anywhere."],
  ],
  faqs: [
    [
      "Does bionic reading actually make you read faster?",
      "The published evidence says no. Hughes and colleagues in 2023 and an earlier 2022 replication both found no speed or comprehension advantage over ordinary text. Readers who prefer it usually report it helps them hold their place on the line, which is a preference rather than a measured effect.",
    ],
    [
      "How many letters get bolded?",
      "The first ceil(length × ratio) letters, where the ratio is 0.3 at level 1 up to 0.7 at level 5, with 0.5 as the standard. A seven-letter word at level 3 gets four bold letters, and words of two letters or more always keep at least one plain letter.",
    ],
    [
      "Can I use the output on my website?",
      "Yes. The HTML output uses plain <b> tags and an optional inline opacity on the tail, with your text HTML-escaped, so it pastes into a CMS or an email template without pulling in a script or a webfont.",
    ],
    [
      "How is the reading time estimated?",
      "Word count divided by 238 words per minute, the mean adult silent reading rate for English non-fiction from Brysbaert's 2019 meta-analysis of 190 studies. Technical material runs slower and light fiction faster, so treat it as a rough guide.",
    ],
  ],
};

export default seo;
