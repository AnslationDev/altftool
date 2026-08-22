const seo = {
  title: "GST Calculator Australia: Add or Remove 10% GST",
  metaDescription:
    "Add 10% GST or take it out with the ATO divide-by-11 rule, map the result to BAS labels G1, 1A and 1B, and check the $75,000 registration threshold.",
  steps: [
    "Toggle 'Add GST' or 'Remove GST', enter the price, and pick a GST treatment — 'Taxable (10%)', 'GST-free (0%)' or 'Input taxed (0%)'.",
    "The result recomputes live: price excluding GST, the GST amount, price including GST and the 'One eleventh of the inclusive price' check, while the BAS section turns sales (G1) and purchases (G11) into 1A, 1B and the 7A/7B net.",
    "Press 'Copy result' for a text summary, and check 'Do I need to register for GST?' against the $75,000 threshold ($150,000 for not-for-profits).",
  ],
  intro:
    "This calculator adds Australia's 10% GST to a price or takes it back out using the ATO's divide-by-11 rule. Adding GST multiplies the exclusive price by 1.1; removing it divides the inclusive price by 11 to get the tax, because one eleventh of a GST-inclusive amount is exactly the GST. It also builds a BAS summary — G1 total sales, 1A GST on sales, 1B GST credits on purchases — and checks the $75,000 registration threshold.",
  useCases: [
    "Setting a shelf price: a $100 GST-exclusive item becomes $110 including GST, and the $10 difference is what you report at 1A.",
    "Reading a $99.95 tax invoice and recording $90.86 as the expense and $9.09 as the GST credit at 1B.",
    "Preparing a quarterly BAS: $55,000 of sales gives $5,000 at 1A, $22,000 of purchases gives $2,000 at 1B, leaving $3,000 payable.",
  ],
  benefits: [
    ["The divide-by-11 rule", "Extracts GST from an inclusive price exactly, instead of wrongly subtracting 10%."],
    ["BAS labels, not just numbers", "Maps the result to G1, 1A and 1B so it transfers straight onto the statement."],
    ["Treatment aware", "Handles GST-free and input taxed supplies, which carry no GST at all."],
  ],
  faqs: [
    [
      "How do I calculate GST in Australia?",
      "To add GST, multiply the GST-exclusive price by 1.1 — $100 becomes $110. To find the GST inside a price that already includes it, divide by 11: $110 ÷ 11 = $10. Subtracting 10% from an inclusive price is the common mistake; it would give $99, which is $1 short.",
    ],
    [
      "What is the GST rate in Australia?",
      "GST is 10% and has been since it started on 1 July 2000 under A New Tax System (Goods and Services Tax) Act 1999. There is a single rate, but some supplies are GST-free — basic food, most medical and health services, education and exports — and others are input taxed, such as residential rent and financial supplies.",
    ],
    [
      "When do I have to register for GST?",
      "You must register once your GST turnover reaches $75,000 a year, or $150,000 for a not-for-profit organisation, and you have 21 days to do it. Taxi, ride-sourcing and limousine drivers must register from the first fare regardless of turnover.",
    ],
    [
      "What is the difference between GST-free and input taxed?",
      "Both mean no GST is charged to the customer, but GST-free supplies still let you claim GST credits on related purchases, while input taxed supplies do not. Basic food and medical care are GST-free; residential rent and most financial supplies are input taxed. Ask a registered tax agent if a supply could fall into either category.",
    ],
  ],
};

export default seo;
