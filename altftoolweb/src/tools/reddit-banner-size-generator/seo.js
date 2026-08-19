const seo = {
  title: "Reddit Banner Size Checker: Safe Area on Mobile",
  steps: [
    "Upload under 'Banner artwork (stays in your browser)' — a JPG, PNG, WEBP, GIF or SVG — or just type the Artwork width (px) and Artwork height (px).",
    "Choose a Banner height preset (1920 x 384, 256, 192 or 128 px) or set Banner height (px) yourself.",
    "Read the safe centre width, the 'Keep clear each side' margin and the 'Old Reddit header fit' row, then press Export banner to save reddit-banner-1920x384.png.",
  ],
  intro:
    "Reddit Banner Size Generator measures how much of a subreddit banner actually survives on each screen size, because the banner is painted as a full-width cover fill: a 1920 x 384 px banner keeps roughly its centre 1,024 px once a phone-width header is taken into account. It also fits the same artwork into the old Reddit header slot, which is capped at 500 x 100 px and 500 KB, and checks a 256 x 256 px community icon against the much smaller sizes Reddit renders it at. Useful for moderators building a consistent look across the new and old interfaces.",
  useCases: [
    "Place a subreddit name in the centre strip of a banner so it is still readable when a member opens the community on a phone.",
    "Convert a wide 2400 x 600 px illustration into a banner without discovering afterwards that both ends are cropped away.",
    "Produce the old Reddit header logo from the same artwork, scaled to fit inside 500 x 100 px.",
    "Check whether a detailed community icon still reads at the 20 px size used in sidebars and post bylines.",
  ],
  benefits: [
    ["Safe strip you can measure", "The centre region is the intersection of the crops on wide desktop, laptop and phone headers, not a rule of thumb."],
    ["Old and new Reddit together", "The same source produces a full-width banner and a header logo that respects the 500 x 100 px limit."],
    ["Icon reality check", "Shows the thinnest stroke in a 256 px icon file that still lands on a device pixel at each rendered size."],
  ],
  faqs: [
    [
      "What size should a subreddit banner be?",
      "Author the banner 1920 px wide and match the height to the header height you selected in Mod Tools — commonly 128, 192, 256 or 384 px. Because Reddit fills the header width, the important content should sit in the middle rather than near the edges.",
    ],
    [
      "Why is my subreddit banner cut off on mobile?",
      "The banner is a cover fill, so a narrow header shows a narrower slice of the same image. On a 1920 x 384 px banner a phone-width header keeps only about 1,024 px, roughly 53% of the width, all of it taken from the centre.",
    ],
    [
      "What size is the Reddit community icon?",
      "Upload the community icon at 256 x 256 px. It is displayed far smaller — around 72 px in the community header, 40 px in a byline and about 20 px in list views — so a stroke thinner than about 6 px in the 256 px file disappears at the smallest size.",
    ],
    [
      "Does old Reddit use the same banner?",
      "No. Old Reddit uses a separate header logo limited to 500 x 100 px and 500 KB, positioned at the top-left rather than spanning the page. If your community still gets old Reddit traffic, export a simplified wordmark for that slot instead of shrinking the full banner.",
    ],
  ],
};

export default seo;
