const seo = {
  intro:
    "The AI Fake Image Detector runs eight forensic checks on a JPEG, PNG, WebP or TIFF in your browser — noise consistency, JPEG compression artifacts, EXIF metadata, lighting distribution, texture gradients, edge sharpness, colour histograms and skin-tone face regions — and combines them into a single 0–100 AI-likelihood score. Each check is weighted (lighting 18, noise and texture 15 each, compression and edges 12, metadata and colour 10, faces 8) and then scaled by its own confidence, so a check that could not read much contributes less. It is a signal-gathering aid for anyone triaging a suspicious image, not a verdict.",
  useCases: [
    "A photo is circulating in a group chat as breaking news and you want to see whether it carries camera EXIF and normal JPEG block structure before you forward it",
    "You are reviewing stock or submitted images for a publication and need a documented technical report on why one of them looked off",
    "A marketplace listing photo looks too clean, and you want to check whether its noise and texture are suspiciously uniform across the frame",
  ],
  benefits: [
    [
      "Eight independent checks, confidence-weighted",
      "Each detector reports its own confidence, and the overall score is a confidence-scaled weighted mean rather than a flat average.",
    ],
    [
      "Exports the raw measurements",
      "Every check records its own numbers — noise sigma, cross-block coefficient of variation, JPEG block boundary ratio, Sobel gradient CV — and Download JSON and Copy Summary carry them out in full, so you can judge the reasoning yourself.",
    ],
    [
      "Reads real container metadata",
      "It parses JPEG APP1/EXIF segments for camera manufacturer and editing-software strings and PNG tEXt/iTXt chunks, which often carry a generator's own signature.",
    ],
  ],
  faqs: [
    [
      "How accurate is an AI image detector?",
      "No pixel-forensics detector is reliable enough to be treated as proof, this one included. Screenshotting, re-encoding, resizing or social-media re-compression strips the exact signals it measures, and a real photo pushed through heavy editing can score like a synthetic one — use the result as one input alongside source, context and reverse image search.",
    ],
    [
      "What do the score bands mean?",
      "A score of 0–35 is reported as Likely Authentic, 36–55 as Possibly AI Generated, and above 55 as Likely AI Generated. Anything in the middle band genuinely means the checks disagreed, not that the image is half-fake.",
    ],
    [
      "Which image formats does it accept?",
      "JPEG, PNG, WebP and TIFF. Compression analysis only applies to JPEG, since it looks for 8x8 quantisation block boundaries; for the other formats that check is skipped and the remaining seven still run.",
    ],
    [
      "Is my image uploaded to a server?",
      "No. The image is drawn to a canvas and analysed in JavaScript in your tab, and only the first 512 KB of the file is read for metadata parsing. Large images are downsampled to about 400,000 pixels before the statistical checks run, purely to keep the analysis fast.",
    ],
  ],
  steps: [
    "Drop a JPG, PNG, WebP or TIFF onto the Upload an image for analysis panel, or click it to browse — one file at a time. The preview underneath lists the filename, its size and its file type.",
    "Analysis starts on its own as soon as the file loads: a progress bar runs under Analyzing image..., then the ring meter reports the score out of 100, a Confidence: n% line, and one of Likely Authentic, Possibly AI Generated or Likely AI Generated.",
    "Read the Analysis Summary under the Report tab — its written verdict plus the Score, Confidence, Risk Level and Checks tiles — and the File Properties and EXIF Summary read-out under Technical Details, then open Export: Download JSON saves ai-detection-report-<timestamp>.json, Print Report opens a printable report with a row per check, and Copy Summary puts the text version, per-check scores included, on the clipboard. Upload Different Image swaps in another file.",
  ],
};

export default seo;
