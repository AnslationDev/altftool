const seo = {
  title: "STCG Calculator on Shares: Section 111A at 20%",
  metaDescription:
    "Section 111A tax on listed equity sold within 12 months: 20% from 23 July 2024, 15% before, plus 4% cess. Deducts brokerage; STT is not deductible.",
  steps: [
    "Enter Purchase price per share, Sale price per share, Number of shares, \"Brokerage and transfer charges (INR)\", and the Purchase date and Sale date that decide the holding period.",
    "Set \"Total income other than these gains\", the Tax regime (New regime Section 115BAC or Old regime with an age band), the surcharge on your total income, and tick \"Resident individual or HUF\" to allow the basic exemption adjustment.",
    "Read the tax payable on the trade, the holding period in days, the basic exemption actually used, the taxable gain and the cess at 4%, plus the STT on both legs listed as not deductible; \"Copy result\" exports the whole working.",
  ],
  intro:
    "Short term capital gains on listed equity are taxed under Section 111A: shares or equity-oriented fund units held for not more than 12 months, sold on a recognised exchange with securities transaction tax paid, attract a flat 20% for transfers made on or after 23 July 2024 and 15% before that, plus surcharge and 4% cess. This calculator applies the holding-period test from your actual purchase and sale dates, deducts brokerage and transfer charges as Section 48 permits, refuses to deduct STT as Section 48 requires, and applies the basic exemption adjustment available to a resident individual whose other income falls short of the limit.",
  useCases: [
    "An investor who sold within a few months checking the tax before setting money aside for advance tax.",
    "Someone comparing a sale just before and just after the 12-month mark to see the difference between Section 111A and Section 112A.",
    "A taxpayer with little other income working out how much of the unused basic exemption can absorb the gain.",
  ],
  benefits: [
    ["Correct rate by date", "Picks 15% or 20% from the actual transfer date rather than assuming one rate."],
    ["Section 48 applied properly", "Brokerage and transfer charges reduce the gain; securities transaction tax does not."],
    ["Basic exemption adjustment", "Sets the unexhausted basic exemption against the gain, as the proviso to Section 111A allows."],
  ],
  faqs: [
    [
      "What is the short term capital gains tax rate on shares in India?",
      "20% under Section 111A for transfers made on or after 23 July 2024, up from 15% before that date, plus applicable surcharge and a 4% health and education cess. The rate applies to listed equity shares and equity-oriented fund units held for not more than 12 months where securities transaction tax has been paid.",
    ],
    [
      "Can I deduct brokerage and STT from my capital gains?",
      "Brokerage, exchange transaction charges, stamp duty, SEBI fees and the GST on them are deductible under Section 48 as expenditure incurred wholly and exclusively in connection with the transfer. Securities transaction tax is specifically not deductible, even though paying it is what makes the concessional Section 111A rate available in the first place.",
    ],
    [
      "How long do I have to hold shares to avoid short term capital gains?",
      "More than 12 months for listed equity shares and equity-oriented fund units. Sell on or before the 12-month anniversary of purchase and the gain is short term under Section 111A; sell after it and the gain falls under Section 112A instead. Unlisted shares have a different holding period, so this test does not apply to them.",
    ],
    [
      "Can the basic exemption limit reduce my short term capital gains tax?",
      "Yes, for a resident individual or HUF. Under the proviso to Section 111A(1), if your income other than these gains is below the basic exemption limit, the unused part can be set against the short-term gains before tax is charged. Someone in the new regime with ₹2,50,000 of other income has ₹1,50,000 of unused exemption to absorb the gain. Note that the Section 87A rebate is not available against income taxed at these special rates — check your position with a chartered accountant.",
    ],
  ],
};

export default seo;
