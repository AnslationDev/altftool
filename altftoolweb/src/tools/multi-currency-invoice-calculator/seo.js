const seo = {
  title: "Multi-Currency Invoice Calculator with Your Own Rates",
  metaDescription:
    "Convert each invoice line at the rate you were quoted, round to ISO 4217 minor units, and see the tax, bank spread, fixed fee and net you receive.",
  steps: [
    "Choose the Settlement currency, then press Add line for each Description, Amount and Currency on the invoice.",
    "On every foreign line type the Exchange rate, set Rate is quoted as, and fill Tax on taxable lines (%), Bank / gateway spread (%) and Fixed transfer fee.",
    "Read Invoice total with the Converted subtotal, Tax, spread and Net you actually receive rows, then press Copy totals.",
  ],
  intro:
    "This calculator totals an invoice whose lines are priced in different currencies by converting each line at a rate you enter and rounding it to the settlement currency's ISO 4217 minor units before summing — two decimals for USD and EUR, none for JPY, three for KWD. It handles both quote directions, so a rate written as 1 USD = 83.50 INR and one written as 1 INR = 0.01198 USD give the same answer, and it shows the bank or gateway spread and fixed transfer fee separately so you can see what actually lands in your account. No rates are fetched or bundled; you supply the rate you have been quoted and record its date on the invoice.",
  useCases: [
    "Bill a client in INR for work quoted partly in USD and partly in EUR.",
    "Check what a 2.5% payment-provider spread plus a fixed wire fee costs on a cross-border invoice.",
    "See how a 5% move in the exchange rate before payment changes the total you receive.",
  ],
  benefits: [
    ["Both quote directions", "Enter the rate the way your bank wrote it — per unit or inverted — without doing the reciprocal yourself."],
    ["Line-level rounding", "Each converted line rounds to the settlement currency's minor units, matching how accounting systems post it."],
    ["Spread made visible", "Separates the headline invoice total from the net amount after the provider's percentage and fixed fees."],
  ],
  faqs: [
    [
      "Which exchange rate should I use on an invoice?",
      "Use the rate on the date of supply or the date of the invoice, whichever your tax rules specify, and print both the rate and its date on the document. Many authorities also accept their own published monthly or daily rate — the important part is that the rate is stated and consistently applied.",
    ],
    [
      "Which currency should I invoice a foreign client in?",
      "Invoicing in your own currency moves the exchange risk to the client and makes your books simpler; invoicing in theirs usually wins the work but leaves you exposed between the invoice date and payment. If you invoice in a foreign currency, price in a margin for the move or agree a fixed rate in the contract.",
    ],
    [
      "Why does converting each line separately give a different total from converting the sum?",
      "Because each converted line is rounded to the settlement currency's minor units before being added, and those roundings do not cancel out. The per-line result is what an accounting system will post, so it is the one to put on the invoice.",
    ],
    [
      "How much do banks add to the exchange rate?",
      "The spread is charged inside the rate rather than as a visible fee, and typically runs from well under 1% at specialist providers to around 3-4% at high-street banks and card networks, often with a fixed wire fee on top. Compare the rate you are offered against the mid-market rate to see the real cost.",
    ],
  ],
};

export default seo;
