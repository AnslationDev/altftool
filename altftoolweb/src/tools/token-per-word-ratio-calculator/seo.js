const seo = {
  intro:
    "This calculator measures your text's tokens-per-word ratio — the number LLM billing actually depends on — from a pasted sample, using the published rule of thumb that 1 token equals about 4 characters or three-quarters of an English word. Writers, prompt engineers and developers use the ratio to convert word counts into token budgets for models like GPT and Claude. If you already have an exact count from tiktoken or a provider's token counter, enter it to get the true ratio for your writing style.",
  useCases: [
    "A prompt engineer measuring whether their system prompts tokenize heavier than plain English before setting max-token limits",
    "A content team converting a 2,000-word article brief into a realistic token budget for an AI drafting workflow",
    "A developer comparing the ratio of code snippets versus prose to explain why code-heavy prompts cost more",
  ],
  benefits: [
    ["Real ratio, not a guess", "Enter an actual tokenizer count for your sample and get the exact tokens-per-word figure for your own writing."],
    ["Baseline comparison", "Shows how far your text sits above or below the ~1.33 tokens-per-word English baseline, as a percentage."],
    ["Budget-ready output", "Reports tokens per 1,000 words so any word-count brief converts straight to a token budget."],
  ],
  faqs: [
    [
      "How many tokens is one word?",
      "About 1.33 tokens per word for common English text — OpenAI's tokenizer documentation puts it at roughly 1 token per 4 characters, or three-quarters of a word per token. Technical vocabulary, source code and non-Latin scripts run higher, often 1.5 to 3 tokens per word, which is why measuring your own text beats using the average.",
    ],
    [
      "Why is my tokens-per-word ratio higher than 1.33?",
      "Because BPE tokenizers split uncommon words, punctuation runs, markup and non-English characters into multiple tokens. Code and JSON commonly land between 1.5 and 3 tokens per word, and languages like Hindi or Japanese can be several times heavier than English on older tokenizers.",
    ],
    [
      "How do I convert a word count into a token budget?",
      "Multiply the word count by your tokens-per-word ratio. Using the English baseline, 1,000 words is about 1,330 tokens; if this tool measures your text at 1.6 tokens per word, budget 1,600 tokens per 1,000 words instead. Add headroom for the model's reply, which is billed separately as output tokens.",
    ],
    [
      "Is the character-based token estimate accurate?",
      "It is a rule-of-thumb estimate, typically within about 10–15% for plain English prose, and less accurate for code or non-English text. For exact numbers, run the sample through the model's real tokenizer (such as OpenAI's tiktoken or a provider's count-tokens endpoint) and paste the result into this tool's actual-token field.",
    ],
  ],
};

export default seo;
