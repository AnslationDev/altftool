const seo = {
  title: "YouTube Thumbnail Size: Crop to 1280x720",
  metaDescription:
    "Crop any JPG, PNG or WebP to YouTube's 1280x720 16:9 frame in your browser. Measures the encoded file against the 640 px and 2 MB limits.",
  steps: [
    "Choose a JPG, PNG or WebP up to 25 MB under Source image, then pick '1280 x 720 — YouTube recommended' as the Export size.",
    "Set 'How to fit the frame' to 'Fill the frame (centre crop)' or 'Fit the whole image (pad the edges)', and drag Quality for JPEG or WebP.",
    "Check the pass/warn/fail list for minimum width 640 px, 16:9 and the 2 MB limit, then press Download for youtube-thumbnail-1280x720.jpg.",
  ],
  intro:
    "YouTube Thumbnail Size Generator resizes any image to YouTube's thumbnail specification — 1280 x 720 pixels, 16:9, at least 640 pixels wide and under the 2 MB upload limit — and reports whether the result passes each of those rules. It centre-crops or letterboxes the source, shows how much of the original is lost at 16:9, measures the encoded JPEG, PNG or WebP size before you upload, and marks the bottom-right corner where the duration badge sits. All processing happens in the browser, so the image is never uploaded anywhere.",
  useCases: [
    "Turn a 4:5 phone photo into a 16:9 thumbnail and see which parts of the frame get cropped away.",
    "Bring an oversized PNG under the 2 MB limit by exporting as JPEG and lowering the quality until it fits.",
    "Check that a design taken from a Figma export is at least 640 pixels wide before uploading.",
    "Keep text and faces clear of the duration badge in the bottom-right corner.",
  ],
  benefits: [
    ["Real spec checks", "Minimum width, 16:9 ratio, recommended resolution and the 2 MB limit are each checked and labelled pass, warn or fail."],
    ["Measured, not guessed", "File size comes from encoding the actual canvas at your chosen quality, not from an estimate."],
    ["Private by design", "The image is decoded and re-encoded locally; nothing is sent to a server."],
  ],
  faqs: [
    [
      "What size should a YouTube thumbnail be?",
      "1280 x 720 pixels at a 16:9 aspect ratio. YouTube requires a minimum width of 640 pixels and rejects thumbnail files larger than 2 MB, and accepts JPG, GIF, PNG and WebP.",
    ],
    [
      "Why does YouTube say my thumbnail is too large?",
      "The 2 MB cap applies to the file, not the pixel dimensions, so a 1920 x 1080 PNG often fails while the same image as an 85% quality JPEG passes comfortably. Export as JPEG or WebP and drop the quality slider until the measured size sits under 2 MB.",
    ],
    [
      "Will my thumbnail be cropped?",
      "Only if it is not 16:9. YouTube fits non-16:9 thumbnails into a 16:9 frame, which produces black bars or a crop depending on where it appears. Exporting at 1280 x 720 avoids the problem entirely, and this tool shows the exact percentage of the original that a centre crop removes.",
    ],
    [
      "Does a higher resolution thumbnail look better?",
      "Marginally, on large screens. 1920 x 1080 gives YouTube more detail to downscale from, but the thumbnail is most often seen at around 246 pixels wide in search and sidebar listings, so legibility of the largest text matters far more than resolution.",
    ],
  ],
};

export default seo;
