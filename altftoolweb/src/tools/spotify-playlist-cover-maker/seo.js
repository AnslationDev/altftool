const seo = {
  title: "Spotify Playlist Cover Maker - 640 to 3000 px PNG",
  metaDescription:
    "Design square playlist covers in the browser: auto-fitted titles, WCAG-scored contrast, PNG or JPEG export at 640-3000 px under Spotify's 4 MB cap.",
  steps: [
    "Type the Playlist title (60-character limit) and optional Subtitle, then pick a Palette, Layout, Background texture (Waveform lines, Concentric rings or Flat gradient) and drag the Accent hue slider.",
    "Choose 640, 1000, 1500 or 3000 in Export size (px, square) and check the Title contrast (WCAG 2.1) ratio and 8% safe-margin readout in the panel.",
    "Click Download PNG or Download JPEG - the file saves as your-title-cover-640.png style and is then checked against Spotify's square, 300 px minimum and 4 MB limits.",
  ],
  intro:
    "Spotify Playlist Cover Maker builds a square cover image at Spotify's own artwork specs — 1:1 aspect, 640 px or larger, under the 4 MB upload cap — and renders it entirely in your browser. Type is fitted automatically: the title shrinks and wraps until it fits an 8% margin, and the colour pairing is scored with the WCAG 2.1 contrast formula so the text still reads at sidebar thumbnail size. Useful for playlist curators, small labels and podcasters who need clean cover art without opening a design app.",
  useCases: [
    "Make matching covers for a series of monthly playlists by keeping one palette and changing only the title.",
    "Replace a Spotify auto-generated collage cover with a branded square before sharing the playlist link.",
    "Export a 3000 px master for press or a Canva reuse, plus a 640 px version sized for the upload itself.",
    "Check whether a light title over a pastel gradient still clears the 3:1 contrast ratio large text needs.",
  ],
  benefits: [
    ["Fits the type for you", "The title auto-shrinks and wraps until it clears the margin, so long playlist names never overflow."],
    ["Contrast is measured, not guessed", "Every palette is scored with the WCAG relative-luminance formula against the gradient midpoint."],
    ["Spec-checked export", "The exported file is measured against Spotify's square, minimum-size and file-weight limits before you upload."],
  ],
  faqs: [
    [
      "What size should a Spotify playlist cover be?",
      "Square, at least 300x300 pixels, with 640x640 the size Spotify recommends. Larger square exports such as 1500 or 3000 px are safe too because Spotify downscales them; the uploader caps the file at 4 MB.",
    ],
    [
      "Why does my playlist cover look blurry on mobile?",
      "It is usually an upload below 640 px being upscaled on a high-density screen. Export at 1000 px or more and keep the file as PNG for flat colour and type, which stays sharp where JPEG would band the gradient.",
    ],
    [
      "How long should a playlist title on the cover be?",
      "Keep it under about 28 characters. Beyond that the auto-fit has to drop the type below roughly 9% of the artwork height, which is the point where a title stops being readable in Spotify's small sidebar tiles.",
    ],
    [
      "Can I upload this cover through the Spotify API?",
      "Yes, but the API endpoint for a custom playlist cover accepts a base64-encoded JPEG of at most 256 KB, which is far stricter than the 4 MB app limit. This tool reports the base64 payload size so you can see whether an export clears that ceiling.",
    ],
  ],
};

export default seo;
