const seo = {
  intro:
    "This calculator projects monthly OpenAI GPT API spend from three numbers — requests per day, average input tokens and average output tokens per request — multiplied by the model's per-1M-token input and output rates. It models the cached-input discount and the Batch API's 50% rate, and every preset rate is editable so teams can match the live OpenAI pricing page exactly before committing to a budget.",
  useCases: [
    "A startup sizing the monthly bill for a GPT-powered chatbot before choosing between GPT-5.1, GPT-5 mini and GPT-4o mini",
    "An engineer estimating how much a 60% prompt-cache hit rate would cut from an agent workload's input costs",
    "A team deciding whether moving nightly classification jobs to the Batch API is worth the 50% discount",
  ],
  benefits: [
    ["Token-accurate maths", "Bills input and output tokens separately at per-1M rates, the way OpenAI actually invoices."],
    ["Cache and batch modelled", "Applies the cached-input rate to your cache-hit share and the 50% Batch API discount."],
    ["Editable rates", "Presets load current published prices, and every rate field can be overridden when prices change."],
  ],
  faqs: [
    [
      "How is OpenAI GPT API pricing calculated?",
      "Per token, with separate rates for input (prompt) and output (completion) tokens quoted in dollars per 1 million tokens. Your cost per request is input tokens times the input rate plus output tokens times the output rate, divided by one million — so a 1,000-token prompt with a 500-token answer on a $1.25/$10 model costs about $0.00625.",
    ],
    [
      "What is cached input pricing on the OpenAI API?",
      "When the beginning of your prompt repeats across requests, OpenAI's automatic prompt caching serves those tokens at a discounted cached-input rate — for several GPT-5 family models that is 10% of the normal input price. A workload with a stable system prompt and a high cache-hit share can cut input costs substantially without any code change beyond keeping the prompt prefix identical.",
    ],
    [
      "How much cheaper is the OpenAI Batch API?",
      "50%. Batch requests are processed asynchronously within a 24-hour window and bill both input and output tokens at half the standard rate, which suits evaluations, backfills and nightly classification jobs that do not need an immediate response.",
    ],
    [
      "How many tokens is a typical API request?",
      "Roughly 4 characters or 0.75 English words per token, so a 300-word prompt is about 400 tokens. Real workloads vary widely — system prompts, conversation history and JSON structure all count as input tokens — so measure your own averages from the usage field in API responses rather than guessing.",
    ],
  ],
};

export default seo;
