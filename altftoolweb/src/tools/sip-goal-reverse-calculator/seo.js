const seo = {
  title: "SIP Goal Reverse Calculator: Monthly Amount Needed",
  metaDescription:
    "Enter a target amount and date to get the monthly SIP required: annuity-due maths, credit for money already invested, step-up and inflation options.",
  steps: [
    "Enter Target amount (INR), First instalment date and Target date, or tap one of the 3 / 5 / 10 / 15 / 20 years buttons to set the target date from the start date.",
    "Set 'Expected return (% per year)', 'Already invested for this goal (INR)', 'Annual SIP step-up (%)' and 'Inflate the goal by (% per year)' — leave inflation at 0 if the target is already in future rupees.",
    "Read 'Monthly SIP needed' with the number of instalments, alongside rows for 'Goal in target-date rupees', 'Existing investment grows to', 'Gap the SIP must fund', 'Total you invest' and 'Projected value on target date'; Show opens the Year-by-year projection table and Copy result copies the summary.",
  ],
  intro:
    "A SIP goal reverse calculator solves the standard future-value-of-an-annuity formula backwards: instead of asking what a fixed instalment grows into, it asks what instalment is needed to reach a stated amount on a stated date. It treats each contribution as an annuity due — invested at the start of the month, as a real SIP mandate debits — credits whatever you have already invested for the goal, and can layer on an annual step-up or restate the goal in future rupees at an assumed inflation rate. It is meant for anyone with a fixed-date goal such as a down payment, a school admission fee or a wedding, who needs the instalment figure rather than a maturity figure.",
  useCases: [
    "Working out that a Rs 25 lakh house down payment in 10 years at an assumed 12% needs about Rs 10,760 a month, before deciding whether that fits the monthly budget.",
    "Checking how much smaller the starting instalment becomes if you commit to raising the SIP 10% every year instead of keeping it flat.",
    "Seeing what is still left to fund after an existing Rs 5 lakh mutual fund holding earmarked for the same goal is allowed to compound until the target date.",
  ],
  benefits: [
    ["Solves for the instalment, not the corpus", "You enter the amount and the date; the calculator returns the monthly figure directly."],
    ["Credits money already invested", "Existing holdings are compounded to the target date and deducted from the gap the SIP has to close."],
    ["Handles step-up mandates", "Each year's instalment is grown by your step-up percentage and compounded for its own remaining months."],
  ],
  faqs: [
    [
      "How do I calculate the SIP needed to reach a target amount?",
      "Divide the target by the future-value factor of a monthly annuity due: FV = P x [((1+i)^n - 1) / i] x (1+i), where i is the annual return divided by 12 and n is the number of instalments. For Rs 10 lakh in 10 years at 12%, the factor is 232.34, so the SIP is about Rs 4,304 a month.",
    ],
    [
      "Should I use my goal amount in today's rupees or future rupees?",
      "Use future rupees, because that is what you will actually have to pay on the target date. If you only know the cost today, enter it and set the inflation field — a Rs 10 lakh cost today becomes about Rs 17.9 lakh in 10 years at 6% inflation, which roughly doubles the instalment required.",
    ],
    [
      "Does a step-up SIP really reduce the amount I need to start with?",
      "Yes, substantially over long horizons. For a Rs 50 lakh goal in 15 years at 12%, a flat SIP needs roughly Rs 9,900 a month while a 10% annual step-up starts at about Rs 5,760 — though the final year's instalment then exceeds Rs 21,800.",
    ],
    [
      "What return rate is reasonable to assume?",
      "There is no guaranteed rate, so use a conservative one and test alternatives. Diversified Indian equity funds have historically delivered around 11-13% over long periods, debt funds far less, and a shortfall on a fixed-date goal is much more damaging than a surplus. This is an informational projection, not investment advice — a SEBI registered investment adviser can help set the assumption for your situation.",
    ],
  ],
};

export default seo;
