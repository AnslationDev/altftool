const seo = {
  title: "Restaurant Refund Policy Generator",
  metaDescription:
    "Draft a food order refund policy for missing, wrong, late or spoiled items, inside the 48-hour acknowledgement and one-month redressal limits.",
  steps: [
    "Enter the restaurant name, city, 'Effective from' date, 'Acknowledge within (hours, max 48)' and 'Close complaint within (days, max 30)'.",
    "Tick 'Problems this policy covers' and tune each one's reporting window, refund scope and payout route under 'Tune each covered problem'.",
    "Test one bill in 'Refund amount check' to see what the customer receives, then press 'Copy policy' to take the drafted wording.",
  ],
  intro:
    "The Restaurant Refund Policy Generator turns your own service rules into a published refund policy for food orders, covering missing items, wrong items, late delivery, spoiled food and hygiene complaints. Each clause carries a reporting window, a refund scope and a payout route, and the drafted acknowledgement and resolution timelines stay inside Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020, which requires a complaint to be acknowledged within 48 hours and redressed within one month. A built-in calculator shows what a specific order would be refunded under the rule you are about to publish.",
  useCases: [
    "Publish a refund page for a cloud kitchen before it goes live on its own website and on delivery marketplaces.",
    "Settle internally whether a missing side dish refunds only that item or the whole bill, then write the answer down so every shift handles it the same way.",
    "Replace an ad-hoc WhatsApp refund practice with a dated policy your support team can quote back to customers.",
    "Model the cost of offering store credit with a 10% goodwill uplift instead of a cash refund before committing to it.",
  ],
  benefits: [
    ["Statutory limits built in", "Acknowledgement is capped at 48 hours and resolution at 30 days, matching the E-Commerce Rules 2020."],
    ["Per-problem rules", "Every complaint type gets its own reporting window, refund scope and payout route rather than one blanket clause."],
    ["Costed before publishing", "The refund calculator prices a sample order against the rule so you know what the policy will cost you."],
  ],
  faqs: [
    [
      "Is a restaurant legally required to refund a wrong or missing food order?",
      "Delivering something other than what was ordered is a deficiency in service under Section 2(11) of the Consumer Protection Act 2019, and refusing to refund a defective item within the stated period can be an unfair trade practice under Section 2(47). A restaurant is free to set the reporting window and the remedy, but it cannot set terms that take away the consumer's statutory rights.",
    ],
    [
      "How quickly must a food business respond to a refund complaint?",
      "Rule 4(5) of the Consumer Protection (E-Commerce) Rules 2020 requires an e-commerce entity to acknowledge a consumer complaint within 48 hours and redress it within one month of receipt. Most restaurants set tighter internal targets, such as acknowledgement in 24 hours and closure in 7 days, which this generator supports.",
    ],
    [
      "How long does a food order refund take to reach the customer's account?",
      "Once the restaurant approves the refund, the credit typically lands in 1 to 3 working days for UPI and 5 to 7 working days for credit and debit cards, because the timing is set by the acquiring bank. The Reserve Bank of India's Turn Around Time circular of 20 September 2019 sets binding reversal deadlines for failed transactions, not for merchant-initiated refunds.",
    ],
    [
      "What can a customer do if the restaurant refuses a valid refund?",
      "They can call the National Consumer Helpline on 1915 or file a complaint with the District Consumer Disputes Redressal Commission, which hears claims up to Rs 50 lakh. Section 69 of the Consumer Protection Act 2019 allows two years from the cause of action to file. This tool is informational only; take a lawyer's view before publishing or relying on any policy wording.",
    ],
  ],
};

export default seo;
