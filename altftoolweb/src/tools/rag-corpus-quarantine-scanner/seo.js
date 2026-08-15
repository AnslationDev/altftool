const seo = {
  title: "RAG Corpus Quarantine Scanner: Injection & Hidden Text",
  metaDescription:
    "Scan up to 30 .txt, .md, .html, .csv or .json files for prompt-injection phrasing, zero-width characters, risky links and duplicates before you index.",
  steps: [
    "Press Choose files for up to 30 .txt, .md, .html, .csv or .json documents, 2 MB each and 10 MB per batch.",
    "Press Scan corpus locally to classify each file as quarantine suggested, review suggested or no configured signals.",
    "Read the duplicate groups and severity totals, then press Download report for rag-corpus-quarantine-counts-only.txt.",
  ],
  intro:
    "The RAG Corpus Quarantine Scanner reads .txt, .md, .html, .csv and .json files as inert text in your browser and flags deterministic review signals before you index them: prompt-injection phrasing, hidden Unicode and hidden or active HTML, suspicious links, and duplicate documents. Each file is classified as quarantine suggested when a high-severity signal fires, review suggested when only lower-severity or ambiguous signals appear, or no configured signals. It is a triage step for anyone loading third-party or scraped documents into a retrieval index - the output is a review queue, not a verdict on whether a file is malicious.",
  useCases: [
    "You scraped a few hundred help-centre pages and want to check the batch for instruction-override phrasing and zero-width characters before the embedding job runs.",
    "A vendor sends a knowledge pack as HTML and you want to know whether it contains script or iframe tags, aria-hidden blocks, or comment text that a reader would never see but a chunker would ingest.",
    "Your index keeps returning near-identical passages, so you check which uploaded files are exact duplicates and which only match after markup and invisible characters are stripped.",
  ],
  benefits: [
    ["Two kinds of duplicate, reported separately", "Exact byte-identical matches are grouped apart from normalized matches, where files differ only by markup, entities, whitespace or invisible characters after NFKC folding."],
    ["Links inspected, never followed", "URLs are parsed to flag embedded credentials, javascript:, data:text/html and file:// schemes, punycode hosts, private-network and raw-IP targets, shorteners, executable file endings and token-like query parameters - without any request being made."],
    ["A shareable report with no content in it", "The counts-only export lists files, classifications, severity totals, categories and duplicate groups, and deliberately excludes filenames, corpus text, matched snippets and URLs."],
  ],
  faqs: [
    [
      "What file types and sizes can I scan?",
      "Plain text, Markdown, HTML, CSV and JSON, up to 30 files at 2 MB each and 10 MB in total per batch. Each file is scanned to a limit of 500,000 characters, and anything beyond that is flagged as truncated coverage rather than silently skipped.",
    ],
    [
      "What makes a file get marked \"quarantine suggested\"?",
      "At least one high-severity signal - for example an active URL scheme such as javascript: or file://, a URL carrying embedded credentials, or a script, iframe, object or embed tag in an HTML file. Any lower-severity signal on its own downgrades the file to review suggested instead.",
    ],
    [
      "Does a clear result mean the file is safe to index?",
      "No. It means no configured rule matched. These are deterministic pattern checks, so novel phrasing, obfuscation or context-specific risks can pass through - treat a clear result as the absence of known signals, not as an assurance.",
    ],
    [
      "Is my corpus uploaded or rendered anywhere?",
      "No. Files are read as inert text in your own browser: no HTML is rendered, no link is followed, no resource is fetched, nothing is uploaded, and nothing is kept after you leave the page.",
    ],
  ],
};

export default seo;
