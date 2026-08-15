const seo = {
  title: "GCP Cloud Run Cost Calculator",
  metaDescription:
    "Estimate a Cloud Run monthly bill at Tier 1 rates after the 180k vCPU-s, 360k GiB-s and 2M request free tier, modelling concurrency and warm instances.",
  steps: [
    "Enter Requests per month, Average request duration (ms), vCPU per instance, Memory per instance (GiB), Average concurrency per instance and Minimum (warm) instances",
    "The calculator deducts the free tier — 180,000 vCPU-seconds, 360,000 GiB-seconds and 2 million requests — then prices the rest at Tier 1 request-based rates in 100 ms increments",
    "Read the Estimated monthly Cloud Run cost with its vCPU, memory, request and Idle min-instance cost lines, then press Copy result",
  ],
  intro:
    "This calculator estimates a Google Cloud Run service's monthly bill under request-based billing: vCPU-seconds at $0.000024, GiB-seconds at $0.0000025 and requests at $0.40 per million (Tier 1 regions), after the monthly free tier of 180,000 vCPU-seconds, 360,000 GiB-seconds and 2 million requests. It models the details that change the answer — 100 ms billing increments, request concurrency sharing one instance, and warm min instances billing at idle rates around the clock.",
  useCases: [
    "Pricing an API that serves 3 million requests a month at 300 ms on a 1 vCPU / 512 MiB service",
    "Seeing how raising concurrency from 1 to 80 divides the compute portion of the bill",
    "Measuring what setting min-instances=1 to kill cold starts actually adds per month",
  ],
  benefits: [
    ["Free tier applied", "The 180k vCPU-s, 360k GiB-s and 2M request monthly allowances are deducted first."],
    ["Concurrency modelled", "Concurrent requests share one instance's clock, exactly as Cloud Run bills it."],
    ["Warm instance cost", "Min instances are priced at the idle rates of $0.000018/vCPU-s and $0.000002/GiB-s."],
  ],
  faqs: [
    [
      "How is Google Cloud Run billed?",
      "Under request-based billing you pay for vCPU-seconds ($0.000024), memory GiB-seconds ($0.0000025) and requests ($0.40 per million) in Tier 1 regions, rounded up to 100 ms per request. Instance-based billing instead charges the whole instance lifetime at lower rates ($0.000018/vCPU-s) with no per-request fee.",
    ],
    [
      "Is Cloud Run free for small projects?",
      "Often, yes. Every month the first 180,000 vCPU-seconds, 360,000 GiB-seconds and 2 million requests are free in Tier 1 regions — enough for roughly 600,000 requests at 300 ms on a 1 vCPU service before any compute charge appears.",
    ],
    [
      "How does concurrency affect Cloud Run cost?",
      "Directly: Cloud Run bills instance time, not per-request time, so 80 requests handled concurrently on one instance cost roughly 1/80th of the compute of handling them serially. Raising concurrency is usually the biggest single cost lever, limited by how CPU-bound each request is.",
    ],
    [
      "How much does min-instances cost on Cloud Run?",
      "A warm idle instance bills at the idle rates — $0.000018 per vCPU-second and $0.000002 per GiB-second in Tier 1 regions — which comes to about $50 per month for a 1 vCPU / 512 MiB instance kept warm around the clock. That is the price of eliminating cold starts.",
    ],
  ],
};

export default seo;
