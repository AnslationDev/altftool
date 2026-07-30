const seo = {
  intro:
    "The Background Remover runs a neural segmentation model inside your browser to separate the subject from its background and return a transparent PNG, with no upload and no account. Beyond the cutout it can drop the subject onto a preset backdrop or a flat colour, add a configurable contact shadow, and process a folder of images in one pass into a downloadable ZIP. It suits anyone preparing product shots, profile photos or design assets who needs a clean alpha channel rather than a rough lasso selection.",
  useCases: [
    "You are listing products and every marketplace wants the same plain white backdrop, so you cut out each item and drop it onto the white preset instead of reshooting.",
    "A headshot for a company directory was taken against a cluttered wall, and you need it on a neutral studio background at the same resolution.",
    "You have thirty images for a catalogue and need every one cut out to transparent PNG, so batch mode processes the whole set and hands back a single ZIP.",
  ],
  benefits: [
    ["A real alpha channel, not a white fill", "The output is a transparent PNG, so the same cutout works on any backdrop you place it over later."],
    ["Composite and shadow in the same step", "Backdrop swap and a directional drop shadow are applied to the cutout live, so you see the finished frame rather than a floating subject."],
    ["Batch to ZIP", "Multiple files are processed one after another with a progress readout and downloaded together as batch-images.zip."],
  ],
  faqs: [
    [
      "Is there a file size limit?",
      "Yes, 10 MB per image in single-image mode. Larger files are rejected with a message rather than silently failing, so downscale a very large camera original before running it.",
    ],
    [
      "Does my photo get uploaded to a server?",
      "No. The segmentation model is downloaded to your browser on first use and every step — the cutout, the backdrop composite, the shadow and the ZIP — runs locally in the tab. Nothing about the image leaves your device.",
    ],
    [
      "What backgrounds can I put behind the subject?",
      "Five presets — white, office, beach, studio and blur — or any flat colour entered as a hex value. The backdrop is drawn first and the cutout composited over it at the cutout's own pixel dimensions, so the resolution of the original is preserved.",
    ],
    [
      "How do I control the shadow?",
      "Four settings: angle, distance, blur radius and opacity. The defaults are a 45 degree angle, 20 pixels of offset, a 15 pixel blur and 40 percent opacity, which reads as a soft shadow down and to the right. Turn it off entirely if you want a flat cutout.",
    ],
  ],
};

export default seo;
