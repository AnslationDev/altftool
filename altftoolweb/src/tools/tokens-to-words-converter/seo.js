const seo = {
  title: "Tokens to Words Converter: Budget to Words",
  metaDescription:
    "Turn an LLM token budget into words, pages and reading time at ~0.75 words per token, with presets for prose, technical text, other languages and code.",
  steps: [
    "Type a figure into Token budget, or tap one of the presets: 1,024, 4,096, 8,192, 32,768 or 128,000.",
    "Pick a Content type — Plain English prose, Technical / jargon-heavy writing, Non-English European language or Source code / JSON — and a Page convention of single-spaced (~500 words) or double-spaced (~250 words).",
    "Read \"Approximate words\" with the character count, page count and reading time at 238 words/min, then press Copy result.",
  ],
  intro:
    "This converter turns an LLM token budget into an approximate word count, page count and reading time, based on the documented rule of thumb that 1 token equals about three-quarters of an English word (4 characters). It helps writers, students and developers answer the practical question behind every context window and max-token setting: how much actual text does this budget hold? Presets adjust the ratio for technical writing, non-English languages and source code, which all tokenize more heavily than plain prose.",
  useCases: [
    "A writer checking whether a 4,096-token output limit is enough for a 3,000-word article draft",
    "A developer explaining to stakeholders how much documentation fits in a 128k-token context window",
    "A student converting a model's max-token setting into single-spaced or double-spaced page equivalents for an assignment",
  ],
  benefits: [
    ["Content-aware ratios", "Separate presets for prose, technical text, European languages and code, since each yields fewer words per token."],
    ["Pages and reading time", "Converts to ~500-words single-spaced or ~250-words double-spaced pages, plus minutes at an average 238 wpm reading speed."],
    ["Instant budget presets", "One-tap buttons for common budgets: 1,024, 4,096, 8,192, 32,768 and 128,000 tokens."],
  ],
  faqs: [
    [
      "How many words is 4,096 tokens?",
      "About 3,072 words of plain English text, using the rule of thumb that 1 token is roughly three-quarters of a word. For technical writing expect closer to 2,450 words, and for source code as little as 1,600, because both tokenize more heavily than everyday prose.",
    ],
    [
      "How many pages is 128,000 tokens?",
      "Roughly 96,000 English words, which is about 192 single-spaced pages (at ~500 words per page) or 384 double-spaced pages — approximately the length of a full novel. That is why 128k-context models can hold entire books or large codebases in a single prompt.",
    ],
    [
      "How many words is one token?",
      "About 0.75 English words per token — equivalently, 1,000 tokens is roughly 750 words — per OpenAI's tokenizer documentation. The figure drops for other content: non-English European languages often land near 0.55 words per token and source code near 0.4, since punctuation and rare strings split into more tokens.",
    ],
    [
      "Does a token budget cover both my prompt and the model's answer?",
      "Input and output are counted separately by every major provider, and most price output tokens higher than input tokens. A model's context window limits input plus output together, while a max-tokens setting usually caps only the generated output — so convert the two budgets separately.",
    ],
  ],
};

export default seo;
