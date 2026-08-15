const seo = {
  title: "X (Twitter) Image Size Generator with Safe Areas",
  metaDescription:
    "Pick an X preset — 1600x900 post, 1500x500 header, 1200x630 card — set export scale up to 4x and a safe inset, then copy CSS with exact dimensions.",
  steps: [
    "Choose an \"Image type\" preset: Post image landscape 1600×900, square 1200×1200, portrait 1080×1350, Profile header 1500×500 or Website card 1200×630.",
    "Set \"Export scale\" (above 0, up to 4x) and \"Safe inset (px)\" (0 to 400).",
    "Read Canvas, Aspect ratio and Safe area in the \"Export result\" panel, then click \"Copy CSS\" for the .x-artboard and .x-safe-area rules.",
  ],
  intro:
    "This tool resizes any image to the exact pixel dimensions X (formerly Twitter) renders without re-cropping, and shows how much of the frame is lost before you export. It covers the 1500x500 header, 1600x900 and 1080x1350 post images, the 1200x628 summary_large_image link card and the square 400x400 profile photo, using cover, contain or stretch fitting maths. Everything is computed and encoded in your browser, so the source file never leaves the device.",
  useCases: [
    "Turn a 16:9 screen recording still into a 4:5 portrait post so it fills more of the mobile timeline instead of being letterboxed.",
    "Build a 1200x628 link card image for a blog post and confirm it clears the 300x157 minimum X enforces on summary_large_image.",
    "Check whether a 1080p photo can be enlarged to a 1500x500 header without the softness that shows above roughly 125% upscaling.",
    "Compress a PNG export down under the 5 MB photo upload ceiling by switching to JPEG and dropping the encoder quality.",
  ],
  benefits: [
    ["Crop shown before upload", "See the exact percentage of your image that X will cut away for each aspect ratio."],
    ["Upscale warning", "Flags when the export enlarges your source past the point where extra pixels stop carrying detail."],
    ["Runs offline in the browser", "Canvas does the resizing locally — no upload, no queue, no watermark."],
  ],
  faqs: [
    [
      "What size should a Twitter/X header be?",
      "1500 x 500 pixels, a 3:1 ratio. The circular profile photo overlaps roughly the bottom-left 250 x 250 pixel area on desktop, and the left and right edges get trimmed on narrow screens, so keep logos and text near the centre.",
    ],
    [
      "What is the best image size for an X post?",
      "1600 x 900 (16:9) for landscape, 1200 x 1200 (1:1) for square and 1080 x 1350 (4:5) for portrait. Anything taller than 4:5 is trimmed in the timeline preview, so a 9:16 vertical image loses its top and bottom.",
    ],
    [
      "How big can an image be on X?",
      "The web composer accepts still photos up to 5 MB and animated GIFs up to 15 MB. If a PNG export goes over, re-export as JPEG or WebP at 80-90% quality — that usually cuts the file to a fraction of the size with no visible difference.",
    ],
    [
      "What size is a Twitter card image?",
      "For twitter:card=summary_large_image use 1200 x 628 pixels (about 1.91:1); the card will not render below 300 x 157. For the small twitter:card=summary use a square image of at least 144 x 144, with 1200 x 1200 giving headroom on high-density screens.",
    ],
  ],
};

export default seo;
