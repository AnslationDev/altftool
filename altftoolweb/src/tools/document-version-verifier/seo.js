const seo = {
  intro:
    "The Document Version Verifier compares two versions of the same document in the browser: it extracts the text layer from PDF, DOCX, TXT, JSON, CSV, HTML, XML or Markdown, runs a line-level diff between them, and independently fingerprints each file with CRC32, MD5, SHA-1, SHA-256 and SHA-512 so a byte-identical pair is proved by a matching SHA-256 rather than by eye. Alongside the diff it scores tampering cues out of 100 — author or creating-software changes, a created date later than the modified date, a drop in page count, zero-width hidden characters, embedded scripts — and reports Low, Medium, High or Critical risk. Files are read locally and never uploaded.",
  useCases: [
    "A signed contract comes back from the other side described as 'the same version', and you need SHA-256 confirmation of that plus a line diff of anything that actually moved.",
    "Two PDFs of a policy have the same filename and date, and you want to know which one has fewer pages and whether the metadata author changed between them.",
    "A submitted document looks clean but you suspect hidden formatting, so you check for zero-width characters in the text layer before passing it on.",
  ],
  benefits: [
    [
      "Five hash algorithms, not one",
      "CRC32, MD5, SHA-1, SHA-256 and SHA-512 are all computed locally, so you can match whatever checksum a counterparty already published while relying on SHA-256 for the actual verdict.",
    ],
    [
      "Tampering cues scored, not just listed",
      "Each signal adds a weighted amount to a capped 100-point tamper score — for instance 35 points when version B claims a creation date before version A — which rolls up into a Low to Critical risk level.",
    ],
    [
      "Normalisation you declare up front",
      "Line-ending, trailing-whitespace and whitespace-collapsing options are optional and disclosed with the result, so you always know which differences the diff was told to ignore.",
    ],
  ],
  faqs: [
    [
      "How do I check if two documents are identical?",
      "Compare their SHA-256 hashes: if the two digests match, the files are byte-for-byte identical and the tamper score is 0 with risk level None. Matching file sizes or a diff showing no visible changes is weaker evidence, because formatting and metadata differences can sit outside the text layer.",
    ],
    [
      "What file types and sizes can it handle?",
      "PDF, DOCX, DOC, RTF, TXT, Markdown, JSON, CSV, HTML and XML, up to 200 MB per file, with PDF text extraction bounded to the first 100 pages. Each comparison representation is capped at 250,000 characters and 3,000 lines.",
    ],
    [
      "What counts as a tampering signal?",
      "An author mismatch adds 25 points, a change of creating software 15, a reduced page count 20, zero-width or hidden characters 25, embedded scripts or macros 30, and an impossible timestamp 30 to 35. A total of 60 or more is reported as Critical, 35 to 59 High, and 15 to 34 Medium.",
    ],
    [
      "Does a high tamper score prove a document was forged?",
      "No. The score flags cues that deserve a human look — many have innocent explanations, such as a file re-saved in different software or converted between formats. Treat it as a prompt to check provenance, and for anything legally or financially significant get the document examined properly.",
    ],
  ],
};

export default seo;
