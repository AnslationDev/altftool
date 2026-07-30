const seo = {
  intro:
    "The Excel to PDF Converter renders a worksheet from an .xlsx, .xls or .csv file onto an A4 portrait page and saves it as a PDF with 10 mm margins and no watermark. The workbook is parsed in your browser, laid out on a 793 x 1056 px preview page — the pixel size of A4 at 96 dpi — and captured at 2x scale, so the table you see is exactly the table you get. Every sheet in the file is listed, and each export is named after the source file and the sheet, for example inventory-Q3.pdf.",
  useCases: [
    "A client asks for the pricing table as a PDF, not a spreadsheet they can edit — export the sheet and send a fixed-layout document instead of loose cells.",
    "You need to print a stock count sheet and Excel keeps splitting the columns awkwardly across pages — preview the A4 page here first and confirm the table fits before you send it to the printer.",
    "You are attaching a summary tab to an email and the recipient has no Office licence — a PDF opens on any phone or browser without asking them to install anything.",
  ],
  benefits: [
    ["True page preview", "The preview pane is a real A4 canvas at 96 dpi, so what you scroll through is the page geometry the PDF will use, not an approximation."],
    ["Nothing stamped on it", "The exported file carries no watermark, trial banner or footer link — just your header, the sheet name and the table."],
    ["Per-sheet export", "Pick any worksheet from the sidebar and export it on its own instead of dumping a whole workbook into one long document."],
  ],
  faqs: [
    [
      "Will the text in the PDF be selectable or searchable?",
      "No — the page is captured as a 2x-scale image and placed into the PDF, so the result is a picture of the table rather than live text. If you need selectable text, export the sheet to HTML or use Excel's own Save as PDF; if you need a fixed, tamper-resistant visual, this is the faster route.",
    ],
    [
      "What page size and margins does it use?",
      "A4 portrait with a 10 mm margin on all sides, measured in millimetres by the PDF generator. Very wide sheets are scaled to fit that width, so a table with 30 columns will come out small — consider splitting it or hiding columns before converting.",
    ],
    [
      "Can I convert every sheet in one go?",
      "Not in a single click — each export covers the worksheet currently selected. Switch sheets in the left panel and download again; each file is named with the sheet name appended so they do not overwrite each other.",
    ],
    [
      "Does the file get uploaded anywhere?",
      "No. The spreadsheet is read as an array buffer and parsed by JavaScript in the tab you have open, and the PDF is assembled in the same tab, so the data never leaves your device.",
    ],
  ],
};

export default seo;
