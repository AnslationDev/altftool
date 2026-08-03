const seo = {
  intro:
    "The Zalgo Text Generator corrupts any text by stacking Unicode combining diacritical marks onto each character — up to 20 above, 10 through and 20 below, drawn at random from pools of 56, 5 and 47 marks. Three sliders control each direction independently, so you can go from a light shimmer to text that bleeds several lines into its neighbours. Spaces, tabs and line breaks are left untouched, so your layout survives even at maximum corruption.",
  useCases: [
    "Make a Halloween or horror-game post title look genuinely glitched without opening a graphics editor.",
    "Test how your own app, chat widget or CSS handles overflowing combining marks before a user pastes some in.",
    "Dial up just the downward stack for a 'sinking' username effect that stays readable on the line above.",
  ],
  benefits: [
    [
      "Three independent stacks, not one intensity dial",
      "Above, through and below are separate sliders, so you can build asymmetric looks like ascending-only glitch that most generators cannot produce.",
    ],
    [
      "Layout survives the corruption",
      "Marks are only appended to visible characters — spaces, tabs, newlines and carriage returns are skipped, so word breaks and line structure stay intact.",
    ],
    [
      "Five presets and instant regeneration",
      "Clean, Medium Chaos, Maximum Corruption, Ascending Glitch and Descending Glitch are one click away, and every slider change redraws the output with a fresh random draw.",
    ],
  ],
  faqs: [
    [
      "What is Zalgo text?",
      "Zalgo text is ordinary text with Unicode combining diacritical marks piled onto each character so the glyphs spill above and below the line. The base letters are unchanged — a screen reader or a strip-diacritics filter still sees your original words underneath.",
    ],
    [
      "How much corruption can I add per character?",
      "Up to 50 marks on a single character: 20 from the upward pool, 10 from the middle pool and 20 from the downward pool. The Maximum Corruption preset sets exactly that.",
    ],
    [
      "Why does Zalgo text look different on different apps?",
      "Because rendering combining marks is up to the font and text engine. Some platforms stack every mark faithfully, others clip the overflow to the line box or cap the number they draw, so the same string can look wild in one app and tame in another.",
    ],
    [
      "Can I use Zalgo text in usernames and social posts?",
      "Often, but not always — many platforms strip or reject combining marks in display names and some flag heavy stacking as disruptive. Try a low preset such as 2 up / 1 mid / 2 down first, since light corruption survives filters far more reliably than the maximum setting.",
    ],
  ],
};

export default seo;
