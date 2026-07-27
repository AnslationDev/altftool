const seo = {
  intro:
    "A coupon graphic is the image that carries a promo code, the offer, the expiry date and the small print, and this generator builds one while working out what the discount is actually worth. Percent off is capped at any maximum discount you set, amount off is limited to the order value so a basket can never go below zero, buy-X-get-Y is converted to its true effective rate — buy 2 get 1 free is a 33.3% saving, not 50% — and free shipping is checked against the minimum spend. It also assembles the terms line and counts the days to expiry in whole UTC days.",
  useCases: [
    "Publish a launch-week code as an Instagram post, a story and a 1200x400 email banner from one set of inputs.",
    "Check whether a 'buy 2 get 1 free' offer is more or less generous than a flat 30% off before you commit to it.",
    "See how a maximum discount cap changes the real percentage a big-basket customer receives.",
    "Produce a printable 1500x600 voucher with the code, expiry and full terms line already laid out.",
  ],
  benefits: [
    ["Honest offer maths", "Effective discount is calculated from the mechanics, so the headline matches what the customer will actually save."],
    ["Terms line assembled", "Expiry, minimum spend, discount cap, usage limit and exclusions are combined into one compliant-looking sentence."],
    ["Code sanity checks", "Warns on codes under 4 characters, which are trivially guessable, and over 15, which people mistype on a phone."],
  ],
  faqs: [
    [
      "Is buy one get one free the same as 50% off?",
      "Yes for a 1-for-1 offer, but not otherwise. The effective discount is the free quantity divided by the total items received: buy 1 get 1 free is 1 ÷ 2 = 50%, while buy 2 get 1 free is 1 ÷ 3 = 33.3%. Comparing a BOGO against a flat percentage needs that conversion.",
    ],
    [
      "What has to appear on a discount coupon?",
      "The material conditions of the offer: the expiry date, any minimum spend, any maximum discount, whether it can be combined with other offers, and the main exclusions. Advertising regulators in most markets expect those to sit with the offer rather than only behind a link. This is general information, not legal advice — check your local rules.",
    ],
    [
      "How long should a promo code be?",
      "Between about 4 and 15 characters. Shorter codes are easy to guess and get shared on deal sites; longer ones get mistyped on a phone keyboard and cost you completed checkouts. Uppercase letters, digits and hyphens only avoids ambiguity at entry.",
    ],
    [
      "How does a maximum discount cap change the offer?",
      "It converts a percentage into a flat ceiling once the basket is large enough. A 50% off code capped at $20 gives the full 50% on a $40 order but only 20% on a $100 one, and this tool shows the effective rate for the order value you enter.",
    ],
  ],
};

export default seo;
