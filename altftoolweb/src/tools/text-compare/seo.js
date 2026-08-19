const seo = {
  title: "Text Compare: Side-by-Side Diff & Similarity %",
  metaDescription:
    "Paste two texts for a line-by-line diff marking added, removed and modified lines, a similarity percentage, and a downloadable text-compare-report.txt.",
  steps: [
    "Paste the original into the 'Left text input' pane and the revision into 'Right text input'; the diff and statistics update in real time as you type.",
    "Toggle Ignore whitespace, Ignore case or Line numbers in the options bar to keep formatting-only edits out of the comparison.",
    "Read the Added, Removed, Modified, Similarity and Total lines cards, then Copy result or Download the report as text-compare-report.txt; Clear all empties both panes.",
  ],
  intro:
    "This is a side-by-side text diff that lines up two blocks of text by line number and marks each row as unchanged, modified, added or removed, then scores similarity as the share of unchanged lines out of the longer document. Optional toggles let you ignore case and collapse runs of whitespace before the comparison, so formatting-only edits stop showing up as real changes. The result can be copied or downloaded as a plain-text report listing every differing line with its number and both versions.",
  useCases: [
    "A colleague sends back a revised contract clause pasted into an email and you need to see exactly which lines moved before you sign off",
    "You are checking whether a config or environment file on staging still matches the one on production, line for line",
    "You rewrote a page of copy and want to know how much of the original survived before telling an editor it is 'a light edit'",
  ],
  benefits: [
    ["A similarity number, not just colours", "Every comparison reports similarity as a percentage alongside counts of added, removed and modified lines."],
    ["Noise filters you control", "Ignore case and ignore whitespace normalise each line before comparing, so re-indentation or a capitalisation change does not flood the diff."],
    ["A report you can attach", "Copy or download a text-compare-report.txt containing the similarity score and every changed line as a minus/plus pair, ready to paste into a ticket."],
  ],
  faqs: [
    [
      "How is the similarity percentage calculated?",
      "It is the number of unchanged lines divided by the line count of the longer of the two texts, rounded to a whole percent. Because it counts lines rather than characters, a one-word change and a full rewrite of the same line both cost you the same amount.",
    ],
    [
      "Why is everything marked changed after I inserted one line?",
      "The comparison aligns the two texts by position — line 5 is always compared with line 5 — so inserting a line near the top shifts every following line out of alignment and marks it modified. Add the same blank line to the other side, or compare the sections below the insertion separately, to get a clean read.",
    ],
    [
      "What does 'ignore whitespace' actually do?",
      "Before comparing, it collapses every run of spaces, tabs and other whitespace inside a line down to a single space and trims the ends. Two lines that differ only in indentation or trailing spaces then count as identical; it does not remove blank lines, which still occupy a line position.",
    ],
    [
      "Is there a size limit on what I can paste?",
      "There is no hard cap, but past a combined 50,000 characters across both panes the tool warns you that the comparison is large, since every line is re-diffed on each keystroke. For very large files, compare a section at a time.",
    ],
  ],
};

export default seo;
