const seo = {
  intro:
    "PDF Purifier lets you drop pages you do not want to share out of a PDF and reorder the ones you keep, then rebuilds the file from only the retained pages and downloads it as <name>-cleaned.pdf. Every page is shown as a thumbnail you can enlarge before deciding, and the tool writes a plain-text plan listing the original page count, the output order and exactly which pages were removed. Because the output is assembled by copying only the kept pages, the discarded content is not in the new file at all.",
  useCases: [
    "A signed agreement has an internal pricing appendix on pages 9 to 11 that must not go to the counterparty.",
    "You are sharing a bank statement as proof of address and want only the page carrying your name and address, not the transaction history.",
    "A scanned bundle came back with blank separator sheets between every document, and you want a clean copy with them stripped and the sections put in order.",
  ],
  benefits: [
    ["Removed pages are genuinely gone", "The output is built by copying the retained pages into a new document, so deleted pages are not merely hidden or blanked over."],
    ["Check before you cut", "Any page can be opened at 1.5x scale in a preview you can step through with the keyboard, so you confirm content before deleting it."],
    ["A written record of the edit", "A copyable summary lists the original page count, the final order and the exact page numbers removed — useful when someone asks what was taken out."],
  ],
  faqs: [
    [
      "Does deleting a page actually remove its content from the file?",
      "Yes. A fresh PDF is created and only the pages you kept are copied into it, so the removed pages' content is absent from the downloaded file rather than hidden. Redacting text within a page you keep is a different job and this tool does not do it.",
    ],
    [
      "How large a PDF can I clean?",
      "Up to 80 MB. Larger files are rejected with a message before any processing starts.",
    ],
    [
      "Can I reorder pages as well as delete them?",
      "Yes. Drag a page thumbnail to a new position, or use the move controls; the output is written in the order shown, with removals applied at the same time.",
    ],
    [
      "Does this strip metadata or hidden data from the PDF?",
      "No. It works at page level — removing and reordering pages — and does not scrub document metadata, embedded files or JavaScript. If a document must be sanitised for disclosure, have it reviewed with proper redaction tooling.",
    ],
  ],
};

export default seo;
