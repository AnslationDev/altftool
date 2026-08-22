const seo = {
  title: "Full & Final Settlement Calculator with Gratuity",
  metaDescription:
    "Itemise your India F&F: unpaid salary days, leave encashment on Basic+DA, 15/26 gratuity with the 20 lakh cap, minus notice recovery, loans and TDS.",
  steps: [
    "Enter Monthly gross salary and Monthly Basic + DA, unpaid salary days, leave days to encash, and completed years and months of service.",
    "Add pending bonus, reimbursements, notice shortfall days, loans and other deductions, and pick a 30-day or 26-working-day per-day basis.",
    "Read the Net full & final payable with itemised earnings and deductions — a negative result is flagged as money you'd owe — or Copy result.",
  ],
  intro:
    "The Full and Final Settlement Calculator adds up everything owed when you leave a job and subtracts what the company recovers. It works out unpaid salary days at your per-day rate, leave encashment on Basic + DA, statutory gratuity using the 15/26 formula from the Payment of Gratuity Act, plus pending bonus and reimbursements — then nets off notice shortfall, advances and TDS. Use it to sanity-check the F&F sheet HR sends you before you sign it.",
  useCases: [
    "Your last working day falls mid-month and you want to verify the unpaid salary days HR has computed at your per-day gross rate.",
    "You have completed 6 years and 2 months and need to confirm the gratuity figure in the settlement matches the 15/26 statutory formula.",
    "You exited before serving full notice and want to see whether the recovery wipes out your settlement or still leaves a positive payout.",
  ],
  benefits: [
    ["Every F&F line in one view", "Pending salary, leave encashment, gratuity, bonus, reimbursements and each deduction are itemised separately."],
    ["Statutory gratuity, done right", "Applies the 15/26 formula, rounds part-years over six months up, and caps the payout at the 20 lakh statutory limit."],
    ["Catches a negative settlement", "If notice recovery and advances exceed your dues, the tool flags the amount you would owe back instead of showing a false positive."],
  ],
  faqs: [
    [
      "How is full and final settlement calculated?",
      "Add unpaid salary for days worked in the final month, encashment of unused earned leave, gratuity if eligible, and any pending bonus or reimbursements. From that total, subtract notice period shortfall, outstanding loans or advances, unreturned asset costs and TDS.",
    ],
    [
      "When must the F&F settlement be paid in India?",
      "The Payment of Wages Act requires wages due on termination to be paid by the second working day after the last working day, and the Code on Wages 2019 sets a two-working-day limit. In practice most companies release F&F in 30 to 45 days, and many state shops-and-establishment rules allow a similar window.",
    ],
    [
      "How is gratuity calculated in the settlement?",
      "For employees covered by the Payment of Gratuity Act, gratuity equals 15 divided by 26, multiplied by last drawn Basic + DA, multiplied by completed years of service, with a part-year over six months rounded up. Eligibility normally needs five years of continuous service, and the payout is capped at 20 lakh.",
    ],
    [
      "Is leave encashment taxable at the time of resignation?",
      "For non-government employees, leave encashment received on resignation or retirement is exempt under section 10(10AA) up to a lifetime limit of 25 lakh, and the exemption is also limited by the average salary and leave-days tests in that section. Anything beyond the exempt amount is taxed as salary. This is general information, not tax advice.",
    ],
  ],
};

export default seo;
