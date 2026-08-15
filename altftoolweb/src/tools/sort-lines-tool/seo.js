const seo = {
  title: "Sort Lines Alphabetically: A-Z or Z-A",
  metaDescription:
    "Paste a list and get it back sorted A to Z or Z to A with localeCompare, so accents sort as a dictionary would. Blank lines are dropped.",
  steps: [
    "Paste your lines into the Input box, or press \"Load sample\" for the banana / apple / cherry / date list.",
    "Set \"Order\" to \"A → Z\" or \"Z → A\" and leave \"Ignore case\" ticked so Apple and apple sort together.",
    "The Result panel re-sorts as you type and drops blank lines; press \"Copy\" to take the sorted list.",
  ],
  intro:
    "Sort Lines Tool reorders every line of pasted text alphabetically, A to Z or Z to A, using JavaScript's locale-aware string comparison so accented and non-English characters land where a dictionary would put them rather than where their byte values fall. It suits anyone tidying a list — keyword sets, CSV columns, import files, glossary entries — who wants the sorted result back in one paste-and-copy step. An ignore-case option is on by default, so Apple and apple sit together instead of all capitals being pushed to the top.",
  useCases: [
    "You have exported 400 keywords from a search console report and need them alphabetical before pasting them into a spreadsheet column for de-duplication by eye.",
    "A config file lists dependencies or hostnames in the order they were added, and a code reviewer has asked you to keep the block sorted so future diffs stay small.",
    "You are merging two name lists for an event and want both in the same A-to-Z order before comparing them side by side to spot who is missing.",
  ],
  benefits: [
    [
      "Locale-aware, not byte-order",
      "Comparison uses localeCompare, so é sorts next to e and lowercase entries are not dumped after every uppercase one the way a raw ASCII sort would.",
    ],
    [
      "Case folding you can switch off",
      "Ignore case is on by default for natural dictionary order, but turn it off and capitals sort separately — useful for case-sensitive identifiers.",
    ],
    [
      "Blank lines are dropped in the process",
      "Empty lines are filtered before sorting, so a list pasted from a PDF or email comes back without the run of gaps it arrived with.",
    ],
  ],
  faqs: [
    [
      "How do I sort a list in reverse alphabetical order?",
      "Set Order to Z → A. The lines are sorted ascending first and then reversed, so descending output is the exact mirror of the ascending result, including how case folding was applied.",
    ],
    [
      "Does it remove duplicate lines?",
      "No. Every non-empty line you paste comes back, duplicates included — they simply end up adjacent once sorted, which makes them easy to spot or delete. Only blank lines are removed.",
    ],
    [
      "How are numbers sorted?",
      "As text, not as numbers. That means 10 sorts before 2, because the comparison reads character by character. Pad numbers with leading zeros (02, 10) if you need true numeric order.",
    ],
    [
      "Is there a limit on how many lines I can sort?",
      "There is no fixed line cap — sorting runs in your browser on the text in the box, so the practical limit is your device's memory. Lists in the tens of thousands of lines sort effectively instantly on a typical laptop.",
    ],
  ],
};

export default seo;
