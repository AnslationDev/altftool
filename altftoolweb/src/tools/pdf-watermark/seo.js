const seo = {
  title: "Add Watermark to PDF — Free, In Your Browser",
  h1: "Add a Watermark to PDF",
  metaDescription:
    "Add a text watermark to every page of a PDF — size, opacity, rotation, color, tiling. Runs on pdf-lib in your browser, so the file never uploads.",
  intro:
    "PDF Watermark stamps text across every page of a PDF using pdf-lib 1.17.1, running entirely in your browser. Your file is read as an ArrayBuffer, opened with PDFDocument.load(), and each page returned by getPages() gets a drawText() call carrying your text, font size, opacity, rotation and color — the hex you pick is split into red, green and blue channels and divided by 255 for pdf-lib's rgb() function. Repeat mode tiles the text on a grid stepped by a third of the page width and a quarter of its height; with it off, a single mark is placed diagonally, centered, or in any corner. The rewritten document is saved to a Blob and downloaded straight back to you, so the PDF itself is never sent to a server.",
  useCases: [
    "Stamping CONFIDENTIAL or DRAFT diagonally across a contract before circulating it for review.",
    "Branding a proposal, quote or invoice with your company name at low opacity before sending the PDF.",
    "Marking sample or preview copies of an ebook, report or worksheet so the pre-release version is unmistakable.",
  ],
  benefits: [
    [
      "Every page, in one pass",
      "The tool iterates all pages returned by pdf-lib's getPages() and stamps each one with identical settings, so a long report takes the same two clicks as a single sheet.",
    ],
    [
      "Tiled or single placement",
      "Repeat mode lays the text out on a grid — one step per third of the page width and quarter of its height — or switch it off for a single mark at diagonal, center, or any of the four corners.",
    ],
    [
      "Vector text, not a flattened image",
      "The watermark is drawn as real PDF text at your chosen size, color and angle, so it stays sharp at any zoom and the original pages are never rasterized or re-compressed.",
    ],
    [
      "Nothing leaves your device",
      "pdf-lib runs client-side: the file is read as an ArrayBuffer, stamped, and handed back as a download. No upload, no account, no server-side copy of your document.",
    ],
  ],
  faqs: [
    [
      "How do I add a watermark to a PDF for free?",
      "Drop the PDF into the upload area, type your watermark text, and click Apply Watermark & Download. It's free with no signup, accepts files up to 50 MB, and the watermarked copy saves as your-filename-watermarked.pdf. All the work happens in your browser.",
    ],
    [
      "Is my PDF uploaded to a server?",
      "No. The pdf-lib library is fetched from a public CDN the first time you open the page, but your document is never sent anywhere — it's read locally as an ArrayBuffer, edited in memory, and saved back to your device through a blob download.",
    ],
    [
      "Can I add an image or logo as the watermark?",
      "No — this tool applies text watermarks only. You can enter up to 60 characters and control the font size (12 to 120), color, rotation and opacity, but there is no image or logo upload.",
    ],
    [
      "Does the watermark apply to every page of the PDF?",
      "Yes. The same watermark is drawn on every page of the document, using each page's own width and height so placement and tiling stay correct even when page sizes differ within one file.",
    ],
    [
      "What opacity should a PDF watermark be?",
      "The tool defaults to 25%, and 20–30% is the usual sweet spot — visible enough to read, light enough to leave the underlying text legible. Opacity is adjustable from 5% to 100% in 5% steps.",
    ],
    [
      "Can the watermark be removed later?",
      "Yes, in principle. The text is added as a normal PDF text object on top of the existing page content, so a full PDF editor can select and delete it. Treat this as visible marking and branding, not as encryption or copy protection.",
    ],
    [
      "Why does my file fail with \"Failed to process PDF\"?",
      "Almost always because the PDF is password-protected or encrypted — pdf-lib can't open those — or because the file is damaged. Watermark text also has to be encodable in the built-in Helvetica font, so emoji and non-Latin scripts will fail. Files over 50 MB are rejected before processing with a separate size message.",
    ],
    [
      "How do I change the watermark angle and position?",
      "Use the Rotation slider, which runs from -180° to +180° and defaults to 45°, and the Position dropdown: diagonal, center, top-left, top-right, bottom-left or bottom-right. Position applies when Repeat / Tile is switched off; with tiling on, the text repeats across the whole page at your chosen angle.",
    ],
  ],
  steps: [
    "Drop a PDF (up to 50 MB) onto the upload area, or tap it to browse for a file.",
    "Type your watermark text — up to 60 characters — then set font size, opacity, rotation, color, position, and whether it tiles across the page.",
    "Click \"Apply Watermark & Download\". Every page is stamped in your browser and the result saves as yourfile-watermarked.pdf.",
  ],
};

export default seo;
