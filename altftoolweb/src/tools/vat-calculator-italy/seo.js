const seo = {
  intro:
    "This calculator adds Italian IVA to an imponibile or scorporates it out of a gross total, at the 22% aliquota ordinaria and the 10%, 5% and 4% reduced rates set by DPR 633/1972. Adding tax multiplies the base by 1.22; the scorporo divides the total by 1.22, so a 122 EUR invoice is 100 EUR imponibile plus 22 EUR of IVA. Freelancers, partite IVA and bookkeepers get invoice-ready lines rounded to the centesimo.",
  useCases: [
    "Issuing a fattura elettronica where the client agreed a 1,220 EUR gross fee and you need the 1,000 EUR imponibile and 220 EUR IVA lines.",
    "Scorporating a 110 EUR restaurant or hotel receipt at 10% into 100 EUR imponibile and 10 EUR IVA for expense claims.",
    "Checking whether a partita IVA in the regime forfettario is still under the 85,000 EUR revenue limit or has crossed the 100,000 EUR hard exit.",
  ],
  benefits: [
    ["All four aliquote", "22%, 10%, 5% and 4% in one place, plus a custom rate for historic comparisons."],
    ["Scorporo in one click", "Reverse a gross total back to imponibile and IVA without retyping anything."],
    ["Forfettario thresholds", "Distinguishes the 85,000 EUR limit from the 100,000 EUR immediate-exit rule."],
  ],
  faqs: [
    [
      "What is the VAT rate in Italy?",
      "The aliquota ordinaria is 22%, in force since 1 October 2013. Reduced rates are 10% for restaurants, hotels, domestic energy, many foods and renovation work, 5% for certain social and health services, and 4% for staple foods, books, newspapers, medical devices and first-home purchases.",
    ],
    [
      "How do I scorporate IVA from a gross total?",
      "Divide the total by 1.22 for the 22% rate, then subtract the result from the total. A 122 EUR total becomes 100 EUR imponibile and 22 EUR IVA. Equivalently, the tax is 11/61 of the gross price, about 18.03% — which is why subtracting a flat 22% from a gross figure gives the wrong answer.",
    ],
    [
      "What is the revenue limit for the regime forfettario?",
      "The regime is open to businesses with revenue up to 85,000 EUR a year. Between 85,000 and 100,000 EUR you leave the regime from the following calendar year; above 100,000 EUR it ends immediately and IVA is due from the operation that crossed the threshold.",
    ],
    [
      "What does 'non imponibile' mean on an Italian invoice?",
      "It marks a supply outside the charge rather than one taxed at zero — typically exports under article 8 or intra-EU supplies under article 41 of DL 331/1993. It is different from 'esente' (exempt under article 10), which restricts input tax recovery. A commercialista can confirm which wording your invoice needs.",
    ],
  ],
};

export default seo;
