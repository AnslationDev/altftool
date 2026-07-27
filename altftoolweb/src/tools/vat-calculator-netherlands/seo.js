const seo = {
  intro:
    "This calculator adds Dutch BTW to a net amount or reverses it out of a gross one at the 21% hoog tarief, the 9% laag tarief or the nultarief. Adding tax multiplies by 1.21; the reverse calculation divides by 1.21, which means the BTW inside a standard-rated gross price is 21/121 of it, about 17.36%. It also nets output BTW against voorbelasting for a return period and checks the 20,000 EUR KOR turnover limit.",
  useCases: [
    "Quoting a Dutch client a bruto figure from a net day rate so the invoice and the payment match to the cent.",
    "Reversing the 9% BTW out of a 109 EUR restaurant or bookshop receipt to record 100 EUR net in your administratie.",
    "Working out a quarterly BTW-aangifte position: 2,100 EUR charged on sales minus 800 EUR voorbelasting leaves 1,300 EUR to pay.",
  ],
  benefits: [
    ["Both directions", "Add BTW or reverse it out of an inclusive price with one toggle."],
    ["Return-ready netting", "Subtracts voorbelasting from output BTW and shows whether you pay or reclaim."],
    ["KOR limit check", "Tests annual turnover against the 20,000 EUR kleineondernemersregeling threshold."],
  ],
  faqs: [
    [
      "What is the BTW rate in the Netherlands?",
      "The hoog tarief is 21% and has applied since 1 October 2012. A 9% laag tarief covers food and drink, medicines, books, water, hairdressers, bicycle repairs and cultural admissions. A 0% nultarief applies to exports and intra-EU supplies, and to solar panels on and near homes since 1 January 2023.",
    ],
    [
      "How do I calculate BTW backwards from a gross price?",
      "Divide the inclusive amount by 1.21 at the 21% rate or by 1.09 at the 9% rate, then subtract to get the tax. A 121 EUR gross invoice is 100 EUR net plus 21 EUR BTW. Taking 21% off the gross figure instead would understate the net by about 4 EUR, which is the most common Dutch invoicing error.",
    ],
    [
      "What is the KOR turnover limit?",
      "The kleineondernemersregeling is open to businesses with no more than 20,000 EUR of Dutch turnover in a calendar year. Opting in means you charge no BTW and file no returns, but you also cannot reclaim voorbelasting on your costs, so it usually suits businesses with low input VAT.",
    ],
    [
      "How often do I file a BTW return?",
      "Most Dutch businesses file quarterly, with the return and payment due by the last day of the month after the quarter ends. The Belastingdienst can set monthly filing for large amounts or annual filing for small ones. Confirm your own frequency on your Belastingdienst letter or with a boekhouder.",
    ],
  ],
};

export default seo;
