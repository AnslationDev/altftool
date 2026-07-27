const seo = {
  intro:
    "This planner converts a toll routine into a FASTag burn rate — cost per journey, spend per day, month and year — and returns the date the current balance runs down to your chosen buffer plus the top-up that will cover the next stretch. It applies the return-journey rule in the National Highways Fee (Determination of Rates and Collection) Rules, 2008, where a return trip completed within 24 hours costs one and a half one-way fares instead of two. Aimed at daily commuters and anyone tired of a tag going low at the plaza.",
  useCases: [
    "A daily commuter crossing the same plaza twice a day working out a top-up amount that lasts a full month",
    "Deciding whether a local monthly pass beats paying per crossing at your usual plaza",
    "Setting a low-balance reminder date before a long weekend when the tag would otherwise run out mid-trip",
  ],
  benefits: [
    ["Return concession built in", "Prices a same-day round trip at 1.5 fares, the way the NH fee rules do."],
    ["A date, not a vague warning", "Says which day the balance reaches your buffer and what to load."],
    ["Pass versus pay-per-use", "Compares a monthly pass price against your actual monthly toll spend."],
  ],
  faqs: [
    [
      "Is there a minimum balance for a FASTag?",
      "Not for cars, jeeps and vans. NHAI withdrew the minimum-balance requirement for fee class 4 vehicles in February 2021, so a tag works as long as the balance covers the crossing. Individual issuing banks still hold a security deposit and some keep their own threshold, and a negative balance gets the tag blocked.",
    ],
    [
      "How much is a return trip on a national highway toll plaza?",
      "One and a half times the one-way fee, provided the return journey is completed within 24 hours through the same plaza, under the National Highways Fee Rules, 2008. That is a 25% saving against paying two single fares, which is why a daily commuter should count round trips rather than crossings.",
    ],
    [
      "How much should I recharge my FASTag with?",
      "Enough to cover your daily burn for as long as you want to go between top-ups. If you cross a ₹85 plaza and return the same day, five days a week, the burn is roughly ₹91 a day, so a month of cover needs about ₹2,800. The calculator rounds the figure up to the nearest hundred.",
    ],
    [
      "Can I get a monthly toll pass?",
      "At many national highway plazas, yes — the fee rules provide a discounted monthly pass for a non-commercial vehicle whose owner lives within 20 km of the plaza, with proof of residence. The pass price is notified plaza by plaza; enter it in the planner and it will tell you whether it beats what you currently spend.",
    ],
  ],
};

export default seo;
