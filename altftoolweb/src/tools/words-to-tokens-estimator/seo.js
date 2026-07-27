const seo = {
  intro:
    "This estimator converts a planned word count into an LLM token estimate before any text exists, using the documented rule of thumb of about 4/3 tokens per English word (1 token ≈ 4 characters). It answers the budgeting question writers and developers hit constantly: how many tokens will my 1,000-word brief, prompt or document cost? Content-type presets raise the ratio for technical writing, non-English European languages and source code, and a configurable safety margin turns the estimate into a budget you can set limits against.",
  useCases: [
    "A developer sizing a max-tokens setting for a summarisation feature that ingests 2,000-word articles",
    "A content agency estimating monthly token consumption from its planned word output before picking an API pricing tier",
    "A prompt writer checking that a 5,000-word context document will fit under a model's input limit with room to spare",
  ],
  benefits: [
    ["Estimate before writing", "Works from the planned word count alone — no text sample needed."],
    ["Content-aware ratios", "Prose at ~1.33 tokens per word, technical text at ~1.67, European languages at ~1.8 and code at ~2.5."],
    ["Built-in safety margin", "Adds a configurable buffer (default 10%) so the number you budget survives tokenizer variance."],
  ],
  faqs: [
    [
      "How many tokens is 1,000 words?",
      "About 1,334 tokens for plain English prose, using the documented ratio of roughly 4/3 tokens per word. Technical writing runs closer to 1,670 tokens, non-English European languages around 1,800, and source code as high as 2,500 tokens for the same nominal word count.",
    ],
    [
      "How many tokens is 500 words?",
      "Roughly 667 tokens of plain English — the word count times 1.33. With this tool's default 10% safety margin, you would budget about 734 tokens to be safe against tokenizer variance.",
    ],
    [
      "Why do I need a safety margin on a token estimate?",
      "Because character-based rules of thumb are typically only accurate to within 10–15% for English prose, and worse for unusual vocabulary. A 10% buffer is a common convention: it keeps a request from being truncated or rejected when the real tokenizer counts slightly higher than the estimate.",
    ],
    [
      "Do words in other languages use more tokens?",
      "Yes. BPE tokenizers are trained mostly on English, so German, French or Spanish text typically costs 1.5 to 2 times more tokens per word, and non-Latin scripts such as Hindi or Japanese can cost several times more. If your workload is multilingual, estimate each language separately rather than applying the English ratio.",
    ],
  ],
};

export default seo;
