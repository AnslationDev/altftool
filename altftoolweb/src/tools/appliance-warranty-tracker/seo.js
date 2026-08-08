const seo = {
  title: "Appliance Warranty Tracker: Comprehensive + Part Cover",
  metaDescription:
    "Tracks both clocks, the 1-2 year comprehensive and the 10-year compressor or motor cover, plus AMC renewals and the 2-year Section 69 window.",
  steps: [
    "Under \"Add an appliance\", enter a Nickname, pick the Appliance type and set the Purchase date, Price paid (₹) and AMC cost per year (₹, 0 if none).",
    "Press Add appliance for each item; the date field beside it is the reference date used for every countdown.",
    "Read \"Appliances still in warranty\", the next-to-lapse date and AMC as share of value, then press Copy list — entries are saved in browser storage.",
  ],
  intro:
    "The Appliance Warranty Tracker keeps both warranty clocks that run on every Indian appliance: the comprehensive cover on the whole unit, usually one or two years, and the far longer cover on one key part — typically ten years on a refrigerator compressor or washing machine motor. Enter the purchase date once and it dates the end of each, flags whether the extended-warranty purchase window is still open, schedules AMC renewals, and shows the two-year complaint deadline set by Section 69 of the Consumer Protection Act, 2019. Everything is stored in your own browser.",
  useCases: [
    "Catching that a fridge's comprehensive cover lapses next month while its compressor is covered for another eight years",
    "Deciding whether an AMC quote is worth it by comparing annual AMC spend against the total value of the appliances",
    "Keeping one list of purchase dates and prices so a service centre call does not start with hunting for the invoice",
  ],
  benefits: [
    ["Two clocks, not one", "Part warranty is tracked separately, so you do not pay for a compressor that is still covered."],
    ["Extended-warranty window", "The tool tells you whether you can still buy extra cover, which usually has to happen before the original lapses."],
    ["Stays on your device", "The list is saved in browser storage — no account, no upload, nothing sent anywhere."],
  ],
  faqs: [
    [
      "How long is the warranty on a refrigerator in India?",
      "Typically one year comprehensive on the whole unit plus ten years on the compressor, though some brands offer two years comprehensive. The compressor cover normally pays for the part only — gas charging, labour and the visit charge are usually billed separately once the comprehensive year is over.",
    ],
    [
      "Can I buy an extended warranty after the original expires?",
      "Almost never. Extended warranty plans generally have to be purchased while the manufacturer's comprehensive warranty is still running, often within the first 30 to 90 days of purchase for the cheapest tiers. Once the original cover lapses, your remaining options are an AMC or paying per repair.",
    ],
    [
      "How long do I have to file a consumer complaint about a faulty appliance?",
      "Two years from the cause of action, under Section 69 of the Consumer Protection Act, 2019. A consumer forum can admit a later complaint if you show sufficient cause for the delay, but the two-year window is the default. Keep the invoice and warranty card, since both are usually required. This is general information, not legal advice.",
    ],
    [
      "Is an appliance AMC worth the money?",
      "Compare the annual AMC cost with the replacement value: as a rough guide, an AMC above roughly 8–10% of the appliance's value per year is hard to justify unless spare parts are expensive or the unit is critical, such as a lift or a water purifier. A comprehensive AMC that includes parts is worth far more than a labour-only contract, so check which one is quoted.",
    ],
  ],
};

export default seo;
