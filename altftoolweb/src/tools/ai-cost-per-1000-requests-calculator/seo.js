const seo = {
  title: "AI Cost Per 1000 Requests Calculator",
  metaDescription:
    "Convert $/million-token rates into cost per request, per 1,000 and per month — with retries, prompt-cache hits and a five-tier price comparison.",
  steps: [
    "Fill the Request profile: 'Input tokens per request', 'Output tokens per request', 'Retry rate (%)' and 'Requests per month'.",
    "Enter your Rates (USD per 1M tokens) — Input rate, Output rate, Cached input rate and 'Prompt cache hit rate (%)' — or tap a tier chip from Frontier to Nano to fill them.",
    "Read the 'Cost per 1,000 requests' headline with per-request, monthly and annual rows plus the 'Same request across price tiers' table, then click 'Copy result'.",
  ],
  intro:
    "This calculator converts per-million-token AI pricing into the number engineers actually budget with: cost per 1,000 requests. The formula is (input tokens x input rate + output tokens x output rate) / 1,000,000 per request, adjusted for the share of input served from a prompt cache and for billed retries — then compared side by side across five capability tiers from frontier to nano so you can see what stepping down a model tier saves.",
  useCases: [
    "A product manager translating a vendor's $3/$15 per-million-token quote into a per-1,000-requests figure for a pricing spreadsheet",
    "An engineer checking how a 5% retry rate and a 70% cache-hit rate change the real cost of a production endpoint",
    "A team comparing what the same 1,500-token workload costs on a frontier, flagship, mid, small and nano tier model before choosing one",
  ],
  benefits: [
    ["One-line conversion", "Turns dollars-per-million-token quotes into per-request, per-1,000 and per-million costs instantly."],
    ["Retries and caching included", "Failed attempts are still billed and cached input is cheaper — both are in the maths, not a footnote."],
    ["Five-tier comparison", "Shows the identical workload priced across representative frontier to nano rate bands."],
  ],
  faqs: [
    [
      "How do I convert per-million-token pricing to cost per 1,000 requests?",
      "Multiply your average input tokens by the input rate and output tokens by the output rate, divide by one million, then multiply by 1,000. Example: 1,200 input and 350 output tokens at $0.15 and $0.60 per million tokens costs $0.00039 per request, which is $0.39 per 1,000 requests.",
    ],
    [
      "Why is cost per 1,000 requests more useful than price per token?",
      "Because request volume is the number teams actually forecast — a support bot handles conversations, not tokens. Once token sizes per request are measured, cost per 1,000 requests maps directly onto traffic projections and per-user unit economics, which per-token rates do not.",
    ],
    [
      "Do failed or retried API requests still cost money?",
      "Yes. Timeouts discovered after the model responded, rate-limit retries, refusals and schema-validation failures all bill the tokens of the failed attempt, so a 5% retry rate raises the whole bill by 5%. This calculator applies the retry percentage as a multiplier on every cost component.",
    ],
    [
      "Why do output tokens dominate my AI API bill?",
      "Output tokens typically cost 4 to 5 times more than input tokens per unit — $15 versus $3 per million is a common ratio. If your requests generate long completions, the output line can be most of the bill even when prompts are much larger than responses; capping response length and trimming verbosity are the quickest savings.",
    ],
  ],
};

export default seo;
