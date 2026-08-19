const seo = {
  title: "Supabase Pricing Calculator: Pro Bill Estimate",
  metaDescription:
    "Estimate a Supabase Pro bill — $25 base, $10 compute credit and per-unit overages for database, egress, storage, MAU and edge functions beyond quota.",
  steps: [
    "Enter expected \"Database size (GB)\", \"Egress / bandwidth per month (GB)\", \"File storage (GB)\", \"Monthly active auth users\" and \"Edge function invocations per month\".",
    "Choose a \"Compute instance\" — from \"Micro — 1 GB RAM, 2-core (shared)\" at $10 up to \"4XL — 64 GB RAM, 16-core\".",
    "Read the estimated monthly Pro bill with each overage line beyond the Pro quotas, the yearly figure and whether usage still fits the Free tier, then click \"Copy result\".",
  ],
  intro:
    "This estimator projects a monthly Supabase bill by applying the published Pro plan pricing model: a $25 base fee, a $10 compute credit, and per-unit overage rates for database space, egress, file storage, monthly active users and edge function invocations beyond the included quotas. It is built for developers and founders sizing a side project or production app who want to know whether they fit the Free tier and what growth will cost before it lands on the invoice.",
  useCases: [
    "A founder launching an app with 120,000 monthly active users who needs to know how far past the 100,000 MAU quota their auth bill will grow",
    "A developer with a 10 GB Postgres database checking the database overage rate before migrating off the 500 MB Free tier",
    "A team comparing compute tiers (Micro to 4XL) to see how a dedicated instance changes the monthly total after the $10 credit",
  ],
  benefits: [
    ["Full overage maths", "Applies the per-GB, per-MAU and per-million-invocation overage rates on top of the $25 base fee."],
    ["Free tier check", "Flags when your usage still fits the Free plan quotas so you do not pay for headroom you do not need."],
    ["Compute credit applied", "Deducts the $10 monthly compute credit that Pro includes before adding your chosen instance."],
  ],
  faqs: [
    [
      "How much does Supabase Pro cost per month?",
      "The Pro plan starts at $25 per month, which includes an 8 GB database, 250 GB egress, 100 GB file storage, 100,000 monthly active users, 2 million edge function invocations and a $10 compute credit. Anything beyond those quotas is metered — for example about $0.09 per extra GB of egress and $0.00325 per extra monthly active user.",
    ],
    [
      "What is included in the Supabase free tier?",
      "The Free plan includes roughly 500 MB of database space, 5 GB of egress, 1 GB of file storage, 50,000 monthly active users and 500,000 edge function invocations per month at no cost. Free projects can be paused after a period of inactivity, which is the main practical limitation for production apps.",
    ],
    [
      "How are Supabase overages calculated?",
      "Overages are billed per unit above the Pro plan's included quota: extra database space at about $0.125 per GB-month, egress at about $0.09 per GB, file storage at about $0.021 per GB-month, auth users at about $0.00325 per MAU and edge functions at about $2 per million invocations. This tool multiplies each rate by the amount you exceed the quota and adds it to the $25 base.",
    ],
    [
      "Does Supabase charge separately for compute?",
      "Yes. Each project runs on a compute instance, from Micro at about $10 per month up to much larger dedicated tiers, and the Pro plan includes a $10 monthly compute credit that fully covers Micro. Larger instances cost the listed price minus that credit, so a Small instance at $15 adds only $5 to the bill.",
    ],
  ],
};

export default seo;
