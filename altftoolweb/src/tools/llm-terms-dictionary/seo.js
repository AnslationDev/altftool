const seo = {
  metaDescription:
    "List the LLM terms your team keeps hitting — temperature, top-p, RAG, embeddings — pick an audience and depth, and copy a definition brief.",
  steps: [
    "Enter the terms one per line in the \"LLM terms\" box — temperature, context window, RAG and embeddings are prefilled.",
    "Set \"Audience\" to who is reading, then pick a \"Depth\": Plain beginner, Practical operator or Technical concise.",
    "Read the \"Dictionary brief\" panel — one bullet per term covering the one-sentence definition, why it matters and a \"when to change it\" example — then press \"Copy output\".",
  ],
  intro:
    "LLM Terms Dictionary is an A–Z reference of 52 large-language-model terms — token, context window, temperature, top-p, RAG, LoRA, quantisation, hallucination and the rest — where each entry gives a standalone definition, a concrete example, and a practical tip with a typical value where one exists. Entries are tagged by kind (core concept, sampling setting, technique, training method, serving, failure mode, metric) and are searchable by headword or by the API parameter name you actually see in the docs, so looking up \"top_p\" or \"BPE\" finds the right page. It also includes a context-budget check that estimates prompt size at roughly one token per four characters and tells you whether prompt plus reserved answer fits your model's window.",
  useCases: [
    "Reading an API reference and hitting top_p, frequency_penalty or logprobs for the first time, and wanting a one-paragraph answer with a sensible default value",
    "Checking before a call whether a 40,000-character document plus a 1,000-token answer will fit in a 32,000-token context window",
    "Settling a team disagreement about what 'fine-tuning' covers versus RAG or a system prompt, with the distinctions written down rather than argued from memory",
  ],
  benefits: [
    ["Searchable by the parameter name, not just the concept", "Every entry carries aliases — top_p, BPE, developer message — so the term you saw in a request body leads to the explanation."],
    ["Each definition stands on its own", "Meaning, a worked example with real numbers, and what to actually do with the setting, rather than a circular one-line gloss."],
    ["A budget check next to the vocabulary", "The context-window entry comes with a calculator that turns your prompt text into an estimated token count and percentage of the window used."],
  ],
  faqs: [
    [
      "How many characters are in a token?",
      "About four characters of ordinary English prose per token, or roughly 750 words per 1,000 tokens — the vendor rule of thumb this tool's estimator uses. Code, numbers, rare words and non-Latin scripts split into noticeably more tokens than that, so treat the figure as a planning estimate, never a billing number.",
    ],
    [
      "What is the difference between temperature and top-p?",
      "Temperature rescales the whole probability distribution before sampling, while top-p truncates it to the smallest set of tokens whose probabilities sum to p and samples only from that set. Both control randomness, which is why the usual advice is to tune one and leave the other at its default rather than lowering both at once.",
    ],
    [
      "What exactly counts toward the context window?",
      "Everything in one request shares the same budget: the system prompt, the full conversation history you resend, any retrieved documents, and the answer the model is about to generate. A 128,000-token window holding a 120,000-token document leaves only 8,000 tokens for the reply, which is why the calculator asks you to reserve the answer size up front.",
    ],
    [
      "Are token counts the same across different models?",
      "No — each model family has its own tokenizer, so the same paragraph might be 210 tokens for one and 260 for another. Counts are only comparable within a single model family, and reusing another model's count to plan a budget is a common way to overrun a context window.",
    ],
  ],
};

export default seo;
