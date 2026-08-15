const seo = {
  title: "Sort Lines and Remove Duplicates — Line Sorter Tool",
  metaDescription:
    "Paste a list to sort A–Z, naturally (item 2 before item 10), by length, reversed or shuffled — and strip duplicate or blank lines in the same pass.",
  steps: [
    "Paste your list into the Input list box, one item per line — the live counter above it shows how many lines came in.",
    "Choose a Sort order (A to Z, Natural / numeric, by length, reverse or Shuffle randomly) and a Duplicate handling mode, with Ignore case, Trim spaces on each line and Remove blank lines checkboxes.",
    "Take the cleaned list from the Result box with Copy result; the stats panel counts duplicates and blank lines removed, and Shuffle again re-rolls a shuffle.",
  ],
  "intro": "Line Sorter and Deduplicator cleans up any list you paste into it: sort A-Z or Z-A, use natural order so item 2 comes before item 10, sort by line length, reverse the order or shuffle it, and remove duplicate or blank lines in the same pass. You can ignore case, trim stray spaces, keep only the unique lines or keep only the repeated ones. Handy for marketers cleaning keyword lists, developers tidying config files and anyone deduping an email or SKU export.",
  "useCases": [
    "Dedupe a keyword export before uploading it to an ads platform that charges per row.",
    "Sort a list of filenames naturally so file2 comes before file10 instead of after it.",
    "Find which entries in two merged mailing lists appear twice by keeping only the repeated lines."
  ],
  "benefits": [
    [
      "Natural and locale-aware",
      "Sorting uses your browser's collator, so numbers compare by value and accented words sort like a dictionary."
    ],
    [
      "Five duplicate modes",
      "Keep first, keep last, keep only unique lines, keep only repeated lines, or leave duplicates untouched."
    ],
    [
      "Repeatable shuffle",
      "The random order is seeded, so the result stays put while you tweak other options and only changes when you ask."
    ]
  ],
  "faqs": [
    [
      "Does removing duplicates keep the first or the last occurrence?",
      "You choose. 'Keep first' preserves the earliest copy of each line, 'keep last' preserves the final one — useful when later rows in an export hold the newer data."
    ],
    [
      "What is natural sort order?",
      "Natural order reads embedded digits as numbers, so item 2 sorts before item 10. Plain alphabetical sorting compares character by character and puts item 10 first because 1 comes before 2."
    ],
    [
      "Is my list uploaded anywhere?",
      "No. Sorting, deduplication and shuffling all run in your browser, so customer lists and internal exports never leave your device."
    ],
    [
      "How does the ignore-case option affect duplicates?",
      "With it on, Apple and apple are treated as the same line, so only one survives deduplication and the sort ignores capitalisation. Turn it off when case is meaningful, such as with code identifiers."
    ]
  ]
};

export default seo;
