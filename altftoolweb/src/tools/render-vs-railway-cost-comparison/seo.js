const seo = {
  title: "Render vs Railway Pricing Calculator — Monthly Cost",
  metaDescription:
    "Price one workload both ways: Render's fixed instance tiers vs Railway's $20/vCPU + $10/GB-RAM metering, with egress, disk and plan credits included.",
  steps: [
    "Describe the workload: 'vCPUs needed', 'RAM needed (GB)', 'Hours running per month (730 = always on)', 'Egress / bandwidth per month (GB)' and 'Persistent disk / volume (GB)'.",
    "Pick your Railway plan — the subscription and its included usage credit are deducted in the Railway column.",
    "Read the 'Cheapest monthly cost for this workload' headline with side-by-side Render and Railway line items, then click 'Copy result'.",
  ],
  intro:
    "This comparison tool prices the same application on Render's fixed instance tiers and on Railway's usage-based metering ($20 per vCPU and $10 per GB of RAM per month, prorated by run time) so you can see which platform is cheaper for your specific workload. It is aimed at developers choosing a PaaS for a hobby project or a small production service, and it includes the costs people usually forget: bandwidth overages and persistent disk.",
  useCases: [
    "A developer with a 1 vCPU / 2 GB always-on API deciding whether Render's $25 Standard instance beats Railway's metered pricing",
    "A hobbyist running a bot only a few hours a day, where Railway's per-minute proration can undercut a fixed instance",
    "A team pushing 150 GB of egress a month checking how Render's $0.30/GB overage compares with Railway's $0.05/GB rate",
  ],
  benefits: [
    ["Same workload, two models", "Maps your CPU/RAM need to the smallest Render instance and prices identical usage on Railway."],
    ["Bandwidth and disk included", "Applies Render's 100 GB free bandwidth then $0.30/GB, versus Railway's $0.05/GB egress and $0.15/GB volumes."],
    ["Credits handled", "Deducts the usage credit included in Railway's Hobby ($5) and Pro ($20) subscriptions before totalling."],
  ],
  faqs: [
    [
      "Is Railway cheaper than Render?",
      "It depends on utilisation. Railway meters compute at roughly $20 per vCPU and $10 per GB of RAM per month prorated by the minute, so services that sleep most of the day are often cheaper there, while an always-on 1 vCPU / 2 GB service costs about $40 in compute on Railway versus $25 flat on Render's Standard instance. Egress flips the other way: Railway charges about $0.05/GB while Render bills $30 per extra 100 GB after its free allowance.",
    ],
    [
      "How does Render's instance pricing work?",
      "Render sells fixed tiers — for example Starter (0.5 CPU, 512 MB) around $7/month and Standard (1 CPU, 2 GB) around $25/month — billed per second up to the monthly cap. You pick the smallest tier that fits your CPU and RAM needs, and pay the full tier price when the service runs continuously.",
    ],
    [
      "What does Railway's Hobby plan include?",
      "The Hobby plan costs $5 per month and includes $5 of usage credit, so light workloads whose metered usage stays under $5 effectively pay only the subscription. Usage beyond the credit is billed at the resource rates: about $20 per vCPU-month, $10 per GB-RAM-month, $0.05 per GB of egress and $0.15 per GB-month of volume storage.",
    ],
    [
      "Does this comparison include databases?",
      "No — it prices one application service plus its disk and bandwidth. On Railway a Postgres database is just another metered service (RAM, CPU and volume), while Render sells managed Postgres on separate plans, so compare database costs separately using each provider's database pricing page.",
    ],
  ],
};

export default seo;
