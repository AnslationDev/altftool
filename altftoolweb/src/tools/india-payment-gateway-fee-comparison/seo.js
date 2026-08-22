const seo = {
  title: "India Payment Gateway Fees: UPI, Cards & 18% GST",
  metaDescription:
    "Applies each rail's rate to your own payment mix, adds 18% GST and reports an effective percentage and cost per transaction, with UPI and RuPay at zero.",
  steps: [
    "Enter Monthly processed volume (INR) and Average ticket size (INR), then split the payment mix across UPI, RuPay debit, cards, netbanking, wallets and international to total 100%.",
    "Under Rate cards, overwrite the seeded standard-plan percentages, Flat fee per transaction (INR) and Monthly platform fee (INR) with the numbers on your own agreement.",
    "The ranked table gives fee ex GST, the 18% GST, total per month and per year and the effective rate for each gateway; press Copy comparison.",
  ],
  intro:
    "This calculator works out what an Indian payment gateway actually costs you by applying each rail's rate to your own payment mix, adding 18% GST on the fee, and reporting an effective percentage and a cost per transaction. UPI and RuPay debit are charged at zero because section 10A of the Payment and Settlement Systems Act 2007, read with section 269SU of the Income-tax Act 1961, prohibits any merchant discount rate on them. It is aimed at founders and finance teams comparing quotes, where a 0.1% difference on the card rate can be worth less than a 10-point shift in UPI share.",
  useCases: [
    "Comparing two gateway quotes when one is cheaper on cards and the other on netbanking, for a business that is 60% UPI",
    "Forecasting the annual payment processing line in a budget from monthly GMV and average order value",
    "Checking whether moving customers toward UPI saves more than renegotiating the card rate by 0.15%",
  ],
  benefits: [
    ["Your mix, not a headline rate", "The 2% you were quoted only applies to part of your volume — this shows the blended number."],
    ["GST included", "The 18% GST on the gateway fee is shown separately so it is not forgotten in the budget."],
    ["Rate cards are editable", "Overwrite the seeded standard-plan rates with the numbers on your own signed agreement."],
  ],
  faqs: [
    [
      "Is there any charge on UPI payments for merchants in India?",
      "No merchant discount rate is permitted on UPI or RuPay debit card transactions. Section 10A of the Payment and Settlement Systems Act 2007 and section 269SU of the Income-tax Act 1961, both effective 1 January 2020, bar banks and payment system providers from levying a charge on the merchant or the payer for these rails. Gateways may still bill separately for value-added services such as instant settlement or payment links.",
    ],
    [
      "Is GST charged on payment gateway fees?",
      "Yes, at 18%. GST applies to the gateway's service fee, not to the transaction amount. On a ₹1,000 card payment at a 2% rate the fee is ₹20 and the GST is ₹3.60, so ₹23.60 is deducted and ₹976.40 settles to you. If you are GST registered you can generally claim input tax credit on that GST — confirm with your accountant.",
    ],
    [
      "What is a typical payment gateway rate in India?",
      "Standard self-serve plans are usually advertised around 2% for domestic credit and debit cards, netbanking and wallets, and around 3% or more for international cards. These are list prices: merchants processing high monthly volume commonly negotiate materially lower card rates, and pricing differs by card type, issuer and settlement speed, so treat the seeded numbers here as a starting point and replace them with your quote.",
    ],
    [
      "Why does average ticket size change the comparison?",
      "Because any flat per-transaction fee is diluted by a larger ticket. A ₹3 flat fee is 0.3% on a ₹1,000 order but only 0.03% on a ₹10,000 order, so a percentage-plus-flat gateway looks expensive for low-value, high-frequency businesses and competitive for high-value ones. Percentage-only pricing is unaffected by ticket size.",
    ],
  ],
};

export default seo;
