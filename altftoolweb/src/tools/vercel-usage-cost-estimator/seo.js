const seo = {
  title: "Vercel Cost Estimator – Pro Seats, Bandwidth & Functions",
  metaDescription:
    "Estimate a Vercel Pro bill: $20/seat plus overages past 1 TB transfer ($0.15/GB), 10M edge requests, 1M invocations and 1,000 GB-hours of duration.",
  intro:
    "This estimator computes a monthly Vercel Pro bill as $20 per seat plus metered overages beyond the plan's included allowances — 1 TB fast data transfer then $0.15/GB, 10M edge requests then $2 per million, 1M function invocations then $0.60 per million, and 1,000 GB-hours of function duration then $0.18 per GB-hour. It helps teams on Hobby forecast what going Pro costs, and Pro teams see which meter is driving the bill.",
  useCases: [
    "Forecasting the bill for a marketing site expecting a 1.5 TB traffic month before a launch",
    "Checking whether image-heavy pages will blow past the 10M included edge requests",
    "Comparing the cost of long-running serverless functions against moving work to a queue or cron",
  ],
  benefits: [
    ["Every Pro meter", "Seats, bandwidth, edge requests, invocations and function duration in one view."],
    ["Included allowances first", "Overage only bills past 1 TB, 10M requests, 1M invocations and 1,000 GB-hours."],
    ["Build minutes flagged", "Warns when usage passes the included 24,000 build minutes rather than inventing a rate."],
  ],
  faqs: [
    [
      "How much does Vercel Pro cost per month?",
      "The base is $20 per team member per month. Usage beyond the included allowances then bills separately: $0.15/GB after 1 TB of fast data transfer, $2 per million edge requests after 10M, $0.60 per million function invocations after 1M, and $0.18 per GB-hour of function duration after 1,000 GB-hours.",
    ],
    [
      "What is fast data transfer on Vercel?",
      "It is the data served from Vercel's edge network to your visitors — the bandwidth meter. Pro teams get 1 TB per month included; beyond that it bills at $0.15 per GB, which makes bandwidth the dominant cost for media-heavy sites.",
    ],
    [
      "What is a GB-hour of function duration?",
      "One GB of provisioned function memory running for one hour. A 1.7 GB function that executes for a total of 100 hours in a month consumes 170 GB-hours; Pro includes 1,000 GB-hours before the $0.18 per GB-hour overage starts.",
    ],
    [
      "How many build minutes does Vercel Pro include?",
      "Pro includes 24,000 standard build minutes per team per month, versus 6,000 on Hobby. There is no simple per-minute overage — heavier needs are met with enhanced build machines or on-demand concurrency, which Vercel bills separately, so this tool flags the excess instead of pricing it.",
    ],
  ],
};

export default seo;
