const seo = {
  title: "Netlify Cost Estimator: Credits, Plans",
  metaDescription:
    "Convert bandwidth, function compute, deploys and requests into Netlify credits - Free 300, Personal $9/1,000, Pro from $20/3,000 - with recharge packs.",
  steps: [
    "Pick a \"Plan\" (Free, Personal or Pro) and, on Pro, a \"Pro credit tier\" from 3,000 up to 20,000 credits.",
    "Enter your monthly \"Bandwidth (GB/month)\", \"Function compute (GB-hours/month)\", \"Production deploys per month\" and \"Web requests per month\".",
    "Read the \"Estimated monthly Netlify bill\" with each meter's credit cost and recharge packs - or the Free-plan pause warning - and use \"Copy result\".",
  ],
  intro:
    "This estimator computes a monthly Netlify bill from bandwidth, function compute, production deploys and web requests, using Netlify's current credit-based pricing — Free at 300 credits/month, Personal at $9 for 1,000 credits, and Pro starting at $20 for 3,000 credits with unlimited team members. Usage beyond the plan's included credits tops up in $10 (Pro) or $5 (Personal) recharge packs, or pauses the project on Free. It shows Jamstack teams exactly which meter tips them from Free into real spend.",
  useCases: [
    "Checking whether a side project's traffic still fits the Free plan's 300 credit/month allowance",
    "Forecasting a Pro team's bill in a month with a 500 GB bandwidth spike and heavier function compute",
    "Seeing how frequent production deploys and web request volume convert into recharge packs on Pro",
  ],
  benefits: [
    ["Real credit model", "Bandwidth, compute, deploys and requests all draw from one credit pool, matching Netlify's current billing exactly."],
    ["Free vs Personal vs Pro side by side", "Switch plans to see when the 300 or 1,000 credit allowances stop being enough."],
    ["Recharge-pack overages", "Overage tops up in whole $10 (Pro) or $5 (Personal) packs, matching how Netlify actually bills recharges."],
  ],
  faqs: [
    [
      "How much does Netlify Pro cost?",
      "Pro starts at $20 per month for 3,000 credits, with unlimited team members included at no extra charge — Netlify removed per-seat pricing on 2026-04-14. Higher credit tiers are available: 5,000 credits for $33, 10,000 for $63, 15,000 for $95, and 20,000 for $126 per month, with credit rollover on tiers of 5,000 or more.",
    ],
    [
      "What do I get on Netlify's free plan?",
      "The Free plan includes 300 credits per month for a single owner, at $0. Credits cover bandwidth, function compute, production deploys and web requests. There's no overage billing on Free — once the 300 credits run out mid-cycle, the project pauses until the next billing cycle or an upgrade.",
    ],
    [
      "How does Netlify's credit-based pricing work?",
      "Every plan gets a monthly credit allowance that a shared pool of usage draws from: bandwidth costs 20 credits per GB, function/edge/background compute costs 10 credits per GB-hour, each production deploy costs 15 credits, and web requests cost 2 credits per 10,000 requests. Deploy previews, branch deploys and failed deploys are not metered. Going over the allowance tops up via auto-recharge packs on Personal and Pro (500 credits for $5, or 1,500 credits for $10), rounded up to the next whole pack.",
    ],
    [
      "How much do Netlify function invocations cost?",
      "Netlify no longer bills function invocations directly — as of the 2026-04-14 pricing update, serverless, edge and background function usage is metered as compute at 10 credits per GB-hour, drawn from the same credit pool as bandwidth and deploys. There's no separate per-invocation charge or invocation pack.",
    ],
  ],
};

export default seo;
