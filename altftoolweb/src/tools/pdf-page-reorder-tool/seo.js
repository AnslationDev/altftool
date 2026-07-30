const seo = {
  intro:
    "PDF Page Reorder renders every page of a PDF as a thumbnail you can drag into a new sequence, then rebuilds the document in that order and hands you a reordered.pdf to download. Pages are re-copied one by one from the original file, so text, vectors and fonts stay intact rather than being flattened into images. The thumbnails are only a preview, rendered client-side at low scale for speed.",
  useCases: [
    "A scanner fed a stack out of order and the signature page ended up in the middle of a contract you have to send back today.",
    "You are building a deck handout from an exported PDF and want the appendix slides moved behind the summary before printing.",
    "A colleague returned a report with the sections shuffled, and you need to restore the order the table of contents promises.",
  ],
  benefits: [
    ["You see the pages, not filenames", "Each page is rendered as a visual thumbnail, so you reorder by what is actually on the page instead of guessing from page numbers."],
    ["Keyboard reordering, not just dragging", "Sorting is wired for keyboard as well as pointer input, so pages can be moved without a mouse."],
    ["Original page content is preserved", "The new file is assembled by copying the source pages themselves, so selectable text and quality are unchanged."],
  ],
  faqs: [
    [
      "Does reordering reduce the quality of my PDF?",
      "No. Pages are copied from the original document into a new one, so the underlying text, fonts and vector artwork are carried over untouched. Only the on-screen thumbnails are downsampled, at roughly 30% scale, and they are never part of the output.",
    ],
    [
      "Can I delete pages as well as move them?",
      "No — this tool reorders pages only; every page of the source file appears in the output. Use a dedicated split or page-removal tool if you need to drop pages.",
    ],
    [
      "How do I move a page without dragging?",
      "Focus a page's grip handle with the keyboard and use the arrow keys; the sorting is set up with a keyboard sensor alongside the pointer one. Pointer drags need about 8 pixels of movement before they start, so a plain click will not disturb the order.",
    ],
    [
      "Is my PDF uploaded anywhere?",
      "No. The file is read into memory in the tab, thumbnails are rendered on a canvas, and the reordered document is written locally and downloaded as reordered.pdf. Nothing is sent to a server.",
    ],
  ],
};

export default seo;
