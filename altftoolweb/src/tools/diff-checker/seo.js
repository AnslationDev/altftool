const seo = {
  title: "Diff Checker — Free Side-by-Side Text Comparison",
  h1: "Diff Checker",
  metaDescription:
    "Paste two versions, get a side-by-side diff — additions in green, deletions in red, plus a similarity score. Runs in your browser, nothing uploaded.",
  intro:
    "Diff Checker compares two blocks of text using a longest common subsequence (LCS) dynamic-programming matrix written in plain JavaScript — the classic approach behind Unix diff. The matrix is backtracked to label every segment as added, deleted or unchanged and to map it to its position in both the original and the modified text, which is what fills the split and unified views. The comparison re-runs on every keystroke inside your browser: there are no network requests in the tool, no signup and no usage limit.",
  useCases: [
    "Reviewing a config, JSON payload or code snippet against a known-good copy when there is no git history to diff against",
    "Checking exactly what an editor, client or collaborator changed between two drafts of a paragraph, article or email",
    "Spotting a single altered character or number between two versions of a log line, ID, key or pasted record",
  ],
  benefits: [
    [
      "Every change is classified, not just coloured",
      "The LCS backtrack labels each segment added, deleted or unchanged and carries the line number from both sides, so the split view shows original versus modified and the unified view shows both numbering columns with +, - and space markers.",
    ],
    [
      "Four comparison granularities",
      "A mode dropdown switches the comparison between Line, Word, Character and Semantic, and the added/deleted/unchanged counters relabel to match the mode you picked.",
    ],
    [
      "Similarity score with the raw counts",
      "Alongside the added, deleted and unchanged totals you get a similarity percentage — matched length divided by total length — with a dot that reads green above 70%, amber above 40% and red below.",
    ],
    [
      "Nothing leaves your device",
      "The diff, the similarity score and the downloadable result are all generated client-side. The tool makes no server calls, so your text is never uploaded, and it is free with no account required.",
    ],
  ],
  faqs: [
    [
      "Is the Diff Checker free to use?",
      "Yes — completely free, with no signup, no account and no cap on how many comparisons you run. The whole tool is client-side JavaScript, so there is no metered backend behind it.",
    ],
    [
      "How do I compare two texts and find the differences?",
      "Paste the original into the left box and the changed version into the right — there is no Compare button to press. The diff recalculates automatically on every keystroke, showing additions in green, deletions in red and unchanged content in the neutral card colour.",
    ],
    [
      "Is my text uploaded or stored anywhere?",
      "No, it is never uploaded — the tool makes no network requests, and the comparison runs entirely in your browser. It does keep your last 10 comparisons in your own browser's localStorage so you can reload them from \"See older versions\"; clearing your browser data for the site removes them.",
    ],
    [
      "What algorithm does this diff checker use?",
      "A longest common subsequence (LCS) dynamic-programming matrix, implemented directly in the tool rather than pulled from a diff library. It builds an (n+1) x (m+1) match matrix and walks it backwards to emit each equal, added or deleted segment, which is the same classic technique used by Unix diff. Because the matrix is quadratic, it is best suited to snippets and documents rather than very large files.",
    ],
    [
      "Can I compare word by word or character by character instead?",
      "Yes — the mode dropdown offers Line, Word, Character and Semantic. Word mode splits on whitespace, Character mode compares individual characters, and Semantic mode groups the text by newline-separated blocks. Switching mode re-runs the diff instantly and updates the stat labels.",
    ],
    [
      "What does the similarity score mean?",
      "It is the percentage of content that matched: the combined length of unchanged segments divided by the total length of all segments, rounded to a whole number. The indicator dot turns green above 70%, amber above 40% and red at or below 40%, so near-identical texts read green and rewrites read red.",
    ],
    [
      "Can I upload two files to compare?",
      "Not currently — the tool works from pasted text in two boxes. To compare files, open each one, copy its contents, and paste them into the original and modified panes; the diff behaves the same way.",
    ],
    [
      "Can I download or copy the diff result?",
      "Yes. \"Download Diff\" builds the result in your browser and saves it as diff-result.txt, with + for added lines, - for deleted lines and two spaces for unchanged ones — the same prefix convention as a unified diff. Each input box also has a Copy button that copies that side to your clipboard.",
    ],
  ],
  steps: [
    "Paste the original version into the left box and the updated version into the right box.",
    "The diff runs automatically as you type — pick Line, Word, Character or Semantic mode, toggle Ignore Whitespace or Ignore Case, and switch between Split View and Unified View.",
    "Read the added, deleted and unchanged counts and the similarity score, then click Download Diff to save the result as diff-result.txt.",
  ],
};

export default seo;
