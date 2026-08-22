const seo = {
  title: "List Sorter: A-Z, by Number, Length or Random",
  metaDescription:
    "Sort a pasted list A-Z, by numeric value, by length, reversed or shuffled. Split on newline, comma, semicolon or pipe, then download sorted-list.txt.",
  steps: [
    "Paste your items into the list box and pick a List Separator: New Line, Comma (,), Semicolon (;) or Pipe (|).",
    "Choose an ordering — A-Z, Z-A, 0-9 Ascending, 9-0 Descending, Shortest First, Longest First, Reverse List or Shuffle List — and toggle 'Trim Whitespace & Skip Empty'.",
    "Read the sorted output, then press Copy or Download to save sorted-list.txt.",
  ],
  intro:
    "List Sorter reorders a pasted list eight ways — A–Z, Z–A, numeric ascending or descending, shortest or longest item first, straight reverse, or a Fisher-Yates shuffle — and re-splits the list on your chosen separator: newline, comma, semicolon or pipe. Alphabetical sorting uses locale-aware comparison and is case-insensitive unless you switch case sensitivity on; numeric sorting strips out everything except digits, a decimal point and a minus sign, so \"$1,200\" and \"42 kg\" still sort by their value. The result updates as you type and can be copied or downloaded as sorted-list.txt.",
  useCases: [
    "Alphabetising a guest list or bibliography pasted from a document, without pushing lowercase entries below the uppercase ones",
    "Sorting a semicolon-separated field of prices or quantities by value, when the entries carry currency symbols or units that a plain text sort would order wrongly",
    "Picking a random order for presentation slots or a giveaway by shuffling the list of names rather than sorting it",
  ],
  benefits: [
    ["Eight orderings, one paste", "Alphabetical, numeric, by length, reversed and shuffled all run off the same input, so you can try an ordering and switch without re-pasting."],
    ["Numbers sorted by value, not by character", "Non-numeric characters are stripped before comparison, so 100 sorts after 42 instead of before it and negative values land first."],
    ["Case sensitivity is your choice", "Off by default so Apple and apricot interleave naturally; switch it on when uppercase-first ordering actually matters."],
  ],
  faqs: [
    [
      "How do I sort a comma-separated list alphabetically?",
      "Choose Comma as the list separator and A–Z as the mode — the list is split on commas, sorted, and rejoined with commas. Leave Trim Whitespace on so the space after each comma does not affect the sort order.",
    ],
    [
      "Why does my number list sort in the wrong order?",
      "A plain text sort compares character by character, so \"100\" comes before \"42\" because \"1\" precedes \"4\". Pick 0–9 Ascending instead: the numeric modes strip every character except digits, the decimal point and the minus sign, then compare the values, so -10, 5, 18, 23.5, 42, 100 come out in true order.",
    ],
    [
      "Can it sort by word or line length?",
      "Yes — Shortest First and Longest First order items by character count, and items of identical length are broken alphabetically so the result is stable and predictable rather than arbitrary.",
    ],
    [
      "Does it remove blank lines and stray spaces?",
      "With Trim Whitespace & Skip Empty enabled — the default — each item is trimmed and empty items are dropped before sorting, so a trailing comma or a blank line does not produce a phantom entry at the top of the list. Turn it off if the leading spaces are meaningful and should be preserved.",
    ],
  ],
};

export default seo;
