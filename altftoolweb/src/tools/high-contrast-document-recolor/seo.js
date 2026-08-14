const seo = {
  title: "High-Contrast Document Recolor for Faint Scans",
  metaDescription:
    "Load a page image, push contrast up to 4x, toggle grayscale or invert, and export a full-resolution PNG without uploading anything.",
  steps: [
    "Choose a scan or photo in the Page image picker, which accepts any image file.",
    "Drag Contrast from 0.5x up to 4x and Brightness from 0.5x to 2x, and switch Grayscale or Invert on.",
    "Press Export PNG to save high-contrast-page.png at the image's original pixel dimensions.",
  ],
  intro:
    "This tool re-renders a scanned or photographed page for easier reading by applying four canvas filters — contrast from 0.5x to 4x, brightness from 0.5x to 2x, a grayscale toggle and a full inversion toggle — with a live preview and a PNG export at the image's original pixel dimensions. Grayscale is on and contrast starts at 1.8x, which is usually enough to lift faint pencil or low-toner text off the paper. It is for readers with low vision or light sensitivity, and for anyone stuck with a badly scanned handout.",
  useCases: [
    "A photocopied worksheet came out grey on grey and you need the text dark enough to actually read before printing it.",
    "You read more comfortably with light text on a dark page, so you invert a scanned chapter before studying it at night.",
    "A phone photo of a whiteboard has uneven lighting, and dropping brightness while pushing contrast makes the writing legible.",
  ],
  benefits: [
    ["Export matches the preview", "The same filter string is applied to a canvas at the image's natural width and height, so the PNG you download is what you saw."],
    ["Full-resolution output", "Nothing is downscaled for export — a 3000-pixel-wide scan comes back 3000 pixels wide."],
    ["Adjust and see instantly", "Contrast and brightness are sliders over a live preview, so you tune to the specific scan rather than a fixed preset."],
  ],
  faqs: [
    [
      "How do I make a faint scanned document readable?",
      "Turn on grayscale to remove colour cast, then raise contrast — starting around 1.8x — and lower brightness slightly if the paper is glaring. Grayscale first matters because a colour tint spreads the tonal range across three channels and makes contrast adjustment less effective.",
    ],
    [
      "What does the invert option do?",
      "It flips every pixel value, so black text on white paper becomes white text on black. Many people with photophobia or light sensitivity read longer on inverted pages, and it also reduces the glare of a full-page white scan on a bright screen.",
    ],
    [
      "Is my document uploaded anywhere?",
      "No. The image is loaded as a local object URL, filtered by the browser's own rendering, and exported through an in-page canvas — no upload and no network request at any stage.",
    ],
    [
      "Will this recover text that is too faint to see?",
      "Only if the detail is still present in the pixels. Contrast stretching amplifies what was captured; if a scan clipped the light tones to pure white, no filter can bring them back. Rescanning at a higher bit depth or with the brightness lowered captures more to work with.",
    ],
  ],
};

export default seo;
