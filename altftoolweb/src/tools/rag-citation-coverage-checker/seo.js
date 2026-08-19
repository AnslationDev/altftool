const seo = {
  title: "RAG Citation Checker: Claim-to-Source Map",
  metaDescription:
    "Splits an answer into claims and marks each linked, mixed, unknown or missing against your retrieval set. Structural check, not a support check.",
  steps: [
    "Paste the answer into Generated answer and the retrieval set into Retrieved sources — JSON, or one line per source as ID | passage — or use Open text for a .json or .txt file up to 1 MB.",
    "Press Check coverage to fill the Coverage, Claims, Linked, No citation, Unknown only and Sources tiles.",
    "Work down the Claim map, where each sentence reads Linked, Mixed references, Unknown references or No citation, then use Counts-only report to download rag-citation-coverage-report.json.",
  ],
  intro:
    "The RAG Citation Coverage Checker splits a generated answer into claim sentences and reports, for each one, whether it carries a citation marker that resolves to an ID in the retrieval set you paste alongside it. Every claim comes back as linked, mixed, unknown or missing, and the coverage figure is the share of claims carrying at least one recognised source ID, to one decimal place. This is a structural check for people evaluating RAG pipelines: it tells you whether a citation points at a real retrieved chunk, never whether that chunk actually supports the sentence.",
  useCases: [
    "A support-bot answer looks confident and you want to know how many of its sentences carry a citation at all before you ship the prompt change.",
    "You suspect the model is inventing source IDs, so you paste the retrieval set and look at the unknown count - claims citing an ID that was never retrieved.",
    "You are running an eval sweep and want a per-run JSON report of claim count, linked, missing, unknown and mixed to drop into a spreadsheet next to your other metrics.",
  ],
  benefits: [
    ["Four statuses, not pass or fail", "A claim is linked when every citation resolves, mixed when some resolve and some do not, unknown when none resolve, and missing when there is no citation at all."],
    ["Reads the retrieval set in either format", "Paste JSON - an array, an object keyed by ID, or a {sources: [...]} wrapper - or plain lines like \"S3 | passage text\", and IDs are matched case-insensitively with surrounding brackets stripped."],
    ["Skips text that is not a claim", "Headings, questions, a trailing \"Sources:\" block and fragments under four words are excluded outright, and leading list-marker syntax (bullets, numbering) is stripped from the remaining text, so the coverage denominator stays honest."],
  ],
  faqs: [
    [
      "How is the coverage percentage calculated?",
      "It is the number of claims with at least one recognised citation - the linked and mixed ones - divided by the total number of claim sentences, rounded to one decimal place. Claims whose only citations are unrecognised IDs count against you.",
    ],
    [
      "What citation formats does it detect?",
      "Square-bracket markers such as [3], [doc-12] or [a, b] with comma, semicolon or \"and\" separators, and parenthetical labels such as (source: S2) or (refs: 4, 5). An ID may be up to 160 characters of letters, digits and the separators _ . : / -",
    ],
    [
      "Does this verify that a source actually supports the claim?",
      "No. The check is purely structural - it confirms that a citation marker exists and matches an ID in the retrieval set you supplied. It cannot tell you the passage is relevant, the claim is true, or that the retrieval set was complete; that still needs human or model-based grading.",
    ],
    [
      "How large an answer and retrieval set can it handle?",
      "Up to 1,000,000 characters per input, 5,000 sources and 5,000 claims, with each source passage read to 100,000 characters. If anything is cut off, the result is flagged as truncated so you know the numbers are partial.",
    ],
  ],
};

export default seo;
