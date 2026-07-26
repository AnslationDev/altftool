const seo = {
  intro:
    "This calculator works out the interest you owe under Section 234B for paying less than 90% of your tax as advance tax, and under Section 234C for missing the 15 June, 15 September, 15 December and 15 March instalment percentages. It applies the 1% per month simple rate, the 12% and 36% safe harbours for the first two instalments, and the Rule 119A rounding to the nearest ₹100. It is meant for freelancers, consultants, traders and salaried people with big capital gains or interest income who pay tax outside TDS.",
  useCases: [
    "A freelancer who paid nothing by 15 June and caught up only in December, checking how much 234C deferment interest that costs.",
    "A salaried taxpayer with large capital gains filing in July, estimating 234B interest from 1 April of the assessment year to the day the self-assessment tax is paid.",
    "A 44ADA professional confirming that a single 15 March payment of the full liability avoids 234C entirely.",
  ],
  benefits: [
    ["Instalment-level breakdown", "Shows the required amount, what you paid and the interest for each of the four due dates."],
    ["Safe harbours applied", "Automatically waives 234C where 12% is paid by 15 June or 36% by 15 September."],
    ["Correct 234B month count", "Counts from 1 April of the assessment year and treats any part of a month as a full month."],
  ],
  faqs: [
    [
      "What is the difference between Section 234B and Section 234C?",
      "234B is charged when the advance tax you paid during the year is less than 90% of the assessed tax, and runs at 1% per month from 1 April of the assessment year until the balance is paid. 234C is a one-off deferment charge for missing the prescribed percentage at each instalment date.",
    ],
    [
      "What are the advance tax instalment percentages?",
      "For regular taxpayers, 15% by 15 June, 45% cumulative by 15 September, 75% by 15 December and 100% by 15 March. Taxpayers under the presumptive schemes 44AD and 44ADA pay 100% in a single instalment by 15 March.",
    ],
    [
      "Who does not have to pay advance tax?",
      "Advance tax is not payable where the tax due after TDS and TCS is below ₹10,000. A resident senior citizen aged 60 or above with no income from business or profession is also exempt, so neither 234B nor 234C applies to them.",
    ],
    [
      "Is 234C interest charged if I miss an instalment but pay a little?",
      "There is relief on the first two instalments only. Paying at least 12% of the assessed tax by 15 June or 36% by 15 September removes the charge for that instalment; otherwise interest runs at 1% per month for three months on the shortfall.",
    ],
  ],
};

export default seo;
