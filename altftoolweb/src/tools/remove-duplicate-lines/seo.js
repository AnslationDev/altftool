const seo = {
  title: "Remove Duplicate Lines: Keep First, Keep Order",
  metaDescription:
    "Delete repeated lines from text, keeping the first occurrence in original order. Whole-line exact matching with an optional Ignore case toggle.",
  steps: [
    "Paste your list into the Input panel (or click 'Load sample') — lines are compared whole, exactly as typed.",
    "Turn on the 'Ignore case' toggle if lines like 'Delhi' and 'delhi' should count as one; deduplication reruns live on every change.",
    "The Result panel keeps only the first occurrence of each line in its original order — click 'Copy' to take the cleaned list.",
  ],
  intro:
    "Remove Duplicate Lines deletes repeated lines from a block of text and keeps only the first occurrence of each, leaving the surviving lines in their original order. It compares whole lines exactly as typed, with an optional Ignore case toggle that treats \"Delhi\" and \"delhi\" as the same line. Useful for anyone cleaning up an email list, a log file, a keyword dump or a pasted CSV column before importing it somewhere else.",
  useCases: [
    "You pasted three exported subscriber lists into one file and need a single clean list of email addresses before uploading it to your mailing tool, without reordering the entries.",
    "A keyword research export has the same search terms repeated across ad groups, and you want one row per term before you hand the sheet to a client.",
    "You copied a stack trace or server log and want to see the distinct error lines instead of the same message repeated two hundred times.",
  ],
  benefits: [
    ["Keeps the first occurrence", "Order is preserved exactly as pasted — nothing is sorted or shuffled, so the surviving lines stay where you expect them."],
    ["Case handling is your choice", "Leave the toggle off for an exact match, or turn on Ignore case so differences in capitalisation count as the same line."],
    ["Whole-line matching", "Comparison is on the entire line, so two rows of a pasted CSV only collapse when every field matches."],
  ],
  faqs: [
    [
      "Does it sort the lines?",
      "No. The first occurrence of each line stays in its original position and later copies are dropped, so the output keeps your input order. If you want alphabetical order, sort the result afterwards in a separate step.",
    ],
    [
      "Are \"Apple\" and \"apple\" treated as duplicates?",
      "Only if you turn on the Ignore case toggle, which is off by default. With it off the comparison is byte-for-byte, so any difference in capitalisation makes the two lines distinct.",
    ],
    [
      "What happens to blank lines?",
      "Blank lines are treated like any other line, so the first empty line is kept and every later empty line is removed. If you were using blank lines as paragraph separators, expect the spacing to collapse.",
    ],
    [
      "Why are two lines that look identical both kept?",
      "Almost always because of invisible characters — a trailing space, a tab, or a non-breaking space makes the lines different strings. Run the text through a space-trimming step first, then remove duplicates.",
    ],
  ],
};

export default seo;
