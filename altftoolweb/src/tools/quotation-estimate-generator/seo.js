const seo = {
  title: "Quotation & Estimate Generator with Payment Schedule",
  metaDescription:
    "Price lines by quantity and rate, apply an overall discount before tax, add contingency, and split the total into milestones that sum exactly.",
  steps: [
    "Pick Quotation — a fixed price or Estimate — a range, then fill Your business, the client details and Valid for (days).",
    "Press Add line for each item and set its Description, Type, Unit, Quantity, Rate, Line discount (%) and Tax (%).",
    "Set Overall discount (%), Contingency / margin (%), Estimate variance (± %) and a Payment schedule, then press Copy document — the Payment schedule table lists each Milestone with its Share and Amount.",
  ],
  intro:
    "This generator prices a job line by line — quantity times rate, less any line discount — then applies an overall discount pro rata before tax, adds a contingency percentage as its own visible line, and splits the result into a payment schedule whose milestones always sum exactly to the total. It produces either a quotation, which states one fixed price, or an estimate, which states a range around that figure using the variance you set. Materials and labour are totalled separately, which many trades have to show, and a validity date is calculated so the offer has a clear expiry.",
  useCases: [
    "A tradesperson pricing a fit-out where the customer wants materials and labour shown separately and a 30/40/30 payment schedule.",
    "An agency issuing an estimate for scoped-but-uncertain work, presenting a range rather than committing to a fixed price.",
    "A supplier applying a 5% goodwill discount across a whole quote and needing the tax recalculated on the discounted figure, not the original.",
  ],
  benefits: [
    ["Discount applied before tax", "Spreads an overall discount across every line first, so the tax charged reflects what the customer actually pays."],
    ["Milestones that add up", "The final payment absorbs rounding, so the schedule sums to the quoted total to the cent."],
    ["Quotation or estimate", "Switches between a single fixed price and a range, and labels the document accordingly."],
  ],
  faqs: [
    [
      "What is the difference between a quote and an estimate?",
      "A quotation is a fixed price: if the customer accepts it in writing, you are generally bound to do the work for that amount. An estimate is a considered forecast that can move, which is why it is presented as a range. Say clearly on the document which one it is, because consumer law treats them differently.",
    ],
    [
      "How long should a quotation be valid?",
      "Thirty days is the usual period, because material prices and labour availability change. State the expiry date on the document rather than leaving it open — once it passes you can requote without going back on your word.",
    ],
    [
      "Should a discount be applied before or after tax?",
      "Before. Tax is charged on the amount the customer actually pays, so the discount reduces the taxable value first and the tax is then worked out on the reduced figure. Applying a discount to a tax-inclusive total overstates the tax you would have to remit.",
    ],
    [
      "How much contingency should I add to a quote?",
      "It depends on how well the job is defined: 5% to 10% is common for well-scoped work, 15% to 20% for renovation and refurbishment where hidden conditions are likely. Showing it as its own line is more defensible than quietly inflating the rates, and it makes the conversation about scope easier.",
    ],
  ],
};

export default seo;
