const seo = {
  title: "Batch API Savings Calculator: 50% Off LLM Token",
  metaDescription:
    "Price a bulk LLM job real-time versus batch at the published 50% discount, blend the share that can wait, and see monthly and annual savings.",
  steps: [
    "Enter Requests in the job, Jobs per month, Input tokens per request and Output tokens per request.",
    "Under Pricing set Real-time input rate (USD / 1M), the output rate, Batch discount (%) and Share of the job that can wait (%).",
    "Saving on this job shows against All real-time cost, with Blended cost, Monthly saving and Annual saving, then press Copy result.",
  ],
  intro:
    "Batch LLM endpoints sell the same tokens at a discount in exchange for asynchronous delivery: the discount applies to input and output alike, so batch cost = real-time cost × (1 − discount). This calculator prices a bulk job both ways, then blends them when only part of the workload can tolerate the wait — blended = real-time requests × per-request cost + batched requests × discounted cost. The published discount on the OpenAI Batch API, the Anthropic Message Batches API and Gemini batch mode is 50%, with a completion window of about 24 hours.",
  useCases: [
    "Decide whether a nightly classification job of a million rows should move off the synchronous endpoint.",
    "Show the saving when only 80% of a pipeline can wait and the rest must answer users live.",
    "Compare the annual saving of batching an eval suite against the engineering cost of building the job runner.",
  ],
  benefits: [
    ["Blended, not binary", "Prices a mixed workload instead of assuming everything can be made asynchronous."],
    ["Effective rates shown", "Reports the discounted per-million input and output rates you actually pay."],
    ["Scales to a month", "Multiplies one job by its monthly cadence for a run-rate and annual figure."],
  ],
  faqs: [
    [
      "How much cheaper is a batch API than a real-time API?",
      "50% on the major providers — OpenAI, Anthropic and Google all publish a half-price batch tier that applies to both input and output tokens. A job costing $9,000 synchronously costs $4,500 if the whole thing is batched.",
    ],
    [
      "How long does a batch API job take?",
      "The published target is completion within 24 hours of submission, and many jobs finish far sooner. There is no latency guarantee below that window, which is why batch suits offline work — enrichment, classification, evaluation, backfills — and not anything a user is waiting on.",
    ],
    [
      "Is batching worth it if only part of my workload can wait?",
      "The saving scales linearly with the batchable share. At a 50% discount, moving 80% of a workload to batch cuts the bill by 40%, and moving 50% cuts it by 25%. Weigh that against the one-off cost of building job submission, polling and partial-failure handling.",
    ],
    [
      "Can batch discounts stack with prompt caching?",
      "Not usefully in most cases. Batch jobs are queued and executed on the provider's schedule, so a cache written for one request is unlikely to still be warm for the next, and vendors generally do not apply cache-read pricing inside batch runs. Model the two savings separately rather than multiplying them.",
    ],
  ],
};

export default seo;
