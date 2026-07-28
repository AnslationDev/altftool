const seo = {
  title: "PDF to Image Converter — PDF to PNG, JPG or WebP",
  h1: "PDF to Image Converter",
  metaDescription:
    "Convert PDF pages to PNG, JPG or WebP at up to 216 DPI, pick page ranges, download a ZIP. Rendered in your browser by pdf.js — nothing is uploaded.",
  intro:
    "This PDF to image converter renders each page with Mozilla's pdf.js engine (v5.6.205, loaded at runtime with its parsing worker on a background thread), paints it onto an HTML canvas at 1x–3x of the PDF's native 72-unit page space, then encodes that canvas through HTMLCanvasElement.toBlob() as PNG, JPEG or WebP. Your file is read locally with File.arrayBuffer(); the document bytes never leave the tab, and the only network request the page makes is for the pdf.js library itself. Scale maps straight to output resolution — 1x is 72 DPI, 2x (the default) is 144 DPI, 3x is 216 DPI — so a US Letter page (612 × 792 pt) exports at 1,836 × 2,376 px on the 3x setting.",
  useCases: [
    "Pull a single chart or diagram page out of a research PDF as a lossless PNG and drop it straight into a slide deck.",
    "Turn a multi-page brochure into 144 DPI JPGs for a CMS or storefront that accepts image uploads but rejects PDFs.",
    "Export a whole scanned document as WebP images in one ZIP so it can be reviewed on a phone without a PDF reader.",
  ],
  benefits: [
    [
      "Your PDF stays on your device",
      "The file is read with File.arrayBuffer() and rendered on a local canvas — there is no upload endpoint, no account, and no server copy of the document.",
    ],
    [
      "Resolution you actually pick",
      "Four scale presets map to 72, 108, 144 and 216 DPI, and every finished page shows its exact pixel dimensions and byte size before you download it.",
    ],
    [
      "Exact pages, not the whole file",
      "The range box accepts syntax like 1-3, 5, 9; long PDFs default to the first 12 pages so a 400-page file does not render itself into a memory wall.",
    ],
    [
      "Batch ZIP or single images",
      "JSZip bundles the batch as name-images.zip with pages named name-page-01.png, or you can download any single page from its preview card.",
    ],
  ],
  faqs: [
    [
      "How do I convert a PDF to an image without uploading it?",
      "Drop the PDF onto this page — conversion happens entirely in your browser. pdf.js parses the document in a Web Worker and each page is drawn to a canvas element, so the file bytes never travel to a server. The only thing fetched over the network is the pdf.js library code itself.",
    ],
    [
      "What DPI or image size do the pages come out at?",
      "72, 108, 144 or 216 DPI, matching the 1x, 1.5x, 2x and 3x buttons; 2x (144 DPI) is the default. Because PDF page space is 72 units per inch, a US Letter page renders at 1,224 × 1,584 px at 2x and 1,836 × 2,376 px at 3x. Use 1x or 1.5x for quick previews and 3x for print-grade crops.",
    ],
    [
      "Should I export PDF pages as PNG, JPG or WebP?",
      "PNG for anything with text, line art or a transparent background — it is lossless, so small type stays crisp. JPG for the smallest files when the page is photographic. WebP when you want JPG-like size with better quality. The quality slider (50–100%, default 92%) applies only to JPG and WebP; PNG ignores it because it is lossless.",
    ],
    [
      "Can I convert only certain pages of a PDF to images?",
      "Yes — type a range like 1-3, 5, 9 in the Pages box. Numbers and hyphenated ranges can be mixed, duplicates are removed, and a page number outside the document is flagged before conversion starts. If the PDF has 12 pages or fewer the whole file is preselected; longer PDFs start at 1-12.",
    ],
    [
      "How do I download all the converted pages at once?",
      "Click Download ZIP after conversion. JSZip (loaded only at that moment) packs every rendered page into one archive named after your PDF, with files numbered report-page-01.png, report-page-02.png and so on. Individual pages also have their own download button on each preview card.",
    ],
    [
      "Can I get a PDF page as a PNG with a transparent background?",
      "Yes, for PNG only. Selecting Transparent creates the canvas with alpha enabled and skips the white fill, so a page whose artwork sits on no background exports with transparency. JPG and WebP exports here are always flattened onto white, and the Transparent option is disabled while either is selected.",
    ],
    [
      "Why won't my PDF load, and is there a page limit?",
      "Encrypted or damaged files are rejected with a load error — remove the password first, then convert. There is no hard page or file-size cap, but each page becomes a full-size bitmap in memory, so very large documents at 3x can exhaust the tab; dropping to 1.5x or converting in smaller ranges fixes it. If the pdf.js library itself is blocked (offline or a blocked CDN), the tool falls back to a compatibility mode that reports page count and page size instead of rendering the real artwork.",
    ],
  ],
  steps: [
    "Drop a PDF onto the upload area or click Select PDF — the first page renders as a preview and the page count appears.",
    "Choose the image format, resolution (1x–3x), quality for JPG or WebP, background, and the pages you want, such as 1-3, 5, 9.",
    "Click Convert Pages, watch the progress bar, then download images individually or grab the whole batch as a ZIP.",
  ],
};

export default seo;
