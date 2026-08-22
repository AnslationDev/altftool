const seo = {
  title: "VAT Calculator Saudi Arabia with 15% & 5% Rates",
  metaDescription:
    "Split 15% Saudi VAT from a riyal price with the 3/23 fraction or add it to a net amount, plus line discounts, 5% legacy rate and ZATCA thresholds.",
  steps: [
    "Choose the Direction — Remove VAT for a tax-inclusive price or Add VAT for a net one — then enter the unit price in SAR, Quantity and Line discount (%).",
    "Pick the VAT rate: 15% standard (from 1 July 2020), 5% legacy (Jan 2018 - Jun 2020) or 0% zero-rated supply.",
    "Read the taxable amount, VAT and total including VAT — the discount is applied before tax — then press Copy result.",
  ],
  intro:
    "This calculator splits Saudi VAT out of a tax-inclusive riyal price and adds it to a net price, using the standard 15% rate that has applied since 1 July 2020. Reverse extraction uses the fraction 15/115, which simplifies to 3/23, so an SAR 1,150 invoice contains exactly SAR 150 of VAT on an SAR 1,000 taxable amount. Line discounts, the legacy 5% rate for invoices dated between January 2018 and June 2020, and the ZATCA registration thresholds are all built in.",
  useCases: [
    "A Riyadh retail receipt shows only the SAR 2,300 total and you need the taxable amount and VAT for your accounts.",
    "Issuing a tax invoice where a 10% trade discount must be applied before VAT is calculated on the discounted line.",
    "Recalculating a credit note against an invoice issued in 2019, when the Saudi rate was still 5%.",
  ],
  benefits: [
    ["Correct reverse fraction", "Uses 3/23 rather than the common mistake of subtracting 15% from the gross figure."],
    ["Discount before tax", "Applies the line discount first, so the taxable amount matches what a compliant tax invoice must show."],
    ["Both rate eras", "Handles the 15% current rate and the 5% rate that applied until 30 June 2020."],
  ],
  faqs: [
    [
      "How do I remove 15% VAT from a price in Saudi Arabia?",
      "Multiply the VAT-inclusive amount by 15/115, which reduces to 3/23, or divide the total by 1.15 to get the net figure. On SAR 1,150 the VAT is SAR 150 and the taxable amount is SAR 1,000; subtracting 15% of the gross would wrongly give SAR 172.50.",
    ],
    [
      "What is the current VAT rate in Saudi Arabia?",
      "The standard rate is 15%, raised from 5% with effect from 1 July 2020 under Royal Order A/638. Exports outside the GCC, international transport and qualifying medicines and medical equipment are zero-rated, while residential rent and certain financial services are exempt.",
    ],
    [
      "When must a business register for VAT in Saudi Arabia?",
      "Registration with ZATCA is mandatory once annual taxable supplies exceed SAR 375,000. Voluntary registration is possible from SAR 187,500 of taxable supplies or expenses, which lets a small business recover input VAT.",
    ],
    [
      "Is VAT calculated before or after a discount?",
      "VAT is calculated on the discounted price, so the discount comes off first and the tax applies to the reduced taxable amount. A tax invoice must show the unit price, any discount and the taxable amount separately from the VAT charged, and a licensed adviser can confirm treatment for unusual rebates.",
    ],
  ],
};

export default seo;
