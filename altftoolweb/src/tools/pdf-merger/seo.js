const seo = {
  title: "Merge PDF Files in Your Browser — Up to 20",
  metaDescription:
    "Combine up to 20 PDFs (80 MB each) into one file in your browser — drag to reorder, see page counts, download merged-<timestamp>.pdf. No upload.",
  steps: [
    "Drag & drop PDF files into the dropzone or click to browse — up to 20 PDFs per batch, 80 MB each; each file's page count is read as it is added.",
    "Arrange the sequence by dragging rows or using the move up/down arrows, then click 'Merge Files' (enabled once at least 2 files are queued).",
    "Click 'Download' to save the merged file as merged-<timestamp>.pdf, or use 'Copy Manifest' / 'Export Manifest' for a text record of the input order, pages and sizes.",
  ],
  intro:
    "PDF Merger combines up to 20 PDFs into one document in your browser, copying every page from each file in the order you arrange them and writing a single new PDF. Drag the rows to set the sequence, watch the running page count, then download the merged file. It also produces a plain-text merge manifest listing each input file, its page count and size, so you have a record of what went into the output.",
  useCases: [
    "You are filing an expense claim that wants one attachment, and you have eleven separate receipt PDFs that need to arrive in date order.",
    "A scanner produced a report as cover page, body and appendix in three files, and the recipient asked for a single document.",
    "You are assembling a tender submission where the checklist fixes the section order, and you need to confirm the page count matches before sending.",
  ],
  benefits: [
    ["Order is yours to set", "Drag rows or use the up/down controls to fix the exact sequence before merging, instead of accepting alphabetical file order."],
    ["Page counts before you commit", "Each file is read for its page count as it is added, so the merged total is visible before you generate anything."],
    ["A manifest you can keep", "Copy or download a text manifest of the input order, per-file pages and sizes for your records or a submission checklist."],
  ],
  faqs: [
    [
      "How many PDFs can I merge at once?",
      "Up to 20 files per batch, each up to 80 MB. Files larger than that are rejected on drop, and once 20 slots are filled additional files are not added.",
    ],
    [
      "Does merging change the order of my pages?",
      "No. Pages are copied file by file in the order shown on screen, and every page of each file is kept, so the merged document reads exactly as the list reads top to bottom.",
    ],
    [
      "Can I merge password-protected PDFs?",
      "Encrypted files are loaded with encryption ignored, which works for many permission-restricted PDFs but not for ones that need a user password to open. Remove the open password first if a file fails to load.",
    ],
    [
      "Are my documents uploaded to a server?",
      "No. Each file is read as an array buffer in the page and merged with an in-browser PDF library, and the result is handed to you as a blob download named merged-<timestamp>.pdf. Nothing is transmitted.",
    ],
  ],
};

export default seo;
