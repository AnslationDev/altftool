const seo = {
  title: "WhatsApp Status Size Generator: 1080 x 1920",
  metaDescription:
    "Export status images at 1080x1920 (9:16) with a safe-zone preview for WhatsApp's overlays, and plan the 60-second clip split for longer videos.",
  steps: [
    "Pick a shape under 1. Choose the status shape — Status — full screen is the 1080 x 1920 no-bars format — and add a photo with the Image file (PNG, JPEG, WebP) input, or type Source width/height to plan without one.",
    "Set Fit mode (Fill — crop the overflow, Fit — add background bars, or Stretch), Bar background, Export format (JPEG, PNG or WebP) and the Encoder quality slider (40-100%); type a Video length (seconds) to see the 60-second clip split.",
    "Press Export to download the canvas render named like status-1080x1920.jpg, check it against the 16 MB media ceiling, or Copy spec for the full size breakdown.",
  ],
  intro:
    "This tool exports WhatsApp Status images at 1080 x 1920, the 9:16 shape that fills the status viewport with no background bars, and shows exactly how much of the screen any other ratio leaves empty. It also marks the areas WhatsApp's own overlays cover — the contact name and progress bar at the top, the reply field at the bottom — and works out how many 60-second clips a longer video needs to fit the status limit. Resizing and encoding both run on canvas in your browser.",
  useCases: [
    "Convert a landscape product photo into a full-bleed 1080 x 1920 status instead of letting it float between two black bars.",
    "See that a square 1080 x 1080 graphic only covers 56% of the status screen before you decide whether that is acceptable.",
    "Work out that a 150 second clip has to go out as three status posts, the last one running 30 seconds.",
    "Position a headline so the reply field at the bottom of the screen does not sit on top of it.",
  ],
  benefits: [
    ["Screen coverage as a number", "Shows the exact percentage of the 9:16 viewport your shape fills, and the bar heights in pixels."],
    ["Overlay-aware layout", "Marks the top and bottom strips WhatsApp covers with its own interface so text stays readable."],
    ["Clip splitting built in", "Divides a longer video by the 60 second status limit and gives the length of the final clip."],
  ],
  faqs: [
    [
      "What size should a WhatsApp Status image be?",
      "1080 x 1920 pixels, a 9:16 ratio. That matches the status viewport exactly, so the image fills the screen with no bars. A square 1080 x 1080 image covers only about 56% of that screen and a 16:9 landscape image about 32%.",
    ],
    [
      "How long can a WhatsApp Status video be?",
      "60 seconds per status post. Longer footage has to be split into consecutive posts — a 150 second clip becomes three statuses, the last one running 30 seconds.",
    ],
    [
      "Why does WhatsApp crop or add bars to my status?",
      "Status fits the whole image inside a 9:16 screen rather than filling it, so any shape that is not 9:16 gains background bars on the short sides. Exporting at 1080 x 1920 with a fill crop is the only way to avoid them entirely.",
    ],
    [
      "What is the file size limit for WhatsApp media?",
      "16 MB for photos and videos sent through WhatsApp. WhatsApp also re-compresses uploads, so exporting a clean JPEG at 85-90% quality gives a better result than sending a very large file the app will squeeze anyway.",
    ],
  ],
};

export default seo;
