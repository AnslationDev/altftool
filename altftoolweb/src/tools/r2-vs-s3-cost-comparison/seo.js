const seo = {
  intro:
    "This tool compares the monthly cost of storing and serving the same data on Cloudflare R2 versus Amazon S3 Standard, using published list prices: R2 at $0.015/GB-month with $0 egress against S3 at $0.023/GB-month plus internet data-transfer-out starting at $0.09/GB after 100 GB free. Request pricing is mapped correctly — R2 Class A/B operations against S3 PUT and GET rates — so download-heavy and write-heavy profiles both get an honest answer.",
  useCases: [
    "Costing a move of 1 TB of public assets that serve 2 TB of downloads a month off S3",
    "Checking whether a write-heavy log archive still favours R2 when egress is nearly zero",
    "Producing a side-by-side line-item table for a migration proposal to finance",
  ],
  benefits: [
    ["Egress is the headline", "S3's tiered transfer-out fees are computed in full; R2's $0 egress is applied literally."],
    ["Correct request mapping", "R2 Class A ($4.50/M) vs S3 PUT ($5/M) and Class B ($0.36/M) vs GET ($0.40/M)."],
    ["Free tiers optional", "Toggle R2's 10 GB / 1M / 10M monthly free tier to model steady-state or worst case."],
  ],
  faqs: [
    [
      "Is Cloudflare R2 cheaper than Amazon S3?",
      "For most profiles, yes: R2 storage is $0.015/GB-month versus S3 Standard's $0.023/GB-month, and R2 charges nothing for egress while S3 bills from $0.09/GB after 100 GB free. A bucket holding 1 TB and serving 2 TB monthly costs roughly $15 on R2 against about $200 on S3 — the gap is almost entirely egress.",
    ],
    [
      "Does Cloudflare R2 really have no egress fees?",
      "Yes — R2 charges $0 for data transferred out to the internet, regardless of volume. You still pay for storage and for operations (Class A writes at $4.50 per million, Class B reads at $0.36 per million beyond the free tier), which is how Cloudflare monetises the service instead.",
    ],
    [
      "What are R2 Class A and Class B operations?",
      "Class A operations are state-changing or listing calls — PUT, COPY, DELETE-adjacent listing, multipart uploads — billed at $4.50 per million after 1 million free each month. Class B operations are reads such as GET and HEAD, billed at $0.36 per million after 10 million free. They map directly to S3's PUT-class and GET-class request charges.",
    ],
    [
      "Is R2 compatible with the S3 API?",
      "Largely, yes — R2 exposes an S3-compatible API, so most SDKs, CLIs and tools work by changing the endpoint and credentials. Differences remain around some advanced features (storage classes, replication options, event notifications), so test your specific toolchain; costs here are informational, not a quote.",
    ],
  ],
};

export default seo;
