const seo = {
  title: "Convert Text or Images to PDF in Your Browser",
  metaDescription:
    "Turn typed text or JPG, PNG and WebP images into an A4, A5, Letter or Legal PDF in your browser — see the page count before you download. No upload.",
  steps: [
    "Choose \"Text to PDF\" and type or paste your content, or \"Images to PDF\" and pick JPG, PNG or WebP files — each image becomes one page.",
    "Set \"Page size\", \"Orientation\", \"Margin (mm)\" and \"Font size (pt)\" (or \"Image placement\" for images); the \"Pages in the PDF\" count updates live.",
    "Click \"Download PDF\" to save document.pdf (text) or images.pdf (images), generated in your browser with no upload.",
  ],
  intro:
    "To PDF converts typed text or picture files (JPG, PNG, WebP) into a downloadable PDF entirely inside your browser, with no upload step. It lays every page out in millimetres using standard paper sizes — A4 at 210 × 297 mm (ISO 216) and US Letter at 215.9 × 279.4 mm (ANSI A) — and shows how many pages you will get before you download. It is built for anyone who needs a quick, private PDF from notes, receipts or scanned photos without installing software.",
  useCases: [
    "Turning phone photos of receipts into one A4 PDF to attach to an expense claim",
    "Saving a block of pasted notes or a Markdown draft as a paginated PDF for printing",
    "Combining scanned ID or certificate images into a single PDF because a form only accepts one file",
  ],
  benefits: [
    ["Files never leave the device", "Conversion happens in the browser, so private documents are not uploaded to a server."],
    ["Page count before download", "The layout panel shows pages, lines per page and printable area so nothing gets cut off."],
    ["Standard paper sizes", "A4, A5, US Letter and US Legal in portrait or landscape, with an adjustable margin in millimetres."],
  ],
  faqs: [
    [
      "What page size does this tool use by default?",
      "A4, which is 210 × 297 mm under ISO 216 and the default paper size across Europe, India and most of the world. US Letter (215.9 × 279.4 mm), US Legal (215.9 × 355.6 mm) and A5 (148 × 210 mm) are also available, in portrait or landscape.",
    ],
    [
      "Are my files uploaded anywhere when I convert to PDF?",
      "No. The PDF is generated in your browser with JavaScript, so the image or text never leaves your device and nothing is stored on a server. You can even use the tool with your network disconnected once the page has loaded.",
    ],
    [
      "How many lines of text fit on one page?",
      "About 59 lines on A4 with a 15 mm margin at 11 pt, because line spacing is 1.15 × the font size and 1 point equals 1/72 inch — 11 × 1.15 = 12.65 pt ≈ 4.46 mm per line into 267 mm of printable height. Changing the margin or font size updates the number instantly.",
    ],
    [
      "Which file types can be converted to PDF here?",
      "JPG, PNG and WebP images become one page each, and plain-text content (typed, or pasted from .txt, .md, .csv and .log files) is wrapped and paginated. Office formats such as .docx and .xlsx are not supported because they need a full document renderer.",
    ],
  ],
};

export default seo;
