const seo = {
  title: "Dollar to Rupee Mental Math: Rounding Rules +",
  metaDescription:
    "Enter today's rate for rounding rules you can run in your head, each with its error stated, plus what US sales tax and a tip add to a tag price.",
  steps: [
    "Enter Rupees per $1 (today's rate) and A price on the tag ($).",
    "Set Sales tax added at the register (%) and Tip on the pre-tax bill (%), leaving the tip at 0 for shops and supermarkets.",
    "Read the exact rupee figure, the till figure once tax and tip are on the bill, and each rounding rule's error, then press Copy sheet.",
  ],
  intro:
    "This cheat sheet turns today's rupee-dollar rate into a multiplication you can actually do standing at a till. It writes the rate as a decimal shift plus a working multiplier between 1 and 10, then searches three families of approximation — rounding to the nearest quarter or half, adding an easy percentage nudge like 10% or an eighth, and the closest simple fraction — and reports each rule's error as a fixed percentage of the exact answer. It also handles the part American price tags leave out: sales tax is added at the register, not shown on the label, and table service is tipped on top.",
  useCases: [
    "Standing in a US store deciding whether a $79 jacket is worth it in rupees, without unlocking your phone.",
    "Checking a restaurant bill before you sign it, once tax and a tip have been added to the menu price.",
    "Sanity-checking a card statement against what you thought you spent, using a rule whose error you know.",
  ],
  benefits: [
    ["Rules you can actually run", "Quarters, halves, tenths and simple fractions — nothing needing a calculator."],
    ["Error stated, not hidden", "Each rule shows how far off it lands, so you know when to check exactly."],
    ["Tag price versus till price", "Sales tax and tip are applied in the right order, on the right base."],
  ],
  faqs: [
    [
      "What is the easiest way to convert dollars to rupees in my head?",
      "Round the rate to the nearest half or whole number and multiply. At ₹86 to the dollar, multiplying by 85 is the cleanest rule and lands about 1.2% low — on a $100 purchase that is a ₹100 error, which is fine for deciding whether to buy. Round the other way and multiply by 90 if you would rather over-estimate than be surprised by the card statement.",
    ],
    [
      "Why is the price at the checkout higher than the price on the label in the US?",
      "Because American shelf prices exclude sales tax, which is levied by state and often by city and county on top, and is added at the register. Rates commonly run between about 4% and 10% depending on where you are standing. Four states — Delaware, Montana, New Hampshire and Oregon — have no state sales tax at all, and Alaska has none at state level although some boroughs levy their own, so the same item genuinely costs different amounts in different places.",
    ],
    [
      "How much should I tip in the United States?",
      "For table service, 15% to 20% of the pre-tax bill is the normal range, with 18% a safe default and 20% for good service. Counter service, coffee shops and takeaway are lower or optional, though card terminals will often suggest a percentage anyway. Some restaurants add an automatic gratuity for larger groups, so check the bill before adding a tip on top of one.",
    ],
    [
      "How many rupees is 100 dollars?",
      "It is 100 times whatever rate you are quoted, so at ₹86 to the dollar it is ₹8,600 — but that is the mid-market figure, and it is not what you will pay. An Indian debit or credit card used abroad typically carries a 3–3.5% cross-currency markup plus GST on that fee, so the same $100 lands closer to ₹8,900 on the statement. Enter the rate your card or forex card actually gives you rather than the headline rate.",
    ],
  ],
};

export default seo;
