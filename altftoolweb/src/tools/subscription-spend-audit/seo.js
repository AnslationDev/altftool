const seo = {
  title: "Subscription Spend Audit: True Annual Cost",
  metaDescription:
    "Converts weekly (52.18x), monthly, quarterly and yearly charges to one annual total, ranks them by cost and totals what cancelling gives back.",
  steps: [
    "List each subscription with its \"Price charged (₹)\", \"Billed\" cycle and \"Seats / licences\", using \"Add subscription\" for more rows.",
    "Set each line's \"Decision\" (keep, cancel or review) and enter \"Monthly take-home pay (₹)\", the expected price rise % and a projection horizon.",
    "Read the \"True annual drain\" with share of take-home pay, the yearly saving from cancellations and the ranked-by-yearly-cost table; \"Copy result\" copies the summary.",
  ],
  intro:
    "A subscription audit converts every recurring charge to a single annual figure so weekly, monthly, quarterly and yearly plans can finally be compared and added together. Each line is multiplied by its number of charges per year — 12 for monthly, 4 for quarterly, 2 for half-yearly, and 365.25 ÷ 7 ≈ 52.18 for weekly plans that bill every seven days — then ranked by cost so the largest drains show up first. Mark a line to cancel and the tool reports exactly what that decision returns to you each year.",
  useCases: [
    "Adding up eleven streaming, storage and software charges spread across three different billing cadences to find the real yearly number.",
    "Checking what share of take-home pay recurring charges consume before signing up for one more.",
    "Costing a team's per-seat SaaS licences over five years with an assumed annual price rise.",
  ],
  benefits: [
    ["One comparable basis", "Every cadence is converted to charges per year, so a ₹99 weekly plan is correctly shown as costlier than a ₹399 monthly one."],
    ["Cancellation value in money", "Lines you mark to cancel are totalled separately as an annual saving, not a vague intention."],
    ["Per-seat aware", "Licence counts multiply the price, which is where team tools quietly become the biggest line."],
  ],
  faqs: [
    [
      "How do I work out the yearly cost of a weekly subscription?",
      "Multiply the price by 365.25 ÷ 7, which is about 52.18 charges a year, not 52. A ₹100 weekly plan costs roughly ₹5,218 a year — noticeably more than the ₹5,200 most people assume.",
    ],
    [
      "How much should I spend on subscriptions?",
      "There is no statutory limit, but a common budgeting guideline keeps all discretionary recurring spend inside the 30% 'wants' bucket of the 50/30/20 rule, alongside dining out and hobbies. This tool shows subscriptions as a percentage of take-home pay so you can judge it against your own budget.",
    ],
    [
      "Is an annual plan always cheaper than paying monthly?",
      "Usually, but not always — annual plans commonly discount 15–20% against twelve monthly payments. The saving only exists if you would have kept the service for the full year, and prepaying removes your ability to cancel mid-term, so compare the discount against how likely you are to still want it in month nine.",
    ],
    [
      "Does this tool store my subscription list?",
      "No. Everything is calculated in your browser and nothing is uploaded or saved to a server, so the list disappears when you close the page. Copy the summary if you want to keep it.",
    ],
  ],
};

export default seo;
