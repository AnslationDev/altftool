const seo = {
  title: "UK VAT Calculator: Add or Remove VAT at 20%, 5%",
  metaDescription:
    "Adds VAT to a net price or strips it from a gross one at 20%, 5% or 0%, with the HMRC VAT fraction and the 90,000 pound threshold check.",
  steps: [
    "Press Add VAT or Remove VAT, then enter the Net amount (excluding VAT) or Gross amount (including VAT).",
    "Choose the VAT rate — 20% standard, 5% reduced, 0% zero, or a Custom rate for historic comparisons.",
    "Read the net, VAT and gross lines with the VAT fraction of the gross price, and check turnover against the registration threshold.",
  ],
  intro:
    "This calculator adds UK VAT to a net price or strips it out of a VAT-inclusive one at the 20% standard rate, the 5% reduced rate or the 0% zero rate. At the 20% standard rate, adding VAT multiplies the net figure by 1.20 and removing it divides the gross figure by 1.20 — the same as taking the HMRC VAT fraction of 1/6; the 5% reduced rate instead uses a 1.05 multiplier and a 1/21 fraction, and the 0% zero rate leaves the figure unchanged. It is built for sole traders, small businesses and bookkeepers who need invoice-ready net, VAT and gross lines rounded to the penny.",
  useCases: [
    "Quoting a client a VAT-inclusive price when you only know your net day rate, so the figure on the invoice matches what they will actually pay.",
    "Splitting a supplier receipt that only shows a £240 total into £200 net and £40 VAT for your bookkeeping and Box 4 input tax.",
    "Checking whether a growing side business has crossed the £90,000 rolling 12-month taxable turnover threshold and must register with HMRC.",
  ],
  benefits: [
    ["Both directions", "Add VAT to a net price or reverse a gross price back to net and tax in one click."],
    ["Every statutory band", "Standard 20%, reduced 5% and zero 0% side by side, plus a custom rate for historic comparisons."],
    ["Penny-accurate", "Net, VAT and gross are rounded so the three lines always reconcile on an invoice."],
  ],
  faqs: [
    [
      "How do I remove VAT from a price in the UK?",
      "Divide the VAT-inclusive price by 1.20 to get the net amount, then subtract it from the total to get the VAT. On a £120 total that gives £100 net and £20 VAT. HMRC calls the shortcut the VAT fraction: at 20% the VAT is 1/6 of the gross price.",
    ],
    [
      "What is the current UK VAT rate?",
      "The standard rate is 20%, unchanged since 4 January 2011. A 5% reduced rate applies to things like domestic fuel and power, children's car seats and mobility aids for the over-60s, and a 0% zero rate covers most food, books, newspapers, children's clothing and public transport.",
    ],
    [
      "When do I have to register for VAT?",
      "You must register if your VAT-taxable turnover exceeded £90,000 in any rolling 12-month period, or if you expect to pass £90,000 in the next 30 days alone. The threshold rose from £85,000 on 1 April 2024. You can apply to deregister once turnover falls below £88,000.",
    ],
    [
      "What is the difference between zero-rated and VAT exempt?",
      "Zero-rated supplies are taxable at 0%, so you still charge VAT (at nothing) and can reclaim input VAT on your costs. Exempt supplies, such as most insurance, postage stamps and health services, are outside the charge, so you cannot reclaim the related input tax. The distinction changes what you can recover, so confirm your position with an accountant.",
    ],
  ],
};

export default seo;
