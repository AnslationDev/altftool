const seo = {
  title: "Simple Interest Calculator: (P × R × T) ÷ 100",
  metaDescription:
    "Enter principal, annual rate and years to get interest, maturity amount, the interest per year, month and day, and return as a % of principal.",
  steps: [
    "Enter the Principal Amount, Annual Interest Rate (%) and Time (Years) — use fractions like 0.5 for six months.",
    "The Result panel recomputes Simple Interest = (Principal × Rate × Time) ÷ 100 on every keystroke, with the formula printed below the calculator.",
    "Read the Interest Earned, Maturity Amount, Annual, Monthly and Daily Interest and Return on Investment cards, and press Copy to copy the full breakdown.",
  ],
  intro:
    "The Simple Interest Calculator applies the standard formula SI = (Principal × Rate × Time) ÷ 100 and returns the interest, the maturity amount, and the same interest broken down per year, per month and per day. Enter three numbers — amount, annual rate and years — and you get what the loan or deposit actually costs or earns, plus the total return as a percentage of principal. It is for anyone comparing a fixed-rate deposit, a friendly loan or a short-term advance where interest does not compound.",
  useCases: [
    "You are lending a relative money at an agreed annual rate and want a written figure for what should come back at the end of the term, and what each month of it is worth.",
    "A vehicle or gold loan is quoted on a flat rate rather than a reducing balance, and you want the plain interest total before comparing it with a reducing-balance quote.",
    "You have a fixed deposit paying simple interest and need the payout figure to enter into a budget for the year it matures.",
  ],
  benefits: [
    ["The interest split by period", "Beyond the total, it divides the interest into annual, monthly and daily amounts, so you can slot the number into a monthly budget without doing the arithmetic again."],
    ["Return stated as a percentage", "It shows interest as a percentage of principal over the whole term, which is the figure you actually compare between two offers of different lengths."],
    ["Formula on the page", "The exact calculation used is printed alongside the result, so you can reproduce or check it by hand rather than trusting a black box."],
  ],
  faqs: [
    [
      "What is the formula for simple interest?",
      "Simple Interest = (Principal × Rate × Time) ÷ 100, where rate is the annual percentage and time is in years. On 10,000 at 8% for 5 years that is (10,000 × 8 × 5) ÷ 100 = 4,000 in interest and 14,000 at maturity.",
    ],
    [
      "How is simple interest different from compound interest?",
      "Simple interest is charged only on the original principal, so each year earns the same amount; compound interest is charged on principal plus accumulated interest, so it grows. Over 5 years at 8%, 10,000 earns 4,000 simple but about 4,693 compounded annually.",
    ],
    [
      "How do I work out interest for months instead of years?",
      "Enter the time in years as a fraction — 6 months is 0.5, 9 months is 0.75, 18 months is 1.5. The calculator also reports the monthly and daily share of the interest directly, dividing the annual figure by 12 and by 365.",
    ],
    [
      "Is a flat-rate loan the same as this calculation?",
      "Yes — flat-rate or fixed-rate loans charge interest on the full original amount for the whole term, exactly as here, which is why they cost more than a reducing-balance loan at the same headline rate. This is an estimate for comparison, not a quote; check the lender's own schedule and any fees before signing.",
    ],
  ],
};

export default seo;
