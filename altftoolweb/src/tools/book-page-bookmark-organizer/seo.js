const seo = {
  title: "Book Page Organizer — Topic Index Across Your Books",
  metaDescription:
    "Log topic, book and page range for every reference and get one sorted index — grouped by topic, ordered by book and start page — saved in your browser.",
  steps: [
    "Fill in Topic, Book, Page from and optionally \"Page to (blank for single page)\" and a Note; click Add page reference for more rows.",
    "The organiser groups entries by topic (case-insensitive) and sorts each block by book title and start page, showing ranges as \"pp. 312-329\".",
    "Click Copy index to paste the whole plain-text topic index into your notes app; entries persist in your browser's local storage.",
  ],
  intro:
    "This organiser collects page references from every book you study — topic, book, page or page range, and an optional note — and builds one sorted topic index across all of them. It follows the ordering convention of a printed subject index: entries grouped by topic, then sorted by book title and start page, and the whole index can be copied as plain text into your notes app. It is made for students and researchers who keep rediscovering that the answer they need is 'somewhere in one of three books'.",
  useCases: [
    "A UPSC aspirant indexes where federalism, DPSP and emergency provisions are covered across Laxmikanth, NCERTs and class notes",
    "A law student maps each syllabus topic to page ranges across the bare act, a commentary and lecture handouts",
    "A researcher collects page references for one theme across a dozen library books before a chapter deadline",
  ],
  benefits: [
    ["One index, many books", "Topic-wise grouping shows every book that covers a topic side by side with exact pages."],
    ["Copy-ready output", "The whole index exports as clean plain text for Notion, OneNote or a printed sheet."],
    ["Saved locally", "References persist in your browser between visits and never leave your device."],
  ],
  faqs: [
    [
      "How do I keep track of important pages across multiple books?",
      "Record each reference as topic + book + page range in one shared index rather than sticky notes in each book. Grouped by topic, the index instantly answers 'where have I seen this before' across every book at once — which is exactly what this tool builds and sorts for you.",
    ],
    [
      "Can I save a page range instead of a single page?",
      "Yes — enter a start and end page and it is shown as 'pp. 312-329'; leave the end page blank for a single-page reference shown as 'p. 418'. The tool also totals the pages saved per topic so you can estimate revision time.",
    ],
    [
      "Will topics with different capitalisation be treated as the same topic?",
      "Yes. Grouping is case-insensitive, so 'Federalism' and 'federalism' merge into one topic block, using the spelling of the first entry. Books, however, are matched by their exact name, so keep book titles consistent.",
    ],
    [
      "Where is my bookmark index stored?",
      "In your browser's local storage on your own device — it survives reloads but is never uploaded. Use the copy button to back the index up into your notes, since clearing browser data will remove it.",
    ],
  ],
};

export default seo;
