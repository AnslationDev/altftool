const seo = {
  title: "Split PDF in Browser: Pages, Batches & Ranges",
  metaDescription:
    "Cut a PDF into one file per page, fixed batches or ranges like 1-3, 5, 9-, or extract/remove pages — pdf-lib in your browser, nothing uploaded.",
  steps: [
    "Upload your file under 'PDF file' (unlock password-protected PDFs first) and pick a 'Split mode' — One PDF per page, Fixed batches of N pages, Custom ranges, Extract or Remove selected pages.",
    "For range modes type the pages into 'Pages / ranges' using 3, 2-7, 9- or last, and set the 'Output file name prefix'.",
    "The Output files table names each part like document-page-01.pdf — press PDF for a single part or 'Download ZIP' for all of them (limit 500 output files).",
  ],
  intro:
    "Split PDF cuts one PDF into several smaller PDFs — one file per page, fixed batches of N pages, custom ranges such as 1-3, 5, 9-, or a single file with chosen pages extracted or removed. Page numbers are 1-based exactly as your reader shows them, and the split is done with pdf-lib inside the browser, so the document is never uploaded. It is for anyone who needs to hand over part of a document — a single invoice from a batch, one chapter from a report — without sharing the rest.",
  useCases: [
    "Pulling pages 4-9 out of a 60-page contract to send only the schedule to a counterparty",
    "Breaking a scanned batch of 120 invoices into 120 single-page PDFs for filing",
    "Removing the blank separator pages a scanner inserted before archiving a document",
  ],
  benefits: [
    ["Flexible range syntax", "Accepts 3, 2-7, 9- and last in one expression, so complex selections take a single line."],
    ["Nothing is uploaded", "The PDF is read with the browser File API and rewritten locally — no server ever sees the file."],
    ["Batch download", "Every part can be pulled down individually or packaged into one ZIP, up to 500 output files."],
  ],
  faqs: [
    [
      "How do I split a PDF into separate pages?",
      "Choose 'One PDF per page' and upload the file — a 12-page document becomes 12 single-page PDFs named document-page-01.pdf through document-page-12.pdf. Download them one by one or take the whole set as a ZIP.",
    ],
    [
      "How do I extract specific pages from a PDF?",
      "Pick 'Extract selected pages into one PDF' and type the pages, for example 1-3, 5, 9- which keeps pages 1, 2, 3, 5 and everything from page 9 to the end. Pages are written in the order you list them, so 7-2 would also reverse that block.",
    ],
    [
      "Is my PDF uploaded to a server when I split it?",
      "No. The file is read with the browser's File API and rebuilt in memory with pdf-lib on your own machine, so the document never leaves the device and the tool keeps working if the connection drops after the page loads.",
    ],
    [
      "Can this split a password-protected PDF?",
      "Only if the password has already been removed. An encrypted PDF cannot be parsed without its password, so unlock it first — the tool will report that it could not read the file rather than producing a broken split.",
    ],
  ],
};

export default seo;
