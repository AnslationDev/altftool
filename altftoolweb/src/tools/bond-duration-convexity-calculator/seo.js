const seo = {
  title: "Bond Duration & Convexity Calculator",
  metaDescription:
    "Get Macaulay and modified duration, convexity and the approximate 1% yield price move, with the discounted cash flow schedule behind every number.",
  steps: [
    "In the Inputs panel enter \"Face value\", \"Annual coupon rate (%)\", \"Yield to maturity (%)\" and \"Years to maturity\", then set \"Payments per year\" to Annual, Semiannual or Quarterly.",
    "The Result panel recalculates as you type — there is no submit button — or load the \"8-year bond\" chip from the Examples row to start from 1000 face, 6% coupon, 7% yield over 8 years.",
    "Read modified duration as the headline with the price in the caption, the \"Macaulay duration\", \"Convexity\" and \"Approx. 1% yield price change\" rows, and the Period / Years / Cash flow / Present value schedule; Copy or Download saves bond-duration-convexity-calculator.txt.",
  ],
  intro:
    "The Bond Duration & Convexity Calculator discounts every coupon and the final principal at the yield to maturity to produce a bond's price, then derives Macaulay duration as the present-value-weighted average time to cash flow, modified duration as Macaulay divided by (1 + yield per period), and convexity as the second-order term. It is for anyone judging how far a bond's price will move when yields shift — a portfolio manager sizing interest-rate risk, or a student checking a fixed-income exercise. It also prints the discounted cash flow schedule so the numbers can be traced rather than trusted.",
  useCases: [
    "Rates are expected to move a percentage point and you need to know how much a 10-year semiannual bond in your portfolio would lose before deciding whether to shorten duration.",
    "You are comparing two bonds with similar yields and want the one with lower modified duration because you cannot tolerate the price swing on the longer one.",
    "A textbook answer for Macaulay duration does not match yours, and you want the per-period present values laid out to find where the two calculations diverge.",
  ],
  benefits: [
    [
      "Duration and convexity together",
      "Reports the first and second-order sensitivity in one pass, because duration alone systematically overstates the loss when yields rise.",
    ],
    [
      "Shows the cash flow schedule",
      "Prints period, time in years, cash flow and present value for each coupon, so a mismatch with your own model can actually be located.",
    ],
    [
      "Handles annual, semiannual and quarterly",
      "Discounting uses the periodic yield and periodic coupon, so the duration is correct for the payment frequency rather than assuming annual coupons.",
    ],
  ],
  faqs: [
    [
      "What is the difference between Macaulay and modified duration?",
      "Macaulay duration is the present-value-weighted average number of years until you receive the bond's cash flows, expressed in years. Modified duration divides that by (1 + yield per period) and expresses price sensitivity: a modified duration of 6.2 means roughly a 6.2 percent price fall for a 1 percentage point rise in yield.",
    ],
    [
      "How do I estimate a bond's price change from duration and convexity?",
      "Use the second-order approximation: percentage price change = -modified duration x change in yield + 0.5 x convexity x (change in yield)². For a 1 percentage point rise, that is -D x 0.01 plus 0.5 x C x 0.0001, which is exactly the figure this calculator reports. Convexity always adds back a little, which is why duration alone overstates losses and understates gains.",
    ],
    [
      "Why does a higher coupon give a shorter duration?",
      "Because more of the bond's value arrives early, so the weighted average time to cash flow falls. A zero-coupon bond has a Macaulay duration equal to its maturity, while a high-coupon bond of the same maturity has a noticeably shorter one — and is therefore less sensitive to rate moves.",
    ],
    [
      "Does this account for call features or credit risk?",
      "No. The calculation assumes a plain vanilla bond held to maturity, with fixed coupons, no default, and a single flat yield used to discount every cash flow. Callable, puttable and floating-rate bonds need effective duration computed from repriced scenarios, and any real investment decision should involve a qualified adviser rather than a screening calculation.",
    ],
  ],
};

export default seo;
