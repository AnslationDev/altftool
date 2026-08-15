const seo = {
  title: "Singapore GST Calculator – Add or Reverse 9% GST (9/109)",
  metaDescription:
    "Add 9% Singapore GST or reverse it out with the exact 9/109 fraction; historical 8% and 7% rates and the S$1 million registration test built in.",
  steps: [
    "Pick 'GST-exclusive (add GST)' or 'GST-inclusive (reverse GST)', then enter the Amount (SGD) and Quantity for the invoice line.",
    "Select the GST rate — 9% standard from 1 Jan 2024, 0% zero-rated, or the historical 8% and 7% rates for restating older supplies.",
    "Read the GST amount with the net and inclusive totals, check the S$1 million GST registration test below, then press Copy result.",
  ],
  intro:
    "This calculator converts between GST-exclusive and GST-inclusive amounts in Singapore at the 9% standard rate that has applied since 1 January 2024 under the Goods and Services Tax Act 1993. Adding GST multiplies the net amount by 1.09; reversing it out of an inclusive price multiplies by 9/109, the exact fraction rather than a rounded 8.26%. It also tests taxable turnover against the S$1 million compulsory registration threshold on both the retrospective and prospective bases.",
  useCases: [
    "A GST-registered supplier issuing a tax invoice that must show the net amount, the GST charged and the total separately.",
    "A finance team restating 2023 transactions at 8% and 2022 transactions at 7% while closing the books alongside current 9% entries.",
    "A founder tracking taxable turnover to see whether the S$1 million threshold is crossed retrospectively or is expected to be crossed in the next 12 months.",
  ],
  benefits: [
    ["Exact reverse fraction", "Uses 9/109 rather than a rounded decimal, so reversed GST matches to the cent."],
    ["Rate history built in", "Switch between 9%, 8% and 7% to price or restate supplies made under earlier rates."],
    ["Both registration tests", "Checks the retrospective calendar-year basis and the forward-looking 12-month basis in one place."],
  ],
  faqs: [
    [
      "What is the GST rate in Singapore now?",
      "9%, in force since 1 January 2024. It rose from 7% to 8% on 1 January 2023 and from 8% to 9% on 1 January 2024, the two-step increase announced in Budget 2022. Exports of goods and international services stay zero-rated at 0%.",
    ],
    [
      "How do I remove GST from a price in Singapore?",
      "Multiply the GST-inclusive price by 9 and divide by 109. A S$109 inclusive price contains S$9 of GST and S$100 net. Dividing by 1.09 gives the same answer; taking 9% of the inclusive figure does not, because GST is charged on the net amount.",
    ],
    [
      "When must a business register for GST in Singapore?",
      "When taxable turnover exceeds S$1 million — either at the end of the past calendar year (retrospective view) or where you reasonably expect to exceed it in the next 12 months (prospective view). Under the retrospective test notify IRAS by 30 January and registration starts 1 March; under the prospective test notify within 30 days.",
    ],
    [
      "Can I register for GST voluntarily below S$1 million?",
      "Yes. Voluntary registration lets you claim input tax on business purchases, but IRAS generally requires you to stay registered for at least two years and to comply with all filing obligations. Whether it is worthwhile depends on your customer mix, so discuss it with a tax agent.",
    ],
  ],
};

export default seo;
