const seo = {
  title: "Stat Card Generator: Big Numbers & % Change",
  metaDescription:
    "Lay out 1 to 4 stats at sizes like 1080x1080 or 1920x1080, format as compact, currency or percent, and show both % and percentage-point change.",
  steps: [
    "Fill in Headline, Source line, and each stat's Value, Caption and Previous value (optional).",
    "Pick a Placement size such as Instagram square 1080x1080 or Deck slide 1920x1080, choose a Palette, and use Add stat for up to four.",
    "Check the number and caption contrast rows, then press PNG to save the card as a .png named for the preset and its pixel size.",
  ],
  intro:
    "A stat card is a graphic built around one big number — a growth figure, a conversion rate, a headline result — with a caption, a change indicator and a source line. This generator lays out one to four stats on a grid at real placement sizes, formats the value with Intl number formatting (plain, compact, currency or percentage) and calculates the change two ways: relative change, (current − previous) ÷ |previous| × 100, and the difference in percentage points. A rate that moves from 4% to 6% is up 50% relative and up 2 percentage points, and the card shows both rather than letting you quote the wrong one.",
  useCases: [
    "Open an Instagram carousel with a single number slide, then follow it with a 2x2 grid of supporting stats in the same palette.",
    "Turn a quarterly result into a 1920x1080 deck slide without opening a design tool.",
    "Publish a conversion-rate improvement without confusing a 2-point rise with a 50% rise.",
    "Format a large figure as 1.2M for a social graphic while keeping the exact number in the caption.",
  ],
  benefits: [
    ["Both change measures", "Relative percent and percentage points side by side, so the claim on the graphic is the one you meant."],
    ["Zero-baseline guard", "A previous value of zero returns 'no baseline' instead of an infinite or nonsense percentage."],
    ["Auto-sized numerals", "The number is measured against the cell width, so a three-digit and a nine-character value both fill the card properly."],
  ],
  faqs: [
    [
      "What is the difference between percent change and percentage points?",
      "Percent change is relative to the starting value: 4% to 6% is a 50% increase because 2 ÷ 4 = 0.5. Percentage points are the plain arithmetic difference: 6 − 4 = 2 points. Use points when the metric is itself a rate, and say which one you mean.",
    ],
    [
      "How do you calculate percentage growth between two numbers?",
      "Subtract the old value from the new one, divide by the absolute value of the old one, and multiply by 100. So 980,000 sessions rising to 1,240,000 is (1,240,000 − 980,000) ÷ 980,000 × 100 = 26.5%.",
    ],
    [
      "What if the previous value was zero?",
      "There is no percentage change from zero — the division is undefined. Report the absolute figure instead, for example 'from 0 to 340 signups'. This tool prints 'no baseline' rather than an infinity symbol.",
    ],
    [
      "How many stats should one graphic carry?",
      "One if it is the point of the post, up to four if it is a summary slide. Past four, each number gets a cell too small to set the figure at a readable size on a phone, which is why the grid stops at a 2x2.",
    ],
  ],
};

export default seo;
