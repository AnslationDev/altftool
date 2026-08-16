const seo = {
  title: "Twitch Panel Size Generator: 320px & Emote Sizes",
  metaDescription:
    "Export Twitch panels (320px wide, 300px/2.9MB cap), sub badges, emotes, banner and 1920x1080 offline art at exact sizes - resized in your browser.",
  steps: [
    "Under \"1. Choose the asset\", pick the preset - panel, sub badge, emote, profile banner or offline screen - and note the full size set Twitch expects.",
    "Upload your \"Image file (PNG, JPEG, WebP)\", set the \"Fit mode\", background and \"Export format\", and check the crop preview.",
    "Click \"Export\" to download the file named after your image plus its pixel size; the saved size is checked against the asset's ceiling (2.9 MB panels, 25 KB badges, 1 MB emotes).",
  ],
  intro:
    "This generator exports Twitch channel art at the sizes and file limits the platform enforces: 320 pixel wide panels capped at 300 pixels tall and 2.9 MB, 72x72 subscriber badges under 25 KB, 112x112 emotes under 1 MB, a 1200x480 profile banner and 1920x1080 offline video art. Because a panel is always rendered in a fixed 320 pixel column, the tool also works out how tall your artwork becomes at that width and warns when it would be trimmed. All resizing and encoding happens locally in your browser.",
  useCases: [
    "Slice a wide banner design into channel panels and check that each one stays under the 300 pixel display height.",
    "Shrink a detailed logo to a 18x18 subscriber badge to see whether it still reads before committing to the full set.",
    "Export an offline video banner at 1920x1080 from a vertical poster without stretching the artwork.",
    "Get a 112x112 emote PNG under the 1 MB ceiling straight from a high-resolution illustration.",
  ],
  benefits: [
    ["Panel height rule applied", "Works out the real display height of your art in Twitch's fixed 320 pixel column and flags a trim."],
    ["Per-asset file ceilings", "Panels are checked against 2.9 MB, badges against 25 KB and emotes against 1 MB using the exported file."],
    ["Whole sets listed", "Badge and emote presets show all three required sizes so nothing is missing at upload time."],
  ],
  faqs: [
    [
      "What size should a Twitch panel be?",
      "320 pixels wide — Twitch always renders panels in a fixed 320 pixel column — and up to 300 pixels tall. 320 x 100 is the common button-style panel; the file must be 2.9 MB or smaller.",
    ],
    [
      "What size are Twitch sub badges?",
      "Badges are uploaded as a set of three squares: 18 x 18, 36 x 36 and 72 x 72 pixels, each a PNG of 25 KB or less. Design for the 18 pixel version first, because at that size only a bold silhouette survives.",
    ],
    [
      "What size should Twitch emotes be?",
      "28 x 28, 56 x 56 and 112 x 112 pixels as transparent PNGs, each 1 MB or smaller. Chat displays the 28 pixel version most of the time, so avoid thin outlines and small internal detail.",
    ],
    [
      "What size is the Twitch offline banner?",
      "1920 x 1080 pixels, 16:9, up to 10 MB. It sits inside the video player when you are not streaming, so keep schedule text and social handles clear of the very bottom strip where the player controls appear.",
    ],
  ],
};

export default seo;
