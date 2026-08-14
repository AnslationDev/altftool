const seo = {
  title: "AI Cost Per Document Calculator: Tokens, OCR, Chunks",
  metaDescription:
    "Price a document AI pipeline: pages and words become tokens at 0.75 words per token, plus chunk overlap, per-chunk prompts, passes, OCR and embedding.",
  steps: [
    "Enter Pages per document, Words per page, Chunk size in tokens, Overlap between chunks (tokens), Instruction tokens per chunk, Output tokens per pass and Passes over the document.",
    "Set the rates in your chosen currency: Input price per 1M tokens, Output price per 1M tokens, OCR / parse cost per page and Embedding price per 1M tokens.",
    "Read the cost per document, per page and per 1,000 documents, the monthly cost at that volume, and the share taken by model input, model output, OCR and embedding; press \"Copy result\".",
  ],
  intro:
    "The Cost Per Document Processed Calculator turns pages and words per page into tokens using the standard English estimate of about 0.75 words per token (roughly four characters), then adds everything a real pipeline bills for: chunk overlap repeated between neighbouring chunks, instruction tokens sent with each chunk, extra verification passes, OCR per page and embedding for search. It reports cost per document, per page, per thousand documents and per month, with a breakdown showing which line dominates. Useful for anyone pricing invoice extraction, contract review, claims processing or a RAG ingest.",
  useCases: [
    "Price an invoice-extraction pipeline before committing to a monthly volume with a client.",
    "See whether chunk overlap and per-chunk instructions are quietly doubling your input bill.",
    "Compare a single extraction pass against extraction plus a verification pass on the same documents.",
    "Decide whether OCR or the model is the expensive part of a scanned-document workflow.",
  ],
  benefits: [
    ["Pipeline-accurate", "Counts overlap, per-chunk prompts and multiple passes, not just the raw document tokens."],
    ["Cost breakdown", "Shows what share comes from input, output, OCR and embedding, so you optimise the right line."],
    ["Volume view", "Per document, per page, per thousand and per month from one set of inputs."],
  ],
  faqs: [
    [
      "How many tokens is a page of text?",
      "For ordinary English prose, about 0.75 words per token means a 500-word page is roughly 667 tokens, so a 12-page document lands near 8,000 tokens. Dense tables, code and most non-English scripts use noticeably more tokens per word, so measure a real sample with your tokeniser before pricing at scale.",
    ],
    [
      "How much does it cost to process a document with AI?",
      "It depends on length and pipeline, not just the model. A 12-page document chunked at 2,000 tokens with 200-token overlap, a 300-token instruction per chunk and a 700-token structured output costs about 0.04 in model calls at 3 and 15 per million tokens — with OCR at 0.0015 a page the total is closer to 0.059.",
    ],
    [
      "Does chunk overlap increase cost?",
      "Yes, directly. Every overlap window is billed again as part of the next chunk, so a document split into four chunks with 200-token overlap pays for 600 extra input tokens on each pass. Overlap improves retrieval quality at chunk boundaries, so the question is whether that quality is worth the percentage it adds to your input bill.",
    ],
    [
      "How do I reduce the cost of a document AI pipeline?",
      "Attack the largest line first — this calculator shows which one it is. Common wins are cutting overlap, moving the verification pass to a cheaper model, shortening the per-chunk instruction, embedding once rather than on every reprocess, and skipping OCR for documents that already contain a text layer.",
    ],
  ],
};

export default seo;
