const seo = {
  title: "LinkedIn Banner Maker: 1584x396 Safe Zone Guide",
  metaDescription:
    "Lays out a 1584x396 profile or 1128x191 company banner, measures the largest text rectangle clear of the avatar circle, exports an SVG guide.",
  steps: [
    "Pick a \"Surface\": \"Personal profile background - 1584 × 396\" or \"Company page cover - 1128 × 191\", which fills the \"Canvas width (px)\" and \"Canvas height (px)\" fields.",
    "Tune \"Avatar diameter (× banner height)\", \"Avatar centre (× banner width)\" and \"Edge safety trim (× each side)\", and enter your \"Headline size in the artwork (px)\".",
    "Read the \"Safe text zone\" size and its x, y position, check \"Headline size on screen\", then press \"Copy guide\" to paste the SVG guide layer into Figma, Illustrator or Canva.",
  ],
  intro:
    "LinkedIn Banner Maker lays out a profile background at LinkedIn's recommended 1584 × 396 pixels, or a company page cover at 1128 × 191, and measures the largest rectangle of artwork that clears the circular profile photo overlapping the lower left. It reports the safe zone in exact pixel coordinates, checks the headline size against the width the banner actually renders at, and exports an SVG guide layer to paste into Figma, Illustrator or Canva. Sizes come from LinkedIn's own guidance; the avatar overlap is an adjustable approximation of the current layout.",
  useCases: [
    "Position a value-proposition line so the profile photo never covers it.",
    "Convert an existing 1200 × 300 banner to the correct 4:1 ratio without cropping the logo.",
    "Check that 24 px type in the artwork is still readable once LinkedIn scales the banner down.",
    "Export a guide layer so a designer knows exactly where the avatar sits before they start.",
  ],
  benefits: [
    ["Measured, not guessed", "The safe rectangle is computed from the avatar circle and the edge trim, and given in pixel coordinates."],
    ["Two layout options", "Compares the area available to the right of the avatar against the strip above it, and recommends the larger."],
    ["Guide you can import", "Outputs an SVG overlay at full canvas size, so your design tool shows the exclusion zone in place."],
  ],
  faqs: [
    [
      "What size should a LinkedIn banner be?",
      "1584 × 396 pixels for a personal profile background — a 4:1 ratio — and 1128 × 191 pixels for a company page cover. Keep the file under 8 MB and upload JPG or PNG; only the first frame of a GIF is used.",
    ],
    [
      "Where does the profile photo cover the LinkedIn banner?",
      "On desktop the circular profile photo overlaps the lower-left corner of the background image, so anything placed there disappears. Keep logos and text to the right of the circle, or in the strip above it, and leave a margin because LinkedIn crops a few pixels from each edge.",
    ],
    [
      "Why does my LinkedIn banner look blurry?",
      "Almost always because the source was smaller than 1584 pixels wide and got upscaled, or because heavy JPEG compression was applied to fine text. Export at exactly 1584 × 396 and use PNG for flat graphics with type.",
    ],
    [
      "How big should the text be on a LinkedIn banner?",
      "Work backwards from the display size. A 1584 px banner is often rendered around 1128 px wide on a desktop and far smaller on mobile, so 64 px type in the file shows at roughly 46 px on desktop. Anything under about 12 px on screen becomes unreadable.",
    ],
  ],
};

export default seo;
