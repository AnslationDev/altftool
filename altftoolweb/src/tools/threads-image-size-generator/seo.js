const seo = {
  title: "Threads Image Size: 1080x1350 & 1080x1080",
  metaDescription:
    "Resize posts to the 1080 px width Threads serves — 1080x1350 portrait, 1080x1080 square, 1080x566 landscape — and preview the crop outside 1.91:1 to 4:5.",
  steps: [
    "Pick a shape under '1. Choose the post shape' — Portrait post 1080x1350, Square post 1080x1080 or Landscape post 1080x566.",
    "Add a PNG, JPEG or WebP with the Image file input, then set Fit mode, Carousel slides (1-20) and Encoder quality (40-100%).",
    "Click Export to download the resized image named like photo-1080x1350.jpg, or Copy spec for the crop-and-size report.",
  ],
  intro:
    "This tool exports Threads post images at the 1080 pixel width the feed serves and checks your shape against the supported aspect range, which runs from 1.91:1 landscape down to 4:5 portrait. Anything outside that range is centre-cropped by Threads, so the tool states exactly what percentage of the frame survives and what the cropped result will be. Carousel planning up to the 20-item limit and PNG, JPEG or WebP encoding all happen in the browser.",
  useCases: [
    "Turn a 4:3 camera photo into a 1080x1350 portrait post that fills the maximum feed height without being cropped.",
    "Find out how much of a 9:16 vertical still gets cut when Threads trims it back to 4:5 in the timeline.",
    "Batch a carousel of square 1080x1080 slides so every swipe keeps the same shape and no slide jumps.",
    "Downscale a 24 megapixel export to the 1080 pixel width Threads serves, so you control the compression instead of the server.",
  ],
  benefits: [
    ["Supported range enforced", "Checks your shape against the 1.91:1 to 4:5 window and shows the crop Threads would apply."],
    ["Native width export", "Resizes to 1080 pixels wide so the platform re-encode starts from a clean, correctly sized file."],
    ["Carousel budget", "Counts slides against the 20-item ceiling and totals the pixels you are shipping."],
  ],
  faqs: [
    [
      "What size should a Threads image be?",
      "1080 pixels wide. Use 1080 x 1350 for portrait, 1080 x 1080 for square and 1080 x 566 for landscape. Threads serves feed images at 1080 wide, so uploading larger only means the server downsamples for you.",
    ],
    [
      "What aspect ratios does Threads support?",
      "From 1.91:1 landscape to 4:5 portrait. A shape outside that window is centre-cropped in the feed — a 9:16 vertical still, for example, keeps only about 70% of its height once Threads trims it to 4:5.",
    ],
    [
      "How many images can one Threads post have?",
      "Up to 20 media items in a single post. Keeping every slide the same aspect ratio matters more than the count, because a mixed carousel makes the feed frame resize as the reader swipes.",
    ],
    [
      "Is Threads image size the same as Instagram?",
      "Effectively yes — Threads uses the same 1080 pixel serving width and the same 1.91:1 to 4:5 supported range as the Instagram feed, so one export set covers both. Stories and Reels are a separate 9:16 canvas at 1080 x 1920.",
    ],
  ],
};

export default seo;
