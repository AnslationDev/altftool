const seo = {
  title: "NRE vs NRO Account Calculator: Post-Tax Maturity",
  metaDescription:
    "Compare the same deposit as NRE vs NRO: NRE interest is tax-exempt, NRO faces 31.2% TDS (or a DTAA rate), plus the USD 1 million repatriation cap.",
  steps: [
    "Enter the Deposit amount (INR), Interest rate (% per year), Tenure (years) and Compounding, plus Rupees per US dollar for the repatriation cap.",
    "Optionally tick \"Claim a treaty rate on the NRO interest\" and set the DTAA rate on interest (%) to replace the default withholding.",
    "Read \"Extra you keep by holding it as NRE\" and the NRE vs NRO table of maturity, tax withheld and post-tax yield, then press Copy result.",
  ],
  intro:
    "This comparator shows what the same deposit at the same interest rate is worth in an NRE account versus an NRO account, once Indian tax is applied. NRE interest is exempt under Section 10(4)(ii) of the Income-tax Act and carries no TDS, while NRO interest is taxable and withheld under Section 195 at 30% plus surcharge and 4% cess, so an NRO balance compounds net of tax. It also sets out the repatriation difference: NRE funds move out freely, NRO balances up to USD 1 million per financial year.",
  useCases: [
    "Deciding which account should hold a fixed deposit after moving abroad",
    "Estimating the TDS a bank will withhold on NRO interest before it hits the statement",
    "Checking whether a DTAA rate claimed with Form 10F is worth the paperwork",
  ],
  benefits: [
    ["Post-tax, not headline", "Compares maturity values after withholding, not just the quoted rate."],
    ["Treaty aware", "Swaps the 31.2% domestic rate for a lower DTAA rate on interest."],
    ["Repatriation limits", "Flags when an NRO balance exceeds the USD 1 million yearly ceiling."],
  ],
  faqs: [
    [
      "Is NRE interest tax free in India?",
      "Yes. Interest on an NRE account is exempt under Section 10(4)(ii) of the Income-tax Act for as long as you are a person resident outside India under FEMA, and no TDS is deducted. The exemption is Indian only, so the interest may still be taxable where you live.",
    ],
    [
      "What is the TDS rate on NRO interest?",
      "Interest paid to a non-resident is withheld under Section 195 at 30%, plus surcharge where the payment crosses Rs 50 lakh and 4% health and education cess, giving 31.2% in the ordinary case. A Double Taxation Avoidance Agreement can bring the rate down, often to 10% or 15%.",
    ],
    [
      "How much money can be sent abroad from an NRO account?",
      "Balances in an NRO account are repatriable up to USD 1 million per financial year under the FEMA remittance facility, supported by Forms 15CA and 15CB from a chartered accountant. NRE principal and interest have no such ceiling.",
    ],
    [
      "Which account should salary or rent from India be paid into?",
      "Income arising in India, such as rent, dividends, pension or the proceeds of an Indian asset sale, must go into an NRO account; an NRE account may only be credited with funds earned outside India. Many NRIs hold both, and a cross-border tax adviser can confirm the right split for your situation.",
    ],
  ],
};

export default seo;
