const seo = {
  title: "Currency Conversion Fee Calculator (Markup + GST)",
  metaDescription:
    "See what a foreign card payment really costs in INR: rate markup, cross-currency fee, GST under Rule 32(2)(b), and the effective rate you actually got.",
  steps: [
    "Enter the Transaction amount, pick one of 10 currencies (USD, EUR, GBP, AED, SGD, AUD, CAD, JPY, CHF, THB) and type the Mid-market rate in INR.",
    "Choose 'How you are paying' — Credit card abroad, Debit card abroad, Forex prepaid card, Bank / net banking or Cash at a money changer — or set a custom Exchange rate markup (%), Cross-currency / card fee (%) and flat INR fee.",
    "Read the 'You actually pay' total with the effective INR rate, the GST breakdown under Rule 32(2)(b) and the 'Same amount, other payment methods' comparison table, then click 'Copy result'.",
  ],
  intro:
    "The advertised exchange rate is rarely what you pay. A card or bank transaction abroad adds a markup over the interbank rate, a percentage forex or cross-currency fee, and GST on that fee — this calculator adds all three so you can see the effective rate you actually received and what the spread cost you.",
  useCases: [
    "Work out the real rate on a card payment made abroad or on an international website.",
    "Compare a bank, a forex card and a money-transfer service on total cost rather than headline rate.",
    "Check a statement after a foreign transaction to see how much of it was fees rather than spend.",
  ],
  benefits: [
    [
      "Effective rate, not the quoted one",
      "Shows the rate you truly paid once markup and fees are folded in.",
    ],
    [
      "Every layer separated",
      "Splits interbank rate, markup, transaction fee and GST so you can see where the cost sits.",
    ],
    [
      "Makes options comparable",
      "Two providers quoting different fee structures can be judged on one number.",
    ],
  ],
  faqs: [
    [
      "What is a forex markup fee?",
      "It is a percentage the card issuer or bank adds on top of the interbank exchange rate for a transaction in another currency. On Indian credit and debit cards it is commonly 2% to 3.5%, and GST applies on that fee.",
    ],
    [
      "Is GST charged on foreign currency conversion in India?",
      "Yes. GST applies to the currency-conversion service on a slab basis, and it is also charged at 18% on any markup or transaction fee the bank levies. It is charged on the fee, not on the whole amount you convert.",
    ],
    [
      "Should I pay in rupees or in the local currency abroad?",
      "Choose the local currency. Paying in rupees triggers dynamic currency conversion, where the merchant's payment processor sets the rate — usually worse than your card's, and your card's markup can still apply on top.",
    ],
    [
      "Why is my card statement amount higher than the rate I looked up?",
      "The rate you looked up is the interbank rate, which no retail customer gets. Your statement reflects that rate plus the issuer's markup plus GST, which together typically add a few percent to the transaction.",
    ],
  ],
};

export default seo;
