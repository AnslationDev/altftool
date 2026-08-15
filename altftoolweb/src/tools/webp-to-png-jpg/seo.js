const seo = {
  title: "WebP to PNG, JPG or PDF Converter — Batch + ZIP",
  steps: [
    "Drag and drop .webp files onto the upload area or click Select WebP Files — multiple files are accepted for batch conversion.",
    "Pick PNG, JPG or PDF under Output Format; a Quality slider (10-100, default 90) appears for JPG and PDF.",
    "Press Convert, then Download each image or use Download All as ZIP to get one webp-converted archive.",
  ],
  intro:
    "WebP to PNG / JPG Converter decodes .webp files with your browser's own image decoder, redraws them on a canvas at their native pixel dimensions, and re-encodes them as lossless PNG, JPEG at a quality you set, or a single-page PDF sized to the image. Drop in a batch and it converts them all, then packages the results as a ZIP. It is for anyone stuck with WebP downloads that an older app, a print shop, a CMS or a client's template refuses to open.",
  useCases: [
    "You saved product images from a supplier's site and they all came down as WebP, but the marketplace listing form only accepts JPG",
    "A design file needs to keep its transparent background, so you convert the WebP assets to PNG rather than flattening them into JPEGs",
    "You need to email a screenshot to someone whose email client shows WebP as a broken attachment, and a one-page PDF is the safest thing to send",
  ],
  benefits: [
    [
      "Original resolution, not a resized copy",
      "The canvas is created at the image's naturalWidth and naturalHeight, so a 3000-pixel WebP comes out as a 3000-pixel PNG or JPG with no downsampling.",
    ],
    [
      "Batch out as one ZIP",
      "Convert a whole folder of WebP files in one pass and download them together rather than clicking through a save dialog per file.",
    ],
    [
      "PDF pages match the image, not a paper size",
      "The PDF is built with the page dimensions set to the image's pixel size and orientation chosen from its aspect ratio, so nothing is letterboxed onto A4 or letter.",
    ],
  ],
  faqs: [
    [
      "Should I convert WebP to PNG or to JPG?",
      "PNG if the image has transparency or is a screenshot, logo, or line art, because PNG is lossless and keeps the alpha channel. JPG if it is a photograph and file size matters — JPEG has no alpha channel at all, so any transparent areas get flattened during conversion.",
    ],
    [
      "Does converting lose quality?",
      "Converting to PNG does not add any loss, because PNG is lossless — though it cannot recover detail the original WebP already discarded. Converting to JPG re-encodes with lossy compression at the quality you choose (90 by default), which is visually near-transparent for photos but should not be repeated over and over on the same image.",
    ],
    [
      "Can I convert several files at once?",
      "Yes — add as many .webp files as you like, convert them in one run, and when more than one PNG or JPG is ready they are bundled into a single ZIP for download. PDF output is produced one file per image rather than zipped.",
    ],
    [
      "What is the size limit for the PDF option?",
      "The PDF page is capped at 14,400 pixels on each side; anything larger is scaled down proportionally to fit before the image is embedded. The image is embedded as JPEG at the quality slider's setting, so lower the quality if the resulting PDF is bigger than you need.",
    ],
  ],
};

export default seo;
