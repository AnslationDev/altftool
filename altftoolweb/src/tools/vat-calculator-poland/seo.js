const seo = {
  intro:
    "This calculator converts Polish prices between netto and brutto at the 23% stawka podstawowa and the 8% and 5% reduced rates set by the ustawa o VAT. Adding tax multiplies the net figure by 1.23; the reverse calculation — the metoda w stu — divides the gross figure by 1.23, so the VAT inside a standard-rated price is 23/123 of it. It also tests the PLN 200,000 art. 113 exemption limit and flags invoices above PLN 15,000 gross that may need split payment.",
  useCases: [
    "Preparing a faktura where the client agreed a PLN 1,230 gross fee and you need the PLN 1,000 netto and PLN 230 VAT lines.",
    "Reversing 8% VAT out of a PLN 1,080 hotel or restaurant invoice to book PLN 1,000 as a business cost.",
    "Checking whether a jednoosobowa działalność that started in July is still inside the pro-rated art. 113 exemption limit.",
  ],
  benefits: [
    ["All Polish rates", "23%, 8%, 5% and 0% side by side, plus a custom rate for historic comparisons."],
    ["Pro-rated exemption limit", "Scales the PLN 200,000 limit by the number of months traded, as art. 113 ust. 9 requires."],
    ["Split payment flag", "Marks any invoice over PLN 15,000 gross, the value test for mandatory MPP."],
  ],
  faqs: [
    [
      "What is the VAT rate in Poland?",
      "The standard rate (stawka podstawowa) is 23% and has applied since 1 January 2011. Reduced rates are 8% for medicines, hotels, restaurant meals, passenger transport and housing construction, and 5% for basic foodstuffs, books and baby products. Exports and intra-EU supplies are taxed at 0%.",
    ],
    [
      "How do I calculate netto from brutto in Poland?",
      "Divide the gross amount by 1.23 at the 23% rate, by 1.08 at 8% or by 1.05 at 5%. A PLN 123 gross invoice is PLN 100 netto and PLN 23 VAT. Polish accountants call this the metoda w stu, because the tax is 23/123 of the gross rather than 23% of it.",
    ],
    [
      "What is the VAT exemption limit in Poland?",
      "The zwolnienie podmiotowe under art. 113 applies to annual sales, excluding tax, of up to PLN 200,000. A business that starts mid-year gets a proportional limit — six months of trading gives PLN 100,000. Some activities, including legal advice, consultancy and jewellery, are excluded from the exemption regardless of turnover.",
    ],
    [
      "When is split payment mandatory in Poland?",
      "Mechanizm podzielonej płatności is compulsory when an invoice total exceeds PLN 15,000 gross and covers goods or services listed in załącznik nr 15 to the ustawa o VAT, such as construction, electronics, steel and fuel. Below that value, or outside that list, split payment is voluntary. Confirm the classification with a księgowy before relying on it.",
    ],
  ],
};

export default seo;
