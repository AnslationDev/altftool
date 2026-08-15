const seo = {
  title: "Simple Interest Calculator - Solve P, R, T or SI",
  metaDescription:
    "Enter any three of principal, rate, time and interest; SI = P x R x T / 100 solves the fourth, with a 365/360-day basis and a year-by-year accrual table.",
  steps: [
    "Pick the unknown with the \"Solve for\" buttons — Interest, Principal, Rate or Time — then fill the other three fields: Principal (₹), Annual rate (%), Time and Simple interest (₹).",
    "Choose the \"Time unit\": Years, Months, Days (365-day year) or Days (360-day year); the tool rearranges SI = P × R × T ÷ 100 and prints the rearranged formula with your numbers in it.",
    "Read the total amount due (P + SI), the per year / per month / per day interest tiles and the year-by-year accrual table (capped at the first 60 years); \"Copy result\" copies the full summary.",
  ],
  "intro": "This simple interest calculator works in every direction: give it any three of principal, rate, time and interest and it rearranges SI = P × R × T ÷ 100 to solve for the fourth. Time can be entered in years, months or days on either a 365-day or 360-day basis, and the result comes with the rearranged formula, the total amount due and a year-by-year accrual table.",
  "useCases": [
    "Check the interest a friend or a chit-fund style hand loan will cost over 18 months.",
    "Work backwards from an interest figure you were quoted to find the effective annual rate.",
    "Find how long a deposit must run at a known rate to earn a target interest amount."
  ],
  "benefits": [
    [
      "Solves in any direction",
      "Interest, principal, rate or time — pick the unknown and the formula is rearranged for you."
    ],
    [
      "Flexible time basis",
      "Years, months, or days on a 365-day or 360-day convention, which lenders often differ on."
    ],
    [
      "Accrual table",
      "Shows interest per year, the running total, and the amount due at the end of each year."
    ]
  ],
  "faqs": [
    [
      "What is the simple interest formula?",
      "SI = P × R × T ÷ 100, where P is the principal, R is the annual rate in percent and T is the time in years. The total repayable is P + SI."
    ],
    [
      "How is simple interest different from compound interest?",
      "Simple interest is charged only on the original principal, so the amount earned each year never changes. Compound interest adds earned interest back to the balance, so later years earn more."
    ],
    [
      "Why does the day-count basis matter?",
      "A 360-day year makes each day worth slightly more interest than a 365-day year. Money-market and some commercial loans use 360; most retail deposits use 365, so match whichever your agreement states."
    ],
    [
      "Do Indian banks use simple or compound interest?",
      "Savings accounts and most fixed deposits compound (usually quarterly), while short-tenure deposits under six months and many informal loans are quoted on a simple-interest basis. Check your product's terms — this tool is informational only."
    ]
  ]
};

export default seo;
