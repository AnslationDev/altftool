const seo = {
  title: "LinkedIn Image Size Generator: 10 Exact Presets",
  metaDescription:
    "Resize one image to LinkedIn 1200x1200 posts, the 1584x396 profile banner and 300x300 Page logo, with crop preview and a 1.5x upscale warning.",
  steps: [
    "Pick a file under Artwork (stays in your browser), or type Artwork width (px) and Artwork height (px) to plan sizes without uploading anything.",
    "Choose Fit — Cover, fill and centre-crop or Contain, fit whole image, pad edges — and set Export format to PNG or JPEG.",
    "Press Export all, or Download this size on a single preset, to save files named linkedin-<preset>-<width>x<height>.png.",
  ],
  intro:
    "LinkedIn Image Size Generator takes one piece of artwork and re-frames it for every LinkedIn slot — 1200 x 1200 square feed posts, 1080 x 1350 portrait and document slides, 1200 x 627 link cards, 1920 x 1080 article covers, the 1584 x 396 profile banner and 300 x 300 Company Page logo. It uses standard cover (fill and centre-crop) and contain (fit and pad) geometry, so you can see exactly which part of the frame survives before you export. Each size also gets an upscale check: anything stretched past 1.5x is flagged as too small for a retina feed.",
  useCases: [
    "Turn one 3000 x 2000 px hero render into a square feed post, a portrait carousel slide and a 16:9 article cover without reopening a design app.",
    "Check whether a logo file is large enough for the 1584 x 396 profile banner before it appears blurry on a colleague's laptop.",
    "Prepare a full Company Page refresh — 300 x 300 logo, 1128 x 191 cover and 1128 x 376 Life tab hero — from a single brand image.",
    "Preview how a wide landscape photo gets centre-cropped into a 4:5 portrait post so the subject's face is not cut off.",
  ],
  benefits: [
    ["Every LinkedIn slot in one pass", "Feed, article, personal profile and Company Page sizes are calculated together from one source file."],
    ["Honest quality warning", "Flags any size where the source has to be upscaled more than 1.5x, before it ships looking soft."],
    ["Nothing leaves your browser", "The image is decoded and redrawn on a local canvas — no upload, no server round trip."],
  ],
  faqs: [
    [
      "What size should a LinkedIn post image be?",
      "1200 x 1200 px square is the safest single-image size because it fills the feed column on mobile. If you want maximum vertical space use 1080 x 1350 px (4:5); for a link preview card LinkedIn renders 1.91:1, so supply 1200 x 627 px.",
    ],
    [
      "What are the LinkedIn banner dimensions?",
      "The personal profile background photo is 1584 x 396 px, a 4:1 strip. Your profile photo overlaps the lower-left corner on desktop and shifts on mobile, so keep logos and text in the upper-right two thirds.",
    ],
    [
      "What size is a LinkedIn Company Page cover image?",
      "1128 x 191 px for the Page cover and 300 x 300 px for the logo. The Life tab hero is 1128 x 376 px. The cover is close to 5.9:1, so any centred wordmark should be small and horizontally short.",
    ],
    [
      "Should I export LinkedIn images as PNG or JPEG?",
      "Use PNG for flat colour, logos, screenshots and images with text — it keeps edges crisp with no compression halos. Use JPEG for photographs, where it produces roughly a quarter of the file size at quality 0.9 with no visible difference at feed scale.",
    ],
  ],
};

export default seo;
