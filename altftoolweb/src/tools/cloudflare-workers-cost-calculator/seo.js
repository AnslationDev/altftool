const seo = {
  title: "Cloudflare Workers Cost Calculator (Paid Plan + KV)",
  metaDescription:
    "Estimate the $5 Workers Paid plan bill from monthly requests and CPU-ms, plus Workers KV reads, writes, lists and storage — egress is free.",
  steps: [
    "Enter Worker requests (millions/month) and Average CPU time per request (ms) — only CPU time bills; waiting on fetch() is free.",
    "Add any Workers KV usage: reads, writes, deletes and list operations in millions per month, plus KV stored data (GB).",
    "Read the estimated monthly bill itemised into base plan, request and CPU-time overage and KV lines, then click Copy result.",
  ],
  intro:
    "This calculator estimates a Cloudflare Workers Paid plan bill: $5/month base including 10 million requests and 30 million CPU-milliseconds, with overage at $0.30 per million requests and $0.02 per million CPU-ms, plus Workers KV metering ($0.50 per million reads, $5 per million writes, $0.50 per GB-month stored beyond the included allowances). It is for developers moving APIs and edge logic onto Workers who want to see the bill before the traffic arrives.",
  useCases: [
    "Pricing an edge API expecting 50 million requests a month at around 5 ms of CPU each",
    "Checking how a KV-backed feature-flag store with heavy reads but few writes affects the bill",
    "Comparing the Workers Paid total against a container platform for the same request volume",
  ],
  benefits: [
    ["CPU-time billing modelled", "Charges only CPU-ms, matching Workers' model where fetch wait time is free."],
    ["Full KV metering", "Reads, writes, deletes, lists and storage each priced with their own allowance."],
    ["Zero egress", "No bandwidth line item — Workers responses carry no per-GB egress fee."],
  ],
  faqs: [
    [
      "How much does Cloudflare Workers cost?",
      "The Workers Paid plan is $5/month and includes 10 million requests and 30 million CPU-milliseconds. Beyond that, requests bill at $0.30 per million and CPU time at $0.02 per million CPU-milliseconds; the free plan instead allows 100,000 requests per day with a 10 ms CPU limit per invocation.",
    ],
    [
      "Does Cloudflare Workers charge for bandwidth?",
      "No — there is no per-GB egress fee on Workers responses, unlike AWS Lambda behind API Gateway where data transfer out starts at $0.09/GB. You pay only for requests and CPU time, which is why bandwidth-heavy APIs are often much cheaper on Workers.",
    ],
    [
      "What counts as CPU time on Workers?",
      "Only time the CPU actively executes your JavaScript or WebAssembly — time spent waiting on fetch(), KV or other I/O is not billed. Most Workers use 1–10 ms of CPU per request, and the platform caps a single invocation at 5 minutes (300,000 ms) of CPU on the paid plan.",
    ],
    [
      "How much does Workers KV cost?",
      "On the paid plan KV includes 10 million reads, 1 million each of writes, deletes and lists, and 1 GB of storage per month. Overage bills at $0.50 per million reads, $5.00 per million writes, deletes or lists, and $0.50 per GB-month — writes cost 10× reads, so write-heavy workloads may fit Durable Objects or D1 better.",
    ],
  ],
};

export default seo;
