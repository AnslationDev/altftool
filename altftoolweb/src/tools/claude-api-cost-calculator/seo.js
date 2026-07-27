const seo = {
  intro:
    "This calculator projects Anthropic Claude API spend from requests per day and average input and output tokens per request, priced at each model's per-1M-token rates. It models Claude's full billing surface: prompt-cache reads at roughly 0.1x the input rate, cache writes at a 1.25x (5-minute TTL) or 2x (1-hour TTL) premium, and the Message Batches API's 50% discount — with every rate editable so estimates track the live pricing page.",
  useCases: [
    "A team comparing the monthly bill for the same workload on an Opus-tier, Sonnet-tier and Haiku-tier Claude model before committing",
    "An engineer with a large stable system prompt estimating how an 80% cache-read share changes an agent's input costs",
    "A data team weighing whether to move overnight summarisation jobs to the Message Batches API for the 50% discount",
  ],
  benefits: [
    ["Real Claude billing model", "Separate input and output rates with cache reads at 0.1x and TTL-dependent write premiums."],
    ["Cache economics visible", "Shows the monthly saving your cache-read and cache-write mix produces versus running uncached."],
    ["Editable presets", "Loads published Opus, Sonnet and Haiku rates and lets you override any figure when prices change."],
  ],
  faqs: [
    [
      "How much does the Claude API cost per million tokens?",
      "On Anthropic's first-party API, Opus-tier models (Claude Opus 5, Opus 4.8) list at $5 per million input tokens and $25 per million output tokens, Sonnet-tier models at $3/$15, and Claude Haiku 4.5 at $1/$5. Prices change with model releases and differ on Amazon Bedrock and Vertex AI, so confirm against Anthropic's pricing page before budgeting.",
    ],
    [
      "How does Claude prompt caching affect cost?",
      "Cache reads bill at about 0.1x the base input rate, while cache writes carry a premium — 1.25x for the default 5-minute TTL and 2x for the 1-hour TTL. With the 5-minute TTL a cached prefix pays for itself from the second request (1.25x + 0.1x is cheaper than 2x uncached), so workloads with a stable system prompt and steady traffic save the most.",
    ],
    [
      "What is the Claude Message Batches API discount?",
      "50% off both input and output tokens. Batches process asynchronously — most complete within an hour, with a 24-hour maximum — which suits evaluations, backfills and other jobs that do not need an immediate response.",
    ],
    [
      "Do Claude thinking tokens cost extra?",
      "Thinking tokens bill as ordinary output tokens at the model's output rate — there is no separate thinking price. Because output typically costs five times the input rate, workloads that trigger deep reasoning can see output become the dominant cost line; the effort setting is the main lever for controlling it.",
    ],
  ],
};

export default seo;
