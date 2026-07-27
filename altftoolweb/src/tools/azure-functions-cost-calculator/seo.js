const seo = {
  intro:
    "This calculator computes the monthly Azure Functions Consumption plan bill as executions × $0.20 per million plus GB-seconds × $0.000016, after the free monthly grants of 1 million executions and 400,000 GB-seconds (East US list prices). It applies Azure's real billing granularity — memory rounded up to 128 MB, a 100 ms minimum per execution — and compares the result against one always-on EP1 Premium instance so teams can see when the serverless plan stops being the cheap option.",
  useCases: [
    "Estimating what an API handling 5 million requests a month at 500 ms and 512 MB actually costs on Consumption",
    "Checking whether a workload still fits inside the free grants of 1M executions and 400,000 GB-seconds",
    "Finding the traffic level at which a fixed EP1 Premium instance becomes cheaper than pay-per-use",
  ],
  benefits: [
    ["Real billing granularity", "Applies the 128 MB memory rounding and 100 ms minimum that inflate naive estimates."],
    ["Free grants deducted", "The 1M execution and 400,000 GB-second monthly grants are subtracted before charging."],
    ["Premium break-even", "Shows side by side whether Consumption or one EP1 instance is cheaper at your volume."],
  ],
  faqs: [
    [
      "How is Azure Functions Consumption plan billed?",
      "On two meters: $0.20 per million executions and $0.000016 per GB-second of execution time in East US, after free monthly grants of 1 million executions and 400,000 GB-seconds. GB-seconds are memory (rounded up to the nearest 128 MB) multiplied by duration (minimum 100 ms per execution).",
    ],
    [
      "What is a GB-second in Azure Functions?",
      "One GB-second is one gigabyte of memory held for one second. A function using 512 MB for 500 ms consumes 0.5 GB × 0.5 s = 0.25 GB-seconds per execution, so 5 million such executions is 1.25 million GB-seconds — 850,000 of them billable after the 400,000 free grant, costing $13.60.",
    ],
    [
      "Is Azure Functions free for low traffic?",
      "Effectively yes: the monthly grants cover 1 million executions and 400,000 GB-seconds, so a lightweight 128 MB function running 100 ms per call can execute a million times for $0. You still pay separately for the required storage account and any bandwidth.",
    ],
    [
      "When is the Premium plan cheaper than Consumption?",
      "When sustained usage exceeds the cost of a fixed instance — the smallest EP1 (1 vCPU, 3.5 GB) lists at roughly $158/month in East US. Heavy workloads, such as around 100 million one-second 1 GB executions costing about $1,600 on Consumption, are far cheaper on Premium, which also removes cold starts and the 1,536 MB memory cap.",
    ],
  ],
};

export default seo;
