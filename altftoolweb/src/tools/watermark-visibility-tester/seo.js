const seo = {
  title: "Does Your Watermark Survive Resizing and JPEG?",
  metaDescription:
    "Mark the watermark, then measure luminance spread and edge signal retained after JPEG re-encode, downscale, grayscale and centre crop.",
  steps: [
    "Press Choose local image and open a JPEG, PNG or WebP up to 20 MB — nothing is uploaded.",
    "Drag across the visible mark under \"Mark the watermark\", or type Left, Top, Width and Height percentages into the keyboard-adjustable region fields, then press Create stress previews.",
    "Compare each variant's Spread retained and Edges retained percentages, grade it Readable, Marginal or Lost under Your visual review, then press Download privacy-safe summary.",
  ],
  intro:
    "Watermark Visibility Tester measures whether your watermark survives the transformations people apply when they repost an image: it re-encodes the picture as JPEG, downscales it, converts it to grayscale and centre-crops it, then compares the luminance spread and edge signal inside the region you marked against the untouched original. Luminance is computed with the Rec. 709 weights (0.2126 R, 0.7152 G, 0.0722 B), and each variant reports what percentage of the original contrast and edge energy is left. It is for photographers, designers and brand teams deciding how strong or where to place a mark before publishing.",
  useCases: [
    "You are about to post a portfolio set and want to know whether your corner signature still reads after someone saves it at 40% size for a phone feed",
    "A client wants the watermark as faint as possible, so you test opacity variants and keep the lowest one whose edge signal still holds up after JPEG re-encoding",
    "Your mark relies on a colour contrast against the background, and the grayscale pass shows whether it disappears once the image is converted to black and white",
  ],
  benefits: [
    [
      "Numbers, not just a side-by-side",
      "Every variant reports spread retained and edge retained as a percentage of the baseline region, so faint differences you would miss by eye show up as a figure.",
    ],
    [
      "Crop is scored on area, not guesswork",
      "A centre crop is intersected with your marked region and the tool reports how much of that region survived, so a mark that gets partly cut away is visible as a retained-area percentage.",
    ],
    [
      "The exported summary carries no image data",
      "The JSON report records variant IDs, retention percentages and your readable/marginal/lost calls — not the picture, the filename, or the region coordinates.",
    ],
  ],
  faqs: [
    [
      "What transformations does it test the watermark against?",
      "Four: JPEG re-encoding (default quality 45%), downscaling (default to 40% of each processed dimension), grayscale conversion, and a centred crop that keeps 80% of each dimension by default. All four are adjustable, and each produces a variant scored against the untouched baseline region.",
    ],
    [
      "What do the spread and edge retained percentages mean?",
      "Spread retained is the standard deviation of luminance inside your marked region as a percentage of the original, and edge retained is the mean absolute luminance difference between neighbouring pixels as a percentage of the original. Both drop toward zero as the mark washes out, so a variant reading 20% edge retained has lost roughly four fifths of the local contrast that made the mark legible.",
    ],
    [
      "What image sizes and formats can it handle?",
      "JPEG, PNG and WebP up to 20 MB, with a source limit of 6,000 pixels on the longest edge and 16 megapixels total. Anything larger than 2,400 pixels on an edge or 4 megapixels is downscaled to a working copy first, and the tool flags that it did so.",
    ],
    [
      "Does a high retained percentage mean my watermark is safe?",
      "No — it means the pixel signal survived those specific transformations, not that the mark is unremovable or that it proves ownership. Inpainting tools, heavy blur, and manual editing are not modelled here, and legibility is still your own call: the tool asks you to grade each variant readable, marginal or lost.",
    ],
  ],
};

export default seo;
