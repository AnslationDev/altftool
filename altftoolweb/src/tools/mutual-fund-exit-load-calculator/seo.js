const seo = {
  title: "Mutual Fund Exit Load Calculator with STT & Free Exit",
  metaDescription:
    "Exit load on redemption value, the 10% free-exit allowance, 0.001% STT on equity schemes, and the rupees you save by waiting out the load period.",
  steps: [
    "Set \"Describe my holding by\" to Number of units or Amount invested, then enter \"Purchase NAV (INR)\", \"Current / applicable NAV (INR)\", \"Holding period (days since allotment)\" and a Scheme type of Equity-oriented (STT applies) or Debt / other (no STT).",
    "Enter \"Exit load (%)\", \"Load period (days)\" and \"Free-exit allowance (% of units held)\", or tap a preset such as \"Equity fund — 1% within 1 year\"; untick \"Redeem everything\" to redeem only part of the holding.",
    "\"Net redemption proceeds\" heads the result, itemised as Units free of load, Value attracting the load, Exit load, Securities transaction tax at 0.001%, Total deductions and Net gain after charges, with the rupees saved by waiting the remaining days. \"Copy result\" copies it.",
  ],
  intro:
    "Exit load is a charge on the redemption value of mutual fund units — units redeemed multiplied by the applicable NAV — when you sell inside the holding period stated in the scheme information document. This calculator applies that rate, subtracts the free-exit allowance most equity schemes give on 10% of units, adds securities transaction tax of 0.001% for equity-oriented schemes, and returns the net proceeds. Useful before pressing redeem, because the load falls away entirely once the units cross the load period.",
  useCases: [
    "Checking what redeeming Rs 1.3 lakh of an equity fund at day 200 costs when the scheme charges 1% within 365 days.",
    "Seeing how much of a partial redemption escapes the load through the 10% free-exit facility.",
    "Deciding whether to wait out the remaining days of the load period before switching funds.",
  ],
  benefits: [
    [
      "Applies the free-exit allowance",
      "Only the units above the allowed 10% are charged, which is how open-ended equity schemes actually work.",
    ],
    [
      "Includes STT",
      "Equity-oriented redemptions carry 0.001% securities transaction tax, which the calculator deducts separately.",
    ],
    [
      "Tells you what waiting is worth",
      "Shows the days left in the load period and the rupees saved by staying invested through them.",
    ],
  ],
  faqs: [
    [
      "Is exit load charged on the profit or on the whole redemption amount?",
      "On the whole redemption amount — units redeemed multiplied by the applicable NAV. A 1% load on a Rs 1,30,000 redemption is Rs 1,300 whether the gain was Rs 30,000 or nil.",
    ],
    [
      "What is the 10% free exit rule in equity funds?",
      "Most open-ended equity schemes allow up to 10% of the units held to be redeemed without exit load even inside the load period, with the load applying only to the balance. The exact allowance and how it is counted appear in the scheme information document, so confirm it there.",
    ],
    [
      "Do ELSS and index funds charge exit load?",
      "ELSS schemes carry no exit load because units are locked in for three years anyway. Many index funds and ETFs also charge nothing, while liquid funds charge a graded load from 0.0070% on day one falling to 0.0045% on day six and nil from day seven.",
    ],
    [
      "Where does the exit load money go?",
      "Back into the scheme. Regulation 51A of the SEBI (Mutual Funds) Regulations, 1996 requires exit load to be credited to the scheme itself, so it benefits the investors who stay rather than the AMC.",
    ],
  ],
};

export default seo;
