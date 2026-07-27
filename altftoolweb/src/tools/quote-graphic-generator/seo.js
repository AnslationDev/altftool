const seo = {
  intro:
    "This quote graphic generator sets a line of text as a finished social image at the exact pixel size each placement expects — 1080x1080 and 1080x1350 for Instagram feed, 1080x1920 for stories and Reels, 1600x900 for X, 1200x627 for LinkedIn and 1000x1500 for Pinterest. The type is auto-fitted: it wraps the quote and steps the font size down until the block fits the canvas, so long quotes never overflow. Every colour combination is checked against the WCAG 2.1 contrast formula, and story layouts keep the top 250px and bottom 420px clear of the app's own interface.",
  useCases: [
    "Pull a line from a podcast episode or a blog post and publish it as a square feed post and a 9:16 story from the same text.",
    "Produce a run of customer quote cards in one brand palette so a whole campaign looks like it came from one place.",
    "Check whether a light-on-light brand palette actually clears 4.5:1 contrast before a set of quote cards goes live.",
    "Make a Pinterest pin at 1000x1500 from a quote that was originally written for a 16:9 slide.",
  ],
  benefits: [
    ["Real placement sizes", "Seven presets at the published pixel dimensions, so nothing gets recompressed or cropped on upload."],
    ["Type that always fits", "Greedy word wrap plus a font-size search means a 40-word quote and a 6-word quote both sit correctly."],
    ["Contrast checked", "WCAG 2.1 ratio shown for text and accent, with a plain pass or fail against the 4.5:1 and 3:1 thresholds."],
  ],
  faqs: [
    [
      "What size should a quote graphic be for Instagram?",
      "Use 1080x1080 for a square feed post or 1080x1350 for a portrait one — 4:5 is the tallest crop the feed allows and it takes up the most screen. For stories and Reels use 1080x1920.",
    ],
    [
      "How much of an Instagram story is covered by the interface?",
      "Roughly the top 250 pixels and the bottom 420 pixels of a 1080x1920 canvas sit under the profile row, the caption field and the reply bar. Keeping text inside the middle band is why this tool moves the layout in on story sizes.",
    ],
    [
      "What contrast ratio does text on a graphic need?",
      "WCAG 2.1 asks for 4.5:1 for normal text and 3:1 for large text, which means 24px and above, or 18.66px and above when bold. Quote type on a social graphic is almost always large text, but 4.5:1 is the safer target because the image will be viewed at thumbnail size in a feed.",
    ],
    [
      "Are my quotes uploaded anywhere?",
      "No. The graphic is drawn on an HTML canvas in your own browser and the PNG is produced locally when you press download, so the text and colours never leave the device.",
    ],
  ],
};

export default seo;
