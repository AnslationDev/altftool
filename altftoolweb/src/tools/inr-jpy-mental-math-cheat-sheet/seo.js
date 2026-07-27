const seo = {
  intro:
    "This cheat sheet turns today's rupee-yen rate into a multiplication you can run at a till. It rewrites the rate as a decimal shift plus a working multiplier between 1 and 10, then tests rounding to the nearest quarter or half, an easy percentage nudge, and the closest simple fraction, reporting each rule's error as a fixed percentage of the exact answer. Because yen prices run in hundreds and thousands, the decimal shift does most of the work — the rule is usually \"drop a zero, then roughly halve it\". It also handles Japan's consumption tax, which is 10% but drops to a reduced 8% on food and non-alcoholic drinks taken away.",
  useCases: [
    "Standing in a Tokyo electronics shop working out whether a ¥98,000 camera is worth it in rupees.",
    "Deciding at a bakery or convenience store counter whether to eat in or take away, and seeing what the difference actually is.",
    "Checking a shinkansen fare or a Japan Rail Pass price against your trip budget in rupees.",
  ],
  benefits: [
    ["Built for yen-sized numbers", "The decimal shift is treated as a free step, which is exactly how yen prices work."],
    ["Error stated, not hidden", "Each rule reports how far it lands from the exact answer, in percent and in rupees."],
    ["Eat-in vs takeaway priced", "The 10% and reduced 8% rates are applied to the same pre-tax base, so the gap is real."],
  ],
  faqs: [
    [
      "How do I convert yen to rupees in my head?",
      "Drop a zero and then take a bit over half. At a rate near ₹0.57 to the yen, dropping a zero and multiplying by 5.5 gives ₹0.55 per yen and lands about 3.5% low; adding 2.5% to that result brings it inside about 1%. So ¥3,000 becomes 300, then 1,650, then about ₹1,690 against an exact ₹1,710.",
    ],
    [
      "Is tax included in Japanese prices?",
      "Yes. Total-price display has been mandatory in Japan since April 2021, so the number on the shelf, menu or vending machine already includes consumption tax. Some shops still show the pre-tax figure in smaller type alongside, marked 税抜, with the tax-included price marked 税込 — if you see two numbers, the larger one is what you pay.",
    ],
    [
      "Why is eating in more expensive than taking away in Japan?",
      "Because consumption tax is 10% on food eaten on the premises but a reduced 8% on food and non-alcoholic drinks taken away, which is why the counter staff ask. On an item with a pre-tax price of ¥1,000, eating in costs ¥1,100 and taking it away costs ¥1,080 — a ¥20 difference on that item, and more on a larger order. Alcohol is charged at the standard 10% either way.",
    ],
    [
      "Do I need to tip in Japan?",
      "No. Tipping is not customary in Japan and leaving cash on a table is more likely to cause confusion than pleasure; staff will often chase you down to return it. Some hotels and upmarket restaurants add a service charge to the bill instead, which will be printed on it. That makes the yen unusually easy to budget for: the price you read is the price you pay.",
    ],
  ],
};

export default seo;
