const seo = {
  intro:
    "The Discount Calculator works out what a marked-down item actually costs by applying each discount in sequence — the second discount is taken off the already-reduced price, not added to the first — and then adding sales tax to the discounted subtotal. Enter the original price, a discount rate, an optional stacked second discount and a tax rate up to 25%, and it returns the final price, total saved and tax amount together with a bar showing what share of the original price each part represents. It is built for shoppers and retail staff who need to check a till total or a coupon claim before paying.",
  useCases: [
    "A checkout screen shows '20% off, plus an extra 10% with the code' and you want to know whether that is 30% off or, as the maths actually works, 28% off the original price.",
    "You are comparing a $180 jacket at 40% off against a $150 one at 25% off and need the two after-tax totals side by side before deciding.",
    "A shop assistant quotes you a final figure that looks wrong, so you re-enter the ticket price, the promotion and your local sales tax rate to see whether the discount was applied before or after tax.",
  ],
  benefits: [
    [
      "Stacked discounts done correctly",
      "The second discount is applied to the post-first-discount price, matching how retailers actually compound coupons instead of summing the percentages.",
    ],
    [
      "Tax applied in the right order",
      "Sales tax is charged on the discounted subtotal, so the total matches a real receipt rather than taxing the pre-discount price.",
    ],
    [
      "Savings shown proportionally",
      "A single bar splits the original price into what you pay, what you save and what goes to tax, so the size of the deal is visible at a glance.",
    ],
  ],
  faqs: [
    [
      "Is 20% off plus an extra 10% off the same as 30% off?",
      "No — it comes to 28% off. The extra 10% is taken from the price after the first discount, so $100 becomes $80, then 10% of $80 is $8 off, leaving $72. The calculator applies stacked discounts in this sequential order by default.",
    ],
    [
      "How do I calculate a discounted price by hand?",
      "Multiply the original price by (100 minus the discount percentage) divided by 100 — a $50 item at 30% off is 50 × 0.70 = $35. For a second stacked discount, repeat the same step on that result rather than adding the two rates together.",
    ],
    [
      "Is sales tax charged before or after the discount?",
      "After. In practice tax is calculated on the discounted subtotal, which is what this tool does: it discounts first, then applies the tax rate you set (anything from 0% up to 25%) to the reduced amount.",
    ],
    [
      "Can I work out the discount percentage from the sale price?",
      "Yes — divide the amount saved by the original price and multiply by 100. If a $120 item now sells for $90, the saving is $30, and 30 ÷ 120 × 100 gives 25% off. Adjusting the discount slider until the final price matches gives you the same answer.",
    ],
  ],
};

export default seo;
