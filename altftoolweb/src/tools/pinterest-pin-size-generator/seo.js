const seo = {
  intro:
    "This calculator sizes a Pinterest pin canvas from six official presets — standard 1000x1500, square 1000x1000, long/infographic 1000x2100, idea pin 1080x1920, board cover and profile photo — applies your export scale and safe-area inset, and checks the result against Pinterest's own feed rule: pins taller than about 1:2.1 height-to-width get cut off in the scroll. Enter your source artwork's pixel dimensions to see the crop percentage and scale for the fit mode you pick, and enter a planned export file size to check it against Pinterest's 20 MB pin upload limit. Everything runs from the numbers you type — no image file is uploaded or stored.",
  useCases: [
    "Enter a 4:3 (1600x1200) source photo's dimensions against the 2:3 standard pin to see the crop percentage and draw scale before you open an editor.",
    "Check whether a tall infographic canvas will be truncated in the home feed, using the same 1:2.1 feed ceiling Pinterest applies.",
    "Compare fill (crop), fit (letterbox bars) and stretch against the same source dimensions to pick the least destructive way to reach a target pin shape.",
    "Check a finished PNG or JPEG export's file size against Pinterest's 20 MB pin upload ceiling before you publish it.",
  ],
  benefits: [
    ["Six real Pinterest presets", "Standard, square, long/infographic, idea pin, board cover and profile photo canvases, each at the exact pixel size Pinterest recommends."],
    ["Feed truncation check", "Warns when a pin is taller than the roughly 1:2.1 point where the feed stops showing the whole image, using the canvas size you actually chose."],
    ["Crop and file-size estimate", "Type your source image's width and height for a crop-percentage and scale estimate, and a planned file size to check against Pinterest's 20 MB cap — no upload required."],
  ],
  faqs: [
    [
      "What is the best Pinterest pin size?",
      "1000 x 1500 pixels, a 2:3 ratio. That is the shape Pinterest recommends and the tallest one guaranteed to display in full across the home feed, search and board views on both mobile and desktop.",
    ],
    [
      "How tall can a Pinterest pin be before it gets cut off?",
      "Roughly 1:2.1 height-to-width — about 1000 x 2100 pixels. Past that the feed shows the top portion and hides the rest behind a tap, so a 1000 x 2600 infographic would only reveal around 81% of itself in the scroll.",
    ],
    [
      "What is the maximum file size for a pin image?",
      "Pinterest accepts still images up to 20 MB. If a PNG export goes over, switch to JPEG at 80-90% quality; a photographic 1000 x 1500 pin usually lands well under 1 MB at that setting with no visible difference.",
    ],
    [
      "What size should an idea pin be?",
      "1080 x 1920 pixels at 9:16, the same full-screen shape as Reels and Stories. Keep headlines and logos away from the top and bottom of the frame because the profile row, caption and action buttons overlay those areas.",
    ],
  ],
};

export default seo;
