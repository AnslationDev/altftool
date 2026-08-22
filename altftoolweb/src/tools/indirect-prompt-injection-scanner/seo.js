const seo = {
  title: "Prompt Injection Scanner for Untrusted Content",
  metaDescription:
    "Scans up to 500,000 characters of HTML, Markdown, CSV or text for hidden instructions and bidi Unicode, scoring each match with its line and column.",
  steps: [
    "Paste into 'Content to inspect' — up to 500,000 characters are scanned — and set Input format to HTML, Markdown, CSV or text, or use Load sample.",
    "Press Scan locally to match instruction-override phrases, fake role markers, CSS-hidden markup, instruction-bearing comments and zero-width or bidirectional Unicode.",
    "Read the Score /100 with the Signals, High, Medium and Low metrics and each finding's line and column, then press Download report for indirect-prompt-injection-scan.txt.",
  ],
  intro:
    "Indirect Prompt Injection Scanner reads pasted HTML, Markdown, CSV or plain text and flags the patterns used to smuggle instructions into an AI system: instruction-override phrases, fake system and developer role markers, secret-disclosure and exfiltration requests, tool-activation commands, CSS-hidden markup, instruction-bearing HTML comments, and invisible or bidirectional Unicode. Each match is scored by severity — 18 points for high, 9 for medium, 4 for low, capped at 100 — and reported with its line, column and surrounding evidence, with zero-width characters rendered as visible [U+200B ZERO WIDTH SPACE] style labels. Matches are review signals for a human, not proof that content is malicious or safe.",
  useCases: [
    "You are about to feed a scraped web page or a vendor PDF's extracted text into a tool-using agent, and want to know first whether it contains a hidden 'ignore all previous instructions' block or a white-on-white div.",
    "A support ticket or a submitted CV renders normally but behaves oddly in your summarisation pipeline — paste the raw source to see whether an HTML comment or a zero-width-split keyword is doing the work.",
    "Reviewing a RAG corpus before indexing it: run each untrusted document through and triage anything scoring at elevated review priority before it can be retrieved into a model's context.",
  ],
  benefits: [
    ["Makes invisible characters visible", "Zero-width spaces, joiners, soft hyphens and bidi overrides are replaced with named code-point labels, so you can see text your editor renders as nothing."],
    ["Line and column on every finding", "Each signal comes with its position and about 70 characters of context either side, so you can go straight to the spot in the original source."],
    ["Comments are judged on content, not existence", "An HTML or Markdown comment is only flagged when it actually contains instruction or secret-related language, which keeps ordinary build comments out of the results."],
  ],
  faqs: [
    [
      "What is indirect prompt injection?",
      "It is an attack where malicious instructions are planted in content an AI system will later read — a web page, an email, a document, a database row — rather than typed by the user. The model treats the retrieved data as instructions, which is why hidden text in a page can make an agent leak a system prompt or call a tool.",
    ],
    [
      "Does a clean scan mean the content is safe?",
      "No. The scanner matches a fixed set of heuristic rules, so novel phrasing, another language, or an encoded payload can pass with a score of zero. Treat a clean result as the absence of known signals, and keep treating all external content as data rather than instructions.",
    ],
    [
      "How much text can it scan at once?",
      "Up to 500,000 characters, and it reports at most 200 findings; anything beyond either limit is flagged as truncated or capped in the result. Format is auto-detected as HTML, Markdown, CSV or plain text, and you can override the detection.",
    ],
    [
      "Is the content I paste uploaded anywhere?",
      "No. The scan runs entirely in your browser — the text is never fetched, executed, uploaded, or persisted, and the downloadable report is generated locally from the same pasted text. That matters because the documents most worth scanning are often the ones you cannot send to a third party.",
    ],
  ],
};

export default seo;
