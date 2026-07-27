const seo = {
  intro:
    "This splitter packs long-form copy into carousel slides greedily on sentence boundaries: sentences are added to a slide until the next one would pass your characters-per-slide budget, then a new slide begins. A sentence longer than the budget is broken at a clause and then at a word, so no word is ever cut in half. Slide one is reserved for the hook and the last slide for the call to action, and the result reports how balanced the slide lengths are against the platform's slide limit — 20 items on an Instagram carousel, fewer in practice on a LinkedIn document post.",
  useCases: [
    "Turn a newsletter section or blog intro into a ten-slide carousel without rewriting it by hand.",
    "Check whether a script fits inside Instagram's 20-slide carousel limit before starting the design.",
    "Rebalance a deck where slide three is three lines and slide four is nine.",
    "Set a character budget from your own template so the text never overflows the artboard.",
  ],
  benefits: [
    ["Sentence-safe splitting", "Breaks at sentence ends first, clause breaks second, and never mid-word."],
    ["Balance measured", "Reports the standard deviation of slide lengths so ragged decks are visible before design."],
    ["Hook and CTA reserved", "The first and last slides are treated as their own jobs, not as overflow space."],
  ],
  faqs: [
    [
      "How many slides can an Instagram carousel have?",
      "Up to 20 photos or videos in a single carousel post. Most carousels that perform well use far fewer — between 6 and 12 — because each extra slide is another chance for the reader to stop swiping.",
    ],
    [
      "How much text should go on one carousel slide?",
      "One idea, usually 150 to 250 characters at typical carousel type sizes. The real limit comes from your template: the same text that fits comfortably at 28px will overflow at 40px, so set the character budget from your own layout rather than a generic number.",
    ],
    [
      "What should the first and last slides do?",
      "The first slide is the only one seen in the feed, so it carries the hook and nothing else. The last slide is where the swipe pays off, which means one specific action — save, follow, comment, open the link — not a summary of what was already said.",
    ],
    [
      "Does the splitter rewrite my copy?",
      "No. It only decides where the breaks fall and trims a trailing comma at a clause break. Nothing is reworded, nothing is sent anywhere, and the output is the same every time for the same input.",
    ],
  ],
};

export default seo;
