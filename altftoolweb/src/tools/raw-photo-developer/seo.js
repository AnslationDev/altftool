const seo = {
  title: "Convert RAW to JPEG in Browser: DNG, NEF, CR2",
  metaDescription:
    "Open a DNG, NEF, CR2 or ARW file, pick -1 stop, neutral or +1 stop, and export a JPEG at -q:v 2 quality — FFmpeg WebAssembly, in your browser.",
  steps: [
    "Choose a Source file — the picker accepts .dng, .nef, .cr2 and .arw alongside ordinary image types.",
    "Set Exposure to -1 stop, neutral or +1 stop and press Process locally; the button counts up as \"Processing 45%\" while FFmpeg WebAssembly runs.",
    "The frame downloads as altftool-raw-photo-developer.jpg written at -q:v 2, and the Local processing report lists File, Size, Type and Profile with the FFmpeg decoder log underneath.",
  ],
  intro:
    "RAW Photo Developer opens a camera RAW file (DNG, NEF, CR2, ARW) or any ordinary image in your browser, applies a one-click exposure adjustment, and exports a high-quality JPEG using FFmpeg compiled to WebAssembly. You pick -1 stop, neutral, or +1 stop, and the tool runs an FFmpeg `eq` filter at brightness ±0.12 with a gentle contrast lift of 1.04 and saturation of 1.03, writing the result at JPEG quality -q:v 2. It is a fast exposure preview and format conversion step, not a colour-managed RAW pipeline, so treat it as a quick look rather than a replacement for a full raw converter.",
  useCases: [
    "You shot a set of NEF files at an event, they came out about a stop dark, and you want quick brightened JPEGs to send the organiser tonight before you sit down to edit properly.",
    "A client sent you a CR2 or ARW file and you just need to see it and hand back a normal JPEG, without installing a raw converter on a machine you do not control.",
    "You are triaging a card full of DNG frames and want a fast pass at -1, neutral, and +1 stop on a few shots to judge which exposures are actually recoverable.",
  ],
  benefits: [
    [
      "Reads real camera RAW extensions",
      "The file picker accepts .dng, .nef, .cr2 and .arw alongside standard images, so you are not forced to convert first.",
    ],
    [
      "One decision, not thirty sliders",
      "Exposure collapses to three choices — -1 stop, neutral, +1 stop — mapped to a fixed brightness ±0.12 with a mild contrast and saturation lift.",
    ],
    [
      "Shows you the FFmpeg log",
      "Progress and the raw decoder output are visible while it runs, so when a camera format will not decode you can see exactly why.",
    ],
  ],
  faqs: [
    [
      "Which RAW formats does it accept?",
      "The upload field accepts .dng, .nef, .cr2 and .arw, plus any regular image type. Whether a given file actually decodes depends on the browser FFmpeg build and the specific camera model, since some proprietary raw variants are not supported by the bundled decoder.",
    ],
    [
      "What exactly does the exposure setting change?",
      "It sets the brightness term of an FFmpeg `eq` filter to +0.12 for +1 stop, -0.12 for -1 stop, or 0 for neutral, and in every case applies contrast=1.04 and saturation=1.03. That is a fixed adjustment rather than a true stop-accurate exposure calculation, so the labels are approximations.",
    ],
    [
      "What quality is the exported JPEG?",
      "Exports are written with FFmpeg's -q:v 2, the second-highest quality step on its 2-31 JPEG scale, so files are large but visually close to the decoded source. There is no option to trade quality for size here.",
    ],
    [
      "Is this a substitute for Lightroom or Capture One?",
      "No. There is no colour management, no camera profile, no white-balance-by-temperature and no highlight recovery — it is a single fixed brightness/contrast/saturation pass plus a JPEG write. Use it to preview or hand off a file quickly, and use a real raw converter when the edit matters.",
    ],
  ],
};

export default seo;
