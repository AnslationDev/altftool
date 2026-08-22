const seo = {
  title: "Sales Tax Calculator: Add or Remove Tax",
  metaDescription:
    "Add sales tax to a price or back it out of a tax-inclusive total by dividing by 1 + rate — see subtotal, tax, total and effective tax share at any rate.",
  steps: [
    "Enter the Amount and Sales Tax Rate (%) — 8.25 is prefilled — and set Calculation to Add Sales Tax or Price Already Includes Tax",
    "The calculator multiplies by (1 + rate ÷ 100) to add tax, or divides by it to back tax out of a tax-inclusive price",
    "Read the Subtotal, Sales Tax, Total, Tax Rate and Effective Tax rows, then press Copy to copy the breakdown",
  ],
  intro:
    "Sales Tax Calculator works in both directions: it adds tax to a pre-tax price with total = amount × (1 + rate ÷ 100), or backs the tax out of a tax-inclusive price with subtotal = amount ÷ (1 + rate ÷ 100). Enter any amount and any rate — 8.25% is the starting example — and it returns the subtotal, the tax in currency, the total, and the tax as a percentage of the total. It is built for shoppers checking a receipt and for anyone splitting an invoice into net and tax lines.",
  useCases: [
    "A receipt shows only the grand total and you need the pre-tax figure to file the purchase as a business expense.",
    "You are quoting a client a round tax-inclusive number and want to know what your actual net revenue on that job is.",
    "You are comparing a price in a 6% county with one in an 8.25% county and want the real out-the-door difference rather than the shelf price.",
  ],
  benefits: [
    [
      "Reverses tax as easily as it adds it",
      "The 'Price Already Includes Tax' mode divides by (1 + rate ÷ 100) instead of multiplying, so you get the true subtotal rather than the common mistake of subtracting the rate from the total.",
    ],
    [
      "Shows the effective share, not just the rate",
      "Alongside the nominal rate it reports tax as a percentage of the total — 8.25% added to a price is only 7.62% of what you actually pay, which is the figure receipts reflect.",
    ],
    [
      "Accepts any rate you type",
      "Rates are free-entry to two decimals, so combined state-plus-county-plus-city rates like 9.375% work exactly as typed instead of being rounded to a preset.",
    ],
  ],
  faqs: [
    [
      "How do I calculate sales tax on a purchase?",
      "Multiply the price by the rate as a decimal: at 8.25%, a $49.99 item carries $4.12 of tax for a $54.11 total. In Add Sales Tax mode the tool does this and also breaks out subtotal, tax and total separately.",
    ],
    [
      "How do I remove sales tax from a total?",
      "Divide the total by 1 plus the rate as a decimal — not subtract the rate. A $54.11 total at 8.25% divides by 1.0825 to give a $49.99 subtotal and $4.12 of tax. Subtracting 8.25% from the total instead would understate the subtotal.",
    ],
    [
      "Why is the effective tax percentage lower than the rate I entered?",
      "Because the rate is charged on the subtotal but the effective figure is measured against the total, which is larger. An 8.25% rate works out to 7.62% of the final amount paid — the two are describing the same tax against different bases.",
    ],
    [
      "Does the calculator know my local sales tax rate?",
      "No — it does no lookup and applies whatever rate you type. US sales tax is set by state, county and city and combined rates commonly land anywhere from 0% to over 10%, so check your jurisdiction's current rate (and any exemption on the item) before relying on the result. Treat the output as informational rather than as tax advice.",
    ],
  ],
};

export default seo;
