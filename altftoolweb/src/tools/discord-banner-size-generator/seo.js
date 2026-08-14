const seo = {
  title: "Discord Banner Size Guide: 960 x 540 Banner Spec",
  metaDescription:
    "Get a Discord banner spec: a 960 x 540 px canvas at 16:9 with an 80 px edge safe zone, plus a layout brief for headline, brand and design notes.",
  steps: [
    "Choose Server banner, Profile banner or Event cover in the Banner type dropdown.",
    "Fill in Headline/text, Server/brand name and Design notes, for example “Keep logo readable on mobile”.",
    "Read the Discord banner spec panel — 960 × 540 px canvas, 16:9 aspect ratio, 80 px edge padding — then press Copy output.",
  ],
  intro:
    "This tool resizes an image to Discord's exact asset dimensions — 960×540 server banner, 1920×1080 invite splash, 512×512 server icon and avatar, 600×240 profile banner, 800×320 event cover, 128×128 emoji and 320×320 sticker — and tells you before you export whether it will fit, crop, or go soft. It shows the crop percentage or letterbox bars for each fit mode, checks the exported file against Discord's 256 KB emoji and 512 KB sticker ceilings, and marks any enlargement past 125% as visibly soft. For circular assets it also draws the safe square, which is the diameter divided by √2.",
  useCases: [
    "Your server just hit boost Level 2 and you have a wide illustration that needs to become a 960×540 banner without cutting off the logo",
    "An emoji upload keeps getting rejected and you need to see the actual exported byte size against the 256 KB limit before trying again",
    "You are making a server icon from a square artwork and want to know how much of the corners the circular mask will eat",
  ],
  benefits: [
    ["Crop shown before you export", "Fill mode reports the exact percentage of the image that falls outside the frame, so you find out now instead of after uploading."],
    ["Circle-safe square for icons and avatars", "A circular crop keeps only 78.5% of a square canvas, so the tool draws the inscribed square — 70.7% of the diameter — that artwork must sit inside."],
    ["Upscaling flagged, not silently done", "Any enlargement past 125% is called out with the minimum source size you should have started from."],
  ],
  faqs: [
    [
      "What size is a Discord server banner?",
      "960×540 pixels, a 16:9 frame that sits above the channel list, and it is only available once the server reaches boost Level 2. The invite splash is a separate, larger asset at 1920×1080 and unlocks at Level 1.",
    ],
    [
      "What are the file size limits for emoji and stickers?",
      "A custom emoji must be 256 KB or smaller and a sticker 512 KB or smaller. Emoji are uploaded at 128×128 but render around 32 px in chat, so fine detail disappears; stickers are uploaded at 320×320 and display far larger.",
    ],
    [
      "How much of a square image survives the circular icon crop?",
      "About 78.5% of its area — the inscribed circle is π/4 of the square — and everything in the four corners is clipped. To guarantee nothing important is lost, keep the artwork inside a centred square of side diameter ÷ √2, which is roughly 362 px on a 512 px icon.",
    ],
    [
      "Should I use Fill, Fit or Stretch?",
      "Fill when the subject is central and you can lose the edges; Fit when nothing may be cropped and you accept background bars; Stretch essentially never, because it distorts the image whenever the source and target aspect ratios differ. Whichever you pick, downscaling from a larger source is always cleanest — every exported pixel then comes from real image data.",
    ],
  ],
};

export default seo;
