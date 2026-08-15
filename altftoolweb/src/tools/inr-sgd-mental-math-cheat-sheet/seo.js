const seo = {
  title: "SGD to INR Mental Math: Rounding Rules and ++ Bills",
  metaDescription:
    "Turns today's rate into a round multiplier you can run at a till, states each rule's error, and compounds a ++ menu price through service charge then GST.",
  steps: [
    "Enter Rupees per S$1 (today's rate) and a menu or tag price in Singapore dollars, then set the Service charge (%) and GST (%) that apply.",
    "The sheet rewrites the rate as a decimal shift plus a working multiplier and tests a Quick rule, a Tuned rule and a Fraction rule, stating how far each lands from the exact answer.",
    "Read Best rule to memorise, How far off that rule is, Bill total after ++ and Add-ons broken down, then press Copy sheet to keep the ladder on your phone.",
  ],
  intro:
    "This cheat sheet turns today's rupee to Singapore dollar rate into a multiplication you can run at a till. It rewrites the rate as a decimal shift plus a working multiplier between 1 and 10, then tests rounding to the nearest quarter or half, an easy percentage nudge, and the closest simple fraction, reporting each rule's error as a fixed percentage of the exact answer. It also converts a \"++\" menu price, where a 10% service charge goes on first and GST is then charged on the total including it — a compounding that adds a fifth, not 19%.",
  useCases: [
    "Deciding at Orchard Road whether a S$180 pair of shoes is worth it in rupees, without opening an app.",
    "Reading a restaurant menu marked ++ and knowing what the bill will actually say.",
    "Comparing a hawker centre lunch with a mall food court in rupees, when only one of them carries service charge.",
  ],
  benefits: [
    ["Rules you can actually run", "Round multipliers, easy percentage nudges and simple fractions only."],
    ["Error stated, not hidden", "Every rule shows how far it lands from the exact answer, in percent and rupees."],
    ["++ decoded", "Service charge and GST are compounded in the right order, as a Singapore bill does it."],
  ],
  faqs: [
    [
      "How do I convert Singapore dollars to rupees in my head?",
      "Multiply by the rate rounded down to the nearest 5 and then add a small nudge. At a rate near ₹66 to the Singapore dollar, multiplying by 65 and adding 2.5% lands under 1% from the exact answer, while multiplying by 65 alone is about 1.5% low — fine for a hawker meal, less so for a S$1,500 phone. Round up to 70 instead if you would rather over-estimate.",
    ],
    [
      "What does ++ mean on a Singapore menu?",
      "It means the price excludes the service charge and GST, both of which are added to your bill. The service charge, normally 10%, is applied to the menu price first and GST is then charged on that larger total, so the two compound: at 10% and 9% GST the multiplier is 1.10 × 1.09 = 1.199, about 20% on top. A S$50 main becomes S$59.95 on the bill.",
    ],
    [
      "Is GST included in Singapore shop prices?",
      "Yes for retail. Singapore requires displayed prices to include GST, which rose to 9% on 1 January 2024, so what you see on a shop tag is what you pay. The exception is food and beverage outlets that levy a service charge, which are permitted to advertise before charges provided the ++ is made clear — which is why hawker centres and food courts feel so much cheaper than a comparable restaurant dish.",
    ],
    [
      "Can I claim GST back when leaving Singapore?",
      "Yes, on eligible goods you are taking out of the country, through the electronic tourist refund scheme at Changi and Seletar. You must spend at least S$100 including GST at participating retailers — up to three same-day receipts from the same retailer and shop can be combined — and you claim at a self-help kiosk before departure. Refunds are net of the operator's handling fee, so the amount received is less than the full 9%; check the current rules with Singapore Customs before relying on it.",
    ],
  ],
};

export default seo;
