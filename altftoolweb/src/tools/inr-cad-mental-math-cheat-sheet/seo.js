const seo = {
  intro:
    "This cheat sheet turns a rupees-per-dollar exchange rate into arithmetic you can do standing at a till in Canada. It splits the rate into a decimal shift and a working multiplier between 1 and 10, then searches three families of shortcut — a whole-or-half multiplier, that multiplier plus an easy percentage nudge like 10%, 25% or 5%, and the nearest simple fraction — and reports the fixed percentage error of each, because a pure multiplier is off by the same percentage whatever the price. It is for Indian travellers, students and new arrivals in Canada who want a rule they can trust to within about 2% without unlocking a phone.",
  useCases: [
    "Standing in a Toronto grocery aisle deciding whether a C$12 pack is worth it, without opening a converter app.",
    "Sanity-checking a C$250 hotel night against your rupee budget while the booking page is still open.",
    "Teaching a student flying to Canada one rule to memorise before the flight, plus the reverse rule for turning a rupee budget into dollars.",
  ],
  benefits: [
    ["Error shown, not hidden", "Every shortcut is labelled with the percentage it overshoots or undershoots the exact conversion."],
    ["Rules you can actually run", "Only whole and half multipliers, decimal shifts, and percentage nudges people can do without paper."],
    ["Works in both directions", "It also derives the rupees-to-dollars rule, so a ₹10,000 budget becomes a dollar figure in one step."],
  ],
  faqs: [
    [
      "What is the easiest way to convert Canadian dollars to rupees in my head?",
      "Round the rate to a whole number and multiply. At roughly ₹62 per dollar the quick rule is to multiply by 60, which lands about 3% low, then add 2.5% — around ₹1.50 in every ₹60 — if you want to close most of that gap. Enter the day's rate above and the sheet picks the closest easy rule for it.",
    ],
    [
      "How accurate does a mental conversion need to be?",
      "About 2% is enough for everyday shopping. On a C$25 restaurant main a 2% error is roughly ₹30, which will not change your decision; on a C$2,000 flight it is about ₹2,500, so check big purchases on a phone or a bank statement instead.",
    ],
    [
      "Why does my bank charge more than the rate I used?",
      "The rate you see quoted is the mid-market rate. Indian cards typically add a foreign-currency markup of around 2% to 3.5% plus GST on that fee, and an ATM abroad adds its own withdrawal charge, so the rupee figure on your statement is normally a few per cent above the mental estimate. Treat this sheet as a shopping estimate, not a settlement figure.",
    ],
    [
      "Are there C$1 and C$2 notes in Canada?",
      "No. Both were replaced by coins — the $1 loonie in 1987 and the $2 toonie in 1996 — so the smallest note you will be handed is C$5 and the largest in general circulation is C$100. The one-cent coin was also withdrawn in 2013, which is why cash totals are rounded to the nearest five cents while card totals are not.",
    ],
  ],
};

export default seo;
