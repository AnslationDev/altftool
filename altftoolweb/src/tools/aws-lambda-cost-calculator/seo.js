const seo = {
  intro:
    "The AWS Lambda Cost Calculator estimates your monthly Lambda bill from three inputs — invocations per month, configured memory and average duration — using AWS on-demand pricing for x86 functions in US East (N. Virginia): $0.20 per million requests plus $0.0000166667 per GB-second of compute. Compute is calculated as invocations x duration in seconds x memory in GB, where 1 GB = 1,024 MB, then the always-free tier of 1,000,000 requests and 400,000 GB-seconds is subtracted. It is for engineers and architects sizing a serverless workload before committing to it.",
  useCases: [
    "Deciding whether moving a cron job or webhook receiver off an always-on EC2 instance to Lambda is actually cheaper at your request volume",
    "Checking the cost impact of raising a function from 512 MB to 1,769 MB to halve its duration — more memory per second, but fewer seconds",
    "Working out at what monthly traffic a hobby project stops being free, given the 1M request and 400,000 GB-second always-free allowance",
  ],
  benefits: [
    [
      "Both meters, separately",
      "Requests and compute are shown as separate lines, so you can see which one is actually driving the bill.",
    ],
    [
      "Always-free tier applied",
      "The 1M requests and 400,000 GB-seconds are subtracted before pricing, and you can switch that off to see the gross cost.",
    ],
    [
      "Cost per million invocations",
      "A single normalised figure that makes memory and duration trade-offs directly comparable.",
    ],
  ],
  faqs: [
    [
      "How much does AWS Lambda cost per million requests?",
      "$0.20 per million requests on the request meter, plus compute charged at $0.0000166667 per GB-second. A million invocations of a 512 MB function running 200 ms each uses 100,000 GB-seconds, so the compute side alone would be about $1.67 before the free tier.",
    ],
    [
      "Is AWS Lambda free? What does the free tier cover?",
      "Lambda has an always-free tier of 1,000,000 requests and 400,000 GB-seconds of compute per month, and unlike the 12-month AWS free tier it does not expire. A 128 MB function running 1 second per call can therefore make about 1,000,000 free calls a month before either meter runs out.",
    ],
    [
      "Does giving a Lambda more memory make it cheaper or more expensive?",
      "It can go either way, because Lambda gives CPU in proportion to memory. Doubling memory doubles the per-second rate, so it only pays off if duration drops by more than half. The 1,769 MB point is where a function gets one full vCPU, which is often the sweet spot for CPU-bound work.",
    ],
    [
      "Is Lambda duration still billed in 100 ms blocks?",
      "No. Since December 2020 AWS bills Lambda duration in 1 ms increments, so a 12 ms function is billed for 12 ms rather than rounded up to 100 ms. This calculator uses per-millisecond billing.",
    ],
  ],
};

export default seo;
