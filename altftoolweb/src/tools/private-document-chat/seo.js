const seo = {
  intro:
    "This tool builds a searchable index of your own documents inside the browser and answers a question by returning the exact passages that match it, each labelled with its source file and section — it retrieves, it never generates. Text is split into roughly 1,200-character chunks with 160 characters of overlap at sentence and line boundaries, then ranked with BM25 (k1 = 1.2, b = 0.75) plus bonuses for covering more of your query terms and for containing the query as a literal phrase. It suits anyone who wants to search a contract, a policy pack or research notes without uploading them to a cloud model.",
  useCases: [
    "You have a 60-page lease and need the exact clause about the notice period, quoted verbatim, to paste into an email.",
    "Handover from a colleague left you eight scattered spec and meeting-note files and you need to find which one defines the retry behaviour.",
    "A researcher searching interview transcripts for every passage mentioning a term, with the transcript name and section attached to each hit.",
  ],
  benefits: [
    ["Every excerpt carries a citation", "Each result names the source document and the section it came from, so you can verify the passage against the original."],
    ["Nothing is paraphrased", "The output is the document's own text, ranked — there is no model to hallucinate a clause that was never written."],
    ["Ranks by relevance, not just keyword hits", "BM25 scoring, term-coverage weighting and an exact-phrase bonus push the passage that actually answers the question to the top."],
  ],
  faqs: [
    [
      "What file types can I search?",
      "TXT, Markdown (.md/.markdown), CSV, JSON, text-based PDF and DOCX. Scanned or image-only PDFs will not work because there is no OCR step — the text has to already be selectable in the file.",
    ],
    [
      "How many documents can I load at once?",
      "Up to 8 documents, each 8 MB or smaller, with a 20 MB combined limit. The index is additionally capped at 250,000 characters per document, 500,000 characters in total, and 2,000 chunks.",
    ],
    [
      "Does it answer my question, or just find text?",
      "It finds text. The tool returns up to 8 ranked source excerpts and does not summarise, infer, or verify them, which is why nothing it shows can be a fabricated answer. Reading and judging the passages is your part.",
    ],
    [
      "Is anything sent to a server or an AI provider?",
      "No. Extraction, indexing and retrieval all run as JavaScript in the page, with no cloud model involved. The optional session report is counts-only — it records how many documents, chunks and searches there were, and deliberately excludes file names, questions, excerpts and document text.",
    ],
  ],
};

export default seo;
