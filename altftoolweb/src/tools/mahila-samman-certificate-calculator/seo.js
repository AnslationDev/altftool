const seo = {
  title: "MSSC Calculator: 7.5% Quarterly, 2-Year Term",
  metaDescription:
    "Values a Mahila Samman certificate with P x (1 + r/400)^(4t) - Rs 2,00,000 matures at Rs 2,32,044 - plus the 40% withdrawal cap and premature closure.",
  steps: [
    "Enter the \"Deposit amount (INR)\" or tap the ₹50,000, ₹1,00,000 or ₹2,00,000 preset, and confirm the \"Rate (% per year, compounded quarterly)\", which defaults to 7.5.",
    "Set the \"Share of the balance withdrawn (%)\" up to the 40% cap, and for an early exit enter Months held (1-23) and the Ground for closure.",
    "Read the \"Maturity value after 2 years\" with its quarter-by-quarter balance table, the maximum 40% withdrawal and the closure payout, then press Copy result.",
  ],
  intro:
    "This calculator values a Mahila Samman Savings Certificate using the scheme's own formula, P x (1 + r/400)^(4t), since MSSC compounds interest quarterly at a fixed 7.5% and pays the whole amount after two years. It is for women and guardians of girls who already hold a certificate and want the exact maturity figure, the money available under the 40% partial withdrawal rule, or the payout if the account is closed early. The deposit window closed on 31 March 2025, so it values running certificates rather than new ones.",
  useCases: [
    "Confirming the ₹2,32,044 maturity figure on a ₹2,00,000 certificate before the post office pays it out.",
    "Deciding whether to take the 40% withdrawal at the one-year mark or leave the balance compounding for four more quarters.",
    "Working out what closure after six months would pay once the 2 percentage point rate cut is applied.",
  ],
  benefits: [
    ["Matches the notified figure", "Quarterly compounding at 7.5% reproduces the ₹2,32,044 example published with the scheme."],
    ["Withdrawal cost made visible", "Shows the interest given up when 40% is taken out a year early, not just the amount released."],
    ["Early-exit rules applied", "Separates voluntary closure at the reduced rate from death and compassionate grounds at the full rate."],
  ],
  faqs: [
    [
      "How much will ₹2 lakh become in Mahila Samman Savings Certificate?",
      "₹2,00,000 grows to ₹2,32,044 at maturity, giving ₹32,044 of interest over two years. That comes from 7.5% compounded quarterly across eight quarters, which is why the return beats a plain 7.5% simple-interest calculation of ₹30,000.",
    ],
    [
      "Can I still open a Mahila Samman Savings Certificate?",
      "No. The scheme accepted deposits only between 1 April 2023 and 31 March 2025, and that window has closed. Certificates opened inside the window keep running to their two-year maturity on the original terms.",
    ],
    [
      "How much can I withdraw from MSSC before maturity?",
      "Up to 40% of the eligible balance, and only after the account has completed one year. On a ₹2,00,000 deposit the balance at one year is about ₹2,15,427, so the withdrawal cap is roughly ₹86,171. The remainder keeps earning until the two years are up.",
    ],
    [
      "What is the maximum deposit in MSSC and is the interest taxable?",
      "The ceiling is ₹2,00,000 across every MSSC account a woman or girl holds, with a minimum of ₹1,000 in multiples of ₹100. The scheme notification does not provide any income-tax exemption for the interest, so it is generally taxable as income from other sources — ask a tax professional how it sits in your return.",
    ],
  ],
};

export default seo;
