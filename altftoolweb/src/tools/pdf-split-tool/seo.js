const seo = {
  intro:
    "PDF Split Tool breaks one PDF into separate files using five modes — one file per page, fixed batches of N pages, custom semicolon-separated page groups, extract selected pages into a single PDF, or remove selected pages and keep the rest. It shows the full output plan, file by file, before anything is generated, then downloads a single PDF or a DEFLATE-compressed ZIP containing every part plus a split-plan.txt manifest. Page selections accept ranges such as 1-3, 7, 10-12.",
  useCases: [
    "A 120-page scanned bundle holds a dozen separate invoices, and each one needs to reach your accounting system as its own file.",
    "You need pages 4 to 9 of a lease to send to a mortgage broker and nothing else from the document.",
    "A printer wants a long manual delivered in 20-page chunks, and you need consistent batches with predictable filenames.",
  ],
  benefits: [
    ["See the plan before you split", "Every planned output file, its label and its page numbers are listed on screen first, so you catch a wrong range before generating anything."],
    ["Five split strategies, one tool", "Per-page, fixed batches, custom groups, extraction and removal all work off the same page-range syntax instead of needing separate tools."],
    ["Outputs arrive documented", "Multi-file results are packaged as a ZIP with a split-plan.txt manifest recording the mode and the pages inside each file."],
  ],
  faqs: [
    [
      "How do I split a PDF into separate pages?",
      "Choose the Every Page mode: it plans one output PDF per page, so a 30-page file produces 30 PDFs delivered in a single ZIP with sequentially numbered filenames.",
    ],
    [
      "What page range format does it accept?",
      "Comma-separated single pages and hyphenated ranges, for example 1-3, 7, 10-12. Pages outside 1 to the document's page count are rejected with a message naming the invalid entries. Custom Groups mode separates one output file from the next with a semicolon.",
    ],
    [
      "Do I get one file or a ZIP?",
      "A single PDF downloads directly when the plan produces exactly one output — as Extract and Remove modes normally do. Two or more outputs are packaged into a DEFLATE-compressed ZIP along with the plan manifest.",
    ],
    [
      "Can I delete pages instead of splitting?",
      "Yes. Remove mode keeps every page except the ones you list and exports the remainder as one PDF. It will not let you remove every page — at least one must remain.",
    ],
  ],
};

export default seo;
