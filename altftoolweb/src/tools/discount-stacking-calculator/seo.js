const seo = {
  intro:
    "The Discount Stacking Calculator works out what a basket really costs once a sale price, extra coupons, a flat voucher, a card offer, shipping, tax and cashback have all been applied in sequence. It uses the two rules that decide every stacked total: percentage discounts multiply rather than add, so 20% then 10% is 28% off, not 30%; and a percentage applied before a flat coupon always beats the reverse order by exactly the flat amount times the combined percentage. It is for shoppers comparing sale-day offers and for anyone who wants to know whether a card offer's cap makes a bigger basket worth it.",
  useCases: [
    "Check whether a 20% sale plus a Rs 500 voucher plus a 10% card offer capped at Rs 1,500 really beats a flat 40% off.",
    "Find out how much more to add to a basket to clear a free-shipping threshold after discounts are applied.",
    "See how much cashback with a Rs 200 cap is actually worth on a Rs 7,000 order.",
  ],
  benefits: [
    ["Correct compounding", "Multiplies percentage offers instead of adding them, so the headline saving is the real one."],
    ["Caps and minimums honoured", "Applies card-offer caps and minimum-spend rules exactly as the terms state them."],
    ["Cashback kept separate", "Shows what you pay at checkout and the lower effective cost after the rebate lands."],
  ],
  faqs: [
    [
      "Do stacked percentage discounts add up?",
      "No — they multiply. A 20% sale price followed by a 10% coupon leaves you paying 0.80 x 0.90 = 72% of list, so the combined discount is 28%, not 30%. On a Rs 10,000 basket that is Rs 200 less saved than the addition suggests.",
    ],
    [
      "Should a flat coupon be applied before or after a percentage discount?",
      "After. Applying a Rs 500 coupon after a combined 28% discount saves you Rs 140 more than applying it first, because the percentage would otherwise shrink the coupon by 28%. In general the gap equals the coupon amount times the combined percentage.",
    ],
    [
      "Does a card offer apply to the price before or after coupons?",
      "Most Indian bank instant-discount terms compute the percentage on the post-coupon order value, which is what this calculator does. So a 10% card offer capped at Rs 1,500 on a basket reduced to Rs 6,700 gives Rs 670, not Rs 1,000 on the Rs 10,000 list price.",
    ],
    [
      "Is cashback the same as a discount?",
      "No. A discount lowers the amount you pay at checkout; cashback is credited afterwards, so your card is still charged the full payable amount. This calculator reports both — the checkout figure and the lower effective cost once the cashback arrives.",
    ],
  ],
};

export default seo;
