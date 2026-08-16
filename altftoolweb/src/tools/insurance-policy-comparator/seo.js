const seo = {
  title: "Insurance Policy Comparator & Ranker",
  metaDescription:
    "Paste one policy per line as pipe-separated fields, then rank them by higher coverage, lower premium or shorter waiting period.",
  steps: [
    "Enter one policy per line in Policy comparison rows, following the pipe order shown in the hint: Policy | premium | coverage | waiting | co-pay | key limits | exclusions — or load the Two health policies example chip.",
    "Set Primary comparison priority to Higher coverage, Lower premium or Shorter waiting period; the ranking re-sorts on that one field, and the caption notes it uses only the entered fields.",
    "Read the Result line naming which policy ranks first, the Policies compared, Lowest premium and Highest coverage figures and the Policy/Premium/Coverage/Waiting/Co-pay/Limits/Exclusions table, then Copy it or Download insurance-policy-comparator.txt.",
  ],
  intro:
    "Insurance Policy Comparator lays competing policies side by side on the seven things that decide a claim — premium, sum insured, waiting period, co-pay, room and sub-limits, and exclusions — and ranks them by the one priority you pick: highest coverage, lowest premium, or shortest waiting period. You enter one policy per line as pipe-separated fields and get a sorted table plus the lowest premium and highest coverage in the set. It organises the comparison; it does not read the policy wording for you, so the ranking is only as good as the figures you copy in.",
  useCases: [
    "Three health insurance quotes have landed in your inbox with different sums insured and you cannot tell which is actually cheaper per lakh of cover — line them up and sort by coverage, then by premium.",
    "Deciding between a policy with a 2-year pre-existing disease waiting period and a cheaper one with 3 years, when you already have a condition that makes that clause the deciding factor.",
    "Sitting with an agent who is pushing one product: put their policy next to the two you shortlisted yourself, with room rent caps and co-pay in the same row, before you sign anything.",
  ],
  benefits: [
    ["Ranks on the term that matters to you", "Sorting is by coverage, premium or waiting period on demand, so the cheapest policy does not automatically look like the best one."],
    ["Keeps the clauses next to the price", "Co-pay, room caps and exclusions travel in the same row as the premium, which is where the real cost difference usually hides."],
    ["Works for any policy type", "The seven columns are generic, so motor, term life and travel policies compare the same way as health cover."],
  ],
  faqs: [
    [
      "What is a waiting period in health insurance?",
      "It is the time after buying a policy during which specific claims are not payable. Typically there is an initial waiting period of about 30 days for illness, a separate one of 2 to 4 years for named or pre-existing conditions, and often a maternity waiting period longer still — check each policy's own schedule, since the numbers vary by insurer.",
    ],
    [
      "What does co-pay mean and should I avoid it?",
      "Co-pay is the share of every approved claim you pay yourself, commonly 10% or 20%. A 20% co-pay on a Rs 5 lakh claim costs you Rs 1 lakh out of pocket, so a lower premium with co-pay can be more expensive than a higher premium without it the first time you claim.",
    ],
    [
      "Why does a room rent limit matter if the sum insured is large?",
      "Because exceeding the room cap can proportionately reduce the entire claim, not just the room charge. If your policy caps the room at Rs 5,000 and you occupy one at Rs 10,000, many insurers settle the associated surgeon, nursing and procedure charges at the same proportion — check whether the policy applies proportionate deduction before choosing a capped plan.",
    ],
    [
      "Is the cheapest premium the best policy?",
      "Usually not, once waiting periods, co-pay, sub-limits and exclusions are counted. Compare cost per lakh of sum insured alongside the clauses that would apply to your own health history. This tool is a comparison organiser for information only — read the official policy wording and speak to a licensed insurance adviser before buying.",
    ],
  ],
};

export default seo;
