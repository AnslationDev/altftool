const seo = {
  title: "Random Quote Generator: 48 Seeded Quotes",
  metaDescription:
    "48 attributed quotes from 35 public-domain authors across six themes, 8 each. Copy takes the line and the author together; a seed reproduces any pick.",
  steps: [
    "Pick a Theme — Any theme, Motivation, Wisdom, Perseverance, Creativity, Leadership or Learning — or type a number into 'Seed (same seed, same quote)'.",
    "Press 'New quote' to draw from that theme's pool of 8; quotes you have already seen are excluded until 'Unseen left' hits zero and the pool restarts.",
    "Read the quote with its author plus 'Quotes in this theme', Words and 'Characters with credit', then press Copy to take it as \"quote\" — Author.",
  ],
  intro:
    "The Random Quote Generator shows one attributed quotation at a time from a built-in set of 48 lines by 35 authors, grouped into six themes: motivation, wisdom, perseverance, creativity, leadership and learning. Every quote is drawn from public-domain writers such as Marcus Aurelius, Confucius, Marie Curie and Rabindranath Tagore, and the author's name is copied along with the text so you never post an unattributed line. Selection is seed-driven, so entering the same seed number always returns the same quote.",
  useCases: [
    "Pick a short line for a slide title or a presentation closing card and copy it with the attribution already attached.",
    "Fill a daily journal or habit-tracker prompt with a wisdom quote that changes but never repeats within a session.",
    "Find a caption under 150 characters for a social post by checking the character count shown with each quote.",
  ],
  benefits: [
    ["Attribution is never lost", "Copy gives you the quote and the author in one string, in the format \"quote\" — Author."],
    ["Reproducible by seed", "Type the same seed number and you get the same quote back, so a quote can be cited in a doc and found again."],
    ["Length shown up front", "Word count, character count and character count with the credit line, for caption and slide limits."],
  ],
  faqs: [
    [
      "How many quotes are in this generator?",
      "48 quotes from 35 different authors, split 8 per theme across motivation, wisdom, perseverance, creativity, leadership and learning.",
    ],
    [
      "Are the quotes correctly attributed?",
      "Each quote carries the author it is documented under, and the set is limited to widely recorded lines from public-domain writers rather than viral quotes of uncertain origin. If you are publishing formally, check a primary source for the exact wording.",
    ],
    [
      "Can I get the same quote again later?",
      "Yes. Every pick is generated from the seed number shown in the panel, so typing that seed back in and choosing the same theme returns the identical quote.",
    ],
    [
      "Does this generator repeat quotes?",
      "Not until a theme is exhausted. Each theme holds 8 quotes and the tool excludes the ones you have already been shown, then restarts the pool and flags it in the unseen-left figure.",
    ],
  ],
};

export default seo;
