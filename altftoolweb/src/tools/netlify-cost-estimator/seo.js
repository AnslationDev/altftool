const seo = {
  intro:
    "This estimator computes a monthly Netlify bill from team members, bandwidth, build minutes and serverless function invocations, using Netlify's published block pricing — $19 per Pro member with 1 TB bandwidth and 25,000 build minutes included, then $55 per extra 100 GB of bandwidth and $7 per extra 500 build minutes, with partial blocks rounded up. It shows Jamstack teams exactly which meter tips them from the Free plan into real spend.",
  useCases: [
    "Checking whether a side project's traffic still fits the Free plan's 100 GB bandwidth allowance",
    "Forecasting a three-person agency's Pro bill in a month with a 1.2 TB traffic spike",
    "Seeing how a chatty preview-deploy workflow that burns 26,000 build minutes converts into overage blocks",
  ],
  benefits: [
    ["Block-rounded overages", "Bandwidth and build overages round up to whole $55 and $7 blocks, matching real invoices."],
    ["Free vs Pro side by side", "Switch plans to see when the 100 GB / 300 minute Free allowances stop being enough."],
    ["Functions included", "Models the 125,000 included invocations and the $25 pack covering up to 2 million beyond."],
  ],
  faqs: [
    [
      "How much does Netlify Pro cost?",
      "$19 per team member per month, which includes 1 TB of bandwidth and 25,000 build minutes for the team. Usage past those allowances bills in blocks: $55 per additional 100 GB of bandwidth and $7 per additional 500 build minutes, with partial blocks charged in full.",
    ],
    [
      "What do I get on Netlify's free plan?",
      "The Free (Starter) plan includes 100 GB of bandwidth, 300 build minutes and 125,000 serverless function invocations per month for a single member at $0. Exceeding an allowance moves you onto paid blocks — one extra gigabyte of bandwidth triggers a full $55 100 GB block.",
    ],
    [
      "How are Netlify build minutes calculated?",
      "Every minute a build runs on Netlify's build machines counts against the monthly allowance — 300 minutes on Free, 25,000 on Pro — including builds for deploy previews and branch deploys. Overage bills at $7 per 500-minute block, so trimming unnecessary preview builds is the usual first saving.",
    ],
    [
      "How much do Netlify Functions cost?",
      "The first 125,000 synchronous function invocations per month are included. Beyond that, Netlify's Functions pricing adds a $25 pack covering up to 2 million invocations, so 500,000 invocations in a month costs one $25 pack on top of your plan.",
    ],
  ],
};

export default seo;
