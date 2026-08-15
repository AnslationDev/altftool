const seo = {
  title: "Word, PPT & Excel to PDF Converter in Your Browser",
  metaDescription:
    "Turn DOCX, PPTX, XLSX, XLS, CSV and TXT into PDFs on your device - 20 files at 50 MB each, A4 or Letter, batch ZIP, nothing uploaded.",
  steps: [
    "Drop files on 'Drop documents here' or press Choose Files — DOCX, PPTX, XLSX, XLS, CSV and TXT are accepted, up to 20 files at 50 MB each, and legacy DOC/PPT must be saved as DOCX/PPTX first.",
    "Under PDF Settings choose Page Size, Orientation (Auto, Portrait or Landscape), Margin and Table Density, and set Rows per Sheet and Max Columns for spreadsheets.",
    "Press Download PDF: one document comes back as its own .pdf, while a queue of several downloads together as converted-pdfs.zip — Copy Summary puts the queue and settings on your clipboard.",
  ],
  intro:
    "This converter reads DOCX, PPTX, XLSX, XLS, CSV and TXT files in the browser and rebuilds their text content as a clean PDF — Word headings, paragraphs and lists become styled blocks, PowerPoint slides become one framed panel per slide with speaker notes, and spreadsheets become paginated tables sheet by sheet. You can queue up to 20 files at 50 MB each, set A4 or Letter, portrait, landscape or auto orientation, and export them individually or as a single ZIP. Parsing and PDF generation both run on your device, so the documents are never uploaded.",
  useCases: [
    "A client asked for the proposal as a PDF and the office machine has no Word licence — drop the .docx in and download a PDF with the headings and lists intact",
    "You need to attach a deck to an email but the .pptx is too heavy, so you export a text-and-notes PDF that shows one slide panel per slide including the speaker notes",
    "You have a folder of CSV exports to hand to someone who does not use spreadsheets, so you queue them all and get one ZIP of paginated landscape tables",
  ],
  benefits: [
    ["One pipeline for four file families", "Word, PowerPoint, Excel and plain text each get their own layout treatment instead of being dumped into a single generic page."],
    ["Batch queue with a single ZIP", "Convert up to 20 documents in one pass and download them together as converted-pdfs.zip with a manifest of the queue."],
    ["Layout controls that matter for tables", "A4 or Letter, three margin widths, and compact or comfortable row density so a wide sheet fits without shrinking to nothing."],
  ],
  faqs: [
    [
      "Does the PDF look exactly like the original Word or PowerPoint file?",
      "No — this is a text-and-structure conversion, not a pixel-perfect render. Headings, paragraphs, lists, slide text, notes and table cells are extracted and laid out fresh, so fonts, images, colours, charts and precise positioning from the source are not carried across. If exact visual fidelity matters, use the original app's own Save as PDF.",
    ],
    [
      "What are the file size and count limits?",
      "Up to 20 files in the queue at once, each up to 50 MB. Anything larger is skipped with a message, and files outside DOCX, PPTX, XLSX, XLS, CSV and TXT are flagged as unsupported rather than silently dropped — note that legacy .doc and .ppt are not supported, only the modern XML formats.",
    ],
    [
      "Are my documents uploaded to a server?",
      "No. The DOCX is parsed with mammoth, the PPTX is unzipped and read slide by slide, the spreadsheet is read with SheetJS and the PDF is written with jsPDF — all inside the page. Nothing is transmitted, which is what makes it usable for contracts and internal decks.",
    ],
    [
      "How are multi-sheet workbooks and wide tables handled?",
      "Each worksheet starts on its own page, the first row is drawn as a bold header and rows paginate automatically. By default only the first 80 rows and 10 columns of a sheet are drawn — you can raise that to 1,000 rows and 20 columns, and any rows left out are reported in a line under the table so nothing disappears silently.",
    ],
  ],
};

export default seo;
