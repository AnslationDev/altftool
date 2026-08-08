const seo = {
  title: "Gift Budget Tracker: Per-Person Spend vs Budget",
  metaDescription:
    "Track one gift budget against actual spend per recipient, with an amber warning at 90% used, 7-day delivery alerts and CSV export.",
  steps: [
    "Open Edit Total Budget and set Total Budget ($), then press Add Gift for each recipient, gift, occasion, budget and actual spent.",
    "Watch the banner turn amber at Approaching Budget Limit once 90% of the budget is used, and red when remaining budget drops below zero.",
    "Press CSV to download gift_budget_tracker_export.csv with recipient, gift, occasion, category, priority, status, budget, actual spent and both dates.",
  ],
  intro:
    "The Gift Budget Tracker keeps a running total of one overall gift budget against the actual amount spent per recipient, so remaining budget is simply total budget minus actual spending and each gift shows its own budget-versus-actual variance. Every gift you add carries a recipient, occasion, category, priority, status and optional purchase and delivery dates, and the list is saved in your browser so it survives a page reload. It is built for anyone running a multi-person gift list — a holiday season, a wedding party, a team's year-end presents — who needs to know what is left before buying the next one.",
  useCases: [
    "You set a $1,000 December budget for 14 relatives and want to see, after buying seven gifts, exactly how much is left and which recipients you have overspent on.",
    "You are handling gifts for a wedding party and need to know which parcels are due in the next week, because the tool flags any non-cancelled gift with a delivery date within 7 days as an upcoming delivery.",
    "You are splitting a shared family gift budget with a sibling and want to export the whole list to CSV so both of you are working from the same recipient, budget and actual-spend columns.",
  ],
  benefits: [
    [
      "Planned and actual tracked separately",
      "Each gift stores a budget amount and an actual spending amount, so the variance shows as a plus or minus figure per recipient instead of one blurred total.",
    ],
    [
      "Warns before you go over, not after",
      "An amber alert appears once actual spending reaches 90% of the total budget, and a red over-budget alert shows the exact amount you exceeded it by.",
    ],
    [
      "Answers 'where did it go' with two charts",
      "A donut chart splits actual spending across the seven categories and a bar chart breaks the same spend down by occasion, both drawn from the gifts you entered.",
    ],
  ],
  faqs: [
    [
      "How does it calculate my remaining gift budget?",
      "Remaining budget is your total budget minus the sum of the actual spending amounts on every gift — planned budget amounts are not subtracted. That means a gift you have costed but not yet bought does not reduce what is left, which is why the tool also shows planned totals separately.",
    ],
    [
      "When does it tell me I am close to overspending?",
      "The amber warning triggers at 90% of the total budget used, and once remaining budget drops below zero the banner turns red and states how much over you are. Both are recalculated the moment you edit a gift amount or the budget itself.",
    ],
    [
      "What counts as an upcoming delivery?",
      "Any gift that is not marked Delivered or Cancelled and has a delivery date between today and 7 days from now. Gifts with no delivery date entered are never counted, so fill that field in if you want the reminder.",
    ],
    [
      "Is my gift list saved, and can I get it out?",
      "Yes — the budget and every gift are written to your browser's local storage, so they reload on your next visit on the same browser, and nothing is uploaded. You can export the full list as a UTF-8 CSV with recipient, gift, occasion, category, priority, status, budget, actual spend and both dates as columns; clearing site data deletes the list, so export if it matters.",
    ],
  ],
};

export default seo;
