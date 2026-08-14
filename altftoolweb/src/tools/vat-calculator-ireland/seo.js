const seo = {
  title: "VAT Calculator Ireland – 23%, 13.5%, 9% & 4.8% Rates",
  metaDescription:
    "Add or remove Irish VAT at 23%, 13.5%, 9%, 4.8% or zero, see net, VAT and gross, and check the €85,000/€42,500 registration thresholds.",
  steps: [
    "Choose Add VAT or Remove VAT, type the figure into the Net amount (excluding VAT) or Gross amount (including VAT) field, and pick a band from the VAT rate dropdown — 23%, 13.5%, 9%, 4.8%, zero or Custom rate.",
    "Read the Total including VAT (or Price excluding VAT) headline with the net, VAT and gross breakdown, plus the table showing the same net price at every Irish rate.",
    "Answer 'Do I have to register with Revenue?' by picking what you supply and entering Turnover, any 12-month period, to get a Registration required or Below the threshold verdict, then use Copy result or Reset.",
  ],
  intro:
    "This calculator adds Irish VAT to a net price or strips it out of a VAT-inclusive one at the 23% standard rate, the 13.5% reduced rate, the 9% second reduced rate, the 4.8% livestock rate or zero. Adding VAT multiplies the net figure by 1.23 at the standard rate; removing it divides the gross by 1.23, so the tax inside a standard-rated price is 23/123, roughly 18.7%. It also checks turnover against the Revenue registration thresholds of 85,000 EUR for goods and 42,500 EUR for services.",
  useCases: [
    "Pricing professional services in Ireland, where a 1,000 EUR net fee becomes a 1,230 EUR invoice at the 23% standard rate.",
    "Splitting a 113.50 EUR builder's invoice at 13.5% into 100 EUR net and 13.50 EUR VAT for a repairs and maintenance account.",
    "Deciding whether a growing consultancy has passed the 42,500 EUR services threshold in any rolling 12-month period and must register.",
  ],
  benefits: [
    ["Every Irish rate", "23%, 13.5%, 9%, the unusual 4.8% livestock rate and zero, all in one place."],
    ["Two-way conversion", "Add VAT to a net figure or reverse it out of a gross one without retyping."],
    ["Threshold check by activity", "Applies the right 85,000 EUR or 42,500 EUR limit depending on what you supply."],
  ],
  faqs: [
    [
      "What is the VAT rate in Ireland?",
      "The standard rate is 23% and covers most goods and services, including professional services, alcohol and electrical goods. A 13.5% reduced rate applies to construction services, heating fuel and veterinary fees, a 9% second reduced rate applies to newspapers, e-books and sporting facilities, and a 4.8% rate applies to livestock. Most food, oral medicines, children's clothing and books are zero-rated.",
    ],
    [
      "How do I work out VAT backwards from a gross price in Ireland?",
      "Divide the VAT-inclusive amount by 1.23 at the standard rate, or by 1.135 at 13.5% and 1.09 at 9%. A 123 EUR gross invoice is 100 EUR net plus 23 EUR VAT. Deducting 23% from the gross figure instead would leave 94.71 EUR, which is wrong by more than 5 EUR.",
    ],
    [
      "What is the VAT registration threshold in Ireland?",
      "From 1 January 2025 the thresholds are 85,000 EUR of turnover for supplies of goods and 42,500 EUR for supplies of services, measured over any continuous 12-month period rather than the calendar year. Businesses established outside Ireland that supply here have no threshold and must register from the first sale.",
    ],
    [
      "What is the difference between zero-rated and exempt in Ireland?",
      "Zero-rated supplies are taxable at 0%, so you can still reclaim input VAT on your costs, and they count toward the registration threshold. Exempt activities such as most financial services, insurance and education carry no VAT and no input recovery. Ask an accountant or check Revenue guidance before deciding which applies to you.",
    ],
  ],
};

export default seo;
