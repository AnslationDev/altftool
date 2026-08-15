const seo = {
  title: "Error Level Analysis (ELA) Viewer With Residual Stats",
  metaDescription:
    "Re-encodes your JPEG, PNG or WebP in the browser at 30-95% quality and reports mean, RMS, median, p95 and p99 residuals per region. No verdict given.",
  steps: [
    "Press \"Choose raster image\" and pick a local JPEG, PNG or WebP up to 20 MB; SVG is refused, and sources over 6,000 px per edge or 16 megapixels are rejected before decode.",
    "Set JPEG re-encode quality between 30% and 95%, Heatmap display gain from 1x to 30x, and the Numerical region grid to 2 x 2, 4 x 4 or 8 x 8, then press \"Run local ELA\".",
    "Compare the residual heatmap against the Mean, Median, 95th percentile, Maximum and Non-zero pixels cards, then press \"Download summary JSON\" for image-ela-numerical-summary.json.",
  ],
  intro:
    "The Image ELA Forensics Viewer re-encodes your image as a JPEG at a quality you choose, subtracts it from the original, and renders the per-pixel residual — the mean of the absolute red, green and blue differences — as a gain-adjusted grayscale heatmap with numeric statistics. It reports mean, RMS, median, 95th and 99th percentile, maximum and non-zero pixel share for the whole frame and for each cell of a grid up to 8 x 8. It deliberately produces no authenticity verdict: Error Level Analysis shows where a second compression pass changed pixels, which is not the same as showing where an image was edited.",
  useCases: [
    "You are examining a screenshot that has been forwarded several times and want to see, with actual numbers, whether one region's residuals differ from the rest of the frame rather than trusting a coloured picture.",
    "A journalist wants a repeatable measurement to attach to a note about an image, so they record the JPEG quality, display gain and per-region percentiles used rather than a subjective impression.",
    "Someone has been shown an ELA map elsewhere that supposedly proves manipulation, and wants to check how much the pattern moves when the re-encode quality is changed from 85 to 95.",
  ],
  benefits: [
    [
      "Numbers alongside the heatmap",
      "Every run reports mean, RMS, median, p95, p99, maximum and non-zero percent, so a bright patch can be checked against its actual residual values.",
    ],
    [
      "Region grid for localised comparison",
      "Splits the frame into up to 64 cells (8 x 8 maximum) and summarises each one separately, which is how you compare one area against the rest.",
    ],
    [
      "States its limits instead of a verdict",
      "The tool ships a written list of ELA's failure modes and never outputs authentic or manipulated, because the technique cannot support that claim.",
    ],
  ],
  faqs: [
    [
      "Can ELA prove an image was edited?",
      "No. ELA visualises differences produced by an extra JPEG encoding pass, and benign causes — resizing, ordinary edits, phone processing pipelines, repeated saves, synthetic generation — all change residual patterns too. Uniform residuals appear in edited images and uneven residuals in untouched ones, so both false positives and false negatives are routine; this tool is informational and no substitute for a qualified forensic examiner.",
    ],
    [
      "What JPEG quality and display gain should I use?",
      "Quality is adjustable from 30 to 95 with 85 as the starting point, and display gain from 1x to 30x with 12x as the default. Gain only brightens the residual for viewing and does not change the underlying statistics, so change quality first and watch whether a pattern survives the change.",
    ],
    [
      "What are the file size and resolution limits?",
      "Up to 20 MB, up to a 6,000 pixel edge and 16 megapixels for the source. Larger images are scaled down to a 2,400 pixel maximum edge and about 4 megapixels for processing, and only JPEG, PNG and WebP inputs are accepted.",
    ],
    [
      "Does it work on PNG and WebP images?",
      "It accepts them, but the result is less interpretable. ELA is designed around JPEG sources, so a PNG or WebP input is really measuring a first-ever conversion into JPEG rather than a second compression of an already-compressed file, and needs more caution still.",
    ],
  ],
};

export default seo;
