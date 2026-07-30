const seo = {
  intro:
    "PDF to Word Converter rebuilds a text-based PDF as an editable .docx by reading the PDF's text layer, grouping items into lines by their coordinates, joining lines into paragraphs across gaps and indents, and promoting lines whose font size is about 1.3x the page average into headings. Choose a flowing document for editable prose or page-by-page output to keep page boundaries, restrict the job to a page range, and preview the result before exporting. Pages that turn out to be scans with no text layer can be run through in-browser OCR first.",
  useCases: [
    "A CV you no longer have the source file for exists only as a PDF, and you need to edit a job title before applying.",
    "A client sent a contract as a PDF and asked for tracked-change comments, which means it has to be a Word file first.",
    "Only pages 12 to 18 of a long spec need to go into a Word template, and you want just that range converted rather than the whole document.",
  ],
  benefits: [
    ["Paragraphs, not one line per line", "Lines are merged into paragraphs using vertical gaps, indentation and end punctuation, and hyphenated line breaks are rejoined, so the DOCX is genuinely editable prose."],
    ["Headings survive the conversion", "Lines that are noticeably larger than the page average, or short all-caps and title-case lines, are written as Word headings rather than flat body text."],
    ["Scanned pages are detected and can be OCR'd", "Pages that yield no text are counted as scanned and can be rendered at 2x and read with in-browser OCR, with per-page confidence reported."],
  ],
  faqs: [
    [
      "Will the Word file look exactly like the PDF?",
      "No. This is a text and structure conversion, not a layout clone: paragraphs, headings and page breaks are reconstructed, but complex columns, tables, floating images and exact typography will not be reproduced. Expect to reformat a heavily designed document.",
    ],
    [
      "Can it convert a scanned PDF?",
      "Only via OCR. Pages with no text layer are flagged as scanned, and you can run Tesseract OCR on those pages in the browser; recognition uses the English model and reports a confidence figure per page, so proofread the result.",
    ],
    [
      "How do I convert only some pages?",
      "Enter a page range such as 2-5, 9 in the range field; pages outside 1 to the document's page count are rejected before conversion. Leaving it blank converts every page.",
    ],
    [
      "How large a PDF can I convert, and does it leave my device?",
      "Up to 80 MB, and the extraction, paragraph building and DOCX generation all run in the browser tab. The one exception is OCR, which fetches the Tesseract engine script from a public CDN the first time you use it; your document is still processed locally.",
    ],
  ],
};

export default seo;
