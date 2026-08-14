const seo = {
  title: "YouTube Thumbnail Layout Planner — 1280x720 Safe Zones",
  metaDescription:
    "Drag face, text and logo blocks on a 1280x720 frame; check the 5% margin, duration-badge corner and 168 px legibility, then copy a pixel brief.",
  steps: [
    "Enter the Video title and Thumbnail headline (6 words max), then arrange the starter blocks — Presenter cut-out, Headline and Channel logo — on the 16:9 canvas, or press \"Add element\" for more.",
    "Drag a block or focus it and use the arrow keys, or type exact X %, Y %, Width % and Height % values; blocks turn red when they break the 5% safe margin or sit under the shaded duration-badge corner.",
    "Read the Layout score out of 100 with every flagged issue listed, then press \"Copy brief\" to copy a markdown brief with per-element pixel positions.",
  ],
  intro:
    "A thumbnail layout planner blocks out where the face, headline, product and logo sit on the 1280×720 frame YouTube asks for, then checks that arrangement against the rules that break thumbnails in the wild: the 5% edge margin, the duration badge in the bottom-right corner, and whether the text is still readable when the image is scaled to the 168 px strip on a phone. It is for creators and thumbnail designers who want the composition settled before opening Photoshop or Figma.",
  useCases: [
    "Check that your channel logo is not sitting under the duration badge before you export the PSD",
    "Test whether a three-word headline is tall enough to read in the mobile suggested-videos strip",
    "Hand a designer a positioned brief with pixel coordinates instead of a vague description",
  ],
  benefits: [
    ["Real YouTube geometry", "1280×720 at 16:9 with the 2 MB upload ceiling, not an approximate box."],
    ["Legibility maths, not vibes", "Every element is re-measured at 168 px and 246 px, the two sizes viewers actually see."],
    ["Exportable brief", "Copy a markdown brief with per-element pixel positions and every flagged issue."],
  ],
  faqs: [
    [
      "What size should a YouTube thumbnail be?",
      "1280×720 pixels, 16:9 aspect ratio, under 2 MB, as JPG, PNG, GIF or WEBP. YouTube states 1280 wide as the recommended minimum because that is the size used for the video player preview; anything smaller gets upscaled and looks soft.",
    ],
    [
      "How big does thumbnail text need to be?",
      "At least about 10.6% of the frame height — roughly 76 px tall on the 1280×720 master. That is the point at which text still clears 10 px on screen once the thumbnail is scaled down to the ~168 px-wide mobile suggested-videos strip, which is the smallest size it is commonly displayed at.",
    ],
    [
      "Which part of a thumbnail should I keep empty?",
      "The bottom-right corner, roughly the last 14% of the width and 12% of the height. YouTube stamps the video duration there in almost every surface, so a logo or word placed in that corner is covered. A 5% margin on all four edges is also worth keeping clear, because different surfaces crop and round the corners differently.",
    ],
    [
      "How many words should be on a thumbnail?",
      "Six or fewer, and three to four is better. Word count is the main driver of how small each letter has to be: at 168 px wide, a six-word headline gives each word about 28 px of horizontal space, which is already near the limit of what a viewer can read while scrolling.",
    ],
  ],
};

export default seo;
