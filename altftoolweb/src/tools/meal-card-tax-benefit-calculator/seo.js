const seo = {
  title: "Meal Card Tax Calculator: Rs 50/Meal Exemption",
  metaDescription:
    "Splits your Sodexo or Pluxee card credit into the exempt Rs 50-per-meal portion and the taxable excess, with tax saved at your slab plus cess.",
  steps: [
    "Enter your \"Monthly card credit (INR)\", \"Working days in a month\" and pick 1-3 \"Meals claimed per working day\" (Rs 50-150 per day).",
    "Choose your \"Income tax slab rate\", \"Surcharge\" and \"Tax regime\" - the old regime or Section 115BAC, where the exemption is not available.",
    "Read \"Income tax saved in the year\" with the exempt-versus-taxable split; \"Copy result\" copies the summary and \"Show\" expands the month-by-month table.",
  ],
  intro:
    "This calculator shows how much income tax you save each year by taking part of your salary as meal card credit, using the Rs 50 per meal perquisite exemption in Rule 3(7)(iii) of the Income-tax Rules, 1962. Enter the amount loaded on your Sodexo, Zaggle, Pluxee or Ticket Restaurant card, your working days and your slab, and it splits the credit into the exempt portion and the taxable perquisite. Salaried employees and payroll teams use it to size the monthly credit so nothing spills over the limit.",
  useCases: [
    "Deciding whether to set the monthly meal card credit at Rs 1,100 or Rs 2,200 so the full amount stays inside the exempt ceiling.",
    "Checking what a Rs 3,000 monthly credit costs you in tax once the excess over Rs 50 per meal is added back as a perquisite.",
    "Comparing the old regime and the Section 115BAC regime before choosing a flexible benefit plan, since the food voucher exemption is not available in the new regime.",
  ],
  benefits: [
    ["Rule-based ceiling", "The limit is rebuilt from Rs 50 per meal times your own meals per day and working days, not a fixed assumed figure."],
    ["Excess made visible", "Any credit above the ceiling is shown as a taxable perquisite with the extra tax it attracts."],
    ["Slab, surcharge and cess", "The saving uses your marginal rate grossed up for surcharge and the 4% Health and Education Cess."],
  ],
  faqs: [
    [
      "How much meal coupon is tax free per month in India?",
      "The exemption is Rs 50 per meal, not a fixed monthly figure. On the common assumption of two meals per working day and about 22 working days, that works out to Rs 2,200 a month, or roughly Rs 26,400 a year, and any credit above the limit is taxed as a perquisite.",
    ],
    [
      "How much tax do I actually save with a meal card?",
      "Multiply the exempt credit by your effective marginal rate. At the 30% slab with 4% cess the effective rate is 31.2%, so Rs 26,400 of exempt credit saves about Rs 8,237 of tax in the year; at the 20% slab the same credit saves about Rs 5,491.",
    ],
    [
      "Is the meal voucher exemption available under the new tax regime?",
      "No. The exemption for employer-provided free food and non-alcoholic beverage vouchers is one of the benefits not available under the default regime of Section 115BAC, so the entire card credit becomes taxable salary. The saving exists only if you are taxed under the old regime.",
    ],
    [
      "What conditions must the coupons meet to stay exempt?",
      "Rule 3(7)(iii) requires paid, non-transferable vouchers usable only at eating joints, and the food or non-alcoholic beverage must be provided during working hours. Cash paid in place of meals, or a card that can be spent on anything, does not qualify — check the terms of your own scheme with your payroll team.",
    ],
  ],
};

export default seo;
