const seo = {
  title: "Post Office MIS Calculator: Monthly Income & Limits",
  metaDescription:
    "Monthly POMIS income from deposit x rate / 1200, capped at Rs 9 lakh single or Rs 15 lakh joint, with 5-year interest and the 2%/1% exit penalty.",
  steps: [
    "Enter 'Deposit amount (INR)' and 'Interest rate (% per year)'.",
    "Choose Account type — 'Single account — max ₹9,00,000' or 'Joint account (up to 3 adults) — max ₹15,00,000'.",
    "Read the monthly income headline plus income per quarter and year, total interest over 5 years, principal returned at maturity and deposit headroom left.",
  ],
  intro:
    "This Post Office MIS calculator shows the fixed monthly income a Post Office Monthly Income Scheme deposit will credit to your account for the full five-year term, using the standard formula deposit × annual rate ÷ 1200. It enforces the real deposit ceilings — ₹9 lakh for a single account and ₹15 lakh for a joint account since 1 April 2023 — and adds up the total interest, the principal returned at maturity and the penalty for closing early. It is aimed at retirees, homemakers and anyone converting a lump sum into a predictable monthly cash flow backed by the Government of India.",
  useCases: [
    "A retiree checking that the full ₹9 lakh single-account limit produces ₹5,550 a month at the current 7.4% rate.",
    "A couple comparing a joint ₹15 lakh POMIS account against two separate single accounts before visiting the post office.",
    "Someone weighing an early exit at year three and wanting the exact 1% penalty amount before deciding.",
  ],
  benefits: [
    ["Real deposit limits built in", "The calculator blocks amounts above the ₹9 lakh single or ₹15 lakh joint ceiling instead of quietly overstating your income."],
    ["Whole-term picture", "Monthly, quarterly and annual income plus total interest over five years and the principal returned at maturity."],
    ["Early-exit costs upfront", "The 2% and 1% premature-closure deductions are calculated on your actual deposit."],
  ],
  faqs: [
    [
      "How is Post Office MIS monthly income calculated?",
      "Monthly income = deposit × annual interest rate ÷ 1200. At 7.4% a year, a ₹9 lakh deposit pays ₹5,550 every month and a ₹15 lakh joint account pays ₹9,250, with the full principal returned after five years.",
    ],
    [
      "What is the maximum I can invest in POMIS?",
      "₹9 lakh in a single account and ₹15 lakh in a joint account, both raised from ₹4.5 lakh and ₹9 lakh with effect from 1 April 2023. In a joint account each holder's share counts towards their individual limit.",
    ],
    [
      "Is Post Office MIS interest taxable?",
      "Yes. The monthly interest is fully taxable as income from other sources at your slab rate and the deposit does not qualify for a section 80C deduction, although the post office does not deduct TDS on POMIS interest.",
    ],
    [
      "Can I withdraw from POMIS before five years?",
      "Not in the first year. Closing between one and three years deducts 2% of the deposit, and between three and five years deducts 1%. The interest already paid to you is not recovered.",
    ],
  ],
};

export default seo;
