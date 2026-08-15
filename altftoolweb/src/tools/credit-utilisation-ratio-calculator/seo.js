const seo = {
  title: "Credit Utilisation Calculator: Overall",
  metaDescription:
    "Balance ÷ limit for every card: overall utilisation, each card’s ratio, a healthy/watch/high band and the rupees to clear to get under 30%.",
  steps: [
    "Fill in every card under “Your cards” — Card, Limit (INR) and Balance (INR) — pressing “Add a card” for as many as you hold and the remove button on a row to drop one.",
    "Each row recalculates as you type, showing that card's percentage and either the rupees of room left before 30% or the amount it is already over.",
    "“Overall utilisation” gives the combined percentage with a Healthy, Watch or High band and a bar, plus Total limit, Total balance and “Room before 30%” or “Pay down by”, and names the highest single card; “Copy summary” copies the whole breakdown.",
  ],
  intro:
    "The Credit Utilisation Ratio Calculator divides your outstanding balance by your credit limit (balance ÷ limit × 100) for every card you enter, then reports both the combined ratio across all cards and the ratio on each card separately. It is built for anyone with two or more credit cards who wants to know exactly how much spend room is left before crossing the 30% mark most scoring models stop penalising below. Enter each card's limit and balance in rupees and you get the overall percentage, a healthy/watch/high band, the worst single card, and the rupee amount you would need to clear.",
  useCases: [
    "You have a home loan application going in next month and want to know how much to pay down across three cards so your combined utilisation sits under 30% before the next statement dates.",
    "Your overall utilisation looks fine at 12%, but you suspect one card is nearly maxed — the per-card breakdown shows which card is at 95% and the exact rupee amount to clear on it.",
    "You are about to put a ₹80,000 purchase on a card and want to check whether that single spend pushes you from the healthy band into the watch band above 30%.",
  ],
  benefits: [
    [
      "Overall and per-card in one view",
      "Lenders look at both numbers, so the calculator reports the combined ratio and flags the single worst card rather than hiding it in an average.",
    ],
    [
      "Answers in rupees, not just percentages",
      "Instead of telling you that you are at 47%, it tells you the exact amount to pay down to reach the 30% line on each card and across the portfolio.",
    ],
    [
      "Add as many cards as you actually hold",
      "Rows are unlimited, so a five-card portfolio is modelled properly instead of being squeezed into a single limit-and-balance box.",
    ],
  ],
  faqs: [
    [
      "What is a good credit utilisation ratio?",
      "Under 30% is the widely used benchmark, and that is the threshold this calculator measures against. The calculator bands anything at or below 30% as healthy, 31–50% as watch, and above 50% as high, because scoring models generally apply progressively larger penalties as the ratio climbs.",
    ],
    [
      "How is credit utilisation calculated?",
      "Utilisation is the outstanding balance divided by the credit limit, multiplied by 100. For overall utilisation the calculator sums every card's balance and every card's limit first, so a ₹1,08,000 total balance against a ₹3,70,000 total limit works out to roughly 29.2%.",
    ],
    [
      "Does one maxed-out card matter if my overall ratio is low?",
      "Yes — per-card utilisation is reported to bureaus alongside the aggregate, so a single card at 95% can drag your profile even when the combined figure is comfortably under 30%. The calculator highlights the highest card and the amount needed to bring it back below the 30% line.",
    ],
    [
      "When does my utilisation actually get reported?",
      "It is reported on each card's statement date, not on your payment due date. That means a balance you clear after the statement is generated still shows up as utilisation for that month, so paying before the statement closes is what moves the reported number.",
    ],
  ],
};

export default seo;
